# TASK-25: File Parser + File Drop in Init Modal

**Source issue:** ISS-25  
**Priority:** P2  
**Status:** done

## Plan

Mở rộng `AIInitModal` với file drop zone (chiếm 30% phía trên modal). Tạo `file-parser.ts` để extract plain text từ `.txt`, `.md`, `.pdf`. Khi user drop hoặc click chọn file → text được extract và điền vào textarea → user submit như bình thường. PDF parsing được thực hiện server-side qua `/api/ai/parse-pdf` (tránh bundle size).

US #1–3, 5.

## Acceptance Criteria

- [ ] `src/lib/ai/file-parser.ts` export `parseFile(file: File): Promise<string>`
- [ ] `parseFile` xử lý `.txt` và `.md` bằng `FileReader.readAsText()`
- [ ] `parseFile` gửi `.pdf` lên `POST /api/ai/parse-pdf` (multipart/form-data) và nhận text response
- [ ] `POST /api/ai/parse-pdf` dùng `pdf-parse` npm package để extract text, trả `{ text: string }`
- [ ] Drop zone chiếm ~30% phía trên `AIInitModal`, có border dashed và icon/label hướng dẫn
- [ ] Drop zone chấp nhận `.txt`, `.md`, `.pdf` (validate `file.type` hoặc extension)
- [ ] Drop file không hợp lệ → error message "Unsupported file type", không xử lý
- [ ] Drop file hợp lệ → `parseFile()` được gọi, result điền vào textarea
- [ ] File > 1MB → error message "File too large (max 1MB)", không crash
- [ ] User có thể edit textarea sau khi drop file
- [ ] Test: `file-parser.ts` source chứa FileReader cho txt/md và fetch cho pdf
- [ ] Test: `parse-pdf/route.ts` source chứa `pdf-parse` import và auth check
- [ ] Test: `AIInitModal.tsx` source chứa drop zone logic và file validation

## Scope Files

- `src/lib/ai/file-parser.ts` *(tạo mới)*
- `src/app/api/ai/parse-pdf/route.ts` *(tạo mới)*
- `src/components/editor/AIInitModal.tsx` *(thêm drop zone)*
- `src/lib/ai/file-parser.test.ts` *(tạo mới)*
- `package.json` *(thêm pdf-parse)*
- `package-lock.json`

## Out of Scope

- Không thay đổi `/api/ai/generate` route
- Không support image/URL input
- Không thay đổi `MindmapEditor.tsx` (đã wire xong ở TASK-24)

## Fixer Guidance

- Install: `npm install pdf-parse` và `npm install --save-dev @types/pdf-parse`
- `parseFile` chỉ cần trả string — caller (AIInitModal) set vào textarea state
- Drop zone: dùng HTML5 drag events (`onDragOver`, `onDrop`) trên một `div` — không cần thư viện
- `parse-pdf/route.ts`: nhận `FormData`, extract file, gọi `pdfParse(buffer)`, trả `{ text: result.text }`
- Auth check cho `parse-pdf` route: dùng cùng pattern như `/api/ai/generate/route.ts`
- Test pattern: `fs.readFileSync` inspect source (xem `EditorToolbar.test.ts`)
