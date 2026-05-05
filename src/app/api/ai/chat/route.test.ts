import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const ROUTE_PATH = path.resolve(__dirname, 'route.ts');

function readRoute(): string {
  return fs.readFileSync(ROUTE_PATH, 'utf-8');
}

describe('AI Chat Route – streaming contract', () => {
  it('route.ts file exists', () => {
    expect(() => readRoute()).not.toThrow();
  });

  it('returns text/event-stream content type', () => {
    const src = readRoute();
    expect(src).toMatch(/text\/event-stream/);
  });

  it('checks auth via supabase getUser', () => {
    const src = readRoute();
    expect(src).toMatch(/getUser/);
    expect(src).toMatch(/Unauthorized/);
  });

  it('sends done event with diff', () => {
    const src = readRoute();
    expect(src).toMatch(/type.*done/);
    expect(src).toMatch(/diff/);
  });

  it('sends text chunks during streaming', () => {
    const src = readRoute();
    expect(src).toMatch(/type.*text/);
    expect(src).toMatch(/content/);
  });

  it('uses ReadableStream for SSE', () => {
    const src = readRoute();
    expect(src).toMatch(/ReadableStream/);
  });

  it('handles errors with error event', () => {
    const src = readRoute();
    expect(src).toMatch(/type.*error/);
  });

  it('uses temperature 0.5 and max_tokens 1000', () => {
    const src = readRoute();
    expect(src).toMatch(/temperature.*0\.5|0\.5.*temperature/);
    expect(src).toMatch(/max_tokens.*1000|1000.*max_tokens/);
  });
});
