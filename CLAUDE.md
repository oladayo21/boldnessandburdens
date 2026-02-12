# Boldness and Burdens Conference 2026

Event website for BBC'26 - a youth prayer conference.

## Stack

- **Framework**: Astro
- **Styling**: Vanilla CSS with CSS custom properties
- **Package Manager**: pnpm

## Commands

```bash
pnpm dev      # Start dev server (localhost:4321)
pnpm build    # Build for production
pnpm preview  # Preview production build
```

## Structure

```
src/
├── layouts/
│   └── BaseLayout.astro    # Shared HTML wrapper
├── pages/
│   ├── index.astro         # Info/landing page
│   └── register.astro      # Registration form
└── styles/
    └── global.css          # Design tokens & global styles
```

## Design System

- **Fonts**: Fraunces (display), Outfit (body)
- **Colors**: Warm cream bg, deep brown text, burnt orange accent (#d4873a) - derived from flyer
- **Approach**: Minimalist, mobile-first responsive

## Key Variables

```css
--color-cream: #faf6f0
--color-charcoal: #1e1610
--color-accent: #d4873a
--font-display: 'Fraunces'
--font-body: 'Outfit'
```

## Notes

- No backend yet - form submission is client-side only
- Images from Unsplash (prayer/worship theme)
- Contact: info@boldnessandburdens.com
