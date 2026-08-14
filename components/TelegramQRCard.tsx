import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface TelegramQRCardProps {
  size?: number;
  className?: string;
}

export const TelegramQRCard: React.FC<TelegramQRCardProps> = ({ size = 150, className = '' }) => {
  const telegramUrl = 'https://t.me/infoksajiankmpk';

  return (
    <div className={`relative flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-b from-[#8fc99a] to-[#7dbf89] shadow-md border border-emerald-300/40 select-none ${className}`}>
      {/* Top Telegram SA Avatar Badge */}
      <div className="absolute -top-3.5 z-10 w-9 h-9 rounded-full bg-[#4ba3e3] border-2 border-white shadow flex items-center justify-center text-white font-bold text-xs tracking-wider">
        SA
      </div>

      {/* Main White Card Frame */}
      <div className="mt-2 bg-white rounded-2xl p-3 pt-4 shadow-sm flex flex-col items-center border border-slate-100/80">
        <div className="relative p-1 bg-white rounded-xl">
          <QRCodeSVG
            value={telegramUrl}
            size={size}
            level="H"
            fgColor="#2e7d32"
            bgColor="#ffffff"
            marginSize={1}
            imageSettings={{
              src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%232e7d32"><circle cx="12" cy="12" r="11" fill="%23ffffff" stroke="%232e7d32" stroke-width="1.5"/><path d="M17.5 7.5L6.5 11.8l3.5 1.5 6-4.5-4.8 5.2 0.3 3.5 2.5-2.2 3.5 2.2 2-10z" fill="%232e7d32"/></svg>',
              height: size * 0.22,
              width: size * 0.22,
              excavate: true,
            }}
          />
        </div>

        {/* Telegram Username Handle */}
        <p className="mt-2 text-[11px] sm:text-xs font-black tracking-wide text-[#2e7d32] font-mono">
          @INFOKAJIANKMPK
        </p>
      </div>
    </div>
  );
};
