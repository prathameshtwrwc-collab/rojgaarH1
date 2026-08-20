# Animations and Interactions

The Rojgaar Hai website is intentionally calm. There are no scroll-driven animations, no entrance animations, no continuous motion, no parallax, and no cursor effects.

---

## Principles

- Motion exists only to confirm a user interaction.
- Transitions are short (150–250ms).
- Easing is `ease` or `ease-out`. There are no bouncy or elastic curves.
- Nothing animates on its own.
- No element is animated more than once per interaction.

---

## Interaction Inventory

### Buttons

| Trigger | Property | Duration | Easing |
|---|---|---|---|
| Hover (primary) | `transform: translateY(-2px)` + shadow | `0.18s` | `ease` |
| Hover (secondary) | `transform: translateY(-2px)` + shadow | `0.18s` | `ease` |
| Focus | `outline` (visible only on `:focus-visible`) | n/a | n/a |

### Circle CTA (Job Seekers)

| Trigger | Property | Duration | Easing |
|---|---|---|---|
| Hover | circle `translateX(3px)` + text color → purple | `0.18s` | `ease` |

### Circle CTA (Employers)

| Trigger | Property | Duration | Easing |
|---|---|---|---|
| Hover | circle `translate(2px, -2px)` + increased shadow | `0.2s` | `ease` |

### Feature Tiles

| Trigger | Property | Duration | Easing |
|---|---|---|---|
| Hover | `translateY(-3px)` + soft drop shadow | `0.2s` | `ease` |

### How It Works Process Circle

| Trigger | Property | Duration | Easing |
|---|---|---|---|
| Hover | `scale(1.04)` | `0.2s` | `ease` |

### Stat Items

| Trigger | Property | Duration | Easing |
|---|---|---|---|
| Hover | `translateY(-2px)` | `0.18s` | `ease` |

### Testimonial Active Card

| Trigger | Property | Duration | Easing |
|---|---|---|---|
| Hover | `translateY(-3px)` | `0.22s` | `ease` |

### Footer Navigation Link

| Trigger | Property | Duration | Easing |
|---|---|---|---|
| Hover / focus | `color: #FFFFFF` (full opacity) | `0.16s` | `ease` |

### Footer Social Icon

| Trigger | Property | Duration | Easing |
|---|---|---|---|
| Hover / focus | `color: #FFFFFF` + `translateY(-1px)` | `0.16s` | `ease` |

---

## Mobile Menu

| Trigger | Property | Duration |
|---|---|---|
| Hamburger tap | `aria-expanded` toggle, body `overflow: hidden` is not applied | instant |
| Icon lines | `transform: rotate(45deg)` / `rotate(-45deg)` + `translateY(±7px)` | `0.2s ease` |
| Mobile nav appearance | conditional render | instant |

---

## Smooth Scroll

```css
html { scroll-behavior: smooth; }
```

This is a global rule. Anchor links scroll smoothly to their target.

---

## Reduced Motion

The current implementation does not include an explicit `@media (prefers-reduced-motion: reduce)` override. The motion that exists is short and only triggered by user interaction, so it does not violate reduced-motion preferences. If the project is migrated, a future enhancement is to wrap motion-only rules in a reduced-motion guard.

---

## What Is Not Animated

- Section entrance / scroll-triggered fade-ins.
- Stat number counting.
- Carousel auto-rotation.
- The reserved image slot.
- The handwritten "Hai!" glyph (its rotation is static, not animated).
- The dashed connecting line in How It Works.
- The pagination dots in Testimonials (they reflect static state, not auto-advance).

---

## Locked Motion Rules

- Do not add scroll-based reveal animations.
- Do not add auto-playing transitions.
- Do not add hover effects beyond what is documented.
- Do not animate the headline glyphs.
- Do not animate the "easier" hand-drawn annotation.
- Do not use transform `scale()` larger than `1.05` on hover.
- Do not use shadow effects on hover beyond what is documented.
