# Migration Guide

This guide describes the contract for moving the Rojgaar Hai website from its current environment to a new VS Code development environment where another AI coding agent will continue development.

The goal is **visual fidelity**, not redesign.

---

## Before Migration

### Inventory to capture

- [ ] All source files: `src/App.tsx`, `src/App.css`, `src/main.tsx`, `src/section04.css`, `src/features.css`, `src/stats.css`, `src/testimonials.css`, `src/final-section.css`.
- [ ] All documentation files in `docs/`.
- [ ] `index.html` title and meta tags.
- [ ] Current `package.json` and `vite.config.ts` (do not edit, just preserve).
- [ ] Any image assets used in the build (currently none).

### Locked decisions to preserve

- Hero right side: empty, reserved.
- No green oval behind `Hai!`.
- No decorative blobs in the hero.
- No section number labels.
- Two font families only: Manrope + Kalam.
- No `100vh` for content sections.
- Section background colors as documented.

---

## During Migration

### File integrity

- Do not rename component files.
- Do not rename CSS class names.
- Do not refactor the per-section CSS files into a single file.
- Do not move decorative SVGs into a different file.
- Do not introduce Tailwind utility classes in the JSX.

### Style migration

- Preserve CSS custom properties at `:root`.
- Preserve the `clamp()` expressions for typography.
- Preserve the per-section media queries.

### Reserved image containers

- Keep the five empty containers with their existing class names.
- Do not insert placeholder content.
- Do not collapse the containers.
- If migrating to a CMS-driven image system, map each container's class to a configurable image slot.

### Fonts

- Manrope and Kalam must be loaded.
- The Google Fonts import must remain.
- Local font fallbacks (system sans, system cursive) are acceptable but should never be the rendered font in normal conditions.

---

## After Migration

### Visual verification checklist

- [ ] Hero: eyebrow, underline, `Rojgaar`, `Hai!` (orange, slightly rotated), paragraph, two CTAs.
- [ ] Hero right side: empty, no shapes, no text.
- [ ] No green oval behind `Hai!`.
- [ ] Header: brand left, navigation right, hairline bottom border.
- [ ] Mobile: hamburger toggle reveals stacked nav.
- [ ] Job Seekers: Kalam heading, purple swoosh, "Explore Jobs" CTA.
- [ ] Employers: cream background, Manrope heading, green "Post a Job" CTA.
- [ ] How It Works: deep navy background, four colored process circles, dashed amber connecting line.
- [ ] Features: warm background, four pastel tiles, italic purple `right`.
- [ ] Statistics: four orange numbers + charcoal labels, 2×2 on mobile.
- [ ] Testimonials: forest green background, three overlapping cards, lime `easier` annotation.
- [ ] Final CTA: orange `click`, two CTAs, empty right side.
- [ ] Footer: brand left, 5 nav links center, 3 social icons right.

### Behavior verification

- [ ] All buttons have hover transitions.
- [ ] All mobile layouts collapse correctly at 860px and 480px.
- [ ] No horizontal scrolling at any width.
- [ ] Mobile menu opens and closes.
- [ ] Smooth scroll on anchor links.
- [ ] All decorative SVGs render in the correct color.

### Accessibility verification

- [ ] No horizontal scrolling at 320px.
- [ ] All buttons reachable by keyboard.
- [ ] Focus styles are visible.
- [ ] Heading hierarchy is h1 → h2.
- [ ] All decorative SVGs are `aria-hidden`.

---

## Common Migration Mistakes

1. **Reintroducing the green oval** behind `Hai!`. It is gone. Do not bring it back.
2. **Adding decorative shapes to the hero right side**. The right side must remain empty until the user inserts an image.
3. **Adding section number labels**. They were intentionally removed.
4. **Using `100vh` for sections.** Use the documented `min-height` values.
5. **Forcing the hero `Rojgaar` and `Hai!` to align at the left edge.** `Hai!` is offset 14px to the right.
6. **Replacing Kalam with another script font.** Only Kalam is allowed for handwriting.
7. **Changing the testimonial `easier` annotation into a perfect oval.** It is a hand-drawn lime stroke.
8. **Adding a newsletter, copyright, or extra footer links.** The footer is intentionally minimal.
9. **Adding 100–120px vertical gaps inside content groups.** The vertical rhythm is tight by design.
10. **Removing the small orange spark next to the hero eyebrow.** It is part of the eyebrow system.

---

## Continuation Without Breaking the Design

When the next developer or AI agent extends the site, the safest path is:

1. Read this entire `docs/` folder.
2. Inspect the live `src/` files.
3. Add new sections using the existing tokens, spacing scale, and typography rules.
4. Do not modify existing section class names or styles unless the change is required by the product owner.
5. When adding a new visual element, ask: does it appear in any documentation? If not, propose a new token and update the relevant docs.

The site is a **deliberate, locked visual system**. Every change should be evaluated against the documentation before being applied.
