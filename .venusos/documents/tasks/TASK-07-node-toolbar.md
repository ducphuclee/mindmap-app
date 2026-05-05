# TASK-07: Node Customization — Floating Toolbar

**Source issue:** ISS-07  
**Priority:** P2  
**Status:** done  

## Plan

Add a floating toolbar that appears above a selected node. Controls: background color picker, text color picker, font size selector (S/M/L), bold toggle, italic toggle. Style changes apply instantly to the node data and persist via the existing auto-save mechanism.

## Acceptance Criteria

- [ ] Click a node in the editor → floating toolbar appears positioned near the node
- [ ] Click empty canvas area → floating toolbar disappears
- [ ] With node selected → click background color swatch in toolbar → color picker popover opens
- [ ] Select a color → node background color updates immediately without page reload
- [ ] With node selected → click text color swatch → color picker opens, select color → node text color updates immediately
- [ ] With node selected → click "S" button → node text visually becomes smaller
- [ ] With node selected → click "M" button → node text returns to default size
- [ ] With node selected → click "L" button → node text visually becomes larger
- [ ] With node selected → click "B" button → node text becomes bold, "B" button appears active (highlighted)
- [ ] Click "B" again → node text returns to normal weight, "B" button no longer highlighted
- [ ] With node selected → click "I" button → node text becomes italic
- [ ] Apply a style change → wait 2 seconds → reload page → node retains the customized style

## Scope Files

- `src/components/editor/NodeToolbar.tsx`
- `src/components/editor/ColorPicker.tsx`
- `src/components/editor/FontSizeSelector.tsx`
- `src/components/editor/MindmapNode.tsx` (update to apply style props)

## Out of Scope

- No emoji/icon picker — Phase 2
- No image upload — Phase 2
- No border style controls — Phase 2

## Fixer Guidance

- Use React Flow's built-in `<NodeToolbar />` component — it positions automatically relative to the selected node
- Node data shape extension: `{ label: string, bgColor?: string, textColor?: string, fontSize?: 'sm'|'md'|'lg', bold?: boolean, italic?: boolean }`
- `ColorPicker`: use a simple grid of preset colors (12-16 swatches) — no full HSL picker needed for MVP
- Font size mapping: `sm` → `text-sm`, `md` → `text-base`, `lg` → `text-lg` Tailwind classes
- On style change: call React Flow's `updateNodeData(nodeId, newData)` — auto-save picks up the change automatically
- Toolbar should only render when exactly one node is selected (not multi-select)
