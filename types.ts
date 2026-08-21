export enum UserRole {
  APPLICANT = 'Pemohon',
  SECRETARY_1 = 'SETIAUSAHA JK MJPKKM',
  SECRETARY_2 = 'SETIAUSAHA JK INOVASI',
  REVIEWER_1 = 'JK MJPKKM - PENSYARAH',
  REVIEWER_2 = 'JK INOVASI - PENSYARAH PEMBIMBING PELAJAR',
  HOD = 'KETUA JABATAN',
  DIRECTOR = 'TIMBALAN PENGARAH'
}

export enum ApplicationStatus {
  SUBMITTED = 'SUBMITTED',
  SECRETARY_PENDING = 'SECRETARY_PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  SECRETARY_REVIEW = 'SECRETARY_REVIEW',
  HOD_PENDING = 'HOD_PENDING',
  DIRECTOR_PENDING = 'DIRECTOR_PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum ReviewRating {
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  NEEDS_CORRECTIONS = 'Needs Corrections'
}

export interface TeamMember {
  name: string;
  position: string;
  idCard: string;
}

export interface ReviewData {
  reviewerId: string;
  reviewerName?: string;
  comments: string;
  status: ReviewRating;
  date: string;
}

export interface Application {
  id: string;
  // Applicant Info
  applicantName: string;
  applicantIdCard: string;
  applicantEmail: string;
  applicantPhone: string;
  teamName: string;
  teamMembers: TeamMember[];
  
  // Research Info
  researchTitle: string;
  researchLink: string;
  
  // Event Info
  eventName: string;
  eventLocation: string;
  eventDate: string;
  eventEndDate?: string;
  eventLevel: 'State' | 'National' | 'International (Dalam Negara)' | 'International (Luar Negara)' | 'International (Dalam Negeri)' | 'International (Luar Negeri)' | 'International';
  
  // Event Achievement & Award Info
  achievementStatus?: string;
  achievementDetails?: string;
  achievementDate?: string | null;
  
  // Submission Info
  submissionDate: string;
  status: ApplicationStatus;
  targetCommittee?: 'MJPKKM' | 'INOVASI';
  
  // Workflow Progress - Secretary Assignment
  assignedSecretary?: string;
  assignedExaminer?: string;
  secretaryAssignmentNotes?: string;
  secretaryAssignmentDate?: string | null;
  
  // Workflow Progress - Examiner Evaluation
  selectedReviewers: string[]; // List of Reviewer IDs chosen
  reviews: Record<string, ReviewData>; // Keyed by reviewer role name
  
  // Workflow Progress - Secretary Endorsement
  secretaryEndorsementStatus?: 'Endorsed' | 'Returned' | null;
  secretaryEndorsementComments?: string;
  secretaryEndorsementName?: string;
  secretaryEndorsementDate?: string | null;
  
  // Workflow Progress - HOD Approval
  hodStatus: 'Supported' | 'Unsupported' | null;
  hodName: string;
  hodComments: string;
  hodDate: string | null;
  
  // Workflow Progress - Director Final Approval
  directorStatus: 'Approved' | 'Unapproved' | null;
  directorName: string;
  directorComments: string;
  directorDate: string | null;
}

export const REVIEWER_LIST = [
  UserRole.REVIEWER_1,
  UserRole.REVIEWER_2
];

export const SECRETARY_LIST = [
  UserRole.SECRETARY_1,
  UserRole.SECRETARY_2
];

export const getCommitteeName = (app: Partial<Application>): string => {
  if (app.targetCommittee) {
    return app.targetCommittee === 'MJPKKM' ? 'JK MJPKKM' : 'JK INOVASI';
  }
  if (app.selectedReviewers?.some(r => r.includes('INOVASI')) || app.assignedSecretary?.includes('INOVASI')) {
    return 'JK INOVASI';
  }
  return 'JK MJPKKM';
};

export const getExaminerName = (app: Partial<Application>): string | null => {
  if (app.assignedExaminer && app.assignedExaminer.trim() !== '') {
    const val = app.assignedExaminer.trim();
    if (!val.startsWith('Role Reviewer') && !val.startsWith('UserRole')) {
      return val;
    }
  }

  if (app.reviews && Object.keys(app.reviews).length > 0) {
    for (const rev of Object.values(app.reviews)) {
      if (rev?.reviewerName && rev.reviewerName.trim() !== '') {
        const rName = rev.reviewerName.trim();
        if (!rName.startsWith('Role Reviewer') && !rName.startsWith('UserRole')) {
          return rName;
        }
      }
    }
  }

  if (app.assignedExaminer && app.assignedExaminer.trim() !== '') {
    return app.assignedExaminer.trim();
  }

  if (app.selectedReviewers && app.selectedReviewers.length > 0) {
    const first = app.selectedReviewers[0];
    if (first && !first.startsWith('Role Reviewer') && !first.startsWith('UserRole')) {
      return first;
    }
  }

  return null;
};