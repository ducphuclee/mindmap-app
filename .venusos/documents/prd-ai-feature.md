# PRD: AI Feature — Generate & Chat

**Domain:** editor  
**Type:** plan  
**Status:** approved  
**Date:** 2026-05-05

---

## Problem Statement

Người dùng tạo và chỉnh sửa mindmap thủ công từng node một — đây là quá trình chậm và tốn sức, đặc biệt khi bắt đầu từ một tài liệu có sẵn hoặc muốn brainstorm nhanh. Không có cách nào để user "nói chuyện" với mindmap bằng ngôn ngữ tự nhiên, mở rộng ý tưởng một cách thông minh, hoặc tạo cấu trúc ban đầu từ nội dung văn bản. Kết quả là barrier to entry cao và tốc độ tư duy bị kìm hãm bởi interface.

---

## Solution

Tích hợp OpenAI GPT-4o trực tiếp vào editor với ba điểm tương tác:

1. **AI Init Modal** — Khi tạo mindmap mới, user có thể drop file (txt/md/pdf) hoặc paste text, AI generate toàn bộ cây mindmap ngay lập tức.
2. **Node Hover Actions** — Khi hover vào bất kỳ node nào, xuất hiện hai nút: `⚡ Expand` (AI tự động thêm child nodes) và `💬 Send to chat` (điền `@NodeName` vào chat bar).
3. **AI Chat Sidebar** — Sidebar bên phải editor cho phép freeform prompt với @mention node, AI stream response vào chat rồi apply diff lên canvas, toàn bộ undoable qua Cmd+Z.

---

## User Stories

### AI Init Modal

1. As an editor user, I want to drop a `.txt` file onto an init modal when creating a new mindmap, so that AI generates the full mindmap structure from the file content automatically.
2. As an editor user, I want to drop a `.md` (Markdown) file onto the init modal, so that AI interprets headings and bullets as mindmap hierarchy.
3. As an editor user, I want to drop a `.pdf` file onto the init modal, so that AI extracts text content and generates a mindmap from it.
4. As an editor user, I want to paste or type text directly into a textarea in the init modal, so that I can generate a mindmap without having a file ready.
5. As an editor user, I want to see a drop zone occupying the top 30% of the init modal with clear drag-and-drop affordance, so that I immediately understand I can drop files.
6. As an editor user, I want to click a "Close" button to dismiss the init modal without generating anything, so that I can start with a blank mindmap instead.
7. As an editor user, I want to click "Submit" and see the mindmap appear on the canvas, so that I can immediately start editing the AI-generated structure.
8. As an editor user, I want the init modal to show a loading state during generation, so that I know the AI is working.
9. As an editor user, I want the generated mindmap to be undoable in one step (Cmd+Z returns to blank), so that I can safely experiment.
10. As an editor user, I want the init modal to appear automatically when I open a new empty mindmap, so that I am prompted to use AI from the start.

### Node Hover Actions

11. As an editor user, I want to see an `⚡ Expand` button when I hover over a node, so that I can trigger AI expansion without opening the chat.
12. As an editor user, I want clicking `⚡ Expand` to automatically generate and add relevant child nodes to the hovered node, so that I can brainstorm faster.
13. As an editor user, I want the expanded child nodes to appear on the canvas immediately and be undoable, so that I can accept or revert AI suggestions.
14. As an editor user, I want to see a `💬 Send to chat` button when I hover over a node, so that I can reference that specific node in a chat prompt.
15. As an editor user, I want clicking `💬 Send to chat` to fill `@NodeName` into the chat bar input and focus the chat, so that I can immediately type my prompt about that node.
16. As an editor user, I want the hover actions to appear without interfering with node selection or dragging, so that normal editor interactions remain smooth.

### AI Chat Sidebar

17. As an editor user, I want a persistent AI chat sidebar on the right side of the editor, so that I can prompt AI at any time while editing.
18. As an editor user, I want to type `@` in the chat input and see a dropdown of node names to mention, so that I can reference specific nodes in my prompts.
19. As an editor user, I want to send a freeform prompt like "expand @Marketing into 5 sub-topics", so that AI adds child nodes to the Marketing node.
20. As an editor user, I want to send a prompt like "rename @Budget to Financial Planning", so that AI renames the node accordingly.
21. As an editor user, I want to send a prompt like "delete @Outdated Node", so that AI removes the node and its children.
22. As an editor user, I want to send a prompt like "restructure the whole map into 3 main branches: People, Process, Technology", so that AI reorganizes the entire mindmap.
23. As an editor user, I want to ask "what is this mindmap about?" and receive a text answer in the chat, so that AI can explain the content without modifying the canvas.
24. As an editor user, I want to see AI responses streaming into the chat bubble in real time, so that I get immediate feedback while waiting.
25. As an editor user, I want the mindmap canvas to update automatically when the AI stream completes, so that I see the changes applied without extra clicks.
26. As an editor user, I want every AI-applied change to be pushed to the undo stack, so that I can Cmd+Z to revert any AI edit.
27. As an editor user, I want the chat to maintain conversation history within the session, so that I can reference previous prompts in follow-up messages.
28. As an editor user, I want to see a loading indicator in the chat while AI is streaming, so that I know my request is being processed.
29. As an editor user, I want an error message in the chat if the AI call fails, so that I understand what went wrong and can retry.

---

## Implementation Decisions

### Modules

**New modules:**

- **`src/lib/ai/openai-client.ts`** — OpenAI SDK singleton. Reads `OPENAI_API_KEY` from server env. Never exposed to client. Model: `gpt-4o`.
- **`src/lib/ai/mindmap-ai.ts`** — Three pure async functions:
  - `generateFromText(text: string): Promise<MindmapData>` — returns full nodes + edges
  - `expandNode(nodeId: string, nodeLabel: string, context: MindmapData): Promise<MindmapDiff>` — returns add_node + add_edge ops
  - `chatCommand(message: string, mentions: MindmapNode[], context: MindmapData): AsyncGenerator<string, MindmapDiff>` — streams text then resolves diff
- **`src/lib/ai/file-parser.ts`** — `parseFile(file: File): Promise<string>`. Handles `.txt` and `.md` via `FileReader`, `.pdf` via `pdfjs-dist`. Returns plain text string.
- **`src/types/ai.ts`** — `MindmapDiff` type with operations: `add_node`, `rename_node`, `delete_node`, `add_edge`, `delete_edge`. Applied by `applyDiff(nodes, edges, diff)` utility.
- **`src/app/api/ai/generate/route.ts`** — `POST` — body: `{ text: string }` → returns `{ data: MindmapData }`. Auth required.
- **`src/app/api/ai/expand/route.ts`** — `POST` — body: `{ nodeId, nodeLabel, context: MindmapData }` → returns `{ diff: MindmapDiff }`. Auth required.
- **`src/app/api/ai/chat/route.ts`** — `POST` with streaming — body: `{ message, mentions, context }` → streams text chunks, ends with `[DONE]` + JSON diff. Auth required.
- **`src/components/editor/AIInitModal.tsx`** — Modal with file drop zone (top 30%, accepts txt/md/pdf) + textarea + Submit/Close buttons. Calls `/api/ai/generate`. Shows loading state.
- **`src/components/editor/AIChatSidebar.tsx`** — Right sidebar. Chat history, streaming bubble, input with @mention autocomplete. Calls `/api/ai/chat`. On stream complete: calls `onApplyDiff(diff)` callback.

**Modified modules:**

- **`src/components/editor/MindmapNode.tsx`** — Add hover state. On hover: render `ExpandButton` and `SendToChatButton` as overlays. Pass `onExpand` and `onSendToChat` as props from `MindmapEditorInner`.
- **`src/components/editor/MindmapEditor.tsx`** — Add: `AIInitModal` (shown when `nodes.length <= 1 && nodes[0].data.label === 'Central Idea'`), `AIChatSidebar` (persistent right panel), `applyDiff` handler that calls `setNodes`/`setEdges` + `pushSnapshot`, `onExpandNode` handler that calls `/api/ai/expand` then applies diff.

### AI Response Contract

`generateFromText` and all API routes return/accept `MindmapData` (existing type: `{ nodes: MindmapNode[], edges: MindmapEdge[] }`).

`MindmapDiff` (new type):
```typescript
type DiffOp =
  | { op: 'add_node'; node: MindmapNode }
  | { op: 'rename_node'; id: string; label: string }
  | { op: 'delete_node'; id: string }          // cascades to children
  | { op: 'add_edge'; edge: MindmapEdge }
  | { op: 'delete_edge'; id: string }

interface MindmapDiff {
  ops: DiffOp[];
}
```

### Streaming Protocol

Chat route streams `text/event-stream`. Each chunk: `data: {"type":"text","content":"..."}`. Final message: `data: {"type":"done","diff":{...}}`. Client accumulates text chunks into chat bubble, on `done` extracts diff and calls `onApplyDiff`.

### Prompt Engineering

System prompts instruct GPT-4o to always respond with valid JSON matching the expected schema. Temperature: 0.7 for generate/expand, 0.5 for chat (more deterministic edits). Max tokens: 2000 for generate, 500 for expand, 1000 for chat.

### Auth & Security

All `/api/ai/*` routes verify Supabase session via `createClient()` before calling OpenAI. `OPENAI_API_KEY` lives only in `.env.local` / server env — never sent to client.

### Undo Integration

`applyDiff` in `MindmapEditorInner` calls `pushSnapshot({ nodes: nextNodes, edges: nextEdges })` exactly once after applying all ops, consistent with existing patterns (`addChildToNode`, `createHubNode`, etc.).

---

## Testing Decisions

**What makes a good test:** Tests inspect observable behavior or source structure — not internal implementation. For AI modules, tests use `fs.readFileSync` to verify source contracts (prompt structure, JSON schema, streaming protocol) rather than mocking OpenAI. For UI components, tests verify source contains required props and state patterns.

**Modules with tests:**

| Module | What to test |
|--------|-------------|
| `src/lib/ai/mindmap-ai.ts` | Source contains correct JSON schema in system prompt; function signatures match contract |
| `src/lib/ai/file-parser.ts` | txt/md parse returns string; pdf branch exists in source |
| `src/types/ai.ts` | `MindmapDiff` type and all op variants are defined |
| `src/components/editor/AIInitModal.tsx` | Source contains drop zone, textarea, submit/close, loading state |
| `src/components/editor/AIChatSidebar.tsx` | Source contains streaming handler, @mention logic, `onApplyDiff` callback |
| `src/app/api/ai/chat/route.ts` | Source contains streaming response, auth check, diff in final event |

**Prior art:** All existing tests use `fs.readFileSync` pattern (see `EditorToolbar.test.ts`, `BaseModal.test.ts`, `ThemeProvider.test.ts`).

---

## Out of Scope

- **Multi-select AI commands** — Rectangle-select multiple nodes then AI-command on selection. Deferred to v2.
- **Image/screenshot input** — Vision model for whiteboard photos. Deferred to v2.
- **URL input** — Crawl and generate from web page. Deferred to v2.
- **Per-user rate limiting** — Throttle OpenAI calls per user. Deferred (add when cost becomes concern).
- **AI on shared/read-only maps** — AI features only available to map owner in edit mode.
- **Conversation persistence** — Chat history resets on page reload. Server-side history deferred to v2.
- **Dark mode for AI components** — Apply `dark:` classes after base implementation (consistent with TASK-19 pattern).
- **Export/import of AI chat** — Not in scope.
- **Fine-tuning or custom models** — GPT-4o only for v1.

---

## Further Notes

- **PDF parsing:** `pdfjs-dist` is the standard for client-side PDF text extraction. Import carefully — it has a Web Worker dependency. Alternative: send raw PDF bytes to server and parse there with `pdf-parse` (Node.js). Recommend server-side for v1 to avoid bundle size issues.
- **@mention UX:** Implement as simple string matching — when user types `@`, show dropdown filtered by node labels. Insert `@NodeLabel` token. Backend extracts mentions by regex `/@([^@\s]+)/g` and looks up matching nodes by label.
- **Context window management:** For large mindmaps (100+ nodes), trim context before sending to GPT-4o. Strategy: include only nodes within 2 hops of mentioned nodes + root node. Prevents token overflow.
- **Optimistic UI:** For `⚡ Expand`, consider showing ghost nodes while waiting for API response to improve perceived performance. Not required for v1.
- **OpenAI dependency:** Add `openai` npm package. Pin to latest stable (currently `^4.x`).
