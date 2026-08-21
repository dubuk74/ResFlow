import React, { useState } from 'react';
import { UserRole, Application, ApplicationStatus, ReviewRating, ReviewData, REVIEWER_LIST, SECRETARY_LIST, getExaminerName, getCommitteeName } from '../types';
import { suggestResearchImprovements } from '../services/geminiService';
import { ReportModal } from './ReportModal';
import { EmailModal } from './EmailModal';
import { GoogleSheetService } from '../services/googleSheetService';

interface StageActionsProps {
  role: UserRole;
  app: Application;
  onUpdate: (app: Application) => void | Promise<void>;
  onEdit?: (app: Application) => void;
}

const StageActions: React.FC<StageActionsProps> = ({ role, app, onUpdate, onEdit }) => {
  const [comment, setComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [hodName, setHodName] = useState('');
  const [directorName, setDirectorName] = useState('');
  const [secretaryName, setSecretaryName] = useState('');
  const [examinerName, setExaminerName] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [rating, setRating] = useState<ReviewRating>(ReviewRating.GOOD);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Achievement State
  const [achievementStatus, setAchievementStatus] = useState(app.achievementStatus || 'Anugerah Emas (Gold)');
  const [achievementDetails, setAchievementDetails] = useState(app.achievementDetails || '');
  const [isEditingAchievement, setIsEditingAchievement] = useState(false);

  // --- Applicant Stage: Update Event Achievement / Award ---
  const handleUpdateAchievement = async () => {
    setIsSyncing(true);
    setSyncStatus('Menyimpan pencapaian/anugerah & mengemas kini Google Sheets...');
    try {
      const updatedApp: Application = {
        ...app,
        achievementStatus,
        achievementDetails,
        achievementDate: new Date().toISOString()
      };

      await GoogleSheetService.saveOrUpdate(updatedApp);
      await Promise.resolve(onUpdate(updatedApp));

      setIsEditingAchievement(false);
      setSyncStatus('Pencapaian/Anugerah acara berjaya dikemas kini ke Google Sheets!');
    } catch (err) {
      console.error(err);
      setSyncStatus('Gagal mengemas kini Google Sheets.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  // --- Secretary Stage 1: Assign Examiner ---
  const handleAssignExaminer = async () => {
    setIsSyncing(true);
    setSyncStatus('Menyimpan lantikan & mengemas kini Google Sheets...');
    try {
      const targetExaminerRole = role === UserRole.SECRETARY_1 ? UserRole.REVIEWER_1 : UserRole.REVIEWER_2;
      const finalSecretaryName = secretaryName.trim() || (role === UserRole.SECRETARY_1 ? 'Setiausaha MJPKKM' : 'Setiausaha JK Inovasi');
      const finalExaminerName = examinerName.trim() || targetExaminerRole;
      const updatedApp: Application = {
        ...app,
        assignedSecretary: finalSecretaryName,
        assignedExaminer: finalExaminerName,
        secretaryAssignmentNotes: assignmentNotes,
        secretaryAssignmentDate: new Date().toISOString(),
        selectedReviewers: [targetExaminerRole],
        status: ApplicationStatus.UNDER_REVIEW
      };

      // Direct forced write to Google Sheets
      await GoogleSheetService.saveOrUpdate(updatedApp);
      await Promise.resolve(onUpdate(updatedApp));

      setExaminerName('');
      setAssignmentNotes('');
      setSyncStatus('Lantikan pemeriksa berjaya dikemas kini ke Google Sheets!');
    } catch (err) {
      console.error(err);
      setSyncStatus('Gagal mengemas kini Google Sheets.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  // --- Examiner Stage: Evaluation ---
  const handleReviewerSubmit = async () => {
    setIsSyncing(true);
    setSyncStatus('Menyimpan hasil penilaian & mengemas kini Google Sheets...');
    try {
      const fallbackName = getExaminerName(app) || (app.assignedExaminer && !app.assignedExaminer.startsWith('Role Reviewer') ? app.assignedExaminer : role);
      const nameToUse = reviewerName.trim() !== '' ? reviewerName.trim() : fallbackName;
      const updatedReviews = { ...app.reviews };
      updatedReviews[role] = {
        reviewerId: role,
        reviewerName: nameToUse,
        comments: comment,
        status: rating,
        date: new Date().toISOString()
      };

      const updatedApp: Application = {
        ...app,
        reviews: updatedReviews,
        status: ApplicationStatus.SECRETARY_REVIEW
      };

      // Direct forced write to Google Sheets
      await GoogleSheetService.saveOrUpdate(updatedApp);
      await Promise.resolve(onUpdate(updatedApp));

      setComment('');
      setSyncStatus('Penilaian berjaya disimpan & dikemas kini ke Google Sheets!');
    } catch (err) {
      console.error(err);
      setSyncStatus('Gagal mengemas kini Google Sheets.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  // --- Secretary Stage 2: Endorse & Forward to HOD ---
  const handleSecretaryEndorse = async () => {
    setIsSyncing(true);
    setSyncStatus('Menyimpan sokongan Setiausaha & mengemas kini Google Sheets...');
    try {
      const finalSecretaryName = secretaryName.trim() || app.assignedSecretary || (role === UserRole.SECRETARY_1 ? 'Setiausaha MJPKKM' : 'Setiausaha JK Inovasi');
      const updatedApp: Application = {
        ...app,
        secretaryEndorsementStatus: 'Endorsed',
        secretaryEndorsementName: finalSecretaryName,
        secretaryEndorsementComments: comment,
        secretaryEndorsementDate: new Date().toISOString(),
        status: ApplicationStatus.HOD_PENDING
      };

      // Direct forced write to Google Sheets
      await GoogleSheetService.saveOrUpdate(updatedApp);
      await Promise.resolve(onUpdate(updatedApp));

      setComment('');
      setSecretaryName('');
      setSyncStatus('Sokongan Setiausaha berjaya dikemas kini ke Google Sheets!');
    } catch (err) {
      console.error(err);
      setSyncStatus('Gagal mengemas kini Google Sheets.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  const useGeminiAssistant = async () => {
    setIsAiLoading(true);
    const suggestions = await suggestResearchImprovements(app.researchTitle, app.researchLink);
    setComment(prev => (prev ? prev + "\n\n" : "") + "AI Suggested Improvements:\n" + suggestions);
    setIsAiLoading(false);
  };

  // --- HOD Stage ---
  const handleHODDecision = async (decision: 'Supported' | 'Unsupported') => {
    setIsSyncing(true);
    setSyncStatus('Menyimpan keputusan KJ & mengemas kini Google Sheets...');
    try {
      const updatedApp: Application = {
        ...app,
        hodStatus: decision,
        hodName: hodName.trim() || 'Ketua Jabatan',
        hodComments: comment,
        hodDate: new Date().toISOString(),
        status: decision === 'Supported' ? ApplicationStatus.DIRECTOR_PENDING : ApplicationStatus.REJECTED
      };

      // Direct forced write to Google Sheets
      await GoogleSheetService.saveOrUpdate(updatedApp);
      await Promise.resolve(onUpdate(updatedApp));

      setComment('');
      setSyncStatus('Keputusan KJ berjaya dikemas kini ke Google Sheets!');
    } catch (err) {
      console.error(err);
      setSyncStatus('Gagal mengemas kini Google Sheets.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  // --- Director Stage ---
  const handleDirectorDecision = async (decision: 'Approved' | 'Unapproved') => {
    setIsSyncing(true);
    setSyncStatus('Menyimpan keputusan Pengarah & mengemas kini Google Sheets...');
    try {
      const updatedApp: Application = {
        ...app,
        directorStatus: decision,
        directorName: directorName.trim() || 'Timbalan Pengarah',
        directorComments: comment,
        directorDate: new Date().toISOString(),
        status: decision === 'Approved' ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED
      };

      // Direct forced write to Google Sheets
      await GoogleSheetService.saveOrUpdate(updatedApp);
      await Promise.resolve(onUpdate(updatedApp));

      setComment('');
      setSyncStatus('Keputusan Pengarah berjaya dikemas kini ke Google Sheets!');
    } catch (err) {
      console.error(err);
      setSyncStatus('Gagal mengemas kini Google Sheets.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncStatus(null), 5000);
    }
  };

  // Check if current reviewer already reviewed
  const hasReviewed = app.reviews[role];

  const renderSyncBanner = () => {
    if (!syncStatus) return null;
    return (
      <div className={`p-3.5 rounded-xl mb-4 text-xs font-bold flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm transition-all ${isSyncing ? 'bg-amber-50 text-amber-900 border border-amber-200' : 'bg-emerald-50 text-emerald-900 border border-emerald-200'}`}>
        <div className="flex items-center gap-2">
          <i className={isSyncing ? "fas fa-spinner fa-spin text-amber-600 text-sm" : "fas fa-check-circle text-emerald-600 text-sm"}></i>
          <span>{syncStatus}</span>
        </div>
        {!isSyncing && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <i className="fas fa-envelope-open-text"></i>
              Pratonton Notifikasi E-mel
            </button>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase font-bold">Google Sheets & E-mel Ready</span>
          </div>
        )}
      </div>
    );
  };

  const renderAchievementSection = () => {
    const hasAchievement = Boolean(app.achievementStatus || app.achievementDetails);

    if (hasAchievement && !isEditingAchievement) {
      return (
        <div className="bg-gradient-to-br from-amber-50 via-amber-100/60 to-amber-50 p-4.5 rounded-2xl border-2 border-amber-300 shadow-sm mb-6 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                🏆
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">Pencapaian / Anugerah Acara</span>
                <h4 className="font-extrabold text-amber-950 text-base">{app.achievementStatus}</h4>
              </div>
            </div>
            {role === UserRole.APPLICANT && (
              <button
                onClick={() => setIsEditingAchievement(true)}
                className="text-xs font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <i className="fas fa-edit text-amber-800 text-xs"></i> Kemas Kini
              </button>
            )}
          </div>

          {app.achievementDetails && (
            <p className="text-xs text-slate-800 bg-white/90 p-3 rounded-xl border border-amber-200/80 font-medium">
              "{app.achievementDetails}"
            </p>
          )}

          {app.achievementDate && (
            <p className="text-[10px] font-bold text-amber-800/80">
              Tarikh Kemas Kini: {new Date(app.achievementDate).toLocaleDateString('ms-MY', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="bg-amber-50/90 border-2 border-amber-300 p-5 rounded-2xl shadow-sm mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              🏆
            </div>
            <div>
              <h4 className="font-extrabold text-amber-950 text-base">Kemas Kini Status / Pencapaian Acara</h4>
              <p className="text-xs text-amber-800">
                {hasAchievement ? 'Kemas kini keputusan atau anugerah yang diterima.' : 'Sudah menyertai acara? Sila kemas kini pencapaian/anugerah anda di sini.'}
              </p>
            </div>
          </div>
          {hasAchievement && (
            <button
              onClick={() => setIsEditingAchievement(false)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 px-2 py-1 rounded cursor-pointer"
            >
              Batal
            </button>
          )}
        </div>

        <div className="space-y-3 bg-white p-4 rounded-xl border border-amber-200">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Status / Pingat / Anugerah Diterima
            </label>
            <select
              value={achievementStatus}
              onChange={e => setAchievementStatus(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none bg-slate-50 font-semibold text-slate-800"
            >
              <option value="Anugerah Emas (Gold)">🥇 Anugerah Emas / Pingat Emas (Gold Award)</option>
              <option value="Anugerah Perak (Silver)">🥈 Anugerah Perak / Pingat Perak (Silver Award)</option>
              <option value="Anugerah Gangsa (Bronze)">🥉 Anugerah Gangsa / Pingat Gangsa (Bronze Award)</option>
              <option value="Anugerah Utama / Khas (Best Innovation)">⭐ Anugerah Utama / Khas (Best Innovation Award)</option>
              <option value="Sijil Penyertaan / Merit">📜 Sijil Penyertaan / Merit (Certificate of Participation)</option>
              <option value="Saguhati / Lain-lain">🎖️ Saguhati / Lain-lain</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Butiran Keputusan / Tajuk Anugerah (Pilihan)/ Link Salinan Sijil (1 Sampel)
            </label>
            <textarea
              placeholder="Contoh: Mendapat Anugerah Emas & Tempat Pertama Kategori ICT dalam Pertandingan Inovasi..."
              value={achievementDetails}
              onChange={e => setAchievementDetails(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none h-20 bg-slate-50"
            />
          </div>

          {renderSyncBanner()}

          <button
            onClick={handleUpdateAchievement}
            disabled={isSyncing}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            {isSyncing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                MENYIMPAN KE GOOGLE SHEET...
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                SIMPAN & KEMAS KINI PENCAPAIAN KE GOOGLE SHEET
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderApplicantInfo = () => (
    <div className="bg-slate-100 p-4 rounded-xl border border-slate-200 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Maklumat Pemohon</h5>
        <button
          onClick={() => setShowReportModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <i className="fas fa-print text-xs"></i> Cetak Laporan Penuh
        </button>
      </div>

      {app.achievementStatus && (
        <div className="mb-4 bg-gradient-to-r from-amber-50 to-amber-100/90 p-3 rounded-xl border border-amber-300 text-xs flex items-center justify-between">
          <div>
            <span className="font-extrabold text-amber-900 block text-[10px] uppercase">🏆 Pencapaian / Anugerah Acara:</span>
            <span className="font-bold text-amber-950 text-sm">{app.achievementStatus}</span>
            {app.achievementDetails && <p className="text-slate-700 text-[11px] italic mt-0.5">"{app.achievementDetails}"</p>}
          </div>
          {app.achievementDate && (
            <span className="text-[10px] text-amber-800 font-semibold shrink-0 ml-2">
              {new Date(app.achievementDate).toLocaleDateString('ms-MY')}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <p className="text-slate-500 font-medium">Nama</p>
          <p className="font-bold text-slate-800">{app.applicantName}</p>
        </div>
        <div>
          <p className="text-slate-500 font-medium">No. KP / No. Matrik</p>
          <p className="font-bold text-slate-800">{app.applicantIdCard}</p>
        </div>
        <div>
          <p className="text-slate-500 font-medium">E-mel</p>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="font-bold text-slate-800">{app.applicantEmail}</p>
            <button
              type="button"
              onClick={() => setShowEmailModal(true)}
              className="text-[10px] text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-bold px-2 py-0.5 rounded border border-indigo-200 transition-all flex items-center gap-1 cursor-pointer"
              title="Pratonton & Hantar E-Mel Notifikasi"
            >
              <i className="fas fa-envelope-open-text text-[10px]"></i>
              Notifikasi E-mel
            </button>
          </div>
        </div>
        <div>
          <p className="text-slate-500 font-medium">Telefon</p>
          <p className="font-bold text-slate-800">{app.applicantPhone}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-slate-500 font-medium">Tajuk Penyelidikan</p>
          <p className="font-bold text-slate-800">{app.researchTitle}</p>
        </div>
        <div>
          <p className="text-slate-500 font-medium">Acara</p>
          <p className="font-bold text-slate-800">
            {app.eventName} ({
              app.eventLevel === 'State' ? 'Negeri' :
              app.eventLevel === 'National' ? 'Kebangsaan' :
              (app.eventLevel === 'International (Dalam Negara)' || app.eventLevel === 'International (Dalam Negeri)') ? 'Antarabangsa (Dalam Negara)' :
              (app.eventLevel === 'International (Luar Negara)' || app.eventLevel === 'International (Luar Negeri)') ? 'Antarabangsa (Luar Negara)' :
              'Antarabangsa'
            })
          </p>
        </div>
        <div>
          <p className="text-slate-500 font-medium">Tarikh Acara</p>
          <p className="font-bold text-slate-800">
            {app.eventDate ? new Date(app.eventDate).toLocaleDateString('ms-MY') : 'N/A'}
            {app.eventEndDate ? ` hingga ${new Date(app.eventEndDate).toLocaleDateString('ms-MY')}` : ''}
          </p>
        </div>
        <div>
          <p className="text-slate-500 font-medium">Pautan Penyelidikan</p>
          <a href={app.researchLink} target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">Lihat Dokumen <i className="fas fa-external-link-alt ml-1"></i></a>
        </div>
      </div>
      {app.assignedExaminer && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-[10px] font-bold text-purple-700 uppercase tracking-widest block">Penilai Dilantik Setiausaha</span>
              <p className="text-xs font-extrabold text-purple-950 flex items-center gap-1.5 mt-0.5">
                <i className="fas fa-user-check text-purple-600"></i>
                {app.assignedExaminer}
              </p>
            </div>
            {app.assignedSecretary && (
              <span className="text-[11px] text-slate-500 font-medium">
                Dilantik oleh: <strong className="text-slate-700">{app.assignedSecretary}</strong>
              </span>
            )}
          </div>
        </div>
      )}
      {app.teamMembers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ahli Pasukan ({app.teamName})</p>
          <div className="space-y-2">
            {app.teamMembers.map((member, idx) => (
              <div key={idx} className="flex justify-between text-[11px] bg-white p-2 rounded border border-slate-100">
                <span className="font-bold">{member.name}</span>
                <span className="text-slate-500">{member.position} | {member.idCard}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {onEdit && (
        <div className="mt-5 pt-4 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <i className="fas fa-info-circle text-amber-500"></i>
            <span>Perlu mengemas kini maklumat atau pautan borang ini?</span>
          </div>
          <button
            onClick={() => onEdit(app)}
            className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <i className="fas fa-edit"></i>
            Kemas Kini Permohonan
          </button>
        </div>
      )}
    </div>
  );

  const renderHistoryTrail = () => {
    const reviewers = Object.entries(app.reviews) as [string, ReviewData][];
    
    return (
      <div className="space-y-6 mt-6 pt-6 border-t border-slate-200">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <i className="fas fa-history text-slate-400"></i>
            Sejarah Pemprosesan Permohonan
          </h4>
          <button
            onClick={() => setShowReportModal(true)}
            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <i className="fas fa-file-invoice text-indigo-600"></i> Lihat / Cetak Laporan
          </button>
        </div>

        {/* Section: Secretary Assignment */}
        {app.assignedSecretary && (
          <div className="space-y-2">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lantikan Pemeriksa oleh Setiausaha</h5>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-700">{app.assignedSecretary}</span>
                {app.secretaryAssignmentDate && <span className="text-[10px] text-slate-400">{new Date(app.secretaryAssignmentDate).toLocaleString()}</span>}
              </div>
              <p><span className="font-semibold text-slate-600">Pemeriksa Dilantik:</span> {app.assignedExaminer || 'Pensyarah Penilai'}</p>
              {app.secretaryAssignmentNotes && <p className="text-slate-500 italic">"{app.secretaryAssignmentNotes}"</p>}
            </div>
          </div>
        )}
        
        {/* Section: Examiner Reviews */}
        <div className="space-y-3">
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Penilaian Pemeriksa / Penilai</h5>
          {reviewers.length > 0 ? (
            reviewers.map(([key, rev]) => (
              <div key={key} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex flex-col">
                    <span className="font-bold text-xs text-slate-700">{key.replace('JK MJPKKM - PENSYARAH', 'JK MJPKKM').replace('JK INOVASI - PENSYARAH PEMBIMBING PELAJAR', 'JK INOVASI')}</span>
                    {rev.reviewerName && <span className="text-[10px] text-slate-500 font-bold">Disahkan oleh: {rev.reviewerName}</span>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    rev.status === ReviewRating.EXCELLENT ? 'bg-emerald-100 text-emerald-700' : 
                    rev.status === ReviewRating.GOOD ? 'bg-indigo-100 text-indigo-700' : 
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {rev.status === ReviewRating.EXCELLENT ? 'CEMERLANG' : rev.status === ReviewRating.GOOD ? 'BAIK' : 'PENAMBAHBAIKAN'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 italic">"{rev.comments}"</p>
                <p className="text-[10px] text-slate-400 mt-2">{new Date(rev.date).toLocaleString()}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">Tiada semakan teknikal direkodkan lagi.</p>
          )}
        </div>

        {/* Section: Secretary Endorsement */}
        {app.secretaryEndorsementStatus && (
          <div className="space-y-2">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sokongan Setiausaha Jawatankuasa</h5>
            <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 shadow-sm text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-indigo-800">Sokongan Diteruskan kepada HOD</span>
                {app.secretaryEndorsementDate && <span className="text-[10px] text-slate-400">{new Date(app.secretaryEndorsementDate).toLocaleString()}</span>}
              </div>
              {app.secretaryEndorsementName && <p className="text-[10px] text-slate-600 font-bold">Disahkan oleh: {app.secretaryEndorsementName}</p>}
              {app.secretaryEndorsementComments && <p className="text-slate-600 italic">"{app.secretaryEndorsementComments}"</p>}
            </div>
          </div>
        )}

        {/* Section: HOD */}
        {app.hodStatus && (
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sokongan Ketua Jabatan</h5>
            <div className={`p-3 rounded-xl border shadow-sm ${app.hodStatus === 'Supported' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-bold ${app.hodStatus === 'Supported' ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {app.hodStatus === 'Supported' ? 'DISOKONG' : 'TIDAK DISOKONG'}
                </span>
                <span className="text-[10px] text-slate-400">{new Date(app.hodDate!).toLocaleString()}</span>
              </div>
              {app.hodName && <p className="text-[10px] font-bold text-slate-600 mb-1">Disahkan oleh: {app.hodName}</p>}
              <p className="text-xs text-slate-600 italic">"{app.hodComments || 'Tiada ulasan diberikan.'}"</p>
            </div>
          </div>
        )}

        {/* Section: Director */}
        {app.directorStatus && (
          <div className="space-y-3">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kelulusan Akhir TIMBALAN PENGARAH</h5>
            <div className={`p-3 rounded-xl border shadow-sm ${app.directorStatus === 'Approved' ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-xs font-bold ${app.directorStatus === 'Approved' ? 'text-indigo-700' : 'text-slate-700'}`}>
                  {app.directorStatus === 'Approved' ? 'DILULUSKAN' : 'TIDAK DILULUSKAN'}
                </span>
                <span className="text-[10px] text-slate-400">{new Date(app.directorDate!).toLocaleString()}</span>
              </div>
              {app.directorName && <p className="text-[10px] font-bold text-slate-600 mb-1">Disahkan oleh: {app.directorName}</p>}
              <p className="text-xs text-slate-600 italic">"{app.directorComments || 'Tiada ulasan diberikan.'}"</p>
            </div>
          </div>
        )}
        {showReportModal && <ReportModal app={app} onClose={() => setShowReportModal(false)} />}
        <EmailModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} app={app} customNotes={comment} updatedByRole={role} />
      </div>
    );
  };

  if (role === UserRole.APPLICANT) {
    const getStatusLabel = (status: ApplicationStatus) => {
      switch (status) {
        case ApplicationStatus.SUBMITTED:
        case ApplicationStatus.SECRETARY_PENDING: return 'MENUNGGU LANTIKAN SETIAUSAHA';
        case ApplicationStatus.UNDER_REVIEW: return 'DALAM PENILAIAN PEMERIKSA';
        case ApplicationStatus.SECRETARY_REVIEW: return 'MENUNGGU SOKONGAN SETIAUSAHA';
        case ApplicationStatus.HOD_PENDING: return 'MENUNGGU KETUA JABATAN';
        case ApplicationStatus.DIRECTOR_PENDING: return 'MENUNGGU TIMBALAN PENGARAH';
        case ApplicationStatus.APPROVED: return 'DILULUSKAN';
        case ApplicationStatus.REJECTED: return 'DITOLAK';
        default: return 'TIDAK DIKETAHUI';
      }
    };

    return (
      <div className="space-y-6">
        {renderAchievementSection()}

        {app.status === ApplicationStatus.REJECTED ? (
          <div className="text-center py-6 bg-rose-50/90 rounded-2xl border-2 border-rose-300 p-6 shadow-sm space-y-3">
            <i className="fas fa-times-circle text-rose-600 text-4xl mb-1"></i>
            <h4 className="font-extrabold text-rose-950 text-lg">
              Status Permohonan: {app.hodStatus === 'Unsupported' ? 'TIDAK DISOKONG OLEH KETUA JABATAN' : 'DITOLAK'}
            </h4>
            <p className="text-xs text-rose-800 max-w-md mx-auto font-medium leading-relaxed">
              {app.hodStatus === 'Unsupported' 
                ? 'Permohonan ini tidak disokong oleh Ketua Jabatan. Sila semak ulasan dan cadangan Ketua Jabatan di bahagian Jejak Kitaran Pemprosesan di bawah.' 
                : 'Permohonan ini telah ditolak. Sila semak ulasan penuh dalam Jejak Kitaran Pemprosesan di bawah.'}
            </p>
            <div className="pt-2">
              <div className="inline-flex items-center gap-2 bg-rose-600 text-white font-black text-sm px-5 py-2.5 rounded-xl shadow-md uppercase tracking-wide border-2 border-rose-700 animate-pulse">
                <i className="fas fa-exclamation-circle text-amber-300 text-base"></i>
                SILA BUAT PERMOHONAN BAHARU
              </div>
            </div>
          </div>
        ) : app.status === ApplicationStatus.APPROVED ? (
          <div className="text-center py-6 bg-emerald-50/90 rounded-2xl border-2 border-emerald-300 p-6 shadow-sm">
            <i className="fas fa-check-circle text-emerald-600 text-4xl mb-3"></i>
            <h4 className="font-extrabold text-emerald-950 text-lg">
              Status Permohonan: DILULUSKAN
            </h4>
            <p className="text-xs text-emerald-800 max-w-md mx-auto mt-2 font-medium leading-relaxed">
              Tahniah! Permohonan anda telah diluluskan secara rasmi oleh Timbalan Pengarah.
            </p>
          </div>
        ) : (
          <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-200 p-6">
            <i className="fas fa-hourglass-half text-indigo-500 text-3xl mb-3"></i>
            <h4 className="font-bold text-slate-800">Status Permohonan: {getStatusLabel(app.status)}</h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">
              Permohonan anda sedang diproses melalui kitaran semakan standard.
            </p>
          </div>
        )}
        {renderHistoryTrail()}
      </div>
    );
  }

  // Secretary View
  if (SECRETARY_LIST.includes(role)) {
    // Stage 1: Assign Examiner
    if (app.status === ApplicationStatus.SECRETARY_PENDING || app.status === ApplicationStatus.SUBMITTED) {
      return (
        <div className="space-y-4">
          {renderApplicantInfo()}
          <div className="bg-indigo-50/70 border border-indigo-200 p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <i className="fas fa-user-check"></i>
              </div>
              <div>
                <h4 className="font-bold text-indigo-950 text-base">Tindakan Setiausaha: Lantikan Pemeriksa/Penilai</h4>
                <p className="text-xs text-indigo-700">Lantik pensyarah/pemeriksa untuk membuat penilaian kertas ini.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nama Setiausaha</label>
                <input 
                  type="text" 
                  placeholder="Nama Rasmi Setiausaha"
                  value={secretaryName}
                  onChange={e => setSecretaryName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nama Pemeriksa / Penilai Dilantik</label>
                <input 
                  type="text" 
                  placeholder="Contoh: Dr. Ahmad / Penilai 1"
                  value={examinerName}
                  onChange={e => setExaminerName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nota / Arahan Lantikan</label>
                <textarea 
                  placeholder="Arahan khas untuk pemeriksa..."
                  value={assignmentNotes}
                  onChange={e => setAssignmentNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-24 bg-white"
                />
              </div>

              {renderSyncBanner()}

              <button 
                onClick={handleAssignExaminer}
                disabled={isSyncing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSyncing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    SEDANG MENYIMPAN KE GOOGLE SHEET...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    SERAH KEPADA PEMERIKSA UNTUK PENILAIAN
                  </>
                )}
              </button>
            </div>
          </div>
          {renderHistoryTrail()}
        </div>
      );
    }

    // Stage 2: Review Examiner's Evaluation & Endorse to HOD
    if (app.status === ApplicationStatus.SECRETARY_REVIEW) {
      return (
        <div className="space-y-4">
          {renderApplicantInfo()}
          
          <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4">
            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Hasil Penilaian Pemeriksa</h5>
            <div className="space-y-3">
              {(Object.entries(app.reviews) as [string, ReviewData][]).map(([key, rev]) => (
                <div key={key} className="text-xs pb-2 border-b border-slate-50 last:border-0">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">{rev.reviewerName || key}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Lantikan: {app.assignedExaminer || 'Pemeriksa'}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${rev.status === ReviewRating.EXCELLENT ? 'bg-emerald-100 text-emerald-700' : rev.status === ReviewRating.GOOD ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                      {rev.status === ReviewRating.EXCELLENT ? 'CEMERLANG' : rev.status === ReviewRating.GOOD ? 'BAIK' : 'PENAMBAHBAIKAN'}
                    </span>
                  </div>
                  <p className="text-slate-600 italic">"{rev.comments}"</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200 p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <i className="fas fa-file-export"></i>
              </div>
              <div>
                <h4 className="font-bold text-emerald-950 text-base">Tindakan Setiausaha: Sokong & Maju kepada HOD</h4>
                <p className="text-xs text-emerald-700">Sahkan permohonan ini untuk diserahkan kepada Ketua Jabatan.</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nama Setiausaha</label>
                <input 
                  type="text" 
                  placeholder="Nama Rasmi Setiausaha"
                  value={secretaryName}
                  onChange={e => setSecretaryName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ulasan / Nota Setiausaha</label>
                <textarea 
                  placeholder="Ulasan pengesahan Setiausaha..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none h-24 bg-white"
                />
              </div>

              {renderSyncBanner()}

              <button 
                onClick={handleSecretaryEndorse}
                disabled={isSyncing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSyncing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    SEDANG MENYIMPAN KE GOOGLE SHEET...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle"></i>
                    SOKONG & HANTAR KEPADA KETUA JABATAN
                  </>
                )}
              </button>
            </div>
          </div>
          {renderHistoryTrail()}
        </div>
      );
    }

    // Other statuses for Secretary (Already processed or waiting other stages)
    return (
      <div className="space-y-4">
        {renderApplicantInfo()}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center gap-3">
          <i className="fas fa-info-circle text-slate-400 text-xl"></i>
          <div>
            <p className="text-sm font-bold text-slate-700">Status Permohonan Saat Ini: {app.status}</p>
            <p className="text-xs text-slate-500">Tindakan Setiausaha telah direkodkan. Permohonan kini berada dalam fasa seterusnya.</p>
          </div>
        </div>
        {renderHistoryTrail()}
      </div>
    );
  }

  // Reviewer View
  if (REVIEWER_LIST.includes(role)) {
    if (hasReviewed) {
      return (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <i className="fas fa-check"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-800">Review Submitted Successfully</p>
              <p className="text-[10px] text-emerald-600 font-medium">This application has been moved to the next approval stage.</p>
            </div>
          </div>
          {renderApplicantInfo()}
          <div className="bg-white border border-slate-200 p-4 rounded-xl">
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <i className="fas fa-clipboard-check text-indigo-500"></i> Your Recommendation
            </p>
            <div className="mt-3 text-xs space-y-1">
              {hasReviewed.reviewerName && <p><span className="font-bold">Verified by:</span> {hasReviewed.reviewerName}</p>}
              <p><span className="font-bold">Rating:</span> {hasReviewed.status}</p>
              <p><span className="font-bold">Date:</span> {new Date(hasReviewed.date).toLocaleString()}</p>
              <p className="mt-2 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">"{hasReviewed.comments}"</p>
            </div>
          </div>
          {renderHistoryTrail()}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Banner Tugasan Penilaian yang Ditetapkan oleh Setiausaha */}
        <div className="bg-amber-50/90 border-2 border-amber-300 p-4.5 rounded-2xl shadow-sm space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              <i className="fas fa-user-check"></i>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-amber-800 tracking-wider block">Notis Penilai Dilantik (Setiausaha)</span>
              <h4 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight mt-0.5">
                Penilai Dilantik: <span className="text-amber-950 underline decoration-amber-400">{app.assignedExaminer || 'Pensyarah Penilai'}</span>
              </h4>
            </div>
          </div>
          <div className="text-xs text-slate-700 bg-white/90 p-3 rounded-xl border border-amber-200/80 space-y-1 mt-2">
            {app.assignedSecretary && (
              <p><span className="font-bold text-slate-600">Setiausaha Melantik:</span> {app.assignedSecretary} {app.secretaryAssignmentDate ? `(${new Date(app.secretaryAssignmentDate).toLocaleDateString('ms-MY')})` : ''}</p>
            )}
            {app.secretaryAssignmentNotes ? (
              <p><span className="font-bold text-slate-600">Nota / Arahan Setiausaha:</span> <span className="italic font-medium text-amber-950">"{app.secretaryAssignmentNotes}"</span></p>
            ) : (
              <p className="text-slate-400 italic">Tiada arahan khas daripada Setiausaha.</p>
            )}
          </div>
        </div>

        {renderApplicantInfo()}

        <div className="flex items-center justify-between">
          <h4 className="font-bold text-slate-800">Penyerahan Semakan</h4>
          <button 
            onClick={useGeminiAssistant}
            disabled={isAiLoading}
            className="text-xs font-bold flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-3 py-1.5 rounded-full hover:shadow-lg disabled:opacity-50 transition-all"
          >
            <i className={`fas ${isAiLoading ? 'fa-spinner fa-spin' : 'fa-magic'}`}></i>
            {isAiLoading ? 'Menganalisis...' : 'PEMBANTU AI'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.values(ReviewRating).map(r => (
            <button 
              key={r}
              onClick={() => setRating(r)}
              className={`py-2 text-xs font-bold rounded-lg border-2 transition-all ${rating === r ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-600 border-slate-200'}`}
            >
              {r === ReviewRating.EXCELLENT ? 'CEMERLANG' : r === ReviewRating.GOOD ? 'BAIK' : 'PENAMBAHBAIKAN'}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Nama Penyemak / Penilai</label>
            {app.assignedExaminer && !reviewerName && (
              <button
                type="button"
                onClick={() => setReviewerName(app.assignedExaminer!)}
                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100"
              >
                <i className="fas fa-magic text-[9px]"></i> Gunakan Penilai Dilantik: {app.assignedExaminer}
              </button>
            )}
          </div>
          <input 
            type="text" 
            placeholder={app.assignedExaminer ? `Contoh: ${app.assignedExaminer}` : "Nama Penuh Rasmi"}
            value={reviewerName}
            onChange={e => setReviewerName(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        <textarea 
          placeholder="Tulis ulasan anda tentang apa yang perlu diperbaiki..."
          value={comment}
          onChange={e => setComment(e.target.value)}
          className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32"
        />

        {renderSyncBanner()}

        <button 
          onClick={handleReviewerSubmit}
          disabled={!comment || isSyncing}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSyncing ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              SEDANG MENYIMPAN KE GOOGLE SHEET...
            </>
          ) : (
            'HANTAR SEMAKAN'
          )}
        </button>
      </div>
    );
  }

  // HOD View
  if (role === UserRole.HOD) {
    if (app.hodStatus) {
      return (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${app.hodStatus === 'Supported' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${app.hodStatus === 'Supported' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
              <i className={`fas ${app.hodStatus === 'Supported' ? 'fa-check-double' : 'fa-times-circle'}`}></i>
            </div>
            <div>
              <p className={`text-sm font-extrabold ${app.hodStatus === 'Supported' ? 'text-emerald-900' : 'text-rose-900'}`}>
                Keputusan Ketua Jabatan: {app.hodStatus === 'Supported' ? 'DISOKONG' : 'TIDAK DISOKONG'}
              </p>
              <p className={`text-[11px] font-medium ${app.hodStatus === 'Supported' ? 'text-emerald-700' : 'text-rose-700'}`}>
                {app.hodStatus === 'Supported' 
                  ? 'Permohonan disokong dan dikemukakan kepada Timbalan Pengarah.' 
                  : 'Permohonan ditolak pada peringkat ini dan dikemas kini ke Google Sheets.'}
              </p>
            </div>
          </div>
          {renderApplicantInfo()}
          <div className={`p-4 rounded-xl border ${app.hodStatus === 'Supported' ? 'bg-white border-emerald-200 shadow-sm' : 'bg-white border-rose-200'}`}>
            <p className={`text-sm font-bold flex items-center gap-2 ${app.hodStatus === 'Supported' ? 'text-emerald-700' : 'text-rose-700'}`}>
              <i className={`fas ${app.hodStatus === 'Supported' ? 'fa-check-circle' : 'fa-times-circle'}`}></i> 
              Keputusan KETUA JABATAN: {app.hodStatus === 'Supported' ? 'DISOKONG' : 'TIDAK DISOKONG'}
            </p>
            <div className="mt-3 text-xs space-y-1 text-slate-600">
              <p><span className="font-bold">Disahkan oleh:</span> {app.hodName}</p>
              <p><span className="font-bold">Tarikh:</span> {new Date(app.hodDate!).toLocaleString()}</p>
              {app.hodComments && <p className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">"{app.hodComments}"</p>}
            </div>
          </div>
          {renderHistoryTrail()}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {renderApplicantInfo()}
        <h4 className="font-bold text-slate-800">Tindakan Ketua Jabatan</h4>
        <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4">
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Maklum Balas Semakan</h5>
          <div className="space-y-3">
            {(Object.entries(app.reviews) as [string, ReviewData][]).map(([key, rev]) => (
              <div key={key} className="text-xs pb-2 border-b border-slate-50 last:border-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700">{key.replace('JK MJPKKM - PENSYARAH', 'JK MJPKKM').replace('JK INOVASI - PENSYARAH PEMBIMBING PELAJAR', 'JK INOVASI')}</span>
                    {rev.reviewerName && <span className="text-[10px] text-slate-400 font-medium">Disahkan oleh: {rev.reviewerName}</span>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${rev.status === ReviewRating.EXCELLENT ? 'bg-emerald-100 text-emerald-700' : rev.status === ReviewRating.GOOD ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                    {rev.status === ReviewRating.EXCELLENT ? 'CEMERLANG' : rev.status === ReviewRating.GOOD ? 'BAIK' : 'PENAMBAHBAIKAN'}
                  </span>
                </div>
                <p className="text-slate-500 italic">"{rev.comments}"</p>
              </div>
            ))}
            {Object.keys(app.reviews).length === 0 && <p className="text-xs text-slate-400 italic">Tiada semakan ditemui.</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Nama KETUA JABATAN</label>
            <input 
              type="text" 
              placeholder="Nama Penuh Rasmi Ketua Jabatan"
              value={hodName}
              onChange={e => setHodName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <textarea 
            placeholder="Ulasan atau komen..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32"
          />

          {renderSyncBanner()}

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleHODDecision('Unsupported')}
              disabled={isSyncing}
              className="bg-white border-2 border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSyncing ? <i className="fas fa-spinner fa-spin"></i> : 'TIDAK DISOKONG'}
            </button>
            <button 
              onClick={() => handleHODDecision('Supported')}
              disabled={isSyncing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSyncing ? <i className="fas fa-spinner fa-spin"></i> : 'DISOKONG'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Director View
  if (role === UserRole.DIRECTOR) {
    if (app.directorStatus) {
      return (
        <div className="space-y-4">
          <div className="bg-indigo-600 border border-indigo-700 p-4 rounded-xl flex items-center gap-3 text-white animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <i className="fas fa-certificate text-white"></i>
            </div>
            <div>
              <p className="text-sm font-bold">Kitaran Semakan Selesai</p>
              <p className="text-[10px] opacity-80 font-medium">Keputusan akhir telah diterbitkan dan direkodkan secara rasmi.</p>
            </div>
          </div>
          {renderApplicantInfo()}
          <div className={`p-4 rounded-xl border ${app.directorStatus === 'Approved' ? 'bg-white border-indigo-200' : 'bg-white border-slate-200'}`}>
            <p className={`text-sm font-bold flex items-center gap-2 ${app.directorStatus === 'Approved' ? 'text-indigo-700' : 'text-slate-700'}`}>
              <i className={`fas ${app.directorStatus === 'Approved' ? 'fa-certificate' : 'fa-times-circle'}`}></i> 
              Tindakan TIMBALAN PENGARAH: {app.directorStatus === 'Approved' ? 'DILULUSKAN' : 'TIDAK DILULUSKAN'}
            </p>
            <div className="mt-3 text-xs space-y-1 text-slate-600">
              <p><span className="font-bold">Disahkan oleh:</span> {app.directorName}</p>
              <p><span className="font-bold">Tarikh:</span> {new Date(app.directorDate!).toLocaleString()}</p>
              {app.directorComments && <p className="mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">"{app.directorComments}"</p>}
            </div>
          </div>
          {renderHistoryTrail()}
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {renderApplicantInfo()}
        <h4 className="font-bold text-slate-800">Kelulusan Akhir TIMBALAN PENGARAH</h4>
        
        {/* Reviewer Feedback */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 mb-4">
          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Maklum Balas Semakan</h5>
          <div className="space-y-3">
            {(Object.entries(app.reviews) as [string, ReviewData][]).map(([key, rev]) => (
              <div key={key} className="text-xs pb-2 border-b border-slate-50 last:border-0">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700">{key.replace('JK MJPKKM - PENSYARAH', 'JK MJPKKM').replace('JK INOVASI - PENSYARAH PEMBIMBING PELAJAR', 'JK INOVASI')}</span>
                    {rev.reviewerName && <span className="text-[10px] text-slate-400 font-medium">Disahkan oleh: {rev.reviewerName}</span>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${rev.status === ReviewRating.EXCELLENT ? 'bg-emerald-100 text-emerald-700' : rev.status === ReviewRating.GOOD ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                    {rev.status === ReviewRating.EXCELLENT ? 'CEMERLANG' : rev.status === ReviewRating.GOOD ? 'BAIK' : 'PENAMBAHBAIKAN'}
                  </span>
                </div>
                <p className="text-slate-500 italic">"{rev.comments}"</p>
              </div>
            ))}
            {Object.keys(app.reviews).length === 0 && <p className="text-xs text-slate-400 italic">Tiada semakan ditemui.</p>}
          </div>
        </div>

        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <h5 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Sokongan KETUA JABATAN</h5>
          <p className="text-xs font-semibold text-slate-700">Status: <span className="text-emerald-600">{app.hodStatus === 'Supported' ? 'DISOKONG' : 'TIDAK DISOKONG'}</span></p>
          <p className="text-xs text-slate-500 mt-1 italic">"{app.hodComments}"</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Nama TIMBALAN PENGARAH</label>
            <input 
              type="text" 
              placeholder="Nama Penuh Rasmi Timbalan Pengarah"
              value={directorName}
              onChange={e => setDirectorName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <textarea 
            placeholder="Ulasan akhir untuk kelulusan/penolakan..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            className="w-full border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none h-32"
          />

          {renderSyncBanner()}

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => handleDirectorDecision('Unapproved')}
              disabled={isSyncing}
              className="bg-white border-2 border-slate-200 text-slate-500 hover:bg-slate-50 font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSyncing ? <i className="fas fa-spinner fa-spin"></i> : 'TIDAK LULUS'}
            </button>
            <button 
              onClick={() => handleDirectorDecision('Approved')}
              disabled={isSyncing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSyncing ? <i className="fas fa-spinner fa-spin"></i> : 'LULUS'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default StageActions;