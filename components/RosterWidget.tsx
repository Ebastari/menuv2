import React, { useState, useMemo } from 'react';

interface RosterMember {
  id: string;
  name: string;
  role: string;
  shiftToday: 'D' | 'THR' | 'OFF';
  color: string;
  history: { date: string; shift: string }[];
  monthlySchedule: { date: string; shift: string }[];
}

const DATES = [
  '26 Jan', '27 Jan', '28 Jan', '29 Jan', '30 Jan', '31 Jan',
  '1 Feb', '2 Feb', '3 Feb', '4 Feb', '5 Feb', '6 Feb', '7 Feb', '8 Feb', '9 Feb', '10 Feb',
  '11 Feb', '12 Feb', '13 Feb', '14 Feb', '15 Feb', '16 Feb', '17 Feb', '18 Feb', '19 Feb', '20 Feb',
  '21 Feb', '22 Feb', '23 Feb', '24 Feb', '25 Feb'
];

const SHIFTS_DATA = {
  '1': ['THR','THR','D','D','D','THR','OFF','THR','THR','D','D','D','THR','OFF','THR','THR','D','D','D','THR','OFF','THR','THR','D','D','D','THR','OFF','THR','THR','D'],
  '2': ['D','D','D','D','D','D','OFF','D','D','D','D','D','D','OFF','D','D','D','D','D','D','OFF','D','D','D','D','D','D','OFF','D','D','D'],
  '3': ['THR','THR','THR','THR','THR','THR','OFF','THR','THR','THR','THR','THR','THR','OFF','THR','THR','THR','THR','THR','THR','OFF','THR','THR','THR','THR','THR','THR','OFF','THR','THR','THR'],
  '4': ['D','D','D','D','D','D','OFF','D','D','D','D','D','D','OFF','D','D','D','D','D','D','OFF','D','D','D','D','D','D','OFF','D','D','D'],
  '5': ['D','D','D','D','D','D','OFF','D','D','D','D','D','D','OFF','D','D','D','D','D','D','OFF','D','D','D','D','D','D','OFF','D','D','D'],
  '6': ['THR','THR','THR','THR','THR','THR','OFF','THR','THR','THR','THR','THR','THR','OFF','THR','THR','THR','THR','THR','THR','OFF','THR','THR','THR','THR','THR','THR','OFF','THR','THR','THR'],
  '7': ['D','D','D','D','D','D','OFF','D','D','D','D','D','D','OFF','D','D','D','D','D','D','OFF','D','D','D','D','D','D','OFF','D','D','D'],
  '8': ['D','D','D','D','D','D','OFF','D','D','D','D','D','D','OFF','D','D','D','D','D','D','OFF','D','D','D','D','D','D','OFF','D','D','D'],
  '9': ['THR','THR','THR','THR','THR','THR','OFF','THR','THR','THR','THR','THR','THR','OFF','THR','THR','THR','THR','THR','THR','OFF','THR','THR','THR','THR','THR','THR','OFF','THR','THR','THR'],
  '10': ['OFF','D','D','D','OFF','OFF','OFF','OFF','OFF','D','D','D','OFF','OFF','OFF','OFF','D','D','D','D','OFF','OFF','OFF','D','D','D','D','OFF','OFF','OFF','D'],
  '11': ['OFF','D','D','D','OFF','OFF','OFF','OFF','OFF','D','D','D','OFF','OFF','OFF','OFF','D','D','D','D','OFF','OFF','OFF','D','D','D','D','OFF','OFF','OFF','D'],
  '12': ['D','OFF','OFF','OFF','D','D','D','D','D','OFF','OFF','OFF','D','D','D','D','OFF','OFF','OFF','OFF','D','D','D','OFF','OFF','D','D','OFF','OFF','OFF','OFF']
};

const TEAM_DATA: RosterMember[] = [
  { id: '1', name: "Mariano Alvarado Simamora", role: "REVEGETATION & REHABILITATION", shiftToday: "D", color: "#4f46e5", history: [{date: '27 Jan', shift: 'THR'}, {date: '28 Jan', shift: 'D'}, {date: '29 Jan', shift: 'D'}], monthlySchedule: DATES.map((date, i) => ({ date, shift: SHIFTS_DATA['1'][i] })) },
  { id: '2', name: "Agung Laksono", role: "REVEGETATION SECTION HEAD", shiftToday: "D", color: "#0ea5e9", history: [{date: '27 Jan', shift: 'D'}, {date: '28 Jan', shift: 'D'}, {date: '29 Jan', shift: 'D'}], monthlySchedule: DATES.map((date, i) => ({ date, shift: SHIFTS_DATA['2'][i] })) },
  { id: '3', name: "M. Jembar Suryana", role: "REHABILITATION SECTION HEAD", shiftToday: "THR", color: "#f59e0b", history: [{date: '27 Jan', shift: 'THR'}, {date: '28 Jan', shift: 'THR'}, {date: '29 Jan', shift: 'THR'}], monthlySchedule: DATES.map((date, i) => ({ date, shift: SHIFTS_DATA['3'][i] })) },
  { id: '4', name: "Syahrudin", role: "NURSERY GROUP LEADER", shiftToday: "D", color: "#10b981", history: [{date: '27 Jan', shift: 'D'}, {date: '28 Jan', shift: 'D'}, {date: '29 Jan', shift: 'D'}], monthlySchedule: DATES.map((date, i) => ({ date, shift: SHIFTS_DATA['4'][i] })) },
  { id: '5', name: "Edwin Aldoin Daniel Hutagalung", role: "REVEGETATION FGDP", shiftToday: "D", color: "#8b5cf6", history: [{date: '27 Jan', shift: 'D'}, {date: '28 Jan', shift: 'D'}, {date: '29 Jan', shift: 'D'}], monthlySchedule: DATES.map((date, i) => ({ date, shift: SHIFTS_DATA['5'][i] })) },
  { id: '6', name: "M. Noor Jamaludin", role: "REHABILITATION GROUP LEADER", shiftToday: "THR", color: "#ec4899", history: [{date: '27 Jan', shift: 'THR'}, {date: '28 Jan', shift: 'THR'}, {date: '29 Jan', shift: 'THR'}], monthlySchedule: DATES.map((date, i) => ({ date, shift: SHIFTS_DATA['6'][i] })) },
  { id: '7', name: "Muhammad Syahrani", role: "REVEGETATION CREW", shiftToday: "D", color: "#6366f1", history: [{date: '27 Jan', shift: 'D'}, {date: '28 Jan', shift: 'D'}, {date: '29 Jan', shift: 'D'}], monthlySchedule: DATES.map((date, i) => ({ date, shift: SHIFTS_DATA['7'][i] })) },
  { id: '8', name: "Ristian Efendi", role: "REVEGETATION CREW", shiftToday: "D", color: "#14b8a6", history: [{date: '27 Jan', shift: 'D'}, {date: '28 Jan', shift: 'D'}, {date: '29 Jan', shift: 'D'}], monthlySchedule: DATES.map((date, i) => ({ date, shift: SHIFTS_DATA['8'][i] })) },
  { id: '9', name: "Pahrul Zaini", role: "REHABILITATION CREW", shiftToday: "THR", color: "#f43f5e", history: [{date: '27 Jan', shift: 'THR'}, {date: '28 Jan', shift: 'THR'}, {date: '29 Jan', shift: 'THR'}], monthlySchedule: DATES.map((date, i) => ({ date, shift: SHIFTS_DATA['9'][i] })) },
  { id: '10', name: "M. Syahrani (KHL)", role: "REVEGETATION CREW", shiftToday: "D", color: "#22c55e", history: [{date: '27 Jan', shift: 'D'}, {date: '28 Jan', shift: 'D'}, {date: '29 Jan', shift: 'D'}], monthlySchedule: DATES.map((date, i) => ({ date, shift: SHIFTS_DATA['10'][i] })) },
  { id: '11', name: "Arbani (KHL)", role: "REVEGETATION CREW", shiftToday: "D", color: "#64748b", history: [{date: '27 Jan', shift: 'D'}, {date: '28 Jan', shift: 'D'}, {date: '29 Jan', shift: 'D'}], monthlySchedule: DATES.map((date, i) => ({ date, shift: SHIFTS_DATA['11'][i] })) },
  { id: '12', name: "Ahmad Risky Awali (KHL)", role: "REVEGETATION CREW", shiftToday: "OFF", color: "#a855f7", history: [{date: '27 Jan', shift: 'OFF'}, {date: '28 Jan', shift: 'OFF'}, {date: '29 Jan', shift: 'OFF'}], monthlySchedule: DATES.map((date, i) => ({ date, shift: SHIFTS_DATA['12'][i] })) }
];

export const RosterWidget: React.FC = () => {
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'today' | 'full'>('today');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const stats = useMemo(() => {
    return {
      d: TEAM_DATA.filter(p => p.shiftToday === 'D').length,
      thr: TEAM_DATA.filter(p => p.shiftToday === 'THR').length,
      off: TEAM_DATA.filter(p => p.shiftToday === 'OFF').length,
      total: TEAM_DATA.length
    };
  }, []);

  const filteredTeam = TEAM_DATA.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.role.toLowerCase().includes(search.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  };

  return (
    <div className="space-y-6 animate-drift-puff">
      {/* Header & Search */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight uppercase leading-none">
              Status Tim <span className="text-emerald-600 dark:text-emerald-400">Revegetasi</span>
            </h1>
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mt-2">Rabu, 28 Januari 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 text-[11px]"></i>
              <input 
                type="text" 
                placeholder="Cari personil..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 pr-5 py-3 bg-white/60 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] font-black uppercase tracking-widest focus:ring-2 focus:ring-emerald-500 outline-none w-40 sm:w-56 transition-all dark:text-slate-100 dark:placeholder:text-slate-700 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 p-5 rounded-[28px] backdrop-blur-md shadow-sm">
            <p className="text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1 leading-none">Shift Siang</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter tabular-nums">{stats.d}</h2>
          </div>
          <div className="bg-orange-500/10 dark:bg-orange-500/20 border border-orange-500/20 p-5 rounded-[28px] backdrop-blur-md shadow-sm">
            <p className="text-orange-600 dark:text-orange-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1 leading-none">Tahura-DAS</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter tabular-nums">{stats.thr}</h2>
          </div>
          <div className="bg-slate-500/10 dark:bg-slate-500/20 border border-slate-500/20 p-5 rounded-[28px] backdrop-blur-md shadow-sm">
            <p className="text-slate-500 dark:text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1 leading-none">Total Crew</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter tabular-nums">{stats.total}</h2>
          </div>
          <div className="bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 p-5 rounded-[28px] backdrop-blur-md shadow-sm">
            <p className="text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1 leading-none">Libur (OFF)</p>
            <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter tabular-nums">{stats.off}</h2>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200 dark:border-slate-800/60 px-2">
        <button 
          onClick={() => setView('today')} 
          className={`pb-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative ${view === 'today' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600 hover:text-slate-800'}`}
        >
          Hari Ini
          {view === 'today' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-fadeIn"></div>}
        </button>
        <button 
          onClick={() => setView('full')} 
          className={`pb-4 text-[11px] font-black uppercase tracking-[0.3em] transition-all relative ${view === 'full' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600 hover:text-slate-800'}`}
        >
          Seluruh Jadwal
          {view === 'full' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 dark:bg-emerald-400 rounded-full animate-fadeIn"></div>}
        </button>
      </div>

      {/* Content Area */}
      {view === 'today' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredTeam.map(p => (
            <div 
              key={p.id}
              onClick={() => setSelectedMemberId(selectedMemberId === p.id ? null : p.id)}
              className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl p-5 rounded-[32px] border border-slate-100 dark:border-slate-800/80 shadow-xl shadow-slate-200/20 dark:shadow-none flex items-center gap-5 group cursor-pointer hover:-translate-y-1.5 transition-all"
            >
              <div className="relative">
                <div className="w-14 h-14 rounded-[24px] flex items-center justify-center text-white font-black text-sm shadow-xl" style={{ backgroundColor: p.color }}>
                  {getInitials(p.name)}
                </div>
                <div className={`absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full border-[3px] border-white dark:border-slate-900 shadow-md ${p.shiftToday === 'D' ? 'bg-emerald-500' : (p.shiftToday === 'THR' ? 'bg-orange-500' : 'bg-slate-300')}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-black text-slate-900 dark:text-slate-100 text-[14px] truncate uppercase tracking-tight">{p.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 truncate">{p.role}</p>
                <div className="mt-3">
                   <span className={`inline-block px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-[0.15em] shadow-sm ${p.shiftToday === 'D' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : (p.shiftToday === 'THR' ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-600')}`}>
                      {p.shiftToday === 'D' ? 'Shift Siang' : (p.shiftToday === 'THR' ? 'Tahura-DAS' : 'Libur (OFF)')}
                   </span>
                </div>
              </div>
              <div className="text-slate-200 dark:text-slate-800 group-hover:text-emerald-500 transition-colors">
                <i className={`fas ${selectedMemberId === p.id ? 'fa-chevron-down' : 'fa-chevron-right'} text-sm`}></i>
              </div>
            </div>
          ))}
          {filteredTeam.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <i className="fas fa-search text-slate-200 dark:text-slate-800 text-4xl mb-4 block"></i>
              <p className="text-[11px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.4em]">Data tidak ditemukan</p>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl rounded-[36px] border border-slate-100 dark:border-slate-800 shadow-2xl no-scrollbar p-1">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="p-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Anggota Tim</th>
                <th className="p-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">27 Jan</th>
                <th className="p-5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-center bg-emerald-500/5">28 Jan</th>
                <th className="p-5 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">29 Jan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filteredTeam.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black text-white shadow-lg group-hover:rotate-6 transition-transform" style={{ backgroundColor: p.color }}>
                        {getInitials(p.name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[12px] font-black text-slate-900 dark:text-slate-100 uppercase truncate">{p.name}</p>
                        <p className="text-[8px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest truncate">{p.role}</p>
                      </div>
                    </div>
                  </td>
                  {p.history.map((h, i) => (
                    <td key={i} className={`p-5 text-center text-[11px] font-black uppercase tracking-tighter tabular-nums ${h.date === '28 Jan' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/5' : 'text-slate-500 dark:text-slate-600'}`}>
                      {h.shift}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};