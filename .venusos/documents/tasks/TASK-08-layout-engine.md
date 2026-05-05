# TASK-08: Layout Engine — Radial + Tree Layouts

**Source issue:** ISS-08  
**Priority:** P2  
**Status:** todo  

## Plan

Implement three auto-layout algorithms as a pure `applyLayout(nodes, edges, type)` function. Layouts: Mind Map radial (root centered, branches radiate outward), Tree top-down (dagre), Tree left-right (dagre). Add a layout switcher to the editor toolbar. Switching animates node positions. Write unit tests for the layout engine.

## Acceptance Criteria

- [ ] Navigate to `/editor/[id]` → layout switcher visible in editor toolbar with 3 options labeled "Mind Map", "Tree ↓", "Tree →"
- [ ] Click "Mind Map" → root node moves to center, child nodes spread outward in a radial pattern
- [ ] Click "Tree ↓" → root node appears at top of canvas, descendants arranged in top-down tree
- [ ] Click "Tree →" → root node appears at left, descendants arranged left-to-right
- [ ] Switch between any two layouts → nodes animate smoothly to new positions (not instant jump)
- [ ] After applying any layout → no two nodes visually overlap each other
- [ ] After applying any layout → all edges remain connected to their correct source and target nodes
- [ ] Reload page after applying a layout → the most recently applied layout is restored

## Scope Files

- `src/lib/mindmap/layout-engine.ts`
- `src/lib/mindmap/layout-engine.test.ts`
- `src/components/editor/LayoutSwitcher.tsx`
- `src/components/editor/MindmapEditor.tsx` (update to apply layout)

## Out of Scope

- No Fishbone, Timeline, or Org Chart layouts — Phase 2
- No per-node manual position locking

## Fixer Guidance

- Install: `@dagrejs/dagre` for tree layouts
- `applyLayout(nodes, edges, type)` is a pure function — no side effects, returns new `Node[]` with updated `position` fields
- Radial layout: place root at `{x:0, y:0}`, distribute children evenly around a circle (radius = 200px per level), recurse for sub-trees
- Tree layouts: use `dagre.graphlib.Graph`, set `rankdir: 'TB'` for top-down, `rankdir: 'LR'` for left-right
- Animation: use React Flow's `useReactFlow().setNodes()` with `fitView` — React Flow animates position changes when `panOnDrag` transitions are enabled; alternatively use `layouted` flag with CSS transition
- Persist layout type: store in mindmap `data` JSONB as `{ nodes, edges, layoutType }`
- Unit tests in `layout-engine.test.ts` using Vitest: test radial places root at center, tree-td root has lowest Y, tree-lr root has lowest X, single node returns unchanged position
