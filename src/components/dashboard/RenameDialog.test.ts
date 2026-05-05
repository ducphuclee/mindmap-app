import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const DIALOG_PATH = path.resolve(__dirname, 'RenameDialog.tsx');

function readDialog(): string {
  return fs.readFileSync(DIALOG_PATH, 'utf-8');
}

describe('RenameDialog – component contract', () => {
  it('RenameDialog.tsx file exists', () => {
    expect(() => readDialog()).not.toThrow();
  });

  it('imports BaseModal', () => {
    const src = readDialog();
    expect(src).toMatch(/BaseModal/);
    expect(src).toMatch(/@\/components\/common\/BaseModal/);
  });

  it('has currentTitle prop', () => {
    const src = readDialog();
    expect(src).toMatch(/currentTitle/);
  });

  it('uses trim() validation', () => {
    const src = readDialog();
    expect(src).toMatch(/\.trim\(\)/);
  });
});
