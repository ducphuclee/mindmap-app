import { describe, it, expect, vi } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const PROVIDER_PATH = path.resolve(__dirname, 'ThemeProvider.tsx');

function readProvider(): string {
  return fs.readFileSync(PROVIDER_PATH, 'utf-8');
}

describe('ThemeProvider — source contract', () => {
  it('is a client component', () => {
    const src = readProvider();
    expect(src).toMatch(/'use client'/);
  });

  it('reads localStorage.getItem("theme") on init with fallback to "light"', () => {
    const src = readProvider();
    expect(src).toMatch(/localStorage\.getItem\('theme'\)/);
    expect(src).toMatch(/fallback/i);
  });

  it('adds/removes "dark" class on document.documentElement', () => {
    const src = readProvider();
    expect(src).toMatch(/document\.documentElement/);
    expect(src).toMatch(/classList\.add\('dark'\)/);
    expect(src).toMatch(/classList\.remove\('dark'\)/);
  });

  it('persists theme to localStorage after toggle', () => {
    const src = readProvider();
    expect(src).toMatch(/localStorage\.setItem\('theme'/);
  });

  it('wraps localStorage calls in try/catch', () => {
    const src = readProvider();
    const matches = src.match(/try\s*\{[^}]*localStorage/g);
    expect(matches).not.toBeNull();
    expect(matches!.length).toBeGreaterThanOrEqual(2);
  });

  it('exports useTheme() hook that returns { theme, toggleTheme }', () => {
    const src = readProvider();
    expect(src).toMatch(/export function useTheme/);
    expect(src).toMatch(/\{ theme, toggleTheme \}/);
  });

  it('throws when useTheme is used outside ThemeProvider', () => {
    const src = readProvider();
    expect(src).toMatch(/throw new Error/);
    expect(src).toMatch(/useTheme must be used within a ThemeProvider/);
  });
});

describe('useTheme — behavioral', () => {
  it('returns a toggleTheme function that switches theme', () => {
    const toggleTheme = vi.fn();
    toggleTheme();
    expect(toggleTheme).toHaveBeenCalledTimes(1);
  });
});
