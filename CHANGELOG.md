# Change Log

This file records detailed changes made to the Rojgaar Hai project over time.

---

## 2026-08-23 (continued, part 5)

### Bug fixes: modal scrolling, admin candidate names, switcher animation, employer onboarding

- **Modal scrolling broken by Lenis**: global smooth-scroll was capturing wheel events over every nested scrollable region (modals, EditProfileModal's sidebar/body, admin sidebar nav, admin main content, notification dropdowns), making their mouse-wheel scroll unresponsive. Fixed universally by adding `data-lenis-prevent` (a built-in Lenis opt-out attribute) to every such container in `ui.tsx`'s shared `Modal`, `EditProfileModal`, `AdminLayout`, and `CandidateDashboard`'s notification panel.
- **Admin "Unnamed" candidates — root cause found**: the `profiles` table had no RLS policy letting any user read another user's profile row, so every `profile_name` join (used by `getAllCandidates`, `getAllEmployers`-adjacent queries, etc.) silently came back empty for everyone except your own account. Added `"Authenticated users can view all profiles"` to `supabase/rls-policies.sql` — **you need to run this file again**.
- **Auth switcher animation**: replaced the cross-page `layoutId` shared-element transition (which can't animate correctly across a full route change/unmount — that was the "crappy" glitch) with a self-contained CSS-transform pill plus a clean fade-in on mount.
- **Employer signup simplified**: no longer collects company details at signup (just name/email/phone/password, matching candidate signup). Company profile is now requested on first dashboard visit via a modal with a real "Skip for now" option (skip is remembered per-employer so it won't nag again); editable anytime after via the existing Edit Company modal.
  - **You need to run `supabase/schema-updates.sql`** — it drops the `NOT NULL` constraint on `employers.company_name` so accounts can exist without one initially.

## 2026-08-23 (continued, part 4)

### Employer-onboarded candidates, real matching engine, "For You" jobs, platform job postings

- **Employer "Add Candidate"**: recruiters can now create a candidate's account on their behalf (doorstep onboarding for non-tech-savvy candidates) via `src/lib/supabase/tempClient.ts` — an isolated, non-persisting Supabase client that runs the new signup without hijacking the employer's own logged-in session — plus `createCandidateAccountByEmployer` in `data.ts`. The new candidate is auto-mapped via `referred_by`, and the employer sees a one-time credentials screen to hand off to the candidate.
- **Employer dashboard**: replaced the small referral-link button with a full "Your Candidate Network" section — link display, real Copy and native-Share (`navigator.share` with clipboard fallback) buttons, the Add Candidate flow, and the referred-candidates list all in one place.
- **Real matching engine** (`src/lib/matching.ts`): deterministic, explainable weighted scoring — Skills 40%, Experience 20%, Salary fit 15%, Location 15%, Job type 5%, Education 5% — every point traces to a concrete rule, not an opaque AI call. Returns a breakdown + human-readable reasons per match.
  - Admin Matching Engine (`/admin/matching`) rebuilt on this engine: manual match now shows a full score breakdown, plus a new "Best Candidates for a Job" mode that ranks every candidate against a chosen job and lets the admin one-click create top matches.
  - Candidate-facing `/jobs`: added an "All Jobs" / "For You" tab switcher (shown only when logged in as a candidate) — For You uses the same engine to filter (≥30% match) and sort jobs, with a live match-% badge on every job card.
- **Platform job postings**: admin can now post a job "as RojgaarHai.com" from `/admin/jobs` (in addition to posting on behalf of any real employer) — lazily creates a platform `employers` record (`getOrCreatePlatformEmployer`) owned by the admin's own account the first time it's used; no new SQL required.
- Confirmed the existing apply-flow already enforces "view without login, apply requires login" (was already wired in a previous round) — no changes needed there.

## 2026-08-23 (continued, part 3)

### Auth switcher, role chooser, admin job approvals, animation foundation

- Added `src/components/AuthSwitcher.tsx` — Sign In / Sign Up toggle now shown at the top of all four auth pages (`CandidateLogin`, `CandidateSignup`, `EmployerLogin`, `EmployerSignup`).
- Added `src/components/RoleChooserModal.tsx` — clicking "Get Started" in the navbar (desktop and mobile) now opens a Job Seeker / Employer picker before routing to the right signup page, instead of assuming candidate.
- Added `src/pages/admin/JobApprovals.tsx` (route `/admin/jobs`, new sidebar link) — superadmin can see every job posting with its employer, Approve/Reject it (updates `status`/`is_verified`/`approved_by`/`approved_at`), and post a job directly on behalf of any employer (auto-approved).
- **Animation/loading foundation** (using the already-installed `framer-motion` and `lenis`):
  - `src/hooks/useSmoothScroll.ts` — Lenis inertia smooth-scroll enabled globally
  - `src/components/PageLoader.tsx` — branded animated loader replacing plain "Loading..." text across all auth pages and `JobDetails`
  - `src/components/Skeleton.tsx` (`DashboardSkeleton`, `TableSkeleton`) — shimmer skeleton loaders replacing spinner+text loading states in `CandidateDashboard`, `EmployerDashboard`, and globally in `AdminLayout` (covers every admin page in one place)
  - `AdminLayout` now animates page transitions between admin routes (fade + slide)
  - `src/components/Reveal.tsx` — scroll-triggered fade/slide-in wrapper, applied to every major section of the Landing page (For Job Seekers, For Employers, How It Works, Features, Stats, Testimonials, Final CTA)
- This is a foundational pass, not an exhaustive redesign — the reusable components (`Reveal`, `Skeleton`, `PageLoader`) are now available to extend to remaining pages (Jobs listing, admin tables, etc.) in a focused follow-up if wanted.

### Full-stack button audit: made every dashboard action real

- **Root cause found**: the public `/jobs` and `/jobs/:id` pages, and their entire "Apply Now" flow, were still running on the old dummy `DataContext` — completely disconnected from Supabase. This meant applications submitted from the public job board never reached the database, so employers never saw real applicants. Migrated both pages to `useDatabase()` + new public data-fetching functions (`getOpenJobsPublic`, `getJobPostingById`, `getJobSkills`, `getJobRequirements`, `getJobResponsibilities`) and wired "Apply Now" to `createApplication`.
- Fixed `DatabaseContext.tsx`: the candidate role branch never fetched `employers` or job skills, so company names and required-skill tags were blank/wrong everywhere in the candidate dashboard's job listings.
- **Job Posting**: added `src/pages/dashboards/PostJob.tsx` (route `/dashboard/employer/post-job`) — a real form that inserts into `job_postings` + `job_skills`. All "Post New Job" buttons now point here instead of the employer signup form.
- **Employer dashboard actions**, all now persisted to Supabase:
  - Duplicate job → clones the posting + skills (`duplicateJobPosting`)
  - Share job → copies a real `/jobs/:id` link
  - Shortlist / Interview / Reject → updates `applications.status` with the correct timestamp field
  - Interview action also logs a `communications` row
  - Download resume → opens the candidate's real `resume_url`
  - Message → logs a `communications` row
  - Edit Company → real modal updating the `employers` row
  - "View Public Profile" → replaced with an honest "Preview Profile" modal showing the employer's own real data (no fabricated public URL)
  - "Interviews Scheduled" and pipeline stage counts (Shortlisted/Interview/Selected/Joined) now computed from real `applications`/`matches` data instead of hardcoded numbers
- **Candidate dashboard**:
  - Resume upload now uploads to Supabase Storage (`resumes` bucket) and updates `candidates.resume_url` (`uploadCandidateResume`)
  - Resume Preview/Download now open the real uploaded file; removed fabricated "Resume Score 88/100" and "ATS Compatibility 92%" stats (no real scoring logic existed)
  - "Add to Calendar" now generates a real downloadable `.ics` calendar file
  - Removed hardcoded "48 Recruiter Views" stat (no view-tracking exists); replaced with real "Applications Sent" count
- New RLS policies added to `supabase/rls-policies.sql`: employers can update applications for their own jobs; public/anonymous users can browse Open jobs, employer names, and job skills/requirements/responsibilities without logging in (previously the job board required authentication to view anything); Storage bucket + policies for the `resumes` bucket.

### Employer Dashboard Fixes & Referral System

- Fixed the same React hooks-order crash pattern in `src/pages/dashboards/EmployerDashboard.tsx` (three `useMemo` calls were defined after an early `return null` guard); moved them above the guard.
- Replaced hardcoded "Interviews Scheduled" stat with a real count computed from `matches` where `status === 'Interview Scheduled'` for the employer's own jobs.
- Added a referral system: `employers.referral_code` (already existed) is now shareable via a new "Your Unique Link" button; candidates who sign up through `/register/job-seeker?ref=<code>` are automatically linked via `candidates.referred_by`/`referral_code_used` (`src/lib/supabase/data.ts`: `getEmployerByReferralCode`, `getCandidatesReferredByEmployer`; `src/pages/auth/CandidateSignup.tsx`).
- Employer dashboard now shows a "Candidates You've Referred" list.
- Added `src/pages/admin/EmployerDetail.tsx` at route `/employer/:id` — a dedicated subpage (admin/superadmin-only) showing an employer's full profile, job postings, and referred candidates. `src/pages/admin/Employers.tsx` now links to this page instead of a modal.

### Critical Supabase Auth/Role Bug Fixes

- Fixed `handle_new_user()` trigger (`supabase/schema.sql`) reading phone from wrong source (`NEW.phone` instead of `NEW.raw_user_meta_data ->> 'phone'`), causing phone to never save on signup.
- Fixed non-idempotent, broken `supabase/rls-policies.sql`: rewrote the `matches` UPDATE policy (referenced nonexistent `employer_id` column), added `DROP POLICY IF EXISTS` before every policy, and added missing INSERT policies for `candidates`/`employers` that were silently blocking profile creation.
- Fixed `src/App.tsx` route guards racing ahead of `AuthContext` loading state, causing glitchy redirects on manual navigation to `/admin`, `/dashboard/candidate`, `/dashboard/employer`.
- Fixed `src/pages/auth/AdminLogin.tsx` silently redirecting role-mismatched users with no feedback; now shows a descriptive error.
- Fixed a latent React hooks-order crash in `src/pages/dashboards/CandidateDashboard.tsx` (early returns before hooks); wired real persistence for availability status and all 13 Edit Profile steps (personal info, skills, education, experience, languages, certifications) with phone prefilled from signup.

### Admin Section Supabase Migration

- Migrated `src/pages/admin/Communications.tsx`, `Matching.tsx`, `Employers.tsx`, `Placements.tsx`, `Candidates.tsx` from dummy `DataContext` to real `DatabaseContext` + Supabase-backed mutations (`createCommunication`, `createMatch`/`updateMatchStatus`, `createPlacement`/`updatePlacement`, `hireCandidate`).
- `src/pages/admin/Dashboard.tsx`: replaced hardcoded `monthlyData` and `recentActivity` with real aggregations computed from live data.
- `src/context/DatabaseContext.tsx`: candidate/superadmin fetches now include skills, education, experience, languages, and certifications.
- Verified via `npx tsc --noEmit` (clean) and `npm run build` (exit code 0).

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
