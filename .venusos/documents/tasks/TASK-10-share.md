# TASK-10: Share — Public Link & Read-only View

**Source issue:** ISS-10  
**Priority:** P2  
**Status:** todo  

## Plan

Allow users to generate a public share link for their mindmap. The link opens `/share/[slug]` — a fully public, no-auth read-only view. Users can revoke the link to make the mindmap private again. ShareService sets `is_public=true` and generates a unique `slug` via `nanoid`.

## Acceptance Criteria

- [ ] Navigate to `/editor/[id]` → Share button visible in editor toolbar
- [ ] Click Share button → popover opens showing "Generate share link" button
- [ ] Click "Generate share link" → a full URL appears in the popover input field (e.g. `http://localhost:3000/share/abc123`)
- [ ] Click "Copy link" button → URL is copied to clipboard (paste into new tab navigates to the share view)
- [ ] Open share URL in a new incognito/private browser window → mindmap renders in read-only mode without requiring login
- [ ] In read-only share view → no editor toolbar, no node add buttons, no floating toolbar visible
- [ ] In read-only share view → zoom and pan on the canvas still work
- [ ] Back in editor → click Share → click "Revoke link" → share link is deactivated
- [ ] Navigate to the revoked share URL → page shows "This mindmap is no longer available" message

## Scope Files

- `src/lib/mindmap/share-service.ts`
- `src/app/share/[slug]/page.tsx`
- `src/components/editor/SharePopover.tsx`
- `src/components/share/ReadOnlyEditor.tsx`
- `src/components/editor/EditorToolbar.tsx` (update)
- `src/lib/mindmap/repository.ts` (update: add `findBySlug`, `setPublic`)

## Out of Scope

- No embed code/iframe — Phase 2
- No realtime collaboration — Phase 2
- No password-protected share links

## Fixer Guidance

- Install: `nanoid`
- `ShareService.generateShareLink(mindmapId)`: calls `repository.setPublic(id, true, nanoid(10))`, returns `${process.env.NEXT_PUBLIC_APP_URL}/share/${slug}`
- `ShareService.revokeShareLink(mindmapId)`: calls `repository.setPublic(id, false, null)`
- `ShareService.findBySlug(slug)`: calls `repository.findBySlug(slug)` — no auth required (uses Supabase anon key, RLS allows public read)
- `/share/[slug]` is a Server Component — fetch mindmap server-side, pass nodes/edges to `ReadOnlyEditor`
- `ReadOnlyEditor`: React Flow instance with `nodesDraggable={false}`, `nodesConnectable={false}`, `elementsSelectable={false}`, no toolbar rendered
- Copy to clipboard: use `navigator.clipboard.writeText(url)` with a "Copied!" feedback state
- Show "revoke" option only when mindmap is already public (`is_public === true`)
