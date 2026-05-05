# ISS-04: Landing Page

**Type:** AFK  
**Severity:** medium  
**Domain:** ui  
**Blocked by:** ISS-01  

## What to build

Build a fully static (SSG) marketing landing page at `/` with 5 sections: Hero, Features, How It Works, Pricing, and Footer. The page requires no authentication and is optimized for SEO. Visual style should match GitMind's clean, professional aesthetic using Tailwind CSS.

Covers user stories: US 10–15.

## Acceptance criteria

- [ ] Navigate to `http://localhost:3000` → Hero section visible with tagline text and "Get Started Free" button
- [ ] Click "Get Started Free" → navigated to `/signup`
- [ ] Navigate to `http://localhost:3000` → Features section visible with at least 4 feature cards, each with an icon and description
- [ ] Navigate to `http://localhost:3000` → "How it works" section visible with exactly 3 numbered steps
- [ ] Navigate to `http://localhost:3000` → Pricing section visible with "Free" and "Pro" plan cards, each showing a price and feature list
- [ ] Navigate to `http://localhost:3000` → Footer visible with navigation links and at least one social link
- [ ] Resize browser to 375px width → all sections stack vertically, no horizontal overflow, text remains readable
- [ ] Navigate to `http://localhost:3000` → page title in browser tab reads "MindMap — Organize Your Ideas Visually" (or similar)

## Blocked by

- ISS-01
