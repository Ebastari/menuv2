
import React, { useEffect, useState } from 'react';

interface BibitUpdate {
  bibit: string;
  masuk: number;
  keluar: number;
  mati: number;
  tanggal: string;
}

interface BibitNotificationToastProps {
  data: BibitUpdate | null;
  onClose: () => void;
}

export const BibitNotificationToast: React.FC<BibitNotificationToastProps> = ({ data, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (data) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setTimeout(onClose, 700);
  };

  if (!data) return null;

  return (
    <div 
      onClick={handleDismiss}
      className={`fixed bottom-36 left-6 z-[100] max-w-[280px] transition-all duration-700 transform cursor-pointer ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'}`}
    >
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[28px] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/50 dark:border-white/10 flex items-center gap-4 relative group hover:scale-105 transition-transform">
        
        {/* Close Button Indicator */}
        <div className="absolute -top-2 -right-2 w-7 h-7 bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-rose-500 rounded-full flex items-center justify-center shadow-lg transition-colors border border-white/50 dark:border-white/10 z-10">
          <i className="fas fa-times text-[10px]"></i>
        </div>

        {/* Status Indicator */}
        <div className="relative">
          <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
            <i className="fas fa-seedling text-lg"></i>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5 leading-none">Update Logistik</h4>
          <p className="text-[12px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight mb-1">{data.bibit}</p>
          <div className="flex gap-2">
            {data.masuk > 0 && (
              <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase">+{data.masuk} In</span>
            )}
            {data.keluar > 0 && (
              <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase">-{data.keluar} Out</span>
            )}
            {data.mati > 0 && (
              <span className="text-[9px] font-black text-rose-500 uppercase">-{data.mati} Death</span>
            )}
          </div>
        </div>

        {/* Decorative element */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent rounded-[28px] pointer-events-none"></div>
      </div>
    </div>
  );
};
