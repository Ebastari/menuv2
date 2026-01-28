
import React from 'react';

export interface FeatureDetail {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

export const MONTANA_FEATURES: FeatureDetail[] = [
  {
    id: 'camera-v2',
    title: 'Montana Camera V2',
    description: 'Dokumentasi foto lapangan dengan penguncian GPS presisi tinggi (akurasi <10m), label otomatis koordinat, tanggal, dan analisis kesehatan tanaman berbasis warna (HSV).',
    icon: 'fa-camera-retro',
    category: 'Monitoring'
  },
  {
    id: 'ai-dashboard',
    title: 'Dashboard Bibit AI',
    description: 'Analitik cerdas menggunakan Google Apps Script untuk melacak stok masuk, keluar, dan tingkat kematian bibit secara real-time di Nursery.',
    icon: 'fa-chart-network',
    category: 'Analytics'
  },
  {
    id: 'roster',
    title: 'Roster Tim Revegetasi',
    description: 'Manajemen kehadiran dan shift kerja personil lapangan (Shift Siang, Tahura-DAS, OFF) untuk koordinasi tim yang lebih efektif.',
    icon: 'fa-users-gear',
    category: 'Management'
  },
  {
    id: 'growth',
    title: 'Growth System',
    description: 'Transformasi waktu aktif pengguna menjadi level pertumbuhan ekosistem (Semai, Pancang, Tiang, Pohon, hingga Rimba).',
    icon: 'fa-tree-decorated',
    category: 'Engagement'
  },
  {
    id: 'security',
    title: 'Montana ID Sync',
    description: 'Sistem login multi-faktor menggunakan verifikasi biometrik wajah dan koordinat GPS untuk memastikan data dikirim oleh personil yang sah di lokasi yang benar.',
    icon: 'fa-shield-check',
    category: 'Security'
  },
  {
    id: 'carbon',
    title: 'Analisis Karbon',
    description: 'Modul khusus untuk menghitung dan memantau estimasi serapan karbon dari kegiatan reklamasi yang telah dilakukan.',
    icon: 'fa-leaf',
    category: 'Environment'
  },
  {
    id: 'gis-maps',
    title: 'Integrasi GIS & Maps',
    description: 'Visualisasi spasial polygon penanaman dan lokasi bibit menggunakan Leaflet.js dan data ArcGIS.',
    icon: 'fa-map-location-dot',
    category: 'Geospatial'
  },
  {
    id: 'offline-sync',
    title: 'Offline Syncing',
    description: 'Kemampuan menyimpan data monitoring secara lokal (IndexedDB) saat sinyal lemah dan sinkronisasi otomatis saat terhubung ke internet.',
    icon: 'fa-cloud-arrow-up',
    category: 'System'
  }
];

export const LayananPengaduan: React.FC = () => {
  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col">
        <h3 className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.4em] mb-2 leading-none">System Knowledge</h3>
        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Panduan Fitur Montana AI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MONTANA_FEATURES.map((f) => (
          <div key={f.id} className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-xl text-slate-400 group-hover:text-emerald-500 transition-colors">
                <i className={`fas ${f.icon}`}></i>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{f.title}</h4>
                  <span className="text-[7px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full uppercase tracking-widest">{f.category}</span>
                </div>
                <p className="text-[10px] leading-relaxed font-medium text-slate-500 dark:text-slate-400">
                  {f.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 dark:bg-emerald-600/10 p-6 rounded-[32px] border border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white animate-pulse">
            <i className="fas fa-headset"></i>
          </div>
          <div>
            <p className="text-[11px] font-black text-white uppercase tracking-widest">Butuh Bantuan Teknis?</p>
            <p className="text-[9px] font-bold text-slate-400 dark:text-emerald-400/60 uppercase tracking-widest mt-1">Gunakan Chatbox AI di bawah untuk panduan cepat</p>
          </div>
        </div>
      </div>
    </div>
  );
};
