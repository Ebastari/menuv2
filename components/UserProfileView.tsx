
import React from 'react';
import { UserProfile as UserProfileType } from '../types';

interface UserProfileProps {
  user: UserProfileType;
  onEdit: () => void;
  onLogout: () => void;
}

export const UserProfileView: React.FC<UserProfileProps> = ({ user, onEdit, onLogout }) => {
  return (
    <div className="animate-fadeIn space-y-8 pb-20">
      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[44px] p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-1000"></div>
        
        <div className="flex flex-col items-center text-center relative z-10">
          <div className="relative mb-8">
            <img
              src={user.photo || 'https://ui-avatars.com/api/?name=User&background=cbd5e1&color=fff'}
              className="w-32 h-32 rounded-[40px] object-cover border-4 border-white dark:border-slate-800 shadow-2xl transform group-hover:rotate-3 transition-transform duration-500"
              alt={user.name}
            />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full shadow-lg"></div>
          </div>
          
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">{user.name}</h2>
          <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.4em] mt-3 bg-emerald-500/5 px-4 py-1.5 rounded-full inline-block">
            {user.jabatan || 'Anggota Lapangan'}
          </p>
          
          <div className="flex gap-4 mt-10 w-full">
            <button
              onClick={onEdit}
              className="flex-1 py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
            >
              <i className="fas fa-user-pen"></i> Edit Profil
            </button>
            <button
              onClick={onLogout}
              className="flex-1 py-4 bg-rose-500/10 text-rose-600 rounded-[24px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-rose-500 hover:text-white active:scale-95 transition-all"
            >
              <i className="fas fa-power-off"></i> Keluar
            </button>
          </div>
        </div>
      </div>

      {/* Account Details Matrix */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Informasi Akun Terverifikasi</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-5 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-[28px] border border-slate-100 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-slate-800">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center justify-center text-lg">
              <i className="fas fa-envelope-open-text"></i>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Email Korespondensi</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{user.email || 'Belum ditautkan'}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-[28px] border border-slate-100 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-slate-800">
            <div className="w-12 h-12 bg-blue-500/10 text-blue-600 rounded-2xl flex items-center justify-center text-lg">
              <i className="fas fa-phone-volume"></i>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">WhatsApp Aktif</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{user.telepon || 'Belum terdaftar'}</p>
            </div>
          </div>

          <div className="flex items-center gap-5 p-5 bg-slate-50 dark:bg-slate-800/40 rounded-[28px] border border-slate-100 dark:border-white/5 transition-all hover:bg-white dark:hover:bg-slate-800">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-600 rounded-2xl flex items-center justify-center text-lg">
              <i className="fas fa-id-badge"></i>
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Peran Struktural</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{user.jabatan || 'Anggota Lapangan'}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-white/5 flex justify-center">
           <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
             <i className="fas fa-shield-halved text-emerald-500"></i>
             Data dilindungi oleh Montana ID Sync
           </p>
        </div>
      </div>
    </div>
  );
};
