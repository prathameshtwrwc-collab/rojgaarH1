# Components

This document inventories the reusable UI components of the Rojgaar Hai website.

Each component is described by its purpose, visual appearance, states, and where it is used.

---

## 1. Header / Navbar

- Fixed to top of viewport, full width.
- Background: warm off-white at 90% opacity, `backdrop-filter: blur(10px)`.
- Bottom border: `1px solid rgba(16, 26, 54, 0.06)`.
- Brand mark on the left, navigation on the right.
- Height: `76px` desktop, `64px` mobile.

### Brand Mark
- SVG mark + text "Rojgaar Hai".
- Mark color: orange.
- Text color: navy, Manrope 700, `~18px`.

### Navigation Links
- 3 links: Find Jobs, For Employers, About.
- Manrope 600, `13.5px`, charcoal.
- Hover: navy.

### Mobile Menu
- Hamburger button on the right, only visible `< 860px`.
- Animates from three lines to an `X` on open.
- Mobile nav: stacked list with 1px top border.

---

## 2. CTA Button (Pill)

The default button is the project's primary UI control. Three variants exist.

### Primary Button
- Background `#F15A24`, white text.
- Hover: `translateY(-2px)`, `box-shadow: 0 6px 16px rgba(241, 90, 36, 0.22)`.

### Secondary Button
- Background `#101A36`, white text.
- Hover: `translateY(-2px)`, `box-shadow: 0 6px 16px rgba(16, 26, 54, 0.18)`.

### Common Properties
- `height: 46px` (default) or `50px` (hero variant).
- `padding: 0 26px` (default) or `0 20px` (hero).
- `border-radius: 999px`.
- Font: Manrope 600, `14px`.
- `border: none`.
- Transition: `transform 0.18s ease, box-shadow 0.18s ease`.

### Hero Button Variant
- Adds `min-width: 196px` and includes icons (left user/briefcase, right arrow).

---

## 3. Circle CTA (Job Seekers / Employers)

Used in sections 03 and 04. A round button + inline text.

| Variant | Color | Text | Used in |
|---|---|---|---|
| Purple | `#7655D9` | Explore Jobs | Job Seekers |
| Green | `#0D604A` | Post a Job | Employers |

- Circle: 44px diameter, white arrow, soft drop shadow.
- Text: Manrope 700, 14px, navy.
- Gap between circle and text: `13px`.
- Hover: circle translates +3px right (purple) or +2px x/-2px y (green); text color shifts to the circle's accent.

---

## 4. Section Heading (Default)

Used for most section H2s.
- Font: Manrope 800.
- Line-height: `0.98–1.08`.
- Letter-spacing: `-0.035em` to `-0.04em`.
- Color: navy `#101A36`.

---

## 5. Handwritten Section Heading

Used only on the "For Job Seekers" section.
- Font: Kalam 700.
- Line-height: `0.9`.
- Color: navy `#101A36`.

---

## 6. Hero Headline Pair

- `Rojgaar`: Manrope 800, `clamp(70px, 6.3vw, 88px)`, line-height `0.86`, letter-spacing `-0.04em`.
- `Hai!`: Kalam 700, `clamp(56px, 5.35vw, 76px)`, line-height `0.96`, color `#F15A24`, slight rotation.

The pair is rendered inside a single `<h1>` for semantic correctness.

---

## 7. Eyebrow Block

- 2 lines, max-width `300px`.
- Line 1: orange `#F15A24`, weight 600.
- Line 2: navy `#101A36`, weight 600.
- Optional small spark SVG (4-point star) on the left.
- Optional hand-drawn orange underline below the second line.

---

## 8. Hand-drawn Underline / Swoosh

- SVG path with `stroke-linecap: round`.
- Used in: hero eyebrow (orange), job seekers (purple), testimonials "easier" (lime).
- Each is a single curve. Do not duplicate the exact path across different elements.

---

## 9. Process Circle (How It Works)

- 68×68px circle.
- Background: section color (purple / orange / amber / mint).
- Icon: 30×30px white stroke, `2px` width.
- Subtle outer ring via `box-shadow: 0 0 0 6px rgba(255, 255, 255, 0.04)`.
- Hover: `scale(1.04)`.

---

## 10. Connecting Dashed Line

- `background-image: linear-gradient(...)` with `background-size` repeating pattern.
- Color: `rgba(247, 181, 29, 0.7)`.
- Sits at the vertical center of the four process circles.
- On mobile, it becomes a vertical line.

---

## 11. Feature Tile

- 86×86px on desktop, 78×78px on tablet, 72×72px on mobile.
- Border-radius: `14px`.
- Pastel background (one of four).
- Icon: 32×32px on desktop, 28px on mobile, navy stroke.
- Hover: `translateY(-3px)` with soft drop shadow.

---

## 12. Stat Item

- Number: Manrope 800, orange `#F15A24`, `~28px`.
- Label: Manrope 600, charcoal `#3D4452`, `~11.5px`, `~10px` margin-top.
- No card. No background.
- Hover: `translateY(-2px)`.

---

## 13. Testimonial Card

- Border-radius: `12px`.
- Padding: `22px 20px 20px`.
- Three sizes:
  - Active: 190×230px, cream background, dark navy text, soft shadow.
  - Side: 180×210px, muted olive background, faded white text, no shadow.
- Internal content: small quote glyph, 1–2 line text, author block at the bottom.

---

## 14. Pagination Dots

- 3 dots, `8px` gap.
- Inactive: `7×7px`, `rgba(250, 248, 244, 0.32)`.
- Active: `8×8px`, `#FAF8F4`.
- Used only in the testimonials section.

---

## 15. Footer Brand

- Same `<BrandMark>` icon as the header.
- Text "Rojgaar Hai" in white, Manrope 700, 15px.

---

## 16. Footer Link

- White at 78% opacity, Manrope 500, `11.5px`.
- Hover: full white.

---

## 17. Social Icon (Footer)

- 18×18px, white stroke at 82% opacity, Manrope icon style.
- Three icons only: LinkedIn, Twitter/X, Instagram.
- Hover: full white + `translateY(-1px)`.

---

## 18. Reserved Image Container

A pattern, not a single component, but it appears in five sections.

- `.hero-artwork`, `.job-seeker-visual`, `.employer-visual`, `.stats-visual`, `.cta-visual`.
- All use `background-position: center` (or `center right` for the hero) and `background-size: contain` or `cover`.
- All are empty in the live build.
- Each is positioned absolutely on the right of its section.

These are the only "image slot" containers. They are the only place a future background image is intended to be inserted.
