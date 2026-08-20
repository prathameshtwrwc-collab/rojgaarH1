# Accessibility

The current build follows a baseline accessibility standard. This document lists the current implementation expectations and the rules that must be preserved.

---

## Semantic HTML

- The page uses a `<header>` element for the navbar, `<section>` elements for each homepage section, and a `<footer>` element for the site footer.
- The hero uses an `<h1>` for the brand headline. All other section headings are `<h2>`. Subheadings and step titles are `<h3>`.
- Each section has an `aria-label` where the section's purpose is not implied by its content (e.g. testimonials, stats, final CTA).
- Carousels and process timelines use `role="list"` and `role="listitem"`.

## Heading Hierarchy

```
h1 — Hero (Rojgaar Hai!)
  h2 — For Job Seekers
  h2 — For Employers
  h2 — How It Works
  h2 — Features
  h2 — Statistics
  h2 — Testimonials
  h2 — Final CTA
  footer (no heading)
```

The hierarchy is strict. No skipping.

## Button Labels

- All buttons have text content describing the action. `I am a Job Seeker` and `I am an Employer` are explicit.
- Icon-only buttons are not used in the live build, except the mobile menu toggle, which has `aria-label` set dynamically (`Open menu` / `Close menu`).

## Navigation Accessibility

- The header `<nav>` uses `aria-label="Primary"`.
- The mobile menu uses `aria-label="Mobile"`.
- The footer `<nav>` uses `aria-label="Footer navigation"`.
- The footer socials container uses `aria-label="Social media"`.

## Keyboard Focus

- All interactive elements (links, buttons) are reachable with `Tab`.
- `outline` is removed in the global reset and replaced with custom focus styles:
  - Buttons: `outline: 2px solid var(--navy); outline-offset: 3px` on `:focus-visible`.
  - Job Seekers CTA: a custom `box-shadow` ring on `:focus`.
  - Footer links: rely on the natural link focus state.
- The mobile menu icon is a real `<button>` and is keyboard-reachable.

## Contrast

- Navy text `#101A36` on warm `#FAF8F4` background: contrast ratio > 14:1 (well above WCAG AA for normal text).
- Charcoal `#3D4452` on warm `#FAF8F4`: contrast ratio > 10:1.
- White `#FFFFFF` on navy `#101A36` (employer button): contrast ratio > 14:1.
- White `#FFFFFF` on orange `#F15A24` (Job Seeker button): contrast ratio ~ 3.7:1. The button is large (`50px` height, `14px` weight 600). It passes WCAG AA for large text.
- Cream `#FAF8F4` on forest green `#063D32`: contrast ratio > 11:1.
- Cream `#FAF8F4` on deep navy `#06182D`: contrast ratio > 13:1.

## Image Alt Text

- No `<img>` tags exist in the live build.
- All decorative SVGs use `aria-hidden="true"`.
- The reserved image containers (`.hero-artwork`, etc.) are also `aria-hidden="true"` because they hold no content yet.
- When real images are inserted, they must include meaningful `alt` text or `aria-hidden="true"` if purely decorative.

## Decorative SVGs

- The eyebrow spark, underline, and "easier" annotation are decorative. They have `aria-hidden="true"`.
- Icons inside buttons and features are decorative because the buttons already have text. They are `aria-hidden="true"`.

## Touch Target Sizes

- All primary buttons are at least `46px` tall. The hero variant is `50px` tall.
- The mobile menu toggle is `40×40px` with a touch-friendly hit area.
- The pagination dots are not interactive in the current build. They are visual indicators.

## Reduced Motion

- The current build does not include continuous animation. All motion is hover-triggered, scroll-controlled, or hamburger toggle.
- A future enhancement is to wrap motion in a `prefers-reduced-motion: reduce` guard. This is documented but not currently implemented.

## Color Independence

- No information is conveyed by color alone. The Hero's orange `!` is also italicized via the handwritten font. The testimonials' `easier` annotation is also visually distinct by shape, not only by color.
- The "active" testimonial card is distinguished by color, size, position, and shadow.

## Locked Accessibility Rules

- Section numbers and labels are not used in the live UI. Adding them back would harm accessibility and is not permitted.
- Icons inside buttons must be `aria-hidden="true"`.
- Decorative SVGs must be `aria-hidden="true"`.
- Reserved image containers must remain `aria-hidden="true"` until they receive real content.
- All CTAs must have visible text content.
- The mobile menu must remain a real button, not a div.
- Heading order must not be skipped.
