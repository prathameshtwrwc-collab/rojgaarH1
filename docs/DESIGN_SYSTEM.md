# Design System

This document defines the brand personality, the design principles that govern every page, and the locked decisions that must not be reversed without explicit instruction.

---

## Brand Personality

Rojgaar Hai should feel like:

- **Modern** — contemporary, clean, current.
- **Human** — warm, friendly, never corporate-cold.
- **Approachable** — suitable for first-time job seekers and small employers.
- **Editorial** — typographic confidence, magazine-style composition.
- **Energetic** — optimistic about career mobility, but not loud.
- **Trustworthy** — the language of a real hiring platform.
- **Employment-focused** — every element serves the recruitment narrative.
- **Premium but accessible** — refined without being exclusive.

### How this translates into UI

- Headings are large and confident. The page reads like the cover of a recruitment brand publication.
- Body copy uses a single, well-tuned sans-serif. No decorative fonts except the one intentional handwritten accent in the "For Job Seekers" section and the hero `Hai!` glyph.
- Color is restrained. The orange is for emphasis, not decoration.
- Imagery, when present, is real. Decorative AI illustration is not used.

---

## Design Principles

### 1. Typography-first layouts
- Type is the visual primary. Use scale and weight to create hierarchy, not borders or containers.
- Do not use extra headings, subheadings, or labels to "frame" content.

### 2. Generous, intentional whitespace
- Whitespace is a structural element. Use it to group content, not to fill space.
- Vertical rhythm inside a content group is tight. Vertical rhythm *between* groups is generous.
- Never use `100vh` for content sections. Each section has a natural height that matches its content.

### 3. Strong, single-source visual hierarchy
- Each section has one primary element. Everything else is supporting.
- Do not introduce competing visual centers inside a section.

### 4. Restrained decoration
- Underlines are hand-drawn SVGs, not CSS borders.
- Accents are organic SVGs, not perfect rectangles.
- Decorative shapes are intentional and only used to support the type.

### 5. High readability
- Body text never goes below 11px.
- Line-height for body copy stays in the 1.4–1.55 range.
- Measure (text width) is capped at ~420–460px for paragraph copy.

### 6. Clear, single-purpose CTAs
- Pill-shaped buttons.
- No more than two CTAs in a row.
- CTAs are not icons. Icons are small additions, not the button.

### 7. Honest composition
- Empty space is intentional. Do not "fill" it.
- If a visual is missing, the design should still work. The hero right side is empty by design until artwork is inserted.

---

## What the Design Must Avoid

- Generic SaaS appearance — no startup-illustration hero, no floating dashboard, no chart-on-glass.
- Excessive gradients — only flat color fills. No mesh, no linear gradient text.
- Glassmorphism — no `backdrop-filter: blur` on foreground cards.
- Floating decorative cards in the hero — the right side must remain empty.
- Decorative blobs, scattered confetti, or random shapes.
- 3D effects, neumorphism, exaggerated shadows.
- Continuous or scroll-driven animations.
- Emoji in the UI.
- More than two accent colors in the same section.

---

## Locked Decisions

These decisions were taken during design refinement and are not open to interpretation during migration. Any change must come from the product owner.

### Locked 1 — Hero right side
The right half of the hero is intentionally empty. It is a reserved image slot. Do not generate, mock, or insert placeholder artwork there. When a real image is added, it will use the existing `.hero-artwork` container with `background-position: center right` and `background-size: contain`.

### Locked 2 — No placeholder visuals
No fake cards, no candidate cards, no recruiter cards, no match-score chips, no interview-invite chips, no connection lines, no nodes. These existed in earlier exploration and were intentionally removed.

### Locked 3 — No green oval
There is no green oval, ellipse, blob, or background shape behind or around the hero `Hai!` text. It was removed during the latest refinement. Do not add it back. The only green color in the site lives in the testimonials section background, the stat-circle colors, the employer green CTA, and the pastel mint feature tile.

### Locked 4 — Hero is typography-led
The hero foreground is five elements: eyebrow → underline → `Rojgaar` → `Hai!` → paragraph → CTA buttons. Nothing else.

### Locked 5 — Warm off-white background
The site background is `#FAF8F4`. Section background variants are `#FAF3E3` (employers cream), `#06182D` (how-it-works navy), `#063D32` (testimonials forest green). No other section-level backgrounds.

### Locked 6 — Brand orange + dark navy
The only two dominant brand colors are `#F15A24` (orange) and `#101A36` (dark navy). All other accent colors are supportive.

### Locked 7 — Never SaaS-template
The site must never visually resemble a generic recruitment SaaS template, dashboard screenshot, or "Why Choose Us" feature section. If a design choice is generic, it is wrong.

### Locked 8 — No font mixing
The site uses exactly three font families: Manrope (UI), Baloo 2 (hero display headline), and Caveat (handwritten accents). Do not introduce a fourth family. Baloo 2 is allowed only on the hero `Rojgaar` word. Caveat is allowed only on the hero `Hai!` glyph and the "For Job Seekers" headline. (Kalam was replaced by Caveat and Manrope-on-`Rojgaar` was replaced by Baloo 2 per product-owner direction, to match a supplied reference design.)

### Locked 9 — Section heights are content-driven
No section uses `100vh`. Heights are `min-height` values tuned per section.

### Locked 10 — Footer is horizontal
The footer is a single-row horizontal layout: brand on the left, navigation in the center, social icons on the right. It is compact. Do not turn it into a multi-column or add a newsletter.
