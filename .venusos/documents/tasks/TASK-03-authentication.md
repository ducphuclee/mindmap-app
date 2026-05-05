# TASK-03: Authentication — Email/Password + Google OAuth

**Source issue:** ISS-03  
**Priority:** P0  
**Status:** todo  

## Plan

Implement the full authentication flow using Supabase Auth: email/password sign-up and sign-in, Google OAuth via Supabase provider, sign-out, protected route middleware, loading states, and error messages.

## Acceptance Criteria

- [ ] Navigate to `http://localhost:3000/signup` → form visible with Email field, Password field, and "Sign Up" button
- [ ] Fill valid email + password → click "Sign Up" → browser URL changes to `http://localhost:3000/dashboard`
- [ ] Navigate to `http://localhost:3000/login` → form visible with Email field, Password field, "Log In" button, and "Continue with Google" button
- [ ] Fill correct credentials → click "Log In" → browser URL changes to `http://localhost:3000/dashboard`
- [ ] Fill wrong password → click "Log In" → error text "Invalid email or password" appears on page
- [ ] Click "Continue with Google" → browser navigates to Google OAuth consent page
- [ ] While logged in, navigate to `http://localhost:3000/login` → redirected to `http://localhost:3000/dashboard`
- [ ] While logged out, navigate to `http://localhost:3000/dashboard` → redirected to `http://localhost:3000/login`
- [ ] While logged in, click "Log Out" button → browser URL changes to `http://localhost:3000/login`
- [ ] Click "Log In" while form is submitting → button is disabled and shows loading indicator

## Scope Files

- `src/app/(auth)/login/page.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/(auth)/layout.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/SignupForm.tsx`
- `src/lib/auth/actions.ts`
- `src/middleware.ts`

## Out of Scope

- No dashboard content — that is TASK-05
- No profile management — Phase 2

## Fixer Guidance

- Use Supabase `@supabase/ssr` for cookie-based session management (not localStorage)
- Server Actions in `src/lib/auth/actions.ts` for signIn, signUp, signOut, signInWithGoogle
- Google OAuth: configure provider in Supabase dashboard, use `supabase.auth.signInWithOAuth({ provider: 'google' })`
- Middleware reads session from cookies — use `createServerClient` from `@supabase/ssr`
- Protected routes: `/dashboard`, `/editor/:id` — redirect to `/login` if no session
- Auth routes: `/login`, `/signup` — redirect to `/dashboard` if already authenticated
- Error handling: catch Supabase auth errors, display user-friendly messages
- Loading state: use React `useTransition` or form `pending` state with Server Actions
