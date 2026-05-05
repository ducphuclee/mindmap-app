# TASK-20: Editor — Auto-focus Edit on Node Creation

**Source issue:** ISS-20  
**Priority:** P2  
**Status:** done

## Plan

Khi user tạo node mới (Add Child, Add Sibling), node tự động vào edit mode ngay sau khi mount. Thêm `editingNodeId` state vào `MindmapEditorInner`, truyền xuống `MindmapNode` qua `data` prop, `MindmapNode` watch và tự enter edit mode.

UC-10.

## Acceptance Criteria

- [x] `MindmapEditorInner` có state `editingNodeId: string | null` (init `null`)
- [x] Sau `addChildToNode`: `setEditingNodeId(childId)` được gọi
- [x] Sau `addSiblingToNode`: `setEditingNodeId(siblingId)` được gọi
- [x] `editingNodeId` được truyền xuống `MindmapNode` qua `data.autoEditId` hoặc tương tự
- [x] `MindmapNode` dùng `useEffect` để detect khi `id === data.autoEditId` → tự enter edit mode
- [x] Trigger edit mode dùng `requestAnimationFrame` hoặc `setTimeout(0)` để đợi DOM mount
- [x] Khi edit mode được trigger → input auto-focus + select-all
- [x] Sau khi enter edit mode → `MindmapEditorInner` reset `editingNodeId` về `null`
- [x] User gõ tên → nhấn Enter → node lưu tên mới, exit edit mode
- [x] User nhấn Escape → node giữ label `'New Node'`, exit edit mode
- [x] User blur (click ra ngoài) → node giữ label hiện tại, exit edit mode
- [x] Double-click rename trên node hiện có vẫn hoạt động bình thường
- [x] `editingNodeId` không trigger lại edit mode nếu user đã exit (vì đã reset về `null`)
- [x] Test: `MindmapEditor.tsx` source chứa `editingNodeId` state
- [x] Test: `addChildToNode` source set `editingNodeId`
- [x] Test: `MindmapNode.tsx` source chứa `autoEdit` logic và `requestAnimationFrame`

## Scope Files

- `src/components/editor/MindmapEditor.tsx`
- `src/components/editor/MindmapNode.tsx`
- `src/components/editor/MindmapEditor.test.ts` *(tạo mới)*

## Out of Scope

- Không thay đổi keyboard shortcuts (`useKeyboardShortcuts.ts`) trừ khi cần wire Tab key
- Không thay đổi `NodeContextMenu`
- Không thay đổi dashboard components

## Fixer Guidance

- `MindmapNodeData` type (trong `src/types/mindmap.ts`) cần thêm optional field `autoEditId?: string` — hoặc truyền qua React context riêng
- Approach đơn giản nhất: thêm `autoEditId?: string` vào `MindmapNodeData`, set vào `data` của new node, `MindmapNode` check `data.autoEditId === id`
- Reset `editingNodeId` sau khi set: có thể dùng `useEffect` trong `MindmapNode` — sau khi enter edit mode, call callback `onEditStarted()` để parent reset
- Hoặc dùng `setTimeout(() => setEditingNodeId(null), 100)` sau `setEditingNodeId(newId)` trong editor
- UC-10
