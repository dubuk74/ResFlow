
import React from 'react';
import { Application, ApplicationStatus, getCommitteeName, getExaminerName } from '../types';

interface ApplicationCardProps {
  app: Application;
  isActive: boolean;
  onClick: () => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ app, isActive, onClick }) => {
  const getStatusColor = (status: ApplicationStatus) => {
    if (!status) return 'bg-slate-100 text-slate-700 border-slate-200';
    switch (status) {
      case ApplicationStatus.APPROVED: return 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
      case ApplicationStatus.REJECTED: return 'bg-rose-50 text-rose-800 border-rose-200 font-bold';
      case ApplicationStatus.SECRETARY_PENDING: return 'bg-purple-50 text-purple-800 border-purple-200 font-bold';
      case ApplicationStatus.UNDER_REVIEW: return 'bg-blue-50 text-blue-800 border-blue-200 font-bold';
      case ApplicationStatus.SECRETARY_REVIEW: return 'bg-sky-50 text-sky-800 border-sky-200 font-bold';
      case ApplicationStatus.HOD_PENDING: return 'bg-amber-50 text-amber-900 border-amber-300 font-bold';
      case ApplicationStatus.DIRECTOR_PENDING: return 'bg-indigo-50 text-indigo-900 border-indigo-300 font-bold';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusLabel = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.SUBMITTED:
      case ApplicationStatus.SECRETARY_PENDING: return 'Menunggu Setiausaha';
      case ApplicationStatus.UNDER_REVIEW: return 'Penilaian Panel';
      case ApplicationStatus.SECRETARY_REVIEW: return 'Semakan Setiausaha';
      case ApplicationStatus.HOD_PENDING: return 'Perakuan Ketua Jabatan';
      case ApplicationStatus.DIRECTOR_PENDING: return 'Kelulusan Timbalan Pengarah';
      case ApplicationStatus.APPROVED: return 'Diluluskan Rasmi';
      case ApplicationStatus.REJECTED: 
        return app.hodStatus === 'Unsupported' ? 'Tidak Diperakui (KJ)' : 'Ditolak';
      default: return 'Dalam Proses';
    }
  };

  const examiner = getExaminerName(app);
  const committee = getCommitteeName(app);
  const isMj = committee?.includes('MJPKKM');

  return (
    <div 
      onClick={onClick}
      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
        isActive 
          ? 'bg-blue-50/70 border-blue-400 shadow-md ring-1 ring-blue-500' 
          : 'bg-white border-slate-200/90 hover:border-blue-300 hover:shadow-xs'
      }`}
    >
      {/* Committee Left Strip Indicator */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-1.5 ${
          isMj ? 'bg-blue-600' : 'bg-amber-500'
        }`}
      />

      <div className="flex justify-between items-start mb-2.5 pl-1.5">
        <span className={`px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-wide border ${getStatusColor(app.status)}`}>
          {getStatusLabel(app.status)}
        </span>
        <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
          #{app.id?.slice(0, 8) || 'N/A'}
        </span>
      </div>

      <h4 className="font-bold text-slate-900 line-clamp-2 text-sm leading-snug pl-1.5">
        {app.researchTitle || 'Penyelidikan Tanpa Tajuk'}
      </h4>
      <p className="text-xs text-slate-600 mt-1 pl-1.5 flex items-center gap-1.5">
        <i className="fas fa-user-circle text-[11px] text-slate-400"></i>
        <span>{app.applicantName || 'Tanpa Nama'}</span>
      </p>
      
      <div className="mt-3 flex flex-wrap items-center gap-1.5 pl-1.5">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border inline-flex items-center gap-1 ${
          isMj 
            ? 'bg-blue-50 text-blue-900 border-blue-200' 
            : 'bg-amber-50 text-amber-900 border-amber-200'
        }`}>
          <i className={`${isMj ? 'fas fa-microscope' : 'fas fa-lightbulb'} text-[9px]`}></i>
          JK {committee}
        </span>
        {examiner ? (
          <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 inline-flex items-center gap-1">
            <i className="fas fa-user-check text-[8px] text-emerald-600"></i>
            {examiner}
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 italic">Penilai Belum Dilantik</span>
        )}
        {app.achievementStatus && (
          <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 inline-flex items-center gap-1">
            🏆 {app.achievementStatus}
          </span>
        )}
      </div>
      
      <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between pl-1.5">
        <div className="flex -space-x-1.5">
          {app.teamMembers?.slice(0, 3).map((m, i) => (
            <div key={i} className="w-5 h-5 rounded-full bg-slate-200 border border-white flex items-center justify-center text-[9px] font-bold text-slate-700">
              {m.name?.charAt(0) || '?'}
            </div>
          ))}
          {app.teamMembers?.length > 3 && (
            <div className="w-5 h-5 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[9px] font-bold text-slate-500">
              +{app.teamMembers.length - 3}
            </div>
          )}
        </div>
        <div className="text-[10px] font-medium text-slate-400">
          <i className="far fa-calendar-alt text-[9px] mr-1"></i>
          {app.submissionDate ? new Date(app.submissionDate).toLocaleDateString('ms-MY', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
