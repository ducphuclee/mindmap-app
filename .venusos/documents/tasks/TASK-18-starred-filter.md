# TASK-18: Starred Mindmaps + Filter Tabs

**Source issue:** ISS-18  
**Priority:** P2  
**Status:** done

## Plan

Thêm `StarButton` component, starred state (localStorage) vào `MindmapGrid`, và filter tabs UI (All / Starred). Filter logic theo thứ tự: filter tab → search → sort.

UC-06, UC-07.

## Acceptance Criteria

- [x] `StarButton` tồn tại tại `src/components/dashboard/StarButton.tsx`
- [x] `StarButton` props: `mindmapId: string`, `isStarred: boolean`, `onToggle: (id: string) => void`
- [x] `StarButton` hiển thị ☆ outline icon khi `isStarred=false`
- [x] `StarButton` hiển thị ★ filled icon khi `isStarred=true`
- [x] `StarButton` dùng CSS `group-hover` để ẩn khi không hover (ngoại trừ khi `isStarred=true`)
- [x] `MindmapGrid` có state `starredIds: Set<string>`, init từ `JSON.parse(localStorage.getItem('starredIds') ?? '[]')`
- [x] Khi `starredIds` thay đổi → persist `localStorage.setItem('starredIds', JSON.stringify([...starredIds]))`
- [x] localStorage unavailable (exception) → `starredIds` vẫn update trong memory, không crash
- [x] Sau reload → `starredIds` được khôi phục từ localStorage
- [x] `MindmapGrid` có state `filterTab: 'all' | 'starred'`, init `'all'`
- [x] Filter tabs "All" và "Starred" render phía trên grid (bên dưới SearchBar/SortDropdown row)
- [x] Tab active có visual indicator (ví dụ: `border-b-2 border-blue-600 font-medium`)
- [x] Khi `filterTab === 'all'`: hiển thị tất cả mindmaps (sau search + sort)
- [x] Khi `filterTab === 'starred'`: chỉ hiển thị mindmaps có `id` trong `starredIds` (sau search + sort)
- [x] Filter thứ tự: `filterTab` → `search` → `sort` (tất cả apply)
- [x] Tab "Starred" empty state: text "No starred mindmaps yet. Click ★ on any card to star it."
- [x] Unstar card trong tab "Starred" → card biến mất khỏi view ngay lập tức
- [x] `MindmapCard` nhận `isStarred` và `onStarToggle` props (đã có placeholder từ TASK-15)
- [x] Test: `MindmapGrid` filter all tab hiển thị tất cả mindmaps
- [x] Test: `MindmapGrid` filter starred tab chỉ hiển thị starred mindmaps
- [x] Test: filter starred + search = intersection

## Scope Files

- `src/components/dashboard/StarButton.tsx` *(tạo mới)*
- `src/components/dashboard/MindmapGrid.tsx`
- `src/components/dashboard/MindmapCard.tsx` *(wire StarButton)*
- `src/components/dashboard/MindmapGrid.test.ts` *(tạo mới — filter logic tests)*

## Out of Scope

- Starred không sync lên Supabase — chỉ localStorage
- Không implement Labels hay bất kỳ filter nào khác ngoài All/Starred
- Không apply dark mode

## Fixer Guidance

- `starredIds` là `Set<string>` trong state, serialize thành JSON array khi persist: `JSON.stringify([...starredIds])`
- `MindmapCard` parent div cần class `group` để `group-hover` của `StarButton` hoạt động
- Filter order trong `useMemo`: 1) filter by tab, 2) filter by search, 3) sort — tất cả trên cùng 1 `useMemo` chain
- Test pattern: mock localStorage bằng `vi.stubGlobal('localStorage', ...)` trong Vitest
- UC-06, UC-07
