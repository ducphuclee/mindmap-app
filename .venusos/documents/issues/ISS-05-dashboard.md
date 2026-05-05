# ISS-05: Dashboard — Mindmap Grid & CRUD

**Type:** AFK  
**Severity:** high  
**Domain:** ui  
**Blocked by:** ISS-03  

## What to build

Build the authenticated dashboard at `/dashboard` showing all user mindmaps as a responsive grid of cards. Users can create, rename, duplicate, delete, search, and sort their mindmaps. Empty state guides new users to create their first map.

Covers user stories: US 16–25.

## Acceptance criteria

- [ ] Navigate to `http://localhost:3000/dashboard` while logged in → page shows user's mindmaps as a grid of cards
- [ ] Navigate to `http://localhost:3000/dashboard` with no mindmaps → empty state message "Create your first mindmap" and "+ New Mindmap" button visible
- [ ] Click "+ New Mindmap" → new mindmap card appears in the grid with title "Untitled Mindmap"
- [ ] Click "+ New Mindmap" → redirected to `/editor/[new-id]`
- [ ] Right-click (or open context menu) on a card → dropdown shows "Rename", "Duplicate", "Delete" options
- [ ] Click "Rename" → inline text input appears on the card, type new name, press Enter → card shows new name
- [ ] Click "Duplicate" → a new card appears with "(Copy)" appended to the original title
- [ ] Click "Delete" → confirmation dialog appears: "Delete this mindmap?" with Cancel and Delete buttons
- [ ] Confirm Delete → card is removed from the grid
- [ ] Type in search box → grid filters to show only cards whose title contains the search text
- [ ] Clear search box → all cards reappear
- [ ] Click sort dropdown → select "Last modified" → cards reorder by modified date descending
- [ ] Click a mindmap card → navigated to `/editor/[id]`
- [ ] Each card shows: mindmap title and "Last modified X ago" timestamp

## Blocked by

- ISS-03
