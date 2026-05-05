# TASK-13: BaseModal Shared Component

**Source issue:** ISS-13  
**Priority:** P1  
**Status:** done

## Plan

Install `@headlessui/react` và tạo `BaseModal` — shared accessible dialog wrapper. Tất cả dialogs trong app (DeleteConfirmModal, RenameDialog, v.v.) sẽ dùng component này làm wrapper thay vì tự tạo backdrop/overlay. BaseModal encapsulates focus trap, Escape key, ARIA attributes, và transition animation.

UC-09.

## Acceptance Criteria

- [ ] `@headlessui/react` có trong `package.json` dependencies
- [ ] `BaseModal` export default từ `src/components/common/BaseModal.tsx`
- [ ] `BaseModal` nhận props: `isOpen`, `onClose`, `title`, `description?`, `submitLabel?`, `onSubmit?`, `isDangerous?`, `isLoading?`, `children?`
- [ ] Khi `isOpen=false`: dialog không render (hoặc unmounted) — không tìm thấy trong DOM
- [ ] Khi `isOpen=true`: dialog render với backdrop overlay (`bg-black/50`) và panel trắng/tối
- [ ] Nhấn Escape khi dialog mở → `onClose` được gọi
- [ ] Click backdrop khi dialog mở → `onClose` được gọi
- [ ] Tab key khi dialog mở → focus chỉ di chuyển trong dialog (focus trap)
- [ ] Khi `onSubmit` không được truyền → không render Submit button
- [ ] Khi `isDangerous=false` hoặc undefined → Submit button có class `bg-blue-600`
- [ ] Khi `isDangerous=true` → Submit button có class `bg-red-600`
- [ ] Khi `isLoading=true` → Submit button có attribute `disabled` và hiển thị spinner/loading text
- [ ] Click Submit button → `onSubmit` được gọi
- [ ] `children` được render trong phần body của dialog
- [ ] Test: BaseModal.tsx tồn tại và export default
- [ ] Test: source chứa `isDangerous` prop và conditional `bg-red` class
- [ ] Test: source chứa `isLoading` prop và `disabled` attribute
- [ ] Test: source dùng `@headlessui/react` Dialog

## Scope Files

- `src/components/common/BaseModal.tsx` *(tạo mới)*
- `src/components/common/BaseModal.test.ts` *(tạo mới)*
- `package.json`
- `package-lock.json`

## Out of Scope

- Không thay đổi `DeleteConfirmModal` — đó là TASK-16
- Không tạo `RenameDialog` — đó là TASK-17
- Không apply dark mode classes — đó là TASK-19

## Fixer Guidance

- Install: `npm install @headlessui/react`
- Dùng `<Dialog>` từ `@headlessui/react` — tự động handle focus trap và ARIA
- Transition: dùng `<Transition>` hoặc `<Dialog>` built-in `transition` prop (headlessui v2)
- Pattern transition: backdrop fade + panel scale-up (`transition-opacity`, `scale-95` → `scale-100`)
- Test pattern: `fs.readFileSync` inspect source, không cần render (xem `NodeContextMenu.test.ts`)
- UC-09
