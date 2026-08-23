# Rojgaar Hai — Responsive Strategy

## Principles

- Mobile-first breakpoints using Tailwind default scale
- Fluid typography via `clamp()` for headings and key text
- No horizontal scroll on any viewport width
- Touch-friendly tap targets (min 44x44px)

## Breakpoints

- `sm`: 640px — small tablets, large phones
- `md`: 768px — tablets
- `lg`: 1024px — small laptops
- `xl`: 1280px — desktops

## Layout Patterns

### Landing Page
- Hero: stacked on mobile, two-column on desktop
- Sections: single column with `clamp()` padding
- Navigation: hamburger on mobile, horizontal on desktop

### Dashboards
- Sidebar: collapsible drawer on mobile, static on desktop
- Metrics: 2-col grid on mobile, 5-col on desktop
- Cards: full width on mobile, multi-column on desktop
- Tables: card-list on mobile, row-list on desktop

### Forms
- Single column on mobile
- Max width constrained (`max-w-[460px]`) for focus
- Inputs full width with adequate height (50px)

## Components to Audit

- [ ] PublicLayout mobile menu
- [ ] AdminLayout sidebar behavior
- [ ] CandidateDashboard timeline on small screens
- [ ] EmployerDashboard expanded job cards
- [ ] All registration forms
- [ ] Jobs listing card layout

## Auto-Detection Plan

- Use `@container` queries where complex layout shifts occur
- Use `size()` queries for component-level responsiveness
- Avoid JS-based resize listeners; prefer CSS-first solutions
