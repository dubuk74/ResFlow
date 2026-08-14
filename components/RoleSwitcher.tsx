
import React, { useState } from 'react';
import { UserRole, Application, ApplicationStatus, REVIEWER_LIST, SECRETARY_LIST } from '../types';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  applications: Application[];
}

const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleChange, applications }) => {
  const [isPrompting, setIsPrompting] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  // Configuration for passwords
  const ROLE_PASSWORDS: Record<string, string> = {};

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

  const handleChange = (role: UserRole) => {
    if (ROLE_PASSWORDS[role]) {
      setPendingRole(role);
      setIsPrompting(true);
      setPassword('');
      setError(false);
    } else {
      onRoleChange(role);
    }
  };

  const verifyPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingRole && password === ROLE_PASSWORDS[pendingRole]) {
      onRoleChange(pendingRole);
      setIsPrompting(false);
      setPendingRole(null);
      setPassword('');
    } else {
      setError(true);
    }
  };

  const renderOption = (role: UserRole, label: string, icon: string) => {
    const count = getCount(role);
    return (
      <option key={role} value={role}>
        {icon} {label} {count > 0 ? `(${count})` : ''}
      </option>
    );
  };

  return (
    <div className="relative flex flex-wrap items-center gap-2">
      {/* 1. DEDICATED SEPARATE TIMBALAN PENGARAH BUTTON */}
      <button
        type="button"
        onClick={() => onRoleChange(UserRole.DIRECTOR)}
        className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
          isDirectorActive
            ? 'bg-slate-900 text-white ring-2 ring-indigo-500 shadow-indigo-900/20'
            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 hover:border-indigo-300'
        }`}
        title="Buka Dashboard Timbalan Pengarah"
      >
        <span className="text-sm">🎓</span>
        <span>Timbalan Pengarah</span>
        {directorCount > 0 && (
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
            isDirectorActive ? 'bg-amber-400 text-slate-950' : 'bg-indigo-600 text-white animate-pulse'
          }`}>
            {directorCount}
          </span>
        )}
      </button>

      {/* 2. DEDICATED SEPARATE KETUA JABATAN BUTTON */}
      <button
        type="button"
        onClick={() => onRoleChange(UserRole.HOD)}
        className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
          isHodActive
            ? 'bg-teal-900 text-white ring-2 ring-teal-400 shadow-teal-900/20'
            : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 hover:border-teal-300'
        }`}
        title="Buka Dashboard Ketua Jabatan"
      >
        <span className="text-sm">🏢</span>
        <span>Ketua Jabatan</span>
        {hodCount > 0 && (
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
            isHodActive ? 'bg-amber-400 text-slate-950' : 'bg-teal-600 text-white animate-pulse'
          }`}>
            {hodCount}
          </span>
        )}
      </button>

      {/* 3. DEDICATED SEPARATE PEMOHON BUTTON */}
      <button
        type="button"
        onClick={() => onRoleChange(UserRole.APPLICANT)}
        className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer shadow-sm ${
          isApplicantActive
            ? 'bg-blue-700 text-white ring-2 ring-blue-400 shadow-blue-700/20'
            : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 hover:border-blue-300'
        }`}
        title="Buka Portal & Permohonan Pemohon"
      >
        <span className="text-sm">👤</span>
        <span>Pemohon</span>
      </button>

      {/* Divider */}
      <div className="h-6 w-[1px] bg-slate-200 hidden sm:block"></div>

      {/* 4. URUS SETIA & PENILAI DROPDOWN */}
      <div className="flex items-center gap-2">
        <div className="relative group">
          <select 
            value={isDropdownActive ? currentRole : ''}
            onChange={(e) => {
              if (e.target.value) {
                handleChange(e.target.value as UserRole);
              }
            }}
            className={`appearance-none rounded-full px-4 py-2 pr-9 text-xs sm:text-sm font-medium cursor-pointer transition-all outline-none border ${
              isDropdownActive
                ? 'bg-indigo-900 border-indigo-700 text-white font-bold ring-2 ring-indigo-400'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {!isDropdownActive && (
              <option value="" disabled>
                📋 Urus Setia / Penilai...
              </option>
            )}
            <optgroup label="Urus Setia (Setiausaha)">
              {renderOption(UserRole.SECRETARY_1, 'Setiausaha JK MJPKKM', '📋')}
              {renderOption(UserRole.SECRETARY_2, 'Setiausaha JK INOVASI', '📋')}
            </optgroup>
            <optgroup label="Panel Penilai">
              {renderOption(UserRole.REVIEWER_1, 'Penilai JK MJPKKM', '🔍')}
              {renderOption(UserRole.REVIEWER_2, 'Penilai JK INOVASI', '🔍')}
            </optgroup>
          </select>
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDropdownActive ? 'text-white' : 'text-slate-400'}`}>
            <i className="fas fa-chevron-down text-xs"></i>
          </div>
        </div>

        {isPrompting && (
          <form 
            onSubmit={verifyPassword}
            className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300"
          >
            <div className="relative">
              <input 
                type="password"
                autoFocus
                placeholder="Kata Laluan"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={`w-32 px-3 py-1.5 bg-white border ${error ? 'border-rose-500 ring-rose-100' : 'border-slate-200 focus:border-indigo-500'} rounded-lg text-xs outline-none focus:ring-4 transition-all`}
              />
              {error && <div className="absolute -top-8 left-0 right-0 text-[10px] bg-rose-600 text-white px-2 py-1 rounded text-center animate-bounce">Salah</div>}
            </div>
            <button 
              type="submit"
              className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-all"
            >
              Sahkan
            </button>
            <button 
              type="button"
              onClick={() => setIsPrompting(false)}
              className="text-slate-400 hover:text-slate-600 text-xs px-1"
            >
              <i className="fas fa-times"></i>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RoleSwitcher;
