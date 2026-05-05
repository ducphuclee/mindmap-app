# Use Cases: UI/UX Improvements — Học hỏi từ wisemapping-frontend

**PRD:** prd-ux-improvements-wisemapping.md  
**Date:** 2026-05-05  
**Status:** Draft

---

## Actors & Systems

### Actors
- **Owner** — Authenticated user sở hữu mindmap (`mindmap.user_id === currentUser.id`)
- **Viewer** — Authenticated user không phải owner (dùng để ẩn context menu)
- **Browser** — Môi trường thực thi localStorage, apply CSS class `dark` lên `<html>`

### Systems
- `ThemeProvider` — Context quản lý dark/light, đọc/ghi localStorage
- `MindmapGrid` — Container chính: filter state, dialog state, starred state
- `MindmapCard` — Card cá nhân: context menu theo role, star button
- `BaseModal` — Shared modal wrapper (accessibility, keyboard, animation)
- `RenameDialog` — Dialog rename với validation
- `DeleteConfirmModal` — Dialog xác nhận xóa
- `MindmapCardSkeleton` — Placeholder loading
- `localStorage` — Persist `theme`, `starredIds`
- Server Actions — `renameMindmap`, `deleteMindmap`, `duplicateMindmap`

---

## Use Cases

### UC-01: Toggle Dark/Light Mode

**Actor:** Owner (hoặc bất kỳ authenticated user nào)  
**Trigger:** User click vào `ThemeToggle` button ở dashboard header  
**Preconditions:** User đang ở dashboard, app đã load xong

**Main flow (happy path):**
1. User click `ThemeToggle` button (icon sun hoặc moon)
2. `ThemeProvider` đọc `theme` hiện tại từ context
3. Theme mới = opposite của theme hiện tại (`light` → `dark` hoặc ngược lại)
4. `ThemeProvider` thêm/xóa class `dark` trên `document.documentElement`
5. `ThemeProvider` ghi giá trị mới vào `localStorage` với key `theme`
6. Toàn bộ dashboard re-render với dark/light palette tương ứng (Tailwind `dark:` classes active)
7. `ThemeToggle` icon đổi: sun icon khi light, moon icon khi dark

**Alternative flows:**
- **1a — Toggle lại ngay:** User click lần 2, theme đảo ngược trở về trạng thái ban đầu. Flow lặp lại từ bước 2.

**Error flows:**
- **1e1 — localStorage bị block (private browsing):** Tại bước 5, nếu `localStorage.setItem` throw exception, `ThemeProvider` bắt lỗi silently — theme vẫn apply trong session hiện tại nhưng không persist.

**Postconditions:**
- Class `dark` có mặt hoặc vắng mặt trên `<html>` tương ứng với theme mới
- `localStorage['theme']` = `'dark'` hoặc `'light'`
- Tất cả components với `dark:` Tailwind classes hiển thị đúng palette

**Business rules:**
- Chỉ 2 giá trị hợp lệ: `'light'` và `'dark'`
- Toggle là action tức thì, không có loading state

---

### UC-02: Khôi phục Theme Preference khi Revisit

**Actor:** Browser  
**Trigger:** User mở/reload dashboard  
**Preconditions:** User đã từng toggle theme và `localStorage['theme']` có giá trị

**Main flow (happy path):**
1. Browser load trang, React khởi tạo `ThemeProvider`
2. `ThemeProvider` đọc `localStorage.getItem('theme')`
3. Giá trị là `'dark'` hoặc `'light'` → set làm initial theme
4. `ThemeProvider` apply class `dark` lên `<html>` nếu theme là `dark`
5. Dashboard render với đúng theme, không có flash (FOUC)

**Alternative flows:**
- **2a — localStorage trống (first visit):** Tại bước 2, không có giá trị → fallback về `'light'`. Flow kết thúc tại bước 5 với light theme.
- **2b — localStorage có giá trị invalid:** Giá trị không phải `'light'` hoặc `'dark'` → fallback về `'light'`.

**Error flows:**
- **2e1 — localStorage unavailable:** `ThemeProvider` bắt exception, fallback `'light'`, tiếp tục bình thường.

**Postconditions:**
- Dashboard hiển thị đúng theme từ session trước
- Không có visual flash khi load

**Business rules:**
- `suppressHydrationWarning` trên `<html>` tag để Next.js không warn về hydration mismatch
- Class `dark` phải được apply trước first paint để tránh FOUC

---

### UC-03: Xem Dashboard với Skeleton Loading

**Actor:** Owner  
**Trigger:** User navigate đến `/dashboard`  
**Preconditions:** User đã authenticated, server đang fetch mindmaps

**Main flow (happy path):**
1. User navigate đến `/dashboard`
2. Next.js server component bắt đầu fetch mindmaps từ Supabase
3. `MindmapGrid` nhận `isLoading=true` (hoặc data chưa resolve)
4. `MindmapGrid` render 8 `MindmapCardSkeleton` components thay vì real cards
5. Mỗi skeleton có cùng kích thước với `MindmapCard`: thumbnail 144px + card body
6. Skeleton blocks animate với `animate-pulse` (fade in/out liên tục)
7. Server trả về mindmaps data
8. `MindmapGrid` replace 8 skeletons bằng real `MindmapCard` components
9. Transition mượt mà, không layout shift

**Alternative flows:**
- **3a — Không có mindmaps:** Tại bước 8, data trả về array rỗng → render `EmptyState` component thay vì cards.
- **3b — Load nhanh (< 100ms):** Skeleton hiển thị thoáng qua, real cards xuất hiện gần như ngay lập tức — chấp nhận được.

**Error flows:**
- **3e1 — Fetch thất bại:** Server action throw error → `MindmapGrid` render error state (giữ nguyên EmptyState hiện tại hoặc thêm error message).

**Postconditions:**
- User thấy real mindmap cards sau khi data load
- Không có "blank flash" khi dashboard load

**Business rules:**
- Luôn render đúng 8 skeleton cards (fixed count, không phụ thuộc vào số mindmaps thực)
- Skeleton và real card phải có cùng dimensions để tránh layout shift

---

### UC-04: Xóa Mindmap qua Delete Dialog

**Actor:** Owner  
**Trigger:** User right-click vào mindmap card → chọn "Delete"  
**Preconditions:** User là owner của mindmap (`mindmap.user_id === currentUser.id`)

**Main flow (happy path):**
1. User right-click vào `MindmapCard`
2. Context menu xuất hiện với các options: Rename, Duplicate, Delete
3. User click "Delete"
4. `MindmapCard` fire `onDeleteRequest(mindmap.id)` lên `MindmapGrid`
5. `MindmapGrid` set `pendingDeleteId = mindmap.id`
6. `DeleteConfirmModal` (render 1 lần duy nhất ở `MindmapGrid`) nhận `isOpen=true`
7. Dialog hiển thị với overlay tối, tiêu đề "Delete this mindmap?", tên mindmap, nút Cancel và Delete (màu đỏ)
8. User click "Delete"
9. `MindmapGrid` gọi `handleDelete(pendingDeleteId)` → optimistic remove khỏi local state → gọi `deleteMindmap(id)`
10. Dialog đóng, card biến mất khỏi grid
11. Server action hoàn thành, mindmap đã xóa khỏi Supabase

**Alternative flows:**
- **4a — User cancel:** Tại bước 8, user click "Cancel" hoặc nhấn Escape hoặc click backdrop → dialog đóng, `pendingDeleteId = null`, mindmap không bị xóa.
- **4b — User đóng bằng Escape:** Tại bất kỳ bước nào sau bước 6, user nhấn Escape → `BaseModal` gọi `onClose` → dialog đóng, không xóa.

**Error flows:**
- **4e1 — Server action thất bại:** Tại bước 11, `deleteMindmap` throw error → rollback optimistic update, mindmap xuất hiện lại trong grid, hiển thị error toast/message.

**Postconditions:**
- Mindmap không còn trong Supabase
- Card không còn trong grid
- Chỉ 1 `DeleteConfirmModal` instance trong DOM tại mọi thời điểm

**Business rules:**
- Chỉ owner mới thấy "Delete" trong context menu
- Delete là action không thể hoàn tác — dialog phải có warning text rõ ràng
- Dialog dùng `isDangerous=true` → nút Delete màu đỏ

---

### UC-05: Rename Mindmap qua Rename Dialog

**Actor:** Owner  
**Trigger:** User right-click vào mindmap card → chọn "Rename"  
**Preconditions:** User là owner của mindmap

**Main flow (happy path):**
1. User right-click vào `MindmapCard`
2. Context menu xuất hiện
3. User click "Rename"
4. `MindmapCard` fire `onRenameRequest(mindmap.id)` lên `MindmapGrid`
5. `MindmapGrid` set `pendingRenameId = mindmap.id`
6. `RenameDialog` (render 1 lần duy nhất ở `MindmapGrid`) nhận `isOpen=true`, `currentTitle = mindmap.title`
7. Dialog hiển thị với text input pre-filled tên hiện tại, nút Cancel và Save
8. User sửa tên, nút Save enabled khi input không trống và khác tên cũ
9. User click "Save" (hoặc nhấn Enter)
10. `RenameDialog` set `isLoading=true`, gọi `onRename(newTitle)`
11. `MindmapGrid` gọi `handleRename(id, newTitle)` → optimistic update local state → gọi `renameMindmap(id, newTitle)`
12. Dialog đóng, card hiển thị tên mới

**Alternative flows:**
- **5a — Cancel:** User click "Cancel" hoặc Escape → dialog đóng, tên không đổi.
- **5b — Tên không thay đổi:** Tại bước 8, nếu user không sửa gì → nút Save disabled → user phải Cancel.
- **5c — Input trống:** Nút Save disabled, user không thể submit.
- **5d — Enter shortcut:** Tại bước 8, user nhấn Enter khi Save enabled → tương đương click Save.

**Error flows:**
- **5e1 — Server action thất bại:** Tại bước 11, `renameMindmap` throw error → rollback tên về cũ, dialog đóng, hiển thị error.

**Postconditions:**
- Mindmap có tên mới trong Supabase và trong grid
- Chỉ 1 `RenameDialog` instance trong DOM

**Business rules:**
- Tên không được trống (trim whitespace trước khi validate)
- Save chỉ enabled khi `trimmed !== currentTitle && trimmed.length > 0`
- Input auto-focus và select-all khi dialog mở

---

### UC-06: Star/Unstar Mindmap

**Actor:** Owner hoặc Viewer (bất kỳ authenticated user)  
**Trigger:** User click vào `StarButton` trên `MindmapCard`  
**Preconditions:** User đang xem dashboard, mindmap card hiển thị

**Main flow (happy path — Star):**
1. User hover qua `MindmapCard`
2. `StarButton` (☆ outline) xuất hiện ở góc card
3. User click `StarButton`
4. `MindmapCard` gọi `onStarToggle(mindmap.id)`
5. `MindmapGrid` thêm `mindmap.id` vào `starredIds` Set
6. `starredIds` mới được serialize và lưu vào `localStorage['starredIds']`
7. `StarButton` đổi thành ★ filled, luôn visible (không cần hover)

**Alternative flows:**
- **6a — Unstar:** Tại bước 3, mindmap đang starred (★ filled) → user click → `MindmapGrid` xóa `mindmap.id` khỏi `starredIds` → lưu localStorage → icon đổi thành ☆ outline, ẩn khi không hover.
- **6b — Star trong tab Starred:** User đang ở tab "Starred", unstar một card → card biến mất khỏi view (vì filter loại bỏ nó), nhưng không báo lỗi.

**Error flows:**
- **6e1 — localStorage unavailable:** `MindmapGrid` bắt exception khi ghi → starred state vẫn update trong memory (trong session), nhưng không persist sau reload.

**Postconditions:**
- `starredIds` Set được cập nhật trong `MindmapGrid` state
- `localStorage['starredIds']` phản ánh trạng thái mới
- UI card phản ánh starred status ngay lập tức (optimistic)

**Business rules:**
- Starred là user-local preference, không sync lên server
- StarButton chỉ visible khi hover HOẶC khi `isStarred=true`
- Không có limit số lượng starred mindmaps

---

### UC-07: Lọc Mindmaps theo Starred Tab

**Actor:** Owner hoặc Viewer  
**Trigger:** User click tab "Starred" phía trên mindmap grid  
**Preconditions:** User đang ở tab "All", có ít nhất 1 mindmap đã starred

**Main flow (happy path):**
1. User nhìn thấy filter tabs: [All] [Starred] phía trên grid
2. User click tab "Starred"
3. `MindmapGrid` set `filterTab = 'starred'`
4. Filter logic: chỉ giữ lại mindmaps có `id` trong `starredIds` Set
5. Grid hiển thị chỉ starred mindmaps
6. Tab "Starred" có visual indicator (active state)
7. Sort dropdown vẫn hoạt động trên subset starred mindmaps
8. Search bar vẫn hoạt động: tìm kiếm trong starred mindmaps

**Alternative flows:**
- **7a — Không có starred mindmaps:** Tại bước 4, `starredIds` trống hoặc không có mindmap nào match → render `EmptyState` với message riêng: "No starred mindmaps yet. Click ★ on any card to star it."
- **7b — Quay về All tab:** User click tab "All" → `filterTab = 'all'` → hiển thị tất cả mindmaps.
- **7c — Tab Starred + Search:** Tại bước 8, user gõ vào search bar → kết quả là intersection của starred mindmaps VÀ search query (AND logic).

**Error flows:**
- Không có error flows đặc biệt (filter là client-side operation thuần).

**Postconditions:**
- Grid hiển thị đúng subset mindmaps theo filter
- Tab active state phản ánh filter hiện tại
- Sort và search vẫn áp dụng lên filtered subset

**Business rules:**
- Filter, search, và sort áp dụng theo thứ tự: `filter → search → sort`
- Filter tab không reset search query hiện tại
- Filter tab không reset sort order hiện tại

---

### UC-08: Role-based Context Menu

**Actor:** Owner, Viewer  
**Trigger:** User right-click vào `MindmapCard`  
**Preconditions:** User đã authenticated, dashboard đã load, `currentUserId` được truyền vào `MindmapGrid`

**Main flow (happy path — Owner):**
1. Owner right-click vào một card của mình
2. `MindmapCard` kiểm tra `isOwner = mindmap.user_id === currentUserId`
3. `isOwner = true`
4. Context menu hiển thị đầy đủ: Rename, Duplicate, Delete
5. Owner có thể chọn bất kỳ action nào

**Alternative flows:**
- **8a — Viewer right-click:** Tại bước 2, `isOwner = false` → context menu không render (hoặc right-click event bị ignore) → không có actions nào xuất hiện.
- **8b — Left-click (card navigate):** User left-click vào card → không trigger context menu → navigate đến editor như bình thường. Flow này không bị ảnh hưởng bởi role.

**Error flows:**
- **8e1 — `currentUserId` undefined:** Nếu user session chưa load → treat as Viewer (conservative fallback), ẩn context menu.

**Postconditions:**
- Owner thấy full context menu
- Viewer không thấy context menu (hoặc thấy empty menu)

**Business rules:**
- Role check dựa trên `mindmap.user_id === currentUserId` (string comparison)
- Đây là UI-level check, không thay thế server-side authorization
- Interface thiết kế để dễ mở rộng: khi thêm `role` field vào `Mindmap` type, chỉ cần update condition check

---

### UC-09: Sử dụng BaseModal (Developer Use Case)

**Actor:** Developer (internal)  
**Trigger:** Developer cần thêm một dialog mới vào app  
**Preconditions:** `BaseModal` component đã được implement

**Main flow (happy path):**
1. Developer import `BaseModal` từ `@/components/common/BaseModal`
2. Developer truyền props: `isOpen`, `onClose`, `title`, `onSubmit`, `submitLabel`
3. Developer truyền content vào `children` prop nếu cần custom body
4. `BaseModal` tự động handle: backdrop overlay, focus trap, Escape key, ARIA attributes, transition animation
5. Developer set `isDangerous=true` cho destructive actions → Submit button tự đổi màu đỏ
6. Developer set `isLoading=true` khi đang gọi async → Submit button tự disable + spinner

**Alternative flows:**
- **9a — Info-only dialog:** Developer không truyền `onSubmit` → modal chỉ có nút Close, không có Submit button.

**Postconditions:**
- Dialog hoạt động đúng accessibility standards (WCAG)
- UX nhất quán với tất cả dialogs khác trong app

**Business rules:**
- Tất cả dialogs trong app PHẢI dùng `BaseModal` làm wrapper
- Không được tạo custom backdrop/overlay logic bên ngoài `BaseModal`

---

## Relationships

### Includes (shared sub-flows)
- UC-04 (Delete Dialog) **includes** BaseModal behavior (UC-09) — dùng `isDangerous=true`
- UC-05 (Rename Dialog) **includes** BaseModal behavior (UC-09)

### Extends (optional behavior)
- UC-07 (Filter Starred) **extends** UC-06 (Star/Unstar) — starred tab chỉ có giá trị khi có starred mindmaps
- UC-07 **extends** UC-03 (Skeleton Loading) — filter áp dụng sau khi data đã load

### Depends on (implementation order)
- UC-04, UC-05 **depend on** UC-09 (`BaseModal` phải implement trước)
- UC-07 **depends on** UC-06 (`starredIds` state phải có trước khi có filter tab)
- UC-01, UC-02 **depend on** `ThemeProvider` và `tailwind.config.ts` darkMode config
- UC-03 **depends on** `MindmapCardSkeleton` component

### Recommended Implementation Order
1. **Infra:** Tailwind dark config + `ThemeProvider` + `ThemeToggle`
2. **Foundation:** `BaseModal` component
3. **Skeleton:** `MindmapCardSkeleton`
4. **Refactor:** `MindmapCard` (remove dialog state) + `MindmapGrid` (lift state, add skeleton, role check)
5. **Dialogs:** `DeleteConfirmModal` (use BaseModal) + `RenameDialog` (new)
6. **Features:** `StarButton` + starred state + filter tabs
7. **Dark mode polish:** Apply `dark:` classes toàn bộ dashboard components


---

## Editor Use Cases (bổ sung)

### UC-10: Auto-focus Edit khi Tạo Node Mới

**Actor:** Owner  
**Trigger:** User tạo node mới qua bất kỳ action nào (Add Child, Add Sibling, Tab key, context menu)  
**Preconditions:** User đang trong Editor, canvas đang active

**Main flow (happy path — Add Child):**
1. User chọn một node, click "Add Child" (hoặc Tab key, hoặc context menu > Add Child)
2. `MindmapEditorInner` gọi `addChildToNode(parentId)`
3. Node mới được tạo với label mặc định `'New Node'`, thêm vào canvas
4. System deselect tất cả nodes hiện tại, select node mới
5. System trigger edit mode trên node mới ngay lập tức (input focused, text selected-all)
6. User gõ tên mới, nhấn Enter để confirm
7. Node được lưu với tên user vừa gõ

**Alternative flows:**
- **10a — Add Sibling:** Tại bước 1, user chọn "Add Sibling" (hoặc Enter key) → flow tương tự, node mới là sibling → auto-enter edit mode.
- **10b — User nhấn Escape ngay:** Tại bước 5, user nhấn Escape → edit mode thoát, node giữ label `'New Node'`, vẫn tồn tại trên canvas.
- **10c — User click ra ngoài (blur):** Tại bước 5, user click ra ngoài input → commitEdit() → node giữ label hiện tại (nếu trống → giữ `'New Node'`).

**Error flows:**
- **10e1 — Node element chưa mount khi trigger:** System dùng `setTimeout` / `requestAnimationFrame` để delay trigger edit mode cho đến sau React render cycle tiếp theo.

**Postconditions:**
- Node mới tồn tại trên canvas với label đã được user nhập
- Node mới được select
- Undo stack có snapshot chứa node mới

**Business rules:**
- Auto-focus áp dụng cho **tất cả** các cách tạo node mới (child, sibling, future: import, paste)
- Edit mode trigger phải xảy ra sau khi node đã mount vào DOM (không thể trigger trước render)
- Nếu user không sửa gì và blur/Escape → label giữ nguyên `'New Node'` (không xóa node)

**Implementation note:**
- Cần cơ chế truyền "auto-edit signal" từ `MindmapEditorInner` xuống `MindmapNode` instance cụ thể. Approach: thêm `editingNodeId: string | null` state trong `MindmapEditorInner`, truyền qua `data` của node hoặc qua React context. `MindmapNode` watch prop này và tự enter edit mode khi `id === editingNodeId`.

---

### UC-11: Tạo Hub Node từ Multi-selected Nodes

**Actor:** Owner  
**Trigger:** User đã select ≥ 2 nodes → click button "Create Hub" trong toolbar  
**Preconditions:** User đang trong Editor, ≥ 2 nodes đang được select (Shift+click hoặc drag selection)

**Main flow (happy path):**
1. User Shift+click để select 2 hoặc nhiều nodes (nodes hiển thị border xanh khi selected)
2. Toolbar hiển thị button "Create Hub" (chỉ visible khi có ≥ 2 nodes selected)
3. User click "Create Hub"
4. System tính centroid của các selected nodes: `x = avg(selected nodes' x)`, `y = avg(selected nodes' y)`
5. System tạo một hub node mới tại centroid với label mặc định `'Hub'`
6. System tạo edges từ hub node đến từng selected node (hub là source, selected nodes là targets)
7. System deselect tất cả selected nodes, select hub node
8. Hub node tự động enter edit mode (UC-10 behavior) để user đặt tên
9. User gõ tên cho hub node, nhấn Enter
10. Snapshot được push vào undo stack

**Alternative flows:**
- **11a — Chỉ 1 node selected:** Button "Create Hub" không visible/disabled → user không thể trigger UC-11.
- **11b — User Escape sau khi hub tạo:** Tại bước 8, user nhấn Escape → hub node giữ label `'Hub'`, edges đã tạo vẫn giữ nguyên.
- **11c — Hub node bị overlap với existing node:** Centroid có thể trùng với node hiện tại → offset hub node một khoảng cố định (ví dụ +50px theo Y).
- **11d — Undo sau khi tạo hub:** User nhấn Cmd+Z → toàn bộ hub node + edges bị xóa, về trạng thái trước khi create hub.

**Error flows:**
- **11e1 — Selected nodes rỗng khi trigger:** Edge case do race condition → System check lại `selectedNodes.length >= 2` trước khi execute, nếu không đủ thì no-op.

**Postconditions:**
- Hub node tồn tại trên canvas tại centroid của selected nodes
- Edges từ hub đến mỗi selected node đã được tạo
- Parent/child relationships của các selected nodes **không thay đổi** — hub chỉ thêm edges mới, không restructure tree
- Undo stack có snapshot chứa hub node + edges mới

**Business rules:**
- Hub node là node thông thường (`type: 'mindmapNode'`) — không phải loại node đặc biệt
- Edges tạo ra là `type: 'smoothstep'` (consistent với edges hiện tại)
- Hub node **không trở thành parent** của selected nodes (chỉ thêm edges, không thay đổi existing edges)
- Button "Create Hub" chỉ visible khi có ≥ 2 nodes selected — ẩn hoàn toàn khi không có selection hoặc chỉ có 1 node
- Label mặc định: `'Hub'` (thay vì `'New Node'`)

---

## Relationships (cập nhật)

### Bổ sung
- UC-11 **includes** UC-10 — hub node tạo ra tự động enter edit mode
- UC-10 **extends** `addChildToNode` và `addSiblingToNode` — thêm auto-edit behavior sau khi create
- UC-11 **depends on** ReactFlow multi-selection (đã có sẵn với `multiSelectionKeyCode="Shift"`)

### Recommended Implementation Order (cập nhật)
1. **Infra:** Tailwind dark config + `ThemeProvider` + `ThemeToggle`
2. **Foundation:** `BaseModal` component
3. **Skeleton:** `MindmapCardSkeleton`
4. **Refactor dashboard:** `MindmapCard` + `MindmapGrid`
5. **Dialogs:** `DeleteConfirmModal` (use BaseModal) + `RenameDialog`
6. **Features dashboard:** `StarButton` + starred state + filter tabs
7. **Dark mode polish:** Apply `dark:` classes toàn bộ dashboard
8. **Editor UC-10:** Auto-focus edit on new node creation
9. **Editor UC-11:** Hub node from multi-select (depends on UC-10 for auto-edit)
