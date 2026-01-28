
import React, { useState, useEffect } from 'react';
import { GrowthCard } from './components/GrowthCard';
import { MenuGrid } from './components/MenuGrid';
import { BottomNav } from './components/BottomNav';
import { Skeleton } from './components/Skeleton';
import { WeatherOverlay } from './components/WeatherOverlay';
import { Login } from './components/Login';
import { ProfileEdit } from './components/ProfileEdit';
import { UserProfile as UserProfileComponent } from './components/UserProfile';
import { MontanaCameraV2 } from './components/MontanaCameraV2';
import { DashboardBibitAI } from './components/DashboardBibitAI';
import { RosterWidget } from './components/RosterWidget';
import { HelpCenter } from './components/HelpCenter';
import { TopNavbar } from './components/TopNavbar';
import { PartnerSection } from './components/PartnerSection';
import { DeveloperInfo } from './components/DeveloperInfo';
import { BibitNotificationSystem } from './components/FloatingBibitToast';
import { UserProfile, WeatherCondition } from './types';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby09rbjwN2EcVRwhsNBx8AREI7k41LY1LrZ-W4U36HmzMB5BePD9h8wBSVPJwa_Ycduvw/exec?sheet=Bibit";

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'guest' | 'none'>('none');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showMontanaCamera, setShowMontanaCamera] = useState(false);
  const [showDashboardAI, setShowDashboardAI] = useState(false);
  const [showDeveloperInfo, setShowDeveloperInfo] = useState(false);
  const [showBibitNotification, setShowBibitNotification] = useState(false);
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
  const [showWelcomeNotif, setShowWelcomeNotif] = useState(false);
  const [latestBibit, setLatestBibit] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showBibitExitNotif, setShowBibitExitNotif] = useState(false);
  const [bibitExitData, setBibitExitData] = useState<any>(null);
  const [floatingToastData, setFloatingToastData] = useState<any>(null);

  // Function to check bibit exits today
  const checkBibitExitsToday = async () => {
    try {
      const response = await fetch(SCRIPT_URL);
      if (!response.ok) return;

      const raw = await response.json();
      let rows = [];
      if (Array.isArray(raw)) rows = raw;
      else {
        const arrField = Object.keys(raw).find(k => Array.isArray(raw[k]));
        rows = arrField ? raw[arrField] : [];
      }

      // Normalize rows
      const normalized = rows.map((r: any) => {
        const Tanggal = r.Tanggal || r.tanggal || r.date || r.tgl || r.Date || '';
        const Bibit = (r.Bibit || r.bibit || r.Jenis || r.jenis || '').toString().trim();
        const Masuk = parseFloat(r.Masuk || r.masuk || r.In || r.in || 0) || 0;
        const Keluar = parseFloat(r.Keluar || r.keluar || r.Out || r.out || 0) || 0;
        const Mati = parseFloat(r.Mati || r.mati || 0) || 0;
        const Sumber = r.Sumber || r.sumber || r.Asal || r.asal || '';
        const Tujuan = r.Tujuan || r.tujuan || '';

        // Parse date
        let __date: Date | null = null;
        if (Tanggal) {
          if (/^\d{4}-\d{2}-\d{2}/.test(Tanggal)) {
            __date = new Date(Tanggal);
          } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(Tanggal)) {
            const [d, m, y] = Tanggal.split('/').map(Number);
            __date = new Date(y, m - 1, d);
          } else {
            __date = new Date(Tanggal);
          }
          if (isNaN(__date.getTime())) __date = null;
        }

        return { Tanggal, Bibit, Masuk, Keluar, Mati, Sumber, Tujuan, __date };
      }).filter((x: any) => x.__date);

      // Check for exits today (Wednesday, January 28, 2026)
      const today = new Date('2026-01-28');
      const todayExits = normalized.filter((r: any) =>
        r.__date &&
        r.__date.getDate() === today.getDate() &&
        r.__date.getMonth() === today.getMonth() &&
        r.__date.getFullYear() === today.getFullYear() &&
        r.Keluar > 0
      );

      if (todayExits.length > 0) {
        const totalExited = todayExits.reduce((sum: number, r: any) => sum + r.Keluar, 0);
        const types = [...new Set(todayExits.map((r: any) => r.Bibit))];
        const transactions = todayExits.length;

        setBibitExitData({
          totalExited,
          types,
          transactions,
          details: todayExits
        });
        setShowBibitExitNotif(true);
      }
    } catch (error) {
      console.error('Error checking bibit exits:', error);
    }
  };
  
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

  const getWindDirLabel = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
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
          windDirection: getWindDirLabel(cur.wind_direction_10m)
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

  const fetchLatestNotif = async (role: string) => {
    try {
      const res = await fetch(SCRIPT_URL);
      const json = await res.json();
      let rows = Array.isArray(json) ? json : (json.Bibit || json.bibit || []);
      
      const normalized = rows.map((r: any) => {
        const tglStr = String(r.Tanggal || r.tanggal || '');
        const parts = tglStr.split('/');
        let dObj = new Date();
        if(parts.length === 3) {
          dObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }

        return {
          tanggal: tglStr,
          bibit: (r.Bibit || r.bibit || '').toString().trim(),
          masuk: parseInt(r.Masuk || r.masuk || 0),
          keluar: parseInt(r.Keluar || r.keluar || 0),
          tujuan: r["Tujuan Bibit"] || r.Tujuan || r.tujuan || 'Nursery',
          __date: dObj
        };
      }).filter((x: any) => !isNaN(x.__date.getTime()));

      if (normalized.length > 0) {
        const sorted = normalized.sort((a: any, b: any) => b.__date.getTime() - a.__date.getTime());
        setLatestBibit(sorted[0]);
        if (sorted[0].masuk > 0 || sorted[0].keluar > 0) {
          setShowWelcomeNotif(true);
        }
      }
    } catch (err) {
      console.error("Gagal memuat notifikasi bibit:", err);
    }
  };

  useEffect(() => {
    fetchWeather();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        fetchWeather(pos.coords.latitude, pos.coords.longitude);
      });
    }
    const weatherInterval = setInterval(() => fetchWeather(), 300000);
    return () => clearInterval(weatherInterval);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB', { timeZone: 'Asia/Makassar', hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
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
    fetchLatestNotif(role);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('none');
    setUser({
      name: '',
      photo: '',
      jabatan: 'Tamu',
      telepon: '',
      email: '',
      activeSeconds: 0,
      lastSeen: new Date().toISOString()
    });
    setActiveTab('home');
    localStorage.removeItem('montana_user_role');
    localStorage.removeItem('montanaUser');
    localStorage.removeItem('montanaUserEmail');
    localStorage.removeItem('montanaUserPhone');
    localStorage.removeItem('montanaUserPhoto');
  };

  useEffect(() => {
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
      fetchLatestNotif(savedRole);
    }
    const savedSec = localStorage.getItem('montana_active_seconds');
    setActiveSeconds(savedSec ? parseInt(savedSec) : 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSeconds(prev => {
        const next = prev + 1;
        localStorage.setItem('montana_active_seconds', next.toString());
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="max-w-lg mx-auto p-8 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center">
      <div className="w-20 h-20 bg-emerald-600 rounded-[32px] flex items-center justify-center text-white text-4xl mb-12 shadow-2xl shadow-emerald-500/30 animate-drift-puff">
        <i className="fas fa-seedling"></i>
      </div>
      <div className="w-full space-y-8">
        <Skeleton className="w-full h-64 rounded-[40px]" />
        <div className="grid grid-cols-3 gap-6 w-full">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="aspect-square rounded-[32px]" />)}
        </div>
      </div>
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

      <main className="pt-24 md:pt-40 px-4 md:px-8 space-y-12 relative z-10 max-w-[1440px] mx-auto">
        {activeTab === 'home' && (
          <div className="space-y-12 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-8 space-y-12">
                <RosterWidget />
                <GrowthCard currentSeconds={activeSeconds} />
                <HelpCenter />
              </div>
              
              <div className="lg:col-span-4 space-y-8 sticky top-44">
                <MenuGrid
                  role={userRole}
                  onOpenMontana={() => setShowMontanaCamera(true)}
                  onOpenDashboardAI={() => setShowDashboardAI(true)}
                  onOpenDeveloperInfo={() => setShowDeveloperInfo(true)}
                  onOpenBibitNotification={() => setShowBibitNotification(true)}
                  onRequestLogin={() => setShowLoginModal(true)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'profile' && <UserProfileComponent user={user} onEdit={() => setShowProfileEdit(true)} onLogout={handleLogout} />}
      </main>

      <PartnerSection />

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        onOpenMontana={() => setShowMontanaCamera(true)}
        onRequestLogin={() => setShowLoginModal(true)}
      />

      {showLoginModal && <Login onVerified={handleLoginSuccess} onClose={() => setShowLoginModal(false)} />}
      
      {showProfileEdit && (
        <ProfileEdit 
          user={user} 
          onSave={(updated) => {
            setUser(p => ({...p, ...updated}));
            setShowProfileEdit(false);
          }} 
          onClose={() => setShowProfileEdit(false)} 
        />
      )}

      {showMontanaCamera && <MontanaCameraV2 onClose={() => setShowMontanaCamera(false)} />}
      {showDashboardAI && <DashboardBibitAI onClose={() => setShowDashboardAI(false)} />}
      {showDeveloperInfo && <DeveloperInfo onClose={() => setShowDeveloperInfo(false)} />}
      <BibitNotificationSystem isModalOpen={showBibitNotification} onCloseModal={() => setShowBibitNotification(false)} />


    </div>
  );
};

export default App;
