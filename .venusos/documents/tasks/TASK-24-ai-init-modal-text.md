# TASK-24: AI Init Modal (Text Paste)

**Source issue:** ISS-24  
**Priority:** P1  
**Status:** done

## Plan

Tạo `AIInitModal` component và wire vào `MindmapEditor`. Modal tự động hiển thị khi editor mở với map rỗng (chỉ có root node "Central Idea"). User paste/gõ text vào textarea → submit → gọi `/api/ai/generate` → apply `MindmapData` lên canvas + push undo snapshot. Issue này chỉ text input, chưa có file drop.

US #4–10.

## Acceptance Criteria

- [x] `AIInitModal` tồn tại tại `src/components/editor/AIInitModal.tsx`, là `'use client'` component
- [x] Modal render với: textarea (placeholder gợi ý), nút "Close", nút "Submit"
- [x] `MindmapEditor` tự động hiển thị modal khi `nodes.length === 1 && nodes[0].data.label === 'Central Idea'`
- [x] Click "Close" → modal đóng (`isOpen=false`), canvas không thay đổi
- [x] Nút "Submit" bị `disabled` khi textarea trống hoặc chỉ có whitespace
- [x] Submit với text hợp lệ → `isLoading=true`, gọi `POST /api/ai/generate` với `{ text }`
- [x] Khi API trả về `{ data: MindmapData }` → modal đóng, `setNodes`/`setEdges` được gọi với data mới
- [x] Sau khi apply data → `pushSnapshot({ nodes, edges })` được gọi đúng 1 lần
- [x] Error từ API → error message hiển thị trong modal, modal không đóng, `isLoading=false`
- [x] Test: `AIInitModal.tsx` source chứa textarea, loading state, error state
- [x] Test: `AIInitModal.tsx` source chứa `onApply` hoặc tương đương callback
- [x] Test: `MindmapEditor.tsx` source chứa `AIInitModal` import và conditional render

## Scope Files

- `src/components/editor/AIInitModal.tsx` *(tạo mới)*
- `src/components/editor/MindmapEditor.tsx` *(thêm AIInitModal)*
- `src/components/editor/AIInitModal.test.ts` *(tạo mới)*

## Out of Scope

- Không implement file drop zone — đó là TASK-25
- Không thay đổi `/api/ai/generate` route
- Không apply dark mode classes
- Không thay đổi EditorToolbar hoặc EditorHeader

## Fixer Guidance

- `AIInitModal` nhận props: `isOpen: boolean`, `onClose: () => void`, `onApply: (data: MindmapData) => void`
- Condition check trong `MindmapEditorInner`: `const showAIModal = nodes.length === 1 && nodes[0].data.label === 'Central Idea' && nodes[0].id === 'root'`
- `onApply` callback trong `MindmapEditorInner` gọi `setNodes(data.nodes)`, `setEdges(data.edges)`, `pushSnapshot(...)` — tương tự pattern của `createHubNode()`
- Test pattern: `fs.readFileSync` inspect source (xem `BaseModal.test.ts`)
