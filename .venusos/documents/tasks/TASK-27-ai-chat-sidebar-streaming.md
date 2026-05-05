# TASK-27: AI Chat Sidebar + Streaming Chat API

**Source issue:** ISS-27  
**Priority:** P1  
**Status:** done

## Plan

Tạo `AIChatSidebar` — persistent right sidebar trong editor — và streaming chat API. User gõ freeform prompt, AI stream text response vào chat bubble real-time, khi stream complete apply `MindmapDiff` lên canvas + push undo. Chat history được giữ trong React state (session-only).

US #17, 19–29.

## Acceptance Criteria

- [ ] `AIChatSidebar` tồn tại tại `src/components/editor/AIChatSidebar.tsx`, là `'use client'` component
- [ ] Sidebar render cố định bên phải, chiều rộng cố định (ví dụ `w-80`), không che ReactFlow canvas
- [ ] Chat history hiển thị messages dạng bubble: user (right-aligned), AI (left-aligned)
- [ ] Input textarea ở bottom, Enter (hoặc nút Send) submit message
- [ ] `src/lib/ai/mindmap-ai.ts` export `chatCommand(message: string, mentions: MindmapNode[], context: MindmapData): Promise<{ text: string; diff: MindmapDiff }>`
- [ ] `POST /api/ai/chat` tại `src/app/api/ai/chat/route.ts` stream `text/event-stream`
- [ ] Stream chunks format: `data: {"type":"text","content":"..."}\n\n`
- [ ] Stream terminator: `data: {"type":"done","diff":{...}}\n\n`
- [ ] Route check Supabase auth → 401 nếu chưa login
- [ ] Client nhận text chunks → append vào AI bubble real-time (streaming effect)
- [ ] Client nhận `done` event → extract diff → gọi `onApplyDiff(diff)` callback
- [ ] `MindmapEditorInner` implement `onApplyDiff`: gọi `applyDiff` → `setNodes`/`setEdges` → `pushSnapshot`
- [ ] Nếu diff có `ops: []` (AI chỉ trả lời text) → canvas không thay đổi
- [ ] Loading indicator (spinner hoặc "..." bubble) trong lúc stream đang chạy
- [ ] Error state: hiển thị "Something went wrong. Please try again." trong chat, không crash
- [ ] Test: `AIChatSidebar.tsx` source chứa streaming fetch, done event handler, onApplyDiff
- [ ] Test: `chat/route.ts` source chứa `text/event-stream` content-type, auth check, done event
- [ ] Test: `MindmapEditor.tsx` source chứa `AIChatSidebar` import và `onApplyDiff` handler

## Scope Files

- `src/components/editor/AIChatSidebar.tsx` *(tạo mới)*
- `src/app/api/ai/chat/route.ts` *(tạo mới)*
- `src/lib/ai/mindmap-ai.ts` *(thêm `chatCommand`)*
- `src/components/editor/MindmapEditor.tsx` *(thêm AIChatSidebar + onApplyDiff)*
- `src/components/editor/AIChatSidebar.test.ts` *(tạo mới)*
- `src/app/api/ai/chat/route.test.ts` *(tạo mới)*

## Out of Scope

- Không implement @mention autocomplete — đó là TASK-28
- Không implement `💬 Send to chat` từ node — đó là TASK-28
- Không persist chat history (localStorage/DB)
- Không apply dark mode classes

## Fixer Guidance

- Streaming fetch: dùng `fetch` với `ReadableStream` / `TextDecoder` để đọc SSE. Xem MDN EventSource hoặc manual fetch stream
- `chat/route.ts`: dùng `new ReadableStream` với `TransformStream`, gọi OpenAI stream (`openai.chat.completions.create({ stream: true, ... })`), pipe chunks
- Editor layout: `MindmapEditorInner` outer div hiện là `flex flex-col h-screen`. Thêm `flex flex-row flex-1` wrapper quanh ReactFlow + AIChatSidebar
- `onApplyDiff` trong `MindmapEditorInner`: `const nextNodes = ...; const nextEdges = ...; setNodes(nextNodes); setEdges(nextEdges); pushSnapshot({ nodes: nextNodes, edges: nextEdges })`
- Temperature: 0.5, max_tokens: 1000
- Test pattern: `fs.readFileSync` inspect source (xem `BaseModal.test.ts`, `EditorToolbar.test.ts`)
