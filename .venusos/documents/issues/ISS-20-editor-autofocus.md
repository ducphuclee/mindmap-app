# ISS-20: Editor — auto-focus edit on node creation

**Type:** AFK  
**Severity:** medium  
**Blocked by:** None — can start immediately  
**UC:** UC-10

## What to build

Khi user tạo node mới (Add Child, Add Sibling, context menu, Tab key), node tự động vào edit mode ngay sau khi mount — user có thể gõ tên ngay mà không cần double-click.

Cơ chế: thêm `editingNodeId: string | null` state trong `MindmapEditorInner`. Sau khi tạo node mới, set `editingNodeId = newNodeId`. `MindmapNode` nhận signal này (qua `data` prop hoặc React context) và tự enter edit mode + focus input.

Cần dùng `requestAnimationFrame` hoặc `setTimeout(0)` để delay trigger sau React render cycle.

Sau khi edit mode được enter, `editingNodeId` reset về `null`.

Kết quả demo được: click "Add Child" → node mới xuất hiện → input tự động focused + text selected → gõ tên → Enter → saved.

## Acceptance criteria

- [ ] Tạo node mới bằng context menu "Add Child" → node tự động vào edit mode
- [ ] Tạo node mới bằng context menu "Add Sibling" → node tự động vào edit mode
- [ ] Tạo node mới bằng Tab key (nếu có keyboard shortcut) → node tự động vào edit mode
- [ ] Input được auto-focus và text được select-all khi edit mode trigger
- [ ] User có thể gõ ngay lập tức mà không cần thêm interaction
- [ ] Nhấn Enter → commit tên, exit edit mode
- [ ] Nhấn Escape → exit edit mode, node giữ label `'New Node'`
- [ ] Blur (click ra ngoài) → commit tên hiện tại, exit edit mode
- [ ] Nếu user không gõ gì → node giữ label `'New Node'` (không xóa node)
- [ ] `editingNodeId` reset về `null` sau khi edit mode được trigger (không trigger lại lần sau)
- [ ] Double-click rename vẫn hoạt động bình thường (không bị ảnh hưởng)

## Blocked by

None — can start immediately
