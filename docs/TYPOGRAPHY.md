# Typography

The site uses **three font families** total. No other fonts are allowed.

---

## Font Families

```css
--font: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-display: 'Baloo 2', 'Manrope', sans-serif;
--font-hand: 'Caveat', cursive;
```

Google Fonts import:
```html
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Baloo+2:wght@600;700;800&family=Caveat:wght@600;700&display=swap" rel="stylesheet">
```

Manrope is the **primary** UI typeface.
Baloo 2 is used **only** for the hero `Rojgaar` word (bold rounded display headline).
Caveat is the **only** handwritten typeface, used in exactly two places. (Replaces the previously used Kalam, swapped in to match a supplied reference design.)

---

## Where Each Font Is Used

| Element | Font | Weight |
|---|---|---|
| Header brand text | Manrope | 700 |
| Header navigation | Manrope | 600 |
| Hero eyebrow | Manrope | 600 |
| Hero `Rojgaar` | Baloo 2 | 800 |
| Hero `Hai!` | Caveat | 700 |
| Hero paragraph | Manrope | 500 |
| Hero button text | Manrope | 600 |
| Job Seeker heading | Caveat | 700 |
| Job Seeker description | Manrope | 500 |
| Employer heading | Manrope | 800 |
| Employer description | Manrope | 500 |
| How It Works heading | Manrope | 700 |
| How It Works step title | Manrope | 700 |
| How It Works step description | Manrope | 400 |
| Features heading | Manrope | 800 |
| Features title | Manrope | 700 |
| Features description | Manrope | 500 |
| Stats heading | Manrope | 800 |
| Stats number | Manrope | 800 |
| Stats label | Manrope | 600 |
| Testimonial quote | Manrope | 600 |
| Testimonial author | Manrope | 700 |
| Testimonial card text | Manrope | 700 |
| Final CTA heading | Manrope | 800 |
| Final CTA description | Manrope | 500 |
| Footer brand | Manrope | 700 |
| Footer navigation | Manrope | 500 |

---

## Typography Scale (Desktop, Mobile, Tablet)

Values are taken from the live `clamp()` expressions in the source.

### Hero
| Role | Font | Size | Line-height | Letter-spacing |
|---|---|---|---|---|
| `Rojgaar` | Baloo 2 800 | `clamp(80px, 7.5vw, 100px)` | `0.86` | `-0.01em` |
| `Hai!` | Caveat 700 | `clamp(76px, 7.4vw, 100px)` | `0.9` | `0.01em` |
| Paragraph | Manrope 500 | `clamp(16px, 1.25vw, 17px)` | `1.45` | `0` |
| Eyebrow | Manrope 600 | `clamp(16px, 1.5vw, 18px)` | `1.25` | `0` |

### Job Seekers
| Role | Font | Size | Line-height |
|---|---|---|---|
| Heading | Caveat 700 | `clamp(56px, 6.5vw, 72px)` | `0.9` |
| Description | Manrope 500 | `15px` | `1.6` |
| CTA text | Manrope 700 | `14px` | `1` |

### Employers
| Role | Font | Size | Line-height |
|---|---|---|---|
| Heading | Manrope 800 | `clamp(44px, 5vw, 60px)` | `0.98` |
| Description | Manrope 500 | `15px` | `1.5` |
| CTA text | Manrope 700 | `14px` | `1` |

### How It Works
| Role | Font | Size | Line-height |
|---|---|---|---|
| Heading | Manrope 700 | `clamp(26px, 3vw, 32px)` | `1.12` |
| Step title | Manrope 700 | `16px` | `1.4` |
| Step description | Manrope 400 | `12.5px` | `1.45` |

### Features
| Role | Font | Size | Line-height |
|---|---|---|---|
| Heading | Manrope 800 | `clamp(36px, 3.8vw, 46px)` | `1.04` |
| Title | Manrope 700 | `13px` | `1.4` |
| Description | Manrope 500 | `11.5px` | `1.45` |

### Stats
| Role | Font | Size | Line-height |
|---|---|---|---|
| Heading | Manrope 800 | `clamp(28px, 3vw, 34px)` | `1.08` |
| Number | Manrope 800 | `clamp(24px, 2.2vw, 28px)` | `1` |
| Label | Manrope 600 | `11.5px` | `1.3` |

### Testimonials
| Role | Font | Size | Line-height |
|---|---|---|---|
| Quote | Manrope 600 | `clamp(28px, 2.6vw, 32px)` | `1.2` |
| Author name | Manrope 700 | `14px` | `1.3` |
| Author role | Manrope 400 | `11px` | `1.3` |
| Active card text | Manrope 700 | `13px` | `1.38` |

### Final CTA
| Role | Font | Size | Line-height |
|---|---|---|---|
| Heading | Manrope 800 | `clamp(32px, 3.8vw, 40px)` | `1.06` |
| Description | Manrope 500 | `14px` | `1.5` |

### Footer
| Role | Font | Size | Line-height |
|---|---|---|---|
| Brand | Manrope 700 | `15px` | `1.3` |
| Navigation | Manrope 500 | `11.5px` | `1.3` |

---

## Color of Type

| Color | HEX | Usage |
|---|---|---|
| Primary navy | `#101A36` | All main body and headings on light backgrounds |
| Charcoal | `#3D4452` | Secondary body text, hero description, stats label |
| Brand orange | `#F15A24` | Hero `Hai!`, brand word marks, eyebrow line 1, hero underline, stat numbers |
| Cream | `#FAF8F4` | All text on dark navy / green sections |
| Muted white | `rgba(250, 248, 244, 0.7)` | Author role text on green |
| Faded white | `rgba(250, 248, 244, 0.62–0.78)` | Side testimonial card text |

---

## Locked Type Decisions

- Manrope, Baloo 2, and Caveat are the only three fonts.
- Baloo 2 appears only on the hero `Rojgaar` word.
- Caveat appears only on the hero `Hai!` glyph and the "For Job Seekers" headline.
- Italic is only used in two places: the purple italic `right` in the features heading, and the implied handwritten accent of Caveat.
- No all-caps is used for body text. Section heading styles are sentence case.
- All section-number labels (01, 02, 03...) were removed in the final pass. They do not exist in the live site.
