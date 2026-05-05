import { useEffect, useCallback } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { MindmapNodeData } from '@/types/mindmap';

interface UseKeyboardShortcutsOptions {
  nodes: Node<MindmapNodeData>[];
  edges: Edge[];
  setNodes: (updater: (nodes: Node<MindmapNodeData>[]) => Node<MindmapNodeData>[]) => void;
  setEdges: (updater: (edges: Edge[]) => Edge[]) => void;
  onUndo: () => void;
  onRedo: () => void;
  onSnapshot: (nodes: Node<MindmapNodeData>[], edges: Edge[]) => void;
}

function generateId(): string {
  return `node-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/** BFS to collect all descendant node IDs starting from a set of root IDs */
function collectDescendants(
  startIds: string[],
  edges: Edge[],
): Set<string> {
  const descendants = new Set<string>();
  const queue = [...startIds];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of edges) {
      if (edge.source === current && !descendants.has(edge.target)) {
        descendants.add(edge.target);
        queue.push(edge.target);
      }
    }
  }
  return descendants;
}

export function useKeyboardShortcuts({
  nodes,
  edges,
  setNodes,
  setEdges,
  onUndo,
  onRedo,
  onSnapshot,
}: UseKeyboardShortcutsOptions): void {
  const addChildNode = useCallback(() => {
    const selected = nodes.filter((n) => n.selected);
    if (selected.length !== 1) return;
    const parent = selected[0];

    const childId = generateId();
    const childNode: Node<MindmapNodeData> = {
      id: childId,
      type: 'mindmapNode',
      position: { x: parent.position.x + 200, y: parent.position.y + 80 },
      data: { label: 'New Node' },
      selected: false,
    };
    const childEdge: Edge = {
      id: `edge-${parent.id}-${childId}`,
      source: parent.id,
      target: childId,
      type: 'smoothstep',
    };

    const nextNodes: Node<MindmapNodeData>[] = [
      ...nodes.map((n) => ({ ...n, selected: false as boolean | undefined })),
      childNode,
    ];
    const nextEdges = [...edges, childEdge];
    setNodes(() => nextNodes);
    setEdges(() => nextEdges);
    onSnapshot(nextNodes, nextEdges);
  }, [nodes, edges, setNodes, setEdges, onSnapshot]);

  const addSiblingNode = useCallback(() => {
    const selected = nodes.filter((n) => n.selected);
    if (selected.length !== 1) return;
    const sibling = selected[0];

    // Find parent edge
    const parentEdge = edges.find((e) => e.target === sibling.id);
    const siblingId = generateId();
    const siblingNode: Node<MindmapNodeData> = {
      id: siblingId,
      type: 'mindmapNode',
      position: { x: sibling.position.x, y: sibling.position.y + 100 },
      data: { label: 'New Node' },
      selected: false,
    };

    const nextNodes: Node<MindmapNodeData>[] = [
      ...nodes.map((n) => ({ ...n, selected: false as boolean | undefined })),
      siblingNode,
    ];
    let nextEdges = [...edges];

    if (parentEdge) {
      const newEdge: Edge = {
        id: `edge-${parentEdge.source}-${siblingId}`,
        source: parentEdge.source,
        target: siblingId,
        type: 'smoothstep',
      };
      nextEdges = [...nextEdges, newEdge];
    }

    setNodes(() => nextNodes);
    setEdges(() => nextEdges);
    onSnapshot(nextNodes, nextEdges);
  }, [nodes, edges, setNodes, setEdges, onSnapshot]);

  const deleteSelectedNodes = useCallback(() => {
    const selectedIds = nodes.filter((n) => n.selected).map((n) => n.id);
    if (selectedIds.length === 0) return;

    // BFS to collect all descendants
    const toDelete = new Set(selectedIds);
    const descendants = collectDescendants(selectedIds, edges);
    descendants.forEach((id) => toDelete.add(id));

    const nextNodes = nodes.filter((n) => !toDelete.has(n.id));
    const nextEdges = edges.filter(
      (e) => !toDelete.has(e.source) && !toDelete.has(e.target),
    );

    setNodes(() => nextNodes);
    setEdges(() => nextEdges);
    onSnapshot(nextNodes, nextEdges);
  }, [nodes, edges, setNodes, setEdges, onSnapshot]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      // Don't intercept when typing in inputs
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        onUndo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        onRedo();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        addChildNode();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        addSiblingNode();
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedNodes();
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [addChildNode, addSiblingNode, deleteSelectedNodes, onUndo, onRedo]);
}
