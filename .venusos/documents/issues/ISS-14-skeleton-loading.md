# ISS-14: MindmapCardSkeleton + dashboard loading state

**Type:** AFK  
**Severity:** medium  
**Blocked by:** None — can start immediately  
**UC:** UC-03

## What to build

Tạo `MindmapCardSkeleton` component và wire vào `MindmapGrid` để hiển thị 8 skeleton cards trong khi data đang tải.

1. Tạo `src/components/dashboard/MindmapCardSkeleton.tsx` — pure presentational, no props
2. Thêm `isLoading?: boolean` prop vào `MindmapGrid`
3. Khi `isLoading=true`: render 8 `MindmapCardSkeleton` thay vì real cards
4. Update `DashboardPage` (`app/dashboard/page.tsx`) để truyền loading state xuống `MindmapGrid`

Kết quả demo được: throttle network → navigate đến `/dashboard` → thấy 8 skeleton cards pulse trước khi real cards xuất hiện.

## Acceptance criteria

- [ ] `MindmapCardSkeleton` có cùng outer dimensions với `MindmapCard` (thumbnail height 144px + card body)
- [ ] Skeleton blocks dùng `animate-pulse` + `bg-gray-200` (light) / `bg-gray-700` (dark)
- [ ] Skeleton card body có 2 placeholder lines (title + timestamp)
- [ ] `MindmapGrid` nhận prop `isLoading?: boolean`
- [ ] Khi `isLoading=true`: render đúng 8 `MindmapCardSkeleton` trong cùng grid layout
- [ ] Khi `isLoading=false`: render real cards như bình thường
- [ ] Không có layout shift khi transition từ skeleton sang real cards
- [ ] `DashboardPage` sử dụng Next.js Suspense hoặc loading state để truyền `isLoading` xuống

## Blocked by

None — can start immediately
