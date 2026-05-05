# TASK-19: Dark Mode Polish — Dashboard Components

**Source issue:** ISS-19  
**Priority:** P3  
**Status:** done

## Plan

Apply `dark:` Tailwind classes lên tất cả dashboard components. TASK-12 đã setup infrastructure, task này chỉ là UI layer — thêm dark variants vào từng element. Không thêm logic, không thay đổi behavior.

UC-01.

## Acceptance Criteria

- [ ] `MindmapCard`: wrapper có `dark:bg-gray-800 dark:border-gray-700`; title text có `dark:text-gray-100`; timestamp có `dark:text-gray-400`
- [ ] Context menu trong `MindmapCard`: background `dark:bg-gray-800`, border `dark:border-gray-700`, item text `dark:text-gray-200`
- [ ] `MindmapGrid` page wrapper: background `dark:bg-gray-900`
- [ ] `SearchBar` input: `dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400`
- [ ] `SortDropdown`: button và dropdown panel có dark variants
- [ ] `EmptyState`: text có dark variants, readable
- [ ] `CreateButton`: dark hover states
- [ ] `UsageBadge`: dark variants
- [ ] `BaseModal`: panel `dark:bg-gray-800`, title `dark:text-gray-100`, description `dark:text-gray-400`
- [ ] `DeleteConfirmModal`: body text readable trong dark mode
- [ ] `RenameDialog`: input `dark:bg-gray-700 dark:text-gray-100`, readable
- [ ] `StarButton`: icon visible trong cả light và dark (dùng `dark:text-yellow-400` khi starred)
- [ ] Filter tabs: active tab `dark:border-blue-400 dark:text-blue-400`; inactive `dark:text-gray-400`
- [ ] `MindmapCardSkeleton`: skeleton blocks `dark:bg-gray-700`
- [ ] Toggle dark/light mode nhiều lần liên tiếp → không có visual glitch hay flash
- [ ] Không còn hardcoded `bg-white` nào mà không có `dark:` counterpart trong dashboard components

## Scope Files

- `src/components/dashboard/MindmapCard.tsx`
- `src/components/dashboard/MindmapGrid.tsx`
- `src/components/dashboard/SearchBar.tsx`
- `src/components/dashboard/SortDropdown.tsx`
- `src/components/dashboard/EmptyState.tsx`
- `src/components/dashboard/CreateButton.tsx`
- `src/components/dashboard/UsageBadge.tsx`
- `src/components/dashboard/MindmapCardSkeleton.tsx`
- `src/components/dashboard/StarButton.tsx`
- `src/components/common/BaseModal.tsx`
- `src/components/dashboard/DeleteConfirmModal.tsx`
- `src/components/dashboard/RenameDialog.tsx`

## Out of Scope

- Không thay đổi logic, state, hay props
- Không apply dark mode cho editor, landing, hay auth pages
- Không thêm tests (visual regression ngoài scope)

## Fixer Guidance

- Palette chuẩn: background `dark:bg-gray-900`, card `dark:bg-gray-800`, border `dark:border-gray-700`, text primary `dark:text-gray-100`, text secondary `dark:text-gray-400`
- Không dùng arbitrary values `dark:bg-[#1a1a1a]` — chỉ dùng Tailwind color scale
- Đọc từng component, tìm tất cả `bg-white`, `text-gray-900`, `border-gray-200` và thêm `dark:` counterpart
- UC-01
