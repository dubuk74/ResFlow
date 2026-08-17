import React, { useState } from 'react';
import { UserRole } from '../types';

interface RolePasswordModalProps {
  role: UserRole | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

// Fixed system passwords managed exclusively via AI Studio codebase
export const SYSTEM_ROLE_PASSWORDS: Record<string, string> = {
  [UserRole.DIRECTOR]: 'kmpk',
  [UserRole.HOD]: 'kmpk',
  [UserRole.SECRETARY_1]: 'kmpk',
  [UserRole.SECRETARY_2]: 'kmpk',
  [UserRole.REVIEWER_1]: 'kmpk',
  [UserRole.REVIEWER_2]: 'kmpk',
};

export const getRolePassword = (role: UserRole): string => {
  return SYSTEM_ROLE_PASSWORDS[role] || 'kmpk';
};

export const RolePasswordModal: React.FC<RolePasswordModalProps> = ({
  role,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !role) return null;

  const roleTitle =
    role === UserRole.DIRECTOR
      ? 'Timbalan Pengarah'
      : role === UserRole.HOD
      ? 'Ketua Jabatan'
      : role === UserRole.SECRETARY_1
      ? 'Setiausaha JK MJPKKM'
      : role === UserRole.SECRETARY_2
      ? 'Setiausaha JK Inovasi'
      : role === UserRole.REVIEWER_1
      ? 'Penilai MJPKKM'
      : role === UserRole.REVIEWER_2
      ? 'Penilai Inovasi'
      : role;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = getRolePassword(role);

    if (inputPassword === correctPassword) {
      setErrorMsg('');
      setInputPassword('');
      onSuccess(role);
      onClose();
    } else {
      setErrorMsg('Kata laluan tidak sah. Sila semak semula.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-400 text-lg shadow-inner">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div>
              <h3 className="font-bold text-base text-white leading-tight">
                Pengesahan Akses Rasmi
              </h3>
              <p className="text-xs text-indigo-200/90 font-medium">
                Peranan: <span className="text-amber-300 font-bold">{roleTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setErrorMsg('');
              setInputPassword('');
              onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed">
              Ruang ini mengandungi dokumen sokongan dan keputusan kelulusan rasmi KMPk. Sila masukkan kata laluan untuk membuka dashboard <strong>{roleTitle}</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kata Laluan Akses
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  placeholder="Masukkan kata laluan..."
                  value={inputPassword}
                  onChange={(e) => {
                    setInputPassword(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 focus:border-indigo-600 focus:bg-white rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-shake">
                <i className="fas fa-exclamation-circle text-rose-500"></i>
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMsg('');
                  setInputPassword('');
                  onClose();
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <i className="fas fa-lock-open text-xs"></i>
                <span>Buka Akses</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
