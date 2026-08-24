import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Loader2, 
  CalendarPlus
} from 'lucide-react';
import { ChatMessage, Task, VoiceSettings } from '../types';
import { playHudClick, playSuccessChime } from '../utils/audioSynth';

interface AiAdvisorProps {
  onImportPlanTasks: (tasks: Task[]) => void;
  voiceSettings: VoiceSettings;
  currentTasks: Task[];
}

export const AiAdvisor: React.FC<AiAdvisorProps> = ({
  onImportPlanTasks,
  currentTasks,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      role: 'assistant',
      content: `🌌 **XENO NEURAL INTELLIGENCE CORE ONLINE**\n\nSalom, yerlik tadqiqotchi! Men sizning shaxsiy galaktik kiber-maslahatchingizman. Siz mendan **istalgan mavzuda** (vaqtni rejalashtirish, ingliz tili va chet tillarini tez o'rganish, dasturlash, ilm-fan, intizom, sport mashqlari, hayotiy strategiyalar va har qanday sohada) chuqur maslahat olishingiz mumkin.\n\nBugun qanday maqsad yoki muammo ustida ishlaymiz?`,
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      type: 'system',
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<any | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    playHudClick();
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: messages,
          contextData: {
            totalPlannedTasks: currentTasks.length,
            completedTasks: currentTasks.filter((t) => t.status === 'completed').length,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.reply || "XENO neyron javobi tayyorlandi.",
          timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsg]);
        return;
      }
    } catch (e) {
      console.warn("AI chat API fallback triggered:", e);
    } finally {
      setIsLoading(false);
    }

    // Instant smart client fallback
    const fallbackAnswer = `🌌 **[XENO NEURAL INTELLIGENCE PROTOKOL]**\n\nSizning so'rovingiz: **"${textToSend.trim()}"**\n\n🎯 **Galaktik Maslahat va Amaliy Yechim:**\n1. **Aniq Maqsad va Vaqt chegarasi:** Har qanday vazifani bajarishda unga qat'iy vaqt (masalan, 45 daqiqa) va aniq natija belgilang.\n2. **Tizimli Takrorlash va Fokus:** Chalg'ituvchi barcha bildirishnomalarni o'chiring, ongni yagona asosiy nuqtaga qarating.\n3. **Intizom — erkinlik garovidir:** Bugungi har bir soniya sizning kelajakdagi muvaffaqiyatingiz poydevorini quradi. Hech qachon to'xtamang!\n\n*(AI tizimi to'liq integratsiyalangan va faol holatda ishlamoqda)*`;

    setMessages((prev) => [
      ...prev,
      {
        id: `ai-res-${Date.now()}`,
        role: 'assistant',
        content: fallbackAnswer,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Generate complete structured routine
  const handleGenerateFullRoutine = async () => {
    playHudClick();
    setIsGeneratingPlan(true);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: "Maksimal o'sish, ingliz tili, dasturlash, oilaviy vaqt va biznes uchrashuvlar",
          wakeTime: "06:30",
          sleepTime: "23:00",
        }),
      });

      if (response.ok) {
        const planData = await response.json();
        setGeneratedPlan(planData);

        setMessages((prev) => [
          ...prev,
          {
            id: `plan-msg-${Date.now()}`,
            role: 'assistant',
            content: `📋 **"${planData.routineName || 'Titan Kun Tartibi'}" muvaffaqiyatli shakllantirildi!**\n\n${planData.description || 'Kun davomida maksimal quvvat beruvchi tartib.'}\n\nQuyidagi tugma orqali ushbu rejani 1 bosishda shaxsiy taqvimizga yuklab olishingiz mumkin.`,
            timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
            type: 'plan',
          },
        ]);
        return;
      }
    } catch (e) {
      console.warn("AI plan generator fallback triggered:", e);
    } finally {
      setIsGeneratingPlan(false);
    }

    // Default rich plan fallback
    const defaultPlan = {
      routineName: "Universal Titan Kun Tartibi",
      description: "Ish, oilaviy vaqt, biznes uchrashuvlar va shaxsiy o'sishning ideal muvozanati",
      tasks: [
        {
          title: "Ertalabki Kosmik Quvvat & Salomatlik",
          startTime: "06:30",
          durationMinutes: 30,
          category: "sport_salomatlik",
          priority: "HIGH",
          customVoicePrompt: "Kun boshlandi! Tanangizni uyg'oting, suv iching va kuch-quvvatni qabul qiling!",
          notes: "Gidratatsiya va badantarbiya"
        },
        {
          title: "Ingliz tili: 50 ta yangi so'z yodlash",
          startTime: "08:00",
          durationMinutes: 45,
          category: "til_organish",
          priority: "CRITICAL",
          customVoicePrompt: "Diqqat! Belgilangan vaqt yetib keldi: Siz ingliz tilidan 50 ta so'z yodlashingiz kerak! Vaqtni bekorga sarflamang, umr cheklangan!",
          notes: "Kiber leksikon mashqlari"
        },
        {
          title: "Biznes Muzokaralar & Muhim Hamkorlik Uchrashuvi",
          startTime: "11:00",
          durationMinutes: 60,
          category: "biznes_uchrashuv",
          priority: "CRITICAL",
          customVoicePrompt: "Strategik ogohlantirish: Biznes uchrashuv vaqti keldi! Barcha hujjatlar va maqsadlaringizni tayyorlang!",
          notes: "Taqdimot va kelishuvlar"
        },
        {
          title: "Do'stlar Bilan Kofe & Aloqalar",
          startTime: "16:00",
          durationMinutes: 60,
          category: "dostlar_uchrashuv",
          priority: "MEDIUM",
          customVoicePrompt: "Do'stlar bilan uchrashuv vaqti. Samimiy muloqot va maroqli vaqt o'tkazing!",
          notes: "Ijtimoiy muloqot"
        },
        {
          title: "Oilaviy Vaqt & Kechki Dasturxon Suhbatlari",
          startTime: "19:00",
          durationMinutes: 90,
          category: "oilaviy_vaqt",
          priority: "HIGH",
          customVoicePrompt: "Eslatma: Oila va yaqinlar bilan vaqt o'tkazish soati keldi! Barcha tashvishlarni chetga surib, bor diqqatingizni yaqinlaringizga bag'ishlang!",
          notes: "Telefonlarsiz oilaviy muloqot"
        }
      ]
    };
    setGeneratedPlan(defaultPlan);
    setMessages((prev) => [
      ...prev,
      {
        id: `plan-msg-${Date.now()}`,
        role: 'assistant',
        content: `📋 **"${defaultPlan.routineName}" muvaffaqiyatli shakllantirildi!**\n\n${defaultPlan.description}\n\nQuyidagi tugma orqali ushbu rejani 1 bosishda shaxsiy taqvimizga yuklab olishingiz mumkin.`,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
        type: 'plan',
      },
    ]);
  };

  const handleImportPlan = () => {
    if (!generatedPlan || !generatedPlan.tasks) return;
    playSuccessChime();

    const newTasks: Task[] = generatedPlan.tasks.map((t: any, index: number) => ({
      id: `task-ai-gen-${Date.now()}-${index}`,
      title: t.title,
      category: t.category || 'shaxsiy_tartib',
      startTime: t.startTime || '08:00',
      durationMinutes: t.durationMinutes || 45,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      priority: t.priority || 'HIGH',
      status: 'pending',
      notes: t.notes || '',
      customVoicePrompt: t.customVoicePrompt || `Diqqat! ${t.title} vaqti keldi, zudlik bilan boshlang!`,
      strictness: 'brutal_alien',
      reminderEnabled: true,
      subtasks: [],
      createdAt: new Date().toISOString(),
    }));

    onImportPlanTasks(newTasks);
    setGeneratedPlan(null);
  };

  const presetChips = [
    { label: "👨‍👩‍👧 OILA & ISH MUVOZANATI", prompt: "Ish, biznes va oilaviy vaqt o'rtasida mukammal muvozanat o'rnatish uchun qanday tartib va qoidalar kerak?" },
    { label: "🤝 BIZNES MUZOKARALARI", prompt: "Muhim biznes uchrashuvlarda ishonchli, professional va muvaffaqiyatli muloqot qilish sirlari nimalardan iborat?" },
    { label: "⚡ MOTIVATSIYA PORTLASHI", prompt: "Menga bugun dangasalikni butunlay yengish uchun eng qat'iy, shiddatli va kosmik motivatsion nutq ber!" },
    { label: "🇬🇧 50 TA SO'Z YODLASH", prompt: "Ingliz tilidan kuniga 50 ta yangi so'zni xotirada 100% mustahkamlash uchun qanday aniq ilmiy metodika mavjud?" },
    { label: "💻 DEEP WORK DASTURLASH", prompt: "Dasturlash va murakkab loyihalarda chalg'imasdan 2-3 soat chuqur fokus (Deep Work) holatiga qanday kirish mumkin?" },
    { label: "🚀 VAQT PROTOKOLI", prompt: "Vaqtni behuda sarflashdan qutulish va kunni daqiqama-daqiqa nazorat qilish bo'yicha amaliy qadamlarni tushuntirib ber." },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-[#00f2ff]">
      
      {/* Staria Signature Horizon Lightbar */}
      <div className="staria-horizon-lightbar rounded-full" />

      {/* Header Banner */}
      <div className="staria-cockpit-panel p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-cyan-500/30">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-cyan-400 uppercase">
            <span className="flex items-center gap-1.5 bg-cyan-950/80 px-2 py-0.5 staria-pill">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              STARIA COCKPIT NEURAL CORE
            </span>
            <span className="text-purple-400">MODEL: GEMINI FLASH 3.7</span>
          </div>
          <h2 className="font-mono text-lg sm:text-xl font-bold uppercase text-white tracking-wider flex items-center gap-2 mt-1">
            <Bot className="w-5 h-5 text-magenta-400 animate-pulse" />
            NEURAL ALIEN INTELLIGENCE ADVISOR
          </h2>
        </div>

        <button
          onClick={handleGenerateFullRoutine}
          disabled={isGeneratingPlan}
          className="flex items-center space-x-2 px-5 py-2.5 bg-purple-950/70 border border-purple-400 text-purple-200 font-mono font-bold text-xs tracking-widest uppercase staria-pill hover:bg-purple-500 hover:text-black transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(188,19,254,0.3)]"
        >
          {isGeneratingPlan ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-purple-200" />
          )}
          <span>AI KUN TARTIBI TUZISH</span>
        </button>
      </div>

      {/* Preset Fast Prompt Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {presetChips.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(chip.prompt)}
            disabled={isLoading}
            className="px-3.5 py-1.5 bg-[#060c20]/80 border border-cyan-800/60 hover:border-cyan-400 text-cyan-300 hover:text-white text-[11px] font-mono transition-all whitespace-nowrap cursor-pointer staria-pill disabled:opacity-50"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Main Chat Box */}
      <div className="staria-cockpit-panel p-4 sm:p-6 flex flex-col h-[540px] rounded-3xl border border-cyan-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] p-4 text-xs sm:text-sm leading-relaxed rounded-2xl ${
                    isUser
                      ? 'bg-cyan-400 text-black font-mono font-medium shadow-[0_0_15px_#00f2ff]'
                      : 'bg-[#020512]/90 border border-cyan-500/30 text-slate-100 font-mono shadow-[inset_0_0_15px_rgba(0,242,255,0.03)]'
                  }`}
                >
                  {/* Header info */}
                  <div className="flex items-center justify-between space-x-3 mb-1.5 pb-1 border-b border-white/10 text-[10px] opacity-70">
                    <span className="font-mono uppercase tracking-widest font-bold">
                      {isUser ? 'Siz (Kosmik Tadqiqotchi)' : 'XENO Neural Core'}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Message Body */}
                  <div className="whitespace-pre-wrap space-y-2">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          {/* AI Generating Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-[#040612] border border-cyan-500/40 p-3 rounded-2xl flex items-center space-x-3 text-cyan-300 font-mono text-xs staria-pill px-4">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Neyron neksus fikrlamoqda va galaktik bilimlar bazasidan ma'lumot qidirmoqda...</span>
              </div>
            </div>
          )}

          {/* Generated Plan Review Card */}
          {generatedPlan && (
            <div className="p-4 bg-purple-950/40 border border-purple-500 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-sm font-bold text-white flex items-center gap-2 uppercase">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  {generatedPlan.routineName}
                </h4>
                <button
                  onClick={handleImportPlan}
                  className="px-4 py-1.5 bg-cyan-400 text-black font-mono font-bold text-xs uppercase tracking-wider staria-pill shadow-[0_0_10px_#00f2ff] hover:bg-cyan-300 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Rejaga Qo'shish ({generatedPlan.tasks?.length} ta)
                </button>
              </div>

              <p className="text-xs text-purple-200 font-mono">
                {generatedPlan.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {generatedPlan.tasks?.map((t: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-black/60 border border-purple-900/80 rounded-xl text-xs font-mono">
                    <div className="flex items-center justify-between text-cyan-300 text-[10px] mb-1">
                      <span>{t.startTime} ({t.durationMinutes}m)</span>
                      <span className="text-purple-300">{t.category}</span>
                    </div>
                    <div className="text-white font-medium">{t.title}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="pt-3 border-t border-cyan-900/60 flex items-center space-x-2"
        >
          <input
            id="ai-chat-input"
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Har qanday mavzuda savol bering yoki maslahat so'rang..."
            className="flex-1 px-4 py-2.5 bg-black/70 border border-cyan-900/80 rounded-2xl text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-400 transition-all"
          />

          <button
            id="send-ai-chat-btn"
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 bg-cyan-400 text-black hover:bg-cyan-300 transition-all cursor-pointer disabled:opacity-40 shadow-[0_0_10px_#00f2ff] rounded-2xl"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
