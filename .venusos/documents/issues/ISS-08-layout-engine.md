# ISS-08: Layout Engine (Radial + Tree ×2)

**Type:** AFK  
**Severity:** medium  
**Domain:** ui  
**Blocked by:** ISS-06  

## What to build

Implement three auto-layout algorithms and a layout switcher in the editor toolbar. Layouts: Mind Map radial (root centered, branches spread outward), Tree top-down (root at top), Tree left-right (root at left). Switching layout animates node positions smoothly. Implemented as a pure `applyLayout(nodes, edges, type)` function using the `dagre` library for tree layouts and a custom radial algorithm.

Covers user stories: US 48–52.

## Acceptance criteria

- [ ] Navigate to `/editor/[id]` → layout switcher visible in editor toolbar with 3 options: "Mind Map", "Tree (↓)", "Tree (→)"
- [ ] Click "Mind Map" → root node moves to center of canvas, child nodes spread outward radially
- [ ] Click "Tree (↓)" → root node appears at top, child nodes arranged below in a top-down tree
- [ ] Click "Tree (→)" → root node appears at left, child nodes arranged to the right
- [ ] Switch between any two layouts → nodes animate smoothly to new positions (no instant jump)
- [ ] After applying a layout → nodes do not overlap each other
- [ ] After applying a layout → all edges remain connected to correct nodes
- [ ] Add a new child node → nodes reposition to accommodate the new node in current layout
- [ ] Reload page → previously applied layout is restored

## Blocked by

- ISS-06
