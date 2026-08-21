
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { UserRole, Application, ApplicationStatus } from './types';
import Dashboard from './components/Dashboard';
import ApplicationWizard from './components/ApplicationWizard';
import HomePortal from './components/HomePortal';
import RoleSwitcher from './components/RoleSwitcher';
import { UserManualModal } from './components/UserManualModal';
import { GoogleSheetService } from './services/googleSheetService';

type ViewType = 'home' | 'applications' | 'create';

type SyncStatus = 'syncing' | 'connected' | 'error';

const App: React.FC = () => {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.APPLICANT);
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [dashboardResetKey, setDashboardResetKey] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Real-time Cloud Sync State Tracking
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('syncing');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const isFetchingRef = useRef(false);

  // Real-time Cloud Fetch with transparent status tracking
  const syncWithCloud = useCallback(async (isSilent: boolean = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (!isSilent) {
      setSyncStatus('syncing');
      setIsManualSyncing(true);
    }

    try {
      const result = await GoogleSheetService.fetchAllWithStatus();
      if (result.success) {
        setApplications(result.data);
        setLastSyncTime(result.timestamp);
        setSyncStatus('connected');
        setSyncError(null);
      } else {
        // Fetch returned an error
        setSyncStatus('error');
        setSyncError(result.error || 'Gagal memuat turun data daripada Google Sheets.');
        if (result.data && result.data.length > 0) {
          // Keep existing cached data if available
          setApplications(result.data);
        }
      }
    } catch (err: any) {
      setSyncStatus('error');
      setSyncError(err?.message || 'Ralat sambungan rangkaian ke Google Sheets.');
    } finally {
      setIsLoading(false);
      setIsManualSyncing(false);
      isFetchingRef.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    syncWithCloud(false);
  }, [syncWithCloud]);

  // Periodic real-time background sync (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        syncWithCloud(true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [syncWithCloud]);

  const handleCreateApplication = async (newApp: Application) => {
    // Optimistic UI update
    const updatedList = [newApp, ...applications];
    setApplications(updatedList);
    setCurrentView('applications');

    // Persist to Cloud Google Sheets
    setSyncStatus('syncing');
    const success = await GoogleSheetService.saveOrUpdate(newApp);
    if (success) {
      setSyncStatus('connected');
      setLastSyncTime(new Date());
      // Re-sync to verify cloud state
      setTimeout(() => syncWithCloud(true), 1500);
    } else {
      setSyncStatus('error');
      setSyncError('Gagal menyimpan rekod baharu ke Google Sheets. Sila semak sambungan internet anda.');
    }
  };

  const updateApplication = async (updatedApp: Application) => {
    // Optimistic UI update
    const updatedList = applications.map(app => app.id === updatedApp.id ? updatedApp : app);
    setApplications(updatedList);

    // Persist to Cloud Google Sheets
    setSyncStatus('syncing');
    const success = await GoogleSheetService.saveOrUpdate(updatedApp);
    if (success) {
      setSyncStatus('connected');
      setLastSyncTime(new Date());
      // Re-sync in background to reflect changes
      setTimeout(() => syncWithCloud(true), 1500);
      return true;
    } else {
      setSyncStatus('error');
      setSyncError('Gagal mengemas kini data ke Google Sheets. Sila semak sambungan internet anda.');
      return false;
    }
  };

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentUserRole(newRole);
    if (newRole === UserRole.APPLICANT) {
      setCurrentView('home');
    } else if (newRole === UserRole.DIRECTOR || newRole === UserRole.HOD) {
      setCurrentView('applications');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 animate-pulse print:hidden">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-700 font-bold text-base">Menyegerak Pangkalan Data Cloud (Google Sheets)...</p>
          <p className="text-slate-400 text-xs mt-1">Memuat turun data penyerahan secara langsung</p>
        </div>
      );
    }

    switch (currentView) {
      case 'home':
        return (
          <HomePortal 
            role={currentUserRole} 
            applications={applications} 
            onNavigate={(view) => {
              if (view === 'applications') {
                setDashboardResetKey(k => k + 1);
              }
              setCurrentView(view);
            }} 
            onOpenManual={() => setIsManualModalOpen(true)}
          />
        );
      case 'create':
        return (
          <ApplicationWizard 
            initialData={editingApp}
            onCancel={() => {
              setEditingApp(null);
              setCurrentView('applications');
            }} 
            onSubmit={async (app) => {
              if (editingApp) {
                await updateApplication(app);
                setEditingApp(null);
                setCurrentView('applications');
              } else {
                await handleCreateApplication(app);
              }
            }} 
          />
        );
      case 'applications':
        return (
          <Dashboard 
            role={currentUserRole} 
            applications={applications}
            resetKey={dashboardResetKey}
            onCreateNew={() => {
              setEditingApp(null);
              setCurrentView('create');
            }}
            onEditApplication={(appToEdit) => {
              setEditingApp(appToEdit);
              setCurrentView('create');
            }}
            onUpdateApplication={updateApplication}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col font-sans text-slate-800 antialiased">
      {/* Real-time Sync Error Notification Banner */}
      {syncStatus === 'error' && syncError && (
        <div className="bg-rose-600 text-white px-4 py-2.5 text-xs font-semibold flex items-center justify-between gap-3 sticky top-0 z-60 shadow-md animate-in slide-in-from-top print:hidden">
          <div className="flex items-center gap-2">
            <i className="fas fa-exclamation-triangle text-amber-300 text-sm"></i>
            <span><strong>Ralat Sambungan Cloud:</strong> {syncError}</span>
          </div>
          <button
            onClick={() => syncWithCloud(false)}
            disabled={isManualSyncing}
            className="bg-white hover:bg-slate-100 text-rose-700 font-bold px-3 py-1 rounded-lg text-xs transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <i className={`fas fa-sync-alt ${isManualSyncing ? 'animate-spin' : ''}`}></i>
            Cuba Segar Semula
          </button>
        </div>
      )}

      {/* Top Institutional Header - Hidden on Print */}
      <header className="bg-white border-b border-slate-200/90 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3.5 xl:gap-6 sticky top-0 z-50 shadow-xs print:hidden">
        <div 
          onClick={() => setCurrentView('home')}
          className="flex items-center gap-3 sm:gap-4 lg:gap-5 cursor-pointer group select-none shrink-0"
          title="Kembali ke Portal Utama"
        >
          <div className="p-1.5 sm:p-2 bg-white border border-slate-200 rounded-2xl shadow-xs group-hover:border-blue-500 group-hover:shadow-sm transition-all flex items-center justify-center shrink-0">
            <img 
              src="https://upload.wikimedia.org/wikipedia/ms/7/71/Kolej_Matrikulasi_Perak.png" 
              alt="KMPk Logo" 
              referrerPolicy="no-referrer"
              loading="eager"
              className="h-12 sm:h-14 md:h-16 lg:h-18 w-auto object-contain drop-shadow-xs transition-transform duration-200 group-hover:scale-105 shrink-0"
            />
          </div>
          <div className="border-l-2 border-slate-200 pl-3 sm:pl-4">
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              <h1 className="font-black text-xl sm:text-2xl md:text-3xl text-slate-900 tracking-tight leading-none group-hover:text-blue-900 transition-colors">
                ResFlow
              </h1>
              <span className="text-[10px] sm:text-[11px] font-black px-2 sm:px-2.5 py-0.5 rounded-md bg-blue-900 text-white tracking-widest uppercase shadow-2xs">
                KMPk
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-md">
                <i className="fas fa-globe text-[10px] text-blue-500"></i>
                res-flow.vercel.app
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-600 font-semibold tracking-wider mt-1 sm:mt-1.5 flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <span className="text-slate-800 font-bold">Sistem Kelulusan Penyelidikan & Inovasi</span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-blue-800 hidden sm:inline font-bold">Kolej Matrikulasi Perak</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full xl:w-auto justify-start xl:justify-end overflow-x-visible flex-wrap">
          <RoleSwitcher 
            currentRole={currentUserRole} 
            onRoleChange={handleRoleChange} 
            applications={applications} 
          />
        </div>
      </header>

      {/* Navigation Sub-header */}
      <nav className="bg-slate-900 text-white px-4 sm:px-8 py-2 sticky top-[67px] z-40 shadow-md print:hidden">
        <div className="container mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-0.5">
            <button 
              onClick={() => setCurrentView('home')}
              className={`text-xs font-bold flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${currentView === 'home' ? 'text-white bg-blue-600 shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
            >
              <i className="fas fa-university text-xs text-blue-400"></i>
              Portal Utama
            </button>
            <button 
              onClick={() => {
                setDashboardResetKey(k => k + 1);
                setCurrentView('applications');
              }}
              className={`text-xs font-bold flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${currentView === 'applications' ? 'text-white bg-blue-600 shadow-xs' : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}
            >
              <i className="fas fa-folder-open text-xs text-blue-400"></i>
              {currentUserRole === UserRole.APPLICANT
                ? 'Senarai Kertas Kerja'
                : currentUserRole === UserRole.DIRECTOR
                ? 'Dashboard Timbalan Pengarah'
                : currentUserRole === UserRole.HOD
                ? 'Dashboard Ketua Jabatan'
                : 'Papan Semakan & Penilaian'}
            </button>
            {currentUserRole === UserRole.APPLICANT && (
              <button 
                onClick={() => {
                  setEditingApp(null);
                  setCurrentView('create');
                }}
                className={`text-xs font-bold flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${currentView === 'create' && !editingApp ? 'text-white bg-emerald-600 shadow-xs' : 'text-emerald-300 hover:text-white hover:bg-slate-800'}`}
              >
                <i className="fas fa-file-signature text-xs"></i>
                Hantar Permohonan Baharu
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => syncWithCloud(false)}
              disabled={isManualSyncing}
              title="Segar Semula Data Dari Google Sheets"
              className="text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <i className={`fas fa-sync-alt text-blue-400 text-xs ${isManualSyncing ? 'animate-spin' : ''}`}></i>
              <span className="hidden sm:inline">{isManualSyncing ? 'Menyegerak...' : 'Sync/Segar Google Sheet'}</span>
            </button>

            <button
              onClick={() => setIsManualModalOpen(true)}
              className="text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <i className="fas fa-book-open text-amber-400 text-xs"></i>
              <span className="hidden sm:inline">Manual Pengguna</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl print:max-w-none print:p-0">
        {renderContent()}
      </main>

      <footer className="bg-white border-t border-slate-200/80 py-8 text-slate-500 text-xs print:hidden">
        <div className="container mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img 
              src="https://upload.wikimedia.org/wikipedia/ms/7/71/Kolej_Matrikulasi_Perak.png" 
              alt="KMPk Logo" 
              className="h-11 w-auto drop-shadow-xs"
            />
            <div className="text-left">
              <p className="font-bold text-slate-800 text-sm">Kolej Matrikulasi Perak</p>
              <p className="text-xs text-slate-500 font-medium">Dibangunkan oleh JK MJPKKM & JK Inovasi/KIK</p>
            </div>
          </div>

          <div className="text-center md:text-right space-y-1">
            <p className="font-medium text-slate-600">
              Sistem ResFlow &copy; {new Date().getFullYear()} • Hak Cipta Terpelihara JK MJPKKM & JK Inovasi/KIK
            </p>
            <div className="flex items-center justify-center md:justify-end gap-3 pt-0.5">
              {syncStatus === 'connected' ? (
                <span className="text-[10px] flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Pangkalan Data Cloud Aktif • {applications.length} Rekod Disegerak {lastSyncTime ? `(${lastSyncTime.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' })})` : ''}
                </span>
              ) : syncStatus === 'syncing' ? (
                <span className="text-[10px] flex items-center gap-1.5 text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  <i className="fas fa-sync-alt animate-spin text-[10px] text-blue-600"></i>
                  Sedang Menyegerak dengan Cloud Google Sheets...
                </span>
              ) : (
                <button
                  onClick={() => syncWithCloud(false)}
                  className="text-[10px] flex items-center gap-1.5 text-rose-700 font-bold bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg border border-rose-200 cursor-pointer transition-all"
                >
                  <i className="fas fa-exclamation-circle text-rose-600"></i>
                  Ralat Sambungan Cloud • Klik untuk Cuba Semula
                </button>
              )}
            </div>
          </div>
        </div>
      </footer>

      <UserManualModal 
        isOpen={isManualModalOpen} 
        onClose={() => setIsManualModalOpen(false)} 
      />
    </div>
  );
};

export default App;
