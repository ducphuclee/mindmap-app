# TASK-17: Rename Dialog — New RenameDialog Component

**Source issue:** ISS-17  
**Priority:** P2  
**Status:** done

## Plan

Tạo `RenameDialog` mới dùng `BaseModal`, thay thế hoàn toàn inline rename trong `MindmapCard` (đã bị xóa ở TASK-15). Wire với `pendingRenameId` state trong `MindmapGrid`. Sau task này, rename flow hoàn chỉnh: right-click → dialog với tên pre-filled → sửa → Save/Enter.

UC-05.

## Acceptance Criteria

- [ ] `RenameDialog` tồn tại tại `src/components/dashboard/RenameDialog.tsx`
- [ ] `RenameDialog` import và dùng `BaseModal`
- [ ] Props: `isOpen: boolean`, `onClose: () => void`, `currentTitle: string`, `onRename: (newTitle: string) => Promise<void>`
- [ ] Input được pre-filled với `currentTitle` mỗi khi `isOpen` chuyển từ false → true
- [ ] Input được auto-focus khi dialog mở
- [ ] Input text được select-all khi dialog mở
- [ ] Nút Save disabled khi `input.trim() === currentTitle`
- [ ] Nút Save disabled khi `input.trim() === ''`
- [ ] Nút Save enabled khi `input.trim() !== currentTitle && input.trim() !== ''`
- [ ] Nhấn Enter khi Save enabled → gọi `onRename(input.trim())`
- [ ] Nhấn Enter khi Save disabled → không có tác dụng
- [ ] Nhấn Escape → `onClose` được gọi, tên không đổi
- [ ] Click "Cancel" → `onClose` được gọi, tên không đổi
- [ ] Trong khi `onRename` đang chạy → `isLoading=true` trong `BaseModal` (Save disabled + spinner)
- [ ] Sau `onRename` resolve → dialog đóng, card hiển thị tên mới (optimistic update trong `MindmapGrid`)
- [ ] `MindmapCard` không còn inline rename input (kiểm tra source không có `isRenaming`)
- [ ] Test: `RenameDialog.tsx` tồn tại và import `BaseModal`
- [ ] Test: source chứa `currentTitle` prop và `trim()` validation

## Scope Files

- `src/components/dashboard/RenameDialog.tsx` *(tạo mới)*
- `src/components/dashboard/MindmapGrid.tsx` *(wire `handleRename` với RenameDialog)*
- `src/components/dashboard/RenameDialog.test.ts` *(tạo mới)*

## Out of Scope

- Không thay đổi `BaseModal`
- Không thay đổi `DeleteConfirmModal`
- Không apply dark mode classes

## Fixer Guidance

- Input reset pattern: dùng `useEffect(() => { if (isOpen) setInput(currentTitle) }, [isOpen, currentTitle])` để pre-fill mỗi khi dialog mở
- Auto-focus: dùng `useEffect` với `inputRef.current?.focus()` + `inputRef.current?.select()` khi `isOpen=true`
- `isLoading` pattern: local `loading` state, set true khi call `onRename`, set false khi resolve/reject
- Truyền `isLoading` xuống `BaseModal` để disable Submit button
- UC-05
