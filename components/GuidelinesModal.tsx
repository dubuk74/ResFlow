import React from 'react';

interface GuidelinesModalProps {
  onClose: () => void;
}

const GuidelinesModal: React.FC<GuidelinesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <i className="fas fa-book"></i>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Garis Panduan Pengguna Sistem</h2>
              <p className="text-xs text-slate-500 font-medium">Prosedur Operasi Standard untuk KMPk ResFlow</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 hover:bg-white rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors shadow-sm border border-transparent hover:border-slate-100"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          {/* Section: Applicant */}
          <section className="relative">
            <div className="flex gap-6">
              <div className="flex-none w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-100">1</div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Pemohon: Penyerahan & Penjejakan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="font-bold text-indigo-600 text-xs uppercase mb-2">Langkah 1: Penyerahan</p>
                    <p className="text-sm text-slate-600 leading-relaxed">Hantar permohonan dan pilih Jawatankuasa sasaran (MJPKKM atau INOVASI).</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="font-bold text-indigo-600 text-xs uppercase mb-2">Langkah 2: Penjejakan</p>
                    <p className="text-sm text-slate-600 leading-relaxed">Pantau status daripada Setiausaha, Penilai, Setiausaha, Ketua Jabatan, dan Timbalan Pengarah.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Secretary */}
          <section className="relative">
            <div className="flex gap-6">
              <div className="flex-none w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-purple-100">2</div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Setiausaha JK MJPKKM / Setiausaha JK INOVASI</h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">Menguruskan permohonan masuk dan melantik pemeriksa penyelidikan di bawah jawatankuasa masing-masing.</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fas fa-check-circle text-purple-500 mt-0.5"></i>
                    <span><strong>Fasa 1 (Lantikan):</strong> Menerima permohonan dan melantik Pensyarah Pemeriksa/Penilai.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fas fa-check-circle text-purple-500 mt-0.5"></i>
                    <span><strong>Fasa 2 (Sokongan):</strong> Menyemak keputusan penilaian pemeriksa, memberikan ulasan pengesahan, dan menyerahkan kepada Ketua Jabatan.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section: Reviewer */}
          <section className="relative">
            <div className="flex gap-6">
              <div className="flex-none w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-amber-100">3</div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Pensyarah Pemeriksa / Penilai</h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">Ditugaskan oleh Setiausaha untuk penilaian teknikal dan penyelarasan kertas penyelidikan.</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fas fa-check-circle text-amber-500 mt-0.5"></i>
                    <span>Menilai kandungan teknikal dan kualiti penulisan penyelidikan.</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-600">
                    <i className="fas fa-check-circle text-amber-500 mt-0.5"></i>
                    <span>Memberikan ulasan dan skala cadangan (Cemerlang/Baik/Penambahbaikan) dan mengembalikan kepada Setiausaha.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section: HOD */}
          <section className="relative">
            <div className="flex gap-6">
              <div className="flex-none w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-emerald-100">4</div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Ketua Jabatan (KETUA JABATAN)</h3>
                <p className="text-sm text-slate-600 mb-4">Membuat ulasan sokongan pentadbiran berdasarkan laporan pemeriksaan teknikal dan sokongan Setiausaha.</p>
              </div>
            </div>
          </section>

          {/* Section: Director */}
          <section className="relative">
            <div className="flex gap-6">
              <div className="flex-none w-12 h-12 bg-indigo-900 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg shadow-indigo-200">5</div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">TIMBALAN PENGARAH (Kelulusan Akhir)</h3>
                <p className="text-sm text-slate-600 mb-4 leading-relaxed">Peringkat kelulusan institusi akhir untuk penyerahan atau penerbitan rasmi.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400 italic">Versi 2.0 | Dikemas kini April 2026</p>
          <button 
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-md"
          >
            Saya Faham
          </button>
        </div>
      </div>
    </div>
  );
};

export default GuidelinesModal;
