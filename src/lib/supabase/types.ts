export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: 'superadmin' | 'employer' | 'candidate';
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: 'superadmin' | 'employer' | 'candidate';
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: 'superadmin' | 'employer' | 'candidate';
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
      };
      employers: {
        Row: {
          id: string;
          company_name: string;
          industry: string | null;
          company_size: string | null;
          year_established: number | null;
          website: string | null;
          address: string | null;
          city: string | null;
          state: string | null;
          country: string;
          postal_code: string | null;
          contact_name: string | null;
          contact_email: string | null;
          contact_phone: string | null;
          gst_number: string | null;
          verified: boolean;
          verified_at: string | null;
          verified_by: string | null;
          referral_code: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          company_name: string;
          industry?: string | null;
          company_size?: string | null;
          year_established?: number | null;
          website?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string;
          postal_code?: string | null;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          gst_number?: string | null;
          verified?: boolean;
          verified_at?: string | null;
          verified_by?: string | null;
          referral_code: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_name?: string;
          industry?: string | null;
          company_size?: string | null;
          year_established?: number | null;
          website?: string | null;
          address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string;
          postal_code?: string | null;
          contact_name?: string | null;
          contact_email?: string | null;
          contact_phone?: string | null;
          gst_number?: string | null;
          verified?: boolean;
          verified_at?: string | null;
          verified_by?: string | null;
          referral_code?: string;
          notes?: string | null;
          updated_at?: string;
        };
      };
      candidates: {
        Row: {
          id: string;
          date_of_birth: string | null;
          location: string | null;
          city: string | null;
          state: string | null;
          country: string;
          gender: string | null;
          nationality: string;
          marital_status: string | null;
          qualification: string | null;
          specialization: string | null;
          total_experience_years: number;
          expected_salary_min: number | null;
          expected_salary_max: number | null;
          salary_currency: string;
          preferred_job_type: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' | 'Freelance' | null;
          preferred_shift: string | null;
          notice_period: string | null;
          immediate_joining: boolean;
          willing_to_relocate: boolean;
          current_status: string | null;
          resume_url: string | null;
          profile_photo_url: string | null;
          aadhaar_number: string | null;
          pan_number: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          portfolio_url: string | null;
          website_url: string | null;
          bio: string | null;
          referred_by: string | null;
          referral_code_used: string | null;
          status: 'New' | 'Contacted' | 'Interviewed' | 'Placed' | 'Inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          date_of_birth?: string | null;
          location?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string;
          gender?: string | null;
          nationality?: string;
          marital_status?: string | null;
          qualification?: string | null;
          specialization?: string | null;
          total_experience_years?: number;
          expected_salary_min?: number | null;
          expected_salary_max?: number | null;
          salary_currency?: string;
          preferred_job_type?: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' | 'Freelance' | null;
          preferred_shift?: string | null;
          notice_period?: string | null;
          immediate_joining?: boolean;
          willing_to_relocate?: boolean;
          current_status?: string | null;
          resume_url?: string | null;
          profile_photo_url?: string | null;
          aadhaar_number?: string | null;
          pan_number?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          website_url?: string | null;
          bio?: string | null;
          referred_by?: string | null;
          referral_code_used?: string | null;
          status?: 'New' | 'Contacted' | 'Interviewed' | 'Placed' | 'Inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          date_of_birth?: string | null;
          location?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string;
          gender?: string | null;
          nationality?: string;
          marital_status?: string | null;
          qualification?: string | null;
          specialization?: string | null;
          total_experience_years?: number;
          expected_salary_min?: number | null;
          expected_salary_max?: number | null;
          salary_currency?: string;
          preferred_job_type?: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' | 'Freelance' | null;
          preferred_shift?: string | null;
          notice_period?: string | null;
          immediate_joining?: boolean;
          willing_to_relocate?: boolean;
          current_status?: string | null;
          resume_url?: string | null;
          profile_photo_url?: string | null;
          aadhaar_number?: string | null;
          pan_number?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          portfolio_url?: string | null;
          website_url?: string | null;
          bio?: string | null;
          referred_by?: string | null;
          referral_code_used?: string | null;
          status?: 'New' | 'Contacted' | 'Interviewed' | 'Placed' | 'Inactive';
          updated_at?: string;
        };
      };
      job_postings: {
        Row: {
          id: string;
          employer_id: string;
          job_title: string;
          number_of_openings: number;
          city: string | null;
          state: string | null;
          country: string;
          salary_min: number | null;
          salary_max: number | null;
          salary_currency: string;
          employment_type: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' | 'Freelance';
          qualification_required: string | null;
          experience_min_years: number | null;
          experience_max_years: number | null;
          job_description: string;
          benefits: string | null;
          joining_timeline: string | null;
          working_hours: string | null;
          accommodation_provided: boolean;
          transportation_provided: boolean;
          additional_notes: string | null;
          recruiter_name: string | null;
          recruiter_email: string | null;
          recruiter_phone: string | null;
          status: 'Pending' | 'Open' | 'Closed' | 'On Hold';
          is_verified: boolean;
          approved_by: string | null;
          approved_at: string | null;
          deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          employer_id: string;
          job_title: string;
          number_of_openings?: number;
          city?: string | null;
          state?: string | null;
          country?: string;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          employment_type: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' | 'Freelance';
          qualification_required?: string | null;
          experience_min_years?: number | null;
          experience_max_years?: number | null;
          job_description: string;
          benefits?: string | null;
          joining_timeline?: string | null;
          working_hours?: string | null;
          accommodation_provided?: boolean;
          transportation_provided?: boolean;
          additional_notes?: string | null;
          recruiter_name?: string | null;
          recruiter_email?: string | null;
          recruiter_phone?: string | null;
          status?: 'Pending' | 'Open' | 'Closed' | 'On Hold';
          is_verified?: boolean;
          approved_by?: string | null;
          approved_at?: string | null;
          deadline?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          employer_id?: string;
          job_title?: string;
          number_of_openings?: number;
          city?: string | null;
          state?: string | null;
          country?: string;
          salary_min?: number | null;
          salary_max?: number | null;
          salary_currency?: string;
          employment_type?: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' | 'Freelance';
          qualification_required?: string | null;
          experience_min_years?: number | null;
          experience_max_years?: number | null;
          job_description?: string;
          benefits?: string | null;
          joining_timeline?: string | null;
          working_hours?: string | null;
          accommodation_provided?: boolean;
          transportation_provided?: boolean;
          additional_notes?: string | null;
          recruiter_name?: string | null;
          recruiter_email?: string | null;
          recruiter_phone?: string | null;
          status?: 'Pending' | 'Open' | 'Closed' | 'On Hold';
          is_verified?: boolean;
          approved_by?: string | null;
          approved_at?: string | null;
          deadline?: string | null;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          candidate_id: string;
          job_id: string;
          status: 'applied' | 'screening' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'selected' | 'rejected' | 'withdrawn' | 'joined';
          cover_letter: string | null;
          recruiter_notes: string | null;
          applied_at: string;
          shortlisted_at: string | null;
          interview_at: string | null;
          selected_at: string | null;
          rejected_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          job_id: string;
          status?: 'applied' | 'screening' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'selected' | 'rejected' | 'withdrawn' | 'joined';
          cover_letter?: string | null;
          recruiter_notes?: string | null;
          applied_at?: string;
          shortlisted_at?: string | null;
          interview_at?: string | null;
          selected_at?: string | null;
          rejected_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          job_id?: string;
          status?: 'applied' | 'screening' | 'shortlisted' | 'interview_scheduled' | 'interviewed' | 'selected' | 'rejected' | 'withdrawn' | 'joined';
          cover_letter?: string | null;
          recruiter_notes?: string | null;
          shortlisted_at?: string | null;
          interview_at?: string | null;
          selected_at?: string | null;
          rejected_at?: string | null;
          updated_at?: string;
        };
      };
      matches: {
        Row: {
          id: string;
          candidate_id: string;
          job_id: string;
          match_score: number;
          status: 'Pending' | 'Shortlisted' | 'Interview Scheduled' | 'Offered' | 'Hired' | 'Rejected';
          matched_skills: Json;
          missing_skills: Json;
          match_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          job_id: string;
          match_score: number;
          status?: 'Pending' | 'Shortlisted' | 'Interview Scheduled' | 'Offered' | 'Hired' | 'Rejected';
          matched_skills?: Json;
          missing_skills?: Json;
          match_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          job_id?: string;
          match_score?: number;
          status?: 'Pending' | 'Shortlisted' | 'Interview Scheduled' | 'Offered' | 'Hired' | 'Rejected';
          matched_skills?: Json;
          missing_skills?: Json;
          match_reason?: string | null;
          updated_at?: string;
        };
      };
      communications: {
        Row: {
          id: string;
          communication_date: string;
          type: 'Email' | 'Call' | 'SMS' | 'In-Person';
          contact_type: 'Candidate' | 'Employer';
          candidate_id: string | null;
          employer_id: string | null;
          job_id: string | null;
          contact_name: string;
          subject: string | null;
          notes: string | null;
          outcome: string | null;
          agent_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          communication_date?: string;
          type: 'Email' | 'Call' | 'SMS' | 'In-Person';
          contact_type: 'Candidate' | 'Employer';
          candidate_id?: string | null;
          employer_id?: string | null;
          job_id?: string | null;
          contact_name: string;
          subject?: string | null;
          notes?: string | null;
          outcome?: string | null;
          agent_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          communication_date?: string;
          type?: 'Email' | 'Call' | 'SMS' | 'In-Person';
          contact_type?: 'Candidate' | 'Employer';
          candidate_id?: string | null;
          employer_id?: string | null;
          job_id?: string | null;
          contact_name?: string;
          subject?: string | null;
          notes?: string | null;
          outcome?: string | null;
          agent_id?: string | null;
        };
      };
      placements: {
        Row: {
          id: string;
          candidate_id: string;
          job_id: string;
          employer_id: string;
          application_id: string | null;
          placement_date: string;
          joining_date: string | null;
          handover_date: string | null;
          commission: number;
          commission_currency: string;
          commission_status: 'Paid' | 'Unpaid' | 'Partial';
          commission_paid_at: string | null;
          status: 'Active' | 'Completed' | 'Terminated';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          job_id: string;
          employer_id: string;
          application_id?: string | null;
          placement_date: string;
          joining_date?: string | null;
          handover_date?: string | null;
          commission?: number;
          commission_currency?: string;
          commission_status?: 'Paid' | 'Unpaid' | 'Partial';
          commission_paid_at?: string | null;
          status?: 'Active' | 'Completed' | 'Terminated';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          job_id?: string;
          employer_id?: string;
          application_id?: string | null;
          placement_date?: string;
          joining_date?: string | null;
          handover_date?: string | null;
          commission?: number;
          commission_currency?: string;
          commission_status?: 'Paid' | 'Unpaid' | 'Partial';
          commission_paid_at?: string | null;
          status?: 'Active' | 'Completed' | 'Terminated';
          notes?: string | null;
          updated_at?: string;
        };
      };
      candidate_skills: {
        Row: {
          id: string;
          candidate_id: string;
          skill_name: string;
          proficiency: string | null;
          years_experience: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          skill_name: string;
          proficiency?: string | null;
          years_experience?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          skill_name?: string;
          proficiency?: string | null;
          years_experience?: number | null;
        };
      };
      candidate_preferred_locations: {
        Row: {
          id: string;
          candidate_id: string;
          city: string | null;
          state: string | null;
          country: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          city?: string | null;
          state?: string | null;
          country?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          city?: string | null;
          state?: string | null;
          country?: string;
        };
      };
      candidate_education: {
        Row: {
          id: string;
          candidate_id: string;
          institution_name: string;
          degree: string | null;
          field_of_study: string | null;
          start_year: number | null;
          end_year: number | null;
          grade: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          institution_name: string;
          degree?: string | null;
          field_of_study?: string | null;
          start_year?: number | null;
          end_year?: number | null;
          grade?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          institution_name?: string;
          degree?: string | null;
          field_of_study?: string | null;
          start_year?: number | null;
          end_year?: number | null;
          grade?: string | null;
          description?: string | null;
        };
      };
      candidate_experience: {
        Row: {
          id: string;
          candidate_id: string;
          company_name: string;
          job_title: string;
          employment_type: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' | 'Freelance' | null;
          start_date: string | null;
          end_date: string | null;
          is_current: boolean;
          location: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          company_name: string;
          job_title: string;
          employment_type?: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' | 'Freelance' | null;
          start_date?: string | null;
          end_date?: string | null;
          is_current?: boolean;
          location?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          company_name?: string;
          job_title?: string;
          employment_type?: 'Full-time' | 'Part-time' | 'Contract' | 'Temporary' | 'Internship' | 'Freelance' | null;
          start_date?: string | null;
          end_date?: string | null;
          is_current?: boolean;
          location?: string | null;
          description?: string | null;
        };
      };
      candidate_languages: {
        Row: {
          id: string;
          candidate_id: string;
          language_name: string;
          proficiency: string | null;
          can_read: boolean;
          can_write: boolean;
          can_speak: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          language_name: string;
          proficiency?: string | null;
          can_read?: boolean;
          can_write?: boolean;
          can_speak?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          language_name?: string;
          proficiency?: string | null;
          can_read?: boolean;
          can_write?: boolean;
          can_speak?: boolean;
        };
      };
      candidate_certifications: {
        Row: {
          id: string;
          candidate_id: string;
          certification_name: string;
          issuing_organization: string | null;
          issue_date: string | null;
          expiry_date: string | null;
          credential_id: string | null;
          credential_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          candidate_id: string;
          certification_name: string;
          issuing_organization?: string | null;
          issue_date?: string | null;
          expiry_date?: string | null;
          credential_id?: string | null;
          credential_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          candidate_id?: string;
          certification_name?: string;
          issuing_organization?: string | null;
          issue_date?: string | null;
          expiry_date?: string | null;
          credential_id?: string | null;
          credential_url?: string | null;
        };
      };
      job_skills: {
        Row: {
          id: string;
          job_id: string;
          skill_name: string;
          is_required: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          skill_name: string;
          is_required?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          skill_name?: string;
          is_required?: boolean;
        };
      };
      job_responsibilities: {
        Row: {
          id: string;
          job_id: string;
          responsibility: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          responsibility: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          responsibility?: string;
          sort_order?: number;
        };
      };
      job_requirements: {
        Row: {
          id: string;
          job_id: string;
          requirement: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          requirement: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          requirement?: string;
          sort_order?: number;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
