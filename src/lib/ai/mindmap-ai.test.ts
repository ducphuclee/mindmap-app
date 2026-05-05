import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const MINMAP_AI_PATH = path.resolve(__dirname, 'mindmap-ai.ts');
const ROUTE_PATH = path.resolve(__dirname, '../../app/api/ai/generate/route.ts');
const OPENAI_CLIENT_PATH = path.resolve(__dirname, 'openai-client.ts');

describe('mindmap-ai.ts', () => {
  const src = fs.readFileSync(MINMAP_AI_PATH, 'utf-8');

  it('contains gpt-4o model reference', () => {
    expect(src).toContain('gpt-4o');
  });

  it('contains JSON schema in system prompt', () => {
    expect(src).toContain('"nodes"');
    expect(src).toContain('"edges"');
    expect(src).toContain('"data.label"');
  });
});

describe('generate/route.ts', () => {
  const src = fs.readFileSync(ROUTE_PATH, 'utf-8');

  it('contains Supabase auth check', () => {
    expect(src).toContain('getUser');
  });

  it('returns 400 for empty text', () => {
    expect(src).toContain('400');
    expect(src).toContain('text is required');
  });
});

describe('expandNode', () => {
  const src = fs.readFileSync(MINMAP_AI_PATH, 'utf-8');

  it('exports expandNode function', () => {
    expect(src).toContain('expandNode');
  });
});

describe('openai-client.ts', () => {
  const src = fs.readFileSync(OPENAI_CLIENT_PATH, 'utf-8');

  it('does NOT contain use client directive', () => {
    expect(src).not.toContain("'use client'");
  });
});
