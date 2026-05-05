import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const cardPath = path.resolve(__dirname, 'MindmapCard.tsx');
const gridPath = path.resolve(__dirname, 'MindmapGrid.tsx');

const cardSource = fs.readFileSync(cardPath, 'utf-8');
const gridSource = fs.readFileSync(gridPath, 'utf-8');

describe('MindmapCard', () => {
  it('does not contain showDeleteModal', () => {
    expect(cardSource).not.toContain('showDeleteModal');
  });

  it('contains currentUserId prop', () => {
    expect(cardSource).toContain('currentUserId');
  });

  it('contains isOwner check', () => {
    expect(cardSource).toContain('isOwner');
  });

  it('does not contain isRenaming state', () => {
    expect(cardSource).not.toContain('isRenaming');
  });

  it('does not contain renameValue state', () => {
    expect(cardSource).not.toContain('renameValue');
  });

  it('does not import DeleteConfirmModal', () => {
    expect(cardSource).not.toContain('DeleteConfirmModal');
  });

  it('contains onRenameRequest prop', () => {
    expect(cardSource).toContain('onRenameRequest');
  });

  it('contains onDeleteRequest prop', () => {
    expect(cardSource).toContain('onDeleteRequest');
  });
});

describe('MindmapGrid', () => {
  it('contains pendingDeleteId state', () => {
    expect(gridSource).toContain('pendingDeleteId');
  });

  it('contains pendingRenameId state', () => {
    expect(gridSource).toContain('pendingRenameId');
  });
});
