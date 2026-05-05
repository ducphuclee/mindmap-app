# ISS-23: OpenAI Client + Generate API

**Type:** feature_request  
**Severity:** high  
**Domain:** editor  
**Status:** open  
**PRD:** prd-ai-feature.md  

## What to build

Tạo OpenAI integration layer và API route đầu tiên: generate full mindmap từ plain text. Bao gồm OpenAI SDK singleton (server-only), `generateFromText()` function với prompt engineering, và Next.js API route `/api/ai/generate` có auth.

User stories: US #1–4, 7–9.

## Acceptance criteria

- [ ] `openai` package được install trong `package.json`
- [ ] `src/lib/ai/openai-client.ts` export OpenAI singleton, đọc `OPENAI_API_KEY` từ env, không expose ra client
- [ ] `src/lib/ai/mindmap-ai.ts` export `generateFromText(text: string): Promise<MindmapData>`
- [ ] `generateFromText` gọi GPT-4o với system prompt yêu cầu trả về JSON schema `MindmapData` hợp lệ
- [ ] `POST /api/ai/generate` nhận `{ text: string }`, trả về `{ data: MindmapData }` với status 200
- [ ] Route trả 401 nếu user chưa đăng nhập (Supabase auth check)
- [ ] Route trả 400 nếu `text` empty hoặc thiếu
- [ ] Generated mindmap có ít nhất 1 root node và cấu trúc phân cấp hợp lý
- [ ] Tests kiểm tra source: `mindmap-ai.ts` chứa GPT-4o model, JSON schema trong system prompt, auth check trong route

## Blocked by

- `ISS-22` (MindmapDiff Type + applyDiff Utility)
