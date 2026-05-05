# TASK-23: OpenAI Client + Generate API

**Source issue:** ISS-23  
**Priority:** P0  
**Status:** done

## Plan

Tạo OpenAI integration layer và API route đầu tiên. Bao gồm: OpenAI SDK singleton (server-only), `generateFromText()` function với prompt engineering để generate full mindmap từ text, và Next.js API route `/api/ai/generate` có Supabase auth guard.

US #1–4, 7–9.

## Acceptance Criteria

- [x] `openai` npm package được install (`npm install openai`)
- [x] `src/lib/ai/openai-client.ts` export `getOpenAIClient()` function trả về OpenAI singleton, đọc `OPENAI_API_KEY` từ `process.env`
- [x] `openai-client.ts` không có `'use client'` directive — server-only
- [x] `src/lib/ai/mindmap-ai.ts` export `generateFromText(text: string): Promise<MindmapData>`
- [x] `generateFromText` gọi GPT-4o (`model: 'gpt-4o'`) với system prompt yêu cầu trả về JSON hợp lệ theo schema `MindmapData`
- [x] System prompt chứa JSON schema example cho `{ nodes: MindmapNode[], edges: MindmapEdge[] }`
- [x] `POST /api/ai/generate` tại `src/app/api/ai/generate/route.ts`
- [x] Route check Supabase auth (`createClient()` từ `@/lib/supabase/server`) → trả 401 nếu chưa login
- [x] Route trả 400 nếu body thiếu `text` hoặc `text` là empty string
- [x] Route gọi `generateFromText(text)` → trả `{ data: MindmapData }` với status 200
- [x] Test: `mindmap-ai.ts` source chứa `'gpt-4o'` model string
- [x] Test: `mindmap-ai.ts` source chứa JSON schema trong system prompt
- [x] Test: `generate/route.ts` source chứa Supabase auth check
- [x] Test: `generate/route.ts` source chứa 400 response cho empty text
- [x] Test: `openai-client.ts` source không chứa `'use client'`

## Scope Files

- `src/lib/ai/openai-client.ts` *(tạo mới)*
- `src/lib/ai/mindmap-ai.ts` *(tạo mới)*
- `src/app/api/ai/generate/route.ts` *(tạo mới)*
- `src/lib/ai/mindmap-ai.test.ts` *(tạo mới)*
- `package.json`
- `package-lock.json`

## Out of Scope

- Không implement `expandNode()` hoặc `chatCommand()` trong mindmap-ai.ts — chỉ `generateFromText()`
- Không tạo UI components
- Không implement `/api/ai/expand` hoặc `/api/ai/chat` routes
- Không thay đổi existing API routes

## Fixer Guidance

- Install: `npm install openai`
- Auth pattern: xem `src/app/api/mindmaps/route.ts` để thấy cách check Supabase auth trong API route
- `generateFromText` response: parse JSON từ GPT response string, validate có `nodes` array, throw nếu invalid
- Temperature: 0.7, max_tokens: 2000
- Test pattern: dùng `fs.readFileSync` inspect source (xem `EditorToolbar.test.ts`, `BaseModal.test.ts`)
