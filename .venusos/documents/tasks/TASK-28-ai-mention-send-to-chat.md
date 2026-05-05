# TASK-28: @mention Autocomplete + Send to Chat from Node

**Source issue:** ISS-28  
**Priority:** P2  
**Status:** done

## Plan

Hoàn thiện UX kết nối node với chat. Thêm `💬 Send to chat` button vào node hover overlay (cạnh `⚡ Expand` từ TASK-26). Thêm @mention autocomplete vào `AIChatSidebar` input. Backend extract mentions từ message và map sang node context.

US #14–15, 18.

## Acceptance Criteria

- [ ] `MindmapNode` nhận thêm prop `onSendToChat: (nodeLabel: string) => void`
- [ ] `💬 Send to chat` button hiển thị cạnh `⚡ Expand` khi hover node
- [ ] Click `💬 Send to chat` → gọi `onSendToChat(data.label)` → không trigger drag/select
- [ ] `MindmapEditorInner` implement `handleSendToChat(label)`: set `chatInput` state thành `@${label} ` và focus sidebar
- [ ] `AIChatSidebar` nhận props `externalInput?: string` và `onExternalInputConsumed: () => void` để nhận @mention từ node click
- [ ] Khi user gõ `@` trong chat input → dropdown xuất hiện với tất cả node labels
- [ ] Dropdown filter real-time theo ký tự sau `@` (case-insensitive)
- [ ] Click item trong dropdown → `@NodeLabel` được insert vào input, dropdown đóng
- [ ] Escape hoặc click outside → dropdown đóng
- [ ] Backend (`/api/ai/chat`) extract mentions bằng regex `/@([\w\s]+)/g` từ message
- [ ] Extracted mention labels được lookup trong `context.nodes` → matched nodes passed vào `chatCommand` as `mentions`
- [ ] Unmatched mentions → graceful degradation (message vẫn được gửi, không error)
- [ ] Test: `MindmapNode.tsx` source chứa `onSendToChat` prop
- [ ] Test: `AIChatSidebar.tsx` source chứa `@` trigger, dropdown logic, mention regex
- [ ] Test: `chat/route.ts` source chứa mention extraction regex

## Scope Files

- `src/components/editor/MindmapNode.tsx` *(thêm Send to chat button)*
- `src/components/editor/MindmapEditor.tsx` *(thêm handleSendToChat)*
- `src/components/editor/AIChatSidebar.tsx` *(thêm @mention autocomplete)*
- `src/app/api/ai/chat/route.ts` *(thêm mention extraction)*

## Out of Scope

- Không thay đổi `applyDiff` hay types
- Không persist mention history
- Không implement multi-select AI command
- Không apply dark mode

## Fixer Guidance

- Hover overlay trong `MindmapNode` đã có từ TASK-26 — chỉ thêm `💬` button cạnh `⚡` button
- `nodrag` class phải có trên cả hai buttons để React Flow không trigger drag
- @mention dropdown: dùng absolute positioned `div` bên dưới input, filter `nodes.map(n => n.data.label)` theo ký tự sau `@`
- `externalInput` pattern: `AIChatSidebar` watch `externalInput` prop qua `useEffect`, khi có giá trị → set input state → gọi `onExternalInputConsumed()` để clear
- Mention regex trong chat route: `/@([\w\s]+?)(?=\s@|\s*$)/g` — cẩn thận với node labels có spaces
- Test pattern: `fs.readFileSync` inspect source (xem `EditorToolbar.test.ts`)
