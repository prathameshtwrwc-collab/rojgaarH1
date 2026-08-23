# Rojgaar Hai — Architecture

## Stack

- **Frontend:** React 19 + TypeScript + Vite 7
- **Routing:** React Router DOM (v6)
- **Styling:** Tailwind CSS 4 + custom CSS design system
- **Icons:** Lucide React + Hugeicons
- **Charts:** Recharts
- **Backend (planned):** Supabase (Auth + Postgres + Storage)

## Roles

- Super Admin — full platform access, job approval, employer verification
- Employer — job posting, candidate management, referral codes
- Candidate — job browsing, applications, profile management

## Current Data Layer

- `src/context/DataContext.tsx` holds all mock data and in-memory state
- Roles: Super Admin, Employer, Candidate
- Data: JobSeekers, Employers, JobPostings, Matches, Communications, Placements
- Employers have unique `referral_code` for candidate mapping
- Candidates have `referred_by` and `referral_code_used` fields
- Job postings have `status` enum: `Pending` | `Open` | `Closed` | `On Hold`
- Job postings require Super Admin approval before visible to candidates

## Routes

- `/` — Landing (no layout)
- `/jobs`, `/jobs/:id` — Public job listings (approved jobs only)
- `/job-seeker-info`, `/employer-info`, `/contact` — Public pages
- `/register/job-seeker`, `/register/employer` — Registration
- `/login/candidate`, `/login/employer` — Login
- `/dashboard/candidate`, `/dashboard/employer` — Dashboards
- `/admin/*` — Super Admin panel

## Layouts

- `PublicLayout` — navbar + footer for public pages
- `AdminLayout` — sidebar + topbar for admin

## Planned Changes

- Replace mock data with Supabase tables and real-time subscriptions
- Add auth guards via Supabase session
- Persist file uploads in Supabase Storage
- Add role-based route protection
