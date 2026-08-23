# Rojgaar Hai — Roles & Permissions

## Roles

| Role | Description |
|------|-------------|
| Super Admin | Platform owner with full database access and all CRUD operations |
| Employer | Company posting jobs, managing candidates, generating referral codes |
| Candidate | Job seeker browsing approved jobs and applying |

## Super Admin Permissions

- Full CRUD on all tables (profiles, candidates, employers, job_postings, matches, communications, placements)
- View all employers and candidates mapped under each employer
- Post jobs directly (auto-approved)
- Approve or reject employer job postings before they go live
- Verify/unverify employers
- Manage all platform content and users
- Access admin dashboard via `/admin/login`

## Employer Permissions

- Register company profile
- Post job postings (status defaults to `Pending` until Super Admin approves)
- View own posted jobs and applicants
- Shortlist / reject / schedule interview for applicants
- Download candidate resumes
- Add/manual onboard candidates via unique referral code
- Generate and share unique referral code
- View candidates mapped under their referral code
- View hiring analytics for own jobs

## Candidate Permissions

- Register / login
- Complete profile
- Browse only Super Admin-approved jobs (`status = Open` and `is_verified = true`)
- Apply to jobs
- Save/bookmark jobs
- View application status
- Upload resume and documents
- Register via employer referral code (auto-mapped to that employer)
- Receive notifications

## Restrictions

- Employers cannot see other employers' applicants or data
- Candidates cannot see or apply to unapproved jobs
- Employer job postings require Super Admin approval before visibility
- Super Admin actions are logged
- File upload size and type restrictions enforced in Supabase Storage + backend validation
