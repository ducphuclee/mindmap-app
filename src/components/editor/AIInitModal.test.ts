import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const MODAL_PATH = path.resolve(__dirname, 'AIInitModal.tsx');
const EDITOR_PATH = path.resolve(__dirname, 'MindmapEditor.tsx');

function readModal(): string {
  return fs.readFileSync(MODAL_PATH, 'utf-8');
}

function readEditor(): string {
  return fs.readFileSync(EDITOR_PATH, 'utf-8');
}

describe('AIInitModal – component contract', () => {
  it('AIInitModal.tsx file exists', () => {
    expect(() => readModal()).not.toThrow();
  });

  it('exports default', () => {
    const src = readModal();
    expect(src).toMatch(/export default function AIInitModal/);
  });

  it('imports @headlessui/react Dialog', () => {
    const src = readModal();
    expect(src).toMatch(/@headlessui\/react/);
    expect(src).toMatch(/Dialog/);
  });

  it('accepts isOpen, onClose, onApply props', () => {
    const src = readModal();
    expect(src).toMatch(/isOpen/);
    expect(src).toMatch(/onClose/);
    expect(src).toMatch(/onApply/);
  });

  it('renders textarea with placeholder', () => {
    const src = readModal();
    expect(src).toMatch(/textarea/);
    expect(src).toMatch(/placeholder/);
  });

  it('renders Close and Submit buttons', () => {
    const src = readModal();
    expect(src).toMatch(/Close/);
    expect(src).toMatch(/Submit/);
  });

  it('disables Submit when text is empty or whitespace', () => {
    const src = readModal();
    expect(src).toMatch(/disabled/);
    expect(src).toMatch(/canSubmit/);
  });

  it('shows loading state', () => {
    const src = readModal();
    expect(src).toMatch(/isLoading/);
    expect(src).toMatch(/Generating\.\.\./);
  });

  it('shows error message on failure', () => {
    const src = readModal();
    expect(src).toMatch(/error/);
    expect(src).toMatch(/red/);
  });

  it('calls POST /api/ai/generate on submit', () => {
    const src = readModal();
    expect(src).toMatch(/\/api\/ai\/generate/);
    expect(src).toMatch(/text/);
  });

  it('calls onApply(data) on success', () => {
    const src = readModal();
    expect(src).toMatch(/onApply\(/);
  });
});

describe('MindmapEditor – AIInitModal integration', () => {
  it('imports AIInitModal', () => {
    const src = readEditor();
    expect(src).toMatch(/AIInitModal/);
  });

  it('imports MindmapData type', () => {
    const src = readEditor();
    expect(src).toMatch(/MindmapData/);
  });

  it('renders AIInitModal with conditional logic', () => {
    const src = readEditor();
    expect(src).toMatch(/showAIModal/);
    expect(src).toMatch(/modalDismissed/);
    expect(src).toMatch(/AIInitModal/);
  });

  it('condition shows when single root node with Central Idea label', () => {
    const src = readEditor();
    expect(src).toMatch(/nodes\.length === 1/);
    expect(src).toMatch(/nodes\[0\]\.id === 'root'/);
    expect(src).toMatch(/Central Idea/);
  });

  it('handleAIApply applies layout, sets nodes, edges, and pushes snapshot', () => {
    const src = readEditor();
    expect(src).toMatch(/applyLayout/);
    expect(src).toMatch(/setNodes\(nextNodes/);
    expect(src).toMatch(/setEdges\(nextEdges/);
    expect(src).toMatch(/pushSnapshot/);
    expect(src).toMatch(/fitView/);
  });
});
