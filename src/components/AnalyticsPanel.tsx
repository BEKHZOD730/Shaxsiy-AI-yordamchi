import React from 'react';
import { 
  Zap, 
  Trophy, 
  Flame, 
  Clock, 
  CheckCircle2, 
  Target, 
  Sparkles, 
  BarChart2, 
  PieChart,
  Activity,
  Radio
} from 'lucide-react';
import { Task, TaskCategory } from '../types';
import { CATEGORY_LABELS, COSMIC_RANKS } from '../utils/motivationalQuotes';

interface AnalyticsPanelProps {
  tasks: Task[];
  energyCoreLevel: number;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  tasks,
  energyCoreLevel,
}) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const focusLevel = Math.min(100, Math.round(completionRate * 0.75 + 25));

  // Calculate total minutes planned vs completed
  const totalPlannedMinutes = tasks.reduce((acc, t) => acc + (t.durationMinutes || 0), 0);
  const totalCompletedMinutes = tasks
    .filter((t) => t.status === 'completed')
    .reduce((acc, t) => acc + (t.durationMinutes || 0), 0);

  // Minutes by category
  const categoryMinutes: Record<TaskCategory, number> = {
    oilaviy_vaqt: 0,
    dostlar_uchrashuv: 0,
    biznes_uchrashuv: 0,
    til_organish: 0,
    dasturlash_ish: 0,
    sport_salomatlik: 0,
    kitob_mutolaa: 0,
    ilm_fan: 0,
    maxsus_missiya: 0,
    shaxsiy_tartib: 0,
  };

  tasks.forEach((t) => {
    if (categoryMinutes[t.category] !== undefined) {
      categoryMinutes[t.category] += t.durationMinutes || 0;
    }
  });

  // Determine user's cosmic rank
  const currentRank = [...COSMIC_RANKS].reverse().find((r) => completionRate >= r.minRate) || COSMIC_RANKS[0];

  // 24-hour slot activity map
  const hoursMap = Array(24).fill(0);
  tasks.forEach((t) => {
    const hour = parseInt(t.startTime.split(':')[0], 10);
    if (!isNaN(hour) && hour >= 0 && hour < 24) {
      hoursMap[hour] += t.durationMinutes || 30;
    }
  });

  return (
    <div className="space-y-6 animate-fade-in text-[#00f2ff]">
      
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between border-b border-cyan-900/50 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#00f2ff] animate-pulse" />
          <h2 className="text-xs font-mono uppercase tracking-[0.25em] text-white font-bold">
            SHAXSIY TAHLIL // BIORHYTHM TELEMETRY
          </h2>
        </div>
        <div className="text-[10px] font-mono tracking-widest text-magenta-400">
          [ TELEMETRY: REAL-TIME SYNC ]
        </div>
      </div>

      {/* Main Immersive Grid (Rank & Status + Analytics Gauge + Progress Matrix) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left / Center Main Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Cosmic Rank & Active Level Card */}
          <div className="bg-[#080b1a] border border-cyan-900/70 p-6 rounded-none relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,242,255,0.04)]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cyan-950 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-500 block mb-1">
                  KOSMIK DARAJA // ACTIVE STATUS
                </span>
                <h3 className="font-mono text-2xl sm:text-3xl font-bold uppercase text-white tracking-wider">
                  {currentRank.title}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="border border-magenta-500/60 bg-magenta-500/10 px-3 py-1.5 text-magenta-400 font-mono text-xs tracking-wider shadow-[0_0_10px_rgba(188,19,254,0.2)]">
                  7 KUNLIK STREAK
                </div>
                <div className="border border-cyan-400/60 bg-cyan-400/10 px-3 py-1.5 text-cyan-300 font-mono text-xs tracking-wider">
                  {completionRate}% INTIZOM
                </div>
              </div>
            </div>

            {/* Immersive Sliders & Telemetry Bars */}
            <div className="space-y-5 pt-5">
              <div>
                <div className="flex justify-between text-[11px] font-mono mb-2">
                  <span className="text-slate-300 tracking-wider">SAMARADORLIK KO'RSATKICHI (EFFICIENCY)</span>
                  <span className="text-cyan-300 font-bold">{completionRate}%</span>
                </div>
                <div className="w-full h-1.5 bg-cyan-950 rounded-none overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 shadow-[0_0_10px_#00f2ff] transition-all duration-700" 
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] font-mono mb-2">
                  <span className="text-slate-300 tracking-wider">DIQQAT DARAJASI & FOKUS (QUANTUM FOCUS)</span>
                  <span className="text-magenta-400 font-bold">{focusLevel}%</span>
                </div>
                <div className="w-full h-1.5 bg-cyan-950 rounded-none overflow-hidden">
                  <div 
                    className="h-full bg-magenta-500 shadow-[0_0_10px_#bc13fe] transition-all duration-700" 
                    style={{ width: `${focusLevel}%` }}
                  />
                </div>
              </div>

              {/* Metric 4-Block Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-cyan-900/10 p-3.5 border border-cyan-900/40">
                  <span className="block text-[9px] font-mono opacity-50 uppercase tracking-widest text-cyan-400">VAZIFALAR</span>
                  <span className="text-2xl font-mono text-white font-bold">{totalTasks}</span>
                  <span className="block text-[9px] font-mono opacity-50 text-slate-400">REJALASHTIRILGAN</span>
                </div>
                <div className="bg-cyan-900/10 p-3.5 border border-cyan-900/40">
                  <span className="block text-[9px] font-mono opacity-50 uppercase tracking-widest text-cyan-400">BAJARILDI</span>
                  <span className="text-2xl font-mono text-cyan-300 font-bold">{completedTasks}</span>
                  <span className="block text-[9px] font-mono opacity-50 text-cyan-500">MUVAFFAQIYATLI</span>
                </div>
                <div className="bg-cyan-900/10 p-3.5 border border-cyan-900/40">
                  <span className="block text-[9px] font-mono opacity-50 uppercase tracking-widest text-cyan-400">VAQT</span>
                  <span className="text-2xl font-mono text-white font-bold">{(totalPlannedMinutes / 60).toFixed(1)}</span>
                  <span className="block text-[9px] font-mono opacity-50 text-slate-400">SOAT REJA</span>
                </div>
                <div className="bg-cyan-900/10 p-3.5 border border-cyan-900/40">
                  <span className="block text-[9px] font-mono opacity-50 uppercase tracking-widest text-magenta-400">TEJAMKORLIK</span>
                  <span className="text-2xl font-mono text-magenta-300 font-bold">{(totalCompletedMinutes / 60).toFixed(1)}</span>
                  <span className="block text-[9px] font-mono opacity-50 text-magenta-400">SOAT SOF FOKUS</span>
                </div>
              </div>
            </div>
          </div>

          {/* 24-Hour Cosmic Focus Rhythm */}
          <div className="bg-[#080b1a] border border-cyan-900/70 p-5 rounded-none space-y-4">
            <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
              <h4 className="text-xs font-mono uppercase tracking-widest text-white font-bold">
                24-SOATLIK KOSMIK FOKUS RITMI
              </h4>
              <span className="text-[10px] font-mono text-cyan-500">00:00 - 23:00</span>
            </div>

            <div className="grid grid-cols-8 sm:grid-cols-12 gap-1.5 pt-1">
              {hoursMap.map((mins, hour) => {
                const intensity = mins > 90 
                  ? 'bg-cyan-400 shadow-[0_0_10px_#00f2ff]' 
                  : mins > 45 
                  ? 'bg-cyan-600' 
                  : mins > 0 
                  ? 'bg-cyan-900' 
                  : 'bg-cyan-950/40 border border-cyan-900/20';
                return (
                  <div key={hour} className="flex flex-col items-center space-y-1">
                    <div
                      className={`w-full h-10 transition-all flex items-end justify-center pb-1 ${intensity}`}
                      title={`${hour}:00 - ${mins} daqiqa`}
                    >
                      {mins > 0 && (
                        <span className="text-[8px] font-mono text-black font-bold">
                          {mins}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {hour < 10 ? `0${hour}` : hour}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Reactor Core & Progress Matrix */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Reactor Core HUD */}
          <div className="bg-[#080b1a] border border-cyan-900/70 p-6 rounded-none flex flex-col items-center justify-center text-center relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,242,255,0.05)]">
            <div className="relative w-36 h-36 flex items-center justify-center mb-3">
              <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-radar" />
              <div className="absolute inset-3 rounded-full border border-magenta-500/20" />
              
              <div className="w-24 h-24 rounded-full bg-cyan-950/90 border border-cyan-400 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.5)]">
                <Zap className="w-5 h-5 text-cyan-300 animate-pulse" />
                <span className="font-mono font-bold text-lg text-white">
                  {energyCoreLevel}%
                </span>
              </div>
            </div>

            <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-cyan-200 mb-1">
              KIBER ENERGIYA REAKTORI
            </h4>
            <p className="text-[10px] font-mono text-slate-400">
              HAR BIR BAJARILGAN VAZIFA REAKTORGA +15% QUVVAT BERADI
            </p>
          </div>

          {/* Immersive Progress Matrix with Dot Grid */}
          <div className="bg-cyan-950/10 border border-cyan-900/40 p-5 rounded-none relative overflow-hidden">
            <div 
              className="absolute inset-0 opacity-15 pointer-events-none" 
              style={{ 
                backgroundImage: 'radial-gradient(#00f2ff 0.5px, transparent 0.5px)', 
                backgroundSize: '10px 10px' 
              }} 
            />
            
            <h4 className="text-[10px] font-mono uppercase tracking-widest opacity-60 mb-4">
              PROGRESS XARITASI (MATRIX BLOCKS)
            </h4>

            <div className="flex flex-wrap gap-1.5 relative z-10">
              <div className="w-3.5 h-3.5 bg-cyan-400 shadow-[0_0_8px_#00f2ff]" />
              <div className="w-3.5 h-3.5 bg-cyan-400 opacity-80" />
              <div className="w-3.5 h-3.5 bg-cyan-900" />
              <div className="w-3.5 h-3.5 bg-cyan-400" />
              <div className="w-3.5 h-3.5 bg-cyan-400" />
              <div className="w-3.5 h-3.5 bg-cyan-900" />
              <div className="w-3.5 h-3.5 bg-magenta-500 shadow-[0_0_8px_#bc13fe]" />
              <div className="w-3.5 h-3.5 bg-cyan-400" />
              <div className="w-3.5 h-3.5 bg-cyan-400" />
              <div className="w-3.5 h-3.5 bg-cyan-400" />
              <div className="w-3.5 h-3.5 bg-cyan-900" />
              <div className="w-3.5 h-3.5 bg-cyan-400" />
              <div className="w-3.5 h-3.5 bg-cyan-400" />
              <div className="w-3.5 h-3.5 bg-cyan-900" />
              <div className="w-3.5 h-3.5 bg-cyan-400" />
              <div className="w-3.5 h-3.5 bg-cyan-400" />
              <div className="w-3.5 h-3.5 bg-cyan-400" />
              <div className="w-3.5 h-3.5 bg-cyan-400" />
              <div className="w-3.5 h-3.5 bg-cyan-900" />
              <div className="w-3.5 h-3.5 bg-magenta-500 shadow-[0_0_8px_#bc13fe]" />
              <div className="w-3.5 h-3.5 bg-cyan-400" />
              <div className="w-3.5 h-3.5 bg-cyan-400 opacity-70" />
              <div className="w-3.5 h-3.5 bg-cyan-900" />
              <div className="w-3.5 h-3.5 bg-cyan-400" />
            </div>

            {/* AI Advisor Audit footer note */}
            <div className="mt-4 pt-3 border-t border-cyan-900/40 text-[10px] font-mono text-cyan-300/80 leading-relaxed">
              <span className="text-cyan-400 font-bold">// AI AUDIT:</span> Eng yuqori intizom 08:00 - 12:00 cho'qqi soatlarida qayd etildi.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
