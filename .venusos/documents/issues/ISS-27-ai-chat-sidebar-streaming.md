# ISS-27: AI Chat Sidebar + Streaming Chat API

**Type:** feature_request  
**Severity:** medium  
**Domain:** editor  
**Status:** open  
**PRD:** prd-ai-feature.md  

## What to build

Tạo `AIChatSidebar` — persistent right sidebar trong editor — và streaming chat API route. User gõ freeform prompt, AI stream text response vào chat bubble, khi stream complete apply `MindmapDiff` lên canvas + push undo. Chat history được giữ trong session.

User stories: US #17, 19–29.

## Acceptance criteria

- [ ] `AIChatSidebar` render cố định bên phải editor, không che canvas
- [ ] Chat history hiển thị messages của user và AI trong session
- [ ] Textarea input ở bottom, có nút Send (hoặc Enter để submit)
- [ ] `src/lib/ai/mindmap-ai.ts` export `chatCommand(message, mentions, context): AsyncGenerator`
- [ ] `POST /api/ai/chat` stream `text/event-stream`: chunks `{"type":"text","content":"..."}`, kết thúc bằng `{"type":"done","diff":{...}}`
- [ ] Route trả 401 nếu chưa đăng nhập
- [ ] Client accumulate text chunks → hiển thị streaming vào chat bubble real-time
- [ ] Khi nhận `done` event → `applyDiff` apply lên canvas, `pushSnapshot` được gọi
- [ ] Nếu diff rỗng (AI chỉ trả lời text, không edit) → canvas không thay đổi
- [ ] Loading indicator trong chat khi đang stream
- [ ] Error (network/API) → error message trong chat, không crash
- [ ] Tests kiểm tra source: streaming handler, done event parser, applyDiff callback, auth check trong route

## Blocked by

- `ISS-22` (MindmapDiff Type + applyDiff Utility)
