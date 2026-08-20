# Rojgaar Hai — Project Documentation

Welcome to the Rojgaar Hai website documentation. This directory is the **source of truth for the visual design, implementation rules, and migration guidance** for the Rojgaar Hai recruitment marketplace landing page.

A new developer or AI coding agent should be able to open this folder and fully understand the project's design intent, the current implementation, and the rules that must be preserved.

---

## What is Rojgaar Hai?

Rojgaar Hai is a modern Indian recruitment marketplace that bridges job seekers and employers. The website is a single-page marketing site that introduces the platform, explains who it serves, and guides users toward either the job-seeker or employer onboarding path.

The design is intentionally **editorial, human, and premium** — it does not look like a generic SaaS landing page.

---

## Design Philosophy

The site is built around five core ideas:

1. **Typography is the hero.** The right side of the hero is intentionally empty. It is reserved for a future background image. Headline typography carries the page.
2. **Editorial whitespace.** Sections breathe. Content is grouped compactly inside controlled containers, not stretched to fill the viewport.
3. **Warm, off-white canvas.** The page is not stark white. The base background is `#FAF8F4`.
4. **Restrained accent palette.** Brand orange and dark navy are the only two dominant colors. Purple, green, and cream are used sparingly as section accents.
5. **Honest imagery.** Decorative illustration is avoided. When visuals are needed, they will be real artwork or photography, inserted manually by the design owner.

---

## How to Use This Documentation

Start with `DESIGN_SYSTEM.md` and `HERO_SECTION.md`. Those two files contain the highest-density decisions that must not be violated.

If you are migrating the project to a new environment, read `MIGRATION_GUIDE.md` first to understand the contract between the source and destination.

---

## Reading Order

1. `DESIGN_SYSTEM.md`
2. `VISUAL_TREATMENT.md`
3. `TYPOGRAPHY.md`
4. `COLOR_SYSTEM.md`
5. `SPACING_AND_LAYOUT.md`
6. `HERO_SECTION.md`
7. `SECTIONS.md`
8. `COMPONENTS.md`
9. `RESPONSIVE_DESIGN.md`
10. `ASSETS_AND_IMAGES.md`
11. `ICONOGRAPHY.md`
12. `ANIMATIONS_AND_INTERACTIONS.md`
13. `CONTENT_GUIDELINES.md`
14. `ACCESSIBILITY.md`
15. `TECHNICAL_UI_RULES.md`
16. `MIGRATION_GUIDE.md`

---

## Document Index

| File | Purpose |
|---|---|
| `DESIGN_SYSTEM.md` | Brand personality, design principles, what to avoid, locked decisions |
| `VISUAL_TREATMENT.md` | Backgrounds, surfaces, borders, shadows, organic accents |
| `TYPOGRAPHY.md` | Font families, weights, sizes, line-heights, scale |
| `COLOR_SYSTEM.md` | All HEX values and usage rules |
| `SPACING_AND_LAYOUT.md` | Container, grid, gutters, section heights, vertical rhythm |
| `HERO_SECTION.md` | Hero geometry, content, the empty right-side rule |
| `SECTIONS.md` | Every section in order: purpose, layout, content, behavior |
| `COMPONENTS.md` | Reusable UI components |
| `RESPONSIVE_DESIGN.md` | Desktop, tablet, mobile behavior |
| `ASSETS_AND_IMAGES.md` | Asset inventory and the reserved hero image slot |
| `ICONOGRAPHY.md` | Icon style, sizes, stroke width |
| `ANIMATIONS_AND_INTERACTIONS.md` | Hover, transition, motion rules |
| `CONTENT_GUIDELINES.md` | Current copy and writing style |
| `ACCESSIBILITY.md` | Semantic HTML, focus, contrast, reduced motion |
| `TECHNICAL_UI_RULES.md` | How to implement the design in code |
| `MIGRATION_GUIDE.md` | Step-by-step contract for moving the project |
