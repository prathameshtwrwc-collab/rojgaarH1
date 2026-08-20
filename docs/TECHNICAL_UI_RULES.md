# Technical UI Rules

This document captures the implementation conventions and code-level rules that must be preserved during migration.

---

## Stack and Conventions

- React + Vite + TypeScript.
- CSS is split per concern: `App.css` (tokens, hero, header, buttons), `section04.css` (How It Works), `features.css` (Features), `stats.css` (Statistics), `testimonials.css` (Testimonials), `final-section.css` (Final CTA + Footer).
- All CSS files are imported in `src/main.tsx`.
- Tailwind is available but is **not** used by the live build. All styling is hand-written CSS using design tokens.

---

## Tokens

All design tokens are exposed as CSS custom properties at `:root` in `App.css`. These must be the single source of truth for new code.

```css
--navy: #101A36;
--charcoal: #3D4452;
--orange: #F15A24;
--purple: #7655D9;
--green: #0D604A;
--green-dark: #063D32;
--bg-warm: #FAF8F4;
--bg-cream: #FAF3E3;
--white: #FFFFFF;
--container: 1280px;
--gutter: 24px;
--font: 'Manrope', ...;
--font-hand: 'Kalam', cursive;
```

The colors `#FAF8F4`, `#FAF3E3`, `#06182D`, `#063D32`, and `#071A36` are used as raw values in some section files because they are not yet tokens. When refactoring, prefer extending the token system rather than introducing raw colors.

---

## Container Convention

Every section's inner wrapper uses:

```css
.section-inner {
  width: calc(100% - 48px);
  max-width: 1280px;
  margin: 0 auto;
}
```

Do not deviate. The hero overrides this slightly to keep the 48px container padding visible in the hero.

---

## Spacing Tokens

The build does not currently use spacing tokens like `--space-1`. It uses raw `px` and `%` values. The values are tuned per component. If a spacing system is introduced, it should follow the existing rhythm:

| Use | Value |
|---|---|
| Tight gap | `12–16px` |
| Standard gap | `20–24px` |
| Comfortable gap | `32–40px` |
| Section internal padding | `64–80px` top/bottom |
| Section internal margin | `20–48px` between elements |

Do not introduce a token without auditing whether it actually unifies existing values.

---

## Border-Radius Tokens

| Radius | Use |
|---|---|
| `999px` | Pill buttons, circle CTAs |
| `14px` | Feature tiles |
| `12px` | Testimonial cards |
| `50%` | Process circles |

No other radii are used. Do not introduce `8px`, `16px`, `20px`, `24px`, `32px` etc. without a specific need.

---

## Shadow Tokens

Shadows are hard-coded per component because they are tied to specific brand colors. They are not abstracted into tokens.

---

## Responsive Conventions

- Every section has its own `.css` file with its own media queries.
- Common breakpoints: `1024px`, `860px`, `480px`.
- The site uses `clamp()` heavily for fluid typography.
- Use `flex` and `flex-direction: column` for content groups, not `space-between` for vertical stacking.

---

## Component Reuse

- The shared `<BrandMark>` SVG is the only repeated visual component.
- Buttons share the `.btn` class.
- The hero's icon button variant extends `.btn` with `.btn-hero`.
- Section headings do **not** share a single class. Each section styles its own heading because the typography differs.

This is intentional. Trying to unify the headings into a single class would require parameterization that the current static React does not need.

---

## Semantic Conventions

- `<section>` for each homepage section.
- `<article>` for testimonial cards and feature tiles.
- `<nav>` for primary and footer navigation.
- `<a>` for nav links, footer links, and circle CTAs.
- `<button>` for primary and secondary CTAs and the mobile menu toggle.
- Decorative SVGs use `aria-hidden="true"`.

---

## Do Not Introduce

- A CSS framework like Tailwind utility classes in the JSX. (Tailwind is configured but not used.)
- A separate design tokens file beyond the `:root` declarations.
- New colors not in `COLOR_SYSTEM.md`.
- New fonts beyond Manrope and Kalam.
- New section heights not in `SPACING_AND_LAYOUT.md`.
- Hard-coded `100vh` for content sections.

---

## What Survives a Stack Migration

- Color tokens.
- Font import.
- Container width rule.
- Spacing scale.
- Border-radius scale.
- Section class names (because the visual layer depends on them).

If the project is migrated to a different framework, the easiest path is to keep the existing CSS and reuse the existing class names. Renaming the class names would be a visual regression.
