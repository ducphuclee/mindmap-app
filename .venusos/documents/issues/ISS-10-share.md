# ISS-10: Share — Public Link & Read-only View

**Type:** AFK  
**Severity:** medium  
**Domain:** ui  
**Blocked by:** ISS-06  

## What to build

Allow users to generate a public share link for their mindmap. The link opens a read-only view at `/share/[slug]` that requires no authentication. Users can also revoke the link to make the mindmap private again. The ShareService sets `is_public=true` and generates a unique `slug` via nanoid.

Covers user stories: US 55–58.

## Acceptance criteria

- [ ] Navigate to `/editor/[id]` → Share button visible in editor toolbar
- [ ] Click Share button → popover opens showing "Generate share link" button (if not yet shared)
- [ ] Click "Generate share link" → a URL appears in the popover (e.g. `http://localhost:3000/share/abc123`)
- [ ] Click "Copy link" button → URL is copied to clipboard (paste into address bar works)
- [ ] Open the share URL in an incognito/private window (no login) → mindmap is displayed in read-only mode
- [ ] In read-only view → no editing controls are shown (no toolbar, no node add buttons)
- [ ] In read-only view → zoom and pan still work
- [ ] Back in editor → click Share → click "Revoke link" → share link is deactivated
- [ ] Navigate to the revoked share URL → page shows "This mindmap is no longer available" message

## Blocked by

- ISS-06
