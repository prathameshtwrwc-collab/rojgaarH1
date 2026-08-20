# Iconography

This document describes the icon system in use.

---

## Library

There is no external icon library. All icons are inline SVGs defined in the React tree or in the JSX directly. They are part of the components, not separate files.

This is intentional. Inline SVGs are easy to recolor via `currentColor` and require no extra HTTP request.

---

## Style

- Outline icons, not filled.
- `stroke="currentColor"` (or a hardcoded `#101A36` inside feature tiles).
- `fill="none"`.
- `stroke-width="2"` (process circles and feature tiles) or `1.8` (footer socials).
- `stroke-linecap="round"` and `stroke-linejoin="round"` everywhere.
- `viewBox="0 0 24 24"` for all UI icons.

The only filled icon is the small "card-quote" and "quote-mark" glyphs used in the testimonial section. They are typographic quotation marks, not icons.

---

## Sizes

| Context | Icon size |
|---|---|
| Hero buttons (left/right) | 18px / 16px |
| How It Works step circles | 30px desktop, 26px mobile |
| Feature tiles | 32px desktop, 28px mobile |
| Footer socials | 18px |
| Job Seekers / Employers circle CTAs | 20px |
| Eyebrow spark | 18px |

---

## Color

- All icons inside buttons inherit the button text color (white) via `currentColor`.
- All icons inside feature tiles are `#101A36`.
- All icons inside How It Works process circles are white.
- The eyebrow spark is `#F15A24`.

---

## Icons Currently Used

| Name | Glyph style |
|---|---|
| Sparkle | 4-point asymmetric star with rounded corners |
| User | head + shoulders |
| Briefcase | rectangular bag with handle |
| Right arrow (chevron) | top-right corner arrow |
| Right arrow (linear) | straight horizontal line + arrowhead |
| Magnifying glass | circle + handle |
| Document | rectangle with two inner text lines |
| Two connected people | two heads + connection line |
| Rocket | full rocket with fins and window |
| Lightning bolt | classic polygon |
| Shield + check | shield with internal checkmark |
| Growth chart | sparkline chart |
| Bell | bell with clapper |
| LinkedIn | "in" mark |
| Twitter/X | diagonal X mark |
| Instagram | rounded square with circle and small dot |

---

## Locked Icon Rules

- No emoji.
- No external icon font.
- No filled cartoon icons.
- No mixed stroke/fill styles.
- No icons inside text paragraphs.
- No icons used as decoration.
- Icons inside buttons must use the same stroke style as the rest of the system.
- All icons inherit color from their parent via `currentColor` where possible.

---

## Adding a New Icon

When adding a new icon, the steps are:

1. Use `viewBox="0 0 24 24"`.
2. Use `stroke="currentColor"`, `fill="none"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.
3. Use the icon in context with the documented sizes.
4. Do not introduce a separate icon component file unless the icon is reused.
5. Update this document with the new icon name and usage.
