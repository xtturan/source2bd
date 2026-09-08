# Source2BD Design System

## Brand

**Name:** Source2BD  
**Parent:** TWT International  
**Tagline feel:** China-to-Bangladesh sourcing and cargo, made simple.  
**Voice:** Direct, calm, trustworthy. Bangla-first for low-literacy users. English for experienced buyers.

## Purpose

Source2BD lets Bangladeshi buyers find products on 1688, Alibaba, and Amazon, request all-in BDT quotes, and ship through TWT International. The site must feel like a confident logistics partner, not a generic marketplace.

---

## Color

### Brand
| Token | Value | Usage |
|-------|-------|-------|
| Navy | `#0A2540` | Primary surfaces, header, footer, trust blocks |
| Navy 600 | `#071B30` | Hover/pressed navy |
| Green | `#1FA64A` | CTAs, success, accents, WhatsApp-adjacent actions |
| Green 600 | `#17843B` | Hover green |
| Brand Red | `#C41E3A` | Destructive, signals, urgent |
| White | `#FFFFFF` | Logo mark, text on navy |

### Surface
| Token | Value | Usage |
|-------|-------|-------|
| Stone 0 | `#F4F1EC` | Page ground highlight |
| Stone 1 | `#EAE5DD` | Secondary ground |
| Stone 2 | `#DED7CC` | Borders, dividers |
| Paper | `#FCFBF9` | Cards, panels, modals |
| Ink | `#141414` | Body text |
| Ink Soft | `#3D3C3A` | Secondary text |
| Steel | `#5A6570` | Muted text, captions |

### Functional
| Token | Value | Usage |
|-------|-------|-------|
| WhatsApp Green | `#1FAA54` | WhatsApp buttons only |
| Border | `rgb(10 37 64 / 0.12)` | Default borders |
| Input | `rgb(10 37 64 / 0.16)` | Form borders |
| Ring | `#1FA64A` | Focus rings |

### Theme mapping
- `background`: `#F1EEE8`
- `foreground`: `#141414`
- `card`: `#FCFBF9`
- `primary`: `#0A2540`
- `secondary`: `#EAE5DD`
- `muted`: `#EAE5DD`
- `muted-foreground`: `#5A6570`
- `accent`: `#1FA64A`
- `destructive`: `#C41E3A`

---

## Typography

### Font stack
| Token | Font |
|-------|------|
| Display | `Bricolage Grotesque`, system-ui, sans-serif |
| Sans | `Geist`, system-ui, sans-serif |
| Mono | `Geist Mono`, ui-monospace, monospace |
| Bengali | `Noto Sans Bengali`, `Geist`, sans-serif |

### Scale
| Element | Size | Weight | Notes |
|---------|------|--------|-------|
| H1 | `clamp(1.75rem, 5vw, 3rem)` | 800 | Single H1 per page |
| H2 | `clamp(1.6rem, 4.4vw, 2.6rem)` | 800 | Section headings |
| H3 | `clamp(1.25rem, 3vw, 1.5rem)` | 700 | Card titles |
| Body | `1rem` / `clamp(0.95rem, 1.4vw, 1.125rem)` | 400 | Leading relaxed |
| Caption | `0.75rem` | 600 | Badges, labels |
| Button | `0.875rem`–`1.125rem` | 600–700 | Pill buttons |

### Rules
- Headings: `letter-spacing: -0.03em`
- Bengali text: `letter-spacing: 0`
- Tabular numbers for prices: `font-variant-numeric: tabular-nums`
- Use `font-bn` utility for Bangla copy

---

## Spacing & Layout

### Container
- Max width: `1280px` (`max-w-7xl`)
- Padding: `clamp(1rem, 4vw, 2.5rem)`

### Section spacing
- Vertical: `clamp(3rem, 7vw, 6.5rem)`

### Radius
| Token | Value |
|-------|-------|
| Card | `18px` |
| Control | `12px` |
| Button | `9999px` (pill) |

### Breakpoints
Follow Tailwind defaults: `sm`, `md`, `lg`, `xl`, `2xl`. Mobile-first.

---

## Components

### Buttons
Variants: `signal`, `green`, `clay`, `glass`, `ghost`
Sizes: `sm`, `md`, `lg`, `xl`

- Primary action: `green` pill
- Secondary action: `glass` pill
- Destructive/urgent: `signal` (ink background)
- All buttons: rounded-full, active scale `0.98`, focus ring `accent`

### Cards
- Base: `panel matte rounded-[18px]`
- Use `lift` utility for hover elevation on catalogue tiles
- Shadow levels: `shadow-1`, `shadow-2`, `shadow-3`

### Header
- Sticky top
- Glass blur on scroll
- Logo mark + wordmark + parent line
- Nav: Find, Catalogue, Guides, Order status
- Language toggle: BN / EN
- Account button, WhatsApp button, Call button

### Mobile Dock
- Bottom fixed nav on small screens
- Two thumb-height action bars: Call + WhatsApp
- Five-icon dock: Home, Find, Catalogue, Full price, More

### Forms
- Inputs: rounded-control, border `input`, focus ring `accent`
- Labels: Bangla-first, short
- Voice search button next to search input
- Drag-and-drop / paste image upload zone

---

## Elevation & Texture

### Shadow levels
| Level | Value |
|-------|-------|
| shadow-1 | `0 1px 2px rgb(60 46 30 / 0.06)` |
| shadow-2 | `0 2px 6px rgb(60 46 30 / 0.07), 0 18px 36px -26px rgb(60 46 30 / 0.28)` |
| shadow-3 | `0 6px 14px rgb(60 46 30 / 0.09), 0 44px 80px -44px rgb(60 46 30 / 0.42)` |

### Glass
- `background-color: rgb(252 251 249 / 0.72)`
- `backdrop-filter: blur(18px) saturate(115%)`
- Subtle border + inset highlight

### Matte texture
- Fine grain overlay via SVG noise filter
- Applied with `matte` utility

---

## Motion

### Defaults
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`
- Micro duration: `150ms`
- Reveal duration: `560ms`
- Reduced motion: respect `prefers-reduced-motion`

### Patterns
- Hover lift: `translateY(-3px)` + `shadow-3`
- Button press: `scale(0.98)`
- Page reveals: `reveal` utility — fade up from `translateY(14px)`

---

## Iconography

- Stroke width: `1.9`
- Line caps: round
- Line joins: round
- Size: `24px` default, `20px` small, `28px` large
- Use simple outline icons; avoid filled icon sets

---

## UX Principles

1. **Bangla first.** Primary labels, headings, and CTAs are in Bangla. English is secondary.
2. **Photo and voice first.** Users can search by photo, voice, link, or keyword.
3. **One job per screen.** No clutter. Each page has a clear primary action.
4. **Progressive disclosure.** Show cached results instantly; load live results behind the scenes.
5. **Trust signals.** TWT International parent line, phone number, WhatsApp, order tracking.
6. **Low-literacy friendly.** Big touch targets, icons, short words, clear hierarchy.

---

## SEO & Meta

- Every content route has its own `head()` with unique title, description, `og:title`, `og:description`, `og:type`, `twitter:card`
- Canonical URLs point to `https://source2bd.com`
- JSON-LD structured data on key pages
- Sitemap generated dynamically

---

## Dos and Don'ts

### Do
- Use navy + green as the dominant pair.
- Keep plenty of warm white space.
- Use `clamp()` for fluid scaling.
- Make CTAs pill-shaped and high-contrast.
- Write Bangla labels before English.
- Show prices in BDT with clear markup honesty.

### Don't
- Use gradients, drop-shadow glows, or glassmorphism overload.
- Hardcode colors in components — use CSS variables.
- Use generic marketplace styling (purple/indigo, shopping-cart icons).
- Use ships, globes, or gradients in brand assets.
- Show raw CNY as the main price.

---

## Files

- `src/styles.css` — tokens, utilities, base styles
- `src/components/s2b/primitives.tsx` — Card, Container, Section, Badge, Stat, etc.
- `src/components/s2b/button.tsx` — Button variants
- `src/components/s2b/header.tsx` — Site header
- `src/components/s2b/footer.tsx` — Site footer
- `src/components/s2b/mobile-dock.tsx` — Mobile navigation
- `src/components/s2b/logo.tsx` — Logo mark and wordmark
- `src/config/site.ts` — Site config (phone, parent, social links)
- `src/lib/i18n.tsx` — Bangla/English translations
