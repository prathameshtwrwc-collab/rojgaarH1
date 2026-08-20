# Change Log

This file records detailed changes made to the Rojgaar Hai project over time.

---

## 2026-08-20

### Design System & Theme Migration
- Created `src/design-system.css` with reusable landing-page classes:
  - `.landing-section`, `.landing-container`, `.section-heading`, `.section-subtitle`
  - `.btn-landing-primary`, `.btn-landing-secondary`, `.btn-landing-outline`
  - `.card-landing`, `.card-landing-dark`, `.badge-landing--orange/navy/green`
  - `.input-landing`, `.icon-box-landing--orange/navy/green/purple/white`
  - `.page-header-landing`, `.form-card-landing`, `.success-icon-landing`
- Updated `src/main.tsx` to import `design-system.css` globally
- Simplified `src/context/ThemeContext.tsx` to always return `{ theme: 'light' }`
- Removed `ThemeProvider` wrapper from `src/App.tsx`

### Dark Mode Removal
- Removed theme toggle buttons from `src/components/PublicLayout.tsx`
- Removed theme toggle buttons from `src/components/AdminLayout.tsx`
- Removed all `dark:` class variants from page components
- Removed all `isDark` / `toggleTheme` references from dashboard pages

### Blue Color Replacement
Replaced all blue accent tokens with landing palette across:
- `src/components/ui.tsx` — Button, Input, Select, Textarea, Badge, Toggle, ProgressBar, StepIndicator, StatCard, SkillTags, FileUpload
- `src/pages/Contact.tsx`
- `src/pages/Jobs.tsx`
- `src/pages/JobDetails.tsx`
- `src/pages/EmployerInfo.tsx`
- `src/pages/CandidateDashboard.tsx`
- `src/pages/EmployerDashboard.tsx`
- `src/components/EditProfileModal.tsx`
- `src/pages/JobSeekerRegistration.tsx`
- `src/pages/EmployerRegistration.tsx`
- `src/pages/admin/Candidates.tsx`

### Alignment & Spacing Fixes
- `src/pages/JobSeekerInfo.tsx`
  - Restructured hero section with proper vertical spacing (`mb-6`, `mb-10`, gap-4)
  - Replaced `card-landing` with explicit `bg-white rounded-2xl border border-slate-200 p-6` for step cards
  - Added section header blocks with subtitle text for "How It Works" and "Why Join"
  - Replaced `card-landing-dark` with explicit `bg-[var(--bg-warm)] rounded-2xl border border-slate-200 p-6`
  - Replaced FAQ wrapper with `bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100`
  - Standardized CTA section spacing with `mb-4` and `mb-8`
- `src/pages/EmployerInfo.tsx`
  - Fixed hero "Faster" gradient text to solid `text-[var(--orange)]`
  - Replaced all `card-landing` usages with explicit white card styles
  - Fixed CTA button from teal to `bg-[var(--orange)]`
  - Updated testimonial cards to explicit `bg-white rounded-2xl border border-slate-200 p-6`
  - Replaced `Badge variant="info"` with inline span in final CTA
- `src/pages/Contact.tsx`
  - Replaced `card-landing` contact cards with explicit `bg-white rounded-2xl border border-slate-200 p-5`
  - Replaced `icon-box-landing` classes with explicit `w-12 h-12 rounded-xl` icon containers
  - Replaced `form-card-landing` with explicit `bg-white rounded-2xl border border-slate-200 p-6 sm:p-8`
  - Replaced `success-icon-landing` with explicit `w-16 h-16 rounded-full bg-[var(--green)]`
  - Replaced `btn-landing-secondary` with explicit orange/navy button classes
  - Replaced `input-landing` with explicit input classes
  - FAQ section restructured with header block and `bg-white rounded-2xl border border-slate-200 divide-y`
- `src/pages/JobSeekerRegistration.tsx`
  - Confirmed no duplicate step labels; `StepIndicator` renders step labels correctly
- `src/pages/EmployerRegistration.tsx`
  - Confirmed no duplicate step labels; `StepIndicator` renders step labels correctly
- `src/pages/dashboards/CandidateDashboard.tsx`
  - Fixed JSX nesting error that was breaking the build (extra closing `</div>` before `</header>`)
- `src/pages/admin/Candidates.tsx`
  - Replaced `from-blue-100 to-blue-50` gradient with `from-[rgba(241,90,36,0.15)] to-[rgba(241,90,36,0.05)]`
- `src/components/EditProfileModal.tsx`
  - Replaced `bg-blue-100` with `bg-[rgba(241,90,36,0.1)]`

### Verification
- `npm run build` passes successfully (2445 modules)
- Visual verification completed for: landing page, Jobs page, Admin Login, Admin Dashboard
- Screenshots captured: `landing-page.png`, `job-seeker-info.png`, `jobs-page.png`, `admin-login.png`

### Follow-up Audit Pass
- Removed leftover off-palette colors the earlier pass missed:
  - `src/pages/dashboards/CandidateDashboard.tsx` — 3x `text-indigo-500` → `text-purple-500` / `text-orange-500`
  - `src/pages/EmployerInfo.tsx` — `text-indigo-600` → `text-orange-600`
  - `src/components/EditProfileModal.tsx` — `shadow-blue-600/20` → `shadow-orange-600/20`
  - `src/pages/Jobs.tsx`, `src/pages/JobDetails.tsx` — all `emerald-*` salary/verified-badge accents → `var(--green)` token
- Rebuilt `EmployerLogin` (in `src/pages/dashboards/EmployerDashboard.tsx`) from scratch to match `CandidateLogin`'s structure/styling exactly — was previously a mismatched teal/navy gradient card with untokenized `text-teal-*` colors, now the same warm-cream centered card layout
- Fixed `/login/employer` route in `src/App.tsx` — was rendering outside `<PublicLayout>`, so it had no site header/footer unlike every other public route
- Deleted ~120 lines of dead `.dark` selector rules from `src/design-system.css` (unreachable since dark mode was already removed)
- Verified: `npm run build` passes (2445 modules), all touched routes screenshotted in a real browser with zero console errors

---

## 2026-08-20 (later) — UI Normalization Pass

### Root cause found: site-wide compression
`src/App.css` (the landing page's hand-written stylesheet, loaded globally) had an
unlayered `* { margin:0; padding:0; box-sizing:border-box }` reset. Tailwind v4 wraps
all utility classes in `@layer utilities`. Per CSS cascade rules, **unlayered styles
always beat layered styles regardless of specificity** — so every `p-*`, `px-*`,
`py-*`, `m-*`, `mx-auto`, etc. utility used across every merged page was silently
being zeroed out. This was the actual cause of the "compressed/misaligned" look
reported across nearly all non-landing pages — not a font-size or scale problem.
Fixed by wrapping the reset in `@layer base` in `src/App.css` so Tailwind's
`@layer utilities` correctly wins the cascade. Landing page is unaffected (it uses
no Tailwind utility classes). This single change fixed spacing/padding/centering on
essentially every merged page simultaneously.

### Navbar geometry fix
`PublicLayout.tsx`'s header had nav links, CTA, and mobile toggle as separate direct
flex children under `justify-between`, which centered the nav links between the logo
and actions instead of grouping them tight against the right side like the landing
page's `.header-right` wrapper does. Fixed by wrapping nav + actions + mobile toggle
in one flex group, matching the landing page's exact DOM pattern.

### Other fixes
- `/register/job-seeker` and `/register/employer` were rendering with no header or
  footer at all (missing `<PublicLayout>` wrapper) — added it.
- `/login/employer` had the same missing-layout bug — added it (found in the prior pass).

### Verification
- `npm run build` passes (2445 modules)
- Landing page screenshotted and confirmed pixel-identical (unaffected by the layer fix)
- Visual QA across landing, jobs, employer-info, contact, both registration flows,
  candidate dashboard, employer dashboard, admin login/dashboard — no console errors,
  no overflow, consistent spacing/padding/typography throughout

---

## 2026-08-20 (later still) — Dashboard Premium Redesign

Redesigned the presentation layer of the three authenticated dashboards (Candidate,
Employer, Admin). Functionality, routes, data, and handlers untouched.

### Shared system
Added a `DASHBOARD SYSTEM` block to `src/design-system.css`: `.dash-header`,
`.dash-metrics`/`.dash-metric`, `.dash-surface`, `.dash-row`, `.dash-status`
(4 semantic variants only), `.dash-btn` (primary/secondary/tertiary), `.dash-avatar`
(flat navy, not gradient), `.dash-progress`, `.dash-sidebar__link`.

### What changed
- Removed all gradient hero banners (orange→purple→navy, navy→charcoal) across all
  three dashboards — replaced with a quiet header (title + subtitle + actions).
- Removed rainbow gradient KPI cards — replaced with a single flat metrics strip
  (numbers + fine dividers, orange used once as the primary accent).
- Employer: job postings are now list rows with a single divider, not stacked cards;
  status badges reduced to the 4 real states; candidate avatars are flat navy.
- Candidate: recommended jobs are horizontal rows, not cards; pipeline tracker uses
  fine lines and compact circles instead of ringed/shadowed dots.
- Admin sidebar: active nav state is a subtle surface + thin orange accent line
  instead of a solid orange block.
- Border radius and shadows reduced site-wide in dashboards (12–14px surfaces,
  hairline borders, no floating-card shadows).

### Verification
- `npm run build` passes (2445 modules)
- Visually verified Candidate, Employer, and Admin dashboards in-browser — no
  console errors, correct data, all actions intact

---

## 2026-08-20 (final) — Dashboard Secondary Polish, Hugeicons, Modal Fix

- Installed `@hugeicons/react` + `@hugeicons/core-free-icons`; migrated icons in the
  areas touched this pass (dashboard secondary modules, modal close buttons) to
  semantic Hugeicons, dropping the old colored-icon-box treatment in favor of
  `icon + label` using the `dash-*` system.
- Rebuilt remaining secondary modules to the `dash-surface`/`dash-row` system:
  Candidate's Profile Completion, Resume Center, Skills, Recent Activity, Market
  Insights, Courses; Employer's Recent Activity and Hiring Notifications; Admin's
  Commission Overview and Recent Activity.
- **Fixed the shared `Modal` component** (`src/components/ui.tsx`) — root cause of
  the detached-scrollbar bug on `/admin/candidates` and every other dialog using it:
  the panel had `overflow-y-auto` directly on the rounded surface, so native
  scrollbars rendered outside the border-radius. Restructured to
  overlay → panel (`overflow:hidden`) → header (fixed) → body (`flex-1 min-h-0
  overflow-y-auto`, the only scrollable region), added body-scroll lock, capped
  height at `calc(100dvh - 48px)`, and normalized the close control to a 36px hit
  target with a Hugeicon. Applied the same fix to `EditProfileModal`, the other
  full-screen modal in the app.
- `npm run build` passes (8473 modules with the new dependency).

---

## How to Update

When making further changes, add a new date section and document:
1. Files modified
2. What was changed and why
3. Any breaking changes or migration steps
4. Verification steps (build, visual checks, screenshots)
