# TASK-11: Free Tier Limit & Upgrade Prompt

**Source issue:** ISS-11  
**Priority:** P3  
**Status:** todo  

## Plan

Enforce a 3-mindmap limit for free users. The limit is checked server-side in the API route before inserting a new mindmap (not just UI). The dashboard shows a usage badge. When the limit is reached, the "+ New Mindmap" button opens an upgrade modal instead of creating a map.

## Acceptance Criteria

- [ ] Navigate to `/dashboard` with 1 mindmap → usage badge shows "1/3 maps used" in dashboard header
- [ ] Navigate to `/dashboard` with 2 mindmaps → click "+ New Mindmap" → 3rd mindmap is created normally, navigated to editor
- [ ] Navigate to `/dashboard` with 3 mindmaps → usage badge shows "3/3 maps used"
- [ ] With 3 mindmaps → click "+ New Mindmap" → upgrade modal appears (no new mindmap created)
- [ ] Upgrade modal visible → shows "You've reached the free plan limit" heading, "Upgrade to Pro" button, and "Cancel" button
- [ ] Click "Cancel" in modal → modal closes, user stays on dashboard, no mindmap created
- [ ] Send POST to `/api/mindmaps` with a session that already has 3 mindmaps → server responds with HTTP 403 status
- [ ] Navigate to `/dashboard` as a Pro user with 5 mindmaps → no upgrade modal on "+ New Mindmap" click, new mindmap created

## Scope Files

- `src/app/api/mindmaps/route.ts`
- `src/components/dashboard/UsageBadge.tsx`
- `src/components/dashboard/UpgradeModal.tsx`
- `src/components/dashboard/CreateButton.tsx` (update)
- `src/lib/mindmap/repository.ts` (update: add `countByUserId`)

## Out of Scope

- No real payment/billing integration — Pro flag is a manual DB field for now
- No Stripe or subscription management

## Fixer Guidance

- Add `is_pro BOOLEAN DEFAULT false` column to `auth.users` metadata or a separate `profiles` table
- `repository.countByUserId(userId)`: `SELECT COUNT(*) FROM mindmaps WHERE user_id = $1`
- API route `POST /api/mindmaps`: check count before insert → return 403 with `{ error: 'Free tier limit reached' }` if count >= 3 and not pro
- `CreateButton`: client component — on click, check count from props (passed from server), show modal if at limit
- `UsageBadge`: server component — receives `{ count, limit, isPro }` props, renders "X/3 maps used" or hides if Pro
- `UpgradeModal`: simple modal with two buttons — "Upgrade to Pro" (links to `/pricing` for now) and "Cancel"
- Pro check: read `profiles.is_pro` for the current user — if true, skip the limit check
