# TASK-16: Delete Confirmation Dialog — Wire BaseModal

**Source issue:** ISS-16  
**Priority:** P2  
**Status:** done

## Plan

Refactor `DeleteConfirmModal` để dùng `BaseModal` làm wrapper thay vì custom backdrop/overlay. Wire hoàn chỉnh với `MindmapGrid` state `pendingDeleteId` từ TASK-15. Sau task này, delete flow hoàn chỉnh từ right-click → dialog → confirm/cancel.

UC-04.

## Acceptance Criteria

- [ ] `DeleteConfirmModal` import và dùng `BaseModal` từ `@/components/common/BaseModal`
- [ ] `DeleteConfirmModal` không còn custom backdrop `div` hay `fixed inset-0` overlay riêng
- [ ] `DeleteConfirmModal` truyền `isDangerous={true}` vào `BaseModal`
- [ ] `DeleteConfirmModal` nhận props: `isOpen: boolean`, `title: string`, `onCancel: () => void`, `onConfirm: () => void`
- [ ] Dialog hiển thị tên mindmap (từ prop `title`) trong body text
- [ ] Nhấn Escape → `onCancel` được gọi, dialog đóng
- [ ] Click backdrop → `onCancel` được gọi, dialog đóng
- [ ] Click "Cancel" button → `onCancel` được gọi
- [ ] Click "Delete" button → `onConfirm` được gọi → optimistic remove + `deleteMindmap` được gọi
- [ ] Nếu `deleteMindmap` throw error → mindmap xuất hiện lại trong grid (rollback)
- [ ] Sau cancel hoặc confirm → `pendingDeleteId` reset về `null` trong `MindmapGrid`
- [ ] Chỉ 1 `DeleteConfirmModal` instance trong DOM tại mọi thời điểm
- [ ] Test: `DeleteConfirmModal.tsx` import `BaseModal`
- [ ] Test: `DeleteConfirmModal.tsx` có `isDangerous` được pass

## Scope Files

- `src/components/dashboard/DeleteConfirmModal.tsx`
- `src/components/dashboard/MindmapGrid.tsx` *(wire `handleDelete` với rollback)*
- `src/components/dashboard/DeleteConfirmModal.test.ts` *(tạo mới)*

## Out of Scope

- Không thay đổi `BaseModal` component
- Không thay đổi `MindmapCard`
- Không implement `RenameDialog` — đó là TASK-17

## Fixer Guidance

- `DeleteConfirmModal` mới sẽ rất ngắn — chỉ là thin wrapper around `BaseModal` với message body
- Rollback pattern: trong `handleDelete` của `MindmapGrid`, snapshot state trước khi optimistic remove, restore nếu `deleteMindmap` throw
- Submit label của BaseModal: `"Delete"` (BaseModal sẽ render button này với `bg-red-600` do `isDangerous=true`)
- UC-04
