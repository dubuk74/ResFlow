import { Application, ApplicationStatus } from '../types';

export const getStatusMalayLabel = (status: ApplicationStatus): string => {
  switch (status) {
    case ApplicationStatus.SUBMITTED:
      return 'Dihantar (Menunggu Semakan Urus Setia)';
    case ApplicationStatus.SECRETARY_PENDING:
      return 'Menunggu Lantikan Pemeriksa oleh Urus Setia';
    case ApplicationStatus.UNDER_REVIEW:
      return 'Dalam Semakan / Penilaian Pemeriksa';
    case ApplicationStatus.SECRETARY_REVIEW:
      return 'Menunggu Pengesahan Setiausaha JK';
    case ApplicationStatus.HOD_PENDING:
      return 'Menunggu Sokongan Ketua Jabatan (HOD)';
    case ApplicationStatus.DIRECTOR_PENDING:
      return 'Menunggu Kelulusan Akhir Timbalan Pengarah';
    case ApplicationStatus.APPROVED:
      return 'DILULUSKAN';
    case ApplicationStatus.REJECTED:
      return 'TIDAK DILULUSKAN / DITOLAK';
    default:
      return status;
  }
};

export interface EmailTemplate {
  subject: string;
  body: string;
  recipientEmail: string;
  recipientName: string;
}

export const generateApplicantEmailNotification = (
  app: Application,
  customNotes?: string,
  updatedByRole?: string
): EmailTemplate => {
  const statusMalay = getStatusMalayLabel(app.status);
  const subject = `[ResFlow] Makluman Status Permohonan Penyelidikan - ${app.id}`;
  
  let notesBlock = '';
  if (customNotes && customNotes.trim().length > 0) {
    notesBlock = `\nCatatan / Ulasan Tambahan:\n"${customNotes.trim()}"\n`;
  }

  // Get specific stage status details if available
  let stageDetails = '';
  if (app.status === ApplicationStatus.APPROVED && app.directorComments) {
    stageDetails = `\nUlasan Kelulusan Pengarah: "${app.directorComments}"\n`;
  } else if (app.status === ApplicationStatus.HOD_PENDING && app.secretaryEndorsementComments) {
    stageDetails = `\nPengesahan Setiausaha: "${app.secretaryEndorsementComments}"\n`;
  } else if (app.status === ApplicationStatus.DIRECTOR_PENDING && app.hodComments) {
    stageDetails = `\nSokongan Ketua Jabatan: "${app.hodComments}"\n`;
  }

  const body = `Salam Sejahtera ${app.applicantName || 'Pemohon'},

Makluman mengenai status permohonan penyelidikan & inovasi anda dalam Sistem ResFlow:

--------------------------------------------------
ID Permohonan : ${app.id}
Tajuk Research : ${app.researchTitle}
Nama Pasukan   : ${app.teamName || '-'}
Acara / Program : ${app.eventName} (${app.eventLocation || ''})
Tarikh Acara   : ${app.eventDate || '-'}
Jawatankuasa   : JK ${app.targetCommittee || 'MJPKKM'}
--------------------------------------------------

STATUS TERKINI : ${statusMalay.toUpperCase()}
${updatedByRole ? `Dikemaskini Oleh: ${updatedByRole}\n` : ''}${stageDetails}${notesBlock}
Sila log masuk ke Portal ResFlow untuk menyemak butiran lanjut atau muat turun laporan permohonan anda.

Pautan Manuskrip/Dokumen Anda:
${app.researchLink || '-'}

Sekian, terima kasih.

--------------------------------------------------
Sistem ResFlow
(Pengurusan Permohonan Penyelidikan & Inovasi)
Emel ini dijana secara automatik oleh sistem.
--------------------------------------------------`;

  return {
    subject,
    body,
    recipientEmail: app.applicantEmail,
    recipientName: app.applicantName
  };
};

export const openMailClient = (emailTemplate: EmailTemplate) => {
  if (!emailTemplate.recipientEmail) return;
  const mailtoUrl = `mailto:${encodeURIComponent(emailTemplate.recipientEmail)}?subject=${encodeURIComponent(emailTemplate.subject)}&body=${encodeURIComponent(emailTemplate.body)}`;
  window.open(mailtoUrl, '_blank');
};
