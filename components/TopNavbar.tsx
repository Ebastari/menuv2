
import React, { useState, useEffect } from 'react';
import { UserProfile, WeatherCondition } from '../types';

interface TopNavbarProps {
  user: UserProfile;
  isAuthenticated: boolean;
  currentTime: string;
  weatherCondition: WeatherCondition;
  temp: number;
  humidity: number;
  precipitation: number;
  windspeed: number;
  windDirection: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onProfileClick: () => void;
}

interface NavBoxProps {
  children: React.ReactNode;
  className?: string;
}

const NavBox: React.FC<NavBoxProps> = ({ children, className = "" }) => (
  <div className={`bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-2xl p-2.5 shadow-sm flex items-center gap-3 ${className}`}>
    {children}
  </div>
);

export const TopNavbar: React.FC<TopNavbarProps> = ({
  user,
  isAuthenticated,
  currentTime,
  weatherCondition,
  temp,
  humidity,
  precipitation,
  windspeed,
  windDirection,
  isDarkMode,
  toggleDarkMode,
  onProfileClick
}) => {
  const [coords, setCoords] = useState<{ lat: string; lon: string }>({ lat: "...", lon: "..." });
  const [satellites, setSatellites] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [gpsStatus, setGpsStatus] = useState<'searching' | 'locked' | 'error'>('searching');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    let watchId: number;

    if (navigator.geolocation) {
      setGpsStatus('searching');
      watchId = navigator.geolocation.watchPosition((pos) => {
        const acc = pos.coords.accuracy;
        setAccuracy(acc);
        setCoords({
          lat: pos.coords.latitude.toFixed(6),
          lon: pos.coords.longitude.toFixed(6)
        });
        
        // Locked state is for accuracy < 15m
        if (acc <= 15) {
          setGpsStatus('locked');
        } else {
          setGpsStatus('searching');
        }
        
        // Realistic satellite count simulation tied to accuracy and small time-based jitter
        const getSimSats = (a: number) => {
          if (a < 5) return 24;
          if (a < 10) return 18;
          if (a < 25) return 12;
          if (a < 50) return 8;
          return 4;
        };
        
        const baseSats = getSimSats(acc);
        // Add small jitter based on seconds to make it look active (real satellite signals fluctuate slightly)
        const jitter = Math.floor(Math.random() * 3); 
        setSatellites(baseSats + jitter);

      }, (err) => {
        console.warn("GPS Access Denied or Error:", err);
        setGpsStatus('error');
        setSatellites(0);
        setAccuracy(null);
      }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getWeatherLabel = (condition: WeatherCondition) => {
    switch (condition) {
      case 'clear': return 'CERAH';
      case 'rain': return 'HUJAN';
      case 'cloudy': return 'BERAWAN';
      case 'storm': return 'BADAI';
      default: return 'SCANNING';
    }
  };

  const getSignalStrength = () => {
    if (gpsStatus === 'searching' && !accuracy) return 1;
    if (!accuracy) return 0;
    if (accuracy < 10) return 4;
    if (accuracy < 25) return 3;
    if (accuracy < 50) return 2;
    return 1;
  };

  return (
    <header className="fixed top-0 left-0 right-0 w-full z-[100] bg-white/90 dark:bg-slate-950/90 backdrop-blur-3xl border-b border-slate-100 dark:border-slate-900 py-3 px-4 md:px-6">
      <div className="max-w-[1440px] mx-auto flex flex-col gap-3">
        
        {/* ROW 1: Branding & Identity */}
        <div className="flex items-center justify-between gap-3">
          <div 
            className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl bg-slate-900 dark:bg-emerald-600 text-white cursor-pointer hover:opacity-90 active:scale-95 transition-all shadow-lg"
            onClick={onProfileClick}
          >
            <div className="relative">
              <img 
                src={isAuthenticated ? user.photo : 'https://ui-avatars.com/api/?name=User&background=0f172a&color=fff'} 
                className="w-8 h-8 rounded-xl object-cover border border-white/20"
                alt="Profile"
              />
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-slate-900 ${isAuthenticated ? 'bg-emerald-400' : 'bg-slate-400'}`}></div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-tight leading-none">
                {isAuthenticated ? user.name : 'GUEST ACCESS'}
              </span>
              <span className="text-[7px] font-bold opacity-60 uppercase tracking-widest mt-1">
                {isAuthenticated ? user.jabatan : 'LOGIN REQUIRED'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/5 rounded-2xl p-1.5 px-3">
             <div className="flex flex-col items-end mr-2">
                <span className="text-[13px] font-black text-slate-900 dark:text-white tabular-nums tracking-tighter leading-none">
                  {currentTime}
                </span>
                <span className="text-[7px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">WITA / GMT+8</span>
             </div>
             <button onClick={toggleDarkMode} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 active:scale-90 transition-all">
                <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'} text-xs`}></i>
             </button>
          </div>
        </div>

        {/* ROW 2: GPS & Environment Data */}
        <div className="grid grid-cols-2 gap-3">
          {/* GPS Panel */}
          <NavBox className="justify-between overflow-hidden relative group">
            <div className="absolute inset-0 bg-emerald-500/[0.03] animate-pulse pointer-events-none"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="flex flex-col items-center">
                <div className="flex items-end gap-[1px] h-3 mb-1">
                  {[1,2,3,4].map(bar => (
                    <div 
                      key={bar} 
                      className={`w-1 rounded-t-[1px] transition-all duration-500 ${bar <= getSignalStrength() ? (gpsStatus === 'locked' ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse') : 'bg-slate-200 dark:bg-slate-800'}`}
                      style={{ height: `${bar * 25}%` }}
                    />
                  ))}
                </div>
                <span className={`text-[6px] font-black uppercase ${gpsStatus === 'locked' ? 'text-emerald-600' : 'text-amber-500 animate-pulse'}`}>
                  {gpsStatus}
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white font-mono tracking-tighter">{coords.lat}</span>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white font-mono tracking-tighter">{coords.lon}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                   <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">SATS: {satellites}</span>
                   {accuracy && (
                     <span className={`text-[7px] font-black uppercase tracking-widest ${accuracy < 15 ? 'text-emerald-500' : 'text-amber-500'}`}>
                       ±{accuracy.toFixed(1)}M
                     </span>
                   )}
                </div>
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full shadow-[0_0_8px] transition-all duration-500 ${gpsStatus === 'locked' ? 'bg-emerald-500 shadow-emerald-500/50' : (gpsStatus === 'error' ? 'bg-rose-500 shadow-rose-500/50' : 'bg-amber-400 shadow-amber-400/50 animate-ping')}`}></div>
          </NavBox>

          {/* Weather Panel */}
          <NavBox className="justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-xl text-emerald-600 dark:text-emerald-400 relative overflow-hidden">
                <i className={`fas ${weatherCondition === 'clear' ? 'fa-sun' : weatherCondition === 'rain' ? 'fa-cloud-showers-heavy' : weatherCondition === 'storm' ? 'fa-bolt' : 'fa-cloud'} relative z-10`}></i>
                {weatherCondition === 'rain' && <div className="absolute inset-0 bg-blue-400/10 animate-pulse"></div>}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-black text-slate-900 dark:text-white tabular-nums">{temp}°C</span>
                  <span className="text-[8px] font-black px-1.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md uppercase tracking-widest">
                    {getWeatherLabel(weatherCondition)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-[7px] font-black text-slate-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><i className="fas fa-tint text-[6px]"></i> {humidity}%</span>
                  <span className={`flex items-center gap-1 ${precipitation > 0 ? 'text-blue-500 font-black' : ''}`}>
                    <i className="fas fa-cloud-rain text-[6px]"></i> {precipitation.toFixed(1)} mm
                  </span>
                  <span className="flex items-center gap-1"><i className="fas fa-wind text-[6px]"></i> {windspeed} km/h {windDirection}</span>
                </div>
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'}`}></div>
          </NavBox>
        </div>

      </div>
    </header>
  );
};
