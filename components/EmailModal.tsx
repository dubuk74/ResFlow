import React, { useState } from 'react';
import { Application } from '../types';
import { generateApplicantEmailNotification, openMailClient } from '../services/emailService';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: Application | null;
  customNotes?: string;
  updatedByRole?: string;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  app,
  customNotes,
  updatedByRole
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !app) return null;

  const emailData = generateApplicantEmailNotification(app, customNotes, updatedByRole);

  const handleCopy = () => {
    const fullText = `Kepada: ${emailData.recipientEmail}\nSubjek: ${emailData.subject}\n\n${emailData.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendMailto = () => {
    openMailClient(emailData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-indigo-700 font-bold text-lg">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <i className="fas fa-envelope-open-text"></i>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 leading-tight">Pratonton Notifikasi E-mel</h3>
              <p className="text-xs text-slate-500 font-normal">Hantar pemakluman rasmi terus kepada pemohon</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Content */}
        <div className="my-4 space-y-3.5 overflow-y-auto flex-1 pr-1 text-xs">
          {/* Automatic Badge */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-start gap-2.5">
            <i className="fas fa-check-circle text-emerald-600 text-sm mt-0.5 shrink-0"></i>
            <div>
              <span className="font-bold">Automatisasi Google Apps Script:</span>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Apabila rekod disimpan ke Google Sheets, skrip Google Apps Script akan secara automatik menghantar e-mel notifikasi ini ke peti masuk <strong>{app.applicantEmail || 'pemohon'}</strong>.
              </p>
            </div>
          </div>

          {/* Email Recipient Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">Penerima (Pemohon):</span>
              <span className="font-bold text-slate-800 text-xs">{app.applicantName}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block text-[11px]">Alamat E-mel:</span>
              <span className="font-bold text-indigo-700 text-xs font-mono">{app.applicantEmail || 'Tiada e-mel'}</span>
            </div>
          </div>

          {/* Subject line */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1 text-[11px]">Subjek E-mel:</label>
            <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-800 text-xs">
              {emailData.subject}
            </div>
          </div>

          {/* Email Body */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-slate-600 font-semibold text-[11px]">Kandungan E-mel Pemakluman:</label>
              <button 
                onClick={handleCopy}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <i className={`fas ${copied ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                {copied ? 'Telah Disalin!' : 'Salin Teks'}
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto border border-slate-800">
              {emailData.body}
            </pre>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2">
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <i className={`fas ${copied ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
            {copied ? 'Draf Disalin!' : 'Salin Teks E-mel'}
          </button>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Tutup
            </button>
            <button
              onClick={handleSendMailto}
              className="flex-1 sm:flex-none px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <i className="fas fa-paper-plane"></i>
              Buka Dalam E-mel Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
