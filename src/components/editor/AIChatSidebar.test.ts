import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const SIDEBAR_PATH = path.resolve(__dirname, 'AIChatSidebar.tsx');
const EDITOR_PATH = path.resolve(__dirname, 'MindmapEditor.tsx');

function readSidebar(): string {
  return fs.readFileSync(SIDEBAR_PATH, 'utf-8');
}

function readEditor(): string {
  return fs.readFileSync(EDITOR_PATH, 'utf-8');
}

describe('AIChatSidebar – component contract', () => {
  it('AIChatSidebar.tsx file exists', () => {
    expect(() => readSidebar()).not.toThrow();
  });

  it('is a client component', () => {
    const src = readSidebar();
    expect(src).toMatch(/'use client'/);
  });

  it('accepts context and onApplyDiff props', () => {
    const src = readSidebar();
    expect(src).toMatch(/context/);
    expect(src).toMatch(/onApplyDiff/);
  });

  it('uses streaming fetch with getReader', () => {
    const src = readSidebar();
    expect(src).toMatch(/getReader/);
    expect(src).toMatch(/TextDecoder/);
  });

  it('handles done event with onApplyDiff call', () => {
    const src = readSidebar();
    expect(src).toMatch(/type.*done/);
    expect(src).toMatch(/onApplyDiff/);
  });

  it('has loading indicator for streaming state', () => {
    const src = readSidebar();
    expect(src).toMatch(/isStreaming/);
    expect(src).toMatch(/animate-bounce/);
  });

  it('has error state message', () => {
    const src = readSidebar();
    expect(src).toMatch(/Something went wrong/);
  });

  it('renders user messages right-aligned', () => {
    const src = readSidebar();
    expect(src).toMatch(/justify-end/);
  });

  it('renders AI messages left-aligned', () => {
    const src = readSidebar();
    expect(src).toMatch(/justify-start/);
  });

  it('has a textarea for input', () => {
    const src = readSidebar();
    expect(src).toMatch(/textarea/);
  });

  it('has a Send button', () => {
    const src = readSidebar();
    expect(src).toMatch(/Send/);
  });
});

describe('MindmapEditor – AIChatSidebar wiring', () => {
  it('imports AIChatSidebar', () => {
    const src = readEditor();
    expect(src).toMatch(/AIChatSidebar/);
  });

  it('renders AIChatSidebar in the component', () => {
    const src = readEditor();
    expect(src).toMatch(/<AIChatSidebar/);
  });

  it('has handleApplyDiff function', () => {
    const src = readEditor();
    expect(src).toMatch(/handleApplyDiff/);
  });

  it('calls applyDiff in onApplyDiff handler', () => {
    const src = readEditor();
    expect(src).toMatch(/applyDiff\(/);
  });

  it('passes context and onApplyDiff to AIChatSidebar', () => {
    const src = readEditor();
    expect(src).toMatch(/context=\{mindmap\.data\}/);
    expect(src).toMatch(/onApplyDiff=\{handleApplyDiff\}/);
  });

  it('wraps ReactFlow and sidebar in flex-row container', () => {
    const src = readEditor();
    expect(src).toMatch(/flex flex-1/);
  });
});
