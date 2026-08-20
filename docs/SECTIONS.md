# Sections

This document describes every section of the homepage in order, exactly as it exists in the live build.

---

## Section Order

```
1. Header
2. Hero
3. For Job Seekers
4. For Employers
5. How It Works (Simple Steps. Powerful Outcomes.)
6. Features (All the right features...)
7. Statistics
8. Testimonials
9. Final CTA
10. Footer
```

Section numbers and section labels (e.g. "01", "FOR JOB SEEKERS") are **not displayed** in the live build. They were removed during the final design pass.

---

## 1. Header

- Fixed at the top, `76px` desktop, `64px` mobile.
- Background: warm off-white with a `10px` backdrop blur.
- Hairline bottom border `rgba(16, 26, 54, 0.06)`.
- Brand mark on the left (orange `<BrandMark>` icon + "Rojgaar Hai" text, with a small gray tagline "Connecting Talent. Creating Futures." stacked underneath).
- Navigation: For Job Seekers, For Employers, About Us, Resources.
- Right side: dark navy "Get Started" pill button with a right-arrow icon.
- Mobile: hamburger toggle reveals a stacked mobile nav (same 4 links) plus a full-width "Get Started" pill, with a 1px top border.

---

## 2. Hero

See `HERO_SECTION.md` for the complete hero specification.

Summary:
- Background `#FAF8F4`.
- Two-column 50/50 split.
- Left: eyebrow, underline, `Rojgaar`, `Hai!`, paragraph, two CTAs.
- Right: empty reserved image slot.
- No green oval, no placeholder visuals, no decorative shapes.

---

## 3. For Job Seekers

- Background `#FAF8F4`.
- Two-column 45/52 layout, content on the left, visual area on the right.
- Heading: "For / Job Seekers" in Kalam 700.
- Swoosh: purple `#7655D9` hand-drawn underline SVG.
- Description: "Discover opportunities that match your skills and ambition."
- CTA: 44px purple circle with white arrow + "Explore Jobs" text.
- Right side: `.job-seeker-visual` empty placeholder for future artwork.

---

## 4. For Employers

- Background `#FAF3E3` (the only cream section).
- Two-column 43/55 layout, content on the left, visual area on the right.
- Heading: "For / Employers" in Manrope 800.
- Description: "Find the right talent. Faster. / Smarter. Better."
- CTA: 44px green `#0D604A` circle with white arrow + "Post a Job" text.
- Right side: `.employer-visual` empty placeholder.

---

## 5. How It Works (Simple Steps. Powerful Outcomes.)

- Background `#06182D` (deep navy).
- Centered heading: "Simple Steps." in white, "Powerful Outcomes." in orange `#F15A24`.
- Four process steps horizontally on desktop, vertically on mobile:
  1. **Discover** — purple circle, magnifying glass.
  2. **Apply** — orange circle, document.
  3. **Connect** — amber `#F7B51D` circle, two connected people.
  4. **Grow** — mint `#65B993` circle, rocket.
- All circles are 68×68px, white icon strokes.
- A dashed amber line `rgba(247, 181, 29, 0.7)` connects the four circles horizontally on desktop and vertically on mobile.

---

## 6. Features (All the right features. In all the right ways.)

- Background `#FAF8F4`.
- Heading on the left, 4 pastel feature tiles on the right.
- Heading: "All the right / features. In all / the right ways." with the final `right` in italic purple.
- 4 feature tiles:
  1. Smart Matching — lavender `#DDD6F5`, lightning bolt.
  2. Verified Employers — mint `#D6EAD9`, shield + check.
  3. Career Insights — peach `#F8DEC5`, growth chart.
  4. Real-time Alerts — blue-grey `#DCE6F2`, bell.
- Icons in `#101A36` stroke.
- Mobile: 2×2 grid.

---

## 7. Statistics (Trusted by thousands. Growing every day.)

- Background `#FAF8F4`.
- Heading left, four statistics in a horizontal strip, then a reserved right visual area.
- Four stats: `50K+` Job Seekers, `5K+` Employers, `20K+` Jobs Posted, `95%` Satisfaction Rate.
- Numbers: orange `#F15A24`, Manrope 800, `~28px`.
- Labels: charcoal `#3D4452`, Manrope 600, `~11.5px`.
- Right side: `.stats-visual` empty placeholder.
- Mobile: 2×2 grid.

---

## 8. Testimonials

- Background `#063D32` (forest green).
- Featured quote on the left, three overlapping testimonial cards on the right.
- Featured quote: "Rojgaar Hai made my job search easier and my career better."
- The word `easier` has a lime `#C8D94A` hand-drawn SVG loop tightly around it.
- Author: "— Neha Sharma / Product Designer".
- Three cards:
  - Left (back): muted olive `#5D6346`, 180×210px.
  - Center (active): cream `#FAF8F4`, 190×230px, dark navy text.
  - Right (back): muted olive, 180×210px.
- Pagination dots: 3 dots, middle one active white.
- Mobile: single column, active card remains dominant.

---

## 9. Final CTA

- Background `#FAF8F4`.
- Heading: "Your next opportunity / is just a click away." with the word `click` in orange.
- Description: "Whether you're hiring or job hunting, / Rojgaar Hai is here to help you win."
- Two CTAs: orange Job Seeker + navy Employer.
- Right side: `.cta-visual` empty placeholder.
- Mobile: stacked.

---

## 10. Footer

- Background `#071A36`.
- Single horizontal row:
  - Left: brand mark + "Rojgaar Hai".
  - Center: About Us, Contact, Blog, Privacy Policy, Terms.
  - Right: LinkedIn, Twitter/X, Instagram icons.
- Compact, ~76px tall.
- Mobile: stacked.

---

## Section Background Colors (Reference)

| Section | Background |
|---|---|
| Hero | `#FAF8F4` |
| For Job Seekers | `#FAF8F4` |
| For Employers | `#FAF3E3` |
| How It Works | `#06182D` |
| Features | `#FAF8F4` |
| Statistics | `#FAF8F4` |
| Testimonials | `#063D32` |
| Final CTA | `#FAF8F4` |
| Footer | `#071A36` |

The page reads as alternating warm/cool blocks. The transitions are created by background color changes, not by visible borders.
