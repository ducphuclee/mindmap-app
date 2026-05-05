# ISS-12: Dark mode infrastructure (ThemeProvider + ThemeToggle + Tailwind config)

**Type:** AFK  
**Severity:** high  
**Blocked by:** None — can start immediately  
**UC:** UC-01, UC-02

## What to build

Thin vertical slice thiết lập toàn bộ infrastructure cho dark mode:

1. Thêm `darkMode: 'class'` vào `tailwind.config.ts`
2. Tạo `ThemeProvider` (React context + localStorage persistence + apply `dark` class lên `<html>`)
3. Tạo `ThemeToggle` button (sun/moon icon, đặt trong dashboard header của `MindmapGrid`)
4. Wrap root layout (`app/layout.tsx`) với `ThemeProvider` + thêm `suppressHydrationWarning`

Kết quả demo được: click toggle → toàn bộ app switch dark/light, reload → theme được nhớ.

## Acceptance criteria

- [ ] `tailwind.config.ts` có `darkMode: 'class'`
- [ ] `ThemeProvider` đọc `localStorage['theme']` khi khởi tạo, fallback `'light'` nếu không có hoặc invalid
- [ ] `ThemeProvider` apply/remove class `dark` trên `document.documentElement` khi theme thay đổi
- [ ] `ThemeProvider` ghi giá trị mới vào `localStorage['theme']` sau mỗi toggle
- [ ] `ThemeProvider` bắt exception từ localStorage silently (không crash app)
- [ ] `ThemeToggle` hiển thị moon icon khi light mode, sun icon khi dark mode
- [ ] `ThemeToggle` đặt trong header section của `MindmapGrid` (cạnh `CreateButton`)
- [ ] `app/layout.tsx` có `suppressHydrationWarning` trên `<html>` tag
- [ ] `ThemeProvider` là `'use client'` component
- [ ] Tests cho `ThemeProvider`: init từ localStorage, toggle dark→light→dark, persist localStorage, fallback khi localStorage unavailable

## Blocked by

None — can start immediately
