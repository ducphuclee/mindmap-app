# ISS-15: Dashboard refactor — dialog state lift + role-based context menu

**Type:** AFK  
**Severity:** high  
**Blocked by:** ISS-13 (BaseModal)  
**UC:** UC-04, UC-05, UC-08

## What to build

Refactor `MindmapCard` và `MindmapGrid` để chuẩn bị foundation cho tất cả dashboard features tiếp theo:

**MindmapCard:**
- Xóa internal state: `showDeleteModal`, `isRenaming`, `renameValue`, `renameInputRef`
- Thêm props: `currentUserId: string`, `isStarred: boolean`, `onStarToggle`, `onDeleteRequest: (id: string) => void`, `onRenameRequest: (id: string) => void`
- Role check: `isOwner = mindmap.user_id === currentUserId`
- Context menu chỉ render khi `isOwner === true`

**MindmapGrid:**
- Thêm state: `pendingDeleteId: string | null`, `pendingRenameId: string | null`
- Nhận `currentUserId: string` từ `DashboardPage` (server component đã có `user.id`)
- Truyền `currentUserId` + callbacks xuống `MindmapCard`
- Render 1 `DeleteConfirmModal` instance duy nhất ở cuối (controlled bởi `pendingDeleteId`)
- Render 1 `RenameDialog` instance duy nhất ở cuối (controlled bởi `pendingRenameId`)

Kết quả demo được: right-click card → menu xuất hiện → chọn Delete → 1 dialog duy nhất mở (không phải per-card). Owner thấy menu, non-owner không thấy.

## Acceptance criteria

- [ ] `MindmapCard` không còn `showDeleteModal` hay `isRenaming` state
- [ ] `MindmapCard` nhận và sử dụng `currentUserId` prop để tính `isOwner`
- [ ] Context menu chỉ render khi `isOwner === true`
- [ ] `isOwner === false` hoặc `currentUserId` undefined → context menu không xuất hiện khi right-click
- [ ] `MindmapGrid` quản lý `pendingDeleteId` và `pendingRenameId` state
- [ ] `MindmapGrid` nhận `currentUserId: string` prop, truyền xuống tất cả cards
- [ ] `DashboardPage` truyền `user.id` xuống `MindmapGrid` qua prop `currentUserId`
- [ ] Tại mọi thời điểm chỉ có 1 `DeleteConfirmModal` và 1 `RenameDialog` trong DOM
- [ ] Existing functionality không bị regression: create, duplicate, delete, rename vẫn hoạt động

## Blocked by

- ISS-13 (BaseModal phải tồn tại trước khi wire dialogs)
