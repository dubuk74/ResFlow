import React, { useState } from 'react';

interface GoogleScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APPS_SCRIPT_CODE = `/**
 * ResFlow - Google Apps Script (Rebuild & Sync Sheet)
 * 
 * INSTRUCTIONS:
 * 1. Open your Google Sheet.
 * 2. Go to Extensions > Apps Script.
 * 3. Replace all existing code with this script.
 * 4. Click "Run" -> "setupSheetHeader" once to set up the clean headers.
 * 5. Click "Deploy" -> "New deployment".
 * 6. Select Type: "Web app".
 * 7. Set "Execute as": "Me".
 * 8. Set "Who has access": "Anyone".
 * 9. Click "Deploy" and copy the Web App URL.
 */

// Clean, streamlined headers for ResFlow
const HEADERS = [
  "id",
  "applicantName",
  "applicantIdCard",
  "applicantEmail",
  "applicantPhone",
  "teamName",
  "teamMembers",
  "researchTitle",
  "researchLink",
  "eventName",
  "eventLocation",
  "eventDate",
  "eventLevel",
  "submissionDate",
  "status",
  "targetCommittee",
  "assignedSecretary",
  "assignedExaminer",
  "secretaryAssignmentNotes",
  "secretaryAssignmentDate",
  "selectedReviewers",
  "reviews",
  "secretaryEndorsementStatus",
  "secretaryEndorsementComments",
  "secretaryEndorsementName",
  "secretaryEndorsementDate",
  "hodStatus",
  "hodName",
  "hodComments",
  "hodDate",
  "directorStatus",
  "directorName",
  "directorComments",
  "directorDate",
  "achievementStatus",
  "achievementDetails",
  "achievementDate"
];

/**
 * Run this function once from the Apps Script editor to create/rebuild headers!
 */
function setupSheetHeader() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Clear any existing old/unused header columns from previous script versions
  const maxCols = Math.max(sheet.getLastColumn(), HEADERS.length);
  if (maxCols > 0) {
    sheet.getRange(1, 1, 1, maxCols).clearContent();
  }
  
  // Format Header Row with clean 34 ResFlow fields
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#4F46E5"); // Indigo theme
  headerRange.setFontColor("#FFFFFF");
  headerRange.setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
  
  Logger.log("Headers set up successfully! Old unused columns cleared.");
}

/**
 * Handles GET requests to retrieve all applications from Google Sheet.
 */
function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    if (data.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = data[0].map(h => String(h).trim());
    const rows = data.slice(1);
    
    const result = rows.map(row => {
      const obj = {};
      headers.forEach((header, colIndex) => {
        if (header) {
          let val = row[colIndex] !== undefined && row[colIndex] !== null ? row[colIndex] : "";
          if (header === "applicantPhone" && val) {
            let str = String(val).trim().replace(/^'+/, "");
            if (str && !str.startsWith("0") && !str.startsWith("+")) {
              str = "0" + str;
            }
            val = str;
          }
          obj[header] = val;
        }
      });
      return obj;
    });
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handles POST requests to save or update applications in Google Sheet.
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const postData = JSON.parse(e.postData.contents || "{}");
    
    // Ensure header row exists and expand missing headers if sheet was created earlier
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    } else {
      const existingHeaders = sheet.getRange(1, 1, 1, Math.max(1, sheet.getLastColumn())).getValues()[0].map(h => String(h).trim());
      const existingNorm = existingHeaders.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
      const missingToAdd = [];
      for (let i = 0; i < HEADERS.length; i++) {
        const hNorm = HEADERS[i].toLowerCase().replace(/[^a-z0-9]/g, "");
        if (hNorm !== "" && !existingNorm.includes(hNorm)) {
          missingToAdd.push(HEADERS[i]);
        }
      }
      if (missingToAdd.length > 0) {
        sheet.getRange(1, existingHeaders.length + 1, 1, missingToAdd.length).setValues([missingToAdd]);
      }
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map(h => String(h).trim());
    
    // Strict exact property value lookup without aliases
    function getPostVal(headerName) {
      if (!headerName) return "";
      if (postData[headerName] !== undefined && postData[headerName] !== null && postData[headerName] !== "") {
        return postData[headerName];
      }
      return "";
    }
    
    // Find ID column index
    let idColIndex = headers.indexOf("id");
    if (idColIndex === -1) idColIndex = 0;
    
    const targetId = String(getPostVal("id") || "").trim();
    
    let existingRowIndex = -1;
    if (targetId !== "") {
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][idColIndex]).trim() === targetId) {
          existingRowIndex = i + 1; // 1-based index in Sheet
          break;
        }
      }
    }

    // Prepare row array matching headers
    const rowValues = headers.map((header, colIdx) => {
      let val = getPostVal(header);
      // Preserve existing cell value if postData has no new value for this column
      if ((val === undefined || val === null || val === "") && existingRowIndex > 0) {
        const existingCellVal = data[existingRowIndex - 1][colIdx];
        if (existingCellVal !== undefined && existingCellVal !== null && existingCellVal !== "") {
          return String(existingCellVal);
        }
      }
      if (val !== undefined && val !== null) {
        if (header === "applicantPhone" && val !== "") {
          let pStr = String(val).trim().replace(/^'+/, "");
          if (pStr && !pStr.startsWith("0") && !pStr.startsWith("+")) {
            pStr = "0" + pStr;
          }
          return "'" + pStr;
        }
        return typeof val === 'object' ? JSON.stringify(val) : String(val);
      }
      return "";
    });
    
    if (existingRowIndex > 0) {
      // Update existing row
      sheet.getRange(existingRowIndex, 1, 1, rowValues.length).setValues([rowValues]);
    } else {
      // Append new row
      sheet.appendRow(rowValues);
    }

    // Auto-send email notification to applicant
    sendApplicantEmailNotification(postData);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", id: targetId }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Ujian Penghantaran E-mel & Pemberian Kebenaran (Authorization) Google Apps Script
 * Sila jalankan fungsi ini sekali di Google Apps Script Editor untuk berikan kebenaran (Allow Permission).
 */
function testEmail() {
  const activeUser = Session.getActiveUser().getEmail();
  const testAddress = activeUser || "bm-1682@moe-dl.edu.my";
  const subject = "[ResFlow] Ujian Kebenaran Penghantaran E-mel";
  const body = "Tahniah! Kebenaran penghantaran e-mel bagi Google Apps Script Sistem ResFlow telah berjaya disahkan.";
  
  try {
    MailApp.sendEmail(testAddress, subject, body);
    Logger.log("Ujian berjaya! E-mel dihantar ke: " + testAddress);
  } catch (err) {
    Logger.log("Ralat Ujian E-mel: " + err.toString());
  }
}

/**
 * Automatisasi Penghantaran E-mel Notifikasi Kepada Pemohon
 */
function sendApplicantEmailNotification(postData) {
  try {
    const email = postData.applicantEmail;
    if (!email || String(email).indexOf("@") === -1) {
      Logger.log("Alamat e-mel tidak sah atau kosong: " + email);
      return;
    }

    const appId = postData.id || "-";
    const name = postData.applicantName || "Pemohon";
    const title = postData.researchTitle || "Permohonan Penyelidikan";
    const eventName = postData.eventName || "-";
    const status = postData.status || "DALAM PROSES";
    const committee = postData.targetCommittee || "MJPKKM";

    const subject = "[ResFlow] Status Permohonan Penyelidikan - " + appId;
    const bodyLines = [
      "Salam Sejahtera " + name + ",",
      "",
      "Makluman mengenai permohonan penyelidikan & inovasi anda dalam Sistem ResFlow:",
      "",
      "--------------------------------------------------",
      "ID Permohonan : " + appId,
      "Tajuk Research : " + title,
      "Program/Acara  : " + eventName,
      "Jawatankuasa   : JK " + committee,
      "--------------------------------------------------",
      "",
      "STATUS TERKINI : " + status,
      "",
      "Sila log masuk ke Portal ResFlow untuk menyemak maklumat lanjut dan perincian keputusan.",
      "",
      "Sekian, terima kasih.",
      "",
      "--------------------------------------------------",
      "Sistem ResFlow (Pengurusan Permohonan Penyelidikan & Inovasi)",
      "Emel ini dihantar secara automatik melalui Google Apps Script."
    ];
    const body = bodyLines.join("\\n");

    try {
      MailApp.sendEmail(email, subject, body);
    } catch (e1) {
      GmailApp.sendEmail(email, subject, body, { name: "ResFlow System" });
    }
  } catch (err) {
    Logger.log("Ralat Penghantaran E-mel: " + err.toString());
  }
}
`;

export const GoogleScriptModal: React.FC<GoogleScriptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg">
            <i className="fas fa-file-code"></i>
            <span>Google Apps Script - Rebuild Sheet</span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="my-4 text-xs text-slate-600 space-y-2">
          <p className="font-semibold text-slate-800">Langkah-langkah Kemaskini Google Sheet & Aktifkan Notifikasi E-mel:</p>
          <ol className="list-decimal list-inside space-y-1.5 pl-1">
            <li>Buka Google Sheet anda, tekan <strong>Extensions &gt; Apps Script</strong>.</li>
            <li>Gantikan semua kod sedia ada dengan skrip di bawah.</li>
            <li>Pilih fungsi <strong><code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-bold">setupSheetHeader</code></strong> dan tekan tombol <strong>Run</strong> sekali untuk susun tajuk lajur.</li>
            <li className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-medium">
              <strong className="text-amber-950 font-bold">PENTING (Untuk E-mel Berfungsi):</strong> Pilih fungsi <strong><code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-bold">testEmail</code></strong> di bahagian atas Editor dan tekan <strong>Run</strong>. Pop-up <i>"Authorization Required"</i> akan keluar &rarr; tekan <strong>Review Permissions</strong> &rarr; pilih akaun Google anda &rarr; tekan <strong>Advanced</strong> &rarr; tekan <strong>Go to ... (unsafe)</strong> &rarr; tekan <strong>Allow</strong>.
            </li>
            <li>Tekan <strong>Deploy &gt; New deployment</strong>, pilih <strong>Web app</strong>. Set <i>Who has access</i> kepada <strong>Anyone</strong> (Sesiapa sahaja).</li>
            <li>Salin pautan <strong>Web App URL</strong> yang terhasil dan masukkan ke dalam fail <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">/services/googleSheetService.ts</code> pada pembolehubah <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700 font-mono">SCRIPT_URL</code>.</li>
          </ol>
        </div>

        <div className="relative flex-1 bg-slate-900 rounded-xl p-4 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center pb-2 mb-2 border-b border-slate-800 text-slate-400 text-[11px]">
            <span>Code.gs</span>
            <button 
              onClick={handleCopy}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold text-[10px] transition-colors flex items-center gap-1.5"
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
              {copied ? 'Telah Disalin!' : 'Salin Kod'}
            </button>
          </div>
          <pre className="text-slate-200 text-[11px] font-mono overflow-auto flex-1 leading-relaxed">
            {APPS_SCRIPT_CODE}
          </pre>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
