# ISS-19: Dark mode polish — dashboard components

**Type:** AFK  
**Severity:** low  
**Blocked by:** ISS-12 (Dark mode infra), ISS-15 (Dashboard refactor)  
**UC:** UC-01

## What to build

Apply `dark:` Tailwind classes lên tất cả dashboard components để dark mode hoạt động hoàn chỉnh. ISS-12 đã setup infrastructure (ThemeProvider + Tailwind config), issue này làm UI layer.

**Palette cần dùng:**
- Background: `bg-gray-50` (light) / `dark:bg-gray-900` (dark)
- Card: `bg-white` (light) / `dark:bg-gray-800` (dark)
- Border: `border-gray-200` (light) / `dark:border-gray-700` (dark)
- Text primary: `text-gray-900` (light) / `dark:text-gray-100` (dark)
- Text secondary: `text-gray-500` (light) / `dark:text-gray-400` (dark)

**Components cần update:** `MindmapCard`, `MindmapGrid`, `SearchBar`, `SortDropdown`, `EmptyState`, `UsageBadge`, `CreateButton`, `DeleteConfirmModal`, `RenameDialog`, `BaseModal`.

Kết quả demo được: toggle dark mode → toàn bộ dashboard chuyển sang dark palette, không có element nào còn màu trắng hardcode.

## Acceptance criteria

- [ ] `MindmapCard` hiển thị đúng dark palette (background, border, text, thumbnail overlay)
- [ ] Context menu trong `MindmapCard` có dark background khi dark mode
- [ ] `MindmapGrid` page background chuyển sang `gray-900`
- [ ] `SearchBar` input có dark background + dark border + light text
- [ ] `SortDropdown` có dark background khi mở
- [ ] `EmptyState` text readable trong dark mode
- [ ] `BaseModal` overlay và panel có dark variants
- [ ] `DeleteConfirmModal` và `RenameDialog` readable trong dark mode
- [ ] `StarButton` icon visible trong cả 2 modes
- [ ] Filter tabs có dark active/inactive states
- [ ] `MindmapCardSkeleton` dùng `dark:bg-gray-700` cho skeleton blocks
- [ ] Không còn hardcoded `bg-white` hay `text-gray-900` nào mà thiếu dark variant
- [ ] Toggle dark/light nhiều lần → không có visual glitch

## Blocked by

- ISS-12 (Dark mode infra — `darkMode: 'class'` và `ThemeProvider` phải có trước)
- ISS-15 (Dashboard refactor — components phải ổn định trước khi apply dark classes)
