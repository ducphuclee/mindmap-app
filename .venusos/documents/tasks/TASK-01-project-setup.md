# TASK-01: Bootstrap Next.js 15 Project & Infrastructure

**Source issue:** ISS-01  
**Priority:** P0  
**Status:** todo  

## Plan

Bootstrap a Next.js 15 (App Router) project with all required dependencies. Establish folder structure, Tailwind CSS, Supabase client setup, TypeScript config, and route middleware. This is the foundation for all other tasks.

## Acceptance Criteria

- [ ] Navigate to `http://localhost:3000` → page loads, browser console shows zero errors
- [ ] Navigate to `http://localhost:3000` → page displays a placeholder "MindMap App" heading
- [ ] Navigate to `http://localhost:3000/dashboard` → browser URL changes to `http://localhost:3000/login` (middleware redirect works)
- [ ] Navigate to `http://localhost:3000/login` → page renders without crashing (Supabase client initializes)

## Scope Files

- `package.json`
- `tsconfig.json`
- `next.config.ts`
- `tailwind.config.ts`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/middleware.ts`
- `.env.local.example`

## Out of Scope

- No auth UI (login/signup forms) — that is TASK-03
- No landing page content — that is TASK-04
- No dashboard content — that is TASK-05

## Fixer Guidance

- Use `create-next-app` with App Router, TypeScript, and Tailwind CSS flags
- Install: `@supabase/supabase-js`, `@supabase/ssr`
- Supabase client: `src/lib/supabase/client.ts` for browser, `src/lib/supabase/server.ts` for server components
- Middleware must protect `/dashboard` and `/editor/*` routes — redirect to `/login` if no session
- Add `.env.local.example` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` placeholders
- Folder structure:
  ```
  src/
    app/
      (auth)/login/   (auth)/signup/
      (protected)/dashboard/   (protected)/editor/[id]/
      share/[slug]/
      page.tsx  layout.tsx
    components/
      auth/  dashboard/  editor/  landing/  ui/
    lib/
      supabase/  mindmap/  auth/
    hooks/
    types/
  ```
- Verify with agent-browser: `close` → `open http://localhost:3000 --headed` → `snapshot` → assert heading visible
