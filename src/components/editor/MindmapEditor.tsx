'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  type OnNodesChange,
  type OnEdgesChange,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { MindmapNodeData, MindmapNode, MindmapEdge } from '@/types/mindmap';
import type { Mindmap } from '@/types/mindmap';
import { applyLayout, type LayoutType } from '@/lib/mindmap/layout-engine';
import MindmapNodeComponent from './MindmapNode';
import EditorHeader from './EditorHeader';
import EditorToolbar from './EditorToolbar';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import NodeContextMenu from './NodeContextMenu';

type MindmapFlowNode = Node<MindmapNodeData>;

const DEFAULT_ROOT_NODE: MindmapFlowNode = {
  id: 'root',
  type: 'mindmapNode',
  position: { x: 0, y: 0 },
  data: { label: 'Central Idea' },
};

const nodeTypes: NodeTypes = {
  mindmapNode: MindmapNodeComponent,
};

interface MindmapEditorProps {
  mindmap: Mindmap;
}

function MindmapEditorInner({ mindmap }: MindmapEditorProps) {
  const initialNodes = useMemo<MindmapFlowNode[]>(() => {
    const stored = mindmap.data?.nodes ?? [];
    if (stored.length === 0) return [DEFAULT_ROOT_NODE];
    return stored.map((n) => ({
      id: n.id,
      type: n.type ?? 'mindmapNode',
      position: n.position,
      data: n.data,
      selected: false,
    }));
  }, [mindmap.data?.nodes]);

  const initialEdges = useMemo<Edge[]>(() => {
    const stored = mindmap.data?.edges ?? [];
    return stored.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: e.type ?? 'smoothstep',
    }));
  }, [mindmap.data?.edges]);

  const [layoutType, setLayoutType] = useState<LayoutType>(
    mindmap.data?.layoutType ?? 'radial',
  );
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<MindmapFlowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  const { canUndo, canRedo, pushSnapshot, undo, redo } = useUndoRedo();
  const { status: saveStatus } = useAutoSave({ id: mindmap.id, nodes, edges, layoutType });
  const { fitView } = useReactFlow<MindmapFlowNode>();

  // Push initial snapshot on mount
  useEffect(() => {
    pushSnapshot({ nodes, edges });
    // Only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleNodesChange: OnNodesChange<MindmapFlowNode> = useCallback(
    (changes: NodeChange<MindmapFlowNode>[]) => {
      const next = applyNodeChanges(changes, nodes);
      setNodes(next);
      const hasDragStop = changes.some((c) => c.type === 'position' && !c.dragging);
      if (hasDragStop) {
        pushSnapshot({ nodes: next, edges });
      }
    },
    [nodes, edges, setNodes, pushSnapshot],
  );

  const handleEdgesChange: OnEdgesChange<Edge> = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      const next = applyEdgeChanges(changes, edges);
      setEdges(next);
    },
    [edges, setEdges],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
        type: 'smoothstep',
      };
      const nextEdges = addEdge(newEdge, edges);
      setEdges(nextEdges);
      pushSnapshot({ nodes, edges: nextEdges });
    },
    [edges, nodes, setEdges, pushSnapshot],
  );

  const handleUndo = useCallback(() => {
    const snapshot = undo();
    if (snapshot) {
      setNodes(snapshot.nodes as MindmapFlowNode[]);
      setEdges(snapshot.edges);
    }
  }, [undo, setNodes, setEdges]);

  const handleRedo = useCallback(() => {
    const snapshot = redo();
    if (snapshot) {
      setNodes(snapshot.nodes as MindmapFlowNode[]);
      setEdges(snapshot.edges);
    }
  }, [redo, setNodes, setEdges]);

  const handleSnapshot = useCallback(
    (snapshotNodes: MindmapFlowNode[], snapshotEdges: Edge[]) => {
      pushSnapshot({ nodes: snapshotNodes, edges: snapshotEdges });
    },
    [pushSnapshot],
  );

  const handleNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: MindmapFlowNode) => {
      event.preventDefault();
      setContextMenu({ x: event.clientX, y: event.clientY, nodeId: node.id });
    },
    [],
  );

  const addChildToNode = useCallback(
    (parentId: string) => {
      const parent = nodes.find((n) => n.id === parentId);
      if (!parent) return;
      const childId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const childNode: MindmapFlowNode = {
        id: childId,
        type: 'mindmapNode',
        position: { x: parent.position.x + 200, y: parent.position.y + 80 },
        data: { label: 'New Node' },
        selected: false,
      };
      const childEdge: Edge = {
        id: `edge-${parentId}-${childId}`,
        source: parentId,
        target: childId,
        type: 'smoothstep',
      };
      const nextNodes = [...nodes.map((n) => ({ ...n, selected: false as boolean | undefined })), childNode];
      const nextEdges = [...edges, childEdge];
      setNodes(() => nextNodes);
      setEdges(() => nextEdges);
      pushSnapshot({ nodes: nextNodes, edges: nextEdges });
    },
    [nodes, edges, setNodes, setEdges, pushSnapshot],
  );

  const addSiblingToNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      const parentEdge = edges.find((e) => e.target === nodeId);
      if (!parentEdge) return; // root node — no sibling
      const siblingId = `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const siblingNode: MindmapFlowNode = {
        id: siblingId,
        type: 'mindmapNode',
        position: { x: node.position.x, y: node.position.y + 100 },
        data: { label: 'New Node' },
        selected: false,
      };
      const newEdge: Edge = {
        id: `edge-${parentEdge.source}-${siblingId}`,
        source: parentEdge.source,
        target: siblingId,
        type: 'smoothstep',
      };
      const nextNodes = [...nodes.map((n) => ({ ...n, selected: false as boolean | undefined })), siblingNode];
      const nextEdges = [...edges, newEdge];
      setNodes(() => nextNodes);
      setEdges(() => nextEdges);
      pushSnapshot({ nodes: nextNodes, edges: nextEdges });
    },
    [nodes, edges, setNodes, setEdges, pushSnapshot],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      // BFS to get all descendants
      const toDelete = new Set<string>([nodeId]);
      const queue = [nodeId];
      while (queue.length > 0) {
        const current = queue.shift()!;
        for (const edge of edges) {
          if (edge.source === current && !toDelete.has(edge.target)) {
            toDelete.add(edge.target);
            queue.push(edge.target);
          }
        }
      }
      const nextNodes = nodes.filter((n) => !toDelete.has(n.id));
      const nextEdges = edges.filter((e) => !toDelete.has(e.source) && !toDelete.has(e.target));
      setNodes(() => nextNodes);
      setEdges(() => nextEdges);
      pushSnapshot({ nodes: nextNodes, edges: nextEdges });
    },
    [nodes, edges, setNodes, setEdges, pushSnapshot],
  );

  const startRenameNode = useCallback((nodeId: string) => {
    const nodeEl = document.querySelector(`[data-id="${nodeId}"]`);
    if (nodeEl) {
      const dblClick = new MouseEvent('dblclick', { bubbles: true });
      nodeEl.dispatchEvent(dblClick);
    }
  }, []);

  useKeyboardShortcuts({
    nodes,
    edges,
    setNodes: (updater) => {
      setNodes((prev) => updater(prev));
    },
    setEdges: (updater) => {
      setEdges((prev) => updater(prev));
    },
    onUndo: handleUndo,
    onRedo: handleRedo,
    onSnapshot: handleSnapshot,
  });

  const handleLayoutChange = useCallback(
    (type: LayoutType) => {
      const mindmapNodes: MindmapNode[] = nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
        width: n.width,
        height: n.height,
      }));
      const mindmapEdges: MindmapEdge[] = edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
      }));

      const layouted = applyLayout(mindmapNodes, mindmapEdges, type);

      setNodes(
        layouted.map((n) => ({
          id: n.id,
          type: n.type ?? 'mindmapNode',
          position: n.position,
          data: n.data as MindmapNodeData,
          selected: false,
        })),
      );

      setLayoutType(type);

      requestAnimationFrame(() => {
        fitView({ duration: 300 });
      });
    },
    [nodes, edges, setNodes, fitView],
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      <EditorHeader title={mindmap.title} saveStatus={saveStatus} />
      <EditorToolbar
        currentLayout={layoutType}
        onLayoutChange={handleLayoutChange}
        mindmapId={mindmap.id}
        isPublic={mindmap.is_public}
        slug={mindmap.slug}
        onFitView={() => fitView({ padding: 0.1, duration: 200 })}
      />

      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={{ type: 'smoothstep' }}
          fitView
          multiSelectionKeyCode="Shift"
          deleteKeyCode={null}
          onNodeContextMenu={handleNodeContextMenu}
          onPaneClick={() => setContextMenu(null)}
        >
          <MiniMap position="bottom-right" />
          <Controls position="bottom-left" />
          <Background />
        </ReactFlow>
      </div>

      {contextMenu && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          nodeId={contextMenu.nodeId}
          hasParent={edges.some((e) => e.target === contextMenu.nodeId)}
          onAddChild={() => addChildToNode(contextMenu.nodeId)}
          onAddSibling={() => addSiblingToNode(contextMenu.nodeId)}
          onRename={() => startRenameNode(contextMenu.nodeId)}
          onDelete={() => deleteNode(contextMenu.nodeId)}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

export default function MindmapEditor({ mindmap }: MindmapEditorProps) {
  return (
    <ReactFlowProvider>
      <MindmapEditorInner mindmap={mindmap} />
    </ReactFlowProvider>
  );
}
