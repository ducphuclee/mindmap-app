# ISS-01: Project Setup & Infrastructure

**Type:** AFK  
**Severity:** high  
**Domain:** engineering  
**Blocked by:** None — can start immediately  

## What to build

Bootstrap a Next.js 15 (App Router) monorepo project with all required dependencies and configuration. This slice establishes the foundation every other issue depends on: folder structure, Tailwind CSS, Supabase client setup, TypeScript config, and environment variable wiring.

End-to-end: a developer can clone the repo, run `npm install && npm run dev`, and see the app running at localhost:3000 with no errors.

## Acceptance criteria

- [ ] Navigate to `http://localhost:3000` → page loads without console errors
- [ ] Navigate to `http://localhost:3000` → page displays a placeholder "MindMap App" heading (confirms Next.js routing works)
- [ ] Navigate to `http://localhost:3000/dashboard` → redirected to `/login` (confirms middleware protection is wired)
- [ ] Navigate to `http://localhost:3000/login` → page renders without crashing (confirms Supabase client initializes without throwing)

## Blocked by

None — can start immediately
