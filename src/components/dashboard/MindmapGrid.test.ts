import { describe, it, expect, vi, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const gridPath = path.resolve(__dirname, 'MindmapGrid.tsx');
const gridSource = fs.readFileSync(gridPath, 'utf-8');

afterEach(() => {
  vi.restoreAllMocks();
});

describe('MindmapGrid star + filter tabs', () => {
  it('has filterTab state initialized to all', () => {
    expect(gridSource).toContain("filterTab");
    expect(gridSource).toContain("'all'");
  });

  it('has starredIds state loaded from localStorage with try/catch', () => {
    expect(gridSource).toContain("starredIds");
    expect(gridSource).toContain("localStorage.getItem");
    expect(gridSource).toContain("'starredIds'");
    expect(gridSource).toContain("try");
    expect(gridSource).toContain("catch");
  });

  it('persists starredIds to localStorage on change', () => {
    expect(gridSource).toContain("localStorage.setItem");
    expect(gridSource).toContain("saveStarredIds");
  });

  it('filters by tab (all/starred) then by search text', () => {
    expect(gridSource).toContain("filterTab === 'starred'");
    expect(gridSource).toContain("starredIds.has(m.id)");
  });

  it('has Starred filter tab button', () => {
    expect(gridSource).toContain("Starred");
    expect(gridSource).toContain("All");
  });

  it('has handleStarToggle that toggles Set membership', () => {
    expect(gridSource).toContain("handleStarToggle");
    expect(gridSource).toContain("next.has(id)");
    expect(gridSource).toContain("next.add(id)");
    expect(gridSource).toContain("next.delete(id)");
  });

  it('passes isStarred and onStarToggle to MindmapCard', () => {
    expect(gridSource).toContain("isStarred={starredIds.has(mindmap.id)}");
    expect(gridSource).toContain("onStarToggle={handleStarToggle}");
  });
});
