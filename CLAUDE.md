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

## Email System

Sends branded emails to registrants via SMTP. Runs locally with Bun.

### Commands

```bash
# Sync latest CSV from Downloads
bun scripts/send-email.ts --sync

# Preview confirmation emails (no send)
bun scripts/send-email.ts --template registration-confirmation --dry-run

# Send to one person
bun scripts/send-email.ts --template registration-confirmation --to "email@example.com"

# Send to all (skips already-sent)
bun scripts/send-email.ts --template registration-confirmation

# Force resend to all (ignores sent log)
bun scripts/send-email.ts --template registration-confirmation --force

# Custom subject
bun scripts/send-email.ts --template registration-confirmation --subject "Custom Subject"
```

### Structure

```
emails/
├── base.html                          # Branded layout (header, footer, styles)
├── templates/
│   └── registration-confirmation.html # Confirmation body content
├── sent-log.json                      # Tracks who received what (gitignored)
└── preview.html                       # Last dry-run preview (gitignored)

scripts/
└── send-email.ts                      # CLI send script

data/
└── registrants.csv                    # Local copy of Netlify CSV (gitignored)
```

### Adding new email templates

1. Create `emails/templates/<name>.html` with the body content
2. Use `{{name}}`, `{{email}}`, `{{city}}`, etc. for dynamic fields
3. Add default subject to `defaultSubjects` in `scripts/send-email.ts`
4. Send with `bun scripts/send-email.ts --template <name>`

### SMTP config

Copy `.env.example` to `.env` and fill in SMTP credentials.

### Registrant data

CSV is exported from Netlify Forms. Sync to local with `--sync`.
The script auto-syncs on first run if no local copy exists.

## Notes

- Form submission handled by Netlify Forms (`data-netlify="true"`)
- Images from Unsplash (prayer/worship theme)
- Contact: info@boldnessandburdens.com
