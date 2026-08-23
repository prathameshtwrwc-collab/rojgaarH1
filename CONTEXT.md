# Rojgaar Hai — Project Context

Job board connecting candidates and employers in India. React + TypeScript + Vite frontend, Supabase (Postgres + Auth + Storage) backend.

## Tech Stack
- React 19, TypeScript, Vite, React Router v6, Tailwind (via `design-system.css` + Tailwind utility classes)
- Supabase: Postgres, Auth (email/password), Storage, Row Level Security
- `framer-motion` for animation, `lenis` for smooth scroll
- `lucide-react` + `@hugeicons/react` for icons

## Architecture

### Contexts (all in `src/context/`)
- **`AuthContext`** — Supabase session/user, exposes `{ user, loading, logout, refresh }`. `user.role` is `'candidate' | 'employer' | 'superadmin'`.
- **`DatabaseContext`** — the real data layer. On mount/user-change, branches by `user.role` and fetches everything that role needs in parallel (jobs, candidates, employers, applications, matches, etc.) via `src/lib/supabase/data.ts`. Exposes `{ loading, profile, candidate, employer, jobs, employers, candidates, applications, matches, communications, placements, jobSkills, stats, refresh }`.
- **`DataContext`** — **legacy/dummy data**, mostly superseded. Still used for: `isAdminLoggedIn`/`isCandidateLoggedIn`/`isEmployerLoggedIn` flags used by route guards in `App.tsx`, and admin login state. Do not add new real data flows here — use `DatabaseContext` + `src/lib/supabase/data.ts` instead.

### Data layer
- **`src/lib/supabase/client.ts`** — the one shared Supabase client (holds the logged-in user's session).
- **`src/lib/supabase/tempClient.ts`** — an isolated, non-persisting Supabase client. Use this whenever a logged-in user needs to `signUp()` a *different* new user (e.g. employer creating a candidate account on their behalf) so it doesn't hijack the current session.
- **`src/lib/supabase/data.ts`** — all Postgres queries/mutations live here as named exported functions. Follow the existing pattern: `getX`, `createX`, `updateX`, return `null`/`[]` on error for reads (logged via `console.error`), `throw` on error for writes.
- **`src/lib/supabase/auth.ts`** — `signUp`, `signIn`, `signOut`, `getCurrentUser`.
- **`src/lib/matching.ts`** — the candidate↔job matching engine. Deterministic weighted scoring (Skills 40%, Experience 20%, Salary 15%, Location 15%, Job type 5%, Education 5%), **not** an AI/LLM call. Used by both the admin Matching Engine (`/admin/matching`) and the candidate "For You" job feed (`/jobs`).

### Route guards (`App.tsx`)
`ProtectedAdminRoute` / `ProtectedCandidateRoute` / `ProtectedEmployerRoute` all check `useAuth().loading` first (show `PageLoader`) before checking role — avoids redirect flicker/races. Each guard uses OR logic between the legacy `DataContext` localStorage flag and the Supabase `AuthContext` role.

### Key reusable UI
- `src/components/ui.tsx` — shared `Card`, `Badge`, `Button`, `Modal`, `Select`, `Input`, `Toast`, `TagInput`, `FAQItem`. **Always use the shared `Modal`** for new modals — it already has scroll-lock and `data-lenis-prevent` wired correctly.
- `src/components/PageLoader.tsx` — branded loading spinner, use instead of ad-hoc spinner divs.
- `src/components/Skeleton.tsx` — `DashboardSkeleton`, `TableSkeleton` shimmer loaders.
- `src/components/Reveal.tsx` — scroll-triggered fade/slide-in wrapper (`whileInView`), used on Landing page sections.
- `src/components/AnimatedCounter.tsx` — count-up number animation.
- `src/components/AuthSwitcher.tsx` — Sign In/Sign Up pill toggle on auth pages.
- `src/components/RoleChooserModal.tsx` — "Job Seeker or Employer?" picker opened from navbar "Get Started".
- `src/components/ScrollRestoration.tsx` — mounted once in `App.tsx`. New navigations scroll to top; browser Back/Forward restores prior scroll position. Goes through `scrollToY()` in `useSmoothScroll.ts` so it doesn't fight Lenis.

### Lenis / modal scrolling gotcha
Lenis (global smooth scroll, wired in `useSmoothScroll.ts`) captures wheel events over the whole page by default, which breaks mouse-wheel scrolling inside any nested scroll container (modals, sidebars, dropdowns). **Any new scrollable container (`overflow-y-auto`) needs the `data-lenis-prevent` attribute** or its scroll will be dead. Already applied to: shared `Modal`, `EditProfileModal`, `AdminLayout` (sidebar nav + main content), notification dropdowns, `TagInput` suggestions.

## Auth role resolution

The user's role is resolved from the `profiles` table first, then falls back to `user_metadata.role` only if the profile row has no role. This fixes a bug where stale `user_metadata` from signup time could override a corrected `profiles.role` after an admin SQL update.

See `src/context/AuthContext.tsx` and `src/lib/supabase/auth.ts`.

## Database

Full schema: `supabase/schema.sql`. RLS policies: `supabase/rls-policies.sql` (idempotent — safe to re-run in full anytime). Nullable-column changes: `supabase/schema-updates.sql`.

### ⚠️ Manual SQL the user must run in the Supabase SQL Editor
These files were edited during development but **Supabase does not auto-apply them** — confirm with the user whether each has actually been run:
1. `supabase/rls-policies.sql` — re-run in full after any edit (idempotent). Covers all 17 tables: profiles self-read/write, authenticated browse for employers/candidates/jobs/applications/matches/communications/placements, employer ownership for jobs/skills/requirements/responsibilities, candidate ownership for profile child tables.
2. `supabase/schema-updates.sql` — drops `NOT NULL` on `employers.company_name` (employer signup no longer collects company details up front; asked separately on first dashboard visit with a Skip option).
3. `handle_new_user()` trigger in `schema.sql` (~line 476) — must read phone/role from `raw_user_meta_data`, not `NEW.phone`. If a candidate/employer test account predates this fix, its `profiles.role` may be wrong and needs manual correction in the Table Editor.

### Key tables (see `supabase/schema.sql` for full DDL)
- `profiles` (role, full_name, phone) — 1:1 with `auth.users`, created by the `handle_new_user()` trigger.
- `employers` (id = profiles.id), `candidates` (id = profiles.id) — role-specific data.
- `candidate_skills`, `candidate_education`, `candidate_experience`, `candidate_languages`, `candidate_certifications`, `candidate_preferred_locations` — child tables, each with its own RLS (`candidate_id = auth.uid()` for writes).
- `job_postings`, `job_skills`, `job_requirements`, `job_responsibilities` — employer-owned via `employer_id`.
- `applications` (candidate applies to a job; status enum: applied/screening/shortlisted/interview_scheduled/interviewed/selected/rejected/withdrawn/joined, with timestamp columns per stage).
- `matches` (admin/system-created candidate↔job match with a score; status enum: Pending/Shortlisted/Interview Scheduled/Offered/Hired/Rejected).
- `communications`, `placements` — admin-facing CRM/placement tracking.
- `candidates.referred_by` (FK → employers) + `referral_code_used` — powers the employer referral-link system.
- `employers.referral_code` — unique per employer, shareable link is `/register/job-seeker?ref=<code>`.

### Enums (exact casing matters when writing queries)
`job_status`: Pending/Open/Closed/On Hold · `employment_type`: Full-time/Part-time/Contract/Temporary/Internship/Freelance · `application_status`: lowercase snake_case (see above) · `match_status`: Title Case · `candidate_status`: New/Contacted/Interviewed/Placed/Inactive · `communication_type`/`contact_type`: lowercase (email/call/sms/in_person, candidate/employer).

## Feature map (what exists, where)

- **Candidate**: signup → dashboard (`CandidateDashboard.tsx`) with 13-step `EditProfileModal`, resume upload to Storage, apply to jobs (creates `applications` row), "All Jobs"/"For You" tabs on `/jobs` with live match %.
- **Employer**: signup (minimal) → dashboard (`EmployerDashboard.tsx`) — post jobs (`PostJob.tsx`), manage applicants (shortlist/interview/reject → real `applications.status` updates), "Your Candidate Network" (referral link + Add Candidate doorstep onboarding via `tempClient`), Edit Company (with first-run Skip-able prompt).
- **Admin** (`/admin/*`, `AdminLayout.tsx` sidebar): Dashboard, Jobs (approve/reject + post on behalf of any employer *or* as "RojgaarHai.com" platform job via `getOrCreatePlatformEmployer`), Candidates, Employers (+ `/employer/:id` detail subpage), Matching Engine (manual + "Best Candidates for a Job"), Communications, Placements.
- **Public marketing**: Landing (`Landing.tsx`, scroll-reveal animated), About/Blog/Privacy/Terms/Contact (static pages under `PublicLayout`).

## Recent fixes

- **Superadmin role bug**: `supabase/rls-policies.sql` was missing entirely, so with RLS enabled but no policies, every Supabase query returned empty/error. The app silently fell back to `user_metadata.role` from signup time (usually `candidate`), so superadmin/candidate dashboards both failed to load. Fixed by adding complete RLS policies and changing role resolution to prefer `profiles.role` over `user_metadata.role`.
- **RLS policies added**: All 17 tables now have proper policies. See `supabase/rls-policies.sql` (idempotent).

## Known deferred items (raised with user, not yet built)
- Saved/bookmarked jobs still use `localStorage`, not Supabase (per-device, doesn't sync).
- `EditProfileModal`'s document-upload buttons (separate from the working Resume Center upload) are still placeholder toasts.
- Interview date/time/mode show "TBD" — `matches` table has no scheduled-datetime column.
- Main JS bundle is ~1.47MB (403KB gzip) — Vite suggests code-splitting; not yet done.

## Conventions
- Don't waste the user's tokens: work directly, minimize narration, batch related reads/edits, avoid re-verifying things already confirmed working in this session.
- Always run `npx tsc --noEmit` after edits; run `npm run build` (background) before declaring a large change done.
- When a feature needs new SQL (RLS policy, schema change, Storage bucket), **write it to a `.sql` file and tell the user exactly what to run** — never assume it's applied.
- Update `CHANGELOG.md` for each meaningful round of work (existing entries show the expected format/detail level).
