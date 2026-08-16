import React, { useState } from 'react';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManualModal: React.FC<UserManualModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'applicant' | 'secretary' | 'examiner' | 'hod' | 'director' | 'gsheet'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 overflow-y-auto p-4 flex justify-center items-center print:hidden">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 flex items-center justify-center text-xl text-indigo-200 border border-indigo-400/30">
              📖
            </div>
            <div>
              <h3 className="font-extrabold text-xl tracking-tight">Manual Pengguna ResFlow</h3>
              <p className="text-xs text-indigo-200 font-medium">Panduan Lengkap Sistem Kelulusan Penyelidikan & Inovasi KMPk</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="fas fa-sitemap"></i> Aliran Kerja
          </button>
          <button
            onClick={() => setActiveTab('applicant')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'applicant' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="fas fa-user"></i> Pemohon
          </button>
          <button
            onClick={() => setActiveTab('secretary')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'secretary' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="fas fa-user-shield"></i> Setiausaha JK
          </button>
          <button
            onClick={() => setActiveTab('examiner')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'examiner' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="fas fa-user-check"></i> Penilai
          </button>
          <button
            onClick={() => setActiveTab('hod')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'hod' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="fas fa-user-tie"></i> Ketua Jabatan
          </button>
          <button
            onClick={() => setActiveTab('director')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'director' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="fas fa-award"></i> Timbalan Pengarah
          </button>
          <button
            onClick={() => setActiveTab('gsheet')}
            className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'gsheet' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <i className="fas fa-table"></i> Google Sheets
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl">
                <h4 className="font-extrabold text-indigo-950 text-base mb-1">Pengenalan ResFlow</h4>
                <p className="text-xs text-indigo-900">
                  ResFlow ialah sistem pengurusan dan kelulusan digital permohonan penyelidikan dan inovasi bagi Kolej Matrikulasi Perak (KMPk). Sistem ini menghubungkan Pemohon, Setiausaha Jawatankuasa, Pemeriksa/Penilai, Ketua Jabatan, dan Timbalan Pengarah secara integrasi terus dengan Google Sheets.
                </p>
              </div>

              <div>
                <h4 className="font-extrabold text-slate-900 text-sm mb-3 uppercase tracking-wide">Carta 6 Fasa Kitaran Semakan:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-indigo-600">Fasa 1</span>
                    <h5 className="font-bold text-slate-800 text-xs">Penyerahan Permohonan</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pemohon mengisi borang digital (individu/pasukan) & menghantar pautan dokumen.</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-purple-600">Fasa 2</span>
                    <h5 className="font-bold text-slate-800 text-xs">Lantikan Pemeriksa</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Setiausaha JK memilih Pensyarah Penilai/Pemeriksa bagi menyemak permohonan.</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-amber-600">Fasa 3</span>
                    <h5 className="font-bold text-slate-800 text-xs">Penilaian Pemeriksa</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Pemeriksa memberi skala (Cemerlang/Baik/Perlu Penambahbaikan) & ulasan permohonan.</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-blue-600">Fasa 4</span>
                    <h5 className="font-bold text-slate-800 text-xs">Sokongan Setiausaha JK</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Setiausaha mengesahkan laporan semakan dan mengemukakan permohonan ke Ketua Jabatan.</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-emerald-600">Fasa 5</span>
                    <h5 className="font-bold text-slate-800 text-xs">Sokongan Ketua Jabatan (HOD)</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">HOD menyokong (disokong) atau tidak menyokong. Jika tidak disokong, permohonan ditolak terus.</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-black uppercase text-indigo-700">Fasa 6</span>
                    <h5 className="font-bold text-slate-800 text-xs">Kelulusan Timbalan Pengarah</h5>
                    <p className="text-[11px] text-slate-500 mt-0.5">Timbalan Pengarah membuat keputusan kelulusan akhir dan menandatangani rekod audit.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* APPLICANT TAB */}
          {activeTab === 'applicant' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 text-base">Peranan: Pemohon (Applicant)</h4>
              
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-indigo-600 text-xs">1. Menghantar Permohonan Baharu</h5>
                  <p className="text-xs">Klik butang <strong>"Penyerahan Baharu"</strong> di bahagian atas portal. Pilih Jawatankuasa Sasaran (JK Penyelidikan atau JK Inovasi), isi maklumat peribadi/pasukan, maklumat acara (Kebangsaan / Antarabangsa Dalam Negeri / Antarabangsa Luar Negeri), dan pautan dokumen penyelidikan.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-indigo-600 text-xs">2. Menjejak Status & Ulasan</h5>
                  <p className="text-xs">Masuk ke pautan <strong>"Permohonan Saya"</strong>. Setiap cadangan dan ulasan daripada Penilai, HOD, dan Timbalan Pengarah dipaparkan pada garis masa (Timeline / Jejak Audit).</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-amber-800 text-xs">3. Mengemas Kini Pencapaian / Anugerah Acara</h5>
                  <p className="text-xs">Selepas menyertai acara, pemohon boleh mengemas kini status anugerah (contoh: Pingat Emas/Perak/Gangsa/Sijil) di ruangan 🏆 <strong>"Kemas Kini Status / Pencapaian Acara"</strong>. Data ini disimpan terus ke Google Sheets.</p>
                </div>

                <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-1">
                  <h5 className="font-bold text-rose-900 text-xs">4. Jika Status Permohonan "TIDAK DISOKONG OLEH KETUA JABATAN"</h5>
                  <p className="text-xs text-rose-800">Sistem akan memaparkan mesej arahan khas: <strong className="bg-rose-600 text-white px-2 py-0.5 rounded text-[11px]">SILA BUAT PERMOHONAN BAHARU</strong>. Pemohon disyorkan menambah baik penyelidikan berdasarkan ulasan HOD dan membuat penyerahan permohonan baharu.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-indigo-600 text-xs">5. Mencetak Laporan & Salinan Kelulusan</h5>
                  <p className="text-xs">Klik butang <strong>"Cetak Laporan Penuh"</strong> untuk memapar dan mencetak Laporan Penuh Kelulusan & Jejak Audit rasmi untuk simpanan atau rujukan fail perkhidmatan.</p>
                </div>
              </div>
            </div>
          )}

          {/* SECRETARY TAB */}
          {activeTab === 'secretary' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 text-base">Peranan: Setiausaha JK (Secretary)</h4>
              
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-purple-700 text-xs">1. Melantik Penilai / Pemeriksa</h5>
                  <p className="text-xs">Apabila permohonan baharu diterima (Status: Menunggu Lantikan Pemeriksa), Setiausaha memilih Penilai yang sesuai dari senarai pensyarah atau memasukkan nama Penilai khas.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-purple-700 text-xs">2. Semakan Lepas Penilaian</h5>
                  <p className="text-xs">Selepas Penilai memberi skor dan ulasan, Setiausaha menyemak keputusan tersebut dan menambah ulasan/sokongan jawatankuasa sebelum mengemukakan permohonan kepada Ketua Jabatan (HOD).</p>
                </div>
              </div>
            </div>
          )}

          {/* EXAMINER TAB */}
          {activeTab === 'examiner' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 text-base">Peranan: Penilai / Pemeriksa (Examiner)</h4>
              
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-amber-700 text-xs">1. Menilai Manuskrip / Dokumen Penyelidikan</h5>
                  <p className="text-xs">Pemeriksa boleh menekan pautan dokumen penyelidikan untuk menyemak kualiti dan kesesuaian abstrak/manuskrip.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-amber-700 text-xs">2. Memasukkan Skala Penilaian & Cadangan</h5>
                  <p className="text-xs">Pilih Skala Penilaian: <strong>Cemerlang (Excellent)</strong>, <strong>Baik (Good)</strong>, atau <strong>Perlu Penambahbaikan (Needs Improvement)</strong>, kemudian taip ulasan/saranan membina dan tekan Simpan.</p>
                </div>
              </div>
            </div>
          )}

          {/* HOD TAB */}
          {activeTab === 'hod' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 text-base">Peranan: Ketua Jabatan (HOD)</h4>
              
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-emerald-800 text-xs">1. Menyokong Permohonan (Supported)</h5>
                  <p className="text-xs">Jika Ketua Jabatan bersetuju, pilih status <strong>"Disokong (Supported)"</strong>, masukkan ulasan dan simpan. Permohonan akan secara automatik diteruskan ke peringkat Timbalan Pengarah.</p>
                </div>

                <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 space-y-1">
                  <h5 className="font-bold text-rose-900 text-xs">2. Tidak Menyokong Permohonan (Unsupported / Reject)</h5>
                  <p className="text-xs text-rose-800">Jika Ketua Jabatan memilih <strong>"Tidak Disokong (Unsupported)"</strong>, permohonan akan ditolak secara automatik. Rekod disimpan ke Google Sheets dan pemohon dimaklumkan untuk membuat permohonan baharu.</p>
                </div>
              </div>
            </div>
          )}

          {/* DIRECTOR TAB */}
          {activeTab === 'director' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 text-base">Peranan: Timbalan Pengarah (Director)</h4>
              
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-indigo-800 text-xs">1. Semakan Akhir Jejak Audit</h5>
                  <p className="text-xs">Timbalan Pengarah menyemak sejarah keseluruhan daripada Penilai, Setiausaha JK, dan Ketua Jabatan.</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                  <h5 className="font-bold text-indigo-800 text-xs">2. Keputusan Kelulusan Rasmi</h5>
                  <p className="text-xs">Pilih <strong>Diluluskan (Approved)</strong> atau <strong>Ditolak (Rejected)</strong>, masukkan ulasan rasmi pengarah dan simpan keputusan.</p>
                </div>
              </div>
            </div>
          )}

          {/* GSHEET TAB */}
          {activeTab === 'gsheet' && (
            <div className="space-y-4">
              <h4 className="font-extrabold text-slate-900 text-base">Integrasi Google Sheets & Apps Script</h4>
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <p>Sistem ini menyelaraskan data permohonan secara langsung dengan fail Google Sheets anda melalui Google Apps Script Web App URL.</p>
                
                <div className="p-3 bg-white rounded-xl border border-slate-300 font-mono text-[11px] break-all">
                  <strong>Pautan Deployment Terkini (E-mel & Google Sheets):</strong><br />
                  https://script.google.com/macros/s/AKfycbzPT_CS87AfALJO02ri6UTsJIR6vg1Z58GU4bLJWp-N4ZIrcbho8Tb4KaHurzU0vTX7/exec
                </div>

                <p className="text-slate-600">
                  Untuk melihat atau menyemak skrip Google Apps Script yang digunakan, anda boleh menekan butang <strong>"Skrip Google Sheets"</strong> di bahagian bawah (footer) aplikasi ini pada bila-bila masa.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            Tutup Manual Pengguna
          </button>
        </div>

      </div>
    </div>
  );
};
