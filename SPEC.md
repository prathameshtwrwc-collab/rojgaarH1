# Rojgaar Hai — Hero Section Specification

## Concept & Vision

A premium, editorial-style hero section for an Indian recruitment marketplace. The design embodies professionalism and warmth through clean typography, restrained color palette, and generous whitespace. It feels like a sophisticated employment platform — not a generic SaaS product.

## Design Language

### Aesthetic Direction
Clean editorial layout inspired by premium Indian employment platforms. Minimal decoration, maximum typographic impact. The warmth comes from the off-white background and carefully chosen orange accents, not from gradients or 3D elements.

### Color Palette
- **Background:** `#FAF8F4` (warm off-white)
- **Primary Orange:** `#E85A2C` (red-orange for accents)
- **Dark Navy:** `#1A1F36` (headlines, secondary button)
- **Charcoal:** `#3D4452` (body text)
- **White:** `#FFFFFF` (button text)

### Typography
- **Font Family:** Inter (Google Font) with system fallbacks
- **Brand/Logo:** 700 weight, 18px
- **Headline:** 700 weight, 64-72px, tight letter-spacing (-0.02em)
- **Description:** 400 weight, 16-18px, comfortable line-height (1.6)
- **Buttons:** 600 weight, 14-16px

### Spatial System
- Hero height: 100vh desktop
- Left content: 50-52% width
- Right visual: 48-50% width
- Container max-width: 600px
- Horizontal padding: 8-10vw
- Vertical rhythm based on 8px grid

### Motion Philosophy
- Subtle button hover: translateY(-2px) with soft shadow
- Transitions: 150-200ms ease-out
- No bouncing, glowing, or attention-grabbing animations

## Layout & Structure

### Desktop Layout
```
┌─────────────────────────────────────────────────────────┐
│ ┌──────────────────┐  ┌───────────────────────────────┐  │
│ │                  │  │                               │  │
│ │  🔶 Rojgaar Hai  │  │                               │  │
│ │                  │  │                               │  │
│ │  Rojgaar         │  │                               │  │
│ │  Hai !           │  │      [FUTURE IMAGE AREA]      │  │
│ │                  │  │                               │  │
│ │  Bridging...     │  │                               │  │
│ │  Building...     │  │                               │  │
│ │                  │  │                               │  │
│ │  [Job Seeker]    │  │                               │  │
│ │  [Employer]      │  │                               │  │
│ │                  │  │                               │  │
│ └──────────────────┘  └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout
Stacked vertically: Logo → Headline → Description → CTAs → Visual area

## Features & Interactions

### CTA Buttons
- **Primary (Job Seeker):** Orange background, white text, pill shape
- **Secondary (Employer):** Dark navy background, white text, pill shape
- Hover: Slight lift with enhanced shadow
- Gap between buttons: 12-16px

### Brand Mark
- Small orange/red-orange abstract flower/gear icon
- "Rojgaar Hai" text in dark navy
- Horizontally aligned, positioned upper-left

## Component Inventory

### Section 01: Hero Section
- Full viewport height
- Warm off-white background
- Two-column layout (content + visual placeholder)

### Brand Component
- Logo icon + text
- No container/border/shadow
- Subtle, understated presence

### Headline
- Two lines: "Rojgaar" + "Hai !"
- Exclamation mark in orange
- Dominant visual element

### Description
- Two lines of supporting copy
- Clear hierarchy below headline

### CTA Button Group
- Two horizontally aligned pills
- Primary and secondary variants

### Visual Placeholder
- Empty container for future artwork
- Right side, full height
- Easy to replace with image layer

## Section 02: For Job Seekers

### Concept
Editorial visual section with playful, asymmetric composition. More dynamic than hero with handwritten typography creating visual interest.

### Layout
- Full-width section, ~100vh desktop height
- Left content (45%): Section label, handwritten heading, purple underline, description, circular arrow CTA
- Right visual (55%): Empty placeholder for future artwork

### Design Elements
- **Section Label:** "02" (bold 16px) + "FOR JOB SEEKERS" (uppercase, tracked)
- **Heading:** Caveat font (handwritten style), "For Job Seekers"
- **Underline:** Hand-drawn SVG stroke in purple (#7655D9)
- **CTA:** Purple circle with diagonal arrow + "Explore Jobs" text
- **Visual Area:** Empty `.job-seeker-visual` container for future artwork

### Colors
- Purple accent: #7655D9
- All other colors from Section 01 palette

### Typography
- Inter for body/labels
- Caveat (Google Font) for handwritten heading only

## Technical Approach

- React with TypeScript
- Tailwind CSS for styling
- Google Fonts (Inter + Caveat)
- Semantic HTML structure
- CSS custom properties for colors
- Mobile-first responsive breakpoints
