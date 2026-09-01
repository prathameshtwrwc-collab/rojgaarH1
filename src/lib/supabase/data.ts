import { supabase } from './client';
import type { Database } from './types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type EmployerRow = Database['public']['Tables']['employers']['Row'];
type CandidateRow = Database['public']['Tables']['candidates']['Row'];
type JobPostingRow = Database['public']['Tables']['job_postings']['Row'];
type ApplicationRow = Database['public']['Tables']['applications']['Row'];
type MatchRow = Database['public']['Tables']['matches']['Row'];
type CommunicationRow = Database['public']['Tables']['communications']['Row'];
type PlacementRow = Database['public']['Tables']['placements']['Row'];

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function getEmployerByUserId(userId: string): Promise<EmployerRow | null> {
  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching employer:', error);
    return null;
  }

  return data;
}

export async function getCandidateByUserId(userId: string): Promise<CandidateRow | null> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching candidate:', error);
    return null;
  }

  return data;
}

export async function createCandidate(
  userId: string,
  referredBy?: string | null,
  referralCodeUsed?: string | null,
  referredByRecruiter?: string | null
): Promise<void> {
  const { error } = await supabase.from('candidates').insert({
    id: userId,
    referred_by: referredBy || null,
    referral_code_used: referralCodeUsed || null,
    referred_by_recruiter: referredByRecruiter || null,
  } as never);
  if (error) throw error;
}

export async function createCandidateAccountByEmployer(employerId: string, details: {
  fullName: string;
  phone: string;
  email: string;
}): Promise<{ candidateId: string; password: string }> {
  const { createTempClient } = await import('./tempClient');
  const tempClient = createTempClient();

  const password = `RH${Math.random().toString(36).slice(2, 8)}${Math.floor(Math.random() * 90 + 10)}`;

  const { data, error } = await tempClient.auth.signUp({
    email: details.email,
    password,
    options: {
      data: { role: 'candidate', full_name: details.fullName, phone: details.phone },
    },
  });
  if (error) throw error;
  if (!data.user) throw new Error('Failed to create candidate account');

  const { error: candErr } = await tempClient.from('candidates').insert({
    id: data.user.id,
    referred_by: employerId,
    referral_code_used: 'recruiter-onboarded',
  } as never);
  if (candErr) throw candErr;

  await tempClient.auth.signOut();

  return { candidateId: data.user.id, password };
}

// ── Recruiters ──────────────────────────────────────────────────────────

export async function createRecruiter(userId: string, details: { fullName?: string; phone?: string }): Promise<void> {
  const referralCode = `RC${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const { error } = await supabase.from('recruiters').insert({
    id: userId,
    full_name: details.fullName || null,
    phone: details.phone || null,
    referral_code: referralCode,
    is_approved: false,
  } as never);
  if (error) throw error;
}

export async function getRecruiterByUserId(userId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('recruiters')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching recruiter:', error);
    return null;
  }
  return data;
}

export async function getAllRecruiters(): Promise<any[]> {
  const { data, error } = await supabase
    .from('recruiters')
    .select('*, profiles!recruiters_id_fkey(full_name, phone)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recruiters:', error);
    return [];
  }
  return (data || []).map((r: any) => ({
    ...r,
    profile_name: r.profiles?.full_name || r.full_name || '',
    profile_phone: r.profiles?.phone || r.phone || '',
  }));
}

export async function getRecruiterByReferralCode(code: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('recruiters')
    .select('*')
    .eq('referral_code', code)
    .single();

  if (error) {
    console.error('Error fetching recruiter by referral code:', error);
    return null;
  }
  return data;
}

export async function updateRecruiterApproval(recruiterId: string, isApproved: boolean, adminId: string | null): Promise<void> {
  const { error } = await supabase.from('recruiters').update({
    is_approved: isApproved,
    approved_by: isApproved ? adminId : null,
    approved_at: isApproved ? new Date().toISOString() : null,
  } as never).eq('id', recruiterId);
  if (error) throw error;
}

export async function getCandidatesReferredByRecruiter(recruiterId: string): Promise<(CandidateRow & { profile_name?: string; profile_phone?: string })[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*, profiles!candidates_id_fkey(full_name, phone)')
    .eq('referred_by_recruiter', recruiterId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recruiter-referred candidates:', error);
    return [];
  }
  return (data || []).map((c: any) => ({
    ...c,
    profile_name: c.profiles?.full_name || '',
    profile_phone: c.profiles?.phone || '',
  }));
}

export async function createCandidateAccountByRecruiter(recruiterId: string, details: {
  fullName: string;
  phone: string;
  email: string;
}): Promise<{ candidateId: string; password: string }> {
  const { createTempClient } = await import('./tempClient');
  const tempClient = createTempClient();

  const password = `RH${Math.random().toString(36).slice(2, 8)}${Math.floor(Math.random() * 90 + 10)}`;

  const { data, error } = await tempClient.auth.signUp({
    email: details.email,
    password,
    options: {
      data: { role: 'candidate', full_name: details.fullName, phone: details.phone },
    },
  });
  if (error) throw error;
  if (!data.user) throw new Error('Failed to create candidate account');

  const { error: candErr } = await tempClient.from('candidates').insert({
    id: data.user.id,
    referred_by_recruiter: recruiterId,
    referral_code_used: 'recruiter-onboarded',
  } as never);
  if (candErr) throw candErr;

  await tempClient.auth.signOut();

  return { candidateId: data.user.id, password };
}

export async function getOrCreatePlatformEmployer(adminUserId: string): Promise<EmployerRow> {
  const existing = await getEmployerByUserId(adminUserId);
  if (existing) return existing;

  await createEmployer(adminUserId, {
    companyName: 'RojgaarHai.com',
    industry: 'Recruitment Platform',
    contactName: 'RojgaarHai Team',
  });
  const created = await getEmployerByUserId(adminUserId);
  if (!created) throw new Error('Failed to create platform employer record');
  return created;
}

export async function getEmployerByReferralCode(code: string): Promise<EmployerRow | null> {
  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .eq('referral_code', code)
    .single();

  if (error) {
    console.error('Error fetching employer by referral code:', error);
    return null;
  }

  return data;
}

export async function getCandidatesReferredByEmployer(employerId: string): Promise<(CandidateRow & { profile_name?: string; profile_phone?: string })[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*, profiles!candidates_id_fkey(full_name, phone)')
    .eq('referred_by', employerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching referred candidates:', error);
    return [];
  }

  return (data || []).map((c: any) => ({
    ...c,
    profile_name: c.profiles?.full_name || '',
    profile_phone: c.profiles?.phone || '',
  }));
}

export async function createEmployer(userId: string, details: {
  companyName?: string;
  industry?: string;
  companySize?: string;
  city?: string;
  state?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
}): Promise<void> {
  const referralCode = `RH${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const { error } = await supabase.from('employers').insert({
    id: userId,
    company_name: details.companyName || null,
    industry: details.industry || null,
    company_size: details.companySize || null,
    city: details.city || null,
    state: details.state || null,
    contact_name: details.contactName || null,
    contact_email: details.contactEmail || null,
    contact_phone: details.contactPhone || null,
    referral_code: referralCode,
  } as never);
  if (error) throw error;
}

export async function updateCandidateProfile(userId: string, updates: Record<string, any>): Promise<void> {
  const profilePatch: Record<string, any> = {};
  if (updates.firstName || updates.lastName) {
    profilePatch.full_name = [updates.firstName, updates.lastName].filter(Boolean).join(' ');
  }
  if (updates.phone) profilePatch.phone = updates.phone;
  if (Object.keys(profilePatch).length) {
    const { error } = await supabase.from('profiles').update(profilePatch as never).eq('id', userId);
    if (error) throw error;
  }

  const candidatePatch: Record<string, any> = {
    date_of_birth: updates.dob || null,
    location: updates.location || null,
    city: updates.location || null,
    state: updates.state || null,
    country: updates.country || null,
    gender: updates.gender || null,
    marital_status: updates.maritalStatus || null,
    nationality: updates.nationality || null,
    qualification: updates.qualification || null,
    total_experience_years: updates.totalExperience ? Number(updates.totalExperience) || null : null,
    expected_salary_min: updates.expectedSalary ? Number(updates.expectedSalary) || null : null,
    preferred_job_type: updates.preferredJobType || null,
    preferred_shift: updates.preferredShift || null,
    notice_period: updates.noticePeriod || null,
    immediate_joining: Boolean(updates.immediateJoining),
    willing_to_relocate: Boolean(updates.willingToRelocate),
    aadhaar_number: updates.aadhaarNumber || null,
    pan_number: updates.panNumber || null,
    linkedin_url: updates.linkedin || null,
    github_url: updates.github || null,
    portfolio_url: updates.portfolio || null,
    website_url: updates.website || null,
    bio: updates.bio || null,
    resume_url: updates.resumeUrl || null,
    profile_photo_url: updates.profilePhotoUrl || null,
    aadhaar_url: updates.aadhaarUrl || null,
    pan_url: updates.panUrl || null,
    certificate_url: updates.certificateUrl || null,
    experience_letter_url: updates.experienceLetterUrl || null,
  };
  const { error: candErr } = await supabase.from('candidates').update(candidatePatch as never).eq('id', userId);
  if (candErr) throw candErr;

  if (Array.isArray(updates.skills)) {
    await supabase.from('candidate_skills').delete().eq('candidate_id', userId);
    const skillRows = updates.skills.filter(Boolean).map((skill: string) => ({ candidate_id: userId, skill_name: skill }));
    if (skillRows.length) {
      const { error: skillErr } = await supabase.from('candidate_skills').insert(skillRows as never);
      if (skillErr) throw skillErr;
    }
  }

  if (Array.isArray(updates.educationList)) {
    await supabase.from('candidate_education').delete().eq('candidate_id', userId);
    const rows = updates.educationList
      .filter((e: any) => e.college || e.degree)
      .map((e: any) => ({
        candidate_id: userId,
        institution_name: e.college || 'Not specified',
        degree: e.degree || null,
        field_of_study: e.qualification || null,
        end_year: /^\d{4}$/.test(e.passingYear) ? Number(e.passingYear) : null,
        grade: e.grade || null,
      }));
    if (rows.length) {
      const { error } = await supabase.from('candidate_education').insert(rows as never);
      if (error) throw error;
    }
  }

  if (Array.isArray(updates.experienceList)) {
    await supabase.from('candidate_experience').delete().eq('candidate_id', userId);
    const rows = updates.experienceList
      .filter((e: any) => e.company || e.designation)
      .map((e: any) => ({
        candidate_id: userId,
        company_name: e.company || 'Not specified',
        job_title: e.designation || 'Not specified',
        start_date: e.startDate || null,
        end_date: e.currentlyWorking ? null : (e.endDate || null),
        is_current: Boolean(e.currentlyWorking),
        description: e.responsibilities || null,
      }));
    if (rows.length) {
      const { error } = await supabase.from('candidate_experience').insert(rows as never);
      if (error) throw error;
    }
  }

  if (Array.isArray(updates.languageList)) {
    await supabase.from('candidate_languages').delete().eq('candidate_id', userId);
    const rows = updates.languageList
      .filter((l: any) => l.language)
      .map((l: any) => ({
        candidate_id: userId,
        language_name: l.language,
        proficiency: l.proficiency || null,
      }));
    if (rows.length) {
      const { error } = await supabase.from('candidate_languages').insert(rows as never);
      if (error) throw error;
    }
  }

  if (Array.isArray(updates.certificationList)) {
    await supabase.from('candidate_certifications').delete().eq('candidate_id', userId);
    const rows = updates.certificationList
      .filter((c: any) => c.name)
      .map((c: any) => ({
        candidate_id: userId,
        certification_name: c.name,
        issuing_organization: c.organization || null,
        issue_date: /^\d{4}$/.test(c.year) ? `${c.year}-01-01` : null,
        credential_id: c.credentialId || null,
      }));
    if (rows.length) {
      const { error } = await supabase.from('candidate_certifications').insert(rows as never);
      if (error) throw error;
    }
  }
}

export async function getCandidateEducation(candidateId: string) {
  const { data, error } = await supabase.from('candidate_education').select('*').eq('candidate_id', candidateId);
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function getCandidateExperience(candidateId: string) {
  const { data, error } = await supabase.from('candidate_experience').select('*').eq('candidate_id', candidateId);
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function getCandidateLanguages(candidateId: string) {
  const { data, error } = await supabase.from('candidate_languages').select('*').eq('candidate_id', candidateId);
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function getCandidateCertifications(candidateId: string) {
  const { data, error } = await supabase.from('candidate_certifications').select('*').eq('candidate_id', candidateId);
  if (error) { console.error(error); return []; }
  return data || [];
}

export async function updateCandidateStatus(userId: string, status: string): Promise<void> {
  const { error } = await supabase.from('candidates').update({ current_status: status } as never).eq('id', userId);
  if (error) throw error;
}

export async function getApprovedJobs(): Promise<JobPostingRow[]> {
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('status', 'Open')
    .eq('is_verified', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  return data || [];
}

export async function getJobsByEmployer(employerId: string): Promise<JobPostingRow[]> {
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('employer_id', employerId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching employer jobs:', error);
    return [];
  }

  return data || [];
}

export async function getApplicationsForJob(jobId: string): Promise<ApplicationRow[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('job_id', jobId)
    .order('applied_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications:', error);
    return [];
  }

  return data || [];
}

export async function getApplicationsForCandidate(candidateId: string): Promise<ApplicationRow[]> {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('applied_at', { ascending: false });

  if (error) {
    console.error('Error fetching candidate applications:', error);
    return [];
  }

  return data || [];
}

export async function getAllMatches(): Promise<MatchRow[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .order('match_score', { ascending: false });

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  return data || [];
}

export async function getMatchesForCandidate(candidateId: string): Promise<MatchRow[]> {
  if (candidateId === 'all') {
    return getAllMatches();
  }

  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('candidate_id', candidateId)
    .order('match_score', { ascending: false });

  if (error) {
    console.error('Error fetching matches:', error);
    return [];
  }

  return data || [];
}

export async function getMatchesForJob(jobId: string): Promise<MatchRow[]> {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('job_id', jobId)
    .order('match_score', { ascending: false });

  if (error) {
    console.error('Error fetching job matches:', error);
    return [];
  }

  return data || [];
}

export async function getAllEmployers(): Promise<EmployerRow[]> {
  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching employers:', error);
    return [];
  }

  return data || [];
}

export async function getAllCandidates(): Promise<(CandidateRow & { profile_name?: string; profile_phone?: string })[]> {
  const { data, error } = await supabase
    .from('candidates')
    .select('*, profiles:profiles!candidates_id_fkey(full_name, phone)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching candidates:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    ...row,
    profile_name: row.profiles?.full_name || '',
    profile_phone: row.profiles?.phone || '',
  }));
}

export async function getAllJobs(): Promise<JobPostingRow[]> {
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  return data || [];
}

export async function getCommunications(filters?: { candidateId?: string; employerId?: string; jobId?: string }): Promise<CommunicationRow[]> {
  let query = supabase.from('communications').select('*').order('communication_date', { ascending: false });

  if (filters?.candidateId) {
    query = query.eq('candidate_id', filters.candidateId);
  }

  if (filters?.employerId) {
    query = query.eq('employer_id', filters.employerId);
  }

  if (filters?.jobId) {
    query = query.eq('job_id', filters.jobId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching communications:', error);
    return [];
  }

  return data || [];
}

export async function getPlacements(filters?: { candidateId?: string; employerId?: string; jobId?: string }): Promise<PlacementRow[]> {
  let query = supabase.from('placements').select('*').order('placement_date', { ascending: false });

  if (filters?.candidateId) {
    query = query.eq('candidate_id', filters.candidateId);
  }

  if (filters?.employerId) {
    query = query.eq('employer_id', filters.employerId);
  }

  if (filters?.jobId) {
    query = query.eq('job_id', filters.jobId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching placements:', error);
    return [];
  }

  return data || [];
}

export async function createJobPosting(job: Partial<JobPostingRow>) {
  const { data, error } = await supabase
    .from('job_postings')
    .insert(job as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating job posting:', error);
    throw error;
  }

  return data;
}

export async function updateJobPosting(jobId: string, updates: Partial<JobPostingRow>) {
  const { data, error } = await supabase
    .from('job_postings')
    // @ts-ignore - generated types strictness workaround
    .update(updates as any)
    .eq('id', jobId)
    .select()
    .single();

  if (error) {
    console.error('Error updating job posting:', error);
    throw error;
  }

  return data;
}

export async function deleteJobPosting(jobId: string) {
  const { error } = await supabase
    .from('job_postings')
    .delete()
    .eq('id', jobId);

  if (error) {
    console.error('Error deleting job posting:', error);
    throw error;
  }
}

export async function createApplication(application: Partial<ApplicationRow>) {
  const { data, error } = await supabase
    .from('applications')
    .insert(application as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating application:', error);
    throw error;
  }

  return data;
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationRow['status']) {
  const timestampField: Record<string, string> = {
    shortlisted: 'shortlisted_at',
    interview_scheduled: 'interview_at',
    selected: 'selected_at',
    rejected: 'rejected_at',
  };
  const patch: Record<string, any> = { status };
  if (timestampField[status]) patch[timestampField[status]] = new Date().toISOString();

  const { data, error } = await supabase
    .from('applications')
    // @ts-ignore - generated types strictness workaround
    .update(patch as any)
    .eq('id', applicationId)
    .select()
    .single();

  if (error) {
    console.error('Error updating application:', error);
    throw error;
  }

  return data;
}

export async function uploadCandidateResume(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/resume.${ext}`;
  const { error: uploadError } = await supabase.storage.from('resumes').upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(path);
  const resumeUrl = urlData.publicUrl;

  const { error: updateError } = await supabase.from('candidates').update({ resume_url: resumeUrl } as never).eq('id', userId);
  if (updateError) throw updateError;

  return resumeUrl;
}

export async function uploadCandidateDocument(userId: string, file: File, docType: 'photo' | 'aadhaar' | 'pan' | 'certificate' | 'experience_letter'): Promise<string> {
  const ext = file.name.split('.').pop();
  const path = `${userId}/${docType}.${ext}`;
  const { error: uploadError } = await supabase.storage.from('resumes').upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from('resumes').getPublicUrl(path);
  const fileUrl = urlData.publicUrl;

  const columnMap: Record<string, string> = {
    photo: 'profile_photo_url',
    aadhaar: 'aadhaar_url',
    pan: 'pan_url',
    certificate: 'certificate_url',
    experience_letter: 'experience_letter_url',
  };

  const { error: updateError } = await supabase.from('candidates').update({ [columnMap[docType]]: fileUrl } as never).eq('id', userId);
  if (updateError) throw updateError;

  return fileUrl;
}

export async function updateEmployerProfile(employerId: string, updates: Partial<EmployerRow>): Promise<void> {
  const { error } = await supabase.from('employers').update(updates as never).eq('id', employerId);
  if (error) throw error;
}

export async function createCommunication(communication: Partial<CommunicationRow>) {
  const { data, error } = await supabase.from('communications').insert(communication as never).select().single();
  if (error) throw error;
  return data;
}

export async function createPlacement(placement: Partial<PlacementRow>) {
  const { data, error } = await supabase.from('placements').insert(placement as never).select().single();
  if (error) throw error;
  return data;
}

export async function updatePlacement(placementId: string, updates: Partial<PlacementRow>) {
  const { data, error } = await supabase.from('placements').update(updates as never).eq('id', placementId).select().single();
  if (error) throw error;
  return data;
}

export async function updateEmployerVerification(employerId: string, verified: boolean) {
  const { error } = await supabase.from('employers').update({ verified } as never).eq('id', employerId);
  if (error) throw error;
}

export async function updateCandidateRecordStatus(candidateId: string, status: string) {
  const { error } = await supabase.from('candidates').update({ status } as never).eq('id', candidateId);
  if (error) throw error;
}

export async function hireCandidate(candidateId: string, jobId: string, employerId: string, matchId?: string) {
  const { error: candErr } = await supabase.from('candidates').update({ status: 'Placed' } as never).eq('id', candidateId);
  if (candErr) throw candErr;

  if (matchId) {
    await supabase.from('matches').update({ status: 'Hired' } as never).eq('id', matchId);
  }

  const { error: placeErr } = await supabase.from('placements').insert({
    candidate_id: candidateId,
    job_id: jobId,
    employer_id: employerId,
    placement_date: new Date().toISOString().split('T')[0],
    commission: 4000,
    commission_status: 'Unpaid',
    status: 'Active',
  } as never);
  if (placeErr) throw placeErr;
}

export async function updateMatchStatus(matchId: string, status: string) {
  const { error } = await supabase.from('matches').update({ status } as never).eq('id', matchId);
  if (error) throw error;
}

export async function createMatch(match: Partial<MatchRow>) {
  const { data, error } = await supabase
    .from('matches')
    .insert(match as any)
    .select()
    .single();

  if (error) {
    console.error('Error creating match:', error);
    throw error;
  }

  return data;
}

export async function getApplicationsForJobs(jobIds: string[]): Promise<ApplicationRow[]> {
  if (jobIds.length === 0) return [];
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .in('job_id', jobIds)
    .order('applied_at', { ascending: false });

  if (error) {
    console.error('Error fetching applications for jobs:', error);
    return [];
  }

  return data || [];
}

export async function getMatchesForJobs(jobIds: string[]): Promise<MatchRow[]> {
  if (jobIds.length === 0) return [];
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .in('job_id', jobIds)
    .order('match_score', { ascending: false });

  if (error) {
    console.error('Error fetching matches for jobs:', error);
    return [];
  }

  return data || [];
}

export async function getJobSkills(jobId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('job_skills')
    .select('skill_name')
    .eq('job_id', jobId);

  if (error) {
    console.error('Error fetching job skills:', error);
    return [];
  }

  return (data || []).map((row: any) => row.skill_name).filter(Boolean);
}

export async function getAllJobSkills(jobIds: string[]): Promise<Record<string, string[]>> {
  if (jobIds.length === 0) return {};
  const { data, error } = await supabase
    .from('job_skills')
    .select('job_id, skill_name')
    .in('job_id', jobIds);

  if (error) {
    console.error('Error fetching job skills:', error);
    return {};
  }

  const result: Record<string, string[]> = {};
  (data || []).forEach((row: any) => {
    if (row.job_id && row.skill_name) {
      if (!result[row.job_id]) result[row.job_id] = [];
      result[row.job_id].push(row.skill_name);
    }
  });
  return result;
}

export async function getCandidateSkills(candidateId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('candidate_skills')
    .select('skill_name')
    .eq('candidate_id', candidateId);

  if (error) {
    console.error('Error fetching candidate skills:', error);
    return [];
  }

  return (data || []).map((row: any) => row.skill_name).filter(Boolean);
}

export async function getAllCandidateSkills(): Promise<Record<string, string[]>> {
  const { data, error } = await supabase
    .from('candidate_skills')
    .select('candidate_id, skill_name');

  if (error) {
    console.error('Error fetching candidate skills:', error);
    return {};
  }

  const result: Record<string, string[]> = {};
  (data || []).forEach((row: any) => {
    if (row.candidate_id && row.skill_name) {
      if (!result[row.candidate_id]) result[row.candidate_id] = [];
      result[row.candidate_id].push(row.skill_name);
    }
  });
  return result;
}

export async function getDashboardStats() {
  const { count: employersCount } = await supabase
    .from('employers')
    .select('*', { count: 'exact', head: true });

  const { count: candidatesCount } = await supabase
    .from('candidates')
    .select('*', { count: 'exact', head: true });

  const { count: jobsCount } = await supabase
    .from('job_postings')
    .select('*', { count: 'exact', head: true });

  const { count: matchesCount } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true });

  const { count: pendingJobsCount } = await supabase
    .from('job_postings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Pending');

  const { count: openJobsCount } = await supabase
    .from('job_postings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'Open');

  return {
    employers: employersCount || 0,
    candidates: candidatesCount || 0,
    jobs: jobsCount || 0,
    matches: matchesCount || 0,
    pendingJobs: pendingJobsCount || 0,
    openJobs: openJobsCount || 0,
  };
}

// ── Public job board (works for logged-out visitors too) ──────────────────

export async function getOpenJobsPublic(): Promise<JobPostingRow[]> {
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('status', 'Open')
    .eq('is_verified', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public jobs:', error);
    return [];
  }

  return data || [];
}

export async function getJobPostingById(jobId: string): Promise<JobPostingRow | null> {
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    console.error('Error fetching job posting:', error);
    return null;
  }

  return data;
}

export async function getJobRequirements(jobId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('job_requirements')
    .select('requirement')
    .eq('job_id', jobId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching job requirements:', error);
    return [];
  }

  return (data || []).map((r: any) => r.requirement).filter(Boolean);
}

export async function getJobResponsibilities(jobId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('job_responsibilities')
    .select('responsibility')
    .eq('job_id', jobId)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error fetching job responsibilities:', error);
    return [];
  }

  return (data || []).map((r: any) => r.responsibility).filter(Boolean);
}

// ── Employer job posting management ────────────────────────────────────────

export async function setJobSkills(jobId: string, skills: string[]): Promise<void> {
  if (skills.length === 0) return;
  const { error } = await supabase
    .from('job_skills')
    .insert(skills.map(s => ({ job_id: jobId, skill_name: s })) as any);
  if (error) throw error;
}

export async function setJobRequirements(jobId: string, requirements: string[]): Promise<void> {
  const rows = requirements.filter(Boolean).map((r, i) => ({ job_id: jobId, requirement: r, sort_order: i }));
  if (rows.length === 0) return;
  const { error } = await supabase.from('job_requirements').insert(rows as any);
  if (error) throw error;
}

export async function setJobResponsibilities(jobId: string, responsibilities: string[]): Promise<void> {
  const rows = responsibilities.filter(Boolean).map((r, i) => ({ job_id: jobId, responsibility: r, sort_order: i }));
  if (rows.length === 0) return;
  const { error } = await supabase.from('job_responsibilities').insert(rows as any);
  if (error) throw error;
}

export async function duplicateJobPosting(jobId: string): Promise<JobPostingRow> {
  const original = await getJobPostingById(jobId);
  if (!original) throw new Error('Job not found');
  const skills = await getJobSkills(jobId);

  const { id, created_at, updated_at, approved_at, approved_by, is_verified, status, ...rest } = original as any;
  const duplicated: any = await createJobPosting({
    ...rest,
    job_title: `${original.job_title} (Copy)`,
    status: 'Pending',
    is_verified: false,
  });
  if (skills.length > 0) await setJobSkills(duplicated.id, skills);
  return duplicated;
}
