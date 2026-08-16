import React, { useState, useMemo } from 'react';
import { UserRole, Application, ApplicationStatus } from '../types';
import GuidelinesModal from './GuidelinesModal';
import { SupportModal } from './SupportModal';
import { TemplatesModal } from './TemplatesModal';
import { ReportModal } from './ReportModal';
import { TelegramQRCard } from './TelegramQRCard';

interface HomePortalProps {
  role: UserRole;
  applications: Application[];
  onNavigate: (view: 'home' | 'applications' | 'create') => void;
  onOpenManual?: () => void;
}

const HomePortal: React.FC<HomePortalProps> = ({ role, applications, onNavigate, onOpenManual }) => {
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [searchAppId, setSearchAppId] = useState('');
  const [selectedReportApp, setSelectedReportApp] = useState<Application | null>(null);

  // Stats Calculation
  const totalApps = applications.length;
  const pendingApps = applications.filter(app => app.status !== ApplicationStatus.APPROVED && app.status !== ApplicationStatus.REJECTED).length;
  const approvedApps = applications.filter(app => app.status === ApplicationStatus.APPROVED).length;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Selamat Pagi';
    if (hour < 18) return 'Selamat Petang';
    return 'Selamat Malam';
  };

  const searchedApps = useMemo(() => {
    if (!searchAppId.trim()) return [];
    const query = searchAppId.trim().toLowerCase();
    return applications.filter(
      app =>
        app.id.toLowerCase().includes(query) ||
        app.researchTitle.toLowerCase().includes(query) ||
        (app.applicantName && app.applicantName.toLowerCase().includes(query))
    );
  }, [searchAppId, applications]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Official Academic Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0F2942] to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
            <i className="fas fa-university text-[11px] text-blue-400"></i>
            <span>Jawatankuasa Penyelidikan & Inovasi • KMPk</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 tracking-tight leading-tight text-white">
            {getGreeting()}, <span className="text-amber-400">{role.replace('HOD', 'KETUA JABATAN').replace('DIRECTOR', 'TIMBALAN PENGARAH')}</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed max-w-2xl font-normal">
            Portal rasmi pengurusan, semakan panel, dan kelulusan digital kertas kerja penyelidikan pensyarah serta inovasi pelajar Kolej Matrikulasi Perak.
          </p>

          <div className="flex flex-wrap items-center gap-3.5">
            {role === UserRole.APPLICANT ? (
              <button 
                onClick={() => onNavigate('create')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2.5 shadow-lg shadow-blue-900/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-sm"
              >
                <i className="fas fa-file-signature text-base"></i>
                <span>Hantar Permohonan Baharu</span>
              </button>
            ) : role === UserRole.DIRECTOR ? (
              <button 
                onClick={() => onNavigate('applications')}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-7 py-3.5 rounded-xl font-extrabold transition-all flex items-center gap-2.5 shadow-lg shadow-amber-400/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-sm"
              >
                <i className="fas fa-stamp text-base"></i>
                <span>Buka Dashboard Timbalan Pengarah</span>
              </button>
            ) : role === UserRole.HOD ? (
              <button 
                onClick={() => onNavigate('applications')}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 px-7 py-3.5 rounded-xl font-extrabold transition-all flex items-center gap-2.5 shadow-lg shadow-teal-500/20 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-sm"
              >
                <i className="fas fa-clipboard-check text-base"></i>
                <span>Buka Dashboard Ketua Jabatan</span>
              </button>
            ) : (
              <button 
                onClick={() => onNavigate('applications')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-3.5 rounded-xl font-bold transition-all flex items-center gap-2.5 shadow-lg cursor-pointer text-sm"
              >
                <i className="fas fa-tasks text-base"></i>
                <span>Semak Tugasan Penilaian</span>
              </button>
            )}

            {/* Hide tracking search button for Director and HOD as requested */}
            {role !== UserRole.DIRECTOR && role !== UserRole.HOD && (
              <button 
                onClick={() => setShowTrackingModal(true)}
                className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 px-6 py-3.5 rounded-xl font-semibold transition-all cursor-pointer flex items-center gap-2 text-sm"
              >
                <i className="fas fa-search text-xs text-slate-400"></i>
                <span>Jejak Status Permohonan</span>
              </button>
            )}
          </div>
        </div>
        
        {/* Background Academic Seal Accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <i className="fas fa-graduation-cap absolute right-8 bottom-8 text-white/[0.04] text-[180px] -rotate-12 pointer-events-none"></i>
      </div>

      {/* Institutional Statistics Dossier */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-5">
          <div className="w-13 h-13 bg-blue-50 text-blue-800 rounded-xl flex items-center justify-center text-2xl border border-blue-100">
            <i className="fas fa-folder"></i>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Jumlah Penyerahan Kertas</p>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{totalApps}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-5">
          <div className="w-13 h-13 bg-amber-50 text-amber-800 rounded-xl flex items-center justify-center text-2xl border border-amber-100">
            <i className="fas fa-hourglass-half"></i>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dalam Kitaran Semakan</p>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{pendingApps}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-5">
          <div className="w-13 h-13 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center text-2xl border border-emerald-100">
            <i className="fas fa-stamp"></i>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kertas Diluluskan Rasmi</p>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{approvedApps}</p>
          </div>
        </div>
      </div>

      {/* Quick Access & System Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pautan Pantas Portal with Telegram Info & Modals */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <i className="fas fa-th-large text-blue-700 text-sm"></i>
                Pusat Rujukan & Panduan Rasmi
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Dokumentasi dasar, format permohonan & hebahan inovasi</p>
            </div>
            <span className="text-[10px] font-bold bg-blue-50 text-blue-900 px-3 py-1 rounded-md border border-blue-100 uppercase self-start sm:self-auto">
              Dokumen KMPk
            </span>
          </div>

          {/* Telegram Innovation Channel Featured Box */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5">
            <div className="shrink-0 bg-white p-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <TelegramQRCard size={110} className="hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-blue-900 font-bold text-xs">
                <i className="fab fa-telegram-plane text-sm text-blue-600"></i>
                <span>Saluran Rasmi Telegram Info Pertandingan Inovasi</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Saluran hebahan pertandingan inovasi kebangsaan & antarabangsa, kolokium penyelidikan, geran, dan peluang penerbitan berimpak tinggi.
              </p>
              <ul className="text-xs text-slate-600 space-y-1 text-left list-disc list-inside pt-0.5 pb-0.5">
                <li>Ingin maklumat Pertandingan/ Simposium/ Kolokium Semasa atau akan datang.</li>
                <li>Ingin mengiklankan Pertandingan/ Simposium/ Kolokium akan datang.</li>
              </ul>
              <div className="pt-1.5">
                <a 
                  href="https://t.me/infoksajiankmpk" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                >
                  <i className="fab fa-telegram-plane"></i>
                  <span>Sertai Saluran Telegram</span>
                  <i className="fas fa-arrow-up-right-from-square text-[10px] opacity-70"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            {/* 1. Jejak Status */}
            <button 
              onClick={() => setShowTrackingModal(true)}
              className="group p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200/70 hover:border-blue-200 rounded-xl transition-all text-left cursor-pointer flex flex-col justify-between"
            >
              <div className="w-8 h-8 bg-white border border-slate-200/80 shadow-2xs rounded-lg flex items-center justify-center text-slate-500 group-hover:text-blue-900 mb-2.5 transition-colors">
                <i className="fas fa-search text-xs"></i>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs mb-0.5">Jejak Status</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">Semak permohonan</p>
              </div>
            </button>

            {/* 2. Garis Panduan */}
            <button 
              onClick={() => setShowGuidelines(true)}
              className="group p-3.5 bg-slate-50 hover:bg-emerald-50 border border-slate-200/70 hover:border-emerald-200 rounded-xl transition-all text-left cursor-pointer flex flex-col justify-between"
            >
              <div className="w-8 h-8 bg-white border border-slate-200/80 shadow-2xs rounded-lg flex items-center justify-center text-slate-500 group-hover:text-emerald-800 mb-2.5 transition-colors">
                <i className="fas fa-book text-xs"></i>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs mb-0.5">Garis Panduan</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">Syarat & tatacara</p>
              </div>
            </button>

            {/* 3. Hub Sokongan */}
            <button 
              onClick={() => setShowSupport(true)}
              className="group p-3.5 bg-slate-50 hover:bg-amber-50 border border-slate-200/70 hover:border-amber-200 rounded-xl transition-all text-left cursor-pointer flex flex-col justify-between"
            >
              <div className="w-8 h-8 bg-white border border-slate-200/80 shadow-2xs rounded-lg flex items-center justify-center text-slate-500 group-hover:text-amber-800 mb-2.5 transition-colors">
                <i className="fas fa-headset text-xs"></i>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs mb-0.5">Hub Sokongan</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">Urus Setia & FAQ</p>
              </div>
            </button>

            {/* 4. Templat Borang */}
            <button 
              onClick={() => setShowTemplates(true)}
              className="group p-3.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200/70 hover:border-indigo-200 rounded-xl transition-all text-left cursor-pointer flex flex-col justify-between"
            >
              <div className="w-8 h-8 bg-white border border-slate-200/80 shadow-2xs rounded-lg flex items-center justify-center text-slate-500 group-hover:text-indigo-800 mb-2.5 transition-colors">
                <i className="fas fa-file-pdf text-xs"></i>
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs mb-0.5">Templat Rasmi</p>
                <p className="text-[10px] text-slate-500 line-clamp-1">Format muat turun</p>
              </div>
            </button>
          </div>
        </div>

        {/* System & Audit Integration Box */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-6 sm:p-7 text-white border border-slate-800 shadow-2xs flex flex-col justify-between relative overflow-hidden">
          <div>
            <h3 className="text-base font-bold mb-5 flex items-center gap-2.5 text-white">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              Integriti & Keselamatan Sistem
            </h3>
            <div className="space-y-3 relative z-10">
              <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl flex items-center justify-between">
                <span className="text-slate-300 text-xs">Kitaran Aliran Kerja</span>
                <span className="text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                  <i className="fas fa-check-circle text-[10px]"></i> Diselaraskan KMPk
                </span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl flex items-center justify-between">
                <span className="text-slate-300 text-xs">Notifikasi Automatik</span>
                <span className="text-blue-300 text-xs font-semibold flex items-center gap-1.5">
                  <i className="fas fa-envelope text-[10px]"></i> Google Apps Script
                </span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl flex items-center justify-between">
                <span className="text-slate-300 text-xs">Penyegerakan Data</span>
                <span className="text-slate-200 text-xs font-semibold">Google Sheets Audit</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3.5 bg-blue-950/60 border border-blue-800/50 rounded-xl relative z-10">
            <p className="text-[11px] text-amber-400 font-bold mb-1 flex items-center gap-1.5">
              <i className="fas fa-info-circle"></i> Peringatan Format Dokumen
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Sila pastikan fail kertas cadangan dalam Google Drive diberi kebenaran capaian (View Only) bagi memudahkan semakan S/U, Penilai, KJ dan Timb. Pengarah.
            </p>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showGuidelines && <GuidelinesModal onClose={() => setShowGuidelines(false)} />}
      {showSupport && <SupportModal isOpen={showSupport} onClose={() => setShowSupport(false)} />}
      {showTemplates && <TemplatesModal isOpen={showTemplates} onClose={() => setShowTemplates(false)} />}

      {/* Jejak Status Quick Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] p-4 flex justify-center items-center animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 overflow-hidden border border-slate-100 flex flex-col space-y-5 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-lg">
                  <i className="fas fa-search"></i>
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800">Jejak Status Permohonan</h3>
                  <p className="text-xs text-slate-500">Carian pantas mengikut ID Permohonan atau Tajuk</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTrackingModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Cari Permohonan menggunakan Nama Pemohon/ Tajuk Kertas/ ID Permohonan:</label>
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Contoh: Nama Pemohon, Tajuk Kertas, atau APP-2026-001..."
                  value={searchAppId}
                  onChange={e => setSearchAppId(e.target.value)}
                  className="w-full text-sm p-3 pl-10 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <i className="fas fa-search absolute left-3.5 top-3.5 text-slate-400"></i>
              </div>
            </div>

            {/* Results Preview */}
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {searchAppId.trim() ? (
                searchedApps.length > 0 ? (
                  searchedApps.map((app) => (
                    <div key={app.id} className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-100 px-2.5 py-0.5 rounded-md">
                          {app.id}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {app.status}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-xs">{app.researchTitle}</h4>
                      <p className="text-[11px] text-slate-500">Pemohon: {app.applicantName} ({app.applicantEmail})</p>
                      <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                        {app.researchLink && (
                          <a
                            href={app.researchLink}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                          >
                            <span>Google Drive</span>
                            <i className="fas fa-external-link-alt text-[10px]"></i>
                          </a>
                        )}
                        <button 
                          onClick={() => {
                            setSelectedReportApp(app);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          <i className="fas fa-file-alt text-xs"></i>
                          <span>Lihat Laporan Penuh &rarr;</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-6 text-xs text-slate-400 italic">Tiada permohonan ditemui untuk carian "{searchAppId}".</p>
                )
              ) : (
                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-2 text-slate-600">
                  <p className="font-bold text-slate-800">Cara Menjejak Permohonan Anda:</p>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600">
                    <li>Masukkan ID permohonan (contoh: <code className="bg-white px-1 py-0.5 rounded border border-slate-200">APP-2026-xxx</code>), nama pemohon, atau sebahagian tajuk kertas di atas.</li>
                    <li>Tekan <strong>"Lihat Laporan Penuh"</strong> untuk memaparkan perincian dan status rasmi permohonan tersebut serta-merta.</li>
                    <li>Atau tekan butang <strong>"Ke Senarai Permohonan Saya"</strong> untuk melihat semua senarai kertas kerja.</li>
                  </ol>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center gap-2">
              <button
                onClick={() => setShowTrackingModal(false)}
                className="text-xs text-slate-500 hover:text-slate-700 font-bold cursor-pointer"
              >
                Tutup
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Jika Terlupa:</span>
                <button
                  onClick={() => {
                    setShowTrackingModal(false);
                    onNavigate('applications');
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 sm:px-5 py-2 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Ke Senarai Permohonan Saya
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Report Modal Opened Directly for Specific Searched Paper */}
      {selectedReportApp && (
        <ReportModal
          app={selectedReportApp}
          onClose={() => setSelectedReportApp(null)}
          initialTab="full"
        />
      )}
    </div>
  );
};

export default HomePortal;
