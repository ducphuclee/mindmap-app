import dagre from '@dagrejs/dagre';
import type { MindmapNode, MindmapEdge } from '@/types/mindmap';

export type LayoutType = 'radial' | 'tree-td' | 'tree-lr';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 50;
const RADIAL_RADIUS = 200;

function buildChildrenMap(
  edges: MindmapEdge[],
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const edge of edges) {
    if (!map.has(edge.source)) map.set(edge.source, []);
    map.get(edge.source)!.push(edge.target);
  }
  return map;
}

function buildParentMap(
  edges: MindmapEdge[],
): Map<string, string> {
  const map = new Map<string, string>();
  for (const edge of edges) {
    map.set(edge.target, edge.source);
  }
  return map;
}

function findRoot(
  nodes: MindmapNode[],
  parentMap: Map<string, string>,
): string {
  return nodes.find((n) => !parentMap.has(n.id))?.id ?? nodes[0].id;
}

function countSubtree(
  nodeId: string,
  childrenMap: Map<string, string[]>,
  memo: Map<string, number>,
): number {
  if (memo.has(nodeId)) return memo.get(nodeId)!;
  let count = 1;
  for (const child of childrenMap.get(nodeId) ?? []) {
    count += countSubtree(child, childrenMap, memo);
  }
  memo.set(nodeId, count);
  return count;
}

function applyRadialLayout(
  nodes: MindmapNode[],
  edges: MindmapEdge[],
): MindmapNode[] {
  const childrenMap = buildChildrenMap(edges);
  const parentMap = buildParentMap(edges);
  const rootId = findRoot(nodes, parentMap);

  const subtreeCounts = new Map<string, number>();
  countSubtree(rootId, childrenMap, subtreeCounts);

  const levels = new Map<string, number>();
  function assignLevel(nodeId: string, level: number) {
    levels.set(nodeId, level);
    for (const child of childrenMap.get(nodeId) ?? []) {
      assignLevel(child, level + 1);
    }
  }
  assignLevel(rootId, 0);

  const positions = new Map<string, { x: number; y: number }>();
  positions.set(rootId, { x: 0, y: 0 });

  function layoutNode(nodeId: string, angleStart: number, angleEnd: number) {
    const children = childrenMap.get(nodeId) ?? [];
    if (children.length === 0) return;

    const parentTotal = subtreeCounts.get(nodeId) ?? 1;
    const childrenTotal = parentTotal - 1;
    if (childrenTotal <= 0) return;

    let currentAngle = angleStart;

    for (const child of children) {
      const childCount = subtreeCounts.get(child) ?? 1;
      const fraction = childCount / childrenTotal;
      const span = (angleEnd - angleStart) * fraction;
      const midAngle = currentAngle + span / 2;

      const level = levels.get(child) ?? 1;
      const radius = level * RADIAL_RADIUS;
      positions.set(child, {
        x: radius * Math.cos(midAngle),
        y: radius * Math.sin(midAngle),
      });

      layoutNode(child, currentAngle, currentAngle + span);
      currentAngle += span;
    }
  }

  layoutNode(rootId, 0, 2 * Math.PI);

  return nodes.map((n) => ({
    ...n,
    position: positions.get(n.id) ?? n.position,
  }));
}

function applyTreeLayout(
  nodes: MindmapNode[],
  edges: MindmapEdge[],
  rankDir: 'TB' | 'LR',
): MindmapNode[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: rankDir, nodesep: 80, ranksep: 150 });

  for (const node of nodes) {
    g.setNode(node.id, {
      width: node.width ?? NODE_WIDTH,
      height: node.height ?? NODE_HEIGHT,
    });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((n) => {
    const dagreNode = g.node(n.id);
    if (!dagreNode) return n;
    return {
      ...n,
      position: {
        x: dagreNode.x - (dagreNode.width ?? NODE_WIDTH) / 2,
        y: dagreNode.y - (dagreNode.height ?? NODE_HEIGHT) / 2,
      },
    };
  });
}

export function applyLayout(
  nodes: MindmapNode[],
  edges: MindmapEdge[],
  type: LayoutType,
): MindmapNode[] {
  if (nodes.length === 0) return nodes;

  switch (type) {
    case 'radial':
      return applyRadialLayout(nodes, edges);
    case 'tree-td':
      return applyTreeLayout(nodes, edges, 'TB');
    case 'tree-lr':
      return applyTreeLayout(nodes, edges, 'LR');
  }
}
