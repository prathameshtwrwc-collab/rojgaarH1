# Visual Treatment

This document describes the visual language — surfaces, backgrounds, borders, shadows, corners, organic accents, and depth — so the look can be reproduced without seeing the live site.

---

## Backgrounds

| Surface | Color | Usage |
|---|---|---|
| Page base | `#FAF8F4` | Hero, Job Seekers, Features, Stats, Final CTA, Footer-adjacent |
| Section cream | `#FAF3E3` | Employers section only |
| Section navy | `#06182D` | How It Works section |
| Section green | `#063D32` | Testimonials section |
| Footer navy | `#071A36` | Site footer only |
| Card light | `#FAF8F4` | Active testimonial card |
| Card muted | `#5D6346` | Side testimonial cards |

Rules:
- No gradients.
- No noise textures.
- No mesh backgrounds.
- No glass overlays over backgrounds.

---

## Surfaces and Cards

The site deliberately avoids heavy "card" chrome. Surfaces are either:

1. **Flat against the section background** — features, stats, hero CTA. No border. No shadow.
2. **Elevated only where overlap exists** — testimonial cards. Soft shadow only, no border (active card has a subtle 1px border, side cards do not).

Do not introduce new card patterns. The active testimonial card is the only place where shadow and slight elevation are visually expected.

---

## Borders

- Hairline borders are used on:
  - Header bottom divider: `rgba(16, 26, 54, 0.06–0.07)`.
  - Header top of mobile menu: same.
  - Active testimonial card: `rgba(16, 26, 54, 0.05)` 1px.
- No solid colored borders.
- No section dividers (background color change is the divider).

---

## Shadows

| Element | Shadow |
|---|---|
| Primary button (hover) | `0 6px 16px rgba(241, 90, 36, 0.22)` |
| Secondary button (hover) | `0 6px 16px rgba(16, 26, 54, 0.18)` |
| Circle CTA (Job Seekers) | `0 3px 12px rgba(118, 85, 217, 0.28)` |
| Circle CTA (Employers) | `0 3px 10px rgba(13, 96, 74, 0.18)` |
| Active testimonial card | `0 14px 32px rgba(0, 0, 0, 0.22)` |
| Feature tile (hover) | `0 10px 22px rgba(16, 26, 54, 0.08)` |
| Hero "How It Works" step icon | `0 0 0 6px rgba(255, 255, 255, 0.04)` ring |

Shadows are reserved for hover states and one elevated card. They are not used to imply "depth" everywhere.

---

## Corner Radii

| Surface | Radius |
|---|---|
| All buttons | `999px` (pill) |
| Feature pastel tiles | `14px` |
| How It Works process circles | `50%` |
| Testimonial cards | `12px` |
| Page-level sections | none (full-bleed) |

Do not round entire sections. Do not use radii between 18–28px — they are not in the system.

---

## Organic Accents

The site uses a small number of intentional organic accents:

1. **Hero eyebrow underline** — orange SVG path, approximately 96px wide, slight organic curve, thin stroke (`2.2px`), positioned just below the second eyebrow line. Sits left of the eyebrow's right edge.
2. **Job Seeker swoosh** — purple SVG path under "Job Seekers" heading. Stroke `#7655D9`, width `4.5px`, viewBox `0 0 300 18`, single continuous curve, slightly higher in the middle.
3. **Testimonial "easier" highlight** — lime SVG path `#C8D94A`, `2px` stroke, tightly wrapped around the word "easier", 4–6px outside the glyphs, irregular shape. It must remain a hand-drawn annotation, not a circle or pill.
4. **Hero `Hai!` handwritten glyph** — Kalam 500/700, slightly rotated `-1.4deg` for natural feel.

Rules:
- These are the only decorative SVG accents.
- They are not optional and not random. Each is locked to a specific element.
- Do not generalize them. New organic shapes are not introduced.

---

## Accent Treatment Summary

| Where | What | Why |
|---|---|---|
| Eyebrow | small orange underline SVG | editorial hand-drawn feel |
| Hero `Hai!` | slight rotation `-1.4deg` | organic handwriting |
| Job Seeker heading | purple swoosh | hand-drawn marker underline |
| Testimonial "easier" | lime SVG loop | editorial annotation |
| How It Works dots | dashed amber line | process journey |
| Stat circles | orange numbers | brand emphasis |

---

## Depth

The site does not use depth. There is no parallax, no perspective, no overlapping card stack with multi-shadow. The single exception is the testimonial card group, which is intentionally composed of three layered cards with explicit overlap. That composition is a section feature, not a general pattern.

---

## Contrast

Body text contrast is high against backgrounds. White text is used only on the navy and green section backgrounds. Card text is always on the cream card surface or the dark green muted surface.

---

## Do Not Introduce

- Custom shadows on every element.
- Borders as separators.
- New accent shapes.
- New fonts.
- Gradient buttons.
- Frosted glass.
- Multi-layer card stacks outside the testimonial section.
