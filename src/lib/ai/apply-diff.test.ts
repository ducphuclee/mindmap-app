import { describe, it, expect } from 'vitest';
import type { MindmapNode, MindmapEdge } from '@/types/mindmap';
import type { MindmapDiff } from '@/types/ai';
import { applyDiff } from './apply-diff';

function makeNode(id: string, label: string, overrides?: Partial<MindmapNode>): MindmapNode {
  return {
    id,
    position: { x: 0, y: 0 },
    data: { label },
    ...overrides,
  };
}

function makeEdge(id: string, source: string, target: string): MindmapEdge {
  return { id, source, target };
}

const rootNode = makeNode('root', 'Root', { position: { x: 100, y: 100 } });
const childA = makeNode('a', 'A', { parentId: 'root' });
const childB = makeNode('b', 'B', { parentId: 'root' });
const grandchild = makeNode('c', 'C', { parentId: 'a' });

const edgeRootA = makeEdge('e-root-a', 'root', 'a');
const edgeRootB = makeEdge('e-root-b', 'root', 'b');
const edgeAGrand = makeEdge('e-a-c', 'a', 'c');

const baseNodes = [rootNode, childA, childB, grandchild];
const baseEdges = [edgeRootA, edgeRootB, edgeAGrand];

describe('applyDiff', () => {
  it('handles empty ops array', () => {
    const diff: MindmapDiff = { ops: [] };
    const result = applyDiff(baseNodes, baseEdges, diff);
    expect(result.nodes).toHaveLength(baseNodes.length);
    expect(result.edges).toHaveLength(baseEdges.length);
    expect(result.nodes).not.toBe(baseNodes);
    expect(result.edges).not.toBe(baseEdges);
  });

  describe('add_node', () => {
    it('adds a new node to the result array', () => {
      const diff: MindmapDiff = {
        ops: [{ type: 'add_node', id: 'new', position: { x: 200, y: 200 }, data: { label: 'New' } }],
      };
      const result = applyDiff(baseNodes, baseEdges, diff);
      expect(result.nodes).toHaveLength(baseNodes.length + 1);
      expect(result.nodes.find((n) => n.id === 'new')).toMatchObject({
        data: { label: 'New' },
        position: { x: 200, y: 200 },
      });
    });

    it('does not mutate the input nodes array', () => {
      const diff: MindmapDiff = {
        ops: [{ type: 'add_node', id: 'new', position: { x: 0, y: 0 }, data: { label: 'N' } }],
      };
      const originalLength = baseNodes.length;
      applyDiff(baseNodes, baseEdges, diff);
      expect(baseNodes).toHaveLength(originalLength);
    });
  });

  describe('rename_node', () => {
    it('updates the label of the target node', () => {
      const diff: MindmapDiff = {
        ops: [{ type: 'rename_node', nodeId: 'a', label: 'Renamed A' }],
      };
      const result = applyDiff(baseNodes, baseEdges, diff);
      expect(result.nodes.find((n) => n.id === 'a')?.data.label).toBe('Renamed A');
    });

    it('does not change other nodes', () => {
      const diff: MindmapDiff = {
        ops: [{ type: 'rename_node', nodeId: 'a', label: 'Renamed A' }],
      };
      const result = applyDiff(baseNodes, baseEdges, diff);
      expect(result.nodes.find((n) => n.id === 'root')?.data.label).toBe('Root');
      expect(result.nodes.find((n) => n.id === 'b')?.data.label).toBe('B');
    });

    it('does not mutate the input nodes', () => {
      const diff: MindmapDiff = {
        ops: [{ type: 'rename_node', nodeId: 'a', label: 'Renamed A' }],
      };
      applyDiff(baseNodes, baseEdges, diff);
      expect(baseNodes.find((n) => n.id === 'a')?.data.label).toBe('A');
    });
  });

  describe('delete_node cascade', () => {
    it('deletes the target node and all descendants (BFS)', () => {
      const diff: MindmapDiff = {
        ops: [{ type: 'delete_node', nodeId: 'a' }],
      };
      const result = applyDiff(baseNodes, baseEdges, diff);
      expect(result.nodes.find((n) => n.id === 'a')).toBeUndefined();
      expect(result.nodes.find((n) => n.id === 'c')).toBeUndefined();
      expect(result.nodes.find((n) => n.id === 'root')).toBeDefined();
      expect(result.nodes.find((n) => n.id === 'b')).toBeDefined();
    });

    it('removes edges whose source or target are deleted nodes', () => {
      const diff: MindmapDiff = {
        ops: [{ type: 'delete_node', nodeId: 'a' }],
      };
      const result = applyDiff(baseNodes, baseEdges, diff);
      expect(result.edges.find((e) => e.id === 'e-root-a')).toBeUndefined();
      expect(result.edges.find((e) => e.id === 'e-a-c')).toBeUndefined();
      expect(result.edges.find((e) => e.id === 'e-root-b')).toBeDefined();
    });

    it('deletes root cascades everything', () => {
      const diff: MindmapDiff = {
        ops: [{ type: 'delete_node', nodeId: 'root' }],
      };
      const result = applyDiff(baseNodes, baseEdges, diff);
      expect(result.nodes).toHaveLength(0);
      expect(result.edges).toHaveLength(0);
    });

    it('does not mutate the input arrays', () => {
      const diff: MindmapDiff = {
        ops: [{ type: 'delete_node', nodeId: 'a' }],
      };
      applyDiff(baseNodes, baseEdges, diff);
      expect(baseNodes).toHaveLength(4);
      expect(baseEdges).toHaveLength(3);
    });
  });

  describe('add_edge', () => {
    it('adds a new edge to the result array', () => {
      const diff: MindmapDiff = {
        ops: [{ type: 'add_edge', id: 'e-b-c', source: 'b', target: 'c' }],
      };
      const result = applyDiff(baseNodes, baseEdges, diff);
      expect(result.edges).toHaveLength(baseEdges.length + 1);
      expect(result.edges.find((e) => e.id === 'e-b-c')).toMatchObject({ source: 'b', target: 'c' });
    });
  });

  describe('delete_edge', () => {
    it('removes the edge from the result array', () => {
      const diff: MindmapDiff = {
        ops: [{ type: 'delete_edge', edgeId: 'e-root-a' }],
      };
      const result = applyDiff(baseNodes, baseEdges, diff);
      expect(result.edges.find((e) => e.id === 'e-root-a')).toBeUndefined();
      expect(result.edges).toHaveLength(baseEdges.length - 1);
    });

    it('does not affect other edges', () => {
      const diff: MindmapDiff = {
        ops: [{ type: 'delete_edge', edgeId: 'e-root-a' }],
      };
      const result = applyDiff(baseNodes, baseEdges, diff);
      expect(result.edges.find((e) => e.id === 'e-root-b')).toBeDefined();
      expect(result.edges.find((e) => e.id === 'e-a-c')).toBeDefined();
    });
  });

  describe('sequential op application', () => {
    it('applies multiple ops in order', () => {
      const diff: MindmapDiff = {
        ops: [
          { type: 'add_node', id: 'd', position: { x: 0, y: 0 }, data: { label: 'D' }, parentId: 'root' },
          { type: 'add_edge', id: 'e-root-d', source: 'root', target: 'd' },
        ],
      };
      const result = applyDiff(baseNodes, baseEdges, diff);
      expect(result.nodes).toHaveLength(baseNodes.length + 1);
      expect(result.edges).toHaveLength(baseEdges.length + 1);
      expect(result.nodes.find((n) => n.id === 'd')).toBeDefined();
      expect(result.edges.find((e) => e.id === 'e-root-d')).toBeDefined();
    });
  });
});
