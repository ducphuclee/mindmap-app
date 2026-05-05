# ISS-28: @mention Autocomplete + Send to Chat from Node

**Type:** feature_request  
**Severity:** medium  
**Domain:** editor  
**Status:** open  
**PRD:** prd-ai-feature.md  

## What to build

Hoàn thiện UX kết nối node với chat. Thêm `💬 Send to chat` button vào node hover overlay: click → fill `@NodeName` vào chat input và focus sidebar. Thêm @mention autocomplete vào chat input: gõ `@` → dropdown hiện danh sách node labels → chọn để insert. Backend extract mentions từ message và truyền context node tương ứng.

User stories: US #14–15, 18.

## Acceptance criteria

- [ ] `💬 Send to chat` button hiển thị khi hover vào `MindmapNode` (cạnh `⚡ Expand`)
- [ ] Click `💬 Send to chat` → `@NodeLabel` được điền vào chat input, chat sidebar focused
- [ ] Gõ `@` trong chat input → dropdown xuất hiện với danh sách node labels
- [ ] Dropdown filter theo ký tự sau `@` (case-insensitive)
- [ ] Click node trong dropdown → `@NodeLabel` được insert vào input tại cursor position
- [ ] Escape hoặc blur → dropdown đóng
- [ ] Backend extract mentions bằng regex `/@([^@\s]+)/g`, lookup nodes theo label
- [ ] Matched nodes được truyền vào `chatCommand` dưới dạng `mentions` array
- [ ] Nếu @mention không match node nào → AI vẫn nhận được message (graceful degradation)
- [ ] Tests kiểm tra source: @mention regex, dropdown logic trong sidebar, Send to chat handler trong MindmapNode

## Blocked by

- `ISS-26` (Expand API + Node Hover Expand Button)
- `ISS-27` (AI Chat Sidebar + Streaming Chat API)
