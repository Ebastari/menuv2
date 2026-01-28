
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GrowthCard } from './components/GrowthCard';
import { MenuGrid } from './components/MenuGrid';
import { BottomNav } from './components/BottomNav';
import { Skeleton } from './components/Skeleton';
import { WeatherOverlay } from './components/WeatherOverlay';
import { Login } from './components/Login';
import { ProfileEdit } from './components/ProfileEdit';
import { AboutSection } from './components/AboutSection';
import { MontanaCameraV2 } from './components/MontanaCameraV2';
import { DashboardBibitAI } from './components/DashboardBibitAI';
import { RosterWidget } from './components/RosterWidget';
import { HelpCenter } from './components/HelpCenter';
import { LayananPengaduan } from './components/LayananPengaduan';
import { FloatingStockBubble } from './components/FloatingStockBubble';
import { TopNavbar } from './components/TopNavbar';
import { PartnerSection } from './components/PartnerSection';
import { DeveloperInfo } from './components/DeveloperInfo';
import { BibitNotificationToast } from './components/BibitNotificationToast';
import { UserProfileView } from './components/UserProfileView';
import { UserProfile, WeatherCondition } from './types';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby09rbjwN2EcVRwhsNBx8AREI7k41LY1LrZ-W4U36HmzMB5BePD9h8wBSVPJwa_Ycduvw/exec?sheet=Bibit";

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'guest' | 'none'>('none');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showMontanaCamera, setShowMontanaCamera] = useState(false);
  const [showDashboardAI, setShowDashboardAI] = useState(false);
  const [showDeveloperInfo, setShowDeveloperInfo] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeSeconds, setActiveSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState('');
  const [weatherCondition, setWeatherCondition] = useState<WeatherCondition>('clear');
  const [weatherDetails, setWeatherDetails] = useState({ 
    temp: 0, 
    windspeed: 0, 
    humidity: 0, 
    rain: 0,
    windDirection: 'N'
  });
  
  const [allBibitData, setAllBibitData] = useState<any[]>([]);
  const [latestUpdate, setLatestUpdate] = useState<any>(null);
  const [showWelcomeNotif, setShowWelcomeNotif] = useState(false);
  const [showDailyToast, setShowDailyToast] = useState(false);
  const [aiNarrative, setAiNarrative] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('montana_dark_mode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [user, setUser] = useState<UserProfile>({
    name: '',
    photo: '',
    jabatan: 'Tamu',
    telepon: '',
    email: '',
    activeSeconds: 0,
    lastSeen: new Date().toISOString()
  });

  const todaySummary = useMemo(() => {
    if (!allBibitData.length) return null;
    const todayStr = new Date().toLocaleDateString('en-GB'); 
    const todayEntries = allBibitData.filter(item => {
      const entryDate = new Date(item.tanggal).toLocaleDateString('en-GB');
      return entryDate === todayStr;
    });

    if (todayEntries.length === 0) {
      return allBibitData[allBibitData.length - 1];
    }

    return {
      bibit: todayEntries[todayEntries.length - 1].bibit,
      masuk: todayEntries.reduce((acc, curr) => acc + curr.masuk, 0),
      keluar: todayEntries.reduce((acc, curr) => acc + curr.keluar, 0),
      mati: todayEntries.reduce((acc, curr) => acc + curr.mati, 0),
      tanggal: todayEntries[todayEntries.length - 1].tanggal,
      isAggregated: true
    };
  }, [allBibitData]);

  const generateBriefing = (data: any[]) => {
    if (!data.length) return "";
    const totalMasuk = data.reduce((s, r) => s + (r.masuk || 0), 0);
    const totalKeluar = data.reduce((s, r) => s + (r.keluar || 0), 0);
    const totalMati = data.reduce((s, r) => s + (r.mati || 0), 0);
    const stokAkhir = totalMasuk - totalKeluar - totalMati;
    const efisiensi = (100 - ((totalMati / (totalMasuk || 1)) * 100)).toFixed(1);
    const today = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
    return `Laporan Montana AI tanggal ${today}. Total bibit masuk ${totalMasuk.toLocaleString('id-ID')}. Stok saat ini ${stokAkhir.toLocaleString('id-ID')} bibit dengan tingkat efisiensi ${efisiensi} persen.`;
  };

  const speakBriefing = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(aiNarrative);
      utter.lang = "id-ID";
      utter.rate = 0.9;
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utter);
    }
  };

  const fetchWeather = async (lat: number = -3.33, lon: number = 115.79) => {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.current) {
        const cur = data.current;
        const code = cur.weather_code;
        
        setWeatherDetails({
          temp: Math.round(cur.temperature_2m),
          windspeed: Math.round(cur.wind_speed_10m),
          humidity: cur.relative_humidity_2m,
          rain: cur.precipitation,
          windDirection: DIRECTIONS[Math.round(cur.wind_direction_10m / 45) % 8]
        });

        if ([0, 1].includes(code)) setWeatherCondition('clear');
        else if ([2, 3].includes(code)) setWeatherCondition('cloudy');
        else if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) setWeatherCondition('rain');
        else if ([95, 96, 99].includes(code)) setWeatherCondition('storm');
        else setWeatherCondition('cloudy');
      }
    } catch (err) {
      console.error("Weather API error:", err);
    }
  };

  const fetchLatestNotif = async () => {
    try {
      const res = await fetch(SCRIPT_URL);
      const json = await res.json();
      let rows = Array.isArray(json) ? json : (json.Bibit || json.bibit || []);
      
      const normalized = rows.map((r: any) => ({
        tanggal: String(r.Tanggal || r.tanggal || ''),
        bibit: (r.Bibit || r.bibit || '').toString().trim(),
        masuk: parseInt(r.Masuk || r.masuk || 0),
        keluar: parseInt(r.Keluar || r.keluar || 0),
        mati: parseInt(r.Mati || r.mati || 0),
        tujuan: r["Tujuan Bibit"] || r.Tujuan || r.tujuan || 'Nursery'
      }));

      setAllBibitData(normalized);
      
      if (normalized.length > 0) {
        const last = normalized[normalized.length - 1];
        setLatestUpdate(last);
        setAiNarrative(generateBriefing(normalized));
        setShowDailyToast(true);
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
  };

  useEffect(() => {
    fetchWeather();
    const timer = setTimeout(() => setLoading(false), 1500);
    const savedUser = localStorage.getItem('montanaUser');
    const savedRole = localStorage.getItem('montana_user_role') as any;
    if (savedUser && savedRole) {
      setUser({ 
        name: savedUser, 
        photo: localStorage.getItem('montanaUserPhoto') || '',
        jabatan: localStorage.getItem('montanaUserJabatan') || (savedRole === 'admin' ? 'Administrator' : 'Guest'),
        telepon: localStorage.getItem('montanaUserPhone') || '',
        email: localStorage.getItem('montanaUserEmail') || '',
        activeSeconds: 0,
        lastSeen: new Date().toISOString()
      });
      setUserRole(savedRole);
      setIsAuthenticated(true);
      fetchLatestNotif();
    }
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSeconds(prev => prev + 1);
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('montana_dark_mode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleLoginSuccess = (userData: any, role: 'admin' | 'guest') => {
    setUser(p => ({...p, ...userData}));
    setUserRole(role);
    setIsAuthenticated(true);
    setShowLoginModal(false);
    localStorage.setItem('montana_user_role', role);
    fetchLatestNotif();
  };

  const handleLogout = () => {
    localStorage.removeItem('montanaUser');
    localStorage.removeItem('montanaUserPhoto');
    localStorage.removeItem('montanaUserJabatan');
    localStorage.removeItem('montanaUserPhone');
    localStorage.removeItem('montanaUserEmail');
    localStorage.removeItem('montana_user_role');
    setIsAuthenticated(false);
    setUserRole('none');
    setActiveTab('home');
  };

  if (loading) return (
    <div className="max-w-lg mx-auto p-8 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
      <div className="w-20 h-20 bg-emerald-600 rounded-[32px] flex items-center justify-center text-white text-4xl mb-12 animate-bounce">
        <i className="fas fa-seedling"></i>
      </div>
      <Skeleton className="w-full h-64 rounded-[40px]" />
    </div>
  );

  return (
    <div className="min-h-screen pb-40 transition-all dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative theme-transition">
      <WeatherOverlay condition={weatherCondition} />
      
      <TopNavbar 
        user={user}
        isAuthenticated={isAuthenticated}
        currentTime={currentTime}
        weatherCondition={weatherCondition}
        temp={weatherDetails.temp}
        humidity={weatherDetails.humidity}
        precipitation={weatherDetails.rain}
        windspeed={weatherDetails.windspeed}
        windDirection={weatherDetails.windDirection}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onProfileClick={() => isAuthenticated ? setActiveTab('profile') : setShowLoginModal(true)}
      />

      <main className="pt-24 px-4 space-y-12 relative z-10 max-w-[1440px] mx-auto">
        {activeTab === 'home' && (
          <div className="space-y-12 animate-fadeIn">
            <RosterWidget />
            <GrowthCard currentSeconds={activeSeconds} />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-12">
                <LayananPengaduan />
                <HelpCenter />
              </div>
              <div className="lg:col-span-4">
                <MenuGrid 
                  role={userRole} 
                  onOpenMontana={() => setShowMontanaCamera(true)}
                  onOpenDashboardAI={() => setShowDashboardAI(true)}
                  onRequestLogin={() => setShowLoginModal(true)} 
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="space-y-10 animate-fadeIn">
            {isAuthenticated ? (
              <UserProfileView 
                user={user} 
                onEdit={() => setShowProfileEdit(true)} 
                onLogout={handleLogout} 
              />
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[44px] p-12 shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 text-3xl mb-6">
                  <i className="fas fa-user-lock"></i>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Akses Terbatas</h2>
                <p className="text-sm text-slate-500 mt-3 max-w-xs">Silakan login menggunakan Montana ID untuk melihat profil dan pengaturan akun Anda.</p>
                <button onClick={() => setShowLoginModal(true)} className="mt-8 px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/20 active:scale-95 transition-all">Mulai Login</button>
              </div>
            )}
            <AboutSection onOpenDeveloper={() => setShowDeveloperInfo(true)} />
          </div>
        )}
      </main>

      <PartnerSection />
      
      <FloatingStockBubble data={todaySummary} />

      <BibitNotificationToast 
        data={showDailyToast ? latestUpdate : null} 
        onClose={() => {
          setShowDailyToast(false);
          setTimeout(() => setShowWelcomeNotif(true), 500);
        }} 
      />

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        onOpenMontana={() => setShowMontanaCamera(true)}
        onRequestLogin={() => setShowLoginModal(true)}
      />

      {showLoginModal && <Login onVerified={handleLoginSuccess} onClose={() => setShowLoginModal(false)} />}
      {showProfileEdit && <ProfileEdit user={user} onSave={(updated) => { setUser({...user, ...updated}); setShowProfileEdit(false); }} onClose={() => setShowProfileEdit(false)} />}
      {showMontanaCamera && <MontanaCameraV2 onClose={() => setShowMontanaCamera(false)} />}
      {showDashboardAI && <DashboardBibitAI onClose={() => setShowDashboardAI(false)} />}
      {showDeveloperInfo && <DeveloperInfo onClose={() => setShowDeveloperInfo(false)} />}

      {showWelcomeNotif && latestUpdate && (
        <div className="fixed top-24 left-0 right-0 px-4 flex justify-center z-[150] pointer-events-none animate-drift-puff">
          <div className="w-full max-w-sm bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[32px] p-5 shadow-2xl border border-white/40 dark:border-white/10 flex flex-col gap-4 pointer-events-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white">
                  <i className={`fas fa-robot ${isSpeaking ? 'animate-bounce' : ''}`}></i>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase">AI Briefing</h4>
                  <p className="text-[7px] font-black text-emerald-600 uppercase tracking-widest">Update Pembibitan</p>
                </div>
              </div>
              <button onClick={() => { window.speechSynthesis.cancel(); setShowWelcomeNotif(false); }} className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400">
                <i className="fas fa-times text-xs"></i>
              </button>
            </div>
            <button onClick={speakBriefing} className="w-full py-3 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase flex items-center justify-center gap-2">
              <i className={`fas ${isSpeaking ? 'fa-pause' : 'fa-play'}`}></i>
              {isSpeaking ? 'Berhenti' : 'Putar Laporan AI'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
