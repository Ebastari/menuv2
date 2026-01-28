
import React, { useState } from 'react';

interface StockUpdate {
  bibit: string;
  masuk: number;
  keluar: number;
  mati: number;
  tanggal: string;
  isAggregated?: boolean;
}

interface FloatingStockBubbleProps {
  data: StockUpdate | null;
}

export const FloatingStockBubble: React.FC<FloatingStockBubbleProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!data || isDismissed) return null;

  const netStok = data.masuk - data.keluar - data.mati;
  
  return (
    <div className="fixed bottom-32 right-6 z-[90] flex flex-col items-end pointer-events-none">
      {/* Expanded Details Card */}
      <div className={`mb-4 transition-all duration-500 origin-bottom-right transform ${isExpanded ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[40px] p-7 shadow-[0_35px_80px_rgba(0,0,0,0.4)] border border-white/40 dark:border-white/10 w-80 pointer-events-auto ring-1 ring-black/5 dark:ring-white/5 relative overflow-hidden">
          
          {/* Animated Background Pulse */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[20px] flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                <i className="fas fa-boxes-stacked text-sm"></i>
              </div>
              <div>
                <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Recap Hari Ini</h4>
                <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Live Data
                </p>
              </div>
            </div>
            {/* Tutup & Dismiss: Mengklik ini akan menghilangkan seluruh bubble */}
            <button 
              onClick={() => {
                setIsExpanded(false);
                setIsDismissed(true);
              }}
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors shadow-sm"
              title="Sembunyikan Selamanya"
            >
              <i className="fas fa-times text-[12px]"></i>
            </button>
          </div>

          {/* Aggregation Summary */}
          <div className="bg-slate-900 dark:bg-black rounded-[24px] p-4 mb-5 text-white flex justify-between items-center shadow-inner relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none"></div>
             <div>
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Akumulasi Stok</p>
               <p className="text-2xl font-black tracking-tighter leading-none">{netStok > 0 ? `+${netStok}` : netStok}</p>
             </div>
             <div className="text-right">
                <div className="text-[7px] font-black bg-emerald-500 px-2 py-0.5 rounded-full inline-block mb-1">ESTIMATED</div>
                <p className="text-[9px] font-bold text-slate-400">Net Growth</p>
             </div>
          </div>

          {/* Stats Breakdown */}
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-[24px] border border-slate-100 dark:border-white/5 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <i className="fas fa-arrow-down text-[10px]"></i>
                </div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Masuk</span>
              </div>
              <span className="text-[14px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums">+{data.masuk.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-[24px] border border-slate-100 dark:border-white/5 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <i className="fas fa-arrow-up text-[10px]"></i>
                </div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Keluar</span>
              </div>
              <span className="text-[14px] font-black text-slate-900 dark:text-white tabular-nums">-{data.keluar.toLocaleString()}</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800/40 rounded-[24px] border border-slate-100 dark:border-white/5 group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <i className="fas fa-skull text-[10px]"></i>
                </div>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Mati</span>
              </div>
              <span className="text-[14px] font-black text-rose-500 tabular-nums">-{data.mati.toLocaleString()}</span>
            </div>
          </div>
          
          <button 
            onClick={() => setIsExpanded(false)}
            className="w-full mt-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600"
          >
            Sembunyikan Detail
          </button>
        </div>
      </div>

      {/* The Floating Bubble */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="pointer-events-auto relative group active:scale-90 transition-transform duration-200"
      >
        <div className="absolute -inset-4 bg-emerald-500/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className={`w-16 h-16 rounded-[28px] flex flex-col items-center justify-center shadow-2xl shadow-emerald-900/40 transition-all duration-700 relative z-10 border-4 border-white dark:border-slate-800 ${isExpanded ? 'bg-slate-950 rotate-90 scale-110' : 'bg-emerald-600 hover:scale-110 animate-float'}`}>
          {isExpanded ? (
            <i className="fas fa-times text-white text-xl"></i>
          ) : (
            <div className="flex flex-col items-center">
              <i className="fas fa-seedling text-white text-xl mb-1 drop-shadow-md"></i>
              <span className="text-[9px] font-black text-white leading-none tracking-tighter">
                {netStok > 0 ? `+${netStok}` : (netStok === 0 ? 'LIVE' : netStok)}
              </span>
            </div>
          )}
        </div>
        
        {/* Unread Badge */}
        {!isExpanded && (
          <div className="absolute -top-1 -right-1 w-7 h-7 bg-orange-500 border-4 border-white dark:border-slate-800 rounded-full flex items-center justify-center z-20 shadow-lg animate-bounce overflow-hidden">
            <span className="text-[8px] font-black text-white relative z-10">!</span>
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        )}
      </button>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0); }
          25% { transform: translateY(-8px) rotate(-2deg); }
          75% { transform: translateY(-12px) rotate(2deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
