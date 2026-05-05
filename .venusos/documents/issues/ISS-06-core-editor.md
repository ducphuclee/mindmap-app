# ISS-06: Core Mindmap Editor — Canvas & Nodes

**Type:** AFK  
**Severity:** high  
**Domain:** ui  
**Blocked by:** ISS-05  

## What to build

Build the core mindmap editor at `/editor/[id]` using React Flow. The editor provides a full-featured canvas with zoom/pan/minimap, custom rounded node cards with curved edges, and complete node interactions: add child/sibling, inline edit, delete, drag & drop, multi-select, undo/redo. Changes auto-save to Supabase with a debounce of 500ms.

Covers user stories: US 26–41.

## Acceptance criteria

- [ ] Navigate to `/editor/[id]` → canvas renders with at least one root node labeled "Central Idea"
- [ ] Navigate to `/editor/[id]` → editor header shows the mindmap title
- [ ] Scroll mouse wheel on canvas → canvas zooms in and out
- [ ] Click and drag on empty canvas area → canvas pans
- [ ] Minimap panel visible in bottom-right corner showing overview of the mindmap
- [ ] Click "Fit to screen" button → all nodes fit within the viewport
- [ ] Click a node → press Tab → new child node appears connected to the selected node
- [ ] Click a node → press Enter → new sibling node appears at the same level
- [ ] Double-click a node → node text becomes editable inline, type new text, press Enter → node displays new text
- [ ] Click a node → press Delete → node and all its children are removed from canvas
- [ ] Drag a node to a new position → node stays at new position on release
- [ ] Nodes display with rounded corners and drop shadow styling
- [ ] Edges between nodes display as smooth curved lines (not straight)
- [ ] Click one node, then Shift+click another → both nodes are selected (highlighted)
- [ ] Make a change → press Ctrl+Z → change is undone
- [ ] After undo → press Ctrl+Y → change is redone
- [ ] Make a change → wait 1 second → editor header shows "Saved" indicator
- [ ] Make a change → reload page → changes are preserved (auto-save worked)

## Blocked by

- ISS-05
