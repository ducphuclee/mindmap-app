# ISS-13: BaseModal shared component

**Type:** AFK  
**Severity:** high  
**Blocked by:** None — can start immediately  
**UC:** UC-09

## What to build

Tạo `BaseModal` — shared accessible modal wrapper dùng `@headlessui/react Dialog`. Đây là foundation component mà tất cả dialogs trong app sẽ extend.

Install `@headlessui/react`. Tạo `src/components/common/BaseModal.tsx` với props:
- `isOpen: boolean`
- `onClose: () => void`
- `title: string`
- `description?: string`
- `submitLabel?: string`
- `onSubmit?: () => void`
- `isDangerous?: boolean`
- `isLoading?: boolean`
- `children?: ReactNode`

Kết quả demo được: render `<BaseModal isOpen title="Test" onClose={...} />` → dialog xuất hiện với overlay, Escape đóng, click backdrop đóng.

## Acceptance criteria

- [ ] `@headlessui/react` được thêm vào `package.json`
- [ ] `BaseModal` render children khi `isOpen=true`, không render (hoặc unmount) khi `isOpen=false`
- [ ] Backdrop overlay tối (bg-black/50) khi dialog mở
- [ ] Focus trap hoạt động: Tab key chỉ di chuyển trong dialog khi mở
- [ ] Nhấn Escape gọi `onClose`
- [ ] Click backdrop gọi `onClose`
- [ ] `isDangerous=true` → Submit button màu đỏ (`bg-red-600`)
- [ ] `isDangerous=false` (default) → Submit button màu xanh (`bg-blue-600`)
- [ ] `isLoading=true` → Submit button disabled + hiển thị loading spinner
- [ ] Nếu không truyền `onSubmit` → không render Submit button
- [ ] Transition animation: fade backdrop + scale-up panel khi open/close
- [ ] Tests cho `BaseModal`: render/hide, Escape, backdrop click, dangerous variant, loading state, onSubmit call

## Blocked by

None — can start immediately
