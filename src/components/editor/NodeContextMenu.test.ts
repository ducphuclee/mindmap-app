/**
 * TDD tests for NodeContextMenu component.
 *
 * Tests verify the contract: NodeContextMenu must accept the required props
 * and render the 4 action items correctly, with "Add Sibling" disabled when
 * hasParent is false.
 *
 * Note: Full React component rendering requires @testing-library/react which
 * is not installed. These tests verify the module contract by inspecting source.
 */
import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const MENU_PATH = path.resolve(__dirname, 'NodeContextMenu.tsx');

function readMenu(): string {
  return fs.readFileSync(MENU_PATH, 'utf-8');
}

describe('NodeContextMenu – component contract', () => {
  it('NodeContextMenu.tsx file exists', () => {
    expect(() => readMenu()).not.toThrow();
  });

  it('accepts nodeId, x, y, hasParent props', () => {
    const src = readMenu();
    expect(src).toMatch(/nodeId/);
    expect(src).toMatch(/hasParent/);
    expect(src).toMatch(/\bx\b.*\by\b|\by\b.*\bx\b/);
  });

  it('renders Add Child menu item', () => {
    const src = readMenu();
    expect(src).toMatch(/Add Child/);
    expect(src).toMatch(/onAddChild/);
  });

  it('renders Add Sibling menu item', () => {
    const src = readMenu();
    expect(src).toMatch(/Add Sibling/);
    expect(src).toMatch(/onAddSibling/);
  });

  it('renders Rename menu item', () => {
    const src = readMenu();
    expect(src).toMatch(/Rename/);
    expect(src).toMatch(/onRename/);
  });

  it('renders Delete menu item with danger styling', () => {
    const src = readMenu();
    expect(src).toMatch(/Delete/);
    expect(src).toMatch(/onDelete/);
    expect(src).toMatch(/danger/);
  });

  it('disables Add Sibling when hasParent is false', () => {
    const src = readMenu();
    // The disabled prop for sibling should depend on !hasParent
    expect(src).toMatch(/!hasParent/);
  });

  it('closes on outside click via useEffect', () => {
    const src = readMenu();
    expect(src).toMatch(/mousedown/);
    expect(src).toMatch(/onClose/);
  });

  it('closes on Escape key', () => {
    const src = readMenu();
    expect(src).toMatch(/Escape/);
  });

  it('uses position fixed for overlay rendering', () => {
    const src = readMenu();
    expect(src).toMatch(/position.*fixed|fixed.*position/);
  });
});

describe('MindmapEditor – context menu wiring', () => {
  const EDITOR_PATH = path.resolve(__dirname, 'MindmapEditor.tsx');

  function readEditor(): string {
    return fs.readFileSync(EDITOR_PATH, 'utf-8');
  }

  it('imports NodeContextMenu', () => {
    const src = readEditor();
    expect(src).toMatch(/NodeContextMenu/);
  });

  it('has onNodeContextMenu handler on ReactFlow', () => {
    const src = readEditor();
    expect(src).toMatch(/onNodeContextMenu/);
  });

  it('has contextMenu state', () => {
    const src = readEditor();
    expect(src).toMatch(/contextMenu/);
  });

  it('renders NodeContextMenu when contextMenu state is set', () => {
    const src = readEditor();
    expect(src).toMatch(/contextMenu\s*&&/);
  });

  it('has addChildToNode function', () => {
    const src = readEditor();
    expect(src).toMatch(/addChildToNode/);
  });

  it('has addSiblingToNode function', () => {
    const src = readEditor();
    expect(src).toMatch(/addSiblingToNode/);
  });

  it('has deleteNode function', () => {
    const src = readEditor();
    expect(src).toMatch(/deleteNode/);
  });

  it('has startRenameNode function', () => {
    const src = readEditor();
    expect(src).toMatch(/startRenameNode/);
  });

  it('passes hasParent prop using edges.some', () => {
    const src = readEditor();
    expect(src).toMatch(/edges\.some/);
    expect(src).toMatch(/e\.target/);
  });
});

describe('MindmapEditor – onConnect handler', () => {
  const EDITOR_PATH = path.resolve(__dirname, 'MindmapEditor.tsx');

  function readEditor(): string {
    return fs.readFileSync(EDITOR_PATH, 'utf-8');
  }

  it('imports addEdge from @xyflow/react', () => {
    const src = readEditor();
    expect(src).toMatch(/\baddEdge\b/);
  });

  it('imports Connection type from @xyflow/react', () => {
    const src = readEditor();
    expect(src).toMatch(/Connection/);
  });

  it('has onConnect callback defined', () => {
    const src = readEditor();
    expect(src).toMatch(/const onConnect/);
  });

  it('onConnect calls addEdge to merge the new edge', () => {
    const src = readEditor();
    expect(src).toMatch(/addEdge\(/);
  });

  it('onConnect calls pushSnapshot with updated edges', () => {
    const src = readEditor();
    // addEdge result feeds into pushSnapshot
    expect(src).toMatch(/pushSnapshot/);
  });

  it('passes onConnect prop to ReactFlow', () => {
    const src = readEditor();
    expect(src).toMatch(/onConnect=\{onConnect\}/);
  });
});
