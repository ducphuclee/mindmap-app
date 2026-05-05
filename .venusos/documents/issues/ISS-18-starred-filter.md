# ISS-18: Starred mindmaps + filter tabs

**Type:** AFK  
**Severity:** medium  
**Blocked by:** ISS-15 (Dashboard refactor)  
**UC:** UC-06, UC-07

## What to build

Thêm tính năng starred mindmaps với localStorage persistence và filter tabs (All / Starred) phía trên grid.

1. Tạo `StarButton` component — icon ★/☆, visible khi hover hoặc khi starred
2. Thêm `starredIds: Set<string>` state vào `MindmapGrid`, khởi tạo từ `localStorage['starredIds']`
3. Thêm `filterTab: 'all' | 'starred'` state vào `MindmapGrid`
4. Thêm filter tabs UI (All / Starred) phía trên grid, bên dưới SearchBar
5. Filter logic: `filter → search → sort` (AND condition giữa filter và search)
6. `EmptyState` cho tab Starred: "No starred mindmaps yet. Click ★ on any card to star it."

Kết quả demo được: hover card → star icon xuất hiện → click → card được starred → click tab "Starred" → chỉ thấy starred cards → refresh → starred state vẫn còn.

## Acceptance criteria

- [ ] `StarButton` hiển thị ☆ outline khi hover card (chưa starred)
- [ ] `StarButton` hiển thị ★ filled và luôn visible khi card đã starred
- [ ] Click `StarButton` toggle starred state ngay lập tức (optimistic)
- [ ] `starredIds` được persist vào `localStorage['starredIds']` sau mỗi toggle
- [ ] Sau reload, starred state được khôi phục từ localStorage
- [ ] localStorage unavailable → starred hoạt động trong session, không crash
- [ ] Filter tabs "All" | "Starred" hiển thị phía trên grid
- [ ] Tab "All" hiển thị tất cả mindmaps
- [ ] Tab "Starred" chỉ hiển thị mindmaps trong `starredIds`
- [ ] Tab active có visual indicator rõ ràng
- [ ] Starred tab + search bar: chỉ hiển thị starred mindmaps match query (AND logic)
- [ ] Starred tab + sort dropdown: sort áp dụng trên starred subset
- [ ] Tab "Starred" empty state khi không có starred mindmaps
- [ ] Unstar card trong tab Starred → card biến mất khỏi view ngay lập tức
- [ ] Tests cho filter logic trong `MindmapGrid`: all tab, starred tab, starred + search combine

## Blocked by

- ISS-15 (Dashboard refactor — `MindmapGrid` state structure phải sẵn sàng)
