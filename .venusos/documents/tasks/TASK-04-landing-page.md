# TASK-04: Landing Page (SSG Marketing Page)

**Source issue:** ISS-04  
**Priority:** P1  
**Status:** todo  

## Plan

Build a fully static (SSG) marketing landing page at `/` with 5 sections: Hero, Features, How It Works, Pricing, Footer. No auth required. Visual style should match GitMind's clean, professional aesthetic using Tailwind CSS. Fully responsive (mobile-first).

## Acceptance Criteria

- [ ] Navigate to `http://localhost:3000` → Hero section visible with a tagline and "Get Started Free" button
- [ ] Click "Get Started Free" → browser URL changes to `http://localhost:3000/signup`
- [ ] Navigate to `http://localhost:3000` → Features section visible with at least 4 feature cards, each with an icon and description text
- [ ] Navigate to `http://localhost:3000` → "How it works" section visible with exactly 3 numbered steps
- [ ] Navigate to `http://localhost:3000` → Pricing section visible with "Free" plan card and "Pro" plan card, each showing a price and bullet list
- [ ] Navigate to `http://localhost:3000` → Footer visible with at least 3 navigation links
- [ ] Resize browser viewport to 375px width → scroll through page, no element overflows horizontally
- [ ] Navigate to `http://localhost:3000` → browser tab title contains "MindMap"

## Scope Files

- `src/app/page.tsx`
- `src/components/landing/Hero.tsx`
- `src/components/landing/Features.tsx`
- `src/components/landing/HowItWorks.tsx`
- `src/components/landing/Pricing.tsx`
- `src/components/landing/Footer.tsx`
- `src/components/landing/Navbar.tsx`

## Out of Scope

- No auth integration beyond linking CTA buttons to `/signup`
- No animations beyond CSS transitions (Framer Motion is Phase 2)
- No real testimonials section (Phase 2)
- No blog/docs pages

## Fixer Guidance

- All components are React Server Components (no `"use client"`)
- Use Tailwind CSS utility classes only — no custom CSS files
- Color palette: blues/purples as accent (matching GitMind style) — suggest `blue-600` and `violet-600`
- Hero: large heading, subheading, two CTAs ("Get Started Free" → /signup, "See Demo" → scroll to features)
- Features: 6 items in a 3-column grid on desktop, 1-column on mobile. Items: "Intuitive Editor", "Multiple Layouts", "Real-time Save", "Export PNG/PDF", "Share Links", "Team-friendly"
- Pricing Free tier: $0/month, 3 mindmaps, basic layouts, export PNG. Pro tier: $9/month, unlimited maps, all layouts, export PNG+PDF, share links
- Use `next/image` for any images/illustrations
- Navbar: logo + "Log In" and "Get Started" buttons
