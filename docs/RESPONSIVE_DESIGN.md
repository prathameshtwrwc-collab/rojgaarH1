# Responsive Design

This document describes the responsive behavior of every section. Values come from the live `clamp()` and `@media` rules.

---

## Breakpoints

The site uses three breakpoints:

| Name | Width | Behavior |
|---|---|---|
| Desktop | `>= 1025px` | Full two-column compositions |
| Tablet | `768px–1024px` | Reduced columns, smaller typography |
| Mobile | `<= 860px` | Single column, content stacking |
| Small mobile | `<= 480px` | Stacked buttons, compressed padding |

The mobile-vs-tablet boundary is at `860px`. The footer collapses at `860px`. The hero switches to mobile composition at `860px`.

---

## Container

| Viewport | Container width | Page padding |
|---|---|---|
| >= 1280px | 1280px | 48px |
| 1024–1279px | `calc(100% - 48px)` | 48px |
| 768–1023px | `calc(100% - 6vw)` | 6vw |
| < 768px | `calc(100% - 5vw)` | 5vw |

---

## Hero

| Viewport | Layout | Right column | Headline |
|---|---|---|---|
| Desktop | 50/50 split | 50% width, `min-height: 720px` | `Rojgaar` `clamp(70px, 6.3vw, 88px)`, `Hai!` `clamp(56px, 5.35vw, 76px)` |
| Tablet | 50/50 split | reduced | same as desktop |
| Mobile (<860) | single column | becomes 100%-width block under content, `height: 280px` | `Rojgaar` `clamp(56px, 13vw, 68px)`, `Hai!` `clamp(44px, 10vw, 56px)` |
| Small mobile (<480) | same as mobile | `height: 220px` | same as mobile, buttons stack full-width |

The reserved right area is always present. It is never deleted, only resized.

---

## Header

| Viewport | Height | Navigation | Mobile menu |
|---|---|---|---|
| Desktop | 76px | visible | hidden |
| < 860px | 64px | hidden | hamburger toggle |

The mobile menu animates the hamburger icon into an `X` on open.

---

## For Job Seekers

| Viewport | Layout | Heading | Visual |
|---|---|---|---|
| Desktop | 45% content / 52% visual (absolute right) | `clamp(56px, 6.5vw, 72px)` | absolute right |
| < 860px | single column | `clamp(48px, 13vw, 60px)` | becomes 100%-width block under content, `height: 260px` |
| < 480px | same as mobile | same | `height: 220px` |

---

## For Employers

| Viewport | Layout | Heading | Visual |
|---|---|---|---|
| Desktop | 43% content / 55% visual | `clamp(44px, 5vw, 60px)` | absolute right |
| < 860px | single column | `clamp(44px, 12vw, 54px)` | 100% width, `height: 260px` |
| < 480px | same | same | `height: 220px` |

---

## How It Works

| Viewport | Layout |
|---|---|
| Desktop | horizontal 4-step row with dashed connecting line |
| < 860px | vertical stack, dashed line becomes vertical |
| < 480px | heading shrinks to `24px` |

The process circles stay 60×60px on mobile (down from 68px desktop).

---

## Features

| Viewport | Layout | Tile size |
|---|---|---|
| Desktop | left heading / right 4 tiles horizontal | 86×86px |
| < 860px | stacked, 2×2 grid | 78×78px |
| < 480px | 2×2 grid | 72×72px |

---

## Statistics

| Viewport | Layout |
|---|---|
| Desktop | heading + 4 stats in a horizontal strip |
| < 860px | heading + 2×2 grid of stats, visual area below |
| < 480px | heading shrinks to `28px`, visual becomes `height: 220px` |

---

## Testimonials

| Viewport | Layout |
|---|---|
| Desktop | quote left (46%), 3-card carousel right |
| < 1024px | quote + carousel with reduced gap |
| < 860px | single column, quote above, carousel below |
| < 480px | active card remains dominant, side cards smaller |

---

## Final CTA

| Viewport | Layout |
|---|---|
| Desktop | heading + buttons left, empty visual right |
| < 860px | single column, visual below content |
| < 480px | buttons stack full-width |

---

## Footer

| Viewport | Layout |
|---|---|
| Desktop | 3-column horizontal row: brand / nav / socials |
| < 860px | stacked, 3 rows, centered |
| < 480px | nav wraps, socials below |

---

## Locked Responsive Rules

- No section uses `100vh` at any breakpoint.
- All content containers are centered with the 1280px max.
- The hero reserved right slot shrinks to a horizontal block on mobile, not a vertical strip.
- Buttons stack vertically on mobile but only on `< 480px` viewports.
- Section numbers and labels never reappear at any breakpoint. They were removed.
