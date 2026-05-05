# ISS-24: AI Init Modal (Text Paste)

**Type:** feature_request  
**Severity:** high  
**Domain:** editor  
**Status:** open  
**PRD:** prd-ai-feature.md  

## What to build

Tạo `AIInitModal` component và wire vào `MindmapEditor`. Modal xuất hiện tự động khi user mở mindmap mới (empty map). User paste/gõ text vào textarea, submit → AI generate mindmap → apply lên canvas + push undo snapshot. Issue này chỉ cover text input, chưa có file drop (sẽ làm ở ISS-25).

User stories: US #4–10.

## Acceptance criteria

- [ ] `AIInitModal` render với textarea và hai nút: "Close" và "Submit"
- [ ] Modal tự động hiện khi editor mở với map rỗng (chỉ có root node "Central Idea")
- [ ] Click "Close" → modal đóng, canvas giữ nguyên blank map
- [ ] Submit với textarea trống → nút bị disabled, không gửi request
- [ ] Submit với text hợp lệ → loading state hiển thị, gọi `POST /api/ai/generate`
- [ ] Khi API trả về → modal đóng, mindmap xuất hiện trên canvas
- [ ] AI-generated map được push vào undo stack (Cmd+Z trả về blank map)
- [ ] Error từ API → hiển thị error message trong modal, không đóng modal
- [ ] Tests kiểm tra source: modal chứa textarea, loading state, error handling, onApply callback

## Blocked by

- `ISS-23` (OpenAI Client + Generate API)
