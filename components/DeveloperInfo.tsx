import React from 'react';

interface DeveloperInfoProps {
  onClose: () => void;
}

export const DeveloperInfo: React.FC<DeveloperInfoProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-3xl">
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl border border-white/50 dark:border-slate-800 max-h-[90vh] overflow-y-auto no-scrollbar">
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 z-10">
          <i className="fas fa-times"></i>
        </button>

        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto shadow-2xl shadow-emerald-600/20">
              <i className="fas fa-code"></i>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Tentang Developer</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">Technical Profile</p>
          </div>

          {/* Developer Info */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[32px] p-6 border border-slate-100 dark:border-slate-700">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">Agung Laksono</h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              <strong>Web Application Developer & Environmental Monitoring System Engineer</strong>
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Aplikasi ini dikembangkan oleh <strong>Agung Laksono</strong>, seorang pengembang sistem berbasis web dan geospasial yang berfokus pada digitalisasi data lapangan, pemantauan lingkungan, dan sistem pendukung reklamasi berkelanjutan.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-3">
              Pengembangan sistem dilakukan dengan pendekatan <strong>field-first architecture</strong>, di mana seluruh alur data dirancang mulai dari akuisisi lapangan, validasi lokasi dan waktu, sinkronisasi terpusat, hingga analisis dan pelaporan yang dapat diaudit.
            </p>
          </div>

          {/* Focus Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800">
              <h3 className="text-lg font-black text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2">
                <i className="fas fa-target"></i> Fokus Pengembangan
              </h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li>• Sistem dokumentasi lapangan berbasis GPS & timestamp</li>
                <li>• Monitoring revegetasi dan reklamasi lahan</li>
                <li>• Integrasi data satelit (Sentinel, NDVI, NDMI)</li>
                <li>• Estimasi biomassa dan stok karbon</li>
                <li>• Sistem pelaporan lingkungan transparan</li>
                <li>• Data pipeline berbasis spreadsheet dan database</li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 border border-blue-100 dark:border-blue-800">
              <h3 className="text-lg font-black text-blue-700 dark:text-blue-400 mb-4 flex items-center gap-2">
                <i className="fas fa-cogs"></i> Arsitektur Sistem
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Frontend</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">HTML5, CSS3, JavaScript (ES6+), PWA, Leaflet.js</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Backend & API</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Node.js, Python, RESTful API, Batch sync</p>
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">Data Storage</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Google Sheets, Cloud Storage, SQL/PostGIS</p>
                </div>
              </div>
            </div>
          </div>

          {/* Philosophy */}
          <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 text-white text-center">
            <h3 className="text-xl font-black mb-4">🧠 Filosofi Pengembangan</h3>
            <p className="text-lg italic mb-4">
              "Sistem digital harus memastikan bahwa data lingkungan dapat dipercaya, diverifikasi, dan digunakan untuk pengambilan keputusan yang bertanggung jawab."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};