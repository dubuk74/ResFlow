
import React, { useState, useMemo, useEffect } from 'react';
import { UserRole, Application, ApplicationStatus, REVIEWER_LIST, SECRETARY_LIST, ReviewRating, ReviewData, getCommitteeName, getExaminerName } from '../types';
import ApplicationCard from './ApplicationCard';
import StageActions from './StageActions';
import { ReportModal } from './ReportModal';
import { EmailModal } from './EmailModal';
import DirectorDashboard from './DirectorDashboard';
import HodDashboard from './HodDashboard';

interface DashboardProps {
  role: UserRole;
  applications: Application[];
  onCreateNew: () => void;
  onEditApplication?: (app: Application) => void;
  onUpdateApplication: (app: Application) => void;
  resetKey?: number;
}

// Helper to check if an application can be edited by applicant (only in initial submitted/pending stages)
const canEditApplication = (app: Application) => {
  return app.status === ApplicationStatus.SUBMITTED || app.status === ApplicationStatus.SECRETARY_PENDING;
};

const Dashboard: React.FC<DashboardProps> = ({ role, applications, onCreateNew, onEditApplication, onUpdateApplication, resetKey }) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // When resetKey changes (e.g. user clicks the top nav "Senarai Kertas Kerja" button), reset back to main list
  useEffect(() => {
    setSelectedApp(null);
  }, [resetKey]);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isDirectorExecutiveMode, setIsDirectorExecutiveMode] = useState(true);
  const [isHodExecutiveMode, setIsHodExecutiveMode] = useState(true);

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [committeeFilter, setCommitteeFilter] = useState<'ALL' | 'MJPKKM' | 'INOVASI'>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handlePrint = () => {
    window.focus();
    setTimeout(() => {
      window.print();
    }, 100);
  };

  // Base role-filtered apps
  const roleFilteredApps: Application[] = useMemo(() => {
    if (role === UserRole.APPLICANT) return applications;

    return applications.filter((app: Application) => {
      const currentStatus = app.status;

      if (role === UserRole.SECRETARY_1 || role === UserRole.SECRETARY_2) {
        const committeeTarget = role === UserRole.SECRETARY_1 ? 'MJPKKM' : 'INOVASI';
        const isTargetCommittee = app.targetCommittee === committeeTarget || app.selectedReviewers?.some(r => r.includes(committeeTarget));
        if (!isTargetCommittee) return false;

        const isPendingForSecretary = currentStatus === ApplicationStatus.SECRETARY_PENDING || 
                                      currentStatus === ApplicationStatus.SECRETARY_REVIEW ||
                                      currentStatus === ApplicationStatus.SUBMITTED;

        if (showCompleted) {
          return !isPendingForSecretary;
        }
        return isPendingForSecretary;
      }
      
      if (REVIEWER_LIST.includes(role)) {
        const isSelectedForThisApp = app.selectedReviewers?.includes(role);
        const isProcessed = !!app.reviews[role];
        if (showCompleted) return isSelectedForThisApp;
        return !isProcessed && isSelectedForThisApp && currentStatus === ApplicationStatus.UNDER_REVIEW;
      }
      
      if (role === UserRole.HOD) {
        if (showCompleted) return app.hodStatus !== null;
        return currentStatus === ApplicationStatus.HOD_PENDING;
      }
      
      if (role === UserRole.DIRECTOR) {
        if (showCompleted) return app.directorStatus !== null;
        return currentStatus === ApplicationStatus.DIRECTOR_PENDING;
      }
      
      return false;
    });
  }, [applications, role, showCompleted]);

  // Apply search query and status/committee filters
  const searchedAndFilteredApps: Application[] = useMemo(() => {
    return roleFilteredApps.filter((app: Application) => {
      // Evaluate status booleans upfront to prevent TS type narrowing to never
      const isApproved = app.status === ApplicationStatus.APPROVED;
      const isRejected = app.status === ApplicationStatus.REJECTED;
      const isPending = !isApproved && !isRejected;

      // 1. Search Query
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchTitle = app.researchTitle?.toLowerCase().includes(term);
        const matchApplicant = app.applicantName?.toLowerCase().includes(term);
        const matchId = app.id?.toLowerCase().includes(term);
        const matchEvent = app.eventName?.toLowerCase().includes(term);
        const examiner = getExaminerName(app);
        const matchExaminer = examiner?.toLowerCase().includes(term);
        if (!matchTitle && !matchApplicant && !matchId && !matchEvent && !matchExaminer) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter === 'APPROVED' && !isApproved) return false;
      if (statusFilter === 'REJECTED' && !isRejected) return false;
      if (statusFilter === 'PENDING' && !isPending) return false;

      // 3. Committee Filter
      const appCommittee = getCommitteeName(app);
      if (committeeFilter !== 'ALL' && appCommittee !== committeeFilter) return false;

      return true;
    });
  }, [roleFilteredApps, searchTerm, statusFilter, committeeFilter]);

  // Reset page on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, committeeFilter, showCompleted]);

  // Pagination calculation
  const totalPages = Math.ceil(searchedAndFilteredApps.length / itemsPerPage) || 1;
  const paginatedApps = searchedAndFilteredApps.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.APPROVED:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200"><i className="fas fa-check-circle text-[9px]"></i> Diluluskan</span>;
      case ApplicationStatus.REJECTED:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200"><i className="fas fa-times-circle text-[9px]"></i> Ditolak</span>;
      case ApplicationStatus.UNDER_REVIEW:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 border border-indigo-200"><i className="fas fa-microscope text-[9px]"></i> Penilaian</span>;
      case ApplicationStatus.SECRETARY_PENDING:
      case ApplicationStatus.SECRETARY_REVIEW:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200"><i className="fas fa-user-edit text-[9px]"></i> Setiausaha</span>;
      case ApplicationStatus.HOD_PENDING:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200"><i className="fas fa-user-tie text-[9px]"></i> Semakan HOD</span>;
      case ApplicationStatus.DIRECTOR_PENDING:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200"><i className="fas fa-award text-[9px]"></i> T. Pengarah</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">Dihantar</span>;
    }
  };

  // Executive View for Timbalan Pengarah (Senior-friendly, simplified & categorized by Committee)
  if (role === UserRole.DIRECTOR && isDirectorExecutiveMode) {
    return (
      <DirectorDashboard
        applications={applications}
        onUpdateApplication={onUpdateApplication}
        onSwitchToStandardView={() => setIsDirectorExecutiveMode(false)}
      />
    );
  }

  // Executive View for Ketua Jabatan (Senior-friendly, simplified & categorized by Committee)
  if (role === UserRole.HOD && isHodExecutiveMode) {
    return (
      <HodDashboard
        applications={applications}
        onUpdateApplication={onUpdateApplication}
        onSwitchToStandardView={() => setIsHodExecutiveMode(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">
            {role === UserRole.APPLICANT ? 'Permohonan Saya' : showCompleted ? 'Sejarah Tugasan' : 'Tugasan Tertunda'}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">Urus kitaran penyerahan dan kelulusan kertas penyelidikan.</p>
        </div>
        <div className="flex gap-3">
          {role === UserRole.DIRECTOR && (
            <button
              onClick={() => setIsDirectorExecutiveMode(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <i className="fas fa-sparkles"></i>
              Dashboard Timbalan Pengarah
            </button>
          )}
          {role === UserRole.HOD && (
            <button
              onClick={() => setIsHodExecutiveMode(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <i className="fas fa-building"></i>
              Dashboard Ketua Jabatan
            </button>
          )}
          {role !== UserRole.APPLICANT && (
            <button 
              onClick={() => setShowCompleted(!showCompleted)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs transition-all border cursor-pointer ${showCompleted ? 'bg-slate-800 text-white border-slate-800 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
            >
              <i className={`fas ${showCompleted ? 'fa-list-ul' : 'fa-history'}`}></i>
              {showCompleted ? 'Papar Tertunda' : 'Lihat Sejarah'}
            </button>
          )}
          {role === UserRole.APPLICANT && (
            <button 
              onClick={onCreateNew}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-sm transition-all cursor-pointer"
            >
              <i className="fas fa-plus"></i>
              Permohonan Baharu
            </button>
          )}
        </div>
      </div>

      {/* Search & Filtering Toolbar - Screen Only */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 print:hidden">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input 
              type="text"
              placeholder="Cari Tajuk Penyelidikan, Pemohon, ID Rujukan, Penilai..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
              >
                <i className="fas fa-times-circle"></i>
              </button>
            )}
          </div>

          {/* Filters & View Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="PENDING">Dalam Proses</option>
              <option value="APPROVED">Diluluskan</option>
              <option value="REJECTED">Ditolak</option>
            </select>

            {/* Committee Filter */}
            <select
              value={committeeFilter}
              onChange={e => setCommitteeFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
            >
              <option value="ALL">Semua Jawatankuasa</option>
              <option value="MJPKKM">MJPKKM</option>
              <option value="INOVASI">INOVASI</option>
            </select>

            {/* View Mode Switcher */}
            {!selectedApp && (
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                <button
                  onClick={() => setViewMode('table')}
                  title="Paparan Jadual Ringkas"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'table' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <i className="fas fa-table text-xs"></i>
                  <span className="hidden sm:inline">Jadual</span>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  title="Paparan Kad Visual"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'cards' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <i className="fas fa-th-large text-xs"></i>
                  <span className="hidden sm:inline">Kad</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results summary and Active Filters */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
          <div>
            Menunjukkan <strong className="text-slate-800">{searchedAndFilteredApps.length}</strong> daripada <strong className="text-slate-800">{roleFilteredApps.length}</strong> permohonan
            {searchTerm && <span className="ml-1 italic text-indigo-600"> (Carian: "{searchTerm}")</span>}
          </div>
          {(searchTerm || statusFilter !== 'ALL' || committeeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setCommitteeFilter('ALL');
              }}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
            >
              <i className="fas fa-undo text-[10px]"></i> Sifarkan Penapis
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main List Section */}
        <div className={`${selectedApp ? 'lg:col-span-4' : 'lg:col-span-12'} space-y-4 print:hidden`}>
          {searchedAndFilteredApps.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-slate-400 text-2xl"></i>
              </div>
              <h3 className="font-bold text-slate-800 text-base">Tiada permohonan ditemui</h3>
              <p className="text-slate-500 text-xs mt-1">Sila pastikan ejaan carian atau pilih kriteria penapis yang lain.</p>
            </div>
          ) : selectedApp ? (
            /* Compact list when an application is selected for detail viewing */
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Permohonan Lain ({searchedAndFilteredApps.length})</p>
              {paginatedApps.map(app => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedApp?.id === app.id
                      ? 'bg-indigo-50 border-indigo-300 shadow-sm ring-1 ring-indigo-500'
                      : 'bg-white border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    {getStatusBadge(app.status)}
                    <span className="text-[9px] font-mono text-slate-400">ID: {app.id?.slice(0, 6)}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-1">{app.researchTitle || 'Tanpa Tajuk'}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{app.applicantName}</p>
                </div>
              ))}
            </div>
          ) : viewMode === 'table' ? (
            /* COMPACT TABLE VIEW for high-density listing */
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">ID & Tarikh</th>
                      <th className="py-3 px-4">Tajuk Penyelidikan</th>
                      <th className="py-3 px-4">Pemohon</th>
                      <th className="py-3 px-4">Jawatankuasa / Penilai</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {paginatedApps.map(app => (
                      <tr 
                        key={app.id}
                        onClick={() => setSelectedApp(app)}
                        className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                          <span className="font-bold text-slate-700 block">{app.id?.slice(0, 8)}</span>
                          <span className="text-[10px] text-slate-400">{app.submissionDate ? new Date(app.submissionDate).toLocaleDateString('ms-MY') : '-'}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800 max-w-xs truncate group-hover:text-indigo-600 transition-colors">
                          {app.researchTitle || 'Penyelidikan Tanpa Tajuk'}
                          {app.eventName && (
                            <span className="block text-[10px] font-medium text-slate-400 font-sans truncate">{app.eventName}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                          <span className="font-medium block">{app.applicantName}</span>
                          {app.teamMembers && app.teamMembers.length > 0 && (
                            <span className="text-[10px] text-slate-400">+{app.teamMembers.length} ahli</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 block text-[11px]">{getCommitteeName(app)}</span>
                          {getExaminerName(app) ? (
                            <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 inline-block mt-0.5">
                              <i className="fas fa-user-check text-[8px] mr-1"></i>{getExaminerName(app)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">Belum dilantik</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getStatusBadge(app.status)}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex justify-end gap-1.5">
                            {onEditApplication && role === UserRole.APPLICANT && canEditApplication(app) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditApplication(app);
                                }}
                                className="bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white px-2.5 py-1.5 rounded-lg font-bold text-xs transition-all border border-amber-200 cursor-pointer flex items-center gap-1 shadow-sm"
                                title="Kemas Kini Permohonan Ini"
                              >
                                <i className="fas fa-edit text-[11px]"></i>
                                <span className="hidden xl:inline">Kemas Kini</span>
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApp(app);
                              }}
                              className="bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-sm cursor-pointer"
                            >
                              Semak <i className="fas fa-chevron-right ml-1 text-[10px]"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* CARD VIEW for visual orientation */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedApps.map(app => (
                <ApplicationCard 
                  key={app.id} 
                  app={app} 
                  isActive={selectedApp ? (selectedApp as Application).id === app.id : false}
                  onClick={() => setSelectedApp(app)} 
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-200/80 shadow-sm text-xs text-slate-600">
              <span>Halaman <strong className="text-slate-800">{currentPage}</strong> daripada <strong className="text-slate-800">{totalPages}</strong></span>
              <div className="flex gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold cursor-pointer"
                >
                  <i className="fas fa-chevron-left mr-1 text-[10px]"></i> Sebelumnya
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-semibold cursor-pointer"
                >
                  Seterusnya <i className="fas fa-chevron-right ml-1 text-[10px]"></i>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Selected Application Detail Panel */}
        {selectedApp && (
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px] print:border-0 print:shadow-none print:bg-white print:p-0">
            {/* Action Bar - Screen Only */}
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="mt-0.5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer shrink-0 border border-slate-300 shadow-2xs"
                  title="Kembali ke Senarai Kertas Kerja"
                >
                  <i className="fas fa-arrow-left"></i>
                  <span className="hidden sm:inline">Kembali</span>
                </button>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 line-clamp-2">{selectedApp.researchTitle}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Dihantar {new Date(selectedApp.submissionDate).toLocaleDateString()} • Ruj: <span className="font-mono text-xs">{selectedApp.id?.toUpperCase() || 'N/A'}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                {onEditApplication && role === UserRole.APPLICANT && canEditApplication(selectedApp) && (
                  <button 
                    onClick={() => onEditApplication(selectedApp)}
                    className="p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all flex items-center gap-2 border border-amber-500 shadow-sm cursor-pointer"
                    title="Kemas Kini Permohonan Ini"
                  >
                    <i className="fas fa-edit"></i>
                    <span className="text-xs font-bold uppercase hidden sm:inline">Kemas Kini Permohonan</span>
                  </button>
                )}
                <button 
                  onClick={() => setShowEmailModal(true)}
                  className="p-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-all flex items-center gap-2 border border-sky-600 shadow-sm cursor-pointer"
                  title="Pratonton & Hantar E-mel Notifikasi Pemohon"
                >
                  <i className="fas fa-envelope-open-text"></i>
                  <span className="text-xs font-bold uppercase hidden sm:inline">Notifikasi E-mel</span>
                </button>
                <button 
                  onClick={() => setShowReportModal(true)}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all flex items-center gap-2 border border-indigo-600 shadow-sm cursor-pointer"
                >
                  <i className="fas fa-print"></i>
                  <span className="text-xs font-bold uppercase hidden sm:inline">Cetak Laporan Penuh</span>
                </button>
                <button 
                  onClick={() => setSelectedApp(null)} 
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all cursor-pointer"
                  title="Tutup Paparan Perincian"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Application Dashboard - Screen Only */}
            <div className="flex-1 p-6 overflow-y-auto space-y-8 print:hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ringkasan Penyelidikan</h4>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">{selectedApp.researchTitle}</p>
                    <a href={selectedApp.researchLink} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-semibold">
                      <i className="fas fa-link"></i> Lihat Pautan Kertas
                    </a>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statistik Penyerahan</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200 uppercase">
                      {selectedApp.eventLevel === 'National' ? 'KEBANGSAAN' : 'ANTARABANGSA'}
                    </span>
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold border border-indigo-100 uppercase">
                      {new Date(selectedApp.eventDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80">
                <StageActions 
                  role={role} 
                  app={selectedApp}
                  onEdit={canEditApplication(selectedApp) ? onEditApplication : undefined}
                  onUpdate={async (updated) => {
                    await onUpdateApplication(updated);
                    setSelectedApp(updated);
                  }} 
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {showReportModal && selectedApp && (
        <ReportModal app={selectedApp} onClose={() => setShowReportModal(false)} />
      )}

      {showEmailModal && selectedApp && (
        <EmailModal isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} app={selectedApp} updatedByRole={role} />
      )}
    </div>
  );
};

export default Dashboard;
