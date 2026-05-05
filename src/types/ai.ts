import type { MindmapNode, MindmapEdge } from './mindmap';

export type DiffOp =
  | { type: 'add_node'; id: string; position: { x: number; y: number }; data: { label: string }; parentId?: string }
  | { type: 'rename_node'; nodeId: string; label: string }
  | { type: 'delete_node'; nodeId: string }
  | { type: 'add_edge'; id: string; source: string; target: string; label?: string }
  | { type: 'delete_edge'; edgeId: string };

export interface MindmapDiff {
  ops: DiffOp[];
}
