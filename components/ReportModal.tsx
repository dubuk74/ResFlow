import React, { useState } from 'react';
import { Application, ApplicationStatus, ReviewRating, getCommitteeName, getExaminerName } from '../types';

interface ReportModalProps {
  app: Application;
  onClose: () => void;
  initialTab?: 'all' | 'applicant' | 'full';
}

export const ReportModal: React.FC<ReportModalProps> = ({ app, onClose, initialTab = 'full' }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'applicant' | 'full'>(initialTab);

  const handlePrint = () => {
    window.print();
  };

  const reviews = Object.entries(app.reviews || {});

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 overflow-y-auto p-2 sm:p-6 flex justify-center items-start print:static print:bg-white print:p-0 print:block print:overflow-visible print:z-auto print-modal-overlay">
      
      {/* Print CSS Rules to isolate the modal content when printing */}
      <style>{`
        @media print {
          /* Hide all page content except the modal */
          body * {
            visibility: hidden !important;
          }

          /* Explicitly display the modal and all its printable children */
          .print-modal-overlay,
          .print-modal-content,
          .print-modal-content * {
            visibility: visible !important;
          }

          body, html {
            background-color: #ffffff !important;
            color: #000000 !important;
            overflow: visible !important;
            height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .print-hidden,
          .print-hidden * {
            display: none !important;
            visibility: hidden !important;
          }

          .print-modal-overlay {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            overflow: visible !important;
            height: auto !important;
            max-height: none !important;
            z-index: 99999 !important;
          }

          .print-modal-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: none !important;
            overflow: visible !important;
            border-radius: 0 !important;
            height: auto !important;
            max-height: none !important;
          }

          .print-page-break {
            page-break-before: always;
            break-before: page;
          }

          .print-avoid-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-2 sm:my-8 border border-slate-200 print:shadow-none print:border-none print:m-0 print:w-full print:max-w-none print:rounded-none print:overflow-visible print-modal-content">
        
        {/* Action & Navigation Bar (Hidden when printing) */}
        <div className="bg-slate-900 text-white p-4 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 print-hidden sticky top-0 z-10 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold">
              <i className="fas fa-file-invoice text-white text-base"></i>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">Laporan & Dokumentasi Permohonan</h3>
              <p className="text-[11px] text-slate-400">ID #{app.id} - {app.applicantName}</p>
            </div>
          </div>

          {/* Tab Selector Buttons */}
          <div className="flex bg-slate-800/90 p-1 rounded-xl border border-slate-700/80 gap-1 self-center">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <i className="fas fa-layer-group text-[10px]"></i> Semua Bahagian
            </button>
            <button
              onClick={() => setActiveTab('applicant')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'applicant'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <i className="fas fa-user-edit text-[10px]"></i> Bahagian Pemohon
            </button>
            <button
              onClick={() => setActiveTab('full')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'full'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <i className="fas fa-clipboard-check text-[10px]"></i> Laporan Penuh Kelulusan
            </button>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <i className="fas fa-print"></i> Cetak {activeTab === 'applicant' ? 'Bahagian Pemohon' : activeTab === 'full' ? 'Laporan Penuh' : 'Dokumen Lengkap'}
            </button>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-6 sm:p-10 space-y-8 print:p-0 text-slate-800 bg-white">
          
          {/* Header & Letterhead */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print-avoid-break">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-900 text-white rounded-lg flex items-center justify-center font-bold text-xl">
                  <i className="fas fa-microscope"></i>
                </div>
                <div>
                  <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide">SISTEM ALIRAN KELULUSAN PENYELIDIKAN & INOVASI</h1>
                  <p className="text-xs font-semibold text-slate-500">RE-S FLOW APPROVAL SYSTEM - JAWATANKUASA MJPKKM & INOVASI</p>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right border-l-2 sm:border-l-0 sm:border-r-0 border-indigo-500 pl-3 sm:pl-0">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                {activeTab === 'applicant' ? 'DOKUMEN BAHAGIAN PEMOHON' : activeTab === 'full' ? 'LAPORAN PENUH KELULUSAN' : 'DOKUMEN LENGKAP PERMOHONAN'}
              </span>
              <span className="font-mono font-bold text-lg text-indigo-900">#{app.id}</span>
              <span className="text-xs block text-slate-500 mt-0.5">Tarikh Cetakan: {new Date().toLocaleDateString('ms-MY', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* ========================================== */}
          {/* BAHAGIAN PEMOHON (APPLICANT SECTION)        */}
          {/* ========================================== */}
          {(activeTab === 'all' || activeTab === 'applicant') && (
            <div className="space-y-8">
              <div className="border-b border-indigo-200 pb-2 print:border-slate-300 flex items-center justify-between">
                <div>
                  <span className="bg-indigo-900 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded tracking-wider">
                    SEKSYEN 1
                  </span>
                  <h2 className="text-base font-black text-indigo-950 uppercase tracking-wide mt-1 inline-block ml-2">
                    BAHAGIAN PEMOHON & MANUSKRIP
                  </h2>
                </div>
                {activeTab === 'all' && <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">(Bahagian 1 daripada 2)</span>}
              </div>

              {/* Section 1: Research & Event Information */}
              <div className="space-y-4 print-avoid-break">
                <h2 className="text-sm font-bold text-indigo-950 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-indigo-600 flex items-center gap-2">
                  <i className="fas fa-book-open text-indigo-600"></i> 1. Maklumat Kertas Penyelidikan & Pertandingan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block mb-1">Tajuk Penyelidikan / Inovasi:</span>
                    <p className="text-sm font-black text-slate-900">{app.researchTitle}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block">Jawatankuasa Sasaran:</span>
                    <span className="font-bold text-indigo-700 text-sm">
                      {app.targetCommittee === 'MJPKKM' ? 'JK MJPKKM (Pensyarah)' : 'JK INOVASI (Pensyarah Pembimbing Pelajar)'}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block">Status Permohonan Terkini:</span>
                    <span className="font-black text-slate-800 uppercase text-xs px-2.5 py-1 bg-white rounded border border-slate-300 inline-block mt-1">
                      {app.status}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block">Nama Acara / Pertandingan:</span>
                    <span className="font-semibold text-slate-800">{app.eventName || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block">Peringkat & Tarikh Acara:</span>
                    <span className="font-semibold text-slate-800">
                      {app.eventLevel ? `PERINGKAT ${
                        app.eventLevel === 'State' ? 'NEGERI' :
                        app.eventLevel === 'National' ? 'KEBANGSAAN' :
                        (app.eventLevel === 'International (Dalam Negara)' || app.eventLevel === 'International (Dalam Negeri)') ? 'ANTARABANGSA (DALAM NEGARA)' :
                        (app.eventLevel === 'International (Luar Negara)' || app.eventLevel === 'International (Luar Negeri)') ? 'ANTARABANGSA (LUAR NEGARA)' :
                        'ANTARABANGSA'
                      }` : 'N/A'}
                      {app.eventDate ? ` (${new Date(app.eventDate).toLocaleDateString('ms-MY')}${app.eventEndDate ? ` hingga ${new Date(app.eventEndDate).toLocaleDateString('ms-MY')}` : ''})` : ''}
                    </span>
                  </div>
                  {app.eventLocation && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-500 block">Lokasi Pertandingan:</span>
                      <span className="font-semibold text-slate-800">{app.eventLocation}</span>
                    </div>
                  )}
                  {app.achievementStatus && (
                    <div className="sm:col-span-2 bg-gradient-to-r from-amber-50 to-amber-100/80 p-3.5 rounded-xl border border-amber-300">
                      <span className="font-extrabold text-amber-900 block text-xs uppercase tracking-wider mb-0.5">🏆 Pencapaian / Anugerah Acara:</span>
                      <p className="font-black text-amber-950 text-sm">{app.achievementStatus}</p>
                      {app.achievementDetails && (
                        <p className="text-slate-700 font-medium text-xs mt-1 bg-white/70 p-2 rounded border border-amber-200/60">
                          {app.achievementDetails}
                        </p>
                      )}
                      {app.achievementDate && (
                        <span className="text-[10px] text-amber-800 font-bold block mt-1">
                          Tarikh Kemas Kini Keputusan: {new Date(app.achievementDate).toLocaleDateString('ms-MY')}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="sm:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block">Pautan Dokumen / Manuskrip:</span>
                    <a href={app.researchLink} target="_blank" rel="noreferrer" className="text-indigo-600 font-semibold underline break-all">
                      {app.researchLink}
                    </a>
                  </div>
                </div>
              </div>

              {/* Section 2: Applicant & Team Details */}
              <div className="space-y-4 print-avoid-break">
                <h2 className="text-sm font-bold text-indigo-950 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-indigo-600 flex items-center gap-2">
                  <i className="fas fa-users text-indigo-600"></i> 2. Maklumat Pemohon & Ahli Pasukan
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block">Nama Ketua Pemohon:</span>
                    <span className="font-bold text-slate-900">{app.applicantName}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block">No. KP / Matrik:</span>
                    <span className="font-semibold text-slate-800">{app.applicantIdCard}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block">E-mel:</span>
                    <span className="font-semibold text-slate-800">{app.applicantEmail}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block">No. Telefon:</span>
                    <span className="font-semibold text-slate-800">{app.applicantPhone}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block">Tarikh Permohonan:</span>
                    <span className="font-semibold text-slate-800">{app.submissionDate ? new Date(app.submissionDate).toLocaleDateString('ms-MY') : 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-500 block">Nama Pasukan / Projek:</span>
                    <span className="font-semibold text-slate-800">{app.teamName || 'N/A'}</span>
                  </div>
                </div>

                {/* Team Members Table */}
                {app.teamMembers && app.teamMembers.length > 0 && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-2.5">#</th>
                          <th className="p-2.5">Nama Ahli Pasukan</th>
                          <th className="p-2.5">No. KP / Matrik</th>
                          <th className="p-2.5">Jawatan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {app.teamMembers.map((m, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-2.5 font-semibold text-slate-800">{m.name}</td>
                            <td className="p-2.5 text-slate-600">{m.idCard}</td>
                            <td className="p-2.5 text-slate-600">{m.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* LAPORAN PENUH KELULUSAN (APPROVAL SECTION)   */}
          {/* ========================================== */}
          {(activeTab === 'all' || activeTab === 'full') && (
            <div className={`space-y-8 pt-2 ${activeTab === 'all' ? 'print-page-break' : ''}`}>
              <div className="border-b border-purple-200 pb-2 print:border-slate-300 flex items-center justify-between">
                <div>
                  <span className="bg-purple-900 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded tracking-wider">
                    {activeTab === 'all' ? 'SEKSYEN 2' : 'SEKSYEN KELULUSAN'}
                  </span>
                  <h2 className="text-base font-black text-indigo-950 uppercase tracking-wide mt-1 inline-block ml-2">
                    LAPORAN PENUH KELULUSAN & JEJAK AUDIT
                  </h2>
                </div>
                {activeTab === 'all' && <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">(Bahagian 2 daripada 2)</span>}
              </div>

              {/* Ringkasan Permohonan Context Box for Standalone Laporan Penuh view */}
              {activeTab === 'full' && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4 print-avoid-break">
                  <div className="sm:col-span-2">
                    <span className="font-bold text-slate-500 block text-[11px] uppercase">Tajuk Penyelidikan / Inovasi:</span>
                    <p className="text-sm font-black text-slate-900">{app.researchTitle}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block text-[11px] uppercase">Ketua Pemohon:</span>
                    <span className="font-semibold text-slate-800">{app.applicantName} ({app.applicantIdCard})</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block text-[11px] uppercase">Jawatankuasa Sasaran:</span>
                    <span className="font-bold text-indigo-700">{getCommitteeName(app)} ({app.targetCommittee === 'INOVASI' ? 'Pensyarah Pembimbing' : 'Pensyarah'})</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block text-[11px] uppercase">Nama & Peringkat Acara:</span>
                    <span className="font-semibold text-slate-800">
                      {app.eventName || 'N/A'} {app.eventLevel ? `(${
                        app.eventLevel === 'State' ? 'Negeri' :
                        app.eventLevel === 'National' ? 'Kebangsaan' :
                        (app.eventLevel === 'International (Dalam Negara)' || app.eventLevel === 'International (Dalam Negeri)') ? 'Antarabangsa (Dalam Negara)' :
                        (app.eventLevel === 'International (Luar Negara)' || app.eventLevel === 'International (Luar Negeri)') ? 'Antarabangsa (Luar Negara)' :
                        'Antarabangsa'
                      })` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block text-[11px] uppercase">Status Permohonan Terkini:</span>
                    <span className="font-extrabold text-slate-900 uppercase bg-white px-2 py-0.5 rounded border border-slate-300 inline-block mt-0.5">
                      {app.status}
                    </span>
                  </div>
                  {app.achievementStatus && (
                    <div className="sm:col-span-2 bg-gradient-to-r from-amber-50 to-amber-100 p-3 rounded-xl border border-amber-300 mt-1">
                      <span className="font-extrabold text-amber-900 block text-xs uppercase tracking-wider">🏆 Pencapaian / Anugerah Acara:</span>
                      <p className="font-black text-amber-950 text-sm mt-0.5">{app.achievementStatus}</p>
                      {app.achievementDetails && (
                        <p className="text-slate-700 text-xs mt-1 bg-white/80 p-2 rounded border border-amber-200">
                          {app.achievementDetails}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Section 3: Full Approval & Review Audit Trail */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider bg-slate-100 p-2.5 rounded-lg border-l-4 border-purple-600 flex items-center gap-2">
                  <i className="fas fa-clipboard-check text-purple-600"></i> Rekod Kelulusan & Jejak Semakan Pentadbiran
                </h3>

                <div className="space-y-4 text-xs">
                  
                  {/* Step A: Submission */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 print-avoid-break">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-800 uppercase text-[11px]">A. Penyerahan Permohonan</span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {app.submissionDate ? new Date(app.submissionDate).toLocaleString('ms-MY') : 'N/A'}
                      </span>
                    </div>
                    <p className="text-slate-600">Disemak dan dihantar oleh {app.applicantName}.</p>
                  </div>

                  {/* Step B: Secretary Assignment */}
                  {(() => {
                    const actualExaminer = getExaminerName(app);
                    const isAssigned = Boolean(
                      actualExaminer ||
                      app.assignedSecretary || 
                      app.secretaryAssignmentDate || 
                      Object.keys(app.reviews || {}).length > 0 ||
                      (app.status !== ApplicationStatus.SUBMITTED && app.status !== ApplicationStatus.SECRETARY_PENDING)
                    );
                    const secretaryName = app.assignedSecretary || (getCommitteeName(app) === 'JK INOVASI' ? 'Setiausaha JK INOVASI' : 'Setiausaha JK MJPKKM');
                    const examinerName = actualExaminer || 'Penilai Belum Dilantik';
                    const formattedDate = app.secretaryAssignmentDate 
                      ? new Date(app.secretaryAssignmentDate).toLocaleString('ms-MY')
                      : (isAssigned ? (app.submissionDate ? new Date(app.submissionDate).toLocaleString('ms-MY') : 'SELESAI DILANTIK') : 'BELUM DILANTIK');

                    return (
                      <div className={`p-4 rounded-xl border print-avoid-break ${isAssigned ? 'border-purple-200 bg-purple-50/50' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-purple-950 uppercase text-[11px]">B. Lantikan Pemeriksa oleh Setiausaha</span>
                          <span className={`text-[10px] font-bold ${isAssigned ? 'text-purple-700 bg-purple-100 px-2 py-0.5 rounded' : 'text-slate-500'}`}>
                            {formattedDate}
                          </span>
                        </div>
                        {isAssigned ? (
                          <div className="space-y-1 text-slate-700">
                            <p><span className="font-semibold">Setiausaha:</span> {secretaryName}</p>
                            <p><span className="font-semibold">Pemeriksa Dilantik:</span> {examinerName}</p>
                            {app.secretaryAssignmentNotes && <p className="italic text-slate-600">"Arahan: {app.secretaryAssignmentNotes}"</p>}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">Menunggu lantikan pemeriksa oleh Setiausaha {getCommitteeName(app)}.</p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Step C: Examiner Reviews */}
                  <div className={`p-4 rounded-xl border print-avoid-break ${reviews.length > 0 ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-amber-950 uppercase text-[11px]">C. Penilaian Teknikal Pemeriksa / Penilai</span>
                      <span className={`text-[10px] font-bold ${reviews.length > 0 ? 'text-amber-800 bg-amber-100 px-2 py-0.5 rounded' : 'text-slate-500'}`}>
                        {reviews.length > 0 ? `${reviews.length} Semakan Selesai` : 'BELUM SELESAI'}
                      </span>
                    </div>
                    {reviews.length > 0 ? (
                      <div className="space-y-3">
                        {reviews.map(([key, rev]) => {
                          const displayReviewerName = (rev.reviewerName && !rev.reviewerName.startsWith('Role Reviewer') && !rev.reviewerName.startsWith('UserRole'))
                            ? rev.reviewerName
                            : (getExaminerName(app) || 'Penilai Dilantik');
                          return (
                            <div key={key} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-bold text-slate-800">{displayReviewerName}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  rev.status === ReviewRating.EXCELLENT ? 'bg-emerald-100 text-emerald-800' :
                                  rev.status === ReviewRating.GOOD ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  SKALA: {rev.status === ReviewRating.EXCELLENT ? 'CEMERLANG' : rev.status === ReviewRating.GOOD ? 'BAIK' : 'PENAMBAHBAIKAN'}
                                </span>
                              </div>
                              <p className="text-slate-700 italic my-1">"{rev.comments}"</p>
                              <p className="text-[10px] text-slate-400">Tarikh Semakan: {new Date(rev.date).toLocaleString('ms-MY')}</p>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">Dalam proses penilaian pemeriksa/penilai.</p>
                    )}
                  </div>

                  {/* Step D: Secretary Endorsement */}
                  {(() => {
                    const isEndorsed = Boolean(
                      app.secretaryEndorsementStatus || 
                      app.secretaryEndorsementDate || 
                      app.status === ApplicationStatus.HOD_PENDING || 
                      app.status === ApplicationStatus.DIRECTOR_PENDING || 
                      app.status === ApplicationStatus.APPROVED
                    );
                    const endorserName = app.secretaryEndorsementName || app.assignedSecretary || (app.targetCommittee === 'MJPKKM' ? 'Setiausaha JK MJPKKM' : 'Setiausaha JK INOVASI');
                    const endorsementDate = app.secretaryEndorsementDate 
                      ? new Date(app.secretaryEndorsementDate).toLocaleString('ms-MY')
                      : (isEndorsed ? 'DISOKONG KEPADA HOD' : 'BELUM DISOKONG');

                    return (
                      <div className={`p-4 rounded-xl border print-avoid-break ${isEndorsed ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-slate-50'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-blue-950 uppercase text-[11px]">D. Sokongan Setiausaha Jawatankuasa</span>
                          <span className={`text-[10px] font-bold ${isEndorsed ? 'text-blue-700 bg-blue-100 px-2 py-0.5 rounded' : 'text-slate-500'}`}>
                            {endorsementDate}
                          </span>
                        </div>
                        {isEndorsed ? (
                          <div className="space-y-1 text-slate-700">
                            <p><span className="font-semibold">Pegawai / Setiausaha:</span> {endorserName}</p>
                            <p><span className="font-semibold">Keputusan Sokongan:</span> <span className="font-bold text-blue-700">{app.secretaryEndorsementStatus === 'Returned' ? 'DIKEMBALIKAN UNTUK SEMAKAN' : 'DISOKONG KEPADA HOD'}</span></p>
                            {app.secretaryEndorsementComments && <p className="italic text-slate-600">"{app.secretaryEndorsementComments}"</p>}
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">Menunggu sokongan semula daripada Setiausaha Jawatankuasa.</p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Step E: HOD Support */}
                  {(() => {
                    const isHodDone = Boolean(
                      app.hodStatus || 
                      app.hodDate || 
                      app.status === ApplicationStatus.DIRECTOR_PENDING || 
                      app.status === ApplicationStatus.APPROVED
                    );
                    const hodFormattedDate = app.hodDate 
                      ? new Date(app.hodDate).toLocaleString('ms-MY')
                      : (isHodDone ? 'SELESAI SOKONGAN' : 'BELUM DISOKONG');

                    return (
                      <div className={`p-4 rounded-xl border print-avoid-break ${isHodDone ? (app.hodStatus === 'Unsupported' ? 'border-rose-200 bg-rose-50/40' : 'border-emerald-200 bg-emerald-50/40') : 'border-slate-200 bg-slate-50'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-slate-900 uppercase text-[11px]">E. Sokongan Ketua Jabatan (HOD)</span>
                          <span className={`text-[10px] font-bold ${isHodDone ? 'text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded' : 'text-slate-500'}`}>
                            {hodFormattedDate}
                          </span>
                        </div>
                        {isHodDone ? (
                          <div className="space-y-1 text-slate-700">
                            <p><span className="font-semibold">Ketua Jabatan:</span> {app.hodName || 'Ketua Jabatan'}</p>
                            <p>
                              <span className="font-semibold">Status Sokongan:</span>{' '}
                              <span className={`font-bold ${app.hodStatus === 'Unsupported' ? 'text-rose-700' : 'text-emerald-700'}`}>
                                {app.hodStatus === 'Unsupported' ? 'TIDAK DISOKONG' : 'DISOKONG'}
                              </span>
                            </p>
                            <p className="italic text-slate-600">"{app.hodComments || 'Tiada ulasan.'}"</p>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">Menunggu sokongan Ketua Jabatan.</p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Step F: Director Approval */}
                  {(() => {
                    const isDirectorDone = Boolean(
                      app.directorStatus || 
                      app.directorDate || 
                      app.status === ApplicationStatus.APPROVED || 
                      app.status === ApplicationStatus.REJECTED
                    );
                    const directorFormattedDate = app.directorDate 
                      ? new Date(app.directorDate).toLocaleString('ms-MY')
                      : (isDirectorDone ? 'SELESAI KELULUSAN' : 'BELUM DILULUSKAN');

                    return (
                      <div className={`p-4 rounded-xl border print-avoid-break ${isDirectorDone ? (app.directorStatus === 'Approved' || app.status === ApplicationStatus.APPROVED ? 'border-indigo-300 bg-indigo-50/50' : 'border-rose-200 bg-rose-50/40') : 'border-slate-200 bg-slate-50'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-indigo-950 uppercase text-[11px]">F. Kelulusan Akhir Timbalan Pengarah</span>
                          <span className={`text-[10px] font-bold ${isDirectorDone ? 'text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded' : 'text-slate-500'}`}>
                            {directorFormattedDate}
                          </span>
                        </div>
                        {isDirectorDone ? (
                          <div className="space-y-1 text-slate-700">
                            <p><span className="font-semibold">Timbalan Pengarah:</span> {app.directorName || 'Timbalan Pengarah'}</p>
                            <p>
                              <span className="font-semibold">Keputusan Akhir:</span>{' '}
                              <span className={`font-black text-sm ${app.directorStatus === 'Approved' || app.status === ApplicationStatus.APPROVED ? 'text-indigo-800' : 'text-rose-700'}`}>
                                {app.directorStatus === 'Approved' || app.status === ApplicationStatus.APPROVED ? 'DILULUSKAN KESELURUHAN' : 'TIDAK DILULUSKAN'}
                              </span>
                            </p>
                            <p className="italic text-slate-600">"{app.directorComments || 'Tiada ulasan.'}"</p>
                          </div>
                        ) : (
                          <p className="text-slate-400 italic">Menunggu kelulusan akhir Timbalan Pengarah.</p>
                        )}
                      </div>
                    );
                  })()}

                </div>
              </div>

              {/* Verification & Footer Stamps */}
              <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs text-slate-600 print-avoid-break">
                <div className="p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                  <p className="font-bold text-slate-800 mb-8">PENGESAHAN URUS SETIA / SETIAUSAHA</p>
                  <div className="border-b border-slate-400 w-3/4 mx-auto mb-1"></div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Tandatangan & Cop Rasmi</p>
                </div>
                <div className="p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50">
                  <p className="font-bold text-slate-800 mb-8">PENGESAHAN PENGURUSAN TERTINGGI</p>
                  <div className="border-b border-slate-400 w-3/4 mx-auto mb-1"></div>
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Tandatangan Timbalan Pengarah</p>
                </div>
              </div>
            </div>
          )}

          <div className="text-center text-[10px] text-slate-400 pt-4 border-t border-slate-100">
            Laporan ini dijana secara automatik oleh Sistem Re-S Flow Approval System. Sebarang pindaan tanpa kebenaran adalah tidak sah.
          </div>

        </div>

      </div>
    </div>
  );
};
