# TASK-22: MindmapDiff Type + applyDiff Utility

**Source issue:** ISS-22  
**Priority:** P0  
**Status:** done

## Plan

Tạo foundation type system cho tất cả AI operations. Định nghĩa `MindmapDiff` — kiểu dữ liệu mô tả các thay đổi AI apply lên canvas — và `applyDiff()` pure function thực thi những thay đổi đó lên nodes/edges array. Đây là building block mà TASK-23, 26, 27 đều phụ thuộc vào.

## Acceptance Criteria

- [ ] `src/types/ai.ts` tồn tại và export `MindmapDiff`, `DiffOp` types
- [ ] `DiffOp` là discriminated union với 5 variants: `add_node`, `rename_node`, `delete_node`, `add_edge`, `delete_edge`
- [ ] `delete_node` cascade: xóa node cũng xóa tất cả descendant nodes (BFS) và tất cả edges liên quan
- [ ] `applyDiff(nodes, edges, diff): { nodes, edges }` là pure function — không mutate input arrays
- [ ] `applyDiff` export từ `src/lib/ai/apply-diff.ts`
- [ ] Test: `add_node` op thêm node vào array kết quả
- [ ] Test: `rename_node` op cập nhật label của node target, không thay đổi nodes khác
- [ ] Test: `delete_node` op xóa node và tất cả descendants (cascade BFS)
- [ ] Test: `delete_node` cũng xóa edges có source hoặc target là deleted nodes
- [ ] Test: `add_edge` op thêm edge vào array kết quả
- [ ] Test: `delete_edge` op xóa edge khỏi array kết quả
- [ ] Test: `applyDiff` với ops array rỗng trả về nodes và edges không thay đổi

## Scope Files

- `src/types/ai.ts` *(tạo mới)*
- `src/lib/ai/apply-diff.ts` *(tạo mới)*
- `src/lib/ai/apply-diff.test.ts` *(tạo mới)*

## Out of Scope

- Không tạo OpenAI client hoặc bất kỳ API route nào
- Không thay đổi `src/types/mindmap.ts`
- Không tạo UI components

## Fixer Guidance

- `MindmapNode` và `MindmapEdge` types đã có trong `src/types/mindmap.ts` — import từ đó
- Cascade delete: dùng BFS giống pattern trong `deleteNode()` của `MindmapEditor.tsx` (xem file đó để tham khảo)
- Test pattern: viết unit tests thực sự (không dùng `fs.readFileSync`) vì đây là pure function — test behavior trực tiếp
- `applyDiff` nên xử lý ops theo thứ tự trong array (sequential application)
