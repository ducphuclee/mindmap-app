# TASK-12: Dark Mode Infrastructure — ThemeProvider + ThemeToggle + Tailwind config

**Source issue:** ISS-12  
**Priority:** P1  
**Status:** done

## Plan

Thiết lập toàn bộ infrastructure cho dark mode: cấu hình Tailwind `class` strategy, tạo `ThemeProvider` context với localStorage persistence, tạo `ThemeToggle` button, và wire vào root layout. Sau task này, bất kỳ component nào thêm `dark:` Tailwind classes sẽ hoạt động ngay.

UC-01, UC-02.

## Acceptance Criteria

- [ ] `tailwind.config.ts` có `darkMode: 'class'`
- [ ] `ThemeProvider` là `'use client'` component, export `useTheme()` hook trả về `{ theme, toggleTheme }`
- [ ] `ThemeProvider` đọc `localStorage.getItem('theme')` khi khởi tạo; fallback `'light'` nếu giá trị null, undefined, hoặc không phải `'light'`/`'dark'`
- [ ] `ThemeProvider` thêm class `dark` vào `document.documentElement` khi theme là `'dark'`, xóa khi `'light'`
- [ ] `ThemeProvider` ghi `localStorage.setItem('theme', newTheme)` sau mỗi lần `toggleTheme()` được gọi
- [ ] `ThemeProvider` wrap `try/catch` quanh tất cả localStorage calls — không crash khi localStorage unavailable
- [ ] `ThemeToggle` hiển thị moon icon khi theme `'light'`, sun icon khi theme `'dark'`
- [ ] `ThemeToggle` được đặt trong header section của `MindmapGrid` (cạnh `CreateButton`), visible trên dashboard
- [ ] `app/layout.tsx` có `suppressHydrationWarning` trên `<html>` tag
- [ ] `app/layout.tsx` wrap children trong `<ThemeProvider>`
- [ ] Test: `ThemeProvider` init với `'light'` khi localStorage trống
- [ ] Test: `ThemeProvider` init với `'dark'` khi `localStorage['theme'] === 'dark'`
- [ ] Test: `toggleTheme()` từ light → dark thêm class `dark` vào `document.documentElement`
- [ ] Test: `toggleTheme()` từ dark → light xóa class `dark` khỏi `document.documentElement`
- [ ] Test: sau `toggleTheme()`, `localStorage['theme']` phản ánh theme mới

## Scope Files

- `tailwind.config.ts`
- `src/app/layout.tsx`
- `src/components/common/ThemeProvider.tsx` *(tạo mới)*
- `src/components/common/ThemeToggle.tsx` *(tạo mới)*
- `src/components/dashboard/MindmapGrid.tsx`
- `src/components/common/ThemeProvider.test.ts` *(tạo mới)*

## Out of Scope

- Không apply `dark:` classes lên bất kỳ component nào — đó là TASK-19
- Không thay đổi editor components
- Không thay đổi auth/landing pages

## Fixer Guidance

- Test pattern: dùng `fs.readFileSync` để inspect source (xem `EditorToolbar.test.ts` làm ví dụ). KHÔNG cần `@testing-library/react`
- `ThemeProvider` phải là `'use client'` vì dùng `useState`, `useEffect`, `localStorage`, `document`
- Dùng `suppressHydrationWarning` trên `<html>` để tránh Next.js hydration mismatch khi class `dark` được apply client-side sau SSR
- `useTheme()` hook nên throw nếu dùng ngoài `ThemeProvider` context
- `ThemeToggle` dùng `useTheme()` hook — phải là client component
- Folder `src/components/common/` chưa tồn tại — cần tạo
- UC-01, UC-02
