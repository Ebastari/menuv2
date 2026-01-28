import React, { useState, useEffect } from 'react';

interface BibitData {
  Tanggal: string;
  Bibit: string;
  Masuk: number;
  Keluar: number;
  Mati: number;
  Sumber: string;
  Tujuan: string;
  __date: Date;
}

interface BibitNotificationProps {
  onClose: () => void;
}

export const BibitNotification: React.FC<BibitNotificationProps> = ({ onClose }) => {
  const [bibitData, setBibitData] = useState<BibitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Stats Umum
  const [stats, setStats] = useState({
    totalMasuk: 0,
    totalKeluar: 0,
    totalMati: 0,
    totalStok: 0,
    jenisCount: 0
  });

  // Stats Khusus SENGON (Dinamis)
  const [sengonStats, setSengonStats] = useState<{
    totalSengon: number;
    lastDate: Date | null;
    hasData: boolean;
  }>({
    totalSengon: 0,
    lastDate: null,
    hasData: false
  });

  const SHEET_URL = "https://script.google.com/macros/s/AKfycby09rbjwN2EcVRwhsNBx8AREI7k41LY1LrZ-W4U36HmzMB5BePD9h8wBSVPJwa_Ycduvw/exec?sheet=Bibit";
  const CACHE_KEY = "montana_bibit_cache_v4";
  const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 jam

  // --- Helper Functions ---
  const toNum = (v: any): number => {
    if (v === null || v === undefined || v === "") return 0;
    if (typeof v === "number" && isFinite(v)) return v;
    let s = String(v).trim();
    s = s.replace(/\s+/g, '');
    const hasDot = s.indexOf('.') !== -1;
    const hasComma = s.indexOf(',') !== -1;

    if (hasDot && hasComma) {
      const lastDot = s.lastIndexOf('.');
      const lastComma = s.lastIndexOf(',');
      if (lastComma > lastDot) {
        s = s.replace(/\./g, '').replace(',', '.');
      } else {
        s = s.replace(/,/g, '');
      }
    } else if (hasComma && !hasDot) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  };

  const parseDate = (v: any): Date | null => {
    if (!v) return null;
    if (v instanceof Date && !isNaN(v.getTime())) return v;
    const s = String(v).trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    }

    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const [d, m, y] = s.split('/').map(Number);
      const dt = new Date(y, m - 1, d);
      return isNaN(dt.getTime()) ? null : dt;
    }

    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  const fetchWithCache = async (url: string) => {
    try {
      localStorage.removeItem("montana_bibit_cache_v1");

      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Date.now() - parsed.time < CACHE_DURATION_MS) {
            return parsed.data;
          }
        } catch (e) {}
      }
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();

      let rows = [];
      if (Array.isArray(json)) rows = json;
      else {
        const arrField = Object.keys(json).find(k => Array.isArray(json[k]));
        rows = arrField ? json[arrField] : [];
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify({ time: Date.now(), data: rows }));
      return rows;
    } catch (e) {
      console.error("fetchWithCache error", e);
      throw e;
    }
  };

  const ensureGamalRaw = (raw: any[]) => {
    return raw.map(r => {
      const bibitRaw = (r.Bibit ?? r.bibit ?? r.Jenis ?? r.jenis ?? "").toString().toLowerCase();
      const isGamal = bibitRaw.includes("gamal");
      if (!isGamal) return r;

      const fix = { ...r };
      fix.Masuk = toNum(fix.Masuk ?? fix.masuk ?? fix.In ?? fix.in ?? 0);
      fix.Keluar = toNum(fix.Keluar ?? fix.keluar ?? fix.Out ?? fix.out ?? 0);
      fix.Mati = toNum(fix.Mati ?? fix.mati ?? 0);

      const tgl = fix.Tanggal ?? fix.tanggal ?? fix.date ?? fix.tgl ?? fix.Date ?? "";
      if (!parseDate(tgl)) {
        fix.Tanggal = new Date().toISOString().slice(0, 10);
      }
      return fix;
    });
  };

  const normalizeRows = (raw: any[]): BibitData[] => {
    return raw.map(r => {
      const Tanggal = r.Tanggal || r.tanggal || r.date || r.tgl || r.Date || '';
      const Bibit = (r.Bibit || r.bibit || r.Jenis || r.jenis || '').toString().trim();
      const Masuk = toNum(r.Masuk || r.masuk || r.In || r.in || 0);
      const Keluar = toNum(r.Keluar || r.keluar || r.Out || r.out || 0);
      const Mati = toNum(r.Mati || r.mati || 0);
      const Sumber = r.Sumber || r.sumber || r.Asal || r.asal || '';
      const Tujuan = r.Tujuan || r.tujuan || '';
      const __date = parseDate(Tanggal);
      return { Tanggal, Bibit, Masuk, Keluar, Mati, Sumber, Tujuan, __date: __date! };
    }).filter(x => x.__date);
  };

  const calculateStats = (data: BibitData[]) => {
    const totalMasuk = data.reduce((s, r) => s + r.Masuk, 0);
    const totalKeluar = data.reduce((s, r) => s + r.Keluar, 0);
    const totalMati = data.reduce((s, r) => s + r.Mati, 0);
    const totalStok = totalMasuk - totalKeluar - totalMati;
    const jenisCount = Array.from(new Set(data.map(r => r.Bibit).filter(Boolean))).length;

    return { totalMasuk, totalKeluar, totalMati, totalStok, jenisCount };
  };

  // --- Load Data Effect ---
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const raw = await fetchWithCache(SHEET_URL);
        const fixedRaw = ensureGamalRaw(raw);
        const normalized = normalizeRows(fixedRaw);
        setBibitData(normalized);
        setStats(calculateStats(normalized));
        // Note: Sengon stats calculation is moved to a separate useEffect dependent on bibitData
      } catch (err) {
        setError('Gagal memuat data bibit. Silakan coba lagi.');
        console.error('Load data error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // --- Calculate Sengon Stats Effect ---
  // Calculates automatically whenever bibitData updates (load or refresh)
  useEffect(() => {
    if (!bibitData || bibitData.length === 0) {
      setSengonStats({ totalSengon: 0, lastDate: null, hasData: false });
      return;
    }

    // 1. Filter Data Sengon
    const sengonData = bibitData.filter(r => 
      r.Bibit && r.Bibit.toLowerCase().includes("sengon")
    );

    if (sengonData.length === 0) {
      setSengonStats({ totalSengon: 0, lastDate: null, hasData: false });
      return;
    }

    // 2. Hitung Total Stok (Masuk - Keluar - Mati)
    const totalMasuk = sengonData.reduce((acc, curr) => acc + curr.Masuk, 0);
    const totalKeluar = sengonData.reduce((acc, curr) => acc + curr.Keluar, 0);
    const totalMati = sengonData.reduce((acc, curr) => acc + curr.Mati, 0);
    const totalSengon = totalMasuk - totalKeluar - totalMati;

    // 3. Cari Data Terakhir (Berdasarkan Tanggal Terbaru)
    // Sort descending by Date
    const sortedSengon = [...sengonData].sort((a, b) => b.__date.getTime() - a.__date.getTime());
    const lastDate = sortedSengon[0].__date;

    setSengonStats({
      totalSengon,
      lastDate,
      hasData: true
    });

  }, [bibitData]);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);
      localStorage.removeItem(CACHE_KEY);
      const raw = await fetchWithCache(SHEET_URL);
      const fixedRaw = ensureGamalRaw(raw);
      const normalized = normalizeRows(fixedRaw);
      setBibitData(normalized);
      setStats(calculateStats(normalized));
    } catch (err) {
      setError('Gagal memperbarui data. Silakan coba lagi.');
      console.error('Refresh data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const latestEntries = bibitData
    .sort((a, b) => {
      const aHasKirim = a.Sumber?.toLowerCase().includes('kirim') || a.Tujuan?.toLowerCase().includes('kirim');
      const bHasKirim = b.Sumber?.toLowerCase().includes('kirim') || b.Tujuan?.toLowerCase().includes('kirim');

      if (aHasKirim && !bHasKirim) return -1;
      if (!aHasKirim && bHasKirim) return 1;
      return b.__date.getTime() - a.__date.getTime();
    })
    .slice(0, 10);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-3xl">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl border border-white/50 dark:border-slate-800 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 z-10">
          <i className="fas fa-times"></i>
        </button>

        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center text-white text-2xl mx-auto shadow-2xl shadow-emerald-600/20">
              <i className="fas fa-bell"></i>
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">Notifikasi Bibit</h1>
            <p className="text-slate-600 dark:text-slate-400">Data terbaru pembibitan PT EBL</p>
          </div>

          {/* Refresh Button */}
          <div className="flex justify-center">
            <button
              onClick={refreshData}
              disabled={loading}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 disabled:bg-slate-400 transition-all flex items-center gap-2"
            >
              <i className="fas fa-sync-alt"></i>
              {loading ? 'Memuat...' : 'Perbarui Data'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 rounded-2xl p-4">
              <p className="text-rose-700 dark:text-rose-400 text-center font-medium">{error}</p>
            </div>
          )}

          {/* Stats Cards (General) */}
          {!loading && !error && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800">
                <div className="text-emerald-700 dark:text-emerald-400 text-sm font-bold">Masuk</div>
                <div className="text-2xl font-black text-emerald-800 dark:text-emerald-200">{stats.totalMasuk.toLocaleString('id-ID')}</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-4 border border-blue-100 dark:border-blue-800">
                <div className="text-blue-700 dark:text-blue-400 text-sm font-bold">Keluar</div>
                <div className="text-2xl font-black text-blue-800 dark:text-blue-200">{stats.totalKeluar.toLocaleString('id-ID')}</div>
              </div>
              <div className="bg-rose-50 dark:bg-rose-900/10 rounded-2xl p-4 border border-rose-100 dark:border-rose-800">
                <div className="text-rose-700 dark:text-rose-400 text-sm font-bold">Mati</div>
                <div className="text-2xl font-black text-rose-800 dark:text-rose-200">{stats.totalMati.toLocaleString('id-ID')}</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/10 rounded-2xl p-4 border border-purple-100 dark:border-purple-800">
                <div className="text-purple-700 dark:text-purple-400 text-sm font-bold">Stok Global</div>
                <div className="text-2xl font-black text-purple-800 dark:text-purple-200">{stats.totalStok.toLocaleString('id-ID')}</div>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-800">
                <div className="text-amber-700 dark:text-amber-400 text-sm font-bold">Jenis</div>
                <div className="text-2xl font-black text-amber-800 dark:text-amber-200">{stats.jenisCount}</div>
              </div>
            </div>
          )}

          {/* SENGON Update Section (Dynamic) */}
          {!loading && !error && (
            <div className="bg-orange-50 dark:bg-orange-900/10 rounded-2xl p-6 border border-orange-100 dark:border-orange-800">
              <h3 className="text-lg font-black text-orange-900 dark:text-orange-100 mb-4 flex items-center gap-2">
                <i className="fas fa-tree"></i> Update Bibit SENGON
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                  <div className="text-orange-700 dark:text-orange-400 text-sm font-bold">Stok Sengon</div>
                  <div className="text-3xl font-black text-orange-800 dark:text-orange-200">
                    {sengonStats.hasData ? sengonStats.totalSengon.toLocaleString('id-ID') : '0'}
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                    {sengonStats.hasData ? "Total Kalkulasi (Masuk - Keluar - Mati)" : "Belum ada data Sengon"}
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-orange-200 dark:border-orange-700">
                  <div className="text-orange-700 dark:text-orange-400 text-sm font-bold">Update Terakhir</div>
                  <div className="text-lg font-black text-orange-800 dark:text-orange-200">
                    {sengonStats.lastDate ? sengonStats.lastDate.toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    }) : '-'}
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                    {sengonStats.hasData ? "Berdasarkan tanggal input terbaru" : "Tidak ada riwayat"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Latest Entries */}
          {!loading && !error && latestEntries.length > 0 && (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <i className="fas fa-clock"></i> Data Terbaru (10 Entri)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 dark:bg-slate-700">
                    <tr>
                      <th className="p-3 text-left font-bold text-slate-700 dark:text-slate-300">Tanggal</th>
                      <th className="p-3 text-left font-bold text-slate-700 dark:text-slate-300">Bibit</th>
                      <th className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">Masuk</th>
                      <th className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">Keluar</th>
                      <th className="p-3 text-center font-bold text-slate-700 dark:text-slate-300">Mati</th>
                      <th className="p-3 text-left font-bold text-slate-700 dark:text-slate-300">Sumber</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestEntries.map((entry, index) => (
                      <tr key={index} className="border-b border-slate-200 dark:border-slate-600">
                        <td className="p-3 text-slate-900 dark:text-white">
                          {entry.__date.toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="p-3 text-slate-900 dark:text-white font-medium">{entry.Bibit}</td>
                        <td className="p-3 text-center text-emerald-600 font-bold">{entry.Masuk || '-'}</td>
                        <td className="p-3 text-center text-blue-600 font-bold">{entry.Keluar || '-'}</td>
                        <td className="p-3 text-center text-rose-600 font-bold">{entry.Mati || '-'}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{entry.Sumber || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Memuat data bibit...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && bibitData.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-2xl text-slate-400 mx-auto mb-4">
                <i className="fas fa-database"></i>
              </div>
              <p className="text-slate-600 dark:text-slate-400">Tidak ada data bibit tersedia</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};