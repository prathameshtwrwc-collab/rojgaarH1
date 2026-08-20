# Spacing and Layout

This document defines the container, grid, gutters, section heights, and internal vertical rhythm used by the live build.

---

## Site Container

```css
max-width: 1280px;
margin: 0 auto;
```

Desktop page horizontal padding:

```css
padding-inline: 48px; /* via width: calc(100% - 48px) */
```

The 1280px container is the maximum content width. All section inner wrappers share this rule.

---

## Section Heights

The site deliberately does **not** use `100vh`. Every section has a content-driven `min-height`.

| Section | Min-height (desktop) |
|---|---|
| Hero | `min-height: 720px; height: min(84vh, 780px)` |
| Job Seekers | `640px` |
| Employers | `640px` |
| How It Works | `580px` |
| Features | `580px` |
| Stats | `560px` |
| Testimonials | `580px` |
| Final CTA | `520px` |
| Footer | `76px` |

These heights are content-driven. They are not viewport-relative.

---

## Header

- Height: `76px` desktop, `64px` mobile.
- Background: `rgba(250, 248, 244, 0.9)` with `backdrop-filter: blur(10px)`.
- Bottom border: `1px solid rgba(16, 26, 54, 0.06)`.
- Logo and brand text on the left, navigation on the right (desktop).
- Mobile: hamburger toggle reveals a stacked mobile nav.

---

## Hero Spacing

Desktop vertical rhythm from the top of the hero content:

1. Eyebrow block — orange/navy 2-line text.
2. Hand-drawn orange underline SVG, `~96px` wide, placed below the second eyebrow line.
3. `Rojgaar` line.
4. `Hai!` line, slightly rotated `-1.4deg`, `padding-left: 14px` from the left edge of `Rojgaar`.
5. Supporting paragraph, `~420px` max width.
6. Two CTAs, `16px` apart.

Hero content is vertically centered with a small upward offset (`transform: translateY(-12px)`).

---

## Internal Section Spacing

Most sections use `padding: 72px 0` for vertical breathing room inside the section. The testimonials section uses `padding: 64px 0 24px`.

---

## Hero Grid

| Column | Width | Purpose |
|---|---|---|
| Left | `flex: 0 0 50%` (max 540px) | Foreground content |
| Right | `flex: 0 0 50%` | Reserved background image area |

On tablet/mobile the grid collapses to a single column. The reserved right area collapses below the content as a `width: 100%; height: 280px` container.

---

## Section Column Ratios

| Section | Content column | Visual column |
|---|---|---|
| Job Seekers | `45%` (max 440px) | `52%` absolute right |
| Employers | `43%` (max 420px) | `55%` absolute right |
| Stats | `56%` (max 640px) | `46%` absolute right |
| Final CTA | `55%` (max 560px) | `45%` absolute right |
| Testimonials | `46%` (max 460px) | `flex` carousel |

---

## Gaps

| Location | Gap |
|---|---|
| Hero buttons | `16px` |
| Hero actions → paragraph | `28px` (margin-bottom) |
| Features tiles | `22px` desktop, `32px 24px` mobile |
| Stats items | `clamp(32px, 4vw, 58px)` |
| How It Works steps | `24px` |
| Footer nav | `clamp(18px, 2.2vw, 28px)` |
| Footer socials | `20px` |
| Testimonials inner | `40px` |

---

## Vertical Rhythm — Hero Group

| Step | Gap |
|---|---|
| Eyebrow → underline | inline |
| Eyebrow → headline | `28px` |
| Headline → paragraph | `24px` |
| Paragraph → CTAs | `20px` (then `16px` between buttons) |

The eyebrow and headline must feel like one intentional group, not two unrelated blocks.

---

## Card Spacing

- Feature tile: 86×86px, 14px radius, `16px` margin below before title.
- How It Works icon: 68×68px circle, 6px ring via box-shadow, `18px` margin below before title.
- Testimonial active card: 190×230px, 12px radius, `14px` margin-right/left to neighbours.
- Testimonial side card: 180×210px, 12px radius.

---

## Mobile Spacing

- Page padding drops to `5vw`.
- Section vertical padding drops to `~56px` top, `0–8px` bottom.
- Section inner min-heights collapse to auto.
- Stats, Features, How It Works grids become stacked vertical.
- Testimonials collapse to single column with the active card dominant.

---

## Locked Layout Decisions

- No section uses `100vh`.
- The site container is 1280px with 48px gutter.
- Mobile padding is `5vw`, not 24px, to scale on small screens.
- The hero is a 50/50 split desktop and a single column on mobile.
- The right side of the hero is always reserved. It must not become a content column.
