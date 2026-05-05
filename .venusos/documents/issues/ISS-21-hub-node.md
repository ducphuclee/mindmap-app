# ISS-21: Editor — hub node from multi-select

**Type:** AFK  
**Severity:** medium  
**Blocked by:** ISS-20 (Editor auto-focus)  
**UC:** UC-11

## What to build

Khi user select ≥ 2 nodes (Shift+click), toolbar hiển thị button "Create Hub". Click → tạo một hub node tại centroid của selection, tạo edges từ hub đến từng selected node. Hub node auto-enter edit mode.

**Logic:**
- Button "Create Hub" chỉ visible khi `selectedNodes.length >= 2`
- Centroid: `x = avg(nodes[i].position.x)`, `y = avg(nodes[i].position.y)`
- Tạo hub node với `label: 'Hub'` tại centroid
- Tạo N edges: `hub → selectedNode[i]` (smoothstep)
- Không thay đổi existing edges hay parent relationships
- Deselect all → select hub node → trigger auto-edit (UC-10)
- Push snapshot vào undo stack (toàn bộ: hub node + N edges là 1 atomic operation)

Kết quả demo được: Shift+click 3 nodes → "Create Hub" button xuất hiện trong toolbar → click → hub node xuất hiện ở giữa với edges đến 3 nodes → edit mode auto-triggered → Cmd+Z → toàn bộ hub + edges biến mất.

## Acceptance criteria

- [ ] Button "Create Hub" không xuất hiện khi không có selection hoặc chỉ có 1 node selected
- [ ] Button "Create Hub" xuất hiện trong toolbar khi có ≥ 2 nodes selected
- [ ] Click "Create Hub" tạo hub node tại centroid của selected nodes
- [ ] Hub node được kết nối với đúng tất cả selected nodes qua smoothstep edges
- [ ] Edges là từ hub (source) đến selected nodes (targets)
- [ ] Existing edges và parent/child relationships không bị thay đổi
- [ ] Hub node có label mặc định `'Hub'`
- [ ] Hub node tự động vào edit mode sau khi tạo (UC-10 behavior)
- [ ] Undo (Cmd+Z) xóa toàn bộ hub node + tất cả edges mới trong 1 step
- [ ] Hub node overlap với existing node → offset +50px theo Y
- [ ] Race condition: nếu selected nodes < 2 khi execute → no-op (không crash)
- [ ] Hub node có thể được selected, moved, renamed, deleted như node thường

## Blocked by

- ISS-20 (Editor auto-focus — hub node cần auto-edit behavior sau khi tạo)
