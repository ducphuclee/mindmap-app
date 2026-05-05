import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const MODAL_PATH = path.resolve(__dirname, 'DeleteConfirmModal.tsx');

function readModal(): string {
  return fs.readFileSync(MODAL_PATH, 'utf-8');
}

describe('DeleteConfirmModal – component contract', () => {
  it('DeleteConfirmModal.tsx file exists', () => {
    expect(() => readModal()).not.toThrow();
  });

  it('imports BaseModal from @/components/common/BaseModal', () => {
    const src = readModal();
    expect(src).toMatch(/import\s+BaseModal\s+from\s+['"]@\/components\/common\/BaseModal['"]/);
  });

  it('passes isDangerous prop', () => {
    const src = readModal();
    expect(src).toMatch(/isDangerous/);
  });
});
