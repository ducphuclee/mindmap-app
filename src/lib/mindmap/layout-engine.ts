import dagre from '@dagrejs/dagre';
import type { MindmapNode, MindmapEdge } from '@/types/mindmap';

export type LayoutType = 'radial' | 'tree-td' | 'tree-lr';

const NODE_WIDTH = 160;
const NODE_HEIGHT = 50;
const HORIZONTAL_GAP = 80;
const VERTICAL_GAP = 24;

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

function computeSubtreeHeight(
  nodeId: string,
  childrenMap: Map<string, string[]>,
  nodeHeights: Map<string, number>,
  memo: Map<string, number>,
): number {
  if (memo.has(nodeId)) return memo.get(nodeId)!;
  const children = childrenMap.get(nodeId) ?? [];
  if (children.length === 0) {
    const h = nodeHeights.get(nodeId) ?? NODE_HEIGHT;
    memo.set(nodeId, h);
    return h;
  }
  const childrenTotal = children.reduce(
    (sum, child) => sum + computeSubtreeHeight(child, childrenMap, nodeHeights, memo),
    0,
  );
  const result = Math.max(
    nodeHeights.get(nodeId) ?? NODE_HEIGHT,
    childrenTotal + VERTICAL_GAP * (children.length - 1),
  );
  memo.set(nodeId, result);
  return result;
}

function layoutBranch(
  nodeId: string,
  cx: number,
  cy: number,
  direction: 1 | -1,
  childrenMap: Map<string, string[]>,
  nodeWidths: Map<string, number>,
  subtreeHeights: Map<string, number>,
  positions: Map<string, { x: number; y: number }>,
): void {
  positions.set(nodeId, { x: cx, y: cy });
  const children = childrenMap.get(nodeId) ?? [];
  if (children.length === 0) return;

  const nw = nodeWidths.get(nodeId) ?? NODE_WIDTH;
  const childX = cx + direction * (nw / 2 + HORIZONTAL_GAP);

  const totalH =
    children.reduce((sum, child) => sum + (subtreeHeights.get(child) ?? NODE_HEIGHT), 0) +
    VERTICAL_GAP * (children.length - 1);
  let startY = cy - totalH / 2;

  for (const child of children) {
    const childH = subtreeHeights.get(child) ?? NODE_HEIGHT;
    const childCY = startY + childH / 2;
    layoutBranch(child, childX, childCY, direction, childrenMap, nodeWidths, subtreeHeights, positions);
    startY += childH + VERTICAL_GAP;
  }
}

function applyXMindLayout(
  nodes: MindmapNode[],
  edges: MindmapEdge[],
): MindmapNode[] {
  const childrenMap = buildChildrenMap(edges);
  const parentMap = buildParentMap(edges);
  const rootId = findRoot(nodes, parentMap);

  const nodeWidths = new Map<string, number>();
  const nodeHeights = new Map<string, number>();
  for (const n of nodes) {
    nodeWidths.set(n.id, n.width ?? NODE_WIDTH);
    nodeHeights.set(n.id, n.height ?? NODE_HEIGHT);
  }

  const subtreeHeights = new Map<string, number>();
  for (const n of nodes) {
    computeSubtreeHeight(n.id, childrenMap, nodeHeights, subtreeHeights);
  }

  const rootChildren = childrenMap.get(rootId) ?? [];
  const rightChildren: string[] = [];
  const leftChildren: string[] = [];
  for (let i = 0; i < rootChildren.length; i++) {
    if (i % 2 === 0) {
      rightChildren.push(rootChildren[i]);
    } else {
      leftChildren.push(rootChildren[i]);
    }
  }

  const positions = new Map<string, { x: number; y: number }>();
  positions.set(rootId, { x: 0, y: 0 });

  const rootW = nodeWidths.get(rootId) ?? NODE_WIDTH;

  // Layout right side
  if (rightChildren.length > 0) {
    const rightTotalH =
      rightChildren.reduce((sum, child) => sum + (subtreeHeights.get(child) ?? NODE_HEIGHT), 0) +
      VERTICAL_GAP * (rightChildren.length - 1);
    let startY = -rightTotalH / 2;
    for (const child of rightChildren) {
      const childH = subtreeHeights.get(child) ?? NODE_HEIGHT;
      layoutBranch(
        child,
        rootW / 2 + HORIZONTAL_GAP,
        startY + childH / 2,
        1,
        childrenMap,
        nodeWidths,
        subtreeHeights,
        positions,
      );
      startY += childH + VERTICAL_GAP;
    }
  }

  // Layout left side
  if (leftChildren.length > 0) {
    const leftTotalH =
      leftChildren.reduce((sum, child) => sum + (subtreeHeights.get(child) ?? NODE_HEIGHT), 0) +
      VERTICAL_GAP * (leftChildren.length - 1);
    let startY = -leftTotalH / 2;
    for (const child of leftChildren) {
      const childH = subtreeHeights.get(child) ?? NODE_HEIGHT;
      layoutBranch(
        child,
        -(rootW / 2 + HORIZONTAL_GAP),
        startY + childH / 2,
        -1,
        childrenMap,
        nodeWidths,
        subtreeHeights,
        positions,
      );
      startY += childH + VERTICAL_GAP;
    }
  }

  // Convert center-based positions to top-left for ReactFlow
  return nodes.map((n) => {
    const pos = positions.get(n.id);
    if (!pos) return n;
    const w = nodeWidths.get(n.id) ?? NODE_WIDTH;
    const h = nodeHeights.get(n.id) ?? NODE_HEIGHT;
    return {
      ...n,
      position: {
        x: pos.x - w / 2,
        y: pos.y - h / 2,
      },
    };
  });
}

function applyTreeLayout(
  nodes: MindmapNode[],
  edges: MindmapEdge[],
  rankDir: 'TB' | 'LR',
): MindmapNode[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: rankDir, nodesep: 60, ranksep: 120 });

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
      return applyXMindLayout(nodes, edges);
    case 'tree-td':
      return applyTreeLayout(nodes, edges, 'TB');
    case 'tree-lr':
      return applyTreeLayout(nodes, edges, 'LR');
  }
}
