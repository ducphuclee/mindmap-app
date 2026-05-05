# ISS-03: Authentication (Email + Google OAuth)

**Type:** AFK  
**Severity:** high  
**Domain:** engineering  
**Blocked by:** ISS-02  

## What to build

Implement full authentication flow using Supabase Auth: email/password sign-up and sign-in, Google OAuth, sign-out, protected route middleware, and error handling. After this slice, users can create accounts, log in, and be redirected appropriately.

Covers user stories: US 2–9.

## Acceptance criteria

- [ ] Navigate to `http://localhost:3000/signup` → form with Email, Password fields and "Sign Up" button is visible
- [ ] Fill in valid email + password → click "Sign Up" → redirected to `/dashboard`
- [ ] Navigate to `http://localhost:3000/login` → form with Email, Password fields, "Log In" button, and "Continue with Google" button is visible
- [ ] Fill in correct email + password → click "Log In" → redirected to `/dashboard`
- [ ] Fill in wrong password → click "Log In" → error message "Invalid email or password" appears below the form
- [ ] Click "Continue with Google" → Google OAuth consent screen opens in browser
- [ ] While logged in, navigate to `http://localhost:3000/login` → redirected to `/dashboard`
- [ ] While logged out, navigate to `http://localhost:3000/dashboard` → redirected to `/login`
- [ ] While logged in, click "Log Out" button → redirected to `/login`, session cleared
- [ ] During login submission → button shows loading spinner and is disabled

## Blocked by

- ISS-02
