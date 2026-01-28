import React from 'react';
import { MENU_ITEMS } from '../constants';
import { MenuItem } from '../types';

interface MenuGridProps {
  role: 'admin' | 'guest' | 'none';
  onOpenMontana: () => void;
  onOpenDashboardAI: () => void;
  onRequestLogin: () => void;
}

const GUEST_ALLOWED_IDS = ['carbon', 'height', 'news-2025', 'weather', 'peta'];

export const MenuGrid: React.FC<MenuGridProps> = ({ role, onOpenMontana, onOpenDashboardAI, onRequestLogin }) => {
  
  const handleMenuClick = (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault();

    if (role === 'none') {
      onRequestLogin();
      return;
    }

    if (role === 'guest') {
      if (GUEST_ALLOWED_IDS.includes(item.id)) {
        window.open(item.href, '_blank', 'noopener,noreferrer');
      } else {
        alert("Fitur ini memerlukan hak akses Administrator.");
      }
      return;
    }

    if (item.id === 'montana-v2') {
      onOpenMontana();
      return;
    }

    if (item.id === 'db-bibit-ai') {
      onOpenDashboardAI();
      return;
    }

    window.open(item.href, '_blank', 'noopener,noreferrer');
  };

  const isLocked = (itemId: string) => {
    if (role === 'none') return true;
    if (role === 'guest' && !GUEST_ALLOWED_IDS.includes(itemId)) return true;
    return false;
  };

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {MENU_ITEMS.map((item) => {
        const locked = isLocked(item.id);
        return (
          <a 
            key={item.id}
            href={item.href}
            onClick={(e) => handleMenuClick(e, item)}
            className={`group relative flex flex-col items-center justify-center p-4 py-6 bg-white dark:bg-slate-900 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-slate-200 dark:hover:shadow-none hover:-translate-y-1 active:scale-95 overflow-hidden ${locked ? 'opacity-60 grayscale-[0.5]' : 'opacity-100'}`}
          >
            {item.badge && !locked && (
              <span className={`absolute top-2 right-2 px-1.5 py-0.5 text-white text-[6px] font-black uppercase rounded-full shadow-sm z-10 tracking-widest ${item.badge === 'Admin' ? 'bg-slate-900' : 'bg-emerald-600'}`}>
                {item.badge}
              </span>
            )}

            {locked && (
               <div className="absolute top-3 right-3 w-4 h-4 bg-slate-900 dark:bg-slate-800 rounded-full flex items-center justify-center z-10">
                  <i className="fas fa-lock text-[6px] text-white"></i>
               </div>
            )}
            
            <div className={`w-11 h-11 mb-3 rounded-2xl flex items-center justify-center text-lg transition-all duration-500 ${locked ? 'bg-slate-50 dark:bg-slate-950 text-slate-300' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:scale-110'}`}>
              <i className={`fas ${item.icon}`}></i>
            </div>

            <span className={`text-[9px] font-bold text-center leading-tight px-1 uppercase tracking-tight transition-colors ${locked ? 'text-slate-400 dark:text-slate-500' : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-50'}`}>
              {item.title}
            </span>
            
            {!locked && <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/[0.03] group-hover:to-transparent transition-all duration-500"></div>}
          </a>
        );
      })}
    </div>
  );
};