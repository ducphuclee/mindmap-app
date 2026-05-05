# TASK-26: Expand API + Node Hover Expand Button

**Source issue:** ISS-26  
**Priority:** P1  
**Status:** done

## Plan

Thêm `⚡ Expand` button vào hover overlay của mỗi node. Click → gọi `/api/ai/expand` → AI generate child nodes liên quan → `applyDiff` lên canvas + `pushSnapshot`. Hover overlay phải không can thiệp vào React Flow drag/select behavior.

US #11–13, 16.

## Acceptance Criteria

- [ ] `src/lib/ai/mindmap-ai.ts` export `expandNode(nodeId: string, nodeLabel: string, context: MindmapData): Promise<MindmapDiff>`
- [ ] `expandNode` gọi GPT-4o với prompt yêu cầu generate 3–5 child nodes liên quan, trả về `MindmapDiff` với `add_node` + `add_edge` ops
- [ ] `POST /api/ai/expand` tại `src/app/api/ai/expand/route.ts`
- [ ] Route check Supabase auth → 401 nếu chưa login
- [ ] Route nhận `{ nodeId, nodeLabel, context: MindmapData }` → trả `{ diff: MindmapDiff }`
- [ ] `MindmapNode` component hiển thị `⚡ Expand` button khi `isHovered=true`, ẩn khi `false`
- [ ] `MindmapNode` nhận prop `onExpand: (nodeId: string) => void` từ `MindmapEditorInner`
- [ ] Click `⚡ Expand` → gọi `onExpand(id)` — không trigger node selection hay drag
- [ ] `MindmapEditorInner` có `handleExpandNode(nodeId)`: gọi API → nhận diff → `applyDiff` → `pushSnapshot`
- [ ] Trong lúc expand đang loading → button hiển thị loading state (spinner hoặc disabled)
- [ ] Error từ API → button trở về trạng thái bình thường, không crash editor
- [ ] Test: `mindmap-ai.ts` source chứa `expandNode` function và `gpt-4o`
- [ ] Test: `expand/route.ts` source chứa auth check và MindmapDiff response
- [ ] Test: `MindmapNode.tsx` source chứa `onExpand` prop và hover state
- [ ] Test: `MindmapEditor.tsx` source chứa `handleExpandNode` và `applyDiff` call

## Scope Files

- `src/lib/ai/mindmap-ai.ts` *(thêm `expandNode`)*
- `src/app/api/ai/expand/route.ts` *(tạo mới)*
- `src/components/editor/MindmapNode.tsx` *(thêm hover overlay)*
- `src/components/editor/MindmapEditor.tsx` *(thêm handleExpandNode)*
- `src/lib/ai/mindmap-ai.test.ts` *(update)*

## Out of Scope

- Không implement `chatCommand()` — đó là TASK-27
- Không implement `💬 Send to chat` button — đó là TASK-28
- Không thay đổi EditorToolbar
- Không apply dark mode

## Fixer Guidance

- Hover state trong `MindmapNode`: dùng `onMouseEnter`/`onMouseLeave` với local `isHovered` state. Đặt `nodrag` class trên overlay div để React Flow không trigger drag
- `applyDiff` import từ `src/lib/ai/apply-diff.ts` (TASK-22)
- `handleExpandNode` trong `MindmapEditorInner` nhận `nodeId`, tìm node, gọi API với context `{ nodes, edges }`, apply diff tương tự pattern của `addChildToNode`
- Test pattern: `fs.readFileSync` inspect source (xem `EditorToolbar.test.ts`)
