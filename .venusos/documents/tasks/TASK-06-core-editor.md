# TASK-06: Core Mindmap Editor — Canvas & Node Interactions

**Source issue:** ISS-06  
**Priority:** P0  
**Status:** todo  

## Plan

Build the core mindmap editor at `/editor/[id]` using React Flow. Features: interactive canvas with zoom/pan/minimap, custom rounded MindmapNode cards with curved edges, full node interactions (add child/sibling, inline edit, delete subtree, drag & drop, multi-select, undo/redo), and auto-save to Supabase with 500ms debounce.

## Acceptance Criteria

- [ ] Navigate to `/editor/[id]` → canvas renders with a root node labeled "Central Idea"
- [ ] Navigate to `/editor/[id]` → editor header shows the mindmap's title
- [ ] Scroll mouse wheel on canvas → canvas zooms in and out smoothly
- [ ] Click and drag on empty canvas → canvas pans
- [ ] Minimap panel visible in bottom-right corner of the editor
- [ ] Click "Fit to screen" button in toolbar → all nodes fit within the viewport
- [ ] Click a node → press Tab → new child node appears connected to selected node
- [ ] Click a node → press Enter → new sibling node appears at the same level
- [ ] Double-click a node → node text becomes an editable input; type new text, press Enter → node shows updated text
- [ ] Click a node → press Delete → node and all its descendant nodes are removed
- [ ] Drag a node to a new position → node stays at new position after mouse release
- [ ] Nodes render with rounded corners and drop shadow (not plain rectangles)
- [ ] Edges between nodes render as smooth curved lines (not straight)
- [ ] Click node A, then Shift+click node B → both nodes highlighted as selected
- [ ] Make any change → press Ctrl+Z → change is undone (previous state restored)
- [ ] After undo → press Ctrl+Y → change is redone
- [ ] Make a change → wait 2 seconds → editor header shows "Saved ✓" indicator
- [ ] Make a change → reload page → changes are still present (auto-save persisted to DB)

## Scope Files

- `src/app/(protected)/editor/[id]/page.tsx`
- `src/components/editor/MindmapEditor.tsx`
- `src/components/editor/MindmapNode.tsx`
- `src/components/editor/EditorHeader.tsx`
- `src/components/editor/EditorToolbar.tsx`
- `src/hooks/useAutoSave.ts`
- `src/hooks/useUndoRedo.ts`
- `src/hooks/useKeyboardShortcuts.ts`
- `src/lib/mindmap/repository.ts`

## Out of Scope

- No node styling toolbar — that is TASK-07
- No layout switching — that is TASK-08
- No export — that is TASK-09
- No share — that is TASK-10

## Fixer Guidance

- Install: `reactflow` (or `@xyflow/react` for v12+)
- Custom node: `MindmapNode` registered in `nodeTypes` prop — renders a `div` with `rounded-xl shadow-md` classes, editable text on double-click
- Edge type: use `smoothstep` or `bezier` edge type for curved connections
- Auto-save: `useAutoSave` hook wraps `useEffect` with `lodash.debounce` (500ms) on nodes/edges changes
- Undo/redo: `useUndoRedo` hook maintains a history stack of `{ nodes, edges }` snapshots; max 50 entries
- Add child (Tab): find selected node, create new node with `parentId`, connect with edge
- Delete subtree: BFS/DFS from deleted node to find all descendants, remove all from state
- "Saved" indicator: show "Saving..." on change, switch to "Saved ✓" after successful DB write
- Load mindmap: fetch via `MindmapRepository.findById(id)` in server component, pass data as prop
- `reactflow` requires `"use client"` — wrap editor in a client component
