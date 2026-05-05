# PRD: UI/UX Improvements — Học hỏi từ wisemapping-frontend

**Status:** Draft  
**Date:** 2026-05-05  
**Author:** PM + brainstorming session

---

## Problem Statement

Người dùng dashboard hiện tại gặp một số vấn đề UX:

1. **DOM bloat:** Mỗi `MindmapCard` render một `DeleteConfirmModal` instance riêng — nếu có 20 cards thì có 20 modal instances trong DOM dù chỉ 1 cái visible tại một thời điểm.
2. **Rename UX kém:** Rename bằng inline input gây confusion (click outside submit không rõ ràng, không có validation, không có loading state).
3. **Không có loading state:** Khi data đang tải, dashboard hiển thị trống — gây layout shift và cảm giác app bị lag.
4. **Không có dark mode:** Toàn bộ UI hardcode màu sáng, không respect system/user preference.
5. **Không có starred/filter:** Người dùng không thể đánh dấu mindmap quan trọng hay lọc theo nhóm.
6. **Không có role-based UI:** Mọi card đều hiển thị đầy đủ context menu (Rename, Duplicate, Delete) dù user có thể không phải owner.

---

## Solution

Refactor dashboard và nền tảng component theo 7 cải tiến học hỏi từ wisemapping-frontend:

1. **BaseModal** — shared accessible modal wrapper dùng `@headlessui/react`, tái sử dụng cho tất cả dialogs.
2. **Dialog state lift** — lift `showDeleteModal` và `isRenaming` lên `MindmapGrid`, chỉ render 1 instance mỗi dialog.
3. **RenameDialog** — chuyển rename từ inline input sang dialog có validation.
4. **Skeleton loading** — render 8 skeleton cards với `animate-pulse` khi data chưa về.
5. **Dark mode** — Tailwind `class` strategy, toggle ở dashboard header, persist localStorage.
6. **Starred + filter tabs** — user đánh dấu starred với localStorage, lọc bằng tabs (All / Starred).
7. **Role-based context menu** — ẩn/hiện menu items dựa trên `user_id` so sánh với `mindmap.user_id`.

---

## User Stories

### Dark Mode
1. Là người dùng dashboard, tôi muốn toggle dark/light mode bằng một nút ở header, để tôi có thể làm việc thoải mái trong môi trường ánh sáng yếu.
2. Là người dùng, tôi muốn preference dark/light được nhớ sau khi tôi đóng trình duyệt, để tôi không phải set lại mỗi lần vào app.
3. Là người dùng, tôi muốn toàn bộ dashboard (cards, modals, header, input) hiển thị đúng dark theme, không bị flash màu trắng khi load.

### Skeleton Loading
4. Là người dùng, tôi muốn thấy skeleton cards trong khi dashboard đang tải data, để tôi biết app đang hoạt động bình thường chứ không bị trống.
5. Là người dùng, tôi muốn skeleton có animation nhẹ nhàng, để trải nghiệm chờ cảm thấy mượt mà.

### BaseModal & Dialog Refactor
6. Là người dùng, tôi muốn dialog xóa mindmap có overlay tối phía sau, nhấn Escape để đóng, và nút Delete màu đỏ để tôi nhận ra đây là action nguy hiểm.
7. Là người dùng, tôi muốn tất cả dialogs có UX nhất quán (cùng animation, cùng layout, cùng keyboard behavior), để tôi không bị bỡ ngỡ khi dùng các dialogs khác nhau.
8. Là developer, tôi muốn có một `BaseModal` component tái sử dụng với props rõ ràng, để tôi không phải viết lại backdrop/ARIA/keyboard logic cho từng dialog mới.

### Rename Dialog
9. Là người dùng, tôi muốn rename mindmap qua một dialog với input field rõ ràng, thay vì inline editing dễ nhầm lẫn, để tôi kiểm soát được khi nào thay đổi được lưu.
10. Là người dùng, tôi muốn dialog rename pre-fill tên hiện tại của mindmap, để tôi chỉ cần sửa phần cần thay đổi.
11. Là người dùng, tôi muốn nút Save bị disable nếu input trống hoặc không thay đổi so với tên gốc, để tránh lưu giá trị vô nghĩa.
12. Là người dùng, tôi muốn nhấn Enter để submit rename dialog, để thao tác nhanh hơn.
13. Là người dùng, tôi muốn nhấn Escape để cancel rename dialog mà không lưu thay đổi.

### Starred & Filter Tabs
14. Là người dùng, tôi muốn star/unstar một mindmap bằng cách click icon ngôi sao trên card, để đánh dấu những mindmap quan trọng.
15. Là người dùng, tôi muốn icon ngôi sao hiện ra khi tôi hover qua card, và luôn hiển thị nếu đã starred, để UI không bị cluttered.
16. Là người dùng, tôi muốn filter tabs "All" và "Starred" phía trên grid, để tôi nhanh chóng xem chỉ những mindmap đã starred.
17. Là người dùng, tôi muốn trạng thái starred được nhớ sau khi refresh trang (persist localStorage), để danh sách không bị reset.
18. Là người dùng, tôi muốn tab "Starred" hiển thị empty state riêng khi chưa có mindmap nào được starred, để tôi hiểu tính năng này hoạt động như thế nào.
19. Là người dùng, tôi muốn filter "Starred" kết hợp được với search bar, để tôi tìm trong starred mindmaps.
20. Là người dùng, tôi muốn filter tabs hoạt động cùng với sort dropdown hiện tại, để tôi có thể sort starred mindmaps theo thứ tự tôi muốn.

### Role-based Context Menu
21. Là người dùng là owner của mindmap, tôi muốn thấy đầy đủ context menu (Rename, Duplicate, Delete), để tôi quản lý mindmap của mình.
22. Là người dùng không phải owner (viewer), tôi muốn context menu bị ẩn hoàn toàn hoặc chỉ hiện các actions read-only, để tôi không vô tình thao tác trên mindmap của người khác.
23. Là developer, tôi muốn role check được implement theo cách dễ mở rộng (dùng `user_id` so sánh trước, sau thêm `role` field khi có collaboration), để không phải refactor lại khi mở rộng permission system.

---

## Implementation Decisions

### Dependency mới
- Thêm `@headlessui/react` — accessible dialog, menu primitives, tích hợp tốt với Tailwind.

### Module: `BaseModal`
- Props: `isOpen: boolean`, `onClose: () => void`, `title: string`, `description?: string`, `submitLabel?: string`, `onSubmit?: () => void`, `isDangerous?: boolean`, `isLoading?: boolean`, `children?: ReactNode`
- Dùng `@headlessui/react Dialog` cho accessibility (focus trap, ARIA, Escape key)
- `isDangerous=true` → Submit button màu đỏ
- `isLoading=true` → Submit button disabled + spinner
- Transition animation: fade backdrop + scale-up panel

### Module: `RenameDialog`
- Extend `BaseModal` với text input
- Nhận props: `isOpen`, `onClose`, `currentTitle: string`, `onRename: (newTitle: string) => Promise<void>`
- Submit disabled khi: input rỗng hoặc bằng `currentTitle`
- Loading state khi đang gọi `onRename`

### Module: `MindmapCardSkeleton`
- Pure presentational component — không có props
- Cùng dimensions với `MindmapCard` (thumbnail 144px height, card body với 2 dòng text)
- Dùng Tailwind `animate-pulse` + `bg-gray-200 dark:bg-gray-700` cho skeleton blocks
- Export named export `MindmapCardSkeleton`

### Module: `ThemeProvider`
- React context với `theme: 'light' | 'dark'` và `toggleTheme: () => void`
- Khởi tạo từ `localStorage.getItem('theme')`, fallback `'light'`
- Khi toggle: update `<html>` classList, persist localStorage
- Wrap trong root layout (`app/layout.tsx`)
- Dùng `suppressHydrationWarning` trên `<html>` để tránh hydration mismatch

### Module: `ThemeToggle`
- Dùng `useTheme()` hook từ `ThemeProvider`
- Icon: sun (light mode) / moon (dark mode)
- Đặt trong phần header của `MindmapGrid` (cạnh `CreateButton`)

### Module: `StarButton`
- Props: `mindmapId: string`, `isStarred: boolean`, `onToggle: (id: string) => void`
- Hiển thị khi hover card, luôn hiển thị nếu `isStarred=true`
- Icon: ★ filled (starred) / ☆ outline (unstarred)

### Module: `MindmapGrid` (refactor)
- State mới: `pendingDeleteId: string | null`, `pendingRenameId: string | null`, `starredIds: Set<string>`, `filterTab: 'all' | 'starred'`
- `starredIds` khởi tạo từ `localStorage`, persist khi toggle
- Render 1 `DeleteConfirmModal` và 1 `RenameDialog` instance ở cuối component
- `MindmapCard` nhận: `currentUserId: string`, `isStarred: boolean`, `onStarToggle`, `onDeleteRequest: (id: string) => void`, `onRenameRequest: (id: string) => void`
- Filter logic: `filterTab === 'starred'` → filter `mindmaps` theo `starredIds`
- Skeleton: nhận `isLoading?: boolean` prop, render 8 `MindmapCardSkeleton` khi true

### Module: `MindmapCard` (refactor)
- Xóa: `showDeleteModal`, `isRenaming`, `renameValue`, `renameInputRef` state
- Thêm props: `currentUserId: string`, `isStarred: boolean`, `onStarToggle: (id: string) => void`, `onDeleteRequest: (id: string) => void`, `onRenameRequest: (id: string) => void`
- Role check: `isOwner = mindmap.user_id === currentUserId`
- Context menu: chỉ render khi `isOwner === true`
- Dark mode classes: thêm `dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100` etc.

### Tailwind config
- Thêm `darkMode: 'class'` vào `tailwind.config.ts`

### Dark palette
- Background: `gray-50` (light) / `gray-900` (dark)
- Card: `white` (light) / `gray-800` (dark)
- Border: `gray-200` (light) / `gray-700` (dark)
- Text primary: `gray-900` (light) / `gray-100` (dark)
- Text secondary: `gray-500` (light) / `gray-400` (dark)

### Không thay đổi
- Supabase schema — starred dùng localStorage, không cần DB migration
- API routes / server actions — không thay đổi
- Editor components — out of scope sprint này

---

## Testing Decisions

### Nguyên tắc test
- Test **external behavior** (output, side effects, DOM output), không test implementation details (state variable names, internal functions)
- Test từ góc nhìn user: "nếu user làm X thì app phải làm Y"
- Mock Supabase, router — không test infrastructure

### Modules cần test

#### `BaseModal`
- Render children khi `isOpen=true`, không render khi `isOpen=false`
- Gọi `onClose` khi nhấn Escape
- Gọi `onClose` khi click backdrop
- Submit button có class màu đỏ khi `isDangerous=true`
- Submit button disabled khi `isLoading=true`
- Gọi `onSubmit` khi click Submit button

#### `ThemeProvider`
- Khởi tạo với `'light'` khi localStorage trống
- Khởi tạo với giá trị từ localStorage nếu có
- `toggleTheme()` switch từ light → dark: thêm class `dark` vào `document.documentElement`
- `toggleTheme()` switch từ dark → light: xóa class `dark`
- Sau toggle, giá trị mới được persist vào localStorage

#### `MindmapGrid` — filter logic
- Render tất cả mindmaps khi tab là `'all'`
- Chỉ render starred mindmaps khi tab là `'starred'`
- Filter starred kết hợp được với search (AND condition)
- Toggle star: mindmap xuất hiện trong `'starred'` tab sau khi starred, biến mất sau khi unstarred
- Render 8 skeleton cards khi `isLoading=true`
- Render 1 `DeleteConfirmModal` instance dù có nhiều cards

### Test framework
- Vitest + React Testing Library (đã có sẵn trong project — xem `vitest.config.ts`)
- Tham khảo pattern từ test files hiện tại nếu có

---

## Out of Scope

- **Email-based collaboration** (ShareDialog với invite by email) — cần backend + DB thay đổi lớn
- **Version history** — cần backend support
- **Multi-select + bulk delete** — để sprint sau
- **Label/tag system** — để sprint sau
- **ActionDispatcher pattern đầy đủ** — đủ dùng với dialog lift, pattern đầy đủ khi có thêm actions
- **Export formats mới** (SVG, Markdown) — để sprint sau
- **Editor dark mode** — chỉ làm dashboard trong sprint này
- **Supabase starred** — dùng localStorage thay vì DB

---

## Further Notes

- Khi implement dark mode, dùng `suppressHydrationWarning` trên `<html>` tag trong `app/layout.tsx` để tránh React hydration mismatch (vì class được apply bởi client-side JS sau khi đọc localStorage).
- `ThemeProvider` phải là Client Component (`'use client'`) vì dùng localStorage và DOM APIs.
- Wisemapping dùng Material UI `ThemeContext` — chúng ta adapt pattern tương tự nhưng với Tailwind class strategy thay vì MUI theme object.
- Starred feature có thể migrate lên Supabase sau (thêm column `is_starred BOOLEAN DEFAULT false` vào bảng `mindmaps`) mà không cần thay đổi component interface — chỉ cần swap localStorage read/write với API calls.
