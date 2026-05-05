# ISS-25: File Parser + File Drop in Init Modal

**Type:** feature_request  
**Severity:** medium  
**Domain:** editor  
**Status:** open  
**PRD:** prd-ai-feature.md  

## What to build

Mở rộng `AIInitModal` với file drop zone (30% phía trên modal). Tạo `file-parser.ts` để extract plain text từ `.txt`, `.md`, và `.pdf` files. Khi user drop file hoặc click để chọn → content được điền vào textarea sẵn → user submit như bình thường.

User stories: US #1–3, 5.

## Acceptance criteria

- [ ] `src/lib/ai/file-parser.ts` export `parseFile(file: File): Promise<string>`
- [ ] `parseFile` xử lý `.txt` và `.md` bằng FileReader API
- [ ] `parseFile` xử lý `.pdf` bằng server-side route `POST /api/ai/parse-pdf` (dùng `pdf-parse` Node.js) để tránh bundle size issue
- [ ] Drop zone chiếm 30% phía trên modal, có visual affordance (border dashed, icon, text hướng dẫn)
- [ ] Drop zone chấp nhận `.txt`, `.md`, `.pdf` — reject các file type khác với error message
- [ ] Drop file → content được extract và điền vào textarea
- [ ] User vẫn có thể edit textarea sau khi drop
- [ ] File quá lớn (> 1MB) → error message, không crash
- [ ] Tests kiểm tra source: `file-parser.ts` chứa txt/md/pdf branches, drop zone trong modal

## Blocked by

- `ISS-24` (AI Init Modal — Text Paste)
