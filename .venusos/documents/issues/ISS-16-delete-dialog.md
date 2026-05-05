# ISS-16: Delete confirmation dialog (wire BaseModal)

**Type:** AFK  
**Severity:** medium  
**Blocked by:** ISS-15 (Dashboard refactor)  
**UC:** UC-04

## What to build

Refactor `DeleteConfirmModal` để dùng `BaseModal` làm wrapper. Wire vào `MindmapGrid` với state management đã được lift ở ISS-15.

- Refactor `src/components/dashboard/DeleteConfirmModal.tsx` → dùng `BaseModal` với `isDangerous=true`
- Props: `isOpen: boolean`, `title: string`, `onCancel: () => void`, `onConfirm: () => void`
- `MindmapGrid` mở dialog khi `pendingDeleteId !== null`, đóng khi cancel/confirm

Kết quả demo được: right-click → Delete → dialog mở với overlay tối + nút Delete màu đỏ + Escape đóng.

## Acceptance criteria

- [ ] `DeleteConfirmModal` dùng `BaseModal` (không còn custom backdrop/overlay)
- [ ] Dialog có `isDangerous=true` → nút Delete màu đỏ
- [ ] Dialog hiển thị tên mindmap đang bị xóa
- [ ] Nhấn Escape đóng dialog mà không xóa
- [ ] Click backdrop đóng dialog mà không xóa
- [ ] Click "Cancel" đóng dialog, `pendingDeleteId` reset về `null`
- [ ] Click "Delete" → optimistic remove khỏi local state → gọi `deleteMindmap` → dialog đóng
- [ ] Nếu `deleteMindmap` thất bại → rollback (mindmap xuất hiện lại trong grid)
- [ ] Chỉ 1 instance `DeleteConfirmModal` trong DOM tại mọi thời điểm (kiểm tra bằng DOM query)

## Blocked by

- ISS-15 (Dashboard refactor — dialog state phải được lift trước)
