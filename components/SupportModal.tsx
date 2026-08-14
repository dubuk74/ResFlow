import React, { useState } from 'react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', category: 'Teknikal', message: '' });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setFormData({ name: '', email: '', category: 'Teknikal', message: '' });
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] overflow-y-auto p-4 flex justify-center items-center print:hidden animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/30 flex items-center justify-center text-xl text-blue-200 border border-blue-400/30">
              <i className="fas fa-headset"></i>
            </div>
            <div>
              <h3 className="font-extrabold text-xl tracking-tight">Hub Sokongan & Bantuan ResFlow</h3>
              <p className="text-xs text-blue-200 font-medium">Kolej Matrikulasi Perak (KMPk)</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-sm leading-relaxed">
          
          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shrink-0 shadow-md shadow-blue-200">
                <i className="fas fa-microscope"></i>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Urus Setia MJPKKM (Penyelidikan)</h4>
                <p className="text-xs text-slate-600 mt-1">Jawatankuasa Management & Research KMPk</p>
                <div className="mt-2 text-xs space-y-0.5 text-slate-500 font-medium">
                  <p><i className="fas fa-envelope text-blue-600 mr-1.5"></i> mjpkkm@kmpk.edu.my</p>
                  <p><i className="fas fa-phone text-blue-600 mr-1.5"></i> Ext. 1042 / 1045</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shrink-0 shadow-md shadow-indigo-200">
                <i className="fas fa-lightbulb"></i>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Urus Setia JK INOVASI</h4>
                <p className="text-xs text-slate-600 mt-1">Jawatankuasa Inovasi & Pedagogi KMPk</p>
                <div className="mt-2 text-xs space-y-0.5 text-slate-500 font-medium">
                  <p><i className="fas fa-envelope text-indigo-600 mr-1.5"></i> inovasi@kmpk.edu.my</p>
                  <p><i className="fas fa-phone text-indigo-600 mr-1.5"></i> Ext. 1088 / 1090</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
              <i className="fas fa-question-circle text-blue-600"></i>
              Soalan Lazim (FAQ)
            </h4>

            <div className="space-y-2">
              <details className="group bg-slate-50 border border-slate-200 rounded-xl p-3.5 [&_summary::-webkit-details-marker]:none">
                <summary className="flex items-center justify-between font-bold text-xs text-slate-800 cursor-pointer">
                  <span>Bagaimana jika saya tidak menerima e-mel notifikasi kelulusan?</span>
                  <i className="fas fa-chevron-down text-slate-400 group-open:rotate-180 transition-transform"></i>
                </summary>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Sila semak folder <strong>Spam / Junk</strong> e-mel anda. Pastikan e-mel pemohon yang dimasukkan semasa penyerahan adalah e-mel rasmi (cth: @moe-dl.edu.my atau @kmpk.edu.my). Anda juga boleh menyemak status permohonan pada bila-bila masa di menu <strong>"Permohonan Saya"</strong> dalam portal.
                </p>
              </details>

              <details className="group bg-slate-50 border border-slate-200 rounded-xl p-3.5 [&_summary::-webkit-details-marker]:none">
                <summary className="flex items-center justify-between font-bold text-xs text-slate-800 cursor-pointer">
                  <span>Bagaimana hendak menukar pautan Google Drive atau tajuk permohonan selepas dihantar?</span>
                  <i className="fas fa-chevron-down text-slate-400 group-open:rotate-180 transition-transform"></i>
                </summary>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Anda boleh mengemaskini fail terus di Google Drive tanpa perlu menukar pautan (asalkan tetapan perkongsian Google Drive dibuka kepada <i>"Anyone with the link can view"</i>). Jika perlu menukar maklumat utama, sila hubungi Setiausaha JK berkenaan.
                </p>
              </details>

              <details className="group bg-slate-50 border border-slate-200 rounded-xl p-3.5 [&_summary::-webkit-details-marker]:none">
                <summary className="flex items-center justify-between font-bold text-xs text-slate-800 cursor-pointer">
                  <span>Apa yang perlu dibuat jika status menunjukkan "TIDAK DISOKONG OLEH KETUA JABATAN"?</span>
                  <i className="fas fa-chevron-down text-slate-400 group-open:rotate-180 transition-transform"></i>
                </summary>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Sila baca ulasan daripada Ketua Jabatan pada Jejak Audit. Buat penambahbaikan pada kertas penyelidikan anda, kemudian klik <strong>"Penyerahan Baru"</strong> untuk membuat permohonan baharu.
                </p>
              </details>
            </div>
          </div>

          {/* Quick Contact Form */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
              <i className="fas fa-paper-plane text-blue-600"></i>
              Borang Pertanyaan / Bantuan Bantuan Bantuan
            </h4>

            {ticketSubmitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center text-emerald-800 text-xs font-bold animate-in fade-in">
                <i className="fas fa-check-circle text-emerald-600 text-lg mb-1 block"></i>
                Pertanyaan anda telah berjaya dihantar! Urus setia akan menghubungi anda tidak lama lagi.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Pemohon / Pensyarah</label>
                    <input 
                      required
                      type="text"
                      placeholder="Masukkan nama anda"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">E-mel Pertanyaan</label>
                    <input 
                      required
                      type="email"
                      placeholder="contoh@kmpk.edu.my"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Kategori Masalah</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  >
                    <option value="Teknikal">Masalah Teknikal / Bug Portal</option>
                    <option value="Status">Semakan Status Permohonan</option>
                    <option value="GoogleSheet">Google Sheets & Integration</option>
                    <option value="Lain-lain">Lain-lain Pertanyaan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Mesej Pertanyaan</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tuliskan masalah atau soalan anda secara rinci..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fas fa-paper-plane"></i>
                  Hantar Pertanyaan Bantuan
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-6 py-2 rounded-xl transition-all cursor-pointer"
          >
            Tutup Hub Sokongan
          </button>
        </div>

      </div>
    </div>
  );
};
