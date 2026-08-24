import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Clock, 
  Volume2, 
  ListPlus, 
  Trash2, 
  AlertCircle, 
  Bot, 
  Loader2,
  Check,
  Heart,
  Users,
  Briefcase,
  Languages,
  Code2,
  Flame,
  Zap
} from 'lucide-react';
import { Task, TaskCategory, TaskPriority, StrictnessLevel, SubTask, CustomMotivationalQuote } from '../types';
import { CATEGORY_LABELS, STRICTNESS_LABELS, generateDefaultSpeechText } from '../utils/motivationalQuotes';
import { playHudClick, playSuccessChime } from '../utils/audioSynth';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Task) => void;
  initialTask?: Task | null;
  motivationalQuotes?: CustomMotivationalQuote[];
  onSaveCustomQuote?: (quote: CustomMotivationalQuote) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  initialTask,
  motivationalQuotes = [],
  onSaveCustomQuote,
}) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [category, setCategory] = useState<TaskCategory>(initialTask?.category || 'oilaviy_vaqt');
  const [startTime, setStartTime] = useState(initialTask?.startTime || '19:00');
  const [durationMinutes, setDurationMinutes] = useState(initialTask?.durationMinutes || 45);
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || 'HIGH');
  const [strictness, setStrictness] = useState<StrictnessLevel>(initialTask?.strictness || 'calm_commander');
  const [customVoicePrompt, setCustomVoicePrompt] = useState(initialTask?.customVoicePrompt || '');
  const [notes, setNotes] = useState(initialTask?.notes || '');
  const [reminderEnabled, setReminderEnabled] = useState(initialTask?.reminderEnabled ?? true);
  const [subtasks, setSubtasks] = useState<SubTask[]>(initialTask?.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isDecomposing, setIsDecomposing] = useState(false);

  if (!isOpen) return null;

  // Preset fast templates
  const quickTemplates = [
    {
      label: "👨‍👩‍👧 Oilaviy Vaqt",
      title: "Oila va yaqinlar bilan sifatli vaqt (Suhbat & Choy)",
      category: 'oilaviy_vaqt' as TaskCategory,
      duration: 60,
      priority: 'HIGH' as TaskPriority,
      notes: "Telefon va ishlarni chetga surib, oila davrasida dildan suhbatlashish",
      speech: "Eslatma: Oila va yaqinlar bilan vaqt o'tkazish soati keldi! Barcha tashvishlarni chetga surib, e'tiboringizni yaqinlaringizga bag'ishlang!",
    },
    {
      label: "🤝 Biznes Uchrashuv",
      title: "Mijoz / Hamkor bilan biznes muzokaralar",
      category: 'biznes_uchrashuv' as TaskCategory,
      duration: 60,
      priority: 'CRITICAL' as TaskPriority,
      notes: "Taqdimot, hisobotlar va muhim shartnoma bandlarini ko'rib chiqish",
      speech: "Strategik ogohlantirish: Biznes uchrashuv vaqti bo'ldi! Hujjatlar va maqsadlaringizni tayyorlang, aniq natija uchun harakat qiling!",
    },
    {
      label: "☕ Do'stlar Uchrashuvi",
      title: "Do'stlar bilan uchrashuv & Fikr almashish",
      category: 'dostlar_uchrashuv' as TaskCategory,
      duration: 90,
      priority: 'MEDIUM' as TaskPriority,
      notes: "Qahvaxonada uchrashuv, yangiliklar va rejalar bo'yicha suhbat",
      speech: "Do'stona eslatma: Do'stlar bilan uchrashuv vaqti boshlandi. Vaqtni maroqli va samimiy o'tkazing!",
    },
    {
      label: "🇬🇧 50 ta So'z Yodlash",
      title: "Ingliz tili: 50 ta yangi so'z va faol amaliyot",
      category: 'til_organish' as TaskCategory,
      duration: 45,
      priority: 'CRITICAL' as TaskPriority,
      notes: "Kiber leksikon, flashcards va gap tuzish mashqlari",
      speech: "Diqqat! Belgilangan vaqt yetib keldi: Siz ingliz tilidan 50 ta so'z yodlashingiz kerak! Vaqtni bekorga sarflamang, umr cheklangan!",
    },
    {
      label: "💻 Dasturlash & Deep Work",
      title: "Kiber Dasturlash: Asosiy loyiha kodi ustida ishlash",
      category: 'dasturlash_ish' as TaskCategory,
      duration: 90,
      priority: 'CRITICAL' as TaskPriority,
      notes: "Chalg'imasdan arxitektura va yangi funksiyalarni kodlash",
      speech: "Kiber-tizim ishga tushdi: Dasturlash vaqti! Barcha keraksiz oynalarni yoping va kodga sho'ng'ing!",
    },
    {
      label: "🏃‍♂️ Sport & Salomatlik",
      title: "Kechki / Ertalabki jismoniy mashg'ulot",
      category: 'sport_salomatlik' as TaskCategory,
      duration: 45,
      priority: 'HIGH' as TaskPriority,
      notes: "Kardio, yugurish yoki kuch mashqlari kompleksi",
      speech: "Kosmik ogohlantirish! Mashg'ulot vaqti keldi! Kuchli tana bo'lmasa buyuk maqsadlarga yetib bo'lmaydi, darhol boshlang!",
    },
  ];

  const applyTemplate = (tpl: typeof quickTemplates[0]) => {
    playHudClick();
    setTitle(tpl.title);
    setCategory(tpl.category);
    setDurationMinutes(tpl.duration);
    setPriority(tpl.priority);
    setNotes(tpl.notes);
    setCustomVoicePrompt(tpl.speech);
    setValidationError(null);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    playHudClick();
    setSubtasks((prev) => [
      ...prev,
      {
        id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: newSubtaskTitle.trim(),
        completed: false,
      },
    ]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (id: string) => {
    playHudClick();
    setSubtasks((prev) => prev.filter((st) => st.id !== id));
  };

  // AI-powered Motivational Speech Generator with fallback
  const handleGenerateAIMotivation = async () => {
    if (!title.trim()) {
      setValidationError("Iltimos, avval mashg'ulot nomini kiriting!");
      return;
    }
    setValidationError(null);
    playHudClick();
    setIsGeneratingSpeech(true);

    try {
      const res = await fetch('/api/motivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: title,
          category,
          strictness,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.speechText) {
          setCustomVoicePrompt(data.speechText);
          return;
        }
      }
    } catch (e) {
      console.warn("AI motivate fallback triggered:", e);
    } finally {
      setIsGeneratingSpeech(false);
    }

    // Client-side instant generator fallback
    setCustomVoicePrompt(generateDefaultSpeechText(title, category, strictness));
  };

  // AI-powered Task Decomposition into subtasks with fallback
  const handleAIDecompose = async () => {
    if (!title.trim()) {
      setValidationError("Iltimos, avval mashg'ulot nomini kiriting!");
      return;
    }
    setValidationError(null);
    playHudClick();
    setIsDecomposing(true);

    try {
      const res = await fetch('/api/decompose-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: title,
          notes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.subtasks && Array.isArray(data.subtasks)) {
          const mapped: SubTask[] = data.subtasks.map((st: any, index: number) => ({
            id: `st-ai-${Date.now()}-${index}`,
            title: st.title || st,
            completed: false,
          }));
          setSubtasks(mapped);
          return;
        }
      }
    } catch (e) {
      console.warn("AI decompose fallback triggered:", e);
    } finally {
      setIsDecomposing(false);
    }

    // Instant smart subtask breakdown fallback
    if (category === 'oilaviy_vaqt') {
      setSubtasks([
        { id: `st-${Date.now()}-1`, title: "Ish va telefonlarni ovozsiz rejimga o'tkazish", completed: false },
        { id: `st-${Date.now()}-2`, title: "Oila davrasida suhbat va kechki dasturxon", completed: false },
        { id: `st-${Date.now()}-3`, title: "Farzandlar/yaqinlar bilan qiziqarli o'yin yoki rejalashtirish", completed: false },
      ]);
    } else if (category === 'biznes_uchrashuv') {
      setSubtasks([
        { id: `st-${Date.now()}-1`, title: "Uchrashuv maqsadi va asosiy tezislarni ko'rib chiqish", completed: false },
        { id: `st-${Date.now()}-2`, title: "Muzokaralar olib borish va hamkorlik shartlarini kelishish", completed: false },
        { id: `st-${Date.now()}-3`, title: "Xulosalar qaydi va keyingi qadamlarni belgilash", completed: false },
      ]);
    } else if (category === 'dostlar_uchrashuv') {
      setSubtasks([
        { id: `st-${Date.now()}-1`, title: "Uchrashuv joyi va vaqtini aniqlashtirish", completed: false },
        { id: `st-${Date.now()}-2`, title: "Samimiy suhbat va maroqli hordiq", completed: false },
      ]);
    } else {
      setSubtasks([
        { id: `st-${Date.now()}-1`, title: "Tayyorgarlik va chalg'ituvchi omillarni yo'qotish (5 daqiqa)", completed: false },
        { id: `st-${Date.now()}-2`, title: "Asosiy qism ustida to'liq fokus bilan ishlash (30 daqiqa)", completed: false },
        { id: `st-${Date.now()}-3`, title: "Natijani tahlil qilish va xulosa chiqarish (10 daqiqa)", completed: false },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError("Iltimos, mashg'ulot nomini kiriting!");
      return;
    }

    playSuccessChime();

    const taskToSave: Task = {
      id: initialTask?.id || `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      category,
      startTime: startTime || '09:00',
      durationMinutes: Number(durationMinutes) || 45,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      priority,
      status: initialTask?.status || 'pending',
      completedAt: initialTask?.completedAt,
      notes: notes.trim(),
      customVoicePrompt: customVoicePrompt.trim() || generateDefaultSpeechText(title, category, strictness),
      strictness,
      reminderEnabled,
      subtasks,
      createdAt: initialTask?.createdAt || new Date().toISOString(),
    };

    onSaveTask(taskToSave);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div 
        id="add-task-modal"
        className="relative w-full max-w-2xl bg-[#040612] border border-cyan-500/70 p-6 sm:p-8 rounded-none shadow-[inset_0_0_30px_rgba(0,242,255,0.06),0_0_40px_rgba(0,242,255,0.2)] my-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-cyan-950 border border-cyan-900/60 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-4 border-b border-cyan-900/60 pb-3">
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full shadow-[0_0_8px_#00f2ff] animate-pulse" />
          <div>
            <h2 className="font-mono font-bold text-base sm:text-lg text-white uppercase tracking-wider">
              {initialTask ? "MASHG'ULOTNI TAHRIRLASH" : "YANGI MASHG'ULOT QO'SHISH"}
            </h2>
            <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
              [ PROTOCOL ENTRY // OILAVIY, BIZNES, DO'STLAR & ILM-FAN ]
            </p>
          </div>
        </div>

        {/* Quick Template Selector */}
        {!initialTask && (
          <div className="mb-5 bg-cyan-950/20 border border-cyan-900/50 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-cyan-400" />
                TEZKOR SHABLONLAR (1 BOSISHDA TO'LDIRISH)
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickTemplates.map((tpl, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => applyTemplate(tpl)}
                  className="px-2.5 py-1 bg-black/60 border border-cyan-800/60 hover:border-cyan-400 text-slate-300 hover:text-cyan-200 text-[11px] font-mono transition-all cursor-pointer hover:bg-cyan-950"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {validationError && (
          <div className="p-2.5 mb-4 bg-rose-950/60 border border-rose-500 text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-2">
              MASHG'ULOT NOMI *
            </label>
            <input
              id="task-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError(null);
              }}
              placeholder="Masalan: Oila bilan suhbat, Biznes uchrashuv yoki Ingliz tili 50 ta so'z"
              className="w-full px-3.5 py-2.5 bg-black/60 border border-cyan-900/80 rounded-none text-white placeholder-slate-600 font-mono text-xs focus:outline-none focus:border-cyan-400 transition-all"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-2">
              KATEGORIYA & SOHA
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(CATEGORY_LABELS) as TaskCategory[]).map((catKey) => {
                const isSelected = category === catKey;
                const cat = CATEGORY_LABELS[catKey];
                return (
                  <button
                    type="button"
                    key={catKey}
                    onClick={() => {
                      playHudClick();
                      setCategory(catKey);
                    }}
                    className={`flex items-center space-x-2 px-3 py-2 border text-xs font-mono transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,242,255,0.2)]'
                        : 'bg-black/40 border-cyan-900/40 text-slate-400 hover:border-cyan-800'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="truncate uppercase">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time & Duration & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-2">
                BOSHLANISH VAQTI *
              </label>
              <input
                id="task-time-input"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-black/60 border border-cyan-900/80 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-2">
                DAVOMIYLIGI (DAQIQA)
              </label>
              <input
                type="number"
                min="5"
                max="480"
                step="5"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-3 py-2 bg-black/60 border border-cyan-900/80 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-2">
                MUHIMLIK DARAJASI
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 bg-black/60 border border-cyan-900/80 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              >
                <option value="CRITICAL">🔴 CRITICAL (Favqulodda)</option>
                <option value="HIGH">🟠 HIGH (Yuqori)</option>
                <option value="MEDIUM">🟡 MEDIUM (O'rtacha)</option>
                <option value="LOW">🟢 LOW (Past)</option>
              </select>
            </div>
          </div>

          {/* Custom Voice Motivational Alert Text with AI Generator & Custom Quotes Selector */}
          <div className="bg-cyan-950/20 border border-cyan-900/70 p-4 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                OVOZLI ESLATMA MATNI (BELGILANGAN VAQTDA O'QILADI)
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGenerateAIMotivation}
                  disabled={isGeneratingSpeech}
                  className="flex items-center space-x-1 px-2.5 py-1 border border-cyan-500/50 bg-cyan-950 text-cyan-300 text-[10px] font-mono hover:bg-cyan-900 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingSpeech ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Bot className="w-3 h-3 text-cyan-400" />
                  )}
                  <span>AI GENERATOR</span>
                </button>
              </div>
            </div>

            {/* Quick Picker from user's custom motivational quotes */}
            {motivationalQuotes.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                  Saqlangan gaplardan tanlash:
                </span>
                <select
                  onChange={(e) => {
                    const selected = motivationalQuotes.find((q) => q.id === e.target.value);
                    if (selected) {
                      setCustomVoicePrompt(selected.text);
                    }
                  }}
                  defaultValue=""
                  className="flex-1 px-2 py-1 bg-black/80 border border-cyan-900 text-cyan-300 text-[10px] font-mono rounded cursor-pointer focus:border-cyan-400"
                >
                  <option value="" disabled>-- Mening motivatsion gaplarim ({motivationalQuotes.length}) --</option>
                  {motivationalQuotes.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.title} - "{q.text.substring(0, 45)}..."
                    </option>
                  ))}
                </select>
              </div>
            )}

            <textarea
              rows={3}
              value={customVoicePrompt}
              onChange={(e) => setCustomVoicePrompt(e.target.value)}
              placeholder="Masalan: Diqqat! Belgilangan vaqt yetib keldi: Siz ushbu vazifani bajarishingiz kerak! Vaqtni bekorga sarflamang, umr cheklangan!"
              className="w-full px-3 py-2 bg-black/60 border border-cyan-900/80 rounded-none text-xs text-cyan-100 placeholder-slate-600 font-mono focus:outline-none focus:border-cyan-400"
            />
            
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <p className="flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-cyan-500" />
                Belgilangan vaqt bo'lganda ushbu matn ovozli signal bilan o'qiladi.
              </p>
              
              {customVoicePrompt.trim() && onSaveCustomQuote && (
                <button
                  type="button"
                  onClick={() => {
                    onSaveCustomQuote({
                      id: `quote_${Date.now()}`,
                      title: title || `${CATEGORY_LABELS[category]?.label || 'Shaxsiy'} Eslatmasi`,
                      text: customVoicePrompt.trim(),
                      category,
                      strictness,
                      author: "O'zim",
                      isFavorite: true,
                      timesPlayed: 0,
                      createdAt: new Date().toISOString(),
                    });
                    playSuccessChime();
                    alert("Ushbu gap shaxsiy motivatsiyalar kutubxonasiga saqlandi!");
                  }}
                  className="text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
                >
                  + Ushbu matnni motivatsiyalarimga saqlash
                </button>
              )}
            </div>
          </div>


          {/* Subtasks / Micro-protocols */}
          <div className="bg-cyan-950/10 border border-cyan-900/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-300">
                KIBER-BOSQICHLAR (SUB-TOPSHIRIQLAR)
              </span>

              <button
                type="button"
                onClick={handleAIDecompose}
                disabled={isDecomposing}
                className="flex items-center space-x-1 px-2 py-0.5 border border-purple-500/40 bg-purple-950/40 text-purple-300 text-[10px] font-mono transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDecomposing ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-purple-400" />
                )}
                <span>AI BOSQICHLAR</span>
              </button>
            </div>

            {/* Subtask list */}
            {subtasks.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {subtasks.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center justify-between px-2.5 py-1.5 bg-black/60 border border-cyan-950 text-xs font-mono text-slate-200"
                  >
                    <span>{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(st.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new subtask input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Yangi bosqich qo'shish..."
                className="flex-1 px-3 py-1 bg-black/60 border border-cyan-900/60 text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-cyan-400"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-1 bg-cyan-950 border border-cyan-600 text-cyan-300 text-xs font-mono hover:bg-cyan-900 transition-colors cursor-pointer"
              >
                <ListPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-1">
              IZOH VA TAVSIYALAR (QO'SHIMCHA)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Qo'shimcha eslatma, joylashuv, manzil yoki uchrashuv mavzusi..."
              className="w-full px-3 py-2 bg-black/60 border border-cyan-900/80 rounded-none text-xs text-white placeholder-slate-600 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-cyan-900/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-cyan-900/60 text-slate-400 font-mono text-xs hover:bg-cyan-950 transition-colors cursor-pointer"
            >
              BEKOR QILISH
            </button>

            <button
              id="save-task-btn"
              type="submit"
              className="px-6 py-2 bg-cyan-400 text-black font-mono font-bold text-xs uppercase tracking-widest shadow-[0_0_10px_#00f2ff] hover:bg-cyan-300 transition-all cursor-pointer"
            >
              {initialTask ? "O'ZGARISHLARNI SAQLASH" : "MASHG'ULOTNI SAQLASH"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

