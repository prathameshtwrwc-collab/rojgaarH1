# Hero Section

The hero is the most carefully designed part of the site. It is **typography-led** and **image-reserved**. This document is the authoritative description of its current state.

---

## 1. The Right Side Is Reserved — Not Empty By Mistake

The right side of the hero is a **reserved image slot**, not a forgotten empty area. It is intentionally empty in the live build so that a real background image can be inserted manually during migration.

The reserved container is `.hero-artwork` and currently has no children, no background image, no decorative shapes.

Rules:

- Do not generate placeholder artwork.
- Do not insert fake cards, candidate cards, or recruiter cards.
- Do not add green or orange circles, ovals, or blobs.
- Do not add dashed connection lines or nodes.
- Do not use gradients to imply a missing image.
- Do not add `<img>` tags with stock photography.

When a real image is added, it should use the existing container. The recommended CSS is:

```css
.hero-artwork {
  background-position: center right;
  background-repeat: no-repeat;
  background-size: contain;
  background-image: url('/path/to/image.png');
}
```

Do not crop, stretch, or distort the inserted image. The container is configured to preserve the natural image.

---

## 2. No Green Oval Behind `Hai!`

There is **no** green oval, ellipse, blob, or background shape behind or around the hero `Hai!` text.

This was a design exploration that was explicitly removed in the latest refinement. The `Hai!` glyph is rendered against the page's normal warm off-white background.

If a future developer sees a green shape in the hero during migration, it is a bug. The implementation should not have it.

The only green color in the hero is the brand mark icon (orange, not green) and the small `<BrandMark>` SVG used by the header. Nothing else in the hero is green.

---

## 3. Hero Composition (Current Live State)

The hero is a 50/50 desktop split with the foreground on the left and the reserved image slot on the right.

### Left column — exact order

1. **Eyebrow block** with a small editorial sparkle.
   - `Opportunities don't happen.`
   - `We make them happen.`
2. **Orange hand-drawn underline** SVG.
3. **`Rojgaar`** — Baloo 2 800, navy, `clamp(80px, 7.5vw, 100px)`, line-height `0.86`, letter-spacing `-0.01em`.
4. **`Hai!`** — Caveat 700, orange `#F15A24`, `clamp(100px, 9.6vw, 132px)`, line-height `0.72`, `margin-top: -14px` (pulled up tight against `Rojgaar` so the two words read as one brand mark), `transform: rotate(-2deg)`, `padding-left: 16px`.
5. **Supporting paragraph** — Manrope 500, `clamp(16px, 1.25vw, 17px)`, color `#27344D`, max-width `420px`, line-height `1.45`.
6. **CTA row** — two pill buttons with user/briefcase icons and right arrows.

### Right column

7. **`.hero-artwork`** — completely empty.

---

## 4. Hero Copy — Do Not Change

The hero copy is final. Future work may add new sections but should not rewrite the hero text.

```text
Opportunities don't happen.
We make them happen.

Rojgaar
Hai!

A better career. The right talent.
Real connections that build the future.

I am a Job Seeker →
I am an Employer →
```

---

## 5. Hero Sizing and Spacing

| Property | Value |
|---|---|
| Background color | `#FAF8F4` |
| `min-height` | `720px` |
| `height` | `min(84vh, 780px)` |
| `padding-top` | `8px` (after fixed header) |
| `padding-bottom` | `32px` |
| `padding-inline` | `48px` (in container) |
| Left column | `flex: 0 0 50%`, max `540px` |
| Right column | `flex: 0 0 50%` |
| Vertical content offset | `transform: translateY(-12px)` |

---

## 6. Eyebrow Block

- Container: `.hero-eyebrow` with `padding-left: 26px` to leave room for the small spark.
- Spark: a 4-point star SVG, 18×18px, orange `#F15A24`, stroke-width `1.7`.
- Line 1: `Opportunities don't happen.` — color `#F15A24`, weight 600.
- Line 2: `We make them happen.` — color `#101A36`, weight 600.
- Underline: `<svg class="eyebrow-underline">` with a 62px-wide, subtle organic path, stroke `#F15A24`, `1.6px`, round caps, slight curve, sitting under "We make them happen."

---

## 7. Headline Geometry

`Rojgaar` and `Hai!` must read as **one brand mark**, not two unrelated lines.

| Property | `Rojgaar` | `Hai!` |
|---|---|---|
| Font | Baloo 2 800 | Caveat 700 |
| Color | `#101A36` | `#F15A24` |
| Desktop size | `~100px` | `~132px` |
| Mobile size | `~56–68px` | `~68–88px` |
| Line-height | `0.86` | `0.72` |
| Letter-spacing | `-0.01em` | `0.01em` |
| Transform | none | `rotate(-2deg)` |
| Padding-left | none | `16px` |
| Margin-top | none | `-14px` (tight stack against `Rojgaar`) |

The `Hai!` rotation is intentional and very slight. It adds an organic feel without making the text look broken.

---

## 8. Supporting Paragraph

```text
A better career. The right talent.
Real connections that build the future.
```

- Font: Manrope 500.
- Size: `clamp(16px, 1.25vw, 17px)`.
- Line-height: `1.45`.
- Color: `#27344D`.
- Max-width: `420px`.

---

## 9. CTAs

The hero uses the same pill button component as the rest of the site.

| Property | Value |
|---|---|
| Height | `50px` |
| Padding | `0 20px` |
| Min-width | `196px` |
| Radius | `999px` |
| Font | Manrope 600, `14px` |
| Job Seeker background | `#F15A24` |
| Employer background | `#101A36` |
| Icon size | `18px` (left), `16px` (right arrow) |
| Icon stroke | currentColor, white, `2px` |
| Gap | `16px` |

Icons are:
- Job Seeker: simple outline user/person icon.
- Employer: simple outline briefcase icon.
- Both buttons also include a small right-arrow icon.

---

## 10. Mobile Hero

The hero collapses to a single column below `860px`.

| Behavior | Value |
|---|---|
| Flex direction | `column` |
| Content width | `100%`, max `520px` |
| Vertical transform | removed |
| Right column | becomes a 100%-width block under the content, `height: 280px` |
| `Rojgaar` mobile size | `clamp(56px, 13vw, 68px)` |
| `Hai!` mobile size | `clamp(44px, 10vw, 56px)` |
| Buttons | wrap, then stack to full-width below `480px` |

The reserved image area continues to be `.hero-artwork` and remains empty on mobile until a future image is added.

---

## 11. Things That Do Not Exist In The Hero

The following were explored and removed. They must not be reintroduced:

- Green oval / ellipse / blob behind `Hai!`.
- Hero background illustration, photograph, or AI-generated art.
- Floating candidate, recruiter, or job cards.
- A "match score" chip.
- An "interview invite" chip.
- Dashed connection lines and nodes.
- An orange arch, a person, a door — these are reference elements, not current implementation.
- Stock photography.
- Decorative SVG sparkles inside the headline itself.
- Section-number labels (01, HERO SECTION).

---

## 12. Hero Implementation Snippet (For Reference)

```html
<section className="hero">
  <div className="hero-inner">
    <div className="hero-content">
      <div className="hero-eyebrow">
        <svg className="eyebrow-spark">...</svg>
        <span className="eyebrow-line1">Opportunities don't happen.</span>
        <span className="eyebrow-line2">We make them happen.</span>
        <svg className="eyebrow-underline">...</svg>
      </div>

      <h1 className="hero-title">
        <span className="title-rojgaar">Rojgaar</span>
        <span className="title-hai">Hai!</span>
      </h1>

      <p className="hero-description">A better career. The right talent.<br />Real connections that build the future.</p>

      <div className="hero-actions">
        <button className="btn btn-hero btn-primary">...Job Seeker</button>
        <button className="btn btn-hero btn-secondary">...Employer</button>
      </div>
    </div>

    <div className="hero-artwork" aria-hidden="true" />
  </div>
</section>
```

The `.hero-artwork` element is the only reserved image slot in the entire site.
