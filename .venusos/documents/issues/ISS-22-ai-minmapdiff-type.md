# ISS-22: MindmapDiff Type + applyDiff Utility

**Type:** feature_request  
**Severity:** high  
**Domain:** editor  
**Status:** open  
**PRD:** prd-ai-feature.md  

## What to build

Tạo foundation type system cho tất cả AI operations. Định nghĩa `MindmapDiff` — kiểu dữ liệu mô tả các thay đổi mà AI apply lên canvas — và `applyDiff()` utility function thực thi những thay đổi đó lên nodes/edges array.

Đây là building block mà mọi AI issue khác đều phụ thuộc vào. Không có UI, không có API call — chỉ là types + pure function.

## Acceptance criteria

- [ ] `src/types/ai.ts` tồn tại và export `MindmapDiff`, `DiffOp` types
- [ ] `DiffOp` có đủ 5 variants: `add_node`, `rename_node`, `delete_node`, `add_edge`, `delete_edge`
- [ ] `delete_node` cascade: xóa node cũng xóa tất cả descendant nodes và edges liên quan
- [ ] `applyDiff(nodes, edges, diff): { nodes, edges }` là pure function, không mutate input
- [ ] `applyDiff` export từ `src/lib/ai/apply-diff.ts`
- [ ] Unit tests cover tất cả 5 op variants và cascade delete

## Blocked by

None — can start immediately
