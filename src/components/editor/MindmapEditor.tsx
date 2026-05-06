'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  type NodeProps,
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
import type { MindmapDiff } from '@/types/ai';
import { applyLayout, type LayoutType } from '@/lib/mindmap/layout-engine';
import { applyDiff } from '@/lib/ai/apply-diff';
import MindmapNodeComponent from './MindmapNode';
import EditorHeader from './EditorHeader';
import EditorToolbar from './EditorToolbar';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import NodeContextMenu from './NodeContextMenu';
import AIChatSidebar from './AIChatSidebar';
import AIInitModal from './AIInitModal';
import type { MindmapData } from '@/types/mindmap';

type MindmapFlowNode = Node<MindmapNodeData>;

const DEFAULT_ROOT_NODE: MindmapFlowNode = {
  id: 'root',
  type: 'mindmapNode',
  position: { x: 0, y: 0 },
  data: { label: 'Central Idea' },
};

// nodeTypes moved inside useMemo for onExpand closure

interface MindmapEditorProps {
  mindmap: Mindmap;
}

function MindmapEditorInner({ mindmap }: MindmapEditorProps) {
  const initialNodes = useMemo<MindmapFlowNode[]>(() => {
    const stored = mindmap.data?.nodes ?? [];
    if (stored.length === 0) return [DEFAULT_ROOT_NODE];
    const seen = new Set<string>();
    const deduped = stored.filter((n) => {
      if (seen.has(n.id)) return false;
      seen.add(n.id);
      return true;
    });
    return deduped.map((n) => ({
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
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [expandingNodeId, setExpandingNodeId] = useState<string | undefined>(undefined);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    nodeId: string;
  } | null>(null);
  const [modalDismissed, setModalDismissed] = useState(false);
  const [chatPrefill, setChatPrefill] = useState('');
  const [nodes, setNodes, onNodesChange] = useNodesState<MindmapFlowNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  const selectedNodeCount = nodes.filter((n) => n.selected).length;

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
        data: { label: 'New Node', autoEditId: childId },
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
      // Re-run layout so new node doesn't overlap
      const mindmapNodes: MindmapNode[] = nextNodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
        width: n.width,
        height: n.height,
      }));
      const mindmapEdges: MindmapEdge[] = nextEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
      }));
      const layouted = applyLayout(mindmapNodes, mindmapEdges, layoutType);
      const layoutedNodes: MindmapFlowNode[] = layouted.map((n) => ({
        id: n.id,
        type: n.type ?? 'mindmapNode',
        position: n.position,
        data: n.data as MindmapNodeData,
        selected: false,
      }));
      setNodes(() => layoutedNodes);
      setEdges(() => nextEdges);
      setEditingNodeId(childId);
      setTimeout(() => setEditingNodeId(null), 100);
      pushSnapshot({ nodes: layoutedNodes, edges: nextEdges });
    },
    [nodes, edges, setNodes, setEdges, pushSnapshot, layoutType],
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
        data: { label: 'New Node', autoEditId: siblingId },
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
      // Re-run layout so new node doesn't overlap
      const mindmapNodes: MindmapNode[] = nextNodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
        width: n.width,
        height: n.height,
      }));
      const mindmapEdges: MindmapEdge[] = nextEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
      }));
      const layouted = applyLayout(mindmapNodes, mindmapEdges, layoutType);
      const layoutedNodes: MindmapFlowNode[] = layouted.map((n) => ({
        id: n.id,
        type: n.type ?? 'mindmapNode',
        position: n.position,
        data: n.data as MindmapNodeData,
        selected: false,
      }));
      setNodes(() => layoutedNodes);
      setEdges(() => nextEdges);
      setEditingNodeId(siblingId);
      setTimeout(() => setEditingNodeId(null), 100);
      pushSnapshot({ nodes: layoutedNodes, edges: nextEdges });
    },
    [nodes, edges, setNodes, setEdges, pushSnapshot, layoutType],
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

  const createHubNode = useCallback(() => {
    const selectedNodes = nodes.filter((n) => n.selected);
    if (selectedNodes.length < 2) return;
    const cx = selectedNodes.reduce((s, n) => s + n.position.x, 0) / selectedNodes.length;
    let cy = selectedNodes.reduce((s, n) => s + n.position.y, 0) / selectedNodes.length;
    const hasOverlap = nodes.some(
      (n) => Math.abs(n.position.x - cx) <= 20 && Math.abs(n.position.y - cy) <= 20,
    );
    if (hasOverlap) cy += 50;
    const hubId = `node-hub-${Date.now()}`;
    const hubNode: MindmapFlowNode = {
      id: hubId,
      type: 'mindmapNode',
      position: { x: cx, y: cy },
      data: { label: 'Hub', autoEditId: hubId },
      selected: true,
    };
    const newEdges: Edge[] = selectedNodes.map((n) => ({
      id: `edge-${hubId}-${n.id}`,
      source: hubId,
      target: n.id,
      type: 'smoothstep',
    }));
    const nextNodes = [...nodes.map((n) => ({ ...n, selected: false })), hubNode];
    const nextEdges = [...edges, ...newEdges];
    setNodes(() => nextNodes);
    setEdges(() => nextEdges);
    pushSnapshot({ nodes: nextNodes, edges: nextEdges });
    setEditingNodeId(hubId);
    setTimeout(() => setEditingNodeId(null), 100);
  }, [nodes, edges, setNodes, setEdges, pushSnapshot]);

  const showAIModal = nodes.length === 1 && nodes[0].id === 'root' && nodes[0].data.label === 'Central Idea';

  const handleAIApply = useCallback(
    (data: MindmapData) => {
      const mindmapNodes: MindmapNode[] = data.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
      }));
      const mindmapEdges: MindmapEdge[] = data.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: e.type,
      }));
      const layouted = applyLayout(mindmapNodes, mindmapEdges, layoutType);
      const nextNodes: MindmapFlowNode[] = layouted.map((n) => ({
        id: n.id,
        type: n.type ?? 'mindmapNode',
        position: n.position,
        data: n.data as MindmapNodeData,
        selected: false,
      }));
      const nextEdges = mindmapEdges;
      setNodes(nextNodes);
      setEdges(nextEdges);
      pushSnapshot({ nodes: nextNodes, edges: nextEdges });
      requestAnimationFrame(() => {
        fitView({ duration: 400, padding: 0.15 });
      });
    },
    [setNodes, setEdges, pushSnapshot, layoutType, fitView],
  );

  const handleApplyDiff = useCallback(
    (diff: MindmapDiff) => {
      if (!diff?.ops?.length) return;
      const { nodes: nextNodes, edges: nextEdges } = applyDiff(nodes, edges as MindmapEdge[], diff);
      const mindmapNodes: MindmapNode[] = (nextNodes as MindmapFlowNode[]).map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
        width: n.width,
        height: n.height,
      }));
      const mindmapEdges: MindmapEdge[] = nextEdges as MindmapEdge[];
      const layouted = applyLayout(mindmapNodes, mindmapEdges, layoutType);
      const layoutedNodes = layouted.map((n) => ({
        id: n.id,
        type: n.type ?? 'mindmapNode',
        position: n.position,
        data: n.data as MindmapNodeData,
        selected: false,
      }));
      setNodes(layoutedNodes);
      setEdges(nextEdges);
      pushSnapshot({ nodes: layoutedNodes, edges: nextEdges });
    },
    [nodes, edges, setNodes, setEdges, pushSnapshot, layoutType],
  );

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

  const handleExpandNode = useCallback(
    async (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;
      setExpandingNodeId(nodeId);
      try {
        const res = await fetch('/api/ai/expand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nodeId,
            nodeLabel: node.data.label,
            context: { nodes, edges },
          }),
        });
        if (!res.ok) throw new Error('Expand request failed');
        const { diff } = (await res.json()) as { diff: MindmapDiff };
        const result = applyDiff(nodes, edges as MindmapEdge[], diff);
        const mindmapNodes: MindmapNode[] = (result.nodes as MindmapFlowNode[]).map((n) => ({
          id: n.id,
          type: n.type,
          position: n.position,
          data: n.data,
          width: n.width,
          height: n.height,
        }));
        const mindmapEdges: MindmapEdge[] = result.edges as MindmapEdge[];
        const layouted = applyLayout(mindmapNodes, mindmapEdges, layoutType);
        const layoutedNodes = layouted.map((n) => ({
          id: n.id,
          type: n.type ?? 'mindmapNode',
          position: n.position,
          data: n.data as MindmapNodeData,
          selected: false,
        }));
        setNodes(layoutedNodes);
        setEdges(result.edges);
        pushSnapshot({ nodes: layoutedNodes, edges: result.edges });
      } catch (err) {
        console.error('Failed to expand node:', err);
      } finally {
        setExpandingNodeId(undefined);
      }
    },
    [nodes, edges, setNodes, setEdges, pushSnapshot, layoutType],
  );

  const handleSendToChat = useCallback((nodeId: string) => {
    setChatPrefill(`@${nodeId} `);
  }, []);

  // Latest ref pattern: keep stable nodeTypes while reading latest callbacks/state
  const handleExpandNodeRef = useRef(handleExpandNode);
  handleExpandNodeRef.current = handleExpandNode;

  const expandingNodeIdRef = useRef(expandingNodeId);
  expandingNodeIdRef.current = expandingNodeId;

  const handleSendToChatRef = useRef(handleSendToChat);
  handleSendToChatRef.current = handleSendToChat;

  const nodeTypes = useMemo<NodeTypes>(() => ({
    mindmapNode: (props: NodeProps<MindmapFlowNode>) => (
      <MindmapNodeComponent
        {...props}
        onExpand={handleExpandNodeRef.current}
        expandingNodeId={expandingNodeIdRef.current}
        onSendToChat={handleSendToChatRef.current}
      />
    ),
  }), []);

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
        selectedNodeCount={selectedNodeCount}
        onCreateHub={createHubNode}
      />

      <div className="flex flex-1">
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
        <AIChatSidebar
          context={mindmap.data}
          onApplyDiff={handleApplyDiff}
          prefillInput={chatPrefill}
          onPrefillConsumed={() => setChatPrefill('')}
          nodes={nodes}
        />
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

      <AIInitModal
        isOpen={showAIModal && !modalDismissed}
        onClose={() => setModalDismissed(true)}
        onApply={handleAIApply}
      />
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
