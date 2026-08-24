import React, { useEffect, useState } from 'react';
import { 
  Zap, 
  Clock, 
  Volume2, 
  VolumeX, 
  Bot, 
  BarChart3, 
  CalendarDays, 
  Sliders, 
  BookMarked,
  Sun,
  Moon,
  Rocket
} from 'lucide-react';
import { VoiceSettings, ThemeMode } from '../types';
import { playHudClick } from '../utils/audioSynth';

export type AppTab = 'planner' | 'reader' | 'matrix' | 'vocab' | 'analytics' | 'ai' | 'voice_settings';

interface AlienHeaderProps {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  voiceSettings: VoiceSettings;
  setVoiceSettings: React.Dispatch<React.SetStateAction<VoiceSettings>>;
  energyCoreLevel: number;
  activeAlarmsCount: number;
  vocabCount?: number;
  booksCount?: number;
  quotesCount?: number;
  theme: ThemeMode;
  onToggleTheme: () => void;
}

export const AlienHeader: React.FC<AlienHeaderProps> = ({
  activeTab,
  setActiveTab,
  voiceSettings,
  setVoiceSettings,
  energyCoreLevel,
  activeAlarmsCount,
  vocabCount = 0,
  booksCount = 0,
  quotesCount = 0,
  theme,
  onToggleTheme,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('uz-UZ', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSound = () => {
    playHudClick();
    setVoiceSettings(prev => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  };

  const navItems = [
    { id: 'planner', label: 'Rejalashtiruvchi', icon: CalendarDays },
    { id: 'reader', label: '🚀 Kosmik PDF Kitobxon', icon: Rocket, isSpecial: true },
    { id: 'matrix', label: 'AI Tavsiyalar & Kod', icon: Zap },
    { id: 'vocab', label: `So'zlar Bazasi (${vocabCount})`, icon: BookMarked },
    { id: 'analytics', label: 'Tahliliy Panel', icon: BarChart3 },
    { id: 'ai', label: 'AI Maslahatchi', icon: Bot },
    { id: 'voice_settings', label: `💬 Motivatsiyalar & Ovoz (${quotesCount})`, icon: Sliders },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-[#02050f]/95 backdrop-blur-2xl border-b border-cyan-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
      {/* Hyundai Staria Signature Seamless Horizon LED Lightbar */}
      <div className="staria-horizon-lightbar" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand & Hyundai Staria Spacecraft Core Status */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('planner')}>
              <div className="relative">
                <div className="w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_15px_#00f2ff] animate-pulse flex-shrink-0" />
                <div className="absolute -inset-1 bg-cyan-400/30 rounded-full blur-sm" />
              </div>
              <div>
                <h1 className="font-mono text-sm sm:text-base tracking-[0.25em] font-bold uppercase text-white group-hover:text-cyan-300 transition-colors flex items-center gap-2">
                  STARIA XENO <span className="text-cyan-400">// COCKPIT v3.0</span>
                </h1>
                <p className="text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase">
                  Aerodynamic Chrono & Neural Learning Suite
                </p>
              </div>
            </div>
          </div>

          {/* Telemetry Status Indicators */}
          <div className="hidden lg:flex items-center gap-4 text-[11px] font-mono tracking-widest">
            <div className="px-3 py-1 bg-[#060c20] border border-cyan-900 staria-pill text-cyan-300 flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,242,255,0.1)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
              <span>STARIA DRIVE: ONLINE</span>
            </div>
            <div className="px-3 py-1 bg-[#060c20] border border-purple-900 staria-pill text-purple-300">
              <span>AI MATRIX: SYNCED</span>
            </div>
          </div>

          {/* Center Cosmic Clock & Energy Core */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2.5 px-4 py-1.5 staria-pill bg-[#060d24] border border-cyan-500/30 shadow-[inset_0_0_10px_rgba(0,242,255,0.05)]">
              <Clock className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
              <div>
                <div className="font-mono text-xs tracking-widest text-cyan-200 font-bold">
                  {time || '00:00:00'}
                </div>
              </div>
            </div>

            {/* Energy Core Mini Widget */}
            <div 
              className="flex items-center space-x-3 px-4 py-1.5 staria-pill bg-[#060d24] border border-cyan-500/30 cursor-pointer hover:border-cyan-400 transition-colors shadow-[inset_0_0_10px_rgba(0,242,255,0.05)]"
              onClick={() => setActiveTab('analytics')}
              title="Kiber Energiya Reaktori"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-300">
                  <span className="uppercase tracking-wider">REAKTOR</span>
                  <span className="font-mono text-cyan-400 ml-2 font-bold">{energyCoreLevel}%</span>
                </div>
                <div className="w-20 h-1.5 bg-black/60 rounded-full overflow-hidden mt-0.5 border border-cyan-950">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 shadow-[0_0_8px_#00f2ff] transition-all duration-700 rounded-full"
                    style={{ width: `${energyCoreLevel}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls: Theme Toggle & Sound Toggle */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Dark / Light Mode Switcher */}
            <button
              id="theme-toggle-btn"
              onClick={() => {
                playHudClick();
                onToggleTheme();
              }}
              className={`p-2.5 staria-pill transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                theme === 'light'
                  ? 'bg-amber-100/90 border-amber-500/60 text-amber-600 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                  : 'bg-[#060c20] border-cyan-500/40 text-cyan-300 hover:text-cyan-100 shadow-[0_0_10px_rgba(0,242,255,0.15)]'
              }`}
              title={theme === 'light' ? "Tungi rejimga o'tish (Dark Mode)" : "Kunduzgi rejimga o'tish (Light Mode)"}
            >
              {theme === 'light' ? (
                <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />
              ) : (
                <Moon className="w-5 h-5 text-cyan-400" />
              )}
              <span className="hidden sm:inline text-[10px] font-mono font-bold tracking-widest uppercase">
                {theme === 'light' ? 'LIGHT' : 'DARK'}
              </span>
            </button>

            {/* Active Alarm count indicator */}
            {activeAlarmsCount > 0 && (
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-rose-950/80 border border-rose-500/60 text-rose-300 staria-pill text-xs font-mono animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                <span className="hidden sm:inline">{activeAlarmsCount} Eslatma</span>
              </div>
            )}

            {/* Voice Sound Toggle Button */}
            <button
              id="voice-toggle-btn"
              onClick={toggleSound}
              className={`p-2.5 staria-pill transition-all duration-300 cursor-pointer ${
                voiceSettings.enabled
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,242,255,0.35)]'
                  : 'bg-[#060c20] border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
              title={voiceSettings.enabled ? "Ovozli eslatmalar yoqilgan" : "Ovozli eslatmalar o'chirilgan"}
            >
              {voiceSettings.enabled ? (
                <Volume2 className="w-5 h-5 text-cyan-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-rose-400" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs - Staria Aerodynamic Pill Layout */}
        <div className="flex space-x-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => {
                  playHudClick();
                  setActiveTab(item.id);
                }}
                className={`flex items-center space-x-2 px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all duration-300 whitespace-nowrap cursor-pointer staria-pill ${
                  isActive
                    ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(0,242,255,0.25)] font-bold'
                    : 'text-slate-400 hover:text-cyan-200 hover:bg-cyan-950/30 border-transparent hover:border-cyan-800/40'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
