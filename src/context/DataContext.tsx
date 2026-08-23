import { createContext, useContext, useState, ReactNode } from 'react';

// Types
export interface EducationEntry {
  id: string;
  degree: string;
  qualification: string;
  college: string;
  university: string;
  passingYear: string;
  grade: string;
}

export interface ExperienceEntry {
  id: string;
  company: string;
  designation: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  responsibilities: string;
}

export interface LanguageEntry {
  id: string;
  language: string;
  proficiency: 'Basic' | 'Intermediate' | 'Fluent' | 'Native';
}

export interface CertificationEntry {
  id: string;
  name: string;
  organization: string;
  year: string;
  credentialId: string;
}

export interface JobSeeker {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  altPhone?: string;
  email: string;
  dob: string;
  location: string;
  state: string;
  country?: string;
  address?: string;
  pincode?: string;
  gender: string;
  maritalStatus?: string;
  nationality?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  qualification: string;
  skills: string[];
  previousCompany: string;
  currentCompany?: string;
  currentJobTitle?: string;
  relevantExperience?: string;
  industry?: string;
  department?: string;
  currentStatus?: 'Open to Work' | 'Employed' | 'Freelancer' | 'Student';
  totalExperience: string;
  willingToRelocate: boolean;
  preferredLocations: string[];
  expectedSalary: string;
  preferredJobRole?: string;
  preferredIndustry?: string;
  preferredJobType: string;
  preferredShift?: string;
  noticePeriod?: string;
  immediateJoining?: boolean;
  resumeUrl?: string;
  profilePhoto?: string;
  status: 'New' | 'Contacted' | 'Interviewed' | 'Placed' | 'Inactive';
  createdAt: string;
  referredBy?: string;
  referralCodeUsed?: string;
  // Full submission data & documents
  resumeFile?: string;
  profilePhotoFile?: string;
  aadhaarFile?: string;
  panFile?: string;
  certificatesFile?: string;
  experienceLetterFile?: string;
  // Social & Bio
  linkedin?: string;
  github?: string;
  portfolio?: string;
  website?: string;
  bio?: string;
  // Lists
  educationList?: EducationEntry[];
  experienceList?: ExperienceEntry[];
  languageList?: LanguageEntry[];
  certificationList?: CertificationEntry[];
}

export interface Employer {
  id: string;
  companyName: string;
  industry: string;
  companySize: string;
  yearEstablished: string;
  website: string;
  address: string;
  city: string;
  state: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  gstNumber: string;
  createdAt: string;
  verified?: boolean;
  referralCode?: string;
}

export interface JobPosting {
  id: string;
  employerId: string;
  companyName: string;
  jobTitle: string;
  numberOfOpenings: number;
  city: string;
  state: string;
  salaryMin: string;
  salaryMax: string;
  employmentType: string;
  qualificationRequired: string;
  experienceRequired: string;
  skillsRequired: string[];
  jobDescription: string;
  benefits: string;
  joiningTimeline: string;
  accommodationProvided: boolean;
  transportationProvided: boolean;
  additionalNotes: string;
  status: 'Pending' | 'Open' | 'Closed' | 'On Hold';
  createdAt: string;
  applicants: string[]; // candidate IDs
  isVerified?: boolean;
  approvedBy?: string;
  approvedAt?: string;
  deadline?: string;
  responsibilities?: string[];
  requirements?: string[];
  workingHours?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  recruiterPhone?: string;
}

export interface CandidateMatch {
  id: string;
  candidateId: string;
  jobId: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  matchScore: number;
  status: 'Pending' | 'Shortlisted' | 'Interview Scheduled' | 'Offered' | 'Hired' | 'Rejected';
  createdAt: string;
}

export interface Communication {
  id: string;
  date: string;
  type: 'Email' | 'Call' | 'SMS' | 'In-Person';
  contactType: 'Candidate' | 'Employer';
  contactName: string;
  subject: string;
  notes: string;
  outcome: string;
  agentName: string;
}

export interface Placement {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  employerId: string;
  companyName: string;
  placementDate: string;
  handoverDate: string;
  commission: number;
  commissionStatus: 'Paid' | 'Unpaid' | 'Partial';
  status: 'Active' | 'Completed' | 'Terminated';
}

// ─── MOCK DATA (KEPT INTACT FOR DEMO) ─────────────────────────

const mockJobSeekers: JobSeeker[] = [
  { id: 'JS001', firstName: 'Rajesh', lastName: 'Kumar', phone: '+91-9876543210', email: 'rajesh.kumar@email.com', dob: '1995-03-15', location: 'Jaipur', state: 'Rajasthan', gender: 'Male', qualification: 'B.Com', skills: ['Accounting', 'Tally', 'Excel'], previousCompany: 'Local Traders Pvt Ltd', totalExperience: '3', willingToRelocate: true, preferredLocations: ['Delhi', 'Mumbai', 'Ahmedabad'], expectedSalary: '18000', preferredJobType: 'Full-time', status: 'New', createdAt: '2024-01-15', resumeFile: 'Rajesh_Kumar_Resume.pdf', profilePhotoFile: 'rajesh_photo.jpg' },
  { id: 'JS002', firstName: 'Priya', lastName: 'Sharma', phone: '+91-9876543211', email: 'priya.sharma@email.com', dob: '1998-07-22', location: 'Lucknow', state: 'Uttar Pradesh', gender: 'Female', qualification: 'B.Sc Nursing', skills: ['Nursing', 'Patient Care', 'First Aid', 'ICU'], previousCompany: 'City Hospital', totalExperience: '2', willingToRelocate: true, preferredLocations: ['Delhi', 'Bangalore'], expectedSalary: '20000', preferredJobType: 'Full-time', status: 'Contacted', createdAt: '2024-01-18', resumeFile: 'Priya_Sharma_Resume.pdf' },
  { id: 'JS003', firstName: 'Amit', lastName: 'Patel', phone: '+91-9876543212', email: 'amit.patel@email.com', dob: '1992-11-08', location: 'Ahmedabad', state: 'Gujarat', gender: 'Male', qualification: 'ITI Electrician', skills: ['Electrical Wiring', 'Motor Repair', 'Maintenance'], previousCompany: 'Gujarat Electrics', totalExperience: '5', willingToRelocate: false, preferredLocations: [], expectedSalary: '22000', preferredJobType: 'Full-time', status: 'Interviewed', createdAt: '2024-01-20', resumeFile: 'Amit_Patel_Resume.pdf', profilePhotoFile: 'amit_photo.jpg' },
  { id: 'JS004', firstName: 'Sunita', lastName: 'Devi', phone: '+91-9876543213', email: 'sunita.devi@email.com', dob: '1997-05-30', location: 'Patna', state: 'Bihar', gender: 'Female', qualification: 'BA', skills: ['Teaching', 'Hindi', 'English'], previousCompany: 'Govt School', totalExperience: '4', willingToRelocate: true, preferredLocations: ['Delhi', 'Pune', 'Hyderabad'], expectedSalary: '16000', preferredJobType: 'Full-time', status: 'Placed', createdAt: '2024-01-22' },
  { id: 'JS005', firstName: 'Vikram', lastName: 'Singh', phone: '+91-9876543214', email: 'vikram.singh@email.com', dob: '1990-09-12', location: 'Chandigarh', state: 'Punjab', gender: 'Male', qualification: 'Diploma Mechanical', skills: ['Welding', 'Fabrication', 'CNC Operation'], previousCompany: 'Auto Parts Ltd', totalExperience: '7', willingToRelocate: true, preferredLocations: ['Chennai', 'Pune', 'Manesar'], expectedSalary: '25000', preferredJobType: 'Full-time', status: 'New', createdAt: '2024-01-25', resumeFile: 'Vikram_Singh_Resume.pdf' },
  { id: 'JS006', firstName: 'Meera', lastName: 'Reddy', phone: '+91-9876543215', email: 'meera.reddy@email.com', dob: '1999-01-18', location: 'Hyderabad', state: 'Telangana', gender: 'Female', qualification: 'B.Tech', skills: ['Python', 'Data Entry', 'MS Office'], previousCompany: '', totalExperience: '0', willingToRelocate: true, preferredLocations: ['Bangalore', 'Hyderabad', 'Chennai'], expectedSalary: '15000', preferredJobType: 'Full-time', status: 'New', createdAt: '2024-02-01', resumeFile: 'Meera_Reddy_Resume.pdf', profilePhotoFile: 'meera_photo.jpg' },
  { id: 'JS007', firstName: 'Ramesh', lastName: 'Yadav', phone: '+91-9876543216', email: 'ramesh.yadav@email.com', dob: '1993-06-25', location: 'Bhopal', state: 'Madhya Pradesh', gender: 'Male', qualification: '12th Pass', skills: ['Driving', 'Delivery', 'Warehouse'], previousCompany: 'LogiTrans', totalExperience: '6', willingToRelocate: true, preferredLocations: ['Delhi', 'Mumbai', 'Indore'], expectedSalary: '14000', preferredJobType: 'Full-time', status: 'Contacted', createdAt: '2024-02-03' },
  { id: 'JS008', firstName: 'Kavita', lastName: 'Verma', phone: '+91-9876543217', email: 'kavita.verma@email.com', dob: '1996-12-03', location: 'Indore', state: 'Madhya Pradesh', gender: 'Female', qualification: 'MBA', skills: ['HR', 'Recruitment', 'Payroll'], previousCompany: 'StartupHR', totalExperience: '3', willingToRelocate: true, preferredLocations: ['Pune', 'Mumbai', 'Bangalore'], expectedSalary: '28000', preferredJobType: 'Full-time', status: 'New', createdAt: '2024-02-05', resumeFile: 'Kavita_Verma_CV.pdf' },
  { id: 'JS009', firstName: 'Suresh', lastName: 'Naik', phone: '+91-9876543218', email: 'suresh.naik@email.com', dob: '1991-04-14', location: 'Goa', state: 'Goa', gender: 'Male', qualification: 'ITI Fitter', skills: ['Machine Operation', 'Quality Check', 'Assembly'], previousCompany: 'Goa Industries', totalExperience: '8', willingToRelocate: true, preferredLocations: ['Pune', 'Chennai', 'Bangalore'], expectedSalary: '20000', preferredJobType: 'Contract', status: 'Interviewed', createdAt: '2024-02-07', resumeFile: 'Suresh_Naik_Resume.pdf' },
  { id: 'JS010', firstName: 'Anita', lastName: 'Kumari', phone: '+91-9876543219', email: 'anita.kumari@email.com', dob: '2000-08-20', location: 'Ranchi', state: 'Jharkhand', gender: 'Female', qualification: 'B.A', skills: ['Tailoring', 'Handicraft', 'Embroidery'], previousCompany: '', totalExperience: '2', willingToRelocate: false, preferredLocations: [], expectedSalary: '10000', preferredJobType: 'Part-time', status: 'New', createdAt: '2024-02-10' },
  { id: 'JS011', firstName: 'Deepak', lastName: 'Mishra', phone: '+91-9876543220', email: 'deepak.mishra@email.com', dob: '1989-02-28', location: 'Varanasi', state: 'Uttar Pradesh', gender: 'Male', qualification: 'B.Ed', skills: ['Teaching', 'Mathematics', 'Science'], previousCompany: 'Saraswati Vidya Mandir', totalExperience: '5', willingToRelocate: true, preferredLocations: ['Delhi', 'Lucknow', 'Bhopal'], expectedSalary: '22000', preferredJobType: 'Full-time', status: 'New', createdAt: '2024-02-12', resumeFile: 'Deepak_Mishra_Resume.pdf' },
  { id: 'JS012', firstName: 'Lakshmi', lastName: 'Naidu', phone: '+91-9876543221', email: 'lakshmi.naidu@email.com', dob: '1994-10-09', location: 'Visakhapatnam', state: 'Andhra Pradesh', gender: 'Female', qualification: 'B.Pharm', skills: ['Pharmacy', 'Drug Dispensing', 'Patient Counseling'], previousCompany: 'Apollo Pharmacy', totalExperience: '4', willingToRelocate: true, preferredLocations: ['Hyderabad', 'Chennai', 'Bangalore'], expectedSalary: '24000', preferredJobType: 'Full-time', status: 'Contacted', createdAt: '2024-02-14', resumeFile: 'Lakshmi_Naidu_Resume.pdf' },
  { id: 'JS013', firstName: 'Mohan', lastName: 'Das', phone: '+91-9876543222', email: 'mohan.das@email.com', dob: '1993-07-05', location: 'Kochi', state: 'Kerala', gender: 'Male', qualification: 'Diploma Electrical', skills: ['Electrical Wiring', 'PLC Programming', 'Maintenance', 'Safety'], previousCompany: 'Kerala Power Ltd', totalExperience: '6', willingToRelocate: true, preferredLocations: ['Chennai', 'Bangalore', 'Mumbai'], expectedSalary: '23000', preferredJobType: 'Full-time', status: 'New', createdAt: '2024-02-16', resumeFile: 'Mohan_Das_Resume.pdf' },
  { id: 'JS014', firstName: 'Geeta', lastName: 'Rani', phone: '+91-9876543223', email: 'geeta.rani@email.com', dob: '1997-03-19', location: 'Gurgaon', state: 'Haryana', gender: 'Female', qualification: 'BBA', skills: ['Sales', 'Customer Service', 'CRM', 'Communication'], previousCompany: 'RetailMax', totalExperience: '3', willingToRelocate: false, preferredLocations: [], expectedSalary: '20000', preferredJobType: 'Full-time', status: 'Contacted', createdAt: '2024-02-18' },
  { id: 'JS015', firstName: 'Sanjay', lastName: 'Gupta', phone: '+91-9876543224', email: 'sanjay.gupta@email.com', dob: '1988-11-30', location: 'Kolkata', state: 'West Bengal', gender: 'Male', qualification: 'ITI Welder', skills: ['Welding', 'Fabrication', 'Blueprint Reading', 'Safety'], previousCompany: 'Bengal Heavy Engineering', totalExperience: '10', willingToRelocate: true, preferredLocations: ['Pune', 'Jamshedpur', 'Ranchi'], expectedSalary: '28000', preferredJobType: 'Contract', status: 'Interviewed', createdAt: '2024-02-20', resumeFile: 'Sanjay_Gupta_Resume.pdf' },
  { id: 'JS016', firstName: 'Pooja', lastName: 'Thakur', phone: '+91-9876543225', email: 'pooja.thakur@email.com', dob: '1999-09-08', location: 'Dehradun', state: 'Uttarakhand', gender: 'Female', qualification: 'B.Sc IT', skills: ['JavaScript', 'HTML', 'CSS', 'React'], previousCompany: '', totalExperience: '1', willingToRelocate: true, preferredLocations: ['Bangalore', 'Noida', 'Pune'], expectedSalary: '18000', preferredJobType: 'Full-time', status: 'New', createdAt: '2024-02-22', resumeFile: 'Pooja_Thakur_Resume.pdf', profilePhotoFile: 'pooja_photo.jpg' },
  { id: 'JS017', firstName: 'Ravi', lastName: 'Kumar', phone: '+91-9876543226', email: 'ravi.kumar@email.com', dob: '1991-05-14', location: 'Ranchi', state: 'Jharkhand', gender: 'Male', qualification: '12th Pass', skills: ['Driving', 'Warehouse', 'Loading', 'Inventory'], previousCompany: 'Jharkhand Logistics', totalExperience: '8', willingToRelocate: true, preferredLocations: ['Delhi', 'Kolkata', 'Mumbai'], expectedSalary: '16000', preferredJobType: 'Full-time', status: 'New', createdAt: '2024-02-24' },
  { id: 'JS018', firstName: 'Nandini', lastName: 'Patil', phone: '+91-9876543227', email: 'nandini.patil@email.com', dob: '1996-01-25', location: 'Kolhapur', state: 'Maharashtra', gender: 'Female', qualification: 'B.Sc Agriculture', skills: ['Agriculture', 'Crop Management', 'Soil Testing', 'Irrigation'], previousCompany: 'AgriTech Solutions', totalExperience: '4', willingToRelocate: true, preferredLocations: ['Pune', 'Nashik', 'Ahmedabad'], expectedSalary: '19000', preferredJobType: 'Full-time', status: 'Contacted', createdAt: '2024-02-26', resumeFile: 'Nandini_Patil_Resume.pdf' },
  { id: 'JS019', firstName: 'Arjun', lastName: 'Meena', phone: '+91-9876543228', email: 'arjun.meena@email.com', dob: '1994-08-11', location: 'Udaipur', state: 'Rajasthan', gender: 'Male', qualification: 'Diploma Civil', skills: ['Construction', 'Site Management', 'AutoCAD', 'Surveying'], previousCompany: 'Rajasthan Builders', totalExperience: '5', willingToRelocate: true, preferredLocations: ['Jaipur', 'Delhi', 'Ahmedabad'], expectedSalary: '24000', preferredJobType: 'Full-time', status: 'New', createdAt: '2024-02-28' },
  { id: 'JS020', firstName: 'Savita', lastName: 'Jadhav', phone: '+91-9876543229', email: 'savita.jadhav@email.com', dob: '1998-04-02', location: 'Nagpur', state: 'Maharashtra', gender: 'Female', qualification: 'B.Com', skills: ['Accounting', 'Tally', 'GST Filing', 'Excel', 'Banking'], previousCompany: 'Nagpur Finance Corp', totalExperience: '2', willingToRelocate: false, preferredLocations: [], expectedSalary: '17000', preferredJobType: 'Full-time', status: 'New', createdAt: '2024-03-01' },
  { id: 'JS021', firstName: 'Manoj', lastName: 'Tiwari', phone: '+91-9876543230', email: 'manoj.tiwari@email.com', dob: '1990-12-17', location: 'Allahabad', state: 'Uttar Pradesh', gender: 'Male', qualification: 'ITI Fitter', skills: ['Machine Operation', 'Assembly', 'Quality Check', 'Maintenance', 'Safety'], previousCompany: 'UP Manufacturing Co', totalExperience: '9', willingToRelocate: true, preferredLocations: ['Pune', 'Manesar', 'Chennai'], expectedSalary: '26000', preferredJobType: 'Full-time', status: 'Placed', createdAt: '2024-03-03', resumeFile: 'Manoj_Tiwari_Resume.pdf' },
  { id: 'JS022', firstName: 'Rekha', lastName: 'Chauhan', phone: '+91-9876543231', email: 'rekha.chauhan@email.com', dob: '1995-06-23', location: 'Jodhpur', state: 'Rajasthan', gender: 'Female', qualification: 'ANM', skills: ['Nursing', 'Patient Care', 'Vaccination', 'First Aid'], previousCompany: 'Jodhpur Community Health Center', totalExperience: '3', willingToRelocate: true, preferredLocations: ['Jaipur', 'Delhi', 'Ahmedabad'], expectedSalary: '18000', preferredJobType: 'Full-time', status: 'New', createdAt: '2024-03-05', resumeFile: 'Rekha_Chauhan_Resume.pdf' },
  { id: 'JS023', firstName: 'Kiran', lastName: 'Naik', phone: '+91-9876543232', email: 'kiran.naik@email.com', dob: '1992-02-09', location: 'Margao', state: 'Goa', gender: 'Male', qualification: 'Diploma Mechanical', skills: ['Welding', 'Fabrication', 'CNC Operation', 'Blueprint Reading'], previousCompany: 'Goa Shipyard', totalExperience: '7', willingToRelocate: true, preferredLocations: ['Mumbai', 'Pune', 'Chennai'], expectedSalary: '27000', preferredJobType: 'Full-time', status: 'Contacted', createdAt: '2024-03-07', resumeFile: 'Kiran_Naik_Resume.pdf' },
  { id: 'JS024', firstName: 'Suman', lastName: 'Kumari', phone: '+91-9876543233', email: 'suman.kumari@email.com', dob: '2001-10-15', location: 'Darbhanga', state: 'Bihar', gender: 'Female', qualification: '12th Pass', skills: ['Data Entry', 'Typing', 'MS Office'], previousCompany: '', totalExperience: '0', willingToRelocate: true, preferredLocations: ['Delhi', 'Patna'], expectedSalary: '12000', preferredJobType: 'Full-time', status: 'New', createdAt: '2024-03-09' },
  { id: 'JS025', firstName: 'Ganesh', lastName: 'Patel', phone: '+91-9876543234', email: 'ganesh.patel@email.com', dob: '1987-09-03', location: 'Surat', state: 'Gujarat', gender: 'Male', qualification: 'ITI Turner', skills: ['Lathe Operation', 'Machine Operation', 'Precision Tools', 'Quality Control'], previousCompany: 'Surat Diamond Tools', totalExperience: '12', willingToRelocate: false, preferredLocations: [], expectedSalary: '30000', preferredJobType: 'Full-time', status: 'Interviewed', createdAt: '2024-03-11', resumeFile: 'Ganesh_Patel_Resume.pdf' },
  { id: 'JS026', firstName: 'Asha', lastName: 'Bhosle', phone: '+91-9876543235', email: 'asha.bhosle@email.com', dob: '1996-07-28', location: 'Aurangabad', state: 'Maharashtra', gender: 'Female', qualification: 'B.Sc Nursing', skills: ['Nursing', 'ICU', 'Emergency Care', 'Patient Counseling'], previousCompany: 'Aurangabad General Hospital', totalExperience: '5', willingToRelocate: true, preferredLocations: ['Pune', 'Mumbai', 'Hyderabad'], expectedSalary: '26000', preferredJobType: 'Full-time', status: 'New', createdAt: '2024-03-13', resumeFile: 'Asha_Bhosle_Resume.pdf' },
  { id: 'JS027', firstName: 'Dinesh', lastName: 'Yadav', phone: '+91-9876543236', email: 'dinesh.yadav@email.com', dob: '1993-04-16', location: 'Gwalior', state: 'Madhya Pradesh', gender: 'Male', qualification: 'BA', skills: ['Sales', 'Field Sales', 'Customer Relationship', 'Team Handling'], previousCompany: 'MP Consumer Goods', totalExperience: '4', willingToRelocate: true, preferredLocations: ['Indore', 'Bhopal', 'Delhi'], expectedSalary: '19000', preferredJobType: 'Full-time', status: 'New', createdAt: '2024-03-15' },
  { id: 'JS028', firstName: 'Usha', lastName: 'Devi', phone: '+91-9876543237', email: 'usha.devi@email.com', dob: '1999-12-01', location: 'Shimla', state: 'Himachal Pradesh', gender: 'Female', qualification: 'B.Ed', skills: ['Teaching', 'English', 'Mathematics', 'Classroom Management'], previousCompany: 'Himachal Govt School', totalExperience: '2', willingToRelocate: true, preferredLocations: ['Delhi', 'Chandigarh', 'Dehradun'], expectedSalary: '20000', preferredJobType: 'Full-time', status: 'Contacted', createdAt: '2024-03-17' },
  { id: 'JS029', firstName: 'Balaji', lastName: 'Rao', phone: '+91-9876543238', email: 'balaji.rao@email.com', dob: '1991-08-20', location: 'Tirupati', state: 'Andhra Pradesh', gender: 'Male', qualification: 'Diploma Electrical', skills: ['Electrical Wiring', 'Transformer Maintenance', 'Safety', 'Troubleshooting'], previousCompany: 'AP Power Distribution', totalExperience: '6', willingToRelocate: true, preferredLocations: ['Hyderabad', 'Chennai', 'Bangalore'], expectedSalary: '24000', preferredJobType: 'Full-time', status: 'New', createdAt: '2024-03-19' },
  { id: 'JS030', firstName: 'Kamla', lastName: 'Sharma', phone: '+91-9876543239', email: 'kamla.sharma@email.com', dob: '1995-03-07', location: 'Jabalpur', state: 'Madhya Pradesh', gender: 'Female', qualification: 'MBA', skills: ['HR', 'Payroll', 'Compliance', 'Employee Relations'], previousCompany: 'Jabalpur Industries', totalExperience: '4', willingToRelocate: true, preferredLocations: ['Mumbai', 'Pune', 'Bangalore'], expectedSalary: '30000', preferredJobType: 'Full-time', status: 'New', createdAt: '2024-03-21', resumeFile: 'Kamla_Sharma_CV.pdf' },
];

const mockEmployers: Employer[] = [
  { id: 'EM001', companyName: 'Bharat Manufacturing Co.', industry: 'Manufacturing', companySize: '50-200', yearEstablished: '2010', website: 'bharatmfg.com', address: 'Plot 45, Industrial Area', city: 'Pune', state: 'Maharashtra', contactName: 'Sanjay Mehta', contactEmail: 'sanjay@bharatmfg.com', contactPhone: '+91-9812345001', gstNumber: '27AABCB1234F1Z5', createdAt: '2024-01-10', verified: true, referralCode: 'EM001-REF' },
  { id: 'EM002', companyName: 'Greenfield Agro Pvt Ltd', industry: 'Agriculture', companySize: '20-50', yearEstablished: '2015', website: 'greenfieldagro.in', address: '56, Agri Park', city: 'Nashik', state: 'Maharashtra', contactName: 'Anita Deshmukh', contactEmail: 'anita@greenfieldagro.in', contactPhone: '+91-9812345002', gstNumber: '', createdAt: '2024-01-12', verified: true, referralCode: 'EM002-REF' },
  { id: 'EM003', companyName: 'TechRural Solutions', industry: 'IT Services', companySize: '10-20', yearEstablished: '2018', website: 'techrural.com', address: '12, Tech Hub', city: 'Jaipur', state: 'Rajasthan', contactName: 'Rohit Agarwal', contactEmail: 'rohit@techrural.com', contactPhone: '+91-9812345003', gstNumber: '08AABCT5678G1Z3', createdAt: '2024-01-15', verified: true, referralCode: 'EM003-REF' },
  { id: 'EM004', companyName: 'Metro Hospital Group', industry: 'Healthcare', companySize: '200-500', yearEstablished: '2005', website: 'metrohospital.org', address: '78, Health City', city: 'Hyderabad', state: 'Telangana', contactName: 'Dr. K. Rao', contactEmail: 'krao@metrohospital.org', contactPhone: '+91-9812345004', gstNumber: '36AABCM9012H1Z7', createdAt: '2024-01-18', verified: true, referralCode: 'EM004-REF' },
  { id: 'EM005', companyName: 'QuickDel Logistics', industry: 'Logistics', companySize: '50-200', yearEstablished: '2012', website: 'quickdel.in', address: '23, Transport Nagar', city: 'Delhi', state: 'Delhi', contactName: 'Manish Gupta', contactEmail: 'manish@quickdel.in', contactPhone: '+91-9812345005', gstNumber: '07AABCQ3456K1Z9', createdAt: '2024-01-22', verified: true, referralCode: 'EM005-REF' },
  { id: 'EM006', companyName: 'Sunrise Construction', industry: 'Construction', companySize: '100-500', yearEstablished: '2008', website: 'sunrisecon.com', address: '45, Builder Colony', city: 'Bangalore', state: 'Karnataka', contactName: 'Venkat Reddy', contactEmail: 'venkat@sunrisecon.com', contactPhone: '+91-9812345006', gstNumber: '29AABCS7890L1Z1', createdAt: '2024-02-01', verified: true, referralCode: 'EM006-REF' },
  { id: 'EM007', companyName: 'Apex Pharma Industries', industry: 'Healthcare', companySize: '50-200', yearEstablished: '2011', website: 'apexpharma.co.in', address: '89, Pharma Zone', city: 'Hyderabad', state: 'Telangana', contactName: 'Dr. Sandhya Nair', contactEmail: 'sandhya@apexpharma.co.in', contactPhone: '+91-9812345007', gstNumber: '36AABCA4567B1Z4', createdAt: '2024-02-05', verified: true, referralCode: 'EM007-REF' },
  { id: 'EM008', companyName: 'Northern Steel Works', industry: 'Manufacturing', companySize: '200-500', yearEstablished: '2003', website: 'northernsteel.in', address: '12, Industrial Estate', city: 'Manesar', state: 'Haryana', contactName: 'Kapil Sharma', contactEmail: 'kapil@northernsteel.in', contactPhone: '+91-9812345008', gstNumber: '06AABCN8901C1Z8', createdAt: '2024-02-08', verified: true, referralCode: 'EM008-REF' },
  { id: 'EM009', companyName: 'FreshBasket Agro', industry: 'Agriculture', companySize: '20-50', yearEstablished: '2019', website: 'freshbasket.in', address: '34, Farm Hub', city: 'Nashik', state: 'Maharashtra', contactName: 'Prashant Kulkarni', contactEmail: 'prashant@freshbasket.in', contactPhone: '+91-9812345009', gstNumber: '', createdAt: '2024-02-12', verified: true, referralCode: 'EM009-REF' },
  { id: 'EM010', companyName: 'CareWell Hospitals', industry: 'Healthcare', companySize: '100-500', yearEstablished: '2007', website: 'carewellhospitals.com', address: '55, Medical District', city: 'Chennai', state: 'Tamil Nadu', contactName: 'Dr. Revathi Subramaniam', contactEmail: 'revathi@carewellhospitals.com', contactPhone: '+91-9812345010', gstNumber: '33AABCC2345D1Z2', createdAt: '2024-02-15', verified: true, referralCode: 'EM010-REF' },
];

const mockJobPostings: JobPosting[] = [
  {
    id: 'JP001', employerId: 'EM001', companyName: 'Bharat Manufacturing Co.', jobTitle: 'Machine Operator', numberOfOpenings: 5, city: 'Pune', state: 'Maharashtra', salaryMin: '18000', salaryMax: '22000', employmentType: 'Full-time', qualificationRequired: 'ITI', experienceRequired: '2-5 years', skillsRequired: ['Machine Operation', 'Quality Check', 'CNC', 'Maintenance'], jobDescription: 'Operate and maintain CNC machines in a modern manufacturing facility. Ensure strict quality control and safety compliance during daily production shifts.', benefits: 'PF, ESI, Free Accommodation, Meals, Annual Bonus', joiningTimeline: 'Immediate', accommodationProvided: true, transportationProvided: true, additionalNotes: 'Rotational shifts', status: 'Open', createdAt: '2024-01-15', applicants: ['JS003', 'JS009', 'JS021', 'JS025'], isVerified: true, approvedBy: 'SA001', approvedAt: '2024-01-15', deadline: '2024-04-15',
    responsibilities: ['Operate CNC turning and milling machinery according to specifications.', 'Inspect finished components using precision measuring instruments (micrometers, calipers).', 'Perform routine preventive maintenance on assigned machinery.', 'Maintain daily production logs and report any machinery malfunction immediately.'],
    requirements: ['ITI certification in Fitter/Turner/Machinist trade.', 'Minimum 2 years hands-on experience operating CNC machinery.', 'Ability to read technical engineering drawings.', 'Strong physical stamina and willingness to work rotational shifts.'],
    workingHours: '8 Hours Shift (6 days/week)', recruiterName: 'Sanjay Mehta', recruiterEmail: 'sanjay@bharatmfg.com', recruiterPhone: '+91-9812345001'
  },
  {
    id: 'JP002', employerId: 'EM002', companyName: 'Greenfield Agro Pvt Ltd', jobTitle: 'Field Supervisor', numberOfOpenings: 3, city: 'Nashik', state: 'Maharashtra', salaryMin: '15000', salaryMax: '20000', employmentType: 'Full-time', qualificationRequired: 'B.Sc Agriculture', experienceRequired: '1-3 years', skillsRequired: ['Agriculture', 'Team Management', 'Crop Management', 'Irrigation'], jobDescription: 'Supervise field agricultural operations, manage farm workforce, monitor crop health and manage drip irrigation systems across 100+ acres.', benefits: 'Housing Provided, Medical Insurance, Travel Allowance', joiningTimeline: '1 month', accommodationProvided: true, transportationProvided: false, additionalNotes: '', status: 'Open', createdAt: '2024-01-18', applicants: ['JS018'], isVerified: true, deadline: '2024-04-20',
    responsibilities: ['Oversee daily farm activities including sowing, harvesting, and pest control.', 'Supervise 20+ farm workers and assign daily tasks.', 'Monitor soil moisture and operate automated drip irrigation systems.', 'Record crop growth data and yield reports.'],
    requirements: ['B.Sc in Agriculture or Horticulture.', '1 to 3 years experience in commercial farming or estate supervision.', 'Good local language skills (Marathi/Hindi).', 'Basic knowledge of fertilizer and pesticide management.'],
    workingHours: '7:00 AM - 4:00 PM (6 days/week)', recruiterName: 'Anita Deshmukh', recruiterEmail: 'anita@greenfieldagro.in', recruiterPhone: '+91-9812345002'
  },
  {
    id: 'JP003', employerId: 'EM003', companyName: 'TechRural Solutions', jobTitle: 'Data Entry Operator', numberOfOpenings: 10, city: 'Jaipur', state: 'Rajasthan', salaryMin: '12000', salaryMax: '16000', employmentType: 'Full-time', qualificationRequired: '12th Pass', experienceRequired: '0-2 years', skillsRequired: ['Data Entry', 'MS Office', 'Typing', 'Excel'], jobDescription: 'Accurately enter and verify customer data in digitized CRM databases. Maintain confidential records and generate daily output reports.', benefits: 'PF, Annual Performance Bonus, Tea/Coffee Snacks', joiningTimeline: 'Immediate', accommodationProvided: false, transportationProvided: false, additionalNotes: 'Freshers welcome.', status: 'Open', createdAt: '2024-01-22', applicants: ['JS001', 'JS024', 'JS006'], isVerified: true, deadline: '2024-04-10',
    responsibilities: ['Input alphanumeric data from paper forms into online database systems.', 'Verify accuracy of entered data against source documents.', 'Maintain digital filing systems and perform data backups.', 'Reach daily throughput quota of 300+ entries with 98%+ accuracy.'],
    requirements: ['12th Pass or Bachelor Graduate.', 'Minimum typing speed of 30+ WPM with high accuracy.', 'Working knowledge of MS Excel and basic internet browsing.', 'Good attention to detail.'],
    workingHours: '9:30 AM - 6:00 PM (Monday to Saturday)', recruiterName: 'Rohit Agarwal', recruiterEmail: 'rohit@techrural.com', recruiterPhone: '+91-9812345003'
  },
  {
    id: 'JP004', employerId: 'EM004', companyName: 'Metro Hospital Group', jobTitle: 'Staff Nurse', numberOfOpenings: 8, city: 'Hyderabad', state: 'Telangana', salaryMin: '20000', salaryMax: '28000', employmentType: 'Full-time', qualificationRequired: 'B.Sc Nursing', experienceRequired: '2-5 years', skillsRequired: ['Nursing', 'Patient Care', 'ICU', 'Emergency Care'], jobDescription: 'Provide high-quality clinical patient care in ward and ICU units. Assist senior physicians during rounds, administer medications, and maintain patient care plans.', benefits: 'PF, ESI, Free Hostel Accommodation, Subsidized Meals, Health Insurance', joiningTimeline: '2 weeks', accommodationProvided: true, transportationProvided: true, additionalNotes: 'Night shift allowance of ₹2,500/month extra.', status: 'Open', createdAt: '2024-01-25', applicants: ['JS002', 'JS012', 'JS026'], isVerified: true, deadline: '2024-04-30',
    responsibilities: ['Monitor vital signs and record observations in digital health records.', 'Administer IV fluids, oral medications, and injections as prescribed.', 'Provide compassionate bedside nursing care to ICU and ward patients.', 'Prepare patient charts and coordinate shift handover duties.'],
    requirements: ['B.Sc Nursing or GNM diploma with State Nursing Council Registration.', 'Minimum 2 years clinical bedside nursing experience.', 'Knowledge of ICU equipment and emergency triage protocol.', 'Compassionate attitude and strong team ethics.'],
    workingHours: 'Rotational 8-Hour Shifts', recruiterName: 'Dr. K. Rao', recruiterEmail: 'krao@metrohospital.org', recruiterPhone: '+91-9812345004'
  },
  {
    id: 'JP005', employerId: 'EM005', companyName: 'QuickDel Logistics', jobTitle: 'Delivery Executive', numberOfOpenings: 20, city: 'Delhi', state: 'Delhi', salaryMin: '14000', salaryMax: '18000', employmentType: 'Full-time', qualificationRequired: '10th Pass', experienceRequired: '0-2 years', skillsRequired: ['Driving', 'Navigation', 'Customer Service'], jobDescription: 'Deliver e-commerce parcels to residential and commercial addresses across Delhi NCR using mobile navigation app. Flexible shift timing and attractive per-parcel incentives.', benefits: 'Fuel Allowance, Per-Parcel Incentive (₹15/parcel), Accidental Insurance', joiningTimeline: 'Immediate', accommodationProvided: false, transportationProvided: false, additionalNotes: 'Must own a two-wheeler and valid driving license.', status: 'Pending', createdAt: '2024-01-28', applicants: ['JS007', 'JS017'], isVerified: false, deadline: '2024-04-18',
    responsibilities: ['Load parcels from dispatch hub into delivery bag.', 'Navigate assigned delivery route using mobile app GPS.', 'Deliver packages safely to customers and collect digital signatures/COD payments.', 'Maintain polite and professional demeanor with customers.'],
    requirements: ['10th pass qualification.', 'Valid Indian driving license and active smartphone.', 'Own two-wheeler with valid registration & insurance.', 'Punctual and energetic attitude.'],
    workingHours: '9:00 AM - 6:00 PM (6 days/week)', recruiterName: 'Manish Gupta', recruiterEmail: 'manish@quickdel.in', recruiterPhone: '+91-9812345005'
  },
  {
    id: 'JP006', employerId: 'EM006', companyName: 'Sunrise Construction', jobTitle: 'Site Supervisor', numberOfOpenings: 2, city: 'Bangalore', state: 'Karnataka', salaryMin: '22000', salaryMax: '30000', employmentType: 'Full-time', qualificationRequired: 'Diploma Civil', experienceRequired: '5-8 years', skillsRequired: ['Construction', 'Site Management', 'Safety', 'AutoCAD'], jobDescription: 'Supervise residential building construction sites. Coordinate with contractors, inspect materials, enforce safety standards, and track project timelines.', benefits: 'PF, Site Accommodation, Health Insurance, Annual Leave Bonus', joiningTimeline: '1 month', accommodationProvided: true, transportationProvided: true, additionalNotes: 'Free accommodation near construction site.', status: 'Open', createdAt: '2024-02-02', applicants: ['JS019'], isVerified: true, deadline: '2024-05-01',
    responsibilities: ['Supervise sub-contractors and site labor workforce on daily activities.', 'Inspect quality of incoming construction materials (cement, steel, sand).', 'Ensure strict safety rule compliance (helmets, harness, boots).', 'Verify measurements against structural blueprints.'],
    requirements: ['Diploma or B.Tech in Civil Engineering.', '5+ years experience in multi-story residential building construction.', 'Ability to understand CAD drawings and structural steel details.', 'Strong leadership and communication skills.'],
    workingHours: '8:30 AM - 5:30 PM (6 days/week)', recruiterName: 'Venkat Reddy', recruiterEmail: 'venkat@sunrisecon.com', recruiterPhone: '+91-9812345006'
  },
  {
    id: 'JP007', employerId: 'EM001', companyName: 'Bharat Manufacturing Co.', jobTitle: 'Quality Inspector', numberOfOpenings: 2, city: 'Pune', state: 'Maharashtra', salaryMin: '20000', salaryMax: '26000', employmentType: 'Full-time', qualificationRequired: 'B.Sc', experienceRequired: '3-5 years', skillsRequired: ['Quality Control', 'Inspection', 'ISO Standards', 'Precision Tools'], jobDescription: 'Inspect manufactured metal components against engineering tolerances. Maintain ISO audit documentation and calibration records.', benefits: 'PF, ESI, Production Incentives, Transportation', joiningTimeline: '2 weeks', accommodationProvided: false, transportationProvided: true, additionalNotes: 'Bus facility available from major city hubs.', status: 'Open', createdAt: '2024-02-05', applicants: ['JS009'], isVerified: true, deadline: '2024-04-25',
    responsibilities: ['Conduct first-piece and final inspection of machined parts.', 'Use Vernier calipers, micrometers, and height gauges.', 'Maintain Non-Conformance Reports (NCR) and ISO 9001 quality logs.', 'Coordinate with production team to resolve defect trends.'],
    requirements: ['B.Sc in Chemistry/Physics or Diploma in Mechanical.', '3+ years experience in manufacturing quality control.', 'Hands-on experience with precision measuring tools.', 'Knowledge of ISO 9001 audit standards.'],
    workingHours: 'General Day Shift (9:00 AM - 5:30 PM)', recruiterName: 'Sanjay Mehta', recruiterEmail: 'sanjay@bharatmfg.com', recruiterPhone: '+91-9812345001'
  },
  {
    id: 'JP008', employerId: 'EM003', companyName: 'TechRural Solutions', jobTitle: 'Junior Developer', numberOfOpenings: 3, city: 'Jaipur', state: 'Rajasthan', salaryMin: '15000', salaryMax: '22000', employmentType: 'Full-time', qualificationRequired: 'B.Tech/BCA', experienceRequired: '0-1 years', skillsRequired: ['Python', 'JavaScript', 'SQL', 'HTML'], jobDescription: 'Assist in building web applications and API endpoints. Write modular code, participate in daily standups, and resolve user bug tickets.', benefits: 'PF, Learning Stipend, Flexible Work Culture, Laptop Provided', joiningTimeline: '1 month', accommodationProvided: false, transportationProvided: false, additionalNotes: 'Hybrid work model available.', status: 'Open', createdAt: '2024-02-08', applicants: ['JS006', 'JS016'], isVerified: true, deadline: '2024-04-30',
    responsibilities: ['Develop clean Python/JavaScript backend services.', 'Create responsive web interface pages with HTML/CSS.', 'Write SQL queries to store and fetch relational database records.', 'Fix software bugs reported by QA testers.'],
    requirements: ['B.Tech Computer Science, BCA, or B.Sc IT.', 'Freshers with strong coding fundamentals or bootcamp projects welcome.', 'Basic knowledge of Python, JavaScript, and relational databases.', 'Good logical problem solving skills.'],
    workingHours: '9:30 AM - 6:30 PM (Mon-Fri)', recruiterName: 'Rohit Agarwal', recruiterEmail: 'rohit@techrural.com', recruiterPhone: '+91-9812345003'
  },
  {
    id: 'JP009', employerId: 'EM007', companyName: 'Apex Pharma Industries', jobTitle: 'Pharmacy Technician', numberOfOpenings: 4, city: 'Hyderabad', state: 'Telangana', salaryMin: '18000', salaryMax: '24000', employmentType: 'Full-time', qualificationRequired: 'B.Pharm/D.Pharm', experienceRequired: '1-3 years', skillsRequired: ['Pharmacy', 'Drug Dispensing', 'Quality Control', 'Inventory'], jobDescription: 'Dispense pharmaceutical products in manufacturing facility dispensary. Maintain raw material stock logs and ensure cleanroom compliance.', benefits: 'PF, ESI, Free Health Checkup, Uniform & Safety Gear', joiningTimeline: '2 weeks', accommodationProvided: false, transportationProvided: false, additionalNotes: 'State pharmacy council license required.', status: 'Open', createdAt: '2024-02-10', applicants: ['JS012'], isVerified: true, deadline: '2024-04-20',
    responsibilities: ['Dispense pharmaceutical active ingredients per manufacturing batch records.', 'Maintain precise logs of temperature and humidity in storage rooms.', 'Perform monthly inventory audits of medical stocks.', 'Adhere strictly to Good Manufacturing Practices (GMP).'],
    requirements: ['D.Pharm or B.Pharm degree.', 'Active registration with State Pharmacy Council.', '1+ years experience in retail pharmacy or factory dispensary.', 'Knowledge of pharmaceutical storage guidelines.'],
    workingHours: '8:00 AM - 4:30 PM (6 days/week)', recruiterName: 'Dr. Sandhya Nair', recruiterEmail: 'sandhya@apexpharma.co.in', recruiterPhone: '+91-9812345007'
  },
  {
    id: 'JP010', employerId: 'EM008', companyName: 'Northern Steel Works', jobTitle: 'Welder', numberOfOpenings: 6, city: 'Manesar', state: 'Haryana', salaryMin: '20000', salaryMax: '28000', employmentType: 'Full-time', qualificationRequired: 'ITI Welder', experienceRequired: '3-8 years', skillsRequired: ['Welding', 'Fabrication', 'Blueprint Reading', 'Safety'], jobDescription: 'Perform heavy MIG and TIG welding on structural steel girders and industrial frames. Work with engineering blueprints in a safety-first plant.', benefits: 'PF, ESI, Free Factory Accommodation, Bus Facility, Safety Allowance', joiningTimeline: 'Immediate', accommodationProvided: true, transportationProvided: true, additionalNotes: 'Overtime paid at 1.5x hourly rate.', status: 'Open', createdAt: '2024-02-13', applicants: ['JS005', 'JS015', 'JS023'], isVerified: true, deadline: '2024-04-18',
    responsibilities: ['Execute high-grade MIG/TIG welds on carbon and alloy steel.', 'Clean and inspect weld joints using dye penetrant testing.', 'Read structural fabrication drawings and welding symbols.', 'Maintain welding torches, gas regulators, and protective gear.'],
    requirements: ['ITI certificate in Welder trade.', '3+ years experience in heavy industrial structural welding.', 'Skill in multi-pass welding in all positions (1G to 4G).', 'Strict commitment to safety standards.'],
    workingHours: '8-Hour Shift (Day/Night Rotational)', recruiterName: 'Kapil Sharma', recruiterEmail: 'kapil@northernsteel.in', recruiterPhone: '+91-9812345008'
  },
  {
    id: 'JP011', employerId: 'EM009', companyName: 'FreshBasket Agro', jobTitle: 'Agriculture Officer', numberOfOpenings: 2, city: 'Nashik', state: 'Maharashtra', salaryMin: '16000', salaryMax: '22000', employmentType: 'Full-time', qualificationRequired: 'B.Sc Agriculture', experienceRequired: '2-4 years', skillsRequired: ['Agriculture', 'Soil Testing', 'Irrigation', 'Crop Management'], jobDescription: 'Provide technical advice to contract farmers on vegetable crop protection, organic pest management, and post-harvest handling.', benefits: 'Housing Stipend, Travel Reimbursement, Crop Bonus', joiningTimeline: '1 month', accommodationProvided: true, transportationProvided: false, additionalNotes: 'Field visits required across Nashik district.', status: 'Open', createdAt: '2024-02-16', applicants: ['JS018'], isVerified: true, deadline: '2024-05-10',
    responsibilities: ['Visit partner farm clusters to evaluate soil nutrient levels and crop health.', 'Recommend appropriate organic fertilizers and biocontrol agents.', 'Train farmers on modern drip fertigation techniques.', 'Coordinate crop collection schedule for distribution centers.'],
    requirements: ['B.Sc in Agriculture or Agronomy.', '2+ years experience in crop field extension services.', 'Fluent in Marathi and Hindi.', 'Willingness to travel locally on two-wheeler.'],
    workingHours: '8:00 AM - 5:00 PM (Mon-Sat)', recruiterName: 'Prashant Kulkarni', recruiterEmail: 'prashant@freshbasket.in', recruiterPhone: '+91-9812345009'
  },
  {
    id: 'JP012', employerId: 'EM010', companyName: 'CareWell Hospitals', jobTitle: 'ANM / GNM Nurse', numberOfOpenings: 10, city: 'Chennai', state: 'Tamil Nadu', salaryMin: '15000', salaryMax: '20000', employmentType: 'Full-time', qualificationRequired: 'ANM/GNM', experienceRequired: '1-3 years', skillsRequired: ['Nursing', 'Patient Care', 'Vaccination', 'First Aid'], jobDescription: 'Assist staff doctors in outpatient clinics and general wards. Conduct vaccination clinics, check patient vitals, and assist in dressing wounds.', benefits: 'PF, ESI, Free Hostel Facility, Duty Meals', joiningTimeline: 'Immediate', accommodationProvided: true, transportationProvided: false, additionalNotes: 'Free hostel accommodation on hospital campus.', status: 'Open', createdAt: '2024-02-19', applicants: ['JS022'], isVerified: true, deadline: '2024-04-22',
    responsibilities: ['Administer routine immunizations and vaccinations.', 'Record temperature, blood pressure, pulse, and weight of patients.', 'Assist doctors during clinical physical examinations.', 'Maintain sterilization of medical instruments in OPD rooms.'],
    requirements: ['ANM or GNM nursing diploma from recognized institute.', '1+ year experience in clinic or nursing home setup.', 'Basic understanding of patient triage.', 'Kind, cheerful, and patient-focused disposition.'],
    workingHours: 'Rotational 8-Hour Shift (6 days/week)', recruiterName: 'Dr. Revathi Subramaniam', recruiterEmail: 'revathi@carewellhospitals.com', recruiterPhone: '+91-9812345010'
  },
  {
    id: 'JP013', employerId: 'EM001', companyName: 'Bharat Manufacturing Co.', jobTitle: 'Accountant', numberOfOpenings: 2, city: 'Pune', state: 'Maharashtra', salaryMin: '18000', salaryMax: '24000', employmentType: 'Full-time', qualificationRequired: 'B.Com', experienceRequired: '2-4 years', skillsRequired: ['Accounting', 'Tally', 'Excel', 'GST Filing'], jobDescription: 'Manage plant accounts, record daily purchase and sales invoices in Tally Prime, compute GST monthly returns, and process vendor payments.', benefits: 'PF, ESI, Gratuity, Transport Facility', joiningTimeline: '2 weeks', accommodationProvided: false, transportationProvided: true, additionalNotes: 'Knowledge of Tally Prime essential.', status: 'Open', createdAt: '2024-02-22', applicants: ['JS001', 'JS020'], isVerified: true, deadline: '2024-04-28',
    responsibilities: ['Record daily accounting entries in Tally Prime software.', 'Prepare monthly bank reconciliation statements (BRS).', 'Verify vendor bills and file GST & TDS monthly returns.', 'Maintain petty cash and audit vouchers.'],
    requirements: ['B.Com or M.Com degree.', '2+ years practical accounting experience in commercial unit.', 'Expert command of Tally Prime and MS Excel.', 'Knowledge of GST and TDS compliance.'],
    workingHours: '9:30 AM - 6:00 PM (Monday to Saturday)', recruiterName: 'Sanjay Mehta', recruiterEmail: 'sanjay@bharatmfg.com', recruiterPhone: '+91-9812345001'
  },
  {
    id: 'JP014', employerId: 'EM005', companyName: 'QuickDel Logistics', jobTitle: 'HR Executive', numberOfOpenings: 2, city: 'Delhi', state: 'Delhi', salaryMin: '22000', salaryMax: '28000', employmentType: 'Full-time', qualificationRequired: 'MBA / BBA', experienceRequired: '2-5 years', skillsRequired: ['HR', 'Recruitment', 'Payroll', 'Compliance'], jobDescription: 'Manage blue-collar worker recruitment drives across Delhi NCR, handle onboarding documentation, coordinate monthly payroll processing, and address staff grievances.', benefits: 'PF, Health Insurance, Mobile Reimbursement, Performance Incentive', joiningTimeline: '1 month', accommodationProvided: false, transportationProvided: false, additionalNotes: 'Experience recruiting delivery/warehouse staff preferred.', status: 'Open', createdAt: '2024-02-25', applicants: ['JS008', 'JS030'], isVerified: true, deadline: '2024-05-05',
    responsibilities: ['Conduct mass hiring drives for delivery executives and warehouse workers.', 'Process joining formalities and background check documentation.', 'Maintain biometric attendance records and assist in payroll calculations.', 'Handle worker welfare and resolve operational grievances.'],
    requirements: ['MBA in HR or BBA graduate.', '2+ years experience in HR operations or talent acquisition.', 'Strong interpersonal and negotiation skills.', 'Proficiency in MS Office and HRIS software.'],
    workingHours: '9:00 AM - 6:00 PM (Mon-Sat)', recruiterName: 'Manish Gupta', recruiterEmail: 'manish@quickdel.in', recruiterPhone: '+91-9812345005'
  },
  {
    id: 'JP015', employerId: 'EM008', companyName: 'Northern Steel Works', jobTitle: 'Electrician', numberOfOpenings: 4, city: 'Manesar', state: 'Haryana', salaryMin: '18000', salaryMax: '25000', employmentType: 'Full-time', qualificationRequired: 'ITI Electrician', experienceRequired: '3-6 years', skillsRequired: ['Electrical Wiring', 'Motor Repair', 'Maintenance', 'Safety'], jobDescription: 'Maintain industrial electrical systems, distribution panels, three-phase electric motors, and overhead crane wiring at steel mill plant.', benefits: 'PF, ESI, Free Factory Hostel, Safety Allowance, Subsidized Canteen', joiningTimeline: 'Immediate', accommodationProvided: true, transportationProvided: true, additionalNotes: 'Wireman license required.', status: 'Open', createdAt: '2024-02-28', applicants: ['JS003', 'JS013', 'JS029'], isVerified: true, deadline: '2024-04-20',
    responsibilities: ['Troubleshoot electrical faults in 3-phase machinery and transformers.', 'Perform routine preventive maintenance of LT/HT power distribution panels.', 'Install new electrical conduits, switches, and lighting fixtures in factory.', 'Enforce lock-out/tag-out (LOTO) safety protocols during repairs.'],
    requirements: ['ITI Electrician or Wireman trade certificate.', 'State Electrical License (A/B Class).', '3+ years experience in heavy industrial plant electrical maintenance.', 'Proficiency in testing with multimeter and megger.'],
    workingHours: 'Rotational 8-Hour Shift (6 days/week)', recruiterName: 'Kapil Sharma', recruiterEmail: 'kapil@northernsteel.in', recruiterPhone: '+91-9812345008'
  },
];

const mockMatches: CandidateMatch[] = [
  { id: 'CM001', candidateId: 'JS001', jobId: 'JP003', candidateName: 'Rajesh Kumar', jobTitle: 'Data Entry Operator', companyName: 'TechRural Solutions', matchScore: 72, status: 'Shortlisted', createdAt: '2024-02-01' },
  { id: 'CM002', candidateId: 'JS002', jobId: 'JP004', candidateName: 'Priya Sharma', jobTitle: 'Staff Nurse', companyName: 'Metro Hospital Group', matchScore: 88, status: 'Interview Scheduled', createdAt: '2024-02-03' },
  { id: 'CM003', candidateId: 'JS003', jobId: 'JP001', candidateName: 'Amit Patel', jobTitle: 'Machine Operator', companyName: 'Bharat Manufacturing Co.', matchScore: 91, status: 'Offered', createdAt: '2024-02-05' },
  { id: 'CM004', candidateId: 'JS005', jobId: 'JP010', candidateName: 'Vikram Singh', jobTitle: 'Welder', companyName: 'Northern Steel Works', matchScore: 65, status: 'Pending', createdAt: '2024-02-07' },
  { id: 'CM005', candidateId: 'JS006', jobId: 'JP008', candidateName: 'Meera Reddy', jobTitle: 'Junior Developer', companyName: 'TechRural Solutions', matchScore: 79, status: 'Shortlisted', createdAt: '2024-02-09' },
  { id: 'CM006', candidateId: 'JS007', jobId: 'JP005', candidateName: 'Ramesh Yadav', jobTitle: 'Delivery Executive', companyName: 'QuickDel Logistics', matchScore: 83, status: 'Interview Scheduled', createdAt: '2024-02-10' },
  { id: 'CM007', candidateId: 'JS009', jobId: 'JP007', candidateName: 'Suresh Naik', jobTitle: 'Quality Inspector', companyName: 'Bharat Manufacturing Co.', matchScore: 70, status: 'Pending', createdAt: '2024-02-12' },
  { id: 'CM008', candidateId: 'JS012', jobId: 'JP009', candidateName: 'Lakshmi Naidu', jobTitle: 'Pharmacy Technician', companyName: 'Apex Pharma Industries', matchScore: 85, status: 'Shortlisted', createdAt: '2024-02-14' },
  { id: 'CM009', candidateId: 'JS015', jobId: 'JP010', candidateName: 'Sanjay Gupta', jobTitle: 'Welder', companyName: 'Northern Steel Works', matchScore: 94, status: 'Hired', createdAt: '2024-02-16' },
  { id: 'CM010', candidateId: 'JS018', jobId: 'JP011', candidateName: 'Nandini Patil', jobTitle: 'Agriculture Officer', companyName: 'FreshBasket Agro', matchScore: 89, status: 'Interview Scheduled', createdAt: '2024-02-18' },
  { id: 'CM011', candidateId: 'JS022', jobId: 'JP012', candidateName: 'Rekha Chauhan', jobTitle: 'ANM / GNM Nurse', companyName: 'CareWell Hospitals', matchScore: 82, status: 'Shortlisted', createdAt: '2024-02-20' },
  { id: 'CM012', candidateId: 'JS026', jobId: 'JP004', candidateName: 'Asha Bhosle', jobTitle: 'Staff Nurse', companyName: 'Metro Hospital Group', matchScore: 92, status: 'Pending', createdAt: '2024-02-22' },
];

const mockCommunications: Communication[] = [
  { id: 'CO001', date: '2024-02-01', type: 'Email', contactType: 'Candidate', contactName: 'Rajesh Kumar', subject: 'Job Opportunity - Data Entry Operator', notes: 'Sent job details for TechRural Solutions.', outcome: 'Interested', agentName: 'Admin' },
  { id: 'CO002', date: '2024-02-02', type: 'Call', contactType: 'Employer', contactName: 'Dr. K. Rao', subject: 'Candidate Shortlist for Nurse Position', notes: 'Discussed 3 shortlisted candidates.', outcome: 'Interview to be scheduled', agentName: 'Admin' },
  { id: 'CO003', date: '2024-02-03', type: 'Email', contactType: 'Candidate', contactName: 'Priya Sharma', subject: 'Interview Scheduled - Metro Hospital', notes: 'Confirmed interview date.', outcome: 'Interview Confirmed', agentName: 'Admin' },
  { id: 'CO004', date: '2024-02-05', type: 'Call', contactType: 'Candidate', contactName: 'Amit Patel', subject: 'Offer Discussion - Machine Operator', notes: 'Candidate accepted verbally.', outcome: 'Offer Accepted', agentName: 'Admin' },
  { id: 'CO005', date: '2024-02-06', type: 'Email', contactType: 'Employer', contactName: 'Sanjay Mehta', subject: 'Candidate Acceptance - Amit Patel', notes: 'Requested offer letter.', outcome: 'Offer letter pending', agentName: 'Admin' },
  { id: 'CO006', date: '2024-02-08', type: 'SMS', contactType: 'Candidate', contactName: 'Meera Reddy', subject: 'Shortlist Notification', notes: 'SMS sent about shortlisting.', outcome: 'Acknowledged', agentName: 'Admin' },
  { id: 'CO007', date: '2024-02-10', type: 'Call', contactType: 'Candidate', contactName: 'Ramesh Yadav', subject: 'Interview Prep', notes: 'Prepped candidate for interview.', outcome: 'Candidate ready', agentName: 'Admin' },
  { id: 'CO008', date: '2024-02-16', type: 'Call', contactType: 'Candidate', contactName: 'Sanjay Gupta', subject: 'Offer for Welder Position', notes: '₹26,000/month + accommodation.', outcome: 'Offer Accepted', agentName: 'Admin' },
];

const mockPlacements: Placement[] = [
  { id: 'PL001', candidateId: 'JS004', candidateName: 'Sunita Devi', jobId: 'JP003', jobTitle: 'Data Entry Operator', employerId: 'EM003', companyName: 'TechRural Solutions', placementDate: '2024-02-01', handoverDate: '2024-02-15', commission: 4000, commissionStatus: 'Paid', status: 'Completed' },
  { id: 'PL002', candidateId: 'JS003', candidateName: 'Amit Patel', jobId: 'JP001', jobTitle: 'Machine Operator', employerId: 'EM001', companyName: 'Bharat Manufacturing Co.', placementDate: '2024-02-10', handoverDate: '2024-03-01', commission: 5000, commissionStatus: 'Unpaid', status: 'Active' },
  { id: 'PL003', candidateId: 'JS021', candidateName: 'Manoj Tiwari', jobId: 'JP001', jobTitle: 'Machine Operator', employerId: 'EM001', companyName: 'Bharat Manufacturing Co.', placementDate: '2024-02-20', handoverDate: '2024-03-05', commission: 4500, commissionStatus: 'Unpaid', status: 'Active' },
  { id: 'PL004', candidateId: 'JS015', candidateName: 'Sanjay Gupta', jobId: 'JP010', jobTitle: 'Welder', employerId: 'EM008', companyName: 'Northern Steel Works', placementDate: '2024-02-25', handoverDate: '2024-03-10', commission: 5000, commissionStatus: 'Partial', status: 'Active' },
];

// ─── Storage Keys for Real Data Persistence ─────────────────
const KEY_JOB_SEEKERS = 'rojgaarhai_real_job_seekers';
const KEY_EMPLOYERS = 'rojgaarhai_real_employers';
const KEY_JOB_POSTINGS = 'rojgaarhai_real_job_postings';
const KEY_MATCHES = 'rojgaarhai_real_matches';
const KEY_COMMUNICATIONS = 'rojgaarhai_real_communications';
const KEY_PLACEMENTS = 'rojgaarhai_real_placements';
const KEY_JOB_OVERRIDES = 'rojgaarhai_job_overrides';

function getStoredArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getStoredObject<T>(key: string): Record<string, T> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredArray<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

// ─── Context ──────────────────────────────────────────────────

interface DataContextType {
  jobSeekers: JobSeeker[];
  employers: Employer[];
  jobPostings: JobPosting[];
  matches: CandidateMatch[];
  communications: Communication[];
  placements: Placement[];
  addJobSeeker: (seeker: JobSeeker) => void;
  addEmployer: (employer: Employer) => void;
  addJobPosting: (job: JobPosting) => void;
  addMatch: (match: CandidateMatch) => void;
  addCommunication: (comm: Communication) => void;
  addPlacement: (placement: Placement) => void;
  updateMatchStatus: (id: string, status: CandidateMatch['status']) => void;
  updatePlacement: (id: string, updates: Partial<Placement>) => void;
  updateJobPosting: (id: string, updates: Partial<JobPosting>) => void;
  updateJobSeeker: (id: string, updates: Partial<JobSeeker>) => void;
  hireCandidate: (candidateId: string, jobId: string) => void;
  applyToJob: (jobId: string, candidateId: string) => void;
  isAdminLoggedIn: boolean;
  adminLogin: (email: string, password: string) => boolean;
  adminLogout: () => void;
  isCandidateLoggedIn: boolean;
  loggedCandidate: JobSeeker | null;
  candidateLogin: (email: string) => boolean;
  candidateLogout: () => void;
  isEmployerLoggedIn: boolean;
  loggedEmployer: Employer | null;
  employerLogin: (email: string) => boolean;
  employerLogout: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  // Initialize states with Combined Mock Data + Persistent Real Data
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>(() => {
    const real = getStoredArray<JobSeeker>(KEY_JOB_SEEKERS);
    const map = new Map<string, JobSeeker>();
    mockJobSeekers.forEach(s => map.set(s.id, s));
    real.forEach(s => map.set(s.id, s));
    return Array.from(map.values());
  });

  const [employers, setEmployers] = useState<Employer[]>(() => {
    const real = getStoredArray<Employer>(KEY_EMPLOYERS);
    const map = new Map<string, Employer>();
    mockEmployers.forEach(e => map.set(e.id, e));
    real.forEach(e => map.set(e.id, e));
    return Array.from(map.values());
  });

  const [jobPostings, setJobPostings] = useState<JobPosting[]>(() => {
    const real = getStoredArray<JobPosting>(KEY_JOB_POSTINGS);
    const overrides = getStoredObject<JobPosting>(KEY_JOB_OVERRIDES);
    const map = new Map<string, JobPosting>();

    mockJobPostings.forEach(j => {
      const override = overrides[j.id];
      map.set(j.id, override ? { ...j, ...override } : j);
    });
    real.forEach(j => map.set(j.id, j));
    return Array.from(map.values());
  });

  const [matches, setMatches] = useState<CandidateMatch[]>(() => {
    const real = getStoredArray<CandidateMatch>(KEY_MATCHES);
    const map = new Map<string, CandidateMatch>();
    mockMatches.forEach(m => map.set(m.id, m));
    real.forEach(m => map.set(m.id, m));
    return Array.from(map.values());
  });

  const [communications, setCommunications] = useState<Communication[]>(() => {
    const real = getStoredArray<Communication>(KEY_COMMUNICATIONS);
    const map = new Map<string, Communication>();
    mockCommunications.forEach(c => map.set(c.id, c));
    real.forEach(c => map.set(c.id, c));
    return Array.from(map.values());
  });

  const [placements, setPlacements] = useState<Placement[]>(() => {
    const real = getStoredArray<Placement>(KEY_PLACEMENTS);
    const map = new Map<string, Placement>();
    mockPlacements.forEach(p => map.set(p.id, p));
    real.forEach(p => map.set(p.id, p));
    return Array.from(map.values());
  });

  // Login Session Persistence
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('rojgaarhai_admin_logged_in') === 'true';
  });

  const [isCandidateLoggedIn, setIsCandidateLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem('rojgaarhai_logged_candidate_id'));
  });

  const [loggedCandidate, setLoggedCandidate] = useState<JobSeeker | null>(() => {
    const storedId = localStorage.getItem('rojgaarhai_logged_candidate_id');
    if (!storedId) return null;
    const real = getStoredArray<JobSeeker>(KEY_JOB_SEEKERS);
    const foundReal = real.find(s => s.id === storedId);
    if (foundReal) return foundReal;
    return mockJobSeekers.find(s => s.id === storedId) || null;
  });

  const [isEmployerLoggedIn, setIsEmployerLoggedIn] = useState(() => {
    return Boolean(localStorage.getItem('rojgaarhai_logged_employer_id'));
  });

  const [loggedEmployer, setLoggedEmployer] = useState<Employer | null>(() => {
    const storedId = localStorage.getItem('rojgaarhai_logged_employer_id');
    if (!storedId) return null;
    const real = getStoredArray<Employer>(KEY_EMPLOYERS);
    const foundReal = real.find(e => e.id === storedId);
    if (foundReal) return foundReal;
    return mockEmployers.find(e => e.id === storedId) || null;
  });

  // Persistent Adding & Updating Functions
  const addJobSeeker = (seeker: JobSeeker) => {
    setJobSeekers(prev => {
      if (prev.some(s => s.id === seeker.id)) return prev;
      return [...prev, seeker];
    });
    const real = getStoredArray<JobSeeker>(KEY_JOB_SEEKERS);
    if (!real.some(s => s.id === seeker.id)) {
      saveStoredArray(KEY_JOB_SEEKERS, [...real, seeker]);
    }
    // Auto-login newly registered candidate
    setIsCandidateLoggedIn(true);
    setLoggedCandidate(seeker);
    localStorage.setItem('rojgaarhai_logged_candidate_id', seeker.id);
  };

  const addEmployer = (employer: Employer) => {
    setEmployers(prev => {
      if (prev.some(e => e.id === employer.id)) return prev;
      return [...prev, employer];
    });
    const real = getStoredArray<Employer>(KEY_EMPLOYERS);
    if (!real.some(e => e.id === employer.id)) {
      saveStoredArray(KEY_EMPLOYERS, [...real, employer]);
    }
    // Auto-login newly registered employer
    setIsEmployerLoggedIn(true);
    setLoggedEmployer(employer);
    localStorage.setItem('rojgaarhai_logged_employer_id', employer.id);
  };

  const addJobPosting = (job: JobPosting) => {
    setJobPostings(prev => {
      if (prev.some(j => j.id === job.id)) return prev;
      return [...prev, job];
    });
    const real = getStoredArray<JobPosting>(KEY_JOB_POSTINGS);
    if (!real.some(j => j.id === job.id)) {
      saveStoredArray(KEY_JOB_POSTINGS, [...real, job]);
    }
  };

  const addMatch = (match: CandidateMatch) => {
    setMatches(prev => {
      if (prev.some(m => m.id === match.id)) return prev;
      return [...prev, match];
    });
    const real = getStoredArray<CandidateMatch>(KEY_MATCHES);
    if (!real.some(m => m.id === match.id)) {
      saveStoredArray(KEY_MATCHES, [...real, match]);
    }
  };

  const addCommunication = (comm: Communication) => {
    setCommunications(prev => {
      if (prev.some(c => c.id === comm.id)) return prev;
      return [...prev, comm];
    });
    const real = getStoredArray<Communication>(KEY_COMMUNICATIONS);
    if (!real.some(c => c.id === comm.id)) {
      saveStoredArray(KEY_COMMUNICATIONS, [...real, comm]);
    }
  };

  const addPlacement = (placement: Placement) => {
    setPlacements(prev => {
      if (prev.some(p => p.id === placement.id)) return prev;
      return [...prev, placement];
    });
    const real = getStoredArray<Placement>(KEY_PLACEMENTS);
    if (!real.some(p => p.id === placement.id)) {
      saveStoredArray(KEY_PLACEMENTS, [...real, placement]);
    }
  };

  const updateMatchStatus = (id: string, status: CandidateMatch['status']) => {
    setMatches(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    const real = getStoredArray<CandidateMatch>(KEY_MATCHES);
    if (real.some(m => m.id === id)) {
      saveStoredArray(KEY_MATCHES, real.map(m => m.id === id ? { ...m, status } : m));
    }
  };

  const updatePlacement = (id: string, updates: Partial<Placement>) => {
    setPlacements(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    const real = getStoredArray<Placement>(KEY_PLACEMENTS);
    if (real.some(p => p.id === id)) {
      saveStoredArray(KEY_PLACEMENTS, real.map(p => p.id === id ? { ...p, ...updates } : p));
    }
  };

  const updateJobPosting = (id: string, updates: Partial<JobPosting>) => {
    setJobPostings(prev => prev.map(j => j.id === id ? { ...j, ...updates } : j));
    const real = getStoredArray<JobPosting>(KEY_JOB_POSTINGS);
    if (real.some(j => j.id === id)) {
      saveStoredArray(KEY_JOB_POSTINGS, real.map(j => j.id === id ? { ...j, ...updates } : j));
    }
  };

  const updateJobSeeker = (id: string, updates: Partial<JobSeeker>) => {
    setJobSeekers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    if (loggedCandidate && loggedCandidate.id === id) {
      setLoggedCandidate(prev => prev ? { ...prev, ...updates } : null);
    }
    const real = getStoredArray<JobSeeker>(KEY_JOB_SEEKERS);
    if (real.some(s => s.id === id)) {
      saveStoredArray(KEY_JOB_SEEKERS, real.map(s => s.id === id ? { ...s, ...updates } : s));
    }
  };

  const applyToJob = (jobId: string, candidateId: string) => {
    setJobPostings(prev => prev.map(j => {
      if (j.id === jobId && !j.applicants.includes(candidateId)) {
        const updated = { ...j, applicants: [...j.applicants, candidateId] };
        const real = getStoredArray<JobPosting>(KEY_JOB_POSTINGS);
        if (real.some(rj => rj.id === jobId)) {
          saveStoredArray(KEY_JOB_POSTINGS, real.map(rj => rj.id === jobId ? updated : rj));
        } else {
          try {
            const overrides = getStoredObject<JobPosting>(KEY_JOB_OVERRIDES);
            overrides[jobId] = updated;
            localStorage.setItem(KEY_JOB_OVERRIDES, JSON.stringify(overrides));
          } catch (e) {
            console.error(e);
          }
        }
        return updated;
      }
      return j;
    }));
  };

  const hireCandidate = (candidateId: string, jobId: string) => {
    const candidate = jobSeekers.find(c => c.id === candidateId);
    const job = jobPostings.find(j => j.id === jobId);
    const employer = employers.find(e => e.id === job?.employerId);
    if (candidate && job && employer) {
      updateJobSeeker(candidateId, { status: 'Placed' });
      setMatches(prev => prev.map(m =>
        m.candidateId === candidateId && m.jobId === jobId ? { ...m, status: 'Hired' as const } : m
      ));
      const placement: Placement = {
        id: `PL${String(Date.now()).slice(-6)}`,
        candidateId,
        candidateName: `${candidate.firstName} ${candidate.lastName}`,
        jobId,
        jobTitle: job.jobTitle,
        employerId: employer.id,
        companyName: employer.companyName,
        placementDate: new Date().toISOString().split('T')[0],
        handoverDate: '',
        commission: 4000,
        commissionStatus: 'Unpaid',
        status: 'Active',
      };
      addPlacement(placement);
      addCommunication({
        id: `CO${String(Date.now()).slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        type: 'Email',
        contactType: 'Candidate',
        contactName: `${candidate.firstName} ${candidate.lastName}`,
        subject: `Hired for ${job.jobTitle} at ${employer.companyName}`,
        notes: `Candidate hired for ${job.jobTitle} position at ${employer.companyName}. Salary: ₹${job.salaryMin}-${job.salaryMax}/month. Placement recorded.`,
        outcome: 'Hired',
        agentName: 'Admin',
      });
    }
  };

  const adminLogin = (email: string, password: string) => {
    if (email === 'admin@rojgaarhai.com' && password === 'admin123') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('rojgaarhai_admin_logged_in', 'true');
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('rojgaarhai_admin_logged_in');
  };

  const candidateLogin = (email: string) => {
    const c = jobSeekers.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (c) {
      setIsCandidateLoggedIn(true);
      setLoggedCandidate(c);
      localStorage.setItem('rojgaarhai_logged_candidate_id', c.id);
      return true;
    }
    return false;
  };

  const candidateLogout = () => {
    setIsCandidateLoggedIn(false);
    setLoggedCandidate(null);
    localStorage.removeItem('rojgaarhai_logged_candidate_id');
  };

  const employerLogin = (email: string) => {
    const e = employers.find(em => em.contactEmail.toLowerCase() === email.toLowerCase());
    if (e) {
      setIsEmployerLoggedIn(true);
      setLoggedEmployer(e);
      localStorage.setItem('rojgaarhai_logged_employer_id', e.id);
      return true;
    }
    return false;
  };

  const employerLogout = () => {
    setIsEmployerLoggedIn(false);
    setLoggedEmployer(null);
    localStorage.removeItem('rojgaarhai_logged_employer_id');
  };

  return (
    <DataContext.Provider value={{
      jobSeekers, employers, jobPostings, matches, communications, placements,
      addJobSeeker, addEmployer, addJobPosting, addMatch, addCommunication, addPlacement,
      updateMatchStatus, updatePlacement, updateJobPosting, updateJobSeeker, hireCandidate, applyToJob,
      isAdminLoggedIn, adminLogin, adminLogout,
      isCandidateLoggedIn, loggedCandidate, candidateLogin, candidateLogout,
      isEmployerLoggedIn, loggedEmployer, employerLogin, employerLogout,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
