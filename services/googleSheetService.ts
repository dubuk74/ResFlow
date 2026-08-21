
import { Application, ApplicationStatus, ReviewRating } from '../types';

// IMPORTANT: Replace this with your NEW deployment URL from Google Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzPT_CS87AfALJO02ri6UTsJIR6vg1Z58GU4bLJWp-N4ZIrcbho8Tb4KaHurzU0vTX7/exec'; 

// Ensure phone number starts with '0'
export const formatPhoneWithZero = (phone: any): string => {
  if (!phone) return '-';
  let str = String(phone).trim();
  if (!str || str === '-' || str === 'null' || str === 'undefined') return '-';
  str = str.replace(/^'+/, ''); // remove any leading quote
  if (str.startsWith('+60')) {
    str = '0' + str.slice(3);
  } else if (str.startsWith('60') && str.length > 8) {
    str = '0' + str.slice(2);
  } else if (/^[1-9]/.test(str)) {
    str = '0' + str;
  }
  return str;
};

// Parse human-readable review string from Google Sheet cell if JSON is not present
const parseReviewsText = (text: string): Record<string, any> => {
  if (!text || typeof text !== 'string' || text === 'Belum ada penilaian') return {};
  const reviews: Record<string, any> = {};
  const parts = text.split('|').map(s => s.trim()).filter(Boolean);
  
  parts.forEach((part, index) => {
    const match = part.match(/^(.*?)\s*\((CEMERLANG|BAIK|PENAMBAHBAIKAN|Excellent|Good|Needs Corrections)\):\s*(.*?)(?:\s*\[(.*?)\])?$/i);
    if (match) {
      const reviewerName = match[1].trim();
      const statusRaw = match[2].trim().toUpperCase();
      const comments = match[3].trim();
      const dateStr = match[4] ? match[4].trim() : new Date().toISOString();

      let status = ReviewRating.GOOD;
      if (statusRaw === 'CEMERLANG' || statusRaw === 'EXCELLENT') status = ReviewRating.EXCELLENT;
      else if (statusRaw === 'PENAMBAHBAIKAN' || statusRaw === 'NEEDS CORRECTIONS') status = ReviewRating.NEEDS_CORRECTIONS;

      const key = `rev_${index}_${reviewerName.replace(/[^a-zA-Z0-9]/g, '')}`;
      reviews[key] = {
        reviewerId: key,
        reviewerName,
        comments,
        status,
        date: dateStr
      };
    } else {
      const key = `rev_${index}`;
      reviews[key] = {
        reviewerId: key,
        reviewerName: 'Penilai Dilantik',
        comments: part,
        status: ReviewRating.GOOD,
        date: new Date().toISOString()
      };
    }
  });
  return reviews;
};

// Parse human-readable team members string from Google Sheet cell if JSON is not present
const parseTeamMembersText = (text: string): any[] => {
  if (!text || typeof text !== 'string' || text === 'Tiada ahli tambahan') return [];
  const members: any[] = [];
  const items = text.split(';').map(s => s.trim()).filter(Boolean);
  items.forEach(itemStr => {
    const cleanStr = itemStr.replace(/^\d+\.\s*/, '');
    const idMatch = cleanStr.match(/\((.*?)\)/);
    const idCard = idMatch ? idMatch[1] : '';
    const rest = cleanStr.replace(/\(.*?\)/, '').trim();
    const posParts = rest.split('-').map(s => s.trim());
    const name = posParts[0] || rest;
    const position = posParts[1] || '';
    members.push({ name, idCard, position });
  });
  return members;
};

// Track in-flight and recent saves to prevent duplicate consecutive HTTP requests and multiple emails
const recentSaveSignatures = new Map<string, number>();

export const GoogleSheetService = {
  isEnabled: () => SCRIPT_URL.length > 0 && !SCRIPT_URL.includes('your-actual-url'),

  fetchAll: async (): Promise<Application[]> => {
    if (!SCRIPT_URL || SCRIPT_URL.includes('your-actual-url')) return [];
    try {
      const response = await fetch(`${SCRIPT_URL}?t=${Date.now()}`);
      if (!response.ok) {
        console.warn('Google Sheet Service: URL returned an error.');
        return [];
      }
      const rawData = await response.json();
      if (!Array.isArray(rawData) || rawData.length === 0) return [];

      let items: any[] = [];

      // Check if rawData is a 2D Array: [ [ "Header1", "Header2"... ], [ "Val1", "Val2"... ] ]
      if (Array.isArray(rawData[0])) {
        const firstRow = rawData[0];
        const headers = firstRow.map((h: any) => String(h).trim());
        const rows = rawData.slice(1);
        items = rows.map((row: any[]) => {
          const obj: Record<string, any> = {};
          if (Array.isArray(row)) {
            row.forEach((val, idx) => {
              if (headers[idx]) {
                obj[headers[idx]] = val;
              }
            });
          }
          return obj;
        });
      } else {
        // Already array of objects
        items = rawData;
      }

      return items.map((rawItem: any) => {
        const item = rawItem || {};

        const id = item.id || `APP-${Math.floor(Math.random() * 899999 + 100000)}`;
        const applicantName = item.applicantName || 'Pemohon';
        const applicantIdCard = item.applicantIdCard || '-';
        const applicantEmail = item.applicantEmail || '-';
        const applicantPhone = formatPhoneWithZero(item.applicantPhone);
        const teamName = item.teamName || 'Pasukan Penyelidik';
        
        const researchTitle = item.researchTitle || 'Penyelidikan Tanpa Tajuk';
        const researchLink = item.researchLink || '';

        const eventName = item.eventName || '-';
        const eventLocation = item.eventLocation || '-';
        const eventDate = item.eventDate || '';
        const eventLevel = item.eventLevel || 'National';

        const submissionDate = item.submissionDate || new Date().toISOString();
        const status = item.status || ApplicationStatus.SUBMITTED;
        const targetCommittee = item.targetCommittee || 'MJPKKM';

        const assignedSecretary = item.assignedSecretary || '';
        const assignedExaminer = item.assignedExaminer || '';
        const secretaryAssignmentNotes = item.secretaryAssignmentNotes || '';
        const secretaryAssignmentDate = item.secretaryAssignmentDate || null;

        // Parse selected reviewers
        let selectedReviewers = item.selectedReviewersJson || item.selectedReviewers;
        if (typeof selectedReviewers === 'string') {
          try {
            selectedReviewers = JSON.parse(selectedReviewers);
          } catch {
            selectedReviewers = selectedReviewers ? selectedReviewers.split(',').map((s: string) => s.trim()) : [];
          }
        }
        if (!Array.isArray(selectedReviewers)) selectedReviewers = [];

        // Parse team members
        let teamMembers = item.teamMembersJson || item.teamMembers;
        if (typeof teamMembers === 'string') {
          try {
            teamMembers = JSON.parse(teamMembers);
          } catch {
            teamMembers = parseTeamMembersText(teamMembers);
          }
        }
        if (!Array.isArray(teamMembers)) teamMembers = [];

        // Parse reviews
        let reviews = item.reviewsJson || item.reviews;
        if (typeof reviews === 'string') {
          try {
            reviews = JSON.parse(reviews);
          } catch {
            reviews = parseReviewsText(reviews);
          }
        }
        if (typeof reviews !== 'object' || reviews === null) reviews = {};

        const secretaryEndorsementStatus = item.secretaryEndorsementStatus || null;
        const secretaryEndorsementComments = item.secretaryEndorsementComments || '';
        const secretaryEndorsementName = item.secretaryEndorsementName || '';
        const secretaryEndorsementDate = item.secretaryEndorsementDate || null;

        const hodStatus = item.hodStatus || null;
        const hodName = item.hodName || '';
        const hodComments = item.hodComments || '';
        const hodDate = item.hodDate || null;

        const directorStatus = item.directorStatus || null;
        const directorName = item.directorName || '';
        const directorComments = item.directorComments || '';
        const directorDate = item.directorDate || null;

        const achievementStatus = item.achievementStatus || '';
        const achievementDetails = item.achievementDetails || '';
        const achievementDate = item.achievementDate || null;

        return {
          ...item,
          id,
          applicantName,
          applicantIdCard,
          applicantEmail,
          applicantPhone,
          teamName,
          teamMembers,
          researchTitle,
          researchLink,
          eventName,
          eventLocation,
          eventDate,
          eventEndDate: item.eventEndDate || '',
          eventLevel: (eventLevel === 'State' || eventLevel === 'International (Dalam Negara)' || eventLevel === 'International (Luar Negara)' || eventLevel === 'International (Dalam Negeri)' || eventLevel === 'International (Luar Negeri)' || eventLevel === 'International') 
            ? (eventLevel === 'International (Dalam Negeri)' ? 'International (Dalam Negara)' : eventLevel === 'International (Luar Negeri)' ? 'International (Luar Negara)' : eventLevel)
            : (eventLevel === 'Negeri' ? 'State' : 'National'),
          submissionDate,
          status,
          targetCommittee: targetCommittee === 'INOVASI' ? 'INOVASI' : 'MJPKKM',
          assignedSecretary,
          assignedExaminer,
          secretaryAssignmentNotes,
          secretaryAssignmentDate,
          selectedReviewers,
          reviews,
          secretaryEndorsementStatus,
          secretaryEndorsementComments,
          secretaryEndorsementName,
          secretaryEndorsementDate,
          hodStatus,
          hodName,
          hodComments,
          hodDate,
          directorStatus,
          directorName,
          directorComments,
          directorDate,
          achievementStatus,
          achievementDetails,
          achievementDate
        };
      });
    } catch (error) {
      console.error('Sheet Fetch Error:', error);
      return [];
    }
  },

  saveOrUpdate: async (app: Application): Promise<boolean> => {
    if (!SCRIPT_URL || SCRIPT_URL.includes('your-actual-url')) return false;

    // Deduplication signature based on app id, status, examiner, endorsement, HOD, and director decisions
    const signature = `${app.id}_${app.status}_${app.assignedExaminer || ''}_${app.secretaryEndorsementStatus || ''}_${app.hodStatus || ''}_${app.directorStatus || ''}_${app.achievementStatus || ''}`;
    const now = Date.now();
    const lastSavedTime = recentSaveSignatures.get(signature);

    // If an identical request was sent within the last 4 seconds, ignore the duplicate trigger
    if (lastSavedTime && now - lastSavedTime < 4000) {
      console.log('Skipping duplicate save request for signature:', signature);
      return true;
    }

    recentSaveSignatures.set(signature, now);

    // Clean up stale signatures older than 30 seconds
    if (recentSaveSignatures.size > 50) {
      for (const [k, timestamp] of recentSaveSignatures.entries()) {
        if (now - timestamp > 30000) {
          recentSaveSignatures.delete(k);
        }
      }
    }

    try {
      // Format team members into clean human-readable text for Google Sheet cells
      const teamMembersText = app.teamMembers && app.teamMembers.length > 0
        ? app.teamMembers.map((m, i) => `${i + 1}. ${m.name}${m.idCard ? ` (${m.idCard})` : ''}${m.position ? ` - ${m.position}` : ''}`).join('; ')
        : 'Tiada ahli tambahan';

      // Format reviews into clean human-readable text for Google Sheet cells
      const reviewsText = app.reviews && Object.keys(app.reviews).length > 0
        ? Object.entries(app.reviews).map(([k, r]) => {
            const statusLabel = r.status === ReviewRating.EXCELLENT ? 'CEMERLANG' : r.status === ReviewRating.GOOD ? 'BAIK' : 'PENAMBAHBAIKAN';
            const dateStr = r.date ? ` [${new Date(r.date).toLocaleDateString('ms-MY')}]` : '';
            return `${r.reviewerName || k} (${statusLabel}): ${r.comments || 'Tiada ulasan'}${dateStr}`;
          }).join(' | ')
        : 'Belum ada penilaian';

      // Format selected reviewers into clean comma-separated text
      const selectedReviewersText = Array.isArray(app.selectedReviewers)
        ? app.selectedReviewers.join(', ')
        : '';

      // Payload strictly matching the exact 34 Google Sheet header names
      const payload = {
        id: app.id,
        applicantName: app.applicantName,
        applicantIdCard: app.applicantIdCard,
        applicantEmail: app.applicantEmail,
        applicantPhone: formatPhoneWithZero(app.applicantPhone) === '-' ? '' : formatPhoneWithZero(app.applicantPhone),
        teamName: app.teamName,
        teamMembers: teamMembersText,
        researchTitle: app.researchTitle,
        researchLink: app.researchLink,
        eventName: app.eventName,
        eventLocation: app.eventLocation,
        eventDate: app.eventDate,
        eventEndDate: app.eventEndDate || '',
        eventLevel: app.eventLevel,
        submissionDate: app.submissionDate,
        status: app.status,
        targetCommittee: app.targetCommittee || 'MJPKKM',
        assignedSecretary: app.assignedSecretary || '',
        assignedExaminer: app.assignedExaminer || '',
        secretaryAssignmentNotes: app.secretaryAssignmentNotes || '',
        secretaryAssignmentDate: app.secretaryAssignmentDate || '',
        selectedReviewers: selectedReviewersText,
        reviews: reviewsText,
        secretaryEndorsementStatus: app.secretaryEndorsementStatus || '',
        secretaryEndorsementComments: app.secretaryEndorsementComments || '',
        secretaryEndorsementName: app.secretaryEndorsementName || '',
        secretaryEndorsementDate: app.secretaryEndorsementDate || '',
        hodStatus: app.hodStatus || '',
        hodName: app.hodName || '',
        hodComments: app.hodComments || '',
        hodDate: app.hodDate || '',
        directorStatus: app.directorStatus || '',
        directorName: app.directorName || '',
        directorComments: app.directorComments || '',
        directorDate: app.directorDate || '',
        achievementStatus: app.achievementStatus || '',
        achievementDetails: app.achievementDetails || '',
        achievementDate: app.achievementDate || '',

        // Raw JSON strings for lossless programmatic reconstruction
        teamMembersJson: JSON.stringify(app.teamMembers || []),
        reviewsJson: JSON.stringify(app.reviews || {}),
        selectedReviewersJson: JSON.stringify(app.selectedReviewers || [])
      };

      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain', 
        },
        body: JSON.stringify(payload),
      });
      return true;
    } catch (error) {
      console.error('Sheet Save Error:', error);
      return false;
    }
  }
};

