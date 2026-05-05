# ISS-11: Free Tier Limit & Upgrade Prompt

**Type:** AFK  
**Severity:** low  
**Domain:** ui  
**Blocked by:** ISS-05  

## What to build

Enforce the free tier limit of 3 mindmaps per user. The limit is checked server-side before creating a new mindmap. The dashboard shows a usage badge ("2/3 maps used") and when the limit is reached, the "+ New Mindmap" button triggers an upgrade prompt modal instead of creating a new map.

Covers user stories: US 59–61.

## Acceptance criteria

- [ ] Navigate to `/dashboard` with fewer than 3 mindmaps → usage badge shows "X/3 maps used" in dashboard header
- [ ] With exactly 2 mindmaps → click "+ New Mindmap" → 3rd mindmap is created normally
- [ ] Navigate to `/dashboard` with 3 mindmaps → usage badge shows "3/3 maps used"
- [ ] With 3 mindmaps → click "+ New Mindmap" → upgrade prompt modal appears (not a new mindmap)
- [ ] Upgrade modal shows: "You've reached the free plan limit" message, "Upgrade to Pro" CTA button, and "Cancel" button
- [ ] Click "Cancel" in upgrade modal → modal closes, no mindmap created
- [ ] (API-level) Attempt to create a 4th mindmap via API directly → server returns 403 error (limit enforced server-side, not just UI)
- [ ] Pro user (is_pro=true) → click "+ New Mindmap" with 3+ existing maps → new mindmap created without any modal

## Blocked by

- ISS-05
