import type { MindmapNode, MindmapEdge } from '@/types/mindmap';
import type { MindmapDiff } from '@/types/ai';

function getDescendantIds(nodeId: string, edges: MindmapEdge[]): Set<string> {
  const ids = new Set<string>([nodeId]);
  const queue = [nodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const edge of edges) {
      if (edge.source === current && !ids.has(edge.target)) {
        ids.add(edge.target);
        queue.push(edge.target);
      }
    }
  }
  return ids;
}

export function applyDiff(
  nodes: MindmapNode[],
  edges: MindmapEdge[],
  diff: MindmapDiff,
): { nodes: MindmapNode[]; edges: MindmapEdge[] } {
  let resultNodes = nodes.map((n) => ({ ...n }));
  let resultEdges = edges.map((e) => ({ ...e }));

  for (const op of diff.ops) {
    switch (op.type) {
      case 'add_node': {
        let nodeId = op.id;
        if (resultNodes.some((n) => n.id === nodeId)) {
          nodeId = `${nodeId}-${Date.now()}`;
        }
        const newNode: MindmapNode = {
          id: nodeId,
          position: { ...op.position },
          data: { label: op.data.label, ...(op.data as Record<string, unknown>) },
          ...(op.parentId ? { parentId: op.parentId } : {}),
        };
        resultNodes = [...resultNodes, newNode];
        break;
      }
      case 'rename_node': {
        resultNodes = resultNodes.map((n) =>
          n.id === op.nodeId
            ? { ...n, data: { ...n.data, label: op.label } }
            : n,
        );
        break;
      }
      case 'delete_node': {
        const toDelete = getDescendantIds(op.nodeId, resultEdges);
        resultNodes = resultNodes.filter((n) => !toDelete.has(n.id));
        resultEdges = resultEdges.filter(
          (e) => !toDelete.has(e.source) && !toDelete.has(e.target),
        );
        break;
      }
      case 'add_edge': {
        const newEdge: MindmapEdge = {
          id: op.id,
          source: op.source,
          target: op.target,
          ...(op.label ? { label: op.label } : {}),
        };
        resultEdges = [...resultEdges, newEdge];
        break;
      }
      case 'delete_edge': {
        resultEdges = resultEdges.filter((e) => e.id !== op.edgeId);
        break;
      }
    }
  }

  return { nodes: resultNodes, edges: resultEdges };
}
