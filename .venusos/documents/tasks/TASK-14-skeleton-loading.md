# TASK-14: MindmapCardSkeleton + Dashboard Loading State

**Source issue:** ISS-14  
**Priority:** P1  
**Status:** done

## Plan

Tạo `MindmapCardSkeleton` — pure presentational component với `animate-pulse` animation — và wire vào `MindmapGrid` để hiển thị 8 skeletons khi data đang tải. Update `DashboardPage` để leverage Next.js Suspense hoặc loading state.

UC-03.

## Acceptance Criteria

- [ ] `MindmapCardSkeleton` tồn tại tại `src/components/dashboard/MindmapCardSkeleton.tsx`, không có props
- [ ] Skeleton thumbnail block có height 144px (`h-36`), dùng `animate-pulse` và `bg-gray-200`
- [ ] Skeleton card body có 2 placeholder lines: một dài (~60% width) và một ngắn (~40% width)
- [ ] Skeleton dùng `dark:bg-gray-700` cho skeleton blocks (sẵn sàng cho dark mode)
- [ ] `MindmapGrid` nhận prop `isLoading?: boolean`
- [ ] Khi `isLoading=true`: render đúng 8 `MindmapCardSkeleton` trong cùng grid layout (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`)
- [ ] Khi `isLoading=false` hoặc undefined: render real cards như hiện tại
- [ ] Khi `isLoading=true`: không render bất kỳ `MindmapCard` nào
- [ ] Grid layout không thay đổi giữa skeleton và real cards (không có layout shift)
- [ ] `DashboardPage` truyền loading state xuống `MindmapGrid` (dùng Next.js `loading.tsx` hoặc Suspense)
- [ ] Test: `MindmapCardSkeleton.tsx` tồn tại
- [ ] Test: source chứa `animate-pulse`
- [ ] Test: `MindmapGrid.tsx` source chứa `isLoading` prop và `MindmapCardSkeleton`

## Scope Files

- `src/components/dashboard/MindmapCardSkeleton.tsx` *(tạo mới)*
- `src/components/dashboard/MindmapGrid.tsx`
- `src/app/dashboard/page.tsx` hoặc `src/app/dashboard/loading.tsx` *(tạo mới nếu cần)*
- `src/components/dashboard/MindmapCardSkeleton.test.ts` *(tạo mới)*

## Out of Scope

- Không thay đổi `MindmapCard` component
- Không implement dark mode styling (skeleton đã có `dark:bg-gray-700` sẵn là đủ)
- Không thay đổi editor loading

## Fixer Guidance

- Skeleton phải có cùng outer dimensions với `MindmapCard`: `rounded-lg border bg-white` wrapper, thumbnail `h-36`, card body `p-4`
- 8 skeletons là fixed count — không phụ thuộc vào số mindmaps thực
- Để truyền `isLoading`: option đơn giản nhất là dùng `src/app/dashboard/loading.tsx` (Next.js automatic loading UI) và pass `isLoading` prop. Hoặc dùng React Suspense boundary
- Test pattern: `fs.readFileSync` inspect source (xem `EditorToolbar.test.ts`)
- UC-03
