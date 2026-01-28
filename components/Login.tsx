
import React, { useState, useRef, useEffect } from 'react';
import { TermsContent } from './TermsContent';

interface LoginProps {
  onVerified: (userData: { name: string; photo: string; telepon: string; email: string; jabatan: string }, role: 'admin' | 'guest') => void;
  onClose: () => void;
}

export const Login: React.FC<LoginProps> = ({ onVerified, onClose }) => {
  const [mode, setMode] = useState<'select' | 'auth' | 'form'>('select');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'guest' | null>(null);
  
  const [authData, setAuthData] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({ nama: '', telepon: '', email: '' });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  
  const [gps, setGps] = useState<{ lat: number | null; lon: number | null; acc: number | null; status: 'idle' | 'searching' | 'locked' | 'error' | 'denied'; msg: string }>({ 
    lat: null, 
    lon: null, 
    acc: null,
    status: 'idle',
    msg: ''
  });
  
  const [faceChecked, setFaceChecked] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'analyzing' | 'success'>('idle');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const termsScrollRef = useRef<HTMLDivElement>(null);

  const scriptURL = 'https://script.google.com/macros/s/AKfycbw04sh_xYNc1Q0BjjjqmlX00jLFsMndRdXsWHvUz6nc-cIfe4PbvDc6Thx0qxNJp9wB0w/exec';

  const handleTermsScroll = () => {
    if (termsScrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = termsScrollRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 10) {
        setScrolledToBottom(true);
      }
    }
  };

  const startRoleFlow = (role: 'admin' | 'guest') => {
    setSelectedRole(role);
    if (role === 'admin') setMode('auth');
    else setMode('form');
  };

  const requestGPS = () => {
    setGps({ ...gps, status: 'searching', msg: '🛰️ MENGHUBUNGI SATELIT...' });
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ 
          lat: pos.coords.latitude, 
          lon: pos.coords.longitude, 
          acc: Math.round(pos.coords.accuracy),
          status: 'locked',
          msg: `📍 LOKASI BERHASIL DIKUNCI`
        });
      },
      (err) => {
        if (err.code === 1) {
          setGps({ ...gps, status: 'denied', msg: 'IZIN LOKASI DITOLAK' });
        } else {
          setGps({ ...gps, status: 'error', msg: 'SINYAL GPS LEMAH' });
        }
      },
      options
    );
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const storedUser = localStorage.getItem('montana_auth_user') || "admin";
    const storedPass = localStorage.getItem('montana_auth_pass') || "kalimantan selatan";

    if (authData.username.trim().toLowerCase() === storedUser.toLowerCase() && 
        authData.password.trim().toLowerCase() === storedPass.toLowerCase()) {
      setMode('form');
    } else {
      setAuthError(true);
      setTimeout(() => setAuthError(false), 1000);
    }
  };

  const handleFaceChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (!agreedToTerms || gps.status !== 'locked') {
      alert("Selesaikan persetujuan dan penguncian lokasi terlebih dahulu.");
      return;
    }
    
    setFaceChecked(checked);
    if (checked) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setScanStatus('scanning');
      } catch (err) {
        alert("Izin kamera diperlukan.");
        setFaceChecked(false);
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setScanStatus('idle');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms || gps.status !== 'locked' || !faceChecked) {
      alert("Pastikan seluruh langkah verifikasi telah diselesaikan.");
      return;
    }

    setIsSyncing(true);
    setScanStatus('analyzing');
    
    const canvas = canvasRef.current!;
    const video = videoRef.current!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.6);

    try {
      await fetch(scriptURL, { 
        method: 'POST', 
        mode: 'no-cors', 
        body: JSON.stringify({
          nama: formData.nama,
          telepon: formData.telepon,
          email: formData.email,
          lat: gps.lat,
          lon: gps.lon,
          acc: gps.acc,
          image: imageData
        }) 
      });
      
      setLoginSuccess(true);
      localStorage.setItem('montanaUser', formData.nama);
      localStorage.setItem('montanaUserEmail', formData.email);
      localStorage.setItem('montanaUserPhone', formData.telepon);
      localStorage.setItem('montanaUserPhoto', imageData);
      
      setTimeout(() => {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        onVerified({ 
          name: formData.nama, 
          photo: imageData, 
          telepon: formData.telepon, 
          email: formData.email, 
          jabatan: selectedRole === 'admin' ? 'Internal Administrator' : 'Portal Guest'
        }, selectedRole!);
      }, 2000);
    } catch (error) {
      alert("Gagal sinkronisasi. Silakan periksa koneksi internet Anda.");
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-3xl theme-transition">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className={`relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[48px] p-8 shadow-2xl border border-white/50 dark:border-slate-800 animate-drift-puff transition-all duration-500 ${loginSuccess ? 'scale-95 opacity-0 pointer-events-none' : 'opacity-100'}`}>
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 z-10"><i className="fas fa-times"></i></button>

        {mode === 'select' && (
          <div className="space-y-6 pt-6">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-emerald-600 rounded-[32px] flex items-center justify-center text-white text-4xl mx-auto mb-6 shadow-2xl shadow-emerald-600/20">
                <i className="fas fa-fingerprint"></i>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Montana ID</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-3">Sistem Verifikasi Multi-Faktor</p>
            </div>
            
            <button onClick={() => startRoleFlow('admin')} className="w-full p-7 bg-slate-900 dark:bg-emerald-600 text-white rounded-[32px] text-left relative overflow-hidden active:scale-95 transition-all shadow-xl">
              <i className="fas fa-user-shield text-2xl mb-4 text-emerald-400"></i>
              <h4 className="font-black text-lg">Akses Administrator</h4>
              <p className="text-[9px] opacity-60 uppercase font-bold tracking-widest mt-1">Gunakan Kredensial Khusus</p>
            </button>

            <button onClick={() => startRoleFlow('guest')} className="w-full p-7 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-[32px] text-left relative overflow-hidden active:scale-95 transition-all border border-slate-200 dark:border-slate-700">
              <i className="fas fa-user-large text-2xl mb-4 text-slate-400"></i>
              <h4 className="font-black text-lg">Akses Tamu</h4>
              <p className="text-[9px] opacity-60 uppercase font-bold tracking-widest mt-1">Pantau Publik Terbatas</p>
            </button>
          </div>
        )}

        {mode === 'auth' && (
          <form onSubmit={handleAuthSubmit} className={`space-y-6 pt-4 ${authError ? 'animate-shake' : ''}`}>
             <div className="text-center mb-10">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Login Administrator</h2>
             </div>
             <div className="space-y-3">
                <input type="text" placeholder="ID PENGGUNA" required value={authData.username} onChange={e => setAuthData({...authData, username: e.target.value})} className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white" />
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} placeholder="KATA SANDI" required value={authData.password} onChange={e => setAuthData({...authData, password: e.target.value})} className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400"><i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i></button>
                </div>
             </div>
             <button type="submit" className="w-full py-5 bg-slate-900 dark:bg-emerald-600 text-white rounded-[24px] font-black text-[11px] uppercase tracking-[0.3em] shadow-xl active:scale-95 mt-4 transition-all">Masuk</button>
             <button type="button" onClick={() => setMode('select')} className="w-full py-4 text-slate-400 font-bold text-[9px] uppercase tracking-widest">Kembali</button>
             <button type="button" onClick={() => { localStorage.setItem('montana_auth_user', 'admin'); localStorage.setItem('montana_auth_pass', 'kalimantan selatan'); alert('Kredensial telah direset ke default: admin / kalimantan selatan'); }} className="w-full py-4 text-amber-600 font-bold text-[9px] uppercase tracking-widest">Lupa Password?</button>
          </form>
        )}

        {mode === 'form' && (
          <form onSubmit={handleSubmit} className="space-y-8 max-h-[80vh] overflow-y-auto no-scrollbar pt-2">
            <div className="text-center mb-4">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Pendaftaran Akun</h2>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-2">Seluruh data wajib diisi dengan benar</p>
            </div>

            <div className="space-y-3">
              <input type="text" placeholder="NAMA LENGKAP" required value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-[10px] font-black focus:ring-2 focus:ring-emerald-500 outline-none uppercase tracking-widest transition-all dark:text-white" />
              <input type="email" placeholder="EMAIL AKTIF (Wajib)" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-[10px] font-black focus:ring-2 focus:ring-emerald-500 outline-none uppercase tracking-widest transition-all dark:text-white" />
              <input type="tel" placeholder="NOMOR WHATSAPP" required value={formData.telepon} onChange={e => setFormData({ ...formData, telepon: e.target.value })} className="w-full p-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl text-[10px] font-black focus:ring-2 focus:ring-emerald-500 outline-none uppercase tracking-widest transition-all dark:text-white" />
            </div>

            {/* STEP 1: Terms */}
            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-[40px] p-6 border border-slate-100 dark:border-slate-800 space-y-4">
               <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] text-center mb-2">Langkah 1: Persetujuan</h4>
               <div ref={termsScrollRef} onScroll={handleTermsScroll} className="h-40 overflow-y-auto px-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 no-scrollbar">
                  <TermsContent />
               </div>
               <label className={`flex items-center gap-4 cursor-pointer p-5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm transition-all ${!scrolledToBottom ? 'opacity-30' : 'opacity-100'}`}>
                  <input type="checkbox" disabled={!scrolledToBottom} checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-6 h-6 rounded-lg text-emerald-600 border-slate-300 focus:ring-emerald-500" />
                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase leading-tight">Saya Setuju & Mengerti</span>
               </label>
            </div>

            {/* STEP 2: GPS VERIFICATION */}
            <div className={`transition-all duration-500 ${!agreedToTerms ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
               <div className="bg-slate-900 dark:bg-slate-800 rounded-[40px] p-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>
                  <h4 className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.3em] text-center mb-6">Langkah 2: Verifikasi GPS</h4>
                  
                  {gps.status === 'idle' || gps.status === 'error' || gps.status === 'denied' ? (
                    <div className="space-y-4">
                      <button 
                        type="button" 
                        onClick={requestGPS}
                        className="w-full py-8 bg-emerald-600 text-white rounded-3xl flex flex-col items-center justify-center gap-3 hover:bg-emerald-500 active:scale-95 transition-all shadow-xl shadow-emerald-600/20"
                      >
                        <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl animate-pulse">
                          <i className="fas fa-location-crosshairs"></i>
                        </div>
                        <span className="text-[12px] font-black uppercase tracking-[0.2em]">Kunci Posisi Sekarang</span>
                      </button>
                      
                      {gps.status === 'denied' && (
                        <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-center">
                          <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">⚠️ IZIN LOKASI DIBLOKIR</p>
                          <p className="text-[8px] text-slate-400 font-bold uppercase mt-2 leading-relaxed">
                            Aktifkan izin lokasi melalui pengaturan browser Anda untuk melanjutkan.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`p-6 rounded-3xl border flex items-center gap-5 transition-all ${gps.status === 'locked' ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/20'}`}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl text-white ${gps.status === 'locked' ? 'bg-emerald-500' : 'bg-amber-500 animate-spin-slow'}`}>
                          <i className={`fas ${gps.status === 'locked' ? 'fa-check-double' : 'fa-satellite'}`}></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-white uppercase tracking-tight leading-none">{gps.msg}</p>
                          {gps.status === 'locked' && <p className="text-[8px] text-emerald-400 font-bold uppercase mt-2 tracking-widest">Akurasi: ±{gps.acc}m (Valid)</p>}
                          {gps.status === 'searching' && <p className="text-[8px] text-amber-400 font-bold uppercase mt-2 animate-pulse">Menghubungkan Satelit...</p>}
                        </div>
                        {gps.status === 'locked' && <button type="button" onClick={requestGPS} className="text-emerald-400 text-xs"><i className="fas fa-rotate"></i></button>}
                    </div>
                  )}
               </div>
            </div>

            {/* STEP 3: BIOMETRIC */}
            <div className={`transition-all duration-500 ${gps.status !== 'locked' ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <div className="bg-slate-50 dark:bg-slate-800/30 rounded-[40px] p-6 border border-slate-100 dark:border-slate-800">
                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] text-center mb-6">Langkah 3: Foto Biometrik</h4>
                <label className="flex items-center gap-4 cursor-pointer mb-6 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
                   <input type="checkbox" checked={faceChecked} onChange={handleFaceChange} className="w-6 h-6 rounded-lg text-emerald-600 border-slate-300 focus:ring-emerald-500" />
                   <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">Aktifkan Kamera Wajah</span>
                </label>
                
                {faceChecked && (
                  <div className="relative rounded-[32px] overflow-hidden aspect-square bg-black border-4 border-emerald-500/20 shadow-2xl">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                    <div className="absolute inset-0 border-[40px] border-black/40 rounded-[32px] pointer-events-none"></div>
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-scanner pointer-events-none"></div>
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={!faceChecked || !agreedToTerms || isSyncing || gps.status !== 'locked'} 
              className="w-full py-6 bg-slate-900 dark:bg-emerald-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-300 text-white rounded-[28px] font-black text-[12px] uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all mb-4"
            >
              {isSyncing ? 'MENGHUBUNGKAN...' : 'SINKRONISASI SEKARANG'}
            </button>
          </form>
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      <style>{`
        @keyframes scanner {
          0% { transform: translateY(-150px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(150px); opacity: 0; }
        }
        .animate-scanner {
          animation: scanner 2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
};
