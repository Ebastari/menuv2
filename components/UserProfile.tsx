import React from 'react';
import { UserProfile as UserProfileType } from '../types';

interface UserProfileProps {
  user: UserProfileType;
  onEdit: () => void;
  onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onEdit, onLogout }) => {
  return (
    <div className="animate-fadeIn space-y-10 pb-20">
      {/* Header Profile */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"></div>
        <div className="flex flex-col items-center text-center relative z-10">
          <img
            src={user.photo || 'https://ui-avatars.com/api/?name=User&background=cbd5e1&color=fff'}
            className="w-28 h-28 rounded-[40px] object-cover border-4 border-white dark:border-slate-800 shadow-2xl mb-6 bg-slate-100 dark:bg-slate-800"
            alt={user.name}
          />
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{user.name}</h2>
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mt-1 mb-4">{user.jabatan || 'Anggota Lapangan'}</p>
          <div className="flex gap-4">
            <button
              onClick={onEdit}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              <i className="fas fa-edit"></i> Edit Profil
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
            >
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Informasi Akun</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
              <i className="fas fa-envelope text-emerald-600"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{user.email || 'Belum diisi'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <i className="fas fa-phone text-blue-600"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor HP</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{user.telepon || 'Belum diisi'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
              <i className="fas fa-briefcase text-purple-600"></i>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jabatan</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{user.jabatan || 'Anggota Lapangan'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};