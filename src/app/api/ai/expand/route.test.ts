import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const ROUTE_PATH = path.resolve(__dirname, 'route.ts');

function readRoute(): string {
  return fs.readFileSync(ROUTE_PATH, 'utf-8');
}

describe('AI Expand API route', () => {
  it('has auth check via createClient', () => {
    const src = readRoute();
    expect(src).toMatch(/createClient/);
    expect(src).toMatch(/auth\.getUser/);
  });

  it('references MindmapDiff in the response', () => {
    const src = readRoute();
    expect(src).toMatch(/MindmapDiff/);
  });
});
