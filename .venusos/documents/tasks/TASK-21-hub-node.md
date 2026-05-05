# TASK-21: Editor — Hub Node from Multi-select

**Source issue:** ISS-21  
**Priority:** P2  
**Status:** done

## Plan

Thêm "Create Hub" button vào `EditorToolbar` — chỉ visible khi ≥ 2 nodes selected. Click → tạo hub node tại centroid của selection, tạo edges từ hub đến từng selected node, auto-enter edit mode (UC-10). Push 1 atomic snapshot vào undo stack.

UC-11.

## Acceptance Criteria

- [ ] `EditorToolbar` nhận props `selectedNodeCount: number` và `onCreateHub: () => void`
- [ ] Button "Create Hub" không render khi `selectedNodeCount < 2`
- [ ] Button "Create Hub" render và enabled khi `selectedNodeCount >= 2`
- [ ] `MindmapEditorInner` có hàm `createHubNode()` được gọi khi user click "Create Hub"
- [ ] `createHubNode()` tính centroid: `x = avg(selected.map(n => n.position.x))`, `y = avg(selected.map(n => n.position.y))`
- [ ] Hub node được tạo với `label: 'Hub'` tại centroid (hoặc offset +50px Y nếu overlap)
- [ ] Edges được tạo từ hub (source) đến mỗi selected node (target), type `smoothstep`
- [ ] Existing edges của selected nodes không bị thay đổi
- [ ] Sau `createHubNode()`: tất cả nodes deselected, hub node được selected
- [ ] Hub node tự động vào edit mode (dùng `editingNodeId` từ TASK-20)
- [ ] Toàn bộ operation (hub node + N edges) được push vào undo stack trong 1 `pushSnapshot()` call
- [ ] Undo (Cmd+Z) xóa hub node và tất cả edges mới trong 1 step
- [ ] `selectedNodeCount` được tính từ `nodes.filter(n => n.selected).length` trong `MindmapEditorInner`
- [ ] Race condition guard: nếu `selectedNodes.length < 2` khi `createHubNode()` execute → no-op
- [ ] Hub node có thể được select, move, rename, delete như node thường
- [ ] Test: `EditorToolbar.tsx` source chứa `selectedNodeCount` và `onCreateHub`
- [ ] Test: `EditorToolbar.tsx` source chứa conditional render dựa trên `selectedNodeCount`
- [ ] Test: `MindmapEditor.tsx` source chứa `createHubNode` function

## Scope Files

- `src/components/editor/EditorToolbar.tsx`
- `src/components/editor/MindmapEditor.tsx`
- `src/components/editor/EditorToolbar.test.ts` *(update — thêm hub tests)*

## Out of Scope

- Không thay đổi edge styling hay node styling
- Không thay đổi `MindmapNode` component (hub node là node thường)
- Không thay đổi keyboard shortcuts
- Không thay đổi dashboard components

## Fixer Guidance

- `selectedNodeCount`: tính bằng `nodes.filter(n => n.selected).length` — truyền xuống `EditorToolbar` qua prop
- Centroid overlap check: sau khi tính centroid, check `nodes.some(n => Math.abs(n.position.x - cx) < 20 && Math.abs(n.position.y - cy) < 20)` → nếu overlap, offset `cy += 50`
- Edge ID format nhất quán với codebase: `edge-${hubId}-${targetId}`
- Atomic snapshot: tạo `nextNodes` (thêm hub) và `nextEdges` (thêm N edges) → `setNodes(nextNodes)` → `setEdges(nextEdges)` → `pushSnapshot({ nodes: nextNodes, edges: nextEdges })` — 1 call
- Auto-edit: sau `createHubNode()`, set `editingNodeId = hubId` (dùng pattern từ TASK-20)
- UC-11
