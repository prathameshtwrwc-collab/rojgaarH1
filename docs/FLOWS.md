# Rojgaar Hai — User Flows

## Super Admin Flow

1. Navigate to `/admin/login`
2. Login with superadmin credentials
3. Dashboard shows:
   - All employers list with verification status
   - All candidates mapped under each employer
   - All job postings with approval controls
   - Platform-wide analytics
4. Actions:
   - Approve / reject employer job postings
   - Verify / unverify employers
   - Post jobs directly (auto-approved, visible to all candidates)
   - Full CRUD on candidates, employers, jobs, matches, communications, placements
   - Manage communications and placements

## Employer Flow

1. Landing → Register as Employer
2. Fill company details → Account created
3. Login → Employer Dashboard
4. Dashboard features:
   - Generate unique referral code (auto-generated on registration)
   - Share referral code with candidates
   - Post new jobs (status = `Pending`, invisible to candidates until Super Admin approves)
   - View own posted jobs
   - Review applicants for approved jobs
   - Shortlist / reject / schedule interview
   - Add/manual onboard candidates (via referral code or direct entry)
   - View candidates mapped under their referral code
   - Download resumes
5. Job posting approval flow:
   - Employer posts job → status = `Pending`
   - Super Admin reviews → Approves (status = `Open`, visible) or Rejects

## Candidate Flow

1. Landing → Register as Candidate (direct OR via employer referral code)
2. If via referral code:
   - Enter referral code during registration
   - Candidate automatically mapped to referring employer
3. If direct registration:
   - Standard signup flow
   - Not mapped to any employer initially
4. Login → Candidate Dashboard
5. Dashboard features:
   - Browse approved jobs (`status = Open` AND `is_verified = true`)
   - Apply to jobs
   - Save/bookmark jobs
   - View application status
   - Upload resume and documents
   - Edit profile
   - View matches / interviews / placements
6. Job visibility rule:
   - Only jobs approved by Super Admin are visible
   - Pending / rejected jobs are hidden from candidates

## Unauthenticated Flow

- Browse landing page
- View public pages (jobs list visible but only approved jobs shown)
- View job details (approved jobs only)
- View employer info
- Contact page
- Register / login

## Auth & Session

- Supabase Auth handles email/password and OAuth
- `profiles.role` determines access: `superadmin`, `employer`, `candidate`
- Super Admin routes protected at `/admin/*`
- Employer routes protected at `/dashboard/employer`
- Candidate routes protected at `/dashboard/candidate`
- Role-based redirect after login

## Referral Code System

- Each employer gets a unique referral code on registration
- Employer can view and share referral code from dashboard
- Candidate registration form includes optional "Referral Code" field
- If valid referral code is entered:
  - Candidate's `referred_by` = employer ID
  - Candidate's `referral_code_used` = code entered
  - Candidate automatically appears in employer's mapped candidates list
- If no referral code: `referred_by` = null
