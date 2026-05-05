import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const PARSER_PATH = path.resolve(__dirname, 'file-parser.ts');
const PDF_ROUTE_PATH = path.resolve(__dirname, '../../app/api/ai/parse-pdf/route.ts');
const MODAL_PATH = path.resolve(__dirname, '../../components/editor/AIInitModal.tsx');

function readParser(): string {
  return fs.readFileSync(PARSER_PATH, 'utf-8');
}

function readPdfRoute(): string {
  return fs.readFileSync(PDF_ROUTE_PATH, 'utf-8');
}

function readModal(): string {
  return fs.readFileSync(MODAL_PATH, 'utf-8');
}

describe('file-parser.ts – parseFile', () => {
  it('exports a parseFile function', () => {
    const src = readParser();
    expect(src).toMatch(/export\s+(async\s+)?function\s+parseFile/);
  });

  it('uses FileReader.readAsText for txt/md files', () => {
    const src = readParser();
    expect(src).toMatch(/FileReader/);
    expect(src).toMatch(/readAsText/);
  });

  it('uses fetch for pdf files', () => {
    const src = readParser();
    expect(src).toMatch(/fetch/);
    expect(src).toMatch(/\/api\/ai\/parse-pdf/);
  });

  it('has a size check for max 1MB', () => {
    const src = readParser();
    expect(src).toMatch(/1024\s*\*\s*1024/);
    expect(src).toMatch(/File too large/);
  });

  it('rejects unsupported file types', () => {
    const src = readParser();
    expect(src).toMatch(/Unsupported file type/);
  });
});

describe('parse-pdf route.ts', () => {
  it('imports pdf-parse', () => {
    const src = readPdfRoute();
    expect(src).toMatch(/pdf-parse/);
  });

  it('has an auth check', () => {
    const src = readPdfRoute();
    expect(src).toMatch(/supabase\.auth\.getUser/);
    expect(src).toMatch(/Unauthorized/);
  });

  it('handles FormData with a file field', () => {
    const src = readPdfRoute();
    expect(src).toMatch(/formData/);
    expect(src).toMatch(/instanceof File/);
  });

  it('returns { text: string }', () => {
    const src = readPdfRoute();
    expect(src).toMatch(/text:/);
  });
});

describe('AIInitModal.tsx – drop zone', () => {
  it('has import of parseFile', () => {
    const src = readModal();
    expect(src).toMatch(/file-parser/);
  });

  it('has a drop zone with dashed border', () => {
    const src = readModal();
    expect(src).toMatch(/border-dashed/);
  });

  it('calls preventDefault on dragOver', () => {
    const src = readModal();
    expect(src).toMatch(/onDragOver.*preventDefault/);
  });

  it('has an onDrop handler', () => {
    const src = readModal();
    expect(src).toMatch(/onDrop/);
  });

  it('displays the label Drop .txt, .md, or .pdf', () => {
    const src = readModal();
    expect(src).toMatch(/Drop \.txt, \.md, or \.pdf/);
  });

  it('handles errors from parseFile', () => {
    const src = readModal();
    expect(src).toMatch(/Failed to parse file/);
  });
});
