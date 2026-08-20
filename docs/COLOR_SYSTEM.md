# Color System

This document lists every color actually used in the live build, where each one is used, and where it must not be used. Values are taken directly from the CSS source.

---

## Primary Brand Colors

| Token | Name | HEX | RGB (approx) | Primary Use |
|---|---|---|---|---|
| `--navy` | Brand Navy | `#101A36` | `16, 26, 54` | All primary type on light backgrounds, secondary CTA, footer text |
| `--orange` | Brand Orange | `#F15A24` | `241, 90, 36` | Brand accent, hero `Hai!`, eyebrow line 1, stat numbers, primary CTA, hero underline |

These two colors carry the brand. All other colors are section-specific or supportive.

---

## Backgrounds

| Token | Name | HEX | Usage |
|---|---|---|---|
| `--bg-warm` | Warm Off-White | `#FAF8F4` | Page base, hero, job seekers, features, stats, final CTA |
| `--bg-cream` | Cream | `#FAF3E3` | Employers section |
| `--navy-deep` | Deep Navy | `#06182D` | How It Works section |
| `--green-dark` | Forest Green | `#063D32` | Testimonials section |
| `--navy-footer` | Footer Navy | `#071A36` | Site footer only |
| `--white` | White | `#FFFFFF` | Button text, active testimonial card, button icon strokes |

---

## Supportive Accent Colors

| Token | Name | HEX | Usage |
|---|---|---|---|
| `--charcoal` | Charcoal | `#3D4452` | Body text on warm background, stats label, card muted text |
| `--purple` | Purple | `#7655D9` | Job Seekers swoosh, Job Seeker CTA circle, How It Works Discover step, italic `right` in Features heading, pastel lavender feature tile base |
| `--green` | Employer Green | `#0D604A` | Employer CTA circle |
| `--olive` | Muted Olive | `#5D6346` | Side testimonial cards |
| `--lime` | Lime Accent | `#C8D94A` | "easier" hand-drawn highlight stroke |
| `--hero-charcoal` | Hero Body Color | `#27344D` | Hero description text |

---

## Pastel Feature Tile Colors

Used only on the four feature tiles in section 05.

| Tile | Token | HEX | Icon Theme |
|---|---|---|---|
| Smart Matching | tile-lavender | `#DDD6F5` | Lightning bolt |
| Verified Employers | tile-mint | `#D6EAD9` | Shield + check |
| Career Insights | tile-peach | `#F8DEC5` | Growth chart |
| Real-time Alerts | tile-bluegrey | `#DCE6F2` | Bell |

All icons inside the pastel tiles use `#101A36` (brand navy) stroke.

---

## How It Works Process Colors

| Step | Color | HEX |
|---|---|---|
| Discover | Purple | `#7655D9` |
| Apply | Orange | `#F15A24` |
| Connect | Amber | `#F7B51D` |
| Grow | Mint Green | `#65B993` |

All icon strokes are white. The connecting dashed line between the four circles is amber `rgba(247, 181, 29, 0.7)`.

---

## Card / Surface Colors

| Surface | HEX | Where |
|---|---|---|
| Active testimonial card | `#FAF8F4` | Center of testimonial group |
| Side testimonial card | `#5D6346` | Left and right of testimonial group |
| How It Works icon rings | `rgba(255, 255, 255, 0.04)` | Faint outer ring around the four step circles |

---

## Opacity Layer

| Use | RGBA |
|---|---|
| Header bottom border | `rgba(16, 26, 54, 0.06–0.07)` |
| How It Works dashed line | `rgba(247, 181, 29, 0.7)` |
| Author role on green | `rgba(250, 248, 244, 0.7)` |
| Side card text | `rgba(250, 248, 244, 0.62–0.78)` |
| Dot indicators (inactive) | `rgba(250, 248, 244, 0.3)` |
| Active card border | `rgba(16, 26, 54, 0.05)` |
| Step icon ring | `rgba(255, 255, 255, 0.04)` |

---

## Tokens (CSS Variable Names Already Defined)

The current implementation exposes these CSS custom properties at `:root`:

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

These are the single source of truth for the live build. Migration code should use them.

---

## Where Each Color Must Not Be Used

- `--orange` must not be used for body copy.
- `--navy` must not be used as a section background.
- `--purple` must not be used outside the Job Seekers section, the Discover step, the italic `right`, and the Smart Matching tile.
- `--green` must not be used for body copy.
- `--bg-cream` must not be used outside the Employers section.
- `--green-dark` must not be used outside the Testimonials section.
- The pastel tile colors must not be reused as section backgrounds.

---

## What Was Removed

- A green oval behind the hero `Hai!` glyph — gone.
- A soft green blob behind/around the right hero area — gone.
- A right-side "career connection" visual with cards, avatars, and dashed connection lines — gone.
- Decorative green SVG accents in the hero — none exist.

These are documented in `DESIGN_SYSTEM.md` under "Locked Decisions" so future developers do not reintroduce them.
