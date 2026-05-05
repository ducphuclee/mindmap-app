# ISS-07: Node Customization — Floating Toolbar

**Type:** AFK  
**Severity:** medium  
**Domain:** ui  
**Blocked by:** ISS-06  

## What to build

Add a floating toolbar that appears when a node is selected. The toolbar provides controls for: background color picker, text color picker, font size selector (S/M/L), bold toggle, and italic toggle. Changes apply instantly to the node and are persisted via auto-save.

Covers user stories: US 42–47.

## Acceptance criteria

- [ ] Click a node → floating toolbar appears above/near the node
- [ ] Click away from the node → floating toolbar disappears
- [ ] With node selected → click background color swatch → color picker popover opens
- [ ] Select a color in the color picker → node background color changes immediately
- [ ] With node selected → click text color swatch → color picker opens, select color → node text color changes immediately
- [ ] With node selected → click "S" font size button → node text becomes smaller
- [ ] With node selected → click "M" font size button → node text returns to medium size
- [ ] With node selected → click "L" font size button → node text becomes larger
- [ ] With node selected → click "B" (bold) button → node text becomes bold, button appears active/highlighted
- [ ] Click "B" again → node text returns to normal weight, button no longer active
- [ ] With node selected → click "I" (italic) button → node text becomes italic
- [ ] Make a style change → reload page → node retains the customized style (persisted via auto-save)

## Blocked by

- ISS-06
