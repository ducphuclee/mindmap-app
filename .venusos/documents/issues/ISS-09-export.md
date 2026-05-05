# ISS-09: Export — PNG & PDF

**Type:** AFK  
**Severity:** medium  
**Domain:** ui  
**Blocked by:** ISS-06  

## What to build

Add export functionality to the editor toolbar: export the current mindmap as PNG or PDF. PNG uses `html-to-image` to capture the React Flow canvas. PDF embeds the PNG into a PDF document via `jsPDF`. Both exports include all visible nodes and edges, with proper background color and scaling.

Covers user stories: US 53–54.

## Acceptance criteria

- [ ] Navigate to `/editor/[id]` → Export button visible in editor toolbar
- [ ] Click Export button → dropdown appears with "Export as PNG" and "Export as PDF" options
- [ ] Click "Export as PNG" → browser downloads a `.png` file within 3 seconds
- [ ] Open the downloaded PNG → file contains the mindmap with all nodes and edges visible (not blank)
- [ ] Click "Export as PDF" → browser downloads a `.pdf` file within 5 seconds
- [ ] Open the downloaded PDF → file contains the mindmap image on the first page (not blank)
- [ ] During export → button shows a loading indicator
- [ ] After export completes → button returns to normal state, no error messages shown

## Blocked by

- ISS-06
