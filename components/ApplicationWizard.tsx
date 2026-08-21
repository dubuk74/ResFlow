
import React, { useState } from 'react';
import { Application, ApplicationStatus, TeamMember, REVIEWER_LIST, UserRole } from '../types';

interface ApplicationWizardProps {
  initialData?: Application | null;
  onCancel: () => void;
  onSubmit: (app: Application) => void;
}

// Helper function to format and enforce phone numbers starting with '0'
export const enforceLeadingZeroPhone = (val: string): string => {
  if (!val) return '';
  let str = val.trim();
  // Strip non-digit and non-hyphen/plus characters
  str = str.replace(/[^\d+-]/g, '');
  
  if (str.startsWith('+60')) {
    str = '0' + str.slice(3);
  } else if (str.startsWith('60') && str.length > 8) {
    str = '0' + str.slice(2);
  } else if (/^[1-9]/.test(str)) {
    // Automatically prepend 0 if starts with 1-9
    str = '0' + str;
  }
  return str;
};

const ApplicationWizard: React.FC<ApplicationWizardProps> = ({ initialData, onCancel, onSubmit }) => {
  const isEditing = !!initialData;
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    applicantName: initialData?.applicantName || '',
    applicantIdCard: initialData?.applicantIdCard || '',
    applicantEmail: initialData?.applicantEmail || '',
    applicantPhone: initialData?.applicantPhone ? enforceLeadingZeroPhone(initialData.applicantPhone) : '',
    teamName: initialData?.teamName || '',
    researchTitle: initialData?.researchTitle || '',
    researchLink: initialData?.researchLink || '',
    eventName: initialData?.eventName || '',
    eventLocation: initialData?.eventLocation || '',
    eventDate: initialData?.eventDate || '',
    eventEndDate: initialData?.eventEndDate || '',
    eventLevel: (initialData?.eventLevel || 'State') as 'State' | 'National' | 'International (Dalam Negeri)' | 'International (Luar Negeri)' | 'International',
    teamMembers: initialData?.teamMembers || [],
    selectedReviewers: initialData?.selectedReviewers?.length 
      ? initialData.selectedReviewers 
      : (initialData?.targetCommittee ? (initialData.targetCommittee === 'INOVASI' ? [UserRole.REVIEWER_2] : [UserRole.REVIEWER_1]) : [])
  });

  const [newMember, setNewMember] = useState<TeamMember>({ name: '', position: '', idCard: '' });

  const addTeamMember = () => {
    if (newMember.name && newMember.idCard) {
      setFormData(prev => ({ ...prev, teamMembers: [...prev.teamMembers, newMember] }));
      setNewMember({ name: '', position: '', idCard: '' });
    }
  };

  const toggleReviewer = (reviewer: string) => {
    setFormData(prev => {
      // Changed to only allow one reviewer selection
      const exists = prev.selectedReviewers.includes(reviewer);
      if (exists) return { ...prev, selectedReviewers: [] };
      return { ...prev, selectedReviewers: [reviewer] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure phone number starts with 0
    let cleanPhone = enforceLeadingZeroPhone(formData.applicantPhone);
    if (!cleanPhone.startsWith('0') && cleanPhone.length > 0) {
      cleanPhone = '0' + cleanPhone;
    }

    if (step < 4) {
      setFormData(prev => ({ ...prev, applicantPhone: cleanPhone }));
      setStep(prev => prev + 1);
      return;
    }
    if (formData.selectedReviewers.length !== 1) {
      alert("Sila pilih tepat 1 Jawatankuasa.");
      return;
    }
    const selectedCommittee = formData.selectedReviewers[0] === UserRole.REVIEWER_1 ? 'MJPKKM' : 'INOVASI';
    const app: Application = isEditing && initialData ? {
      ...initialData,
      ...formData,
      applicantPhone: cleanPhone,
      targetCommittee: selectedCommittee,
    } : {
      ...formData,
      applicantPhone: cleanPhone,
      id: Math.random().toString(36).substr(2, 9),
      submissionDate: new Date().toISOString(),
      status: ApplicationStatus.SECRETARY_PENDING,
      targetCommittee: selectedCommittee,
      assignedSecretary: '',
      assignedExaminer: '',
      secretaryAssignmentNotes: '',
      secretaryAssignmentDate: null,
      reviews: {},
      hodStatus: null,
      hodName: '',
      hodComments: '',
      hodDate: null,
      directorStatus: null,
      directorName: '',
      directorComments: '',
      directorDate: null,
    };
    onSubmit(app);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
      <div className="bg-indigo-600 p-8 text-white">
        <h2 className="text-2xl font-bold">
          {isEditing ? 'Kemas Kini Permohonan Penyelidikan' : 'Permohonan Penyelidikan Baharu'}
        </h2>
        <p className="text-indigo-100 text-sm mt-1">
          {isEditing 
            ? `Kemas kini maklumat permohonan penyelidikan anda (ID Rujukan: ${initialData?.id}).` 
            : 'Isi butiran berikut untuk menghantar penyelidikan anda untuk kelulusan.'}
        </p>
        
        <div className="flex gap-2 mt-6">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-white' : 'bg-indigo-400'}`}></div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-bold text-slate-800 border-b pb-2">Langkah 1: Maklumat Pemohon</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nama Penuh</label>
                <input required value={formData.applicantName} onChange={e => setFormData({...formData, applicantName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nombor Kad Pengenalan</label>
                <input required value={formData.applicantIdCard} onChange={e => setFormData({...formData, applicantIdCard: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">E-mel Rasmi</label>
                <input 
                  required 
                  type="email" 
                  value={formData.applicantEmail} 
                  onChange={e => setFormData({...formData, applicantEmail: e.target.value.trim()})} 
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800" 
                />
                <p className="text-[11px] text-amber-700 bg-amber-50/80 border border-amber-200/70 rounded-md p-1.5 flex items-start gap-1.5 leading-snug">
                  <i className="fas fa-info-circle text-amber-600 mt-0.5 shrink-0 text-xs"></i>
                  <span>Sila semak alamat e-mel ditulis dengan betul bagi memastikan notifikasi status permohonan dihantar.</span>
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Nombor Telefon</label>
                <input 
                  required 
                  type="tel" 
                  value={formData.applicantPhone} 
                  onChange={e => {
                    let val = e.target.value;
                    // Auto-fix if user starts typing non-zero digits like 12... -> 012...
                    if (/^[1-9]/.test(val) && !val.startsWith('0')) {
                      val = '0' + val;
                    } else if (val.startsWith('+60')) {
                      val = '0' + val.slice(3);
                    } else if (val.startsWith('60') && val.length > 8) {
                      val = '0' + val.slice(2);
                    }
                    setFormData({...formData, applicantPhone: val});
                  }} 
                  onBlur={e => {
                    const formatted = enforceLeadingZeroPhone(e.target.value);
                    setFormData({...formData, applicantPhone: formatted});
                  }}
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
                <p className="text-[11px] text-slate-500 font-medium">
                  Pastikan nombor telefon dimulakan dengan angka <strong>0</strong> (cth: 012-3456789 / 019-1234567).
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-bold text-slate-800 border-b pb-2">Langkah 2: Ahli Pasukan</h3>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Nama Pasukan</label>
              <input value={formData.teamName} onChange={e => setFormData({...formData, teamName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl space-y-3">
              <h4 className="text-sm font-bold text-slate-600">Tambah Ahli Pasukan</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input placeholder="Nama" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} className="text-sm border border-slate-200 rounded p-2" />
                <input placeholder="Jawatan" value={newMember.position} onChange={e => setNewMember({...newMember, position: e.target.value})} className="text-sm border border-slate-200 rounded p-2" />
                <input 
                  placeholder="No. KP" 
                  value={newMember.idCard} 
                  onChange={e => setNewMember({...newMember, idCard: e.target.value})} 
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTeamMember();
                    }
                  }}
                  className="text-sm border border-slate-200 rounded p-2" 
                />
              </div>
              <button type="button" onClick={addTeamMember} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-1.5 rounded-lg text-xs font-bold transition-all">
                TAMBAH AHLI
              </button>
            </div>

            <div className="space-y-2">
              {formData.teamMembers.map((m, i) => (
                <div key={i} className="flex justify-between items-center bg-white border border-slate-100 p-3 rounded-lg shadow-sm">
                  <div>
                    <p className="text-sm font-bold">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.position} • {m.idCard}</p>
                  </div>
                  <button type="button" onClick={() => setFormData({...formData, teamMembers: formData.teamMembers.filter((_, idx) => idx !== i)})} className="text-rose-500 hover:text-rose-700">
                    <i className="fas fa-trash-alt text-sm"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-bold text-slate-800 border-b pb-2">Langkah 3: Penyelidikan & Acara</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Tajuk Penyelidikan</label>
                <input required value={formData.researchTitle} onChange={e => setFormData({...formData, researchTitle: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Pautan Kertas Atas Talian</label>
                <input required type="url" value={formData.researchLink} onChange={e => setFormData({...formData, researchLink: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Nama Acara</label>
                  <input required value={formData.eventName} onChange={e => setFormData({...formData, eventName: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Lokasi</label>
                  <input required value={formData.eventLocation} onChange={e => setFormData({...formData, eventLocation: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tarikh Mula Acara</label>
                  <input required type="date" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Tarikh Akhir Acara (Jika Berkaitan)</label>
                  <input type="date" value={formData.eventEndDate} min={formData.eventDate} onChange={e => setFormData({...formData, eventEndDate: e.target.value})} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Pilihan" />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">Peringkat</label>
                  <select value={formData.eventLevel} onChange={e => setFormData({...formData, eventLevel: e.target.value as any})} className="w-full border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                    <option value="State">Negeri</option>
                    <option value="National">Kebangsaan</option>
                    <option value="International (Dalam Negeri)">Antarabangsa (Dalam Negeri)</option>
                    <option value="International (Luar Negeri)">Antarabangsa (Luar Negeri)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h3 className="font-bold text-slate-800 border-b pb-2">Langkah 4: Pilih Jawatankuasa Penyelidikan</h3>
            <p className="text-sm text-slate-500">Pilih jawatankuasa sasaran. Permohonan akan dihantar kepada Setiausaha Jawatankuasa untuk lantikan pemeriksa/penilai.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {REVIEWER_LIST.map(r => (
                <div 
                  key={r} 
                  onClick={() => toggleReviewer(r)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    formData.selectedReviewers.includes(r) 
                      ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.selectedReviewers.includes(r) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                    {formData.selectedReviewers.includes(r) && <i className="fas fa-check text-[10px] text-white"></i>}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{r.includes('MJPKKM') ? 'JK MJPKKM (Pensyarah)' : 'JK Inovasi (Pensyarah Pembimbing Pelajar)'}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-bold text-slate-500 uppercase">Jawatankuasa Dipilih ({formData.selectedReviewers.length}/1)</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.selectedReviewers.map(r => (
                  <span key={r} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">{r.includes('MJPKKM') ? 'JK MJPKKM' : 'JK Inovasi'}</span>
                ))}
                {formData.selectedReviewers.length === 0 && <span className="text-slate-400 text-xs italic">Tiada jawatankuasa dipilih</span>}
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-8 mt-4 border-t border-slate-100">
          <button type="button" onClick={step === 1 ? onCancel : () => setStep(step - 1)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100 transition-all">
            {step === 1 ? 'BATAL' : 'KEMBALI'}
          </button>
          
          {step < 4 ? (
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg font-bold shadow-sm transition-all">
              TERUSKAN
            </button>
          ) : (
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-lg font-bold shadow-md transition-all">
              {isEditing ? 'SIMPAN KEMAS KINI' : 'HANTAR PERMOHONAN'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ApplicationWizard;
