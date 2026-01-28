
import React from 'react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAuthenticated: boolean;
  userRole: 'admin' | 'guest' | 'none';
  onOpenMontana: () => void;
  onRequestLogin: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ 
  activeTab, 
  setActiveTab, 
  isAuthenticated, 
  userRole,
  onOpenMontana, 
  onRequestLogin 
}) => {

  const navItems = [
    { id: 'home', icon: 'fa-house', label: 'Home' },
    { id: 'peta', icon: 'fa-map-location-dot', label: 'Maps', external: 'https://ebastari.github.io/Realisasi-pekerjaan/Realisasi2025.html' },
    { id: 'montana', icon: 'fa-camera', label: 'Capture', isMontana: true, isAdminOnly: true },
    { id: 'notif', icon: 'fa-bell', label: 'Alerts', external: 'https://ebastari.github.io/notifikasi/notif.html', isAdminOnly: true },
    { id: 'profile', icon: isAuthenticated ? 'fa-user-gear' : 'fa-door-open', label: isAuthenticated ? 'Settings' : 'Login', isAuthTrigger: true }
  ];

  const handleNavClick = (item: any) => {
    if (item.isAuthTrigger) {
      if (isAuthenticated) {
        setActiveTab('profile');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        onRequestLogin();
      }
      return;
    }

    if (!isAuthenticated) {
      onRequestLogin();
      return;
    }

    if (item.isAdminOnly && userRole !== 'admin') {
      alert("Akses Administrator diperlukan.");
      return;
    }

    if (item.isMontana) {
      onOpenMontana();
      return;
    }

    if (item.external) {
      window.open(item.external, '_blank', 'noopener,noreferrer');
    } else {
      setActiveTab(item.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-8 pb-10 z-[80] pointer-events-none">
      <div className="max-w-[480px] mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-[40px] rounded-[32px] border border-white/40 dark:border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.3)] flex justify-around p-2 pointer-events-auto ring-1 ring-black/5 dark:ring-white/10">
        {navItems.map((item) => {
          const isCurrent = activeTab === item.id || (item.isAuthTrigger && activeTab === 'profile');
          const isLocked = !isAuthenticated && !item.isAuthTrigger;
          const isRoleLocked = item.isAdminOnly && userRole === 'guest';
          
          return (
            <button 
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center justify-center py-4 px-1 rounded-[24px] transition-all duration-500 relative flex-1 group ${isCurrent ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'} ${(isLocked || isRoleLocked) ? 'opacity-40 grayscale' : 'opacity-100'}`}
            >
              {isCurrent && (
                <div className="absolute inset-1.5 bg-emerald-500/10 dark:bg-emerald-400/20 rounded-[18px] animate-pulse transition-all"></div>
              )}
              <i className={`fas ${item.icon} text-xl mb-1 relative z-10 transition-transform ${isCurrent ? 'scale-110 translate-y-[-2px]' : 'group-hover:scale-110 group-hover:translate-y-[-1px]'}`}></i>
              <span className={`text-[9px] font-black uppercase tracking-[0.15em] relative z-10 transition-all duration-300 ${isCurrent ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}`}>
                  {item.label}
              </span>
              {(isLocked || isRoleLocked) && (
                <div className="absolute top-2 right-2 text-[8px] opacity-70">
                  <i className="fas fa-lock text-slate-400"></i>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
