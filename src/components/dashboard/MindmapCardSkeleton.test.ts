import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SKELETON_PATH = path.resolve(__dirname, 'MindmapCardSkeleton.tsx');
const GRID_PATH = path.resolve(__dirname, 'MindmapGrid.tsx');

function readSkeleton(): string {
  return fs.readFileSync(SKELETON_PATH, 'utf-8');
}

function readGrid(): string {
  return fs.readFileSync(GRID_PATH, 'utf-8');
}

describe('MindmapCardSkeleton', () => {
  it('file exists', () => {
    expect(fs.existsSync(SKELETON_PATH)).toBe(true);
  });

  it('source contains animate-pulse for placeholder styling', () => {
    const src = readSkeleton();
    expect(src).toMatch(/animate-pulse/);
  });
});

describe('MindmapGrid isLoading integration', () => {
  it('source contains isLoading prop', () => {
    const src = readGrid();
    expect(src).toMatch(/isLoading/);
  });

  it('source references MindmapCardSkeleton', () => {
    const src = readGrid();
    expect(src).toMatch(/MindmapCardSkeleton/);
  });
});
