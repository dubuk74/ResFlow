import React, { useState, useMemo } from 'react';
import { Application, ApplicationStatus, getCommitteeName, getExaminerName, ReviewRating, ReviewData } from '../types';
import { GoogleSheetService } from '../services/googleSheetService';
import { ReportModal } from './ReportModal';
import { EmailModal } from './EmailModal';

interface DirectorDashboardProps {
  applications: Application[];
  onUpdateApplication: (app: Application) => void | Promise<void>;
  onSwitchToStandardView: () => void;
}

export const DirectorDashboard: React.FC<DirectorDashboardProps> = ({
  applications,
  onUpdateApplication,
  onSwitchToStandardView
}) => {
  // Modals for Report & Email
  const [reportApp, setReportApp] = useState<Application | null>(null);
  const [emailApp, setEmailApp] = useState<Application | null>(null);
  const [manualTab, setManualTab] = useState<'MJPKKM' | 'INOVASI' | 'COMPLETED' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Action Modal State
  const [actionApp, setActionApp] = useState<Application | null>(null);
  const [actionType, setActionType] = useState<'Approved' | 'Unapproved' | null>(null);
  const [directorName, setDirectorName] = useState('Timbalan Pengarah');
  const [directorComments, setDirectorComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Group applications
  const { pendingMjpxkm, pendingInovasi, completedApps } = useMemo(() => {
    const pendingMjpxkm: Application[] = [];
    const pendingInovasi: Application[] = [];
    const completedApps: Application[] = [];

    applications.forEach((app) => {
      const committee = getCommitteeName(app);
      const isDirectorPending = app.status === ApplicationStatus.DIRECTOR_PENDING;
      const isProcessedByDirector = app.directorStatus !== null && app.directorStatus !== undefined;

      if (isProcessedByDirector || app.status === ApplicationStatus.APPROVED || app.status === ApplicationStatus.REJECTED) {
        completedApps.push(app);
      } else if (isDirectorPending) {
        if (committee === 'JK INOVASI') {
          pendingInovasi.push(app);
        } else {
          pendingMjpxkm.push(app);
        }
      }
    });

    return { pendingMjpxkm, pendingInovasi, completedApps };
  }, [applications]);

  // Active Tab: User selection or smart default prioritizing the committee with highest pending tasks
  const activeTab: 'MJPKKM' | 'INOVASI' | 'COMPLETED' = useMemo(() => {
    if (manualTab !== null) {
      return manualTab;
    }
    if (pendingInovasi.length > pendingMjpxkm.length) {
      return 'INOVASI';
    }
    if (pendingMjpxkm.length > 0) {
      return 'MJPKKM';
    }
    if (pendingInovasi.length > 0) {
      return 'INOVASI';
    }
    if (completedApps.length > 0) {
      return 'COMPLETED';
    }
    return 'MJPKKM';
  }, [manualTab, pendingInovasi.length, pendingMjpxkm.length, completedApps.length]);

  const setActiveTab = (tab: 'MJPKKM' | 'INOVASI' | 'COMPLETED') => {
    setManualTab(tab);
  };

  // Current list based on active tab and search
  const currentList = useMemo(() => {
    let list: Application[] = [];
    if (activeTab === 'MJPKKM') list = pendingMjpxkm;
    else if (activeTab === 'INOVASI') list = pendingInovasi;
    else list = completedApps;

    if (!searchTerm.trim()) return list;

    const q = searchTerm.toLowerCase();
    return list.filter(
      (app) =>
        app.researchTitle?.toLowerCase().includes(q) ||
        app.applicantName?.toLowerCase().includes(q) ||
        app.id?.toLowerCase().includes(q) ||
        app.eventName?.toLowerCase().includes(q)
    );
  }, [activeTab, pendingMjpxkm, pendingInovasi, completedApps, searchTerm]);

  // Handle open decision modal
  const openDecisionModal = (app: Application, type: 'Approved' | 'Unapproved') => {
    setActionApp(app);
    setActionType(type);
    setDirectorName('Timbalan Pengarah');
    setDirectorComments(type === 'Approved' ? 'Diluluskan untuk penyertaan.' : 'Permohonan tidak diluluskan.');
  };

  // Submit decision
  const handleSubmitDecision = async () => {
    if (!actionApp || !actionType) return;

    setIsProcessing(true);
    try {
      const updatedApp: Application = {
        ...actionApp,
        directorStatus: actionType,
        directorName: directorName.trim() || 'Timbalan Pengarah',
        directorComments: directorComments.trim(),
        directorDate: new Date().toISOString(),
        status: actionType === 'Approved' ? ApplicationStatus.APPROVED : ApplicationStatus.REJECTED
      };

      await GoogleSheetService.saveOrUpdate(updatedApp);
      await Promise.resolve(onUpdateApplication(updatedApp));

      setFeedbackMessage({
        type: 'success',
        text: `Kertas "${actionApp.researchTitle}" telah berjaya ${actionType === 'Approved' ? 'DILULUSKAN' : 'DITOLAK'} dan dikemas kini ke Google Sheets.`
      });

      setActionApp(null);
      setActionType(null);

      // Auto-switch to next active tab if current tab is empty
      if (activeTab === 'MJPKKM' && pendingMjpxkm.length <= 1 && pendingInovasi.length > 0) {
        setActiveTab('INOVASI');
      }
    } catch (error) {
      console.error(error);
      setFeedbackMessage({
        type: 'error',
        text: 'Ralat semasa menyimpan keputusan ke Google Sheets. Sila cuba lagi.'
      });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setFeedbackMessage(null), 6000);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner - Designed with Large Text & Senior Friendly High-Contrast */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-black uppercase tracking-wider">
              <i className="fas fa-user-shield"></i>
              Pengurusan Tertinggi
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Dashboard Timbalan Pengarah
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-normal max-w-2xl leading-relaxed">
              Semak dan luluskan permohonan kertas penyelidikan dan inovasi yang telah disokong oleh Ketua Jabatan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onSwitchToStandardView}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer backdrop-blur-sm"
              title="Tukar ke paparan jadual biasa"
            >
              <i className="fas fa-table"></i>
              <span>Papar Jadual Penuh</span>
            </button>
          </div>
        </div>

        {/* Global Stats Counter - Clickable Filter Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
          <button
            onClick={() => setActiveTab('MJPKKM')}
            className={`rounded-2xl p-4 border flex items-center gap-4 text-left transition-all cursor-pointer ${
              activeTab === 'MJPKKM'
                ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400 shadow-lg'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
            title="Klik untuk lihat senarai JK MJPKKM"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center text-xl font-black shrink-0">
              🔬
            </div>
            <div>
              <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">JK MJPKKM</p>
              <p className="text-2xl font-black text-white">{pendingMjpxkm.length} <span className="text-xs font-normal text-slate-400">menunggu</span></p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('INOVASI')}
            className={`rounded-2xl p-4 border flex items-center gap-4 text-left transition-all cursor-pointer ${
              activeTab === 'INOVASI'
                ? 'bg-amber-600/30 border-amber-400 ring-2 ring-amber-400 shadow-lg'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
            title="Klik untuk lihat senarai JK INOVASI"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-xl font-black shrink-0">
              💡
            </div>
            <div>
              <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">JK INOVASI</p>
              <p className="text-2xl font-black text-white">{pendingInovasi.length} <span className="text-xs font-normal text-slate-400">menunggu</span></p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('COMPLETED')}
            className={`rounded-2xl p-4 border flex items-center gap-4 text-left transition-all cursor-pointer ${
              activeTab === 'COMPLETED'
                ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400 shadow-lg'
                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
            }`}
            title="Klik untuk lihat rekod selesai"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xl font-black shrink-0">
              ✓
            </div>
            <div>
              <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Selesai Diproses</p>
              <p className="text-2xl font-black text-white">{completedApps.length} <span className="text-xs font-normal text-slate-400">rekod</span></p>
            </div>
          </button>
        </div>
      </div>

      {/* Alert Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl border text-sm font-bold flex items-center gap-3 shadow-md animate-in slide-in-from-top-2 duration-300 ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <i
            className={`text-lg ${
              feedbackMessage.type === 'success'
                ? 'fas fa-check-circle text-emerald-600'
                : 'fas fa-exclamation-circle text-rose-600'
            }`}
          ></i>
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* Jawatankuasa Navigation Tabs - Large Touch Targets */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => setActiveTab('MJPKKM')}
          className={`flex-1 p-4 rounded-2xl font-bold text-left transition-all border cursor-pointer flex items-center justify-between gap-4 ${
            activeTab === 'MJPKKM'
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 ring-2 ring-blue-400'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔬</span>
            <div>
              <div className="text-base sm:text-lg font-black">JK MJPKKM</div>
              <div className={`text-xs ${activeTab === 'MJPKKM' ? 'text-blue-100' : 'text-slate-500'}`}>
                Penyelidikan & Inovasi Pensyarah
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingMjpxkm.length > 0 ? (
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black shadow-md transition-transform duration-200 ${
                  activeTab === 'MJPKKM'
                    ? 'bg-rose-500 text-white shadow-rose-900/30 ring-2 ring-white animate-pulse'
                    : 'bg-rose-600 text-white shadow-rose-600/30 animate-pulse'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>{pendingMjpxkm.length} Tugasan Menunggu</span>
              </span>
            ) : (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  activeTab === 'MJPKKM'
                    ? 'bg-blue-800 text-blue-200'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                0 Tugasan
              </span>
            )}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('INOVASI')}
          className={`flex-1 p-4 rounded-2xl font-bold text-left transition-all border cursor-pointer flex items-center justify-between gap-4 ${
            activeTab === 'INOVASI'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20 ring-2 ring-indigo-400'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <div className="text-base sm:text-lg font-black">JK INOVASI</div>
              <div className={`text-xs ${activeTab === 'INOVASI' ? 'text-indigo-100' : 'text-slate-500'}`}>
                Inovasi Pelajar & Pensyarah Pembimbing
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {pendingInovasi.length > 0 ? (
              <span
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black shadow-md transition-transform duration-200 ${
                  activeTab === 'INOVASI'
                    ? 'bg-rose-500 text-white shadow-rose-900/30 ring-2 ring-white animate-pulse'
                    : 'bg-rose-600 text-white shadow-rose-600/30 animate-pulse'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <span>{pendingInovasi.length} Tugasan Menunggu</span>
              </span>
            ) : (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  activeTab === 'INOVASI'
                    ? 'bg-indigo-800 text-indigo-200'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                0 Tugasan
              </span>
            )}
          </div>
        </button>

        <button
          onClick={() => setActiveTab('COMPLETED')}
          className={`sm:w-56 p-4 rounded-2xl font-bold text-left transition-all border cursor-pointer flex items-center justify-between gap-3 ${
            activeTab === 'COMPLETED'
              ? 'bg-slate-800 text-white border-slate-800 shadow-lg ring-2 ring-slate-400'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className="text-xl">📜</span>
            <div>
              <div className="text-sm font-black">Sejarah Rekod</div>
              <div className={`text-[11px] ${activeTab === 'COMPLETED' ? 'text-slate-300' : 'text-slate-500'}`}>
                Telah Diproses
              </div>
            </div>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'COMPLETED' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {completedApps.length}
          </span>
        </button>
      </div>

      {/* Quick Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <i className="fas fa-search text-slate-400 text-base pl-2"></i>
        <input
          type="text"
          placeholder="Cari tajuk kertas, nama pemohon, atau ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none text-slate-800 placeholder-slate-400 bg-transparent font-medium"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-slate-400 hover:text-slate-600 text-sm px-2 py-1"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {/* Main List of Applications for Timbalan Pengarah */}
      <div className="space-y-6">
        {currentList.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
              {activeTab === 'COMPLETED' ? '📜' : '🎉'}
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">
              {activeTab === 'COMPLETED'
                ? 'Tiada rekod sejarah kelulusan dijumpai.'
                : `Tiada kertas menunggu untuk ${activeTab === 'MJPKKM' ? 'JK MJPKKM' : 'JK INOVASI'}`}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {activeTab === 'COMPLETED'
                ? 'Kertas yang telah anda luluskan atau tolak akan disenaraikan di sini.'
                : activeTab === 'MJPKKM'
                ? 'Semua permohonan JK MJPKKM telah selesai disemak atau belum sampai ke peringkat Timbalan Pengarah.'
                : 'Semua permohonan JK INOVASI telah selesai disemak atau belum sampai ke peringkat Timbalan Pengarah.'}
            </p>
          </div>
        ) : (
          currentList.map((app) => {
            const committee = getCommitteeName(app);
            const examiner = getExaminerName(app);
            const reviews = Object.entries(app.reviews || {}) as [string, ReviewData][];
            const isApproved = app.directorStatus === 'Approved' || app.status === ApplicationStatus.APPROVED;
            const isRejected = app.directorStatus === 'Unapproved' || app.status === ApplicationStatus.REJECTED;

            return (
              <div
                key={app.id}
                className="bg-white rounded-3xl border-2 border-slate-200 shadow-md hover:shadow-lg transition-all overflow-hidden p-6 sm:p-7 space-y-6"
              >
                {/* Top Card Badge & Reference */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-black tracking-wide uppercase ${
                        committee === 'JK INOVASI'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-300'
                      }`}
                    >
                      {committee === 'JK INOVASI' ? '💡 JK INOVASI' : '🔬 JK MJPKKM'}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">
                      Ruj: {app.id?.slice(0, 10)}
                    </span>
                  </div>

                  <div>
                    {isApproved ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <i className="fas fa-check-circle"></i> DILULUSKAN OLEH TP
                      </span>
                    ) : isRejected ? (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                        <i className="fas fa-times-circle"></i> TIDAK DILULUSKAN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-indigo-100 text-indigo-800 border border-indigo-300 animate-pulse">
                        <i className="fas fa-clock"></i> MENUNGGU KELULUSAN TP
                      </span>
                    )}
                  </div>
                </div>

                {/* Big Clear Title & Event */}
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                    {app.researchTitle || 'Penyelidikan Tanpa Tajuk'}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 font-medium">
                    <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-700 font-bold">
                      🏆 {app.eventName || 'Acara / Pertandingan'}
                    </span>
                    <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-700 font-bold">
                      📅 {app.eventDate ? new Date(app.eventDate).toLocaleDateString('ms-MY') : '-'}
                    </span>
                    <span className="bg-slate-100 px-3 py-1 rounded-lg text-slate-700 font-bold">
                      🌍 {app.eventLevel === 'State' ? 'Negeri' : app.eventLevel === 'National' ? 'Kebangsaan' : 'Antarabangsa'}
                    </span>
                  </div>
                </div>

                {/* Prominent Action Banner for Paper & Complete Report */}
                <div className="bg-indigo-50/80 border-2 border-indigo-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">
                      📄
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-indigo-950">Semakan Kertas Kerja & Laporan Penyelidikan</h4>
                      <p className="text-xs text-indigo-700 font-medium">
                        Buka dokumen asal di Google Drive atau semak borang laporan lengkap beserta rubrik pemarkahan.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
                    <button
                      onClick={() => setReportApp(app)}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-black px-5 py-3 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer shrink-0 ring-2 ring-indigo-300 active:scale-[0.98]"
                    >
                      <i className="fas fa-file-invoice text-white text-base"></i>
                      <span>Lihat Laporan Lengkap</span>
                    </button>

                    <a
                      href={app.researchLink}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-300 hover:border-slate-400 text-xs sm:text-sm font-bold px-4 py-3 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                    >
                      <span>Buka Google Drive</span>
                      <i className="fas fa-external-link-alt text-xs text-slate-500"></i>
                    </a>
                  </div>
                </div>

                {/* Key Summary Grid: Pemohon, Penilai, and HOD Support */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
                  {/* Applicant Info */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Pemohon Utama</p>
                    <p className="font-extrabold text-slate-800 text-base">{app.applicantName}</p>
                    <p className="text-slate-600 font-medium">{app.applicantEmail}</p>
                    <p className="text-slate-500 text-xs">Tel: {app.applicantPhone || '-'}</p>
                    {app.teamMembers && app.teamMembers.length > 0 && (
                      <p className="text-xs text-indigo-600 font-bold mt-1">
                        +{app.teamMembers.length} Ahli Pasukan ({app.teamName || 'Kumpulan'})
                      </p>
                    )}
                  </div>

                  {/* Reviewer / Examiner Assessment */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Semakan Penilai</p>
                    <p className="font-extrabold text-slate-800 text-base">
                      {examiner || 'Pemeriksa Dilantik'}
                    </p>
                    {reviews.length > 0 ? (
                      <div className="space-y-1 pt-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-black ${
                            reviews[0][1].status === ReviewRating.EXCELLENT
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          Keputusan: {reviews[0][1].status === ReviewRating.EXCELLENT ? 'CEMERLANG' : 'BAIK'}
                        </span>
                        {reviews[0][1].comments && (
                          <p className="text-xs text-slate-600 italic line-clamp-2">
                            "{reviews[0][1].comments}"
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Telah disemak oleh jawatankuasa.</p>
                    )}
                  </div>

                  {/* HOD Endorsement Highlight Box */}
                  <div
                    className={`p-4 rounded-2xl border-2 space-y-1 ${
                      app.hodStatus === 'Supported'
                        ? 'bg-emerald-50/70 border-emerald-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <p className="text-[11px] font-black uppercase text-emerald-800 tracking-wider">
                      Sokongan Ketua Jabatan (KJ)
                    </p>
                    <p className="font-extrabold text-emerald-950 text-base flex items-center gap-1.5">
                      <i className="fas fa-check-circle text-emerald-600"></i>
                      {app.hodStatus === 'Supported' ? 'DISOKONG' : 'TIDAK DISOKONG'}
                    </p>
                    <p className="text-xs text-slate-700 font-bold">Oleh: {app.hodName || 'Ketua Jabatan'}</p>
                    {app.hodComments && (
                      <p className="text-xs text-slate-600 italic bg-white/80 p-2 rounded-lg border border-emerald-100">
                        "{app.hodComments}"
                      </p>
                    )}
                  </div>
                </div>

                {/* If already processed by Director, show past decision */}
                {app.directorStatus && (
                  <div
                    className={`p-4 rounded-2xl border-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      app.directorStatus === 'Approved'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-base flex items-center gap-2">
                        <i
                          className={`fas ${
                            app.directorStatus === 'Approved' ? 'fa-check-double text-emerald-600' : 'fa-times-circle text-rose-600'
                          }`}
                        ></i>
                        Keputusan Anda: {app.directorStatus === 'Approved' ? 'DILULUSKAN' : 'TIDAK DILULUSKAN'}
                      </p>
                      <p className="text-xs opacity-90">
                        Disahkan pada {app.directorDate ? new Date(app.directorDate).toLocaleString('ms-MY') : '-'}
                      </p>
                      {app.directorComments && (
                        <p className="text-xs italic mt-1 bg-white/80 p-2 rounded-lg">"{app.directorComments}"</p>
                      )}
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setReportApp(app)}
                        className="bg-white hover:bg-slate-50 text-slate-800 text-xs font-black px-4 py-2.5 rounded-xl border-2 border-slate-300 shadow-xs hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                      >
                        <i className="fas fa-file-invoice text-indigo-600"></i>
                        <span>Lihat & Cetak Laporan Lengkap</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Big Action Buttons for Pending Approval */}
                {!app.directorStatus && (
                  <div className="pt-3 border-t border-slate-200/80 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
                    <div>
                      <button
                        onClick={() => setReportApp(app)}
                        className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm px-5 py-3 rounded-2xl shadow-md hover:shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2.5 cursor-pointer min-h-[48px]"
                      >
                        <i className="fas fa-file-invoice text-base text-blue-100"></i>
                        <span className="tracking-wide">LIHAT LAPORAN LENGKAP</span>
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => openDecisionModal(app, 'Unapproved')}
                        className="bg-white hover:bg-rose-50 text-rose-700 border-2 border-rose-300 hover:border-rose-400 font-extrabold text-sm sm:text-base px-6 py-3 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                      >
                        <i className="fas fa-times text-base"></i>
                        <span>TIDAK DILULUSKAN</span>
                      </button>

                      <button
                        onClick={() => openDecisionModal(app, 'Approved')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl shadow-emerald-600/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer min-h-[48px]"
                      >
                        <i className="fas fa-check-circle text-lg"></i>
                        <span>LULUSKAN PERMOHONAN</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Senior-Friendly Decision Confirmation Modal */}
      {actionApp && actionType && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-200">
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-black ${
                    actionType === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {actionType === 'Approved' ? '✓' : '✕'}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    {actionType === 'Approved' ? 'Pengesahan Kelulusan' : 'Pengesahan Penolakan'}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold">Tindakan Rasmi Timbalan Pengarah</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setActionApp(null);
                  setActionType(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-2 text-lg"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Target Paper Info */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <p className="text-xs font-bold text-slate-500 uppercase">Tajuk Kertas:</p>
              <p className="text-sm font-extrabold text-slate-900">{actionApp.researchTitle}</p>
              <p className="text-xs text-slate-600 mt-1">Pemohon: <strong>{actionApp.applicantName}</strong></p>
            </div>

            {/* Form Inputs with Large Fonts */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Nama Pengesah (Timbalan Pengarah)
                </label>
                <input
                  type="text"
                  value={directorName}
                  onChange={(e) => setDirectorName(e.target.value)}
                  className="w-full text-base font-bold bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                  placeholder="Nama Timbalan Pengarah"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  Catatan / Ulasan Rasmi (Pilihan)
                </label>
                <textarea
                  rows={3}
                  value={directorComments}
                  onChange={(e) => setDirectorComments(e.target.value)}
                  className="w-full text-sm font-medium bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                  placeholder="Masukkan ulasan atau catatan jika ada..."
                ></textarea>
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setActionApp(null);
                  setActionType(null);
                }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all cursor-pointer text-sm"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSubmitDecision}
                className={`flex-1 text-white font-black py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-base ${
                  actionType === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                    : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                }`}
              >
                {isProcessing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Menyimpan ke Google Sheets...</span>
                  </>
                ) : (
                  <>
                    <i className={actionType === 'Approved' ? 'fas fa-check-circle' : 'fas fa-times-circle'}></i>
                    <span>{actionType === 'Approved' ? 'Sahkan & Luluskan Kertas' : 'Sahkan Penolakan'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {reportApp && (
        <ReportModal app={reportApp} onClose={() => setReportApp(null)} />
      )}

      {/* Email Modal */}
      {emailApp && (
        <EmailModal
          isOpen={true}
          onClose={() => setEmailApp(null)}
          app={emailApp}
          updatedByRole={'TIMBALAN PENGARAH' as any}
        />
      )}
    </div>
  );
};

export default DirectorDashboard;
