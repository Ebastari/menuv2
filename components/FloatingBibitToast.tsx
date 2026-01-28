import React, { useState, useEffect, useMemo } from 'react';

// ==========================================
// 1. Interfaces & Types
// ==========================================
interface BibitData {
  id: string | number;
  row: number;
  Tanggal: string;
  Bibit: string;
  Masuk: number;
  Keluar: number;
  Mati: number;
  Sumber: string;
  Tujuan: string;
  __date: Date;
}

interface StatsData {
  totalMasuk: number;
  totalKeluar: number;
  totalMati: number;
  totalStok: number;
  jenisCount: number;
}

interface SengonStats {
  totalSengon: number;
  lastDate: Date | null;
  hasData: boolean;
}

interface BibitSystemProps {
  isModalOpen: boolean;
  onCloseModal: () => void;
}

// ==========================================
// 2. Helper Functions
// ==========================================

// Parse Tanggal Format Indo (DD/MM/YYYY)
const parseIndoDate = (str: string): Date => {
  if (!str) return new Date();
  const parts = String(str).split('/');
  if (parts.length !== 3) return new Date(); // Fallback to now if invalid
  
  const d = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  const y = parseInt(parts[2], 10);
  
  // Month js mulai dari 0
  const date = new Date(y, m - 1, d);
  return isNaN(date.getTime()) ? new Date() : date;
};

// Pembersih Angka
const toNum = (v: any): number => {
  if (v === null || v === undefined || v === "") return 0;
  if (typeof v === "number" && isFinite(v)) return v;
  let s = String(v).replace(/\s+/g, '');
  // Handle format indonesia 1.000,00 atau 1,000.00 logic sederhana: hapus koma
  const n = parseFloat(s.replace(/,/g, '')); 
  return isNaN(n) ? 0 : n;
};

// ==========================================
// 3. Sub-Component: Toast Notification
// ==========================================
const FloatingBibitToast: React.FC<{ data: BibitData | null; onClose: () => void }> = ({ data, onClose }) => {
  console.log('FloatingBibitToast render, data:', data);

  useEffect(() => {
    if (data) {
      console.log('Setting auto-close timer for toast');
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [data, onClose]);

  if (!data) {
    console.log('No data, returning null');
    return null;
  }

  console.log('Rendering toast with data:', data);

  const formatContent = () => {
    const parts = [];
    if (data.Masuk > 0) parts.push(`${data.Masuk} ${data.Bibit} Masuk`);
    if (data.Keluar > 0) parts.push(`${data.Keluar} ${data.Bibit} Keluar`);
    if (data.Mati > 0) parts.push(`${data.Mati} ${data.Bibit} Mati`);
    return parts.join(' | ');
  };

  const getDestination = () => {
    if (data.Tujuan) return `ke ${data.Tujuan}`;
    if (data.Sumber) return `dari ${data.Sumber}`;
    return '';
  };

  const displayDate = data.__date.toLocaleDateString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] animate-slideDown">
      <div className="bg-slate-900/95 text-white backdrop-blur-md rounded-full px-6 py-3 shadow-2xl border border-slate-700 flex items-center gap-4">
        <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20 text-xl">🌱</div>
        <div className="text-sm">
          <div className="text-xs text-slate-400 flex items-center gap-2 mb-0.5">
            <span>{displayDate}</span>
            <span className="w-1 h-1 bg-slate-500 rounded-full"></span>
            <span className="text-emerald-400 font-bold text-[10px] tracking-wider uppercase">UPDATE BIBIT</span>
          </div>
          <div className="font-bold text-white whitespace-nowrap">{formatContent()}</div>
          <div className="text-xs text-slate-300 mt-0.5">{getDestination()}</div>
        </div>
        <button onClick={onClose} className="w-6 h-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all">✕</button>
      </div>
    </div>
  );
};

// ==========================================
// 4. Main Component (Logic & Modal)
// ==========================================
export const BibitNotificationSystem: React.FC<BibitSystemProps> = ({ isModalOpen, onCloseModal }) => {
  // State Data Utama
  const [bibitData, setBibitData] = useState<BibitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State Toast
  const [toastData, setToastData] = useState<BibitData | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  console.log('BibitNotificationSystem render, toastData:', toastData);

  // State Stats (Dihitung otomatis via useEffect)
  const [stats, setStats] = useState<StatsData>({
    totalMasuk: 0, totalKeluar: 0, totalMati: 0, totalStok: 0, jenisCount: 0
  });
  
  const [sengonStats, setSengonStats] = useState<SengonStats>({
    totalSengon: 0, lastDate: null, hasData: false
  });

  const SHEET_URL = "https://script.google.com/macros/s/AKfycby09rbjwN2EcVRwhsNBx8AREI7k41LY1LrZ-W4U36HmzMB5BePD9h8wBSVPJwa_Ycduvw/exec?sheet=Bibit";
  const LS_KEY_FINGERPRINT = "last_bibit_fingerprint_v2";

  // -------------------------------------------
  // A. FETCH & WATCHER LOGIC
  // -------------------------------------------
  const fetchData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setLoading(true);
      
      const res = await fetch(SHEET_URL);
      if (!res.ok) throw new Error("Gagal mengambil data");
      
      const json = await res.json();
      let rawRows = [];
      if (Array.isArray(json)) rawRows = json;
      else if (json.Bibit) rawRows = json.Bibit;
      else if (json.data) rawRows = json.data;

      // 1. Mapping & Parsing (Wajib: ID, Row, Date Manual)
      const normalized: BibitData[] = rawRows.map((r: any) => ({
        id: r.Id || r.id || '0',
        row: toNum(r["Row Number"] || r.row_number || 0),
        Tanggal: r.Tanggal || '',
        Bibit: String(r.Bibit || r.Jenis || '').trim(),
        Masuk: toNum(r.Masuk || r.In),
        Keluar: toNum(r.Keluar || r.Out),
        Mati: toNum(r.Mati),
        Sumber: r.Sumber || r.Asal || '',
        Tujuan: r.Tujuan || '',
        __date: parseIndoDate(r.Tanggal) // Gunakan parser manual
      })).filter(d => d.Bibit !== ""); // Filter baris kosong

      // Update State Data Utama
      setBibitData(normalized);
      setError(null);

      // 2. Logic Toast: Cek Aktivitas Hari Ini
      if (normalized.length > 0) {
        const today = new Date();
        console.log('Today:', today.toDateString());
        console.log('Total data:', normalized.length);

        // Filter data hari ini yang memiliki aktivitas (masuk/keluar/mati)
        const todayActivities = normalized.filter(r => {
          const isToday = r.__date.getDate() === today.getDate() &&
                         r.__date.getMonth() === today.getMonth() &&
                         r.__date.getFullYear() === today.getFullYear();
          const hasActivity = r.Masuk > 0 || r.Keluar > 0 || r.Mati > 0;

          console.log('Row:', r.row, 'Date:', r.__date.toDateString(), 'IsToday:', isToday, 'HasActivity:', hasActivity, 'Masuk:', r.Masuk, 'Keluar:', r.Keluar, 'Mati:', r.Mati);

          return isToday && hasActivity;
        });

        console.log('Today activities found:', todayActivities.length);

        if (todayActivities.length > 0) {
          // Ambil aktivitas terbaru hari ini
          const latestActivity = todayActivities.sort((a, b) => b.row - a.row)[0];
          console.log('Latest activity:', latestActivity);

          const todayStr = today.toLocaleDateString('id-ID', {
            day: '2-digit', month: 'short', year: 'numeric'
          });

          // Buat Fingerprint berdasarkan aktivitas terbaru
          const currentFp = `${latestActivity.row}-${latestActivity.Masuk}-${latestActivity.Keluar}-${latestActivity.Mati}`;
          const storedFp = localStorage.getItem(LS_KEY_FINGERPRINT);

          console.log('Current FP:', currentFp, 'Stored FP:', storedFp);

          // Selalu tampilkan toast pada reload halaman jika ada aktivitas hari ini
          console.log('Showing toast on page load');
          setToastData(latestActivity);

          // Simpan Fingerprint Baru
          localStorage.setItem(LS_KEY_FINGERPRINT, currentFp);
        } else {
          console.log('No activities found for today');
        }
      } else {
        console.log('No normalized data');
      }

    } catch (err) {
      console.error("Bibit Fetch Error:", err);
      if (isManualRefresh) setError("Gagal memuat data terbaru.");
    } finally {
      if (isManualRefresh) setLoading(false);
      else if (loading) setLoading(false); // Matikan loading awal
    }
  };

  // Effect: Polling Data (Initial + Interval)
  useEffect(() => {
    fetchData(); // Load pertama
    const interval = setInterval(() => fetchData(), 30000); // Cek setiap 30 detik
    return () => clearInterval(interval);
  }, []);

  // -------------------------------------------
  // B. CALCULATION LOGIC (Reactive)
  // -------------------------------------------
  useEffect(() => {
    if (!bibitData.length) return;

    // 1. Hitung Stats Umum
    const newStats = bibitData.reduce((acc, curr) => ({
      totalMasuk: acc.totalMasuk + curr.Masuk,
      totalKeluar: acc.totalKeluar + curr.Keluar,
      totalMati: acc.totalMati + curr.Mati,
      totalStok: 0, // dihitung dibawah
      jenisCount: 0 // dihitung dibawah
    }), { totalMasuk: 0, totalKeluar: 0, totalMati: 0, totalStok: 0, jenisCount: 0 });

    newStats.totalStok = newStats.totalMasuk - newStats.totalKeluar - newStats.totalMati;
    newStats.jenisCount = new Set(bibitData.map(b => b.Bibit)).size;
    
    setStats(newStats);

    // 2. Hitung Stats SENGON (Dinamis)
    const sengonData = bibitData.filter(r => r.Bibit.toLowerCase().includes("sengon"));
    
    if (sengonData.length > 0) {
      const sMasuk = sengonData.reduce((s, r) => s + r.Masuk, 0);
      const sKeluar = sengonData.reduce((s, r) => s + r.Keluar, 0);
      const sMati = sengonData.reduce((s, r) => s + r.Mati, 0);
      
      // Cari tanggal terakhir dari data sengon (bukan global)
      // Sort by Date Descending
      const sortedSengon = [...sengonData].sort((a, b) => b.__date.getTime() - a.__date.getTime());
      
      setSengonStats({
        totalSengon: sMasuk - sKeluar - sMati,
        lastDate: sortedSengon[0].__date,
        hasData: true
      });
    } else {
      setSengonStats({ totalSengon: 0, lastDate: null, hasData: false });
    }

  }, [bibitData]);

  // Data 10 Terakhir untuk Tabel (Sort by Date)
  const latestEntries = useMemo(() => {
    return [...bibitData]
      .sort((a, b) => b.__date.getTime() - a.__date.getTime())
      .slice(0, 10);
  }, [bibitData]);


  // -------------------------------------------
  // C. RENDER UI
  // -------------------------------------------
  return (
    <>
      {/* 1. Toast Notification (Always Active) */}
      <FloatingBibitToast data={toastData} onClose={() => setToastData(null)} />

      {/* 2. Modal Notification (Conditional) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-3xl">
          <div className="absolute inset-0" onClick={onCloseModal}></div>

          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl border border-white/50 dark:border-slate-800 max-h-[90vh] overflow-y-auto no-scrollbar animate-fadeIn">
            <button onClick={onCloseModal} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 z-10">
              <i className="fas fa-times"></i>
            </button>

            <div className="space-y-6">
              {/* Header */}
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto shadow-2xl shadow-emerald-600/20">
                  <i className="fas fa-bell"></i>
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">Notifikasi Bibit</h1>
                <p className="text-slate-600 dark:text-slate-400">Monitoring Real-time & Kalkulasi Stok</p>
              </div>

              {/* Refresh Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => fetchData(true)}
                  disabled={loading}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:bg-slate-400 transition-all flex items-center gap-2"
                >
                  <i className={`fas fa-sync-alt ${loading ? 'animate-spin' : ''}`}></i>
                  {loading ? 'Memuat...' : 'Perbarui Data'}
                </button>
              </div>

              {error && (
                <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 text-center text-rose-700 font-medium">
                  {error}
                </div>
              )}

              {/* General Stats */}
              {!loading && !error && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <StatCard label="Masuk" value={stats.totalMasuk} color="emerald" />
                  <StatCard label="Keluar" value={stats.totalKeluar} color="blue" />
                  <StatCard label="Mati" value={stats.totalMati} color="rose" />
                  <StatCard label="Stok Global" value={stats.totalStok} color="purple" />
                  <StatCard label="Jenis" value={stats.jenisCount} color="amber" isCount />
                </div>
              )}

              {/* Sengon Dynamic Stats */}
              {!loading && !error && (
                <div className="bg-orange-50 dark:bg-orange-900/10 rounded-2xl p-6 border border-orange-100 dark:border-orange-800">
                  <h3 className="text-lg font-black text-orange-900 dark:text-orange-100 mb-4 flex items-center gap-2">
                    <i className="fas fa-tree"></i> Live Update: SENGON
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                      <div className="text-orange-700 dark:text-orange-400 text-sm font-bold">Stok Sengon</div>
                      <div className="text-3xl font-black text-orange-800 dark:text-orange-200">
                        {sengonStats.hasData ? sengonStats.totalSengon.toLocaleString('id-ID') : '0'}
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                        Total Masuk - Total Keluar - Total Mati
                      </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                      <div className="text-orange-700 dark:text-orange-400 text-sm font-bold">Aktivitas Terakhir</div>
                      <div className="text-lg font-black text-orange-800 dark:text-orange-200">
                        {sengonStats.lastDate ? sengonStats.lastDate.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </div>
                      <div className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                        Berdasarkan input data SENGON terbaru
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Table Data */}
              {!loading && !error && latestEntries.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <i className="fas fa-clock"></i> Riwayat Terbaru
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 dark:bg-slate-700">
                        <tr>
                          <th className="p-3 text-left font-bold text-slate-700 dark:text-slate-300">Tanggal</th>
                          <th className="p-3 text-left font-bold text-slate-700 dark:text-slate-300">Bibit</th>
                          <th className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">M</th>
                          <th className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">K</th>
                          <th className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">†</th>
                          <th className="p-3 text-left font-bold text-slate-700 dark:text-slate-300">Ket</th>
                        </tr>
                      </thead>
                      <tbody>
                        {latestEntries.map((entry, idx) => (
                          <tr key={`${entry.id}-${idx}`} className="border-b border-slate-200 dark:border-slate-600">
                            <td className="p-3 whitespace-nowrap dark:text-slate-300">
                              {entry.__date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                            </td>
                            <td className="p-3 font-medium dark:text-white">{entry.Bibit}</td>
                            <td className="p-3 text-center text-emerald-600 font-bold">{entry.Masuk || '-'}</td>
                            <td className="p-3 text-center text-blue-600 font-bold">{entry.Keluar || '-'}</td>
                            <td className="p-3 text-center text-rose-600 font-bold">{entry.Mati || '-'}</td>
                            <td className="p-3 text-xs text-slate-500">{entry.Tujuan || entry.Sumber}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Helper Component untuk Card Statistik
const StatCard = ({ label, value, color, isCount = false }: { label: string, value: number, color: string, isCount?: boolean }) => {
  // Mapping class warna Tailwind dinamis
  const colors: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-800 dark:bg-emerald-900/10 dark:text-emerald-200 border-emerald-100 dark:border-emerald-800",
    blue: "bg-blue-50 text-blue-800 dark:bg-blue-900/10 dark:text-blue-200 border-blue-100 dark:border-blue-800",
    rose: "bg-rose-50 text-rose-800 dark:bg-rose-900/10 dark:text-rose-200 border-rose-100 dark:border-rose-800",
    purple: "bg-purple-50 text-purple-800 dark:bg-purple-900/10 dark:text-purple-200 border-purple-100 dark:border-purple-800",
    amber: "bg-amber-50 text-amber-800 dark:bg-amber-900/10 dark:text-amber-200 border-amber-100 dark:border-amber-800",
  };
  
  const labelColors: Record<string, string> = {
    emerald: "text-emerald-700 dark:text-emerald-400",
    blue: "text-blue-700 dark:text-blue-400",
    rose: "text-rose-700 dark:text-rose-400",
    purple: "text-purple-700 dark:text-purple-400",
    amber: "text-amber-700 dark:text-amber-400",
  };

  return (
    <div className={`${colors[color]} rounded-2xl p-4 border`}>
      <div className={`${labelColors[color]} text-sm font-bold`}>{label}</div>
      <div className="text-2xl font-black">
        {isCount ? value : value.toLocaleString('id-ID')}
      </div>
    </div>
  );
};