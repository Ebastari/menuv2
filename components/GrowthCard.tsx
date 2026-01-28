import React, { useMemo } from 'react';
import { GrowthLevel } from '../types';
import { LEVEL_THRESHOLDS } from '../constants';

interface GrowthCardProps {
  currentSeconds: number;
}

export const GrowthCard: React.FC<GrowthCardProps> = ({ currentSeconds }) => {
  const formattedTime = useMemo(() => {
    const days = Math.floor(currentSeconds / 86400);
    const hours = Math.floor((currentSeconds % 86400) / 3600);
    const minutes = Math.floor((currentSeconds % 3600) / 60);
    const seconds = currentSeconds % 60;
    return `${days}h ${hours}j ${minutes}m ${seconds}d`;
  }, [currentSeconds]);

  const growthData = useMemo(() => {
    const rimbaThreshold = LEVEL_THRESHOLDS[GrowthLevel.RIMBA];
    const totalProgress = Math.min(100, Math.round((currentSeconds / rimbaThreshold) * 100));

    let currentLevel = GrowthLevel.SEMAI;
    if (currentSeconds >= LEVEL_THRESHOLDS[GrowthLevel.RIMBA]) currentLevel = GrowthLevel.RIMBA;
    else if (currentSeconds >= LEVEL_THRESHOLDS[GrowthLevel.POHON]) currentLevel = GrowthLevel.POHON;
    else if (currentSeconds >= LEVEL_THRESHOLDS[GrowthLevel.TIANG]) currentLevel = GrowthLevel.TIANG;
    else if (currentSeconds >= LEVEL_THRESHOLDS[GrowthLevel.PANCANG]) currentLevel = GrowthLevel.PANCANG;

    return { currentLevel, totalProgress };
  }, [currentSeconds]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[44px] p-8 shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-800 transition-all group relative overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[60px] group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-emerald-600 rounded-[24px] flex items-center justify-center text-white text-3xl shadow-2xl shadow-emerald-500/30 group-hover:rotate-6 transition-transform duration-500">
              <i className="fas fa-seedling"></i>
            </div>
            <div>
              <h3 className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.4em] mb-2 leading-none">Growth Status</h3>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter leading-none">{growthData.currentLevel}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight leading-none tabular-nums">{formattedTime}</p>
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest mt-2 opacity-90">Active Session</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative pt-3">
            <div className="relative h-3 w-full bg-slate-100 dark:bg-slate-800/60 rounded-full overflow-hidden">
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${growthData.totalProgress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div 
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white dark:bg-slate-950 shadow-2xl border-[3px] border-emerald-500 transition-all duration-1000 ease-out z-20 flex items-center justify-center"
              style={{ left: `calc(${growthData.totalProgress}% - 10px)` }}
            >
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
            </div>
          </div>

          <div className="flex justify-between text-[9px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest px-1">
            {[GrowthLevel.SEMAI, GrowthLevel.PANCANG, GrowthLevel.TIANG, GrowthLevel.POHON, GrowthLevel.RIMBA].map(level => (
               <span key={level} className={`transition-colors duration-500 ${growthData.currentLevel === level ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                 {level}
               </span>
            ))}
          </div>

          <div className="bg-slate-50/80 dark:bg-slate-800/30 rounded-[32px] p-6 flex justify-between items-center group-hover:bg-emerald-50/50 dark:group-hover:bg-slate-800 transition-colors duration-500">
            <div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-[0.2em] mb-1.5">Total Progress</p>
              <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{growthData.totalProgress}%</p>
            </div>
            <div className="text-right">
               <div className="inline-flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                 <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                 <p className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Target 30 Hari</p>
               </div>
               <p className="text-[7px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Certified Ecosystem</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};