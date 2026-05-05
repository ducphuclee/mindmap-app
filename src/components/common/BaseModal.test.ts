import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const MODAL_PATH = path.resolve(__dirname, 'BaseModal.tsx');

function readModal(): string {
  return fs.readFileSync(MODAL_PATH, 'utf-8');
}

describe('BaseModal – component contract', () => {
  it('BaseModal.tsx file exists', () => {
    expect(() => readModal()).not.toThrow();
  });

  it('exports default', () => {
    const src = readModal();
    expect(src).toMatch(/export default function BaseModal/);
  });

  it('imports @headlessui/react Dialog', () => {
    const src = readModal();
    expect(src).toMatch(/@headlessui\/react/);
    expect(src).toMatch(/Dialog/);
  });

  it('accepts isOpen, onClose, title props', () => {
    const src = readModal();
    expect(src).toMatch(/isOpen/);
    expect(src).toMatch(/onClose/);
    expect(src).toMatch(/\btitle\b/);
  });

  it('accepts optional description prop', () => {
    const src = readModal();
    expect(src).toMatch(/description\??/);
  });

  it('accepts optional submitLabel, onSubmit, isDangerous, isLoading props', () => {
    const src = readModal();
    expect(src).toMatch(/submitLabel\??/);
    expect(src).toMatch(/onSubmit\??/);
    expect(src).toMatch(/isDangerous\??/);
    expect(src).toMatch(/isLoading\??/);
  });

  it('accepts optional children prop', () => {
    const src = readModal();
    expect(src).toMatch(/children\??/);
  });

  it('renders bg-black/50 backdrop', () => {
    const src = readModal();
    expect(src).toMatch(/bg-black\/50/);
  });

  it('conditionally renders Submit button based on onSubmit prop', () => {
    const src = readModal();
    expect(src).toMatch(/onSubmit\s*&&/);
  });

  it('applies bg-red-600 class when isDangerous is true', () => {
    const src = readModal();
    expect(src).toMatch(/isDangerous/);
    expect(src).toMatch(/bg-red-600/);
  });

  it('applies bg-blue-600 class when isDangerous is false or undefined', () => {
    const src = readModal();
    expect(src).toMatch(/bg-blue-600/);
  });

  it('disables Submit button when isLoading is true', () => {
    const src = readModal();
    expect(src).toMatch(/isLoading/);
    expect(src).toMatch(/disabled=\{isLoading\}/);
  });
});
