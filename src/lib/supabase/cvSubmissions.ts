import { supabase } from './client';

// Admin-picked CVs sent to an employer for a job. Table: supabase/cv-submissions.sql

export type CvSubmissionStatus = 'sent' | 'viewed' | 'shortlisted' | 'interview' | 'hired' | 'rejected';

export interface CvSubmission {
  id: string;
  batch_id: string;
  employer_id: string;
  job_id: string | null;
  candidate_id: string;
  cv_request_id: string | null;
  candidate_name: string | null;
  candidate_phone: string | null;
  resume_url: string | null;
  match_score: number | null;
  share_contact: boolean;
  admin_note: string | null;
  message: string | null;
  status: CvSubmissionStatus;
  employer_feedback: string | null;
  viewed_at: string | null;
  responded_at: string | null;
  sent_by: string | null;
  sent_at: string;
  updated_at: string;
}

export const SUBMISSION_STATUS: Record<CvSubmissionStatus, { label: string; cls: string; employerLabel: string }> = {
  sent: { label: 'Not opened yet', cls: 'dash-status--neutral', employerLabel: 'New' },
  viewed: { label: 'Viewed', cls: 'dash-status--accent', employerLabel: 'Viewed' },
  shortlisted: { label: 'Shortlisted', cls: 'dash-status--success', employerLabel: 'Shortlisted' },
  interview: { label: 'Interview', cls: 'dash-status--warning', employerLabel: 'Interview' },
  hired: { label: 'Hired', cls: 'dash-status--success', employerLabel: 'Hired' },
  rejected: { label: 'Not a fit', cls: 'dash-status--danger', employerLabel: 'Not a fit' },
};

/** The table not existing yet (SQL not run) reads as "no submissions" instead of breaking a dashboard */
function isMissingTable(err: any) {
  const code = String(err?.code || err?.status || '');
  return code === '42P01' || code === 'PGRST205' || code === '404' || /does not exist|could not find the table/i.test(String(err?.message || ''));
}

export const SETUP_HINT = 'Run supabase/cv-submissions.sql in the Supabase SQL editor first.';

export async function getAllCvSubmissions(): Promise<CvSubmission[]> {
  const { data, error } = await (supabase as any).from('cv_submissions').select('*').order('sent_at', { ascending: false });
  if (error) {
    if (!isMissingTable(error)) console.error('Error fetching cv submissions:', error);
    return [];
  }
  return data || [];
}

export async function getCvSubmissionsForEmployer(employerId: string): Promise<CvSubmission[]> {
  const { data, error } = await (supabase as any)
    .from('cv_submissions')
    .select('*')
    .eq('employer_id', employerId)
    .order('sent_at', { ascending: false });
  if (error) {
    if (!isMissingTable(error)) console.error('Error fetching cv submissions:', error);
    return [];
  }
  return data || [];
}

export interface NewSubmission {
  candidate_id: string;
  candidate_name: string;
  candidate_phone: string | null;
  resume_url: string | null;
  match_score: number | null;
  admin_note: string | null;
}

/**
 * Sends one batch. Candidates already sent for this job are skipped by the unique index,
 * so a double tap or two admins working at once can never send the same CV twice.
 */
export async function sendCvSubmissions(args: {
  employerId: string;
  jobId: string | null;
  cvRequestId: string | null;
  sentBy: string | null;
  message: string | null;
  shareContact: boolean;
  candidates: NewSubmission[];
}): Promise<CvSubmission[]> {
  const batchId = crypto.randomUUID();
  const rows = args.candidates.map(c => ({
    batch_id: batchId,
    employer_id: args.employerId,
    job_id: args.jobId,
    cv_request_id: args.cvRequestId,
    candidate_id: c.candidate_id,
    candidate_name: c.candidate_name,
    candidate_phone: args.shareContact ? c.candidate_phone : null,
    resume_url: c.resume_url,
    match_score: c.match_score,
    share_contact: args.shareContact,
    admin_note: c.admin_note,
    message: args.message,
    sent_by: args.sentBy,
  }));
  const { data, error } = await (supabase as any).from('cv_submissions').insert(rows).select();
  if (error) {
    if (isMissingTable(error)) throw new Error(`CV sending is not set up yet. ${SETUP_HINT}`);
    if (String(error.code) === '23505') throw new Error('One of these candidates was already sent for this job. Refresh and try again.');
    throw new Error(error.message);
  }
  return data || [];
}

export async function withdrawCvSubmission(id: string): Promise<void> {
  const { error } = await (supabase as any).from('cv_submissions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

/** Employer side: open, shortlist, reject… Only status and feedback can change (enforced by a trigger). */
export async function respondToCvSubmission(id: string, patch: { status?: CvSubmissionStatus; employer_feedback?: string | null; markViewed?: boolean }): Promise<CvSubmission> {
  const now = new Date().toISOString();
  const update: Record<string, unknown> = {};
  if (patch.markViewed) {
    update.viewed_at = now;
  }
  if (patch.status) {
    update.status = patch.status;
    if (patch.status !== 'viewed' && patch.status !== 'sent') update.responded_at = now;
  }
  if (patch.employer_feedback !== undefined) update.employer_feedback = patch.employer_feedback;
  const { data, error } = await (supabase as any).from('cv_submissions').update(update).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}
