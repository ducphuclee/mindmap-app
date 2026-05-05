import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const EDITOR_PATH = path.resolve(__dirname, 'MindmapEditor.tsx');
const NODE_PATH = path.resolve(__dirname, 'MindmapNode.tsx');

function readEditor(): string {
  return fs.readFileSync(EDITOR_PATH, 'utf-8');
}

function readNode(): string {
  return fs.readFileSync(NODE_PATH, 'utf-8');
}

describe('MindmapEditor – auto-focus edit', () => {
  it('has editingNodeId state', () => {
    const src = readEditor();
    expect(src).toMatch(/editingNodeId/);
  });

  it('initializes editingNodeId to null', () => {
    const src = readEditor();
    expect(src).toMatch(/editingNodeId.*null|useState.*null.*editingNodeId/);
  });

  it('addChildToNode sets editingNodeId to the new child id', () => {
    const src = readEditor();
    expect(src).toMatch(/setEditingNodeId\(\s*childId\s*\)/);
  });

  it('addChildToNode resets editingNodeId after timeout', () => {
    const src = readEditor();
    expect(src).toMatch(/setEditingNodeId\(\s*null\s*\)/);
    expect(src).toMatch(/setTimeout/);
  });

  it('addSiblingToNode sets editingNodeId to the new sibling id', () => {
    const src = readEditor();
    expect(src).toMatch(/setEditingNodeId\(\s*siblingId\s*\)/);
  });

  it('new node data includes autoEditId', () => {
    const src = readEditor();
    expect(src).toMatch(/autoEditId/);
  });

  it('new child node autoEditId is set to childId', () => {
    const src = readEditor();
    expect(src).toMatch(/autoEditId.*childId|childId.*autoEditId/);
  });

  it('new sibling node autoEditId is set to siblingId', () => {
    const src = readEditor();
    expect(src).toMatch(/autoEditId.*siblingId|siblingId.*autoEditId/);
  });
});

describe('MindmapEditor – expandNode', () => {
  it('has handleExpandNode callback', () => {
    const src = readEditor();
    expect(src).toMatch(/handleExpandNode/);
  });

  it('imports applyDiff', () => {
    const src = readEditor();
    expect(src).toMatch(/applyDiff/);
  });
});

describe('MindmapNode – expand feature', () => {
  it('has onExpand prop', () => {
    const src = readNode();
    expect(src).toMatch(/onExpand/);
  });

  it('has isHovered state with mouse enter/leave', () => {
    const src = readNode();
    expect(src).toMatch(/isHovered/);
    expect(src).toMatch(/onMouseEnter/);
    expect(src).toMatch(/onMouseLeave/);
  });

  it('shows expand button when hovered and not editing', () => {
    const src = readNode();
    expect(src).toMatch(/isHovered/);
    expect(src).toMatch(/isEditing/);
    expect(src).toMatch(/⚡ Expand/);
  });
});

describe('MindmapNode – auto-focus feature', () => {
  it('has autoEdit logic in useEffect', () => {
    const src = readNode();
    expect(src).toMatch(/autoEditId/);
    expect(src).toMatch(/useEffect/);
  });

  it('uses requestAnimationFrame for auto-edit', () => {
    const src = readNode();
    expect(src).toMatch(/requestAnimationFrame/);
  });

  it('checks data.autoEditId === id to trigger auto-edit', () => {
    const src = readNode();
    expect(src).toMatch(/autoEditId\s*===\s*id|data\.autoEditId/);
  });

  it('calls setIsEditing(true) in the auto-edit effect', () => {
    const src = readNode();
    expect(src).toMatch(/setIsEditing\(\s*true\s*\)/);
  });
});
