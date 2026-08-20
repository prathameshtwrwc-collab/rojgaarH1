# Assets and Images

This document inventories every asset currently used in the live build and explicitly documents the reserved image slots that will be filled later.

---

## Asset Inventory

### Logo / Brand Mark

- `<BrandMark>` SVG component.
- Used in the header and the footer.
- Color in the header: orange `#F15A24` (currentColor).
- Color in the footer: white.
- 30×30px in the header, 24×24px in the footer.

### Fonts

- Manrope (Google Fonts): weights 400, 500, 600, 700, 800.
- Kalam (Google Fonts): weights 300, 400, 700.
- Imported once in `src/index.css` and again in `src/App.css`.

### Icons

All icons are inline SVGs, no external icon library is used.

| Icon | Used in | Style |
|---|---|---|
| Sparkle (4-point) | Hero eyebrow | thin orange stroke |
| User / person | Hero Job Seeker button | white stroke 2px |
| Briefcase | Hero Employer button | white stroke 2px |
| Right arrow | Hero buttons | white stroke 2px |
| Right arrow (top-right) | Job Seekers / Employers circle CTAs | white stroke |
| Magnifying glass | How It Works Discover | white stroke 2px |
| Document | How It Works Apply | white stroke 2px |
| Two connected people | How It Works Connect | white stroke 2px |
| Rocket | How It Works Grow | white stroke 2px |
| Lightning bolt | Features Smart Matching | navy stroke 2px |
| Shield + check | Features Verified Employers | navy stroke 2px |
| Growth chart | Features Career Insights | navy stroke 2px |
| Bell | Features Real-time Alerts | navy stroke 2px |
| LinkedIn | Footer | white stroke 1.8px |
| Twitter/X | Footer | white stroke 1.8px |
| Instagram | Footer | white stroke 1.8px |

### Decorative SVGs

| SVG | Used in | Color |
|---|---|---|
| Eyebrow underline path | Hero eyebrow | `#F15A24` |
| Job Seeker swoosh | "For Job Seekers" heading | `#7655D9` |
| "easier" annotation | Testimonials | `#C8D94A` |
| Hamburger lines | Mobile menu | navy |

### Backgrounds

No raster background images are currently used. All section backgrounds are flat color.

---

## Reserved Image Containers

The site contains five empty containers, each reserved for a future background image or artwork layer. None of them are populated in the current build.

| Container | Section | Intended content |
|---|---|---|
| `.hero-artwork` | Hero | The full hero background composition (orange arch, person, door, plants, abstract shapes) |
| `.job-seeker-visual` | For Job Seekers | Person + floating job cards + abstract purple shape |
| `.employer-visual` | For Employers | People + green/cream platforms + search icon |
| `.stats-visual` | Statistics | Orange rising curve + circular portraits |
| `.cta-visual` | Final CTA | Hot-air balloon + abstract floating objects |

### How to insert a future image

For the hero, the recommended insertion is:

```css
.hero-artwork {
  background-image: url('/images/hero-bg.png');
  background-position: center right;
  background-repeat: no-repeat;
  background-size: contain;
}
```

Or as an absolutely positioned `<img>`:

```html
<div className="hero-artwork">
  <img src="/images/hero-bg.png" alt="" />
</div>
```

The other four visual containers follow the same pattern. Each already has `background-color` matching the section so the area reads as "intentionally empty" until the image is added.

### Rules for reserved containers

- Do not generate or insert placeholder artwork.
- Do not insert `<img>` tags with stock photography.
- Do not use gradients to imply missing content.
- Do not change the container's color or size.
- Do not collapse the container on any viewport.
- Do not rename the class.

---

## What Must Not Be Replaced

- The `<BrandMark>` SVG. It is the only brand mark in use.
- The Manrope + Kalam font pair. No other fonts.
- The orange eyebrow underline path.
- The purple Job Seeker swoosh path.
- The lime "easier" annotation path.
- Any of the inline SVG icons in buttons, features, or process circles.

---

## Asset Migration Checklist

During migration to VS Code, confirm the following assets are present in the destination:

- [ ] `Manrope` font is loaded.
- [ ] `Kalam` font is loaded.
- [ ] All SVG icons render correctly.
- [ ] Decorative SVG paths render with the correct stroke color.
- [ ] All five reserved image containers exist with the correct class names.
- [ ] No raster images are referenced in the live CSS.
- [ ] No `<img>` tags with stock photos are present in the React tree.
