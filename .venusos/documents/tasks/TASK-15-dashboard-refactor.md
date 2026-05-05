# TASK-15: Dashboard Refactor — Dialog State Lift + Role-based Context Menu

**Source issue:** ISS-15  
**Priority:** P1  
**Status:** done

## Plan

Refactor `MindmapCard` và `MindmapGrid` để lift dialog state lên grid level và thêm role-based context menu. Đây là foundation refactor mà TASK-16, 17, 18 đều phụ thuộc vào. Sau task này, mỗi dialog chỉ có 1 instance trong DOM và context menu chỉ hiện với owner.

UC-04, UC-05, UC-08.

## Acceptance Criteria

- [ ] `MindmapCard` không còn `showDeleteModal` state
- [ ] `MindmapCard` không còn `isRenaming`, `renameValue`, `renameInputRef` state và inline rename input
- [ ] `MindmapCard` nhận prop `currentUserId: string`
- [ ] `MindmapCard` nhận prop `onDeleteRequest: (id: string) => void`
- [ ] `MindmapCard` nhận prop `onRenameRequest: (id: string) => void`
- [ ] `MindmapCard` nhận props `isStarred: boolean` và `onStarToggle: (id: string) => void` (dùng cho TASK-18, có thể là placeholder)
- [ ] Context menu trong `MindmapCard` chỉ render khi `mindmap.user_id === currentUserId`
- [ ] Khi `currentUserId` undefined hoặc không match → right-click không hiển thị context menu
- [ ] `MindmapGrid` có state `pendingDeleteId: string | null` (init `null`)
- [ ] `MindmapGrid` có state `pendingRenameId: string | null` (init `null`)
- [ ] `MindmapGrid` nhận prop `currentUserId: string`, truyền xuống tất cả `MindmapCard`
- [ ] `MindmapGrid` render `<DeleteConfirmModal>` ở cuối component (1 instance duy nhất), `isOpen={pendingDeleteId !== null}`
- [ ] `MindmapGrid` render `<RenameDialog>` ở cuối component (1 instance duy nhất), `isOpen={pendingRenameId !== null}`
- [ ] `DashboardPage` truyền `user.id` xuống `MindmapGrid` qua prop `currentUserId`
- [ ] Existing: create, duplicate, delete, rename vẫn hoạt động sau refactor
- [ ] Test: `MindmapCard.tsx` không còn chứa `showDeleteModal`
- [ ] Test: `MindmapCard.tsx` chứa `currentUserId` và `isOwner` logic
- [ ] Test: `MindmapGrid.tsx` chứa `pendingDeleteId` và `pendingRenameId`

## Scope Files

- `src/components/dashboard/MindmapCard.tsx`
- `src/components/dashboard/MindmapGrid.tsx`
- `src/app/dashboard/page.tsx`
- `src/components/dashboard/MindmapCard.test.ts` *(tạo mới)*

## Out of Scope

- Không implement `DeleteConfirmModal` với `BaseModal` — đó là TASK-16
- Không implement `RenameDialog` — đó là TASK-17
- Không implement `StarButton` logic — đó là TASK-18 (chỉ thêm props placeholder)
- Không apply dark mode classes
- Không thay đổi editor

## Fixer Guidance

- `DeleteConfirmModal` và `RenameDialog` có thể vẫn là placeholder/stub trong task này — chỉ cần props interface đúng
- `isOwner` check: `const isOwner = currentUserId !== undefined && mindmap.user_id === currentUserId`
- `DashboardPage` là server component, đã có `user` từ `supabase.auth.getUser()` — chỉ thêm `currentUserId={user.id}` vào `MindmapGrid`
- Giữ nguyên `handleDelete`, `handleRename`, `handleDuplicate` trong `MindmapGrid` — chỉ thay đổi cách dialogs được controlled
- UC-04, UC-05, UC-08
