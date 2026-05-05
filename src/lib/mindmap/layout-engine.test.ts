import { describe, it, expect } from 'vitest';
import { applyLayout, type LayoutType } from './layout-engine';
import type { MindmapNode, MindmapEdge } from '@/types/mindmap';

const LABEL_BASE = { label: 'test', bgColor: '#fff', textColor: '#000' };

function n(id: string, overrides: Partial<MindmapNode> = {}): MindmapNode {
  return { id, position: { x: 0, y: 0 }, data: { ...LABEL_BASE }, ...overrides };
}

function e(source: string, target: string, overrides: Partial<MindmapEdge> = {}): MindmapEdge {
  return { id: `${source}->${target}`, source, target, ...overrides };
}

function radius(pos: { x: number; y: number }): number {
  return Math.sqrt(pos.x * pos.x + pos.y * pos.y);
}

describe('applyLayout', () => {
  describe('radial', () => {
    it('places root at center (0, 0)', () => {
      const nodes: MindmapNode[] = [n('root')];
      const edges: MindmapEdge[] = [];
      const result = applyLayout(nodes, edges, 'radial');
      expect(result[0].position).toEqual({ x: 0, y: 0 });
    });

    it('places children on a circle around root', () => {
      const nodes: MindmapNode[] = [n('root'), n('a'), n('b'), n('c')];
      const edges: MindmapEdge[] = [e('root', 'a'), e('root', 'b'), e('root', 'c')];
      const result = applyLayout(nodes, edges, 'radial');
      const rootPos = result.find((n) => n.id === 'root')!.position;
      expect(rootPos).toEqual({ x: 0, y: 0 });

      for (const child of ['a', 'b', 'c']) {
        const pos = result.find((n) => n.id === child)!.position;
        const r = radius(pos);
        expect(r).toBeGreaterThanOrEqual(190);
        expect(r).toBeLessThanOrEqual(210);
      }
    });

    it('returns single node unchanged', () => {
      const node: MindmapNode = n('root', { position: { x: 100, y: 200 } });
      const result = applyLayout([node], [], 'radial');
      expect(result[0].position).toEqual({ x: 0, y: 0 });
    });

    it('handles tree with grandchildren', () => {
      const nodes: MindmapNode[] = [n('root'), n('a'), n('b'), n('a1')];
      const edges: MindmapEdge[] = [e('root', 'a'), e('root', 'b'), e('a', 'a1')];
      const result = applyLayout(nodes, edges, 'radial');
      const a1Pos = result.find((n) => n.id === 'a1')!.position;
      expect(radius(a1Pos)).toBeGreaterThanOrEqual(390);
    });
  });

  describe('tree-td', () => {
    it('places root at top of canvas (lowest y)', () => {
      const nodes: MindmapNode[] = [n('root'), n('a'), n('b')];
      const edges: MindmapEdge[] = [e('root', 'a'), e('root', 'b')];
      const result = applyLayout(nodes, edges, 'tree-td');
      const rootPos = result.find((n) => n.id === 'root')!.position;
      for (const child of ['a', 'b']) {
        const childPos = result.find((n) => n.id === child)!.position;
        expect(childPos.y).toBeGreaterThan(rootPos.y);
      }
    });
  });

  describe('tree-lr', () => {
    it('places root at left (lowest x)', () => {
      const nodes: MindmapNode[] = [n('root'), n('a'), n('b')];
      const edges: MindmapEdge[] = [e('root', 'a'), e('root', 'b')];
      const result = applyLayout(nodes, edges, 'tree-lr');
      const rootPos = result.find((n) => n.id === 'root')!.position;
      for (const child of ['a', 'b']) {
        const childPos = result.find((n) => n.id === child)!.position;
        expect(childPos.x).toBeGreaterThan(rootPos.x);
      }
    });
  });

  it('returns empty array for empty nodes', () => {
    const result = applyLayout([], [], 'radial');
    expect(result).toEqual([]);
  });

  it('does not mutate original nodes', () => {
    const nodes: MindmapNode[] = [n('root', { position: { x: 50, y: 50 } })];
    const edges: MindmapEdge[] = [];
    const originalX = nodes[0].position.x;
    applyLayout(nodes, edges, 'radial');
    expect(nodes[0].position.x).toBe(originalX);
  });
});
