# TASK-09: Export — PNG & PDF

**Source issue:** ISS-09  
**Priority:** P2  
**Status:** todo  

## Plan

Add export functionality to the editor toolbar. Export the mindmap canvas as PNG using `html-to-image`, and as PDF by embedding the PNG into a PDF via `jsPDF`. Both exports capture all nodes and edges with proper background color and scaling. Write unit tests for ExportService.

## Acceptance Criteria

- [ ] Navigate to `/editor/[id]` → Export button visible in editor toolbar
- [ ] Click Export button → dropdown appears with "Export as PNG" and "Export as PDF" menu items
- [ ] Click "Export as PNG" → browser initiates a file download with `.png` extension within 5 seconds
- [ ] Open the downloaded PNG file → image contains visible nodes and edges (not a blank white image)
- [ ] Click "Export as PDF" → browser initiates a file download with `.pdf` extension within 8 seconds
- [ ] Open the downloaded PDF → first page contains the mindmap image (not blank)
- [ ] While export is in progress → Export button shows a loading/spinner state
- [ ] After export completes → Export button returns to normal state, no error message shown in UI

## Scope Files

- `src/lib/mindmap/export-service.ts`
- `src/lib/mindmap/export-service.test.ts`
- `src/components/editor/ExportMenu.tsx`
- `src/components/editor/EditorToolbar.tsx` (update)

## Out of Scope

- No SVG export — Phase 2
- No custom paper size selection for PDF

## Fixer Guidance

- Install: `html-to-image`, `jspdf`
- `ExportService.exportPNG(element: HTMLElement, filename: string)`: calls `htmlToImage.toPng(element, { backgroundColor: '#ffffff' })`, triggers browser download via anchor tag
- `ExportService.exportPDF(element: HTMLElement, filename: string)`: calls `exportPNG` to get data URL, creates `new jsPDF`, calls `pdf.addImage(dataUrl, 'PNG', ...)`, calls `pdf.save(filename)`
- Target element: the React Flow `.react-flow__viewport` container — use `document.querySelector('.react-flow__viewport')`
- Set `pixelRatio: 2` in html-to-image options for retina quality
- Unit tests: mock `html-to-image` and `jsPDF`, assert correct methods called with expected args
- ExportMenu: simple dropdown with two items, positioned below the Export button
