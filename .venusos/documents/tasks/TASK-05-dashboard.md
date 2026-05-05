# TASK-05: Dashboard — Mindmap Grid & CRUD

**Source issue:** ISS-05  
**Priority:** P1  
**Status:** todo  

## Plan

Build the authenticated dashboard at `/dashboard` showing all user mindmaps as a responsive grid of cards. Implement full CRUD: create, rename, duplicate, delete with confirmation, plus search and sort. Empty state for new users. Wire up MindmapRepository for all data operations.

## Acceptance Criteria

- [ ] Navigate to `http://localhost:3000/dashboard` while logged in → grid of mindmap cards visible (or empty state if none)
- [ ] With no mindmaps → page shows "Create your first mindmap" text and a "+ New Mindmap" button
- [ ] Click "+ New Mindmap" → new card appears in grid AND browser navigates to `/editor/[new-id]`
- [ ] Right-click a mindmap card → context menu appears with "Rename", "Duplicate", "Delete" options
- [ ] Click "Rename" → card title becomes an editable input, type new name, press Enter → card displays new title
- [ ] Click "Duplicate" → new card appears with the same title + " (Copy)" suffix
- [ ] Click "Delete" → modal dialog appears with "Delete this mindmap?" and "Cancel" / "Delete" buttons
- [ ] Click "Delete" in modal → card disappears from grid
- [ ] Type text in search input → grid shows only cards whose title contains the typed text
- [ ] Clear search input → all cards reappear
- [ ] Click sort dropdown → select "Last modified" → cards reorder with most recently modified first
- [ ] Click a mindmap card → browser URL changes to `/editor/[id]`
- [ ] Each card shows the mindmap title and a "Last modified" timestamp
- [ ] Navigate to `/dashboard` while logged out → redirected to `/login`

## Scope Files

- `src/app/(protected)/dashboard/page.tsx`
- `src/app/(protected)/layout.tsx`
- `src/components/dashboard/MindmapGrid.tsx`
- `src/components/dashboard/MindmapCard.tsx`
- `src/components/dashboard/CreateButton.tsx`
- `src/components/dashboard/SearchBar.tsx`
- `src/components/dashboard/SortDropdown.tsx`
- `src/components/dashboard/DeleteConfirmModal.tsx`
- `src/components/dashboard/EmptyState.tsx`
- `src/lib/mindmap/repository.ts`

## Out of Scope

- No editor functionality — that is TASK-06
- No free tier badge/limit UI — that is TASK-11
- No thumbnail screenshots (use placeholder card with title + icon)

## Fixer Guidance

- `MindmapRepository` functions needed: `findByUserId(userId)`, `create(userId)`, `rename(id, title)`, `duplicate(id)`, `deleteById(id)`
- Dashboard page is a Server Component that fetches mindmaps server-side via `MindmapRepository`
- Search and sort are client-side (no server round-trip) — filter/sort the fetched array in state
- Use `useRouter().push('/editor/' + id)` after creating a new mindmap
- Card thumbnail: styled placeholder (gradient background + mindmap icon) — no canvas screenshot
- Context menu: use a simple dropdown div with `onContextMenu` handler, position with `getBoundingClientRect`
- Delete confirmation: use a simple modal (no external library)
- Timestamps: use `date-fns` `formatDistanceToNow` for "2 hours ago" format
