# ISS-26: Expand API + Node Hover Expand Button

**Type:** feature_request  
**Severity:** medium  
**Domain:** editor  
**Status:** open  
**PRD:** prd-ai-feature.md  

## What to build

Thêm `⚡ Expand` button xuất hiện khi hover node. Click → gọi `/api/ai/expand` → AI generate child nodes liên quan → apply diff lên canvas + push undo. Node hover overlay phải không can thiệp vào drag/select behavior của React Flow.

User stories: US #11–13, 16.

## Acceptance criteria

- [ ] `src/lib/ai/mindmap-ai.ts` export `expandNode(nodeId, nodeLabel, context): Promise<MindmapDiff>`
- [ ] `POST /api/ai/expand` nhận `{ nodeId, nodeLabel, context: MindmapData }` → trả `{ diff: MindmapDiff }`
- [ ] Route trả 401 nếu chưa đăng nhập
- [ ] `⚡ Expand` button hiển thị khi hover vào `MindmapNode`, ẩn khi không hover
- [ ] Click `⚡ Expand` → loading indicator trên node, gọi expand API
- [ ] API trả về diff → `applyDiff` apply lên canvas, `pushSnapshot` được gọi
- [ ] Expanded nodes xuất hiện như children của node được expand
- [ ] Hover overlay không kích hoạt khi đang drag node
- [ ] Error từ API → toast/indicator lỗi, không crash editor
- [ ] Tests kiểm tra source: `expandNode` trong mindmap-ai.ts, hover overlay trong MindmapNode, expand handler trong MindmapEditor

## Blocked by

- `ISS-22` (MindmapDiff Type + applyDiff Utility)
