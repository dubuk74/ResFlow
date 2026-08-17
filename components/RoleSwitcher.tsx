import React, { useState } from 'react';
import { UserRole, Application, ApplicationStatus, REVIEWER_LIST } from '../types';
import { RolePasswordModal } from './RolePasswordModal';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  applications: Application[];
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleChange, applications }) => {
  const [modalRole, setModalRole] = useState<UserRole | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Authenticated roles in current session (so user doesn't have to retype password constantly)
  const [authenticatedRoles, setAuthenticatedRoles] = useState<Record<string, boolean>>({});

  // Roles that require password protection
  const PROTECTED_ROLES: UserRole[] = [
    UserRole.DIRECTOR,
    UserRole.HOD,
    UserRole.SECRETARY_1,
    UserRole.SECRETARY_2,
    UserRole.REVIEWER_1,
    UserRole.REVIEWER_2,
  ];

  const getCount = (role: UserRole) => {
    if (role === UserRole.APPLICANT) return 0;

    if (role === UserRole.SECRETARY_1 || role === UserRole.SECRETARY_2) {
      const committeeTarget = role === UserRole.SECRETARY_1 ? 'MJPKKM' : 'INOVASI';
      return applications.filter(app => {
        const isTargetCommittee = app.targetCommittee === committeeTarget || app.selectedReviewers?.some(r => r.includes(committeeTarget));
        const isPending = app.status === ApplicationStatus.SECRETARY_PENDING || 
                          app.status === ApplicationStatus.SECRETARY_REVIEW ||
                          app.status === ApplicationStatus.SUBMITTED;
        return isTargetCommittee && isPending;
      }).length;
    }
    
    if (REVIEWER_LIST.includes(role)) {
      return applications.filter(app => 
        app.selectedReviewers?.includes(role) && 
        app.status === ApplicationStatus.UNDER_REVIEW &&
        !app.reviews[role]
      ).length;
    }
    
    if (role === UserRole.HOD) {
      return applications.filter(app => app.status === ApplicationStatus.HOD_PENDING).length;
    }
    
    if (role === UserRole.DIRECTOR) {
      return applications.filter(app => app.status === ApplicationStatus.DIRECTOR_PENDING).length;
    }
    
    return 0;
  };

  const directorCount = getCount(UserRole.DIRECTOR);
  const hodCount = getCount(UserRole.HOD);
  const isDirectorActive = currentRole === UserRole.DIRECTOR;
  const isHodActive = currentRole === UserRole.HOD;
  const isApplicantActive = currentRole === UserRole.APPLICANT;
  const isDropdownActive = !isDirectorActive && !isHodActive && !isApplicantActive;

  const handleSelectRole = (role: UserRole) => {
    if (role === currentRole) return;

    // Applicant is open access
    if (role === UserRole.APPLICANT) {
      onRoleChange(role);
      return;
    }

    // Check if role is password protected and not already authenticated in this session
    if (PROTECTED_ROLES.includes(role) && !authenticatedRoles[role]) {
      setModalRole(role);
      setIsModalOpen(true);
    } else {
      onRoleChange(role);
    }
  };

  const handleAuthSuccess = (role: UserRole) => {
    setAuthenticatedRoles(prev => ({ ...prev, [role]: true }));
    onRoleChange(role);
  };

  const renderOption = (role: UserRole, label: string) => {
    const count = getCount(role);
    return (
      <option key={role} value={role}>
        {label} {count > 0 ? `(${count})` : ''} {!authenticatedRoles[role] ? '🔒' : ''}
      </option>
    );
  };

  return (
    <>
      <div className="relative flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* 1. DEDICATED SEPARATE TIMBALAN PENGARAH BUTTON */}
        <button
          type="button"
          onClick={() => handleSelectRole(UserRole.DIRECTOR)}
          className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-extrabold transition-all inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
            isDirectorActive
              ? 'bg-slate-900 text-white ring-2 ring-indigo-500 shadow-indigo-900/20'
              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 hover:border-indigo-300'
          }`}
          title="Buka Dashboard Timbalan Pengarah (Dilindungi Kata Laluan)"
        >
          <span className="inline-block">Timbalan Pengarah</span>
          {!authenticatedRoles[UserRole.DIRECTOR] && !isDirectorActive && (
            <i className="fas fa-lock text-[10px] text-indigo-400 opacity-80 shrink-0"></i>
          )}
          {directorCount > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
              isDirectorActive ? 'bg-amber-400 text-slate-950' : 'bg-indigo-600 text-white animate-pulse'
            }`}>
              {directorCount}
            </span>
          )}
        </button>

        {/* 2. DEDICATED SEPARATE KETUA JABATAN BUTTON */}
        <button
          type="button"
          onClick={() => handleSelectRole(UserRole.HOD)}
          className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-extrabold transition-all inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
            isHodActive
              ? 'bg-teal-900 text-white ring-2 ring-teal-400 shadow-teal-900/20'
              : 'bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-200 hover:border-teal-300'
          }`}
          title="Buka Dashboard Ketua Jabatan (Dilindungi Kata Laluan)"
        >
          <span className="inline-block">Ketua Jabatan</span>
          {!authenticatedRoles[UserRole.HOD] && !isHodActive && (
            <i className="fas fa-lock text-[10px] text-teal-500 opacity-80 shrink-0"></i>
          )}
          {hodCount > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
              isHodActive ? 'bg-amber-400 text-slate-950' : 'bg-teal-600 text-white animate-pulse'
            }`}>
              {hodCount}
            </span>
          )}
        </button>

        {/* 3. DEDICATED SEPARATE PEMOHON BUTTON */}
        <button
          type="button"
          onClick={() => handleSelectRole(UserRole.APPLICANT)}
          className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-extrabold transition-all inline-flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs whitespace-nowrap shrink-0 ${
            isApplicantActive
              ? 'bg-blue-700 text-white ring-2 ring-blue-400 shadow-blue-700/20'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-950 border border-blue-200 hover:border-blue-300'
          }`}
          title="Buka Portal & Permohonan Pemohon"
        >
          <span className="inline-block">Pemohon</span>
        </button>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-slate-200 hidden sm:block shrink-0"></div>

        {/* 4. URUS SETIA & PENILAI DROPDOWN */}
        <div className="inline-flex items-center gap-2 shrink-0">
          <div className="relative group">
            <select 
              value={isDropdownActive ? currentRole : ''}
              onChange={(e) => {
                if (e.target.value) {
                  handleSelectRole(e.target.value as UserRole);
                }
              }}
              className={`appearance-none rounded-xl sm:rounded-full px-3 py-1.5 sm:px-4 sm:py-2 pr-8 sm:pr-9 text-xs sm:text-sm font-medium cursor-pointer transition-all outline-none border shrink-0 whitespace-nowrap ${
                isDropdownActive
                  ? 'bg-indigo-900 border-indigo-700 text-white font-bold ring-2 ring-indigo-400'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {!isDropdownActive && (
                <option value="" disabled>
                  Urus Setia / Penilai...
                </option>
              )}
              <optgroup label="Urus Setia (Setiausaha)">
                {renderOption(UserRole.SECRETARY_1, 'Setiausaha JK MJPKKM')}
                {renderOption(UserRole.SECRETARY_2, 'Setiausaha JK INOVASI')}
              </optgroup>
              <optgroup label="Panel Penilai">
                {renderOption(UserRole.REVIEWER_1, 'Penilai JK MJPKKM')}
                {renderOption(UserRole.REVIEWER_2, 'Penilai JK INOVASI')}
              </optgroup>
            </select>
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDropdownActive ? 'text-white' : 'text-slate-400'}`}>
              <i className="fas fa-chevron-down text-xs"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Password Authentication Modal */}
      <RolePasswordModal
        role={modalRole}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalRole(null);
        }}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default RoleSwitcher;
