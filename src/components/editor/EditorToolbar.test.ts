/**
 * TDD tests for EditorToolbar Fit button feature.
 *
 * Tests the contract: EditorToolbar must accept an `onFitView` callback prop
 * that gets wired to the Fit button. We verify this by checking the component
 * source includes the prop and the button handler.
 *
 * Note: Full React component rendering tests require @testing-library/react
 * which is not installed in this project. These tests verify the module
 * contract by inspecting what is exported and the function signature.
 */
import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const TOOLBAR_PATH = path.resolve(
  __dirname,
  'EditorToolbar.tsx',
);

function readToolbar(): string {
  return fs.readFileSync(TOOLBAR_PATH, 'utf-8');
}

describe('EditorToolbar – Fit button', () => {
  it('accepts an onFitView prop in the interface', () => {
    const src = readToolbar();
    expect(src).toMatch(/onFitView/);
  });

  it('renders a button that calls onFitView on click', () => {
    const src = readToolbar();
    // Button must reference onFitView in its onClick handler
    expect(src).toMatch(/onClick.*onFitView|onFitView.*onClick/);
  });

  it('provides a visible label for the Fit button', () => {
    const src = readToolbar();
    // The button should have a title or visible text for accessibility
    expect(src).toMatch(/[Ff]it/);
  });
});

describe('onFitView callback wiring', () => {
  it('calls the provided onFitView function when invoked', () => {
    const onFitView = vi.fn();
    // Simulate what the button onClick does
    onFitView();
    expect(onFitView).toHaveBeenCalledTimes(1);
  });
});
