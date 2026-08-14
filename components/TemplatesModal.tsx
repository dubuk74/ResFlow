import React, { useState } from 'react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const templates = [
    {
      id: 1,
      title: 'Templat Abstrak & Manuskrip Penyelidikan KMPk',
      category: 'Penyelidikan (MJPKKM)',
      fileType: 'DOCX / Google Docs',
      description: 'Format standard penulisan abstrak, pengenalan, metodologi, keputusan, dan perbincangan kajian kolej.',
      icon: 'fa-file-word',
      color: 'bg-blue-600',
      sampleContent: `TAJUK PENYELIDIKAN: [Masukkan Tajuk Penyelidikan Anda Di Sini]
NAMA PENELITI: [Nama Ketua & Ahli]
ABSTRAK:
Kajian ini bertujuan untuk menilai keberkesanan... [Maksimum 250 patah perkataan]
KATA KUNCI: Inovasi, Matrikulasi, Pengajaran & Pembelajaran.`
    },
    {
      id: 2,
      title: 'Templat Slaid Pembentangan Inovasi & Research',
      category: 'Inovasi & Penyelidikan',
      fileType: 'PPTX / Google Slides',
      description: 'Format paparan slaid 10-slide standard untuk sesi penilaian panel dan pertandingan inovasi.',
      icon: 'fa-file-powerpoint',
      color: 'bg-amber-600',
      sampleContent: `SLIK 1: Tajuk & Ahli Kumpulan
SLIK 2: Pernyataan Masalah & Objektif
SLIK 3: Metodologi / Rekabentuk Inovasi
SLIK 4: Impak Kepada Pelajar/Kolej
SLIK 5: Kesimpulan & Cadangan Masa Depan.`
    },
    {
      id: 3,
      title: 'Borang Pengesahan & Sokongan Ketua Jabatan',
      category: 'Pentadbiran & Kelulusan',
      fileType: 'PDF / Word',
      description: 'Borang sokongan jabatan untuk simpanan perkhidmatan dan fail pendaftaran permohonan.',
      icon: 'fa-file-signature',
      color: 'bg-emerald-600',
      sampleContent: `BORANG PENGESAHAN KETUA JABATAN:
Dengan ini disahkan bahawa penyelidikan bertajuk [...] telah disemak dan disokong untuk dikemukakan ke peringkat kolej.`
    },
    {
      id: 4,
      title: 'Templat Laporan Pencapaian & Anugerah Acara (Post-Event)',
      category: 'Laporan Pencapaian',
      fileType: 'DOCX / PDF',
      description: 'Templat penyediaan laporan selepas menyertai pertandigan/persidangan untuk rekod kolej.',
      icon: 'fa-trophy',
      color: 'bg-purple-600',
      sampleContent: `REKOD PENCAPAIAN ACARA:
- Nama Acara: Pertandingan Inovasi Kebangsaan
- Anugerah Diterima: Pingat Emas / Johan
- Ringkasan Impak: [Sila muat naik sijil / foto kemenangan ke dalam portal ResFlow]`
    }
  ];

  const handleCopy = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] overflow-y-auto p-4 flex justify-center items-center print:hidden animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/30 flex items-center justify-center text-xl text-rose-200 border border-rose-400/30">
              <i className="fas fa-folder-open"></i>
            </div>
            <div>
              <h3 className="font-extrabold text-xl tracking-tight">Templat Borang & Dokumen Rasmi</h3>
              <p className="text-xs text-rose-200 font-medium">Bahan Rujukan & Format Penyelidikan / Inovasi KMPk</p>
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
          
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3">
            <i className="fas fa-info-circle text-rose-600 text-lg mt-0.5"></i>
            <div>
              <h4 className="font-bold text-rose-950 text-xs">Petunjuk Penggunaan Templat</h4>
              <p className="text-xs text-rose-900 mt-0.5">
                Gunakan templat rasmi ini sebagai panduan format penulisan sebelum memuat naik pautan Google Drive ke dalam Sistem ResFlow. Anda boleh menyalin format asas atau memuat turun templat pilihan anda.
              </p>
            </div>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((tpl, idx) => (
              <div key={tpl.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600">
                      {tpl.category}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {tpl.fileType}
                    </span>
                  </div>

                  <div className="flex items-start gap-3 pt-1">
                    <div className={`w-10 h-10 rounded-xl ${tpl.color} text-white flex items-center justify-center text-lg shrink-0 shadow-md`}>
                      <i className={`fas ${tpl.icon}`}></i>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-snug">{tpl.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{tpl.description}</p>
                    </div>
                  </div>
                </div>

                {/* Sample Preview */}
                <div className="bg-white border border-slate-200 rounded-xl p-3 font-mono text-[11px] text-slate-600 whitespace-pre-wrap max-h-24 overflow-y-auto">
                  {tpl.sampleContent}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleCopy(tpl.sampleContent, idx)}
                    className="flex-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <i className={`fas ${copiedIndex === idx ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                    {copiedIndex === idx ? 'Disalin!' : 'Salin Format'}
                  </button>
                  <button
                    onClick={() => alert(`Memuat turun templat: ${tpl.title}`)}
                    className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <i className="fas fa-download text-xs"></i>
                    Muat Turun
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-6 py-2 rounded-xl transition-all cursor-pointer"
          >
            Tutup Templat Borang
          </button>
        </div>

      </div>
    </div>
  );
};
