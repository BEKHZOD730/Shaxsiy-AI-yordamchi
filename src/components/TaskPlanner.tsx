import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Plus, 
  Sparkles, 
  Volume2, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Play, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  Square,
  AlertTriangle,
  Flame,
  Bot,
  Layers,
  CalendarCheck,
  BookMarked,
  ArrowUpRight
} from 'lucide-react';
import { Task, TaskCategory, TaskPriority, VoiceSettings, CustomMotivationalQuote } from '../types';
import { CATEGORY_LABELS, STRICTNESS_LABELS } from '../utils/motivationalQuotes';
import { playSuccessChime, playHudClick, speakUzbekMotivation } from '../utils/audioSynth';

interface TaskPlannerProps {
  tasks: Task[];
  onToggleTask: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onOpenAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onTriggerAlarmNow: (task: Task) => void;
  onOpenAIPlan: () => void;
  onOpenVocab?: () => void;
  voiceSettings: VoiceSettings;
  motivationalQuotes?: CustomMotivationalQuote[];
  onOpenQuotesStudio?: () => void;
}

export const TaskPlanner: React.FC<TaskPlannerProps> = ({
  tasks,
  onToggleTask,
  onToggleSubtask,
  onOpenAddTask,
  onEditTask,
  onDeleteTask,
  onTriggerAlarmNow,
  onOpenAIPlan,
  onOpenVocab,
  voiceSettings,
  motivationalQuotes = [],
  onOpenQuotesStudio,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeQuoteIndex, setActiveQuoteIndex] = useState<number>(0);

  // HUD Banner visibility preference: 'idle_only' (auto show when not in active focus session), 'always', 'hidden'
  const [bannerMode, setBannerMode] = useState<'idle_only' | 'always' | 'hidden'>(() => {
    return (localStorage.getItem('xeno_banner_mode') as any) || 'idle_only';
  });

  // Active workout / focus session state
  const [isFocusSessionActive, setIsFocusSessionActive] = useState<boolean>(() => {
    return localStorage.getItem('xeno_focus_active') === 'true';
  });
  const [focusSeconds, setFocusSeconds] = useState<number>(0);

  // Timer for active focus session
  React.useEffect(() => {
    let interval: any = null;
    if (isFocusSessionActive) {
      interval = setInterval(() => {
        setFocusSeconds((sec) => sec + 1);
      }, 1000);
    } else {
      setFocusSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isFocusSessionActive]);

  const toggleFocusSession = () => {
    playHudClick();
    const nextState = !isFocusSessionActive;
    setIsFocusSessionActive(nextState);
    localStorage.setItem('xeno_focus_active', nextState ? 'true' : 'false');
  };

  const handleBannerModeChange = (mode: 'idle_only' | 'always' | 'hidden') => {
    playHudClick();
    setBannerMode(mode);
    localStorage.setItem('xeno_banner_mode', mode);
  };

  // Trigger cyber celebratory confetti burst
  const triggerCelebration = (e?: React.MouseEvent) => {
    playSuccessChime();
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#10b981', '#a855f7', '#38bdf8', '#fbbf24', '#ec4899'],
    });
  };

  const handleTaskCompletion = (task: Task, e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status !== 'completed') {
      triggerCelebration(e);
    } else {
      playHudClick();
    }
    onToggleTask(task.id);
  };

  // Find currently active or next upcoming task for HUD focus box
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const sortedTasks = [...tasks].sort((a, b) => {
    const [hA, mA] = a.startTime.split(':').map(Number);
    const [hB, mB] = b.startTime.split(':').map(Number);
    return hA * 60 + mA - (hB * 60 + mB);
  });

  const activeOrNextTask = sortedTasks.find((t) => {
    const [h, m] = t.startTime.split(':').map(Number);
    const taskMin = h * 60 + m;
    return t.status !== 'completed' && taskMin >= currentMinutes - 30;
  }) || sortedTasks.find((t) => t.status !== 'completed') || sortedTasks[0];

  // Should the large motivational HUD quotes banner be rendered?
  const shouldShowBanner = (() => {
    if (bannerMode === 'hidden') return false;
    if (bannerMode === 'always') return true;
    // 'idle_only': If user is actively in a focus session, minimize/hide banner so it doesn't disturb
    return !isFocusSessionActive;
  })();

  // Filter tasks
  const filteredTasks = sortedTasks.filter((t) => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterStatus === 'pending' && t.status === 'completed') return false;
    if (filterStatus === 'completed' && t.status !== 'completed') return false;
    if (filterStatus === 'critical' && t.priority !== 'CRITICAL') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const totalCount = tasks.length;

  const formatFocusTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Focus Session Status Bar / Quick HUD Controller */}
      <div className="bg-[#030712] border border-cyan-900/60 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-[0_0_15px_rgba(0,242,255,0.03)]">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleFocusSession}
            className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs font-mono font-bold tracking-wider uppercase border transition-all cursor-pointer ${
              isFocusSessionActive
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] animate-pulse'
                : 'bg-cyan-950/40 border-cyan-800 text-cyan-300 hover:border-cyan-400'
            }`}
          >
            <Flame className={`w-4 h-4 ${isFocusSessionActive ? 'text-emerald-400' : 'text-cyan-400'}`} />
            <span>
              {isFocusSessionActive ? `MASHG'ULOT DAVOM ETMOQDA: ${formatFocusTimer(focusSeconds)}` : "⚡ HOZIR MASHG'ULOTDAGI FOKUS (BOSHLASH)"}
            </span>
          </button>

          {isFocusSessionActive && (
            <span className="text-[11px] font-mono text-emerald-400/90 hidden md:inline">
              // Chalg'ituvchi eslatmalar o'chirilgan, faqat chuqur fokus rejimidasiz
            </span>
          )}
        </div>

        {/* HUD Quote Banner Display Controls */}
        <div className="flex items-center space-x-2 text-[10px] font-mono">
          <span className="text-slate-400 uppercase hidden sm:inline">EKRAN MATNLARI:</span>
          <div className="flex items-center border border-cyan-900/70 bg-black/60 p-0.5">
            <button
              onClick={() => handleBannerModeChange('idle_only')}
              className={`px-2 py-1 transition-colors cursor-pointer ${
                bannerMode === 'idle_only' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Mashg'ulot bo'lmaganda (bo'sh vaqtda) chiqadi, mashg'ulot payti avtomatik berkitiladi"
            >
              BO'SH VAQTDA (AVTO)
            </button>
            <button
              onClick={() => handleBannerModeChange('always')}
              className={`px-2 py-1 transition-colors cursor-pointer ${
                bannerMode === 'always' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Doim ekranda chiqib turadi"
            >
              DOIMIY
            </button>
            <button
              onClick={() => handleBannerModeChange('hidden')}
              className={`px-2 py-1 transition-colors cursor-pointer ${
                bannerMode === 'hidden' ? 'bg-rose-950 text-rose-300 border border-rose-500/50' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Ekranni tozalash, butunlay yashirish"
            >
              YASHIRISH ✕
            </button>
          </div>
        </div>
      </div>

      {/* Top Banner: Active Focus Mission HUD (Conditional per user choice) */}
      {shouldShowBanner && activeOrNextTask && (
        <div className="relative overflow-hidden rounded-none bg-[#040612]/95 border border-cyan-900/80 p-6 sm:p-8 shadow-[inset_0_0_25px_rgba(0,242,255,0.06),0_0_30px_rgba(0,242,255,0.08)]">
          {/* Dismiss button */}
          <button
            onClick={() => handleBannerModeChange('hidden')}
            className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 p-1.5 border border-cyan-950 hover:border-rose-900 transition-colors cursor-pointer z-20"
            title="Ekranni tozalash (Matnni yashirish)"
          >
            <span className="text-[10px] font-mono uppercase mr-1 hidden sm:inline">YASHIRISH</span>
            ✕
          </button>

          {/* Concentric pulse rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-cyan-400/15 rounded-full animate-pulse pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-pink-500/10 rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pr-6">
            <div className="space-y-3 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-block px-3 py-0.5 border border-pink-500 text-pink-400 text-[10px] font-mono tracking-widest uppercase">
                  DIQQAT: QAT'IY ESLATMA
                </div>
                <span className="text-xs font-mono text-cyan-400 tracking-wider">
                  MUHLAT: {activeOrNextTask.startTime}
                </span>
                <span className="text-xs font-mono text-slate-400 tracking-wider">
                  SOHA: {CATEGORY_LABELS[activeOrNextTask.category]?.label || activeOrNextTask.category}
                </span>
                {onOpenQuotesStudio && (
                  <button
                    onClick={onOpenQuotesStudio}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-950/60 border border-purple-400 text-purple-300 text-[10px] font-mono uppercase hover:bg-purple-400 hover:text-black transition-colors cursor-pointer"
                    title="Motivatsion gaplarni tahrirlash va yangi yozish"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>GAPLARNI TAHRIRLASH ({motivationalQuotes.length})</span>
                  </button>
                )}
                {activeOrNextTask.category === 'til_organish' && onOpenVocab && (
                  <button
                    onClick={onOpenVocab}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-cyan-950/60 border border-cyan-400 text-cyan-300 text-[10px] font-mono uppercase hover:bg-cyan-400 hover:text-black transition-colors cursor-pointer"
                  >
                    <BookMarked className="w-3 h-3" />
                    <span>SO'ZLAR BAZASIGA O'TISH</span>
                  </button>
                )}
              </div>

              <h2 className="font-mono text-lg sm:text-2xl font-light leading-tight tracking-tight text-white">
                "{activeOrNextTask.customVoicePrompt || activeOrNextTask.title}"
              </h2>

              {activeOrNextTask.notes && (
                <p className="text-xs text-slate-400 font-mono tracking-wide max-w-2xl">
                  // {activeOrNextTask.notes}
                </p>
              )}

              {/* Immersive Audio Waveform Visualizer & Edit Link */}
              <div className="flex items-center gap-3 pt-1 flex-wrap">
                <div className="flex items-center gap-1">
                  <div className="w-1 h-3 bg-cyan-400" />
                  <div className="w-1 h-7 bg-cyan-400 shadow-[0_0_10px_#00f2ff]" />
                  <div className="w-1 h-2 bg-cyan-400" />
                  <div className="w-1 h-9 bg-pink-500 shadow-[0_0_10px_#ec4899]" />
                  <div className="w-1 h-5 bg-cyan-400" />
                  <div className="w-1 h-2 bg-cyan-400" />
                </div>
                <span className="text-[10px] font-mono opacity-80 uppercase tracking-widest text-cyan-300">
                  Ovozli modul tayyor
                </span>

                {onOpenQuotesStudio && (
                  <button
                    onClick={onOpenQuotesStudio}
                    className="text-[10px] font-mono text-purple-400 hover:text-purple-300 underline cursor-pointer"
                  >
                    ✏️ O'zingiz yangi motivatsiya yozing
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions for active mission */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
              <button
                id="listen-voice-now-btn"
                onClick={() => {
                  playHudClick();
                  speakUzbekMotivation(
                    activeOrNextTask.customVoicePrompt || activeOrNextTask.title,
                    voiceSettings
                  );
                }}
                className="flex items-center space-x-2 px-4 py-2.5 border border-cyan-400/50 bg-cyan-400/10 text-cyan-300 font-mono text-xs tracking-wider hover:bg-cyan-400 hover:text-black transition-all cursor-pointer shadow-[0_0_10px_rgba(0,242,255,0.2)]"
                title="Ovozli eslatmani hozir tinglash"
              >
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>OVOZNI TINGLASH</span>
              </button>

              <button
                id="alarm-trigger-now-btn"
                onClick={() => onTriggerAlarmNow(activeOrNextTask)}
                className="flex items-center space-x-2 px-5 py-2.5 border border-pink-500/60 bg-pink-500/20 text-pink-300 font-mono font-bold text-xs tracking-widest uppercase hover:bg-pink-500 hover:text-white transition-all cursor-pointer shadow-[0_0_15px_rgba(236,72,153,0.3)]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>SIGNAL BERISH</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Action Bar & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-cyan-900/50">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-cyan-500 uppercase">
            <span>[ SYSTEM QUEUE ]</span>
            <span>STATUS: ACTIVE</span>
          </div>
          <h1 className="font-mono text-lg sm:text-xl font-bold text-white tracking-wider flex items-center gap-2.5 uppercase">
            <CalendarCheck className="w-5 h-5 text-cyan-400" />
            Galaktik Kun Tartibi & Mashg'ulotlar
          </h1>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {onOpenVocab && (
            <button
              onClick={() => {
                playHudClick();
                onOpenVocab();
              }}
              className="flex items-center space-x-2 px-4 py-2.5 border border-cyan-400/60 bg-cyan-950/40 text-cyan-300 text-xs font-mono tracking-wider hover:bg-cyan-400 hover:text-black transition-all cursor-pointer"
            >
              <BookMarked className="w-4 h-4 text-cyan-400" />
              <span>SO'ZLAR BAZASI & AI</span>
            </button>
          )}

          <button
            id="ai-generate-routine-btn"
            onClick={() => {
              playHudClick();
              onOpenAIPlan();
            }}
            className="flex items-center space-x-2 px-4 py-2.5 border border-purple-500/40 bg-purple-500/10 text-purple-300 text-xs font-mono tracking-wider hover:bg-purple-500 hover:text-black transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4 text-purple-400" />
            <span>AI REJA GENERATOR</span>
          </button>

          <button
            id="add-new-task-btn"
            onClick={() => {
              playHudClick();
              onOpenAddTask();
            }}
            className="flex items-center space-x-2 px-5 py-2.5 border border-cyan-400 bg-cyan-400/10 text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase hover:bg-cyan-400 hover:text-black transition-all cursor-pointer shadow-[0_0_10px_#00f2ff]"
          >
            <Plus className="w-4 h-4" />
            <span>+ YANGI MASHG'ULOT QO'SHISH</span>
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-[#080b1a] border border-cyan-900/60 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1">
            {[
              { id: 'all', label: `Barchasi (${totalCount})` },
              { id: 'pending', label: `Kutilmoqda (${totalCount - completedCount})` },
              { id: 'completed', label: `Bajarildi (${completedCount})` },
              { id: 'critical', label: 'Favqulodda (CRITICAL)' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  playHudClick();
                  setFilterStatus(st.id);
                }}
                className={`px-3 py-1.5 text-xs font-mono tracking-wider uppercase transition-all cursor-pointer whitespace-nowrap ${
                  filterStatus === st.id
                    ? 'bg-cyan-950 border border-cyan-400 text-cyan-300 font-bold'
                    : 'text-slate-400 hover:text-cyan-300'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Mashg'ulotni qidirish..."
              className="w-full px-3.5 py-1.5 bg-black/60 border border-cyan-900 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pt-2 border-t border-cyan-950 scrollbar-none">
          <button
            onClick={() => {
              playHudClick();
              setFilterCategory('all');
            }}
            className={`px-3 py-1 text-xs font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              filterCategory === 'all'
                ? 'bg-cyan-950/70 text-white border border-cyan-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Barcha Sohalar
          </button>
          {(Object.keys(CATEGORY_LABELS) as TaskCategory[]).map((catKey) => {
            const cat = CATEGORY_LABELS[catKey];
            const isSelected = filterCategory === catKey;
            return (
              <button
                key={catKey}
                onClick={() => {
                  playHudClick();
                  setFilterCategory(catKey);
                }}
                className={`px-3 py-1 text-xs font-mono tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-cyan-950 text-cyan-200 border border-cyan-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Task Cards List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-[#080b1a] border border-dashed border-cyan-900/60 p-8 space-y-3">
            <Layers className="w-12 h-12 text-cyan-500/40 mx-auto mb-1" />
            <h3 className="font-mono text-base uppercase text-slate-300">
              Topshiriqlar topilmadi
            </h3>
            <p className="text-xs text-slate-500 font-mono max-w-md mx-auto">
              Ushbu filtr bo'yicha hech qanday mashg'ulot mavjud emas. Yangi reja qo'shishingiz yoki AI orqali to'liq kunlik tartib hosil qilishingiz mumkin.
            </p>
            <button
              onClick={onOpenAddTask}
              className="px-4 py-2 bg-cyan-950 border border-cyan-500 text-cyan-300 text-xs font-mono uppercase hover:bg-cyan-900 transition-colors cursor-pointer"
            >
              + Yangi Mashg'ulot Yaratish
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = task.status === 'completed';
            const categoryInfo = CATEGORY_LABELS[task.category] || CATEGORY_LABELS.shaxsiy_tartib;

            // Subtask completion stats
            const subtasksTotal = task.subtasks?.length || 0;
            const subtasksDone = task.subtasks?.filter((st) => st.completed).length || 0;

            return (
              <div
                key={task.id}
                id={`task-card-${task.id}`}
                className={`relative group transition-all duration-300 p-4 sm:p-5 border-y border-r rounded-none ${
                  isCompleted
                    ? 'bg-white/5 border-l-2 border-transparent border-cyan-900/30 opacity-60'
                    : task.priority === 'CRITICAL'
                    ? 'bg-cyan-950/30 border-l-2 border-magenta-500 border-cyan-900/40 shadow-[inset_0_0_15px_rgba(188,19,254,0.08)]'
                    : 'bg-cyan-950/20 border-l-2 border-cyan-400 border-cyan-900/40 shadow-[inset_0_0_15px_rgba(0,242,255,0.05)] hover:border-cyan-400'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  
                  {/* Left: Checkbox + Time + Details */}
                  <div className="flex items-start space-x-3.5 flex-1">
                    {/* Completion Checkbox */}
                    <button
                      id={`check-task-${task.id}`}
                      onClick={(e) => handleTaskCompletion(task, e)}
                      className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-none border flex items-center justify-center transition-all cursor-pointer ${
                        isCompleted
                          ? 'bg-cyan-400 border-cyan-400 text-black shadow-[0_0_8px_#00f2ff]'
                          : 'border-cyan-600/70 hover:border-cyan-400 hover:bg-cyan-400/10'
                      }`}
                      title={isCompleted ? "Bajarilmagan deb belgilash" : "Bajarildi deb belgilash"}
                    >
                      {isCompleted && (
                        <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="space-y-1.5 flex-1">
                      {/* Title */}
                      <h3 className={`font-mono text-sm sm:text-base font-bold uppercase tracking-wider transition-all ${
                        isCompleted ? 'line-through text-slate-500' : 'text-white'
                      }`}>
                        {task.title}
                      </h3>

                      {/* Monospace Telemetry Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-mono opacity-70">
                        <span className="text-cyan-300">MUHLAT: {task.startTime} ({task.durationMinutes}m)</span>
                        <span className={task.priority === 'CRITICAL' ? 'text-magenta-400 font-bold' : 'text-cyan-400'}>
                          USTUVORLIK: {task.priority}
                        </span>
                        <span className="text-slate-400 uppercase">SOHA: {categoryInfo.label}</span>
                      </div>

                      {/* Notes */}
                      {task.notes && (
                        <p className={`text-xs font-mono opacity-60 leading-relaxed ${
                          isCompleted ? 'text-slate-600' : 'text-slate-300'
                        }`}>
                          // {task.notes}
                        </p>
                      )}

                      {/* Voice Reminder Quote Snippet & Fast Listen */}
                      <div className="flex items-center space-x-2 pt-1 flex-wrap gap-y-1">
                        <button
                          onClick={() => {
                            playHudClick();
                            speakUzbekMotivation(
                              task.customVoicePrompt || task.title,
                              voiceSettings
                            );
                          }}
                          className="flex items-center space-x-1.5 text-[10px] font-mono text-cyan-400 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-950 px-2 py-0.5 border border-cyan-800/60 transition-colors cursor-pointer"
                          title="Ovozli eslatmani eshitish"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>OVOZLI ESLATMA</span>
                        </button>

                        {task.category === 'til_organish' && onOpenVocab && (
                          <button
                            onClick={() => {
                              playHudClick();
                              onOpenVocab();
                            }}
                            className="flex items-center space-x-1.5 text-[10px] font-mono text-emerald-400 hover:text-emerald-200 bg-emerald-950/40 px-2 py-0.5 border border-emerald-800/60 transition-colors cursor-pointer"
                          >
                            <BookMarked className="w-3 h-3" />
                            <span>SO'ZLAR RO'YXATINI OCHISH</span>
                          </button>
                        )}

                        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline truncate max-w-md italic">
                          "{task.customVoicePrompt || 'Vaqt yetib keldi!'}"
                        </span>
                      </div>

                      {/* Subtasks Accordion / Checklist */}
                      {subtasksTotal > 0 && (
                        <div className="mt-3 pt-2 border-t border-cyan-950 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span>BOSQICHLAR: {subtasksDone} / {subtasksTotal}</span>
                            <span className="text-cyan-400 font-mono">
                              {Math.round((subtasksDone / subtasksTotal) * 100)}%
                            </span>
                          </div>

                          <div className="w-full h-1 bg-cyan-950 rounded-none overflow-hidden">
                            <div
                              className="h-full bg-cyan-400 shadow-[0_0_8px_#00f2ff] transition-all duration-300"
                              style={{ width: `${(subtasksDone / subtasksTotal) * 100}%` }}
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                            {task.subtasks.map((st) => (
                              <div
                                key={st.id}
                                onClick={() => {
                                  playHudClick();
                                  onToggleSubtask(task.id, st.id);
                                }}
                                className="flex items-center space-x-2 text-[11px] font-mono text-slate-300 hover:text-cyan-200 cursor-pointer p-0.5"
                              >
                                {st.completed ? (
                                  <CheckSquare className="w-3 h-3 text-cyan-400" />
                                ) : (
                                  <Square className="w-3 h-3 text-slate-600" />
                                )}
                                <span className={st.completed ? 'line-through text-slate-500' : ''}>
                                  {st.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Action buttons */}
                  <div className="flex items-center space-x-1.5 self-end sm:self-start pt-2 sm:pt-0">
                    <button
                      onClick={() => onTriggerAlarmNow(task)}
                      className="p-1.5 border border-cyan-500/40 bg-cyan-950/60 text-cyan-300 hover:bg-cyan-400 hover:text-black transition-all cursor-pointer"
                      title="Ushbu vazifa uchun ovozli signalni darhol ishga tushirish"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        playHudClick();
                        onEditTask(task);
                      }}
                      className="p-1.5 border border-cyan-900/60 bg-[#080b1a] text-slate-300 hover:text-cyan-300 hover:border-cyan-400 transition-all cursor-pointer"
                      title="Tahrirlash"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        playHudClick();
                        onDeleteTask(task.id);
                      }}
                      className="p-1.5 border border-cyan-900/60 bg-[#080b1a] text-slate-500 hover:text-rose-400 hover:border-rose-500 transition-all cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
