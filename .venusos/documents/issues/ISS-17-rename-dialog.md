# ISS-17: Rename dialog (new RenameDialog)

**Type:** AFK  
**Severity:** medium  
**Blocked by:** ISS-15 (Dashboard refactor)  
**UC:** UC-05

## What to build

Tạo mới `RenameDialog` component thay thế inline rename trong `MindmapCard`. Dùng `BaseModal` làm wrapper.

- Tạo `src/components/dashboard/RenameDialog.tsx`
- Props: `isOpen: boolean`, `onClose: () => void`, `currentTitle: string`, `onRename: (newTitle: string) => Promise<void>`
- Text input pre-filled với `currentTitle`, auto-focus + select-all khi mở
- Save disabled khi input trống hoặc bằng `currentTitle`
- Enter key submit khi Save enabled
- Loading state khi đang gọi `onRename`
- Wire vào `MindmapGrid` với `pendingRenameId` state

Kết quả demo được: right-click → Rename → dialog mở với tên hiện tại pre-filled, sửa tên, Enter → card cập nhật tên mới.

## Acceptance criteria

- [ ] `RenameDialog` dùng `BaseModal` làm wrapper
- [ ] Input pre-filled với `currentTitle` mỗi khi dialog mở
- [ ] Input auto-focus và select-all khi dialog mở
- [ ] Nút Save disabled khi `trimmed input === currentTitle` hoặc `trimmed input === ''`
- [ ] Nhấn Enter khi Save enabled → submit rename
- [ ] Nhấn Escape → đóng dialog, tên không đổi
- [ ] Click "Cancel" → đóng dialog, tên không đổi
- [ ] `isLoading=true` trong BaseModal khi đang gọi `onRename` (nút Save disabled + spinner)
- [ ] Sau khi rename thành công → dialog đóng, card hiển thị tên mới (optimistic update)
- [ ] `MindmapCard` không còn inline rename input
- [ ] Chỉ 1 instance `RenameDialog` trong DOM

## Blocked by

- ISS-15 (Dashboard refactor)
