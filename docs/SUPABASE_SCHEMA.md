# Rojgaar Hai — Supabase Schema

## Tables

### profiles
- `id` uuid (FK auth.users)
- `role` text enum: 'candidate' | 'employer' | 'admin'
- `full_name` text
- `phone` text
- `created_at` timestamptz

### candidates
- `id` uuid (FK profiles.id)
- `dob` date
- `location` text
- `state` text
- `gender` text
- `qualification` text
- `skills` jsonb
- `total_experience` text
- `expected_salary` text
- `preferred_job_type` text
- `status` text enum: 'New' | 'Contacted' | 'Interviewed' | 'Placed' | 'Inactive'
- `resume_url` text
- `profile_photo_url` text
- `linkedin` text
- `github` text
- `referred_by` uuid (FK employers.id) — employer who referred this candidate, null if direct registration
- `referral_code_used` text — the referral code used during registration

### employers
- `id` uuid (FK profiles.id)
- `company_name` text
- `industry` text
- `company_size` text
- `year_established` text
- `website` text
- `address` text
- `city` text
- `state` text
- `contact_name` text
- `contact_email` text
- `contact_phone` text
- `gst_number` text
- `verified` boolean default false
- `referral_code` text unique — auto-generated unique code for candidate referrals

### job_postings
- `id` uuid
- `employer_id` uuid (FK employers.id)
- `job_title` text
- `number_of_openings` int
- `city` text
- `state` text
- `salary_min` text
- `salary_max` text
- `employment_type` text
- `qualification_required` text
- `experience_required` text
- `skills_required` jsonb
- `job_description` text
- `benefits` text
- `joining_timeline` text
- `status` text enum: 'Pending' | 'Open' | 'Closed' | 'On Hold' — `Pending` = awaiting Super Admin approval
- `applicants` jsonb (array of candidate ids)
- `is_verified` boolean default false — set to true by Super Admin upon approval
- `approved_by` uuid (FK profiles.id) — Super Admin who approved
- `approved_at` timestamptz
- `deadline` date
- `created_at` timestamptz

### matches
- `id` uuid
- `candidate_id` uuid (FK candidates.id)
- `job_id` uuid (FK job_postings.id)
- `match_score` int
- `status` text enum: 'Pending' | 'Shortlisted' | 'Interview Scheduled' | 'Offered' | 'Hired' | 'Rejected'
- `created_at` timestamptz

### communications
- `id` uuid
- `date` date
- `type` text enum: 'Email' | 'Call' | 'SMS' | 'In-Person'
- `contact_type` text enum: 'Candidate' | 'Employer'
- `contact_name` text
- `subject` text
- `notes` text
- `outcome` text
- `agent_name` text

### placements
- `id` uuid
- `candidate_id` uuid (FK candidates.id)
- `job_id` uuid (FK job_postings.id)
- `employer_id` uuid (FK employers.id)
- `placement_date` date
- `handover_date` date
- `commission` numeric
- `commission_status` text enum: 'Paid' | 'Unpaid' | 'Partial'
- `status` text enum: 'Active' | 'Completed' | 'Terminated'

## Storage

- `resumes` bucket — candidate resume PDFs
- `profile-photos` bucket — candidate photos
- `company-logos` bucket — employer logos
- `documents` bucket — Aadhaar, PAN, certificates

## Auth Strategy

- Supabase Auth handles email/password and OAuth
- `profiles.role` determines access
- Row Level Security (RLS) enforces read/write restrictions per role
