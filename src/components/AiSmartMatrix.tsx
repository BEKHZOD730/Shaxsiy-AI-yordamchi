import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Code2, 
  BookMarked, 
  MessageSquareQuote, 
  Check, 
  Copy, 
  Volume2, 
  Globe, 
  CalendarPlus, 
  Plus, 
  Search, 
  Loader2, 
  Zap, 
  ArrowRight,
  Terminal,
  Cpu,
  Layers
} from 'lucide-react';
import { 
  TopicRecommendationBundle, 
  VocabWord, 
  Task, 
  VoiceSettings 
} from '../types';
import { 
  speakEnglishWord, 
  speakBilingualWord, 
  speakUzbekMotivation, 
  playHudClick, 
  playSuccessChime 
} from '../utils/audioSynth';

interface AiSmartMatrixProps {
  onAddVocabWord: (word: VocabWord) => void;
  onAddTask: (task: Task) => void;
  voiceSettings: VoiceSettings;
}

export const AiSmartMatrix: React.FC<AiSmartMatrixProps> = ({
  onAddVocabWord,
  onAddTask,
  voiceSettings,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<string>("React 19 & TypeScript");
  const [customInput, setCustomInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<TopicRecommendationBundle | null>(null);
  const [activeSection, setActiveSection] = useState<'all' | 'vocab' | 'phrases' | 'code'>('all');
  
  // Feedback states
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [savedWordIds, setSavedWordIds] = useState<Set<string>>(new Set());
  const [addedTaskTitle, setAddedTaskTitle] = useState<string | null>(null);

  const presetTopics = [
    { id: "react_typescript", label: "🚀 React 19 & TypeScript", query: "React 19, TypeScript, Clean State Management & Custom Hooks" },
    { id: "algorithms", label: "🧠 Algoritmlar & Data Structures", query: "Algoritmlar, LeetCode, Two Pointers, Sliding Window, DP" },
    { id: "nodejs_backend", label: "⚡ Node.js & Database Architecture", query: "Node.js, Express, PostgreSQL, REST API & Scalability" },
    { id: "ielts_academic", label: "🇬🇧 IELTS Band 8.0 & Fluency", query: "IELTS Academic Vocabulary, Collocations & Formal Speaking" },
    { id: "fullstack_web", label: "🌐 Full-Stack Architecture", query: "Full-Stack Web Development, Microservices, Auth & Cache" },
    { id: "ai_prompts", label: "🤖 AI & Prompt Engineering", query: "AI Prompt Engineering, LLM Integration, Vector Databases" },
  ];

  // Fetch recommendations
  const fetchRecommendations = async (topicQuery: string) => {
    playHudClick();
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicQuery }),
      });

      if (response.ok) {
        const data: TopicRecommendationBundle = await response.json();
        setRecommendation(data);
      }
    } catch (e) {
      console.error("AI recommendations fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRecommendations("React 19 & TypeScript");
  }, []);

  // Audio handlers
  const handlePlayEnglish = (text: string) => {
    playHudClick();
    speakEnglishWord(text, 0.85);
  };

  const handlePlayUzbek = (text: string) => {
    playHudClick();
    speakUzbekMotivation(text, voiceSettings);
  };

  const handlePlayBilingual = (enText: string, uzText: string) => {
    playHudClick();
    speakBilingualWord(enText, uzText);
  };

  // Save word to user's vocabulary list
  const handleSaveWordToVocab = (wordItem: any, index: number) => {
    playSuccessChime();
    const wordId = `vocab-rec-${Date.now()}-${index}`;
    const newWord: VocabWord = {
      id: wordId,
      word: wordItem.word,
      phonetic: wordItem.phonetic || `/${wordItem.word.toLowerCase()}/`,
      partOfSpeech: wordItem.partOfSpeech || "Ot",
      uzbekMeaning: wordItem.uzbekMeaning,
      definition: wordItem.definition || "",
      exampleSentence: wordItem.exampleSentence || "",
      exampleTranslation: wordItem.exampleTranslation || "",
      mnemonic: wordItem.mnemonic || "",
      status: 'new_learning',
      difficulty: wordItem.difficulty || 'medium',
      category: recommendation?.category || 'Dasturlash',
      createdAt: new Date().toISOString(),
    };

    onAddVocabWord(newWord);
    setSavedWordIds(prev => new Set(prev).add(wordItem.word));
  };

  // Copy code snippet to clipboard
  const handleCopyCode = (codeId: string, code: string) => {
    playHudClick();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(codeId);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  // Add Code / Challenge to Planner
  const handleAddCodeToPlanner = (title: string, desc: string, durationMinutes: number = 45) => {
    playSuccessChime();
    const newTask: Task = {
      id: `task-rec-${Date.now()}`,
      title: `💻 ${title}`,
      category: 'dasturlash_ish',
      startTime: '10:00',
      durationMinutes,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      priority: 'HIGH',
      status: 'pending',
      notes: desc,
      customVoicePrompt: `Diqqat! "${title}" dasturlash amaliyoti vaqti yetib keldi! Kodni sinab ko'ring va mahoratingizni oshiring!`,
      strictness: 'spartan_mentor',
      reminderEnabled: true,
      subtasks: [
        { id: `st-1`, title: "Kodni ko'rib chiqish va sintaksisni tushunish", completed: false },
        { id: `st-2`, title: "O'z loyihangizda mustaqil yozib sinash", completed: false },
        { id: `st-3`, title: "Atamalarni lug'atda mustahkamlash", completed: false },
      ],
      createdAt: new Date().toISOString(),
    };

    onAddTask(newTask);
    setAddedTaskTitle(title);
    setTimeout(() => setAddedTaskTitle(null), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#00f2ff]">
      
      {/* Staria Horizon LED Lightbar Banner */}
      <div className="staria-horizon-lightbar rounded-full" />

      {/* Main Cockpit Header & Telemetry */}
      <div className="staria-cockpit-panel p-5 sm:p-6 rounded-3xl relative overflow-hidden border border-cyan-500/30">
        
        {/* Parametric grid background accent */}
        <div className="absolute inset-0 staria-parametric-mesh opacity-25 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-900/60 pb-4">
          <div>
            <div className="flex items-center gap-3 text-[10px] font-mono tracking-[0.25em] text-cyan-400 uppercase">
              <span className="flex items-center gap-1.5 bg-cyan-950/80 px-2 py-0.5 border border-cyan-700/50">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                STARIA NEURAL CORE
              </span>
              <span className="text-purple-400">// KOD VA SO'ZLAR MATRITSASI</span>
            </div>
            
            <h2 className="font-mono text-xl sm:text-2xl font-bold uppercase text-white tracking-wider flex items-center gap-2 mt-1">
              <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
              AI LIKSIZ & KOD TAVSIYALARI MARKAZI
            </h2>
            <p className="text-xs font-mono text-slate-300 mt-1">
              Siz o'rganayotgan mavzu bo'yicha birga o'rganilishi kerak bo'lgan <span className="text-cyan-300 font-bold">so'zlar</span>, <span className="text-purple-300 font-bold">iboralar</span> va <span className="text-emerald-300 font-bold">amaliy kodlar</span>ni bir joyda o'rganing.
            </p>
          </div>

          {/* Quick HUD Pill Status */}
          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 bg-[#081026] border border-cyan-600/40 text-cyan-300 text-xs font-mono staria-pill flex items-center gap-2 shadow-[0_0_12px_rgba(0,242,255,0.15)]">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>HORIZON DRIVE: FAOL</span>
            </div>
          </div>
        </div>

        {/* Topic Presets Carousel */}
        <div className="pt-4 space-y-3">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest flex items-center justify-between">
            <span>O'RGANILAYOTGAN YO'NALISHNI TANLANG:</span>
            {recommendation && (
              <span className="text-cyan-400 font-bold">
                Mavzu: {recommendation.topic}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {presetTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => {
                  setSelectedTopic(topic.label);
                  fetchRecommendations(topic.query);
                }}
                disabled={isLoading}
                className={`px-3.5 py-2 text-xs font-mono whitespace-nowrap transition-all cursor-pointer staria-pill ${
                  selectedTopic === topic.label
                    ? 'bg-cyan-400 text-black font-bold border-cyan-300 shadow-[0_0_15px_#00f2ff]'
                    : 'bg-[#060c20]/80 text-slate-300 hover:text-white hover:border-cyan-500/80 hover:bg-cyan-950/40'
                }`}
              >
                {topic.label}
              </button>
            ))}
          </div>

          {/* Custom Topic Search Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customInput.trim()) {
                setSelectedTopic(customInput.trim());
                fetchRecommendations(customInput.trim());
              }
            }}
            className="flex items-center gap-2 pt-1"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="Ixtiyoriy mavzuni yozing (masalan: Next.js Server Components, Docker & DevOps, Python Pandas, Data Science)..."
                className="w-full pl-9 pr-4 py-2.5 bg-black/60 border border-cyan-900/80 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-cyan-400 transition-all"
              />
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-3" />
            </div>

            <button
              type="submit"
              disabled={!customInput.trim() || isLoading}
              className="px-5 py-2.5 bg-cyan-400 text-black font-mono font-bold text-xs uppercase hover:bg-cyan-300 transition-all cursor-pointer disabled:opacity-40 flex items-center gap-2 shadow-[0_0_12px_#00f2ff]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>AI TAHLIL</span>
            </button>
          </form>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="staria-cockpit-panel p-10 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <div className="font-mono text-sm text-cyan-300 font-bold">
            XENO STARIA NEYRON TIZIMI "{selectedTopic}" UCHUN MATRITSANI TUZMOQDA...
          </div>
          <p className="font-mono text-xs text-slate-400 max-w-md">
            Inglizcha atamalar, kasbiy iboralar va amaliy kod andozalari sintez qilinmoqda.
          </p>
        </div>
      )}

      {/* Content Display */}
      {!isLoading && recommendation && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Notification when code/task added */}
          {addedTaskTitle && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-mono text-xs flex items-center justify-between animate-fade-in staria-pill px-4">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>"{addedTaskTitle}" vazifasi Rejalashtiruvchi taqvimizga muvaffaqiyatli qo'shildi!</span>
              </span>
            </div>
          )}

          {/* Section Filter Pills */}
          <div className="flex items-center gap-2 border-b border-cyan-900/60 pb-3">
            <button
              onClick={() => setActiveSection('all')}
              className={`px-4 py-1.5 text-xs font-mono staria-pill cursor-pointer transition-all ${
                activeSection === 'all'
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,242,255,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              BARCHASI ({recommendation.suggestedWords.length + recommendation.suggestedPhrases.length + recommendation.suggestedCodeSnippets.length})
            </button>
            <button
              onClick={() => setActiveSection('vocab')}
              className={`px-4 py-1.5 text-xs font-mono staria-pill cursor-pointer transition-all flex items-center gap-1.5 ${
                activeSection === 'vocab'
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,242,255,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BookMarked className="w-3.5 h-3.5 text-cyan-400" />
              <span>SO'ZLAR ({recommendation.suggestedWords.length})</span>
            </button>
            <button
              onClick={() => setActiveSection('phrases')}
              className={`px-4 py-1.5 text-xs font-mono staria-pill cursor-pointer transition-all flex items-center gap-1.5 ${
                activeSection === 'phrases'
                  ? 'bg-purple-950 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(188,19,254,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquareQuote className="w-3.5 h-3.5 text-purple-400" />
              <span>IBORALAR ({recommendation.suggestedPhrases.length})</span>
            </button>
            <button
              onClick={() => setActiveSection('code')}
              className={`px-4 py-1.5 text-xs font-mono staria-pill cursor-pointer transition-all flex items-center gap-1.5 ${
                activeSection === 'code'
                  ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>AMALIY KODLAR ({recommendation.suggestedCodeSnippets.length})</span>
            </button>
          </div>

          {/* 1. KEY VOCABULARY SECTION */}
          {(activeSection === 'all' || activeSection === 'vocab') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-sm font-bold uppercase text-white flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-cyan-400" />
                  <span>1. MAVZU BO'YICHA BIRGA O'RGANILISHI KERAK BO'LGAN ASOSIY SO'ZLAR</span>
                </h3>
                <span className="text-[10px] font-mono text-cyan-400/80">
                  {recommendation.suggestedWords.length} ta muhim leksik birlik
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendation.suggestedWords.map((wordItem, idx) => {
                  const isSaved = savedWordIds.has(wordItem.word);
                  return (
                    <div
                      key={idx}
                      className="staria-cockpit-panel p-4 rounded-2xl border border-cyan-900/60 hover:border-cyan-400/60 transition-all space-y-3 relative group"
                    >
                      {/* Word Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-cyan-950 pb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-lg font-bold text-white">
                              {wordItem.word}
                            </span>
                            {wordItem.phonetic && (
                              <span className="font-mono text-xs text-cyan-400">
                                {wordItem.phonetic}
                              </span>
                            )}
                            {wordItem.partOfSpeech && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-cyan-950/80 border border-cyan-800 text-cyan-300">
                                {wordItem.partOfSpeech}
                              </span>
                            )}
                          </div>
                          
                          {/* Uzbek Meaning */}
                          <div className="text-sm font-mono font-bold text-emerald-300 mt-1">
                            🇺🇿 {wordItem.uzbekMeaning}
                          </div>
                        </div>

                        {/* Audio & Save Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handlePlayEnglish(wordItem.word)}
                            className="p-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 transition-colors cursor-pointer"
                            title="Inglizcha talaffuz"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handlePlayUzbek(`So'z ma'nosi: ${wordItem.uzbekMeaning}`)}
                            className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 transition-colors cursor-pointer"
                            title="O'zbekcha ovoz"
                          >
                            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                          </button>
                          <button
                            onClick={() => handlePlayBilingual(wordItem.word, wordItem.uzbekMeaning)}
                            className="p-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-purple-300 transition-colors cursor-pointer"
                            title="Ikki tilli eshitish"
                          >
                            <Globe className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Definition */}
                      {wordItem.definition && (
                        <div className="text-xs font-mono text-slate-300">
                          <span className="text-cyan-400 font-bold">TA'RIF:</span> {wordItem.definition}
                        </div>
                      )}

                      {/* Example sentence */}
                      {wordItem.exampleSentence && (
                        <div className="p-2.5 bg-black/50 border border-cyan-950/80 rounded-sm text-xs font-mono space-y-1">
                          <div className="text-cyan-200">
                            🇬🇧 "{wordItem.exampleSentence}"
                          </div>
                          {wordItem.exampleTranslation && (
                            <div className="text-slate-400 text-[11px]">
                              🇺🇿 "{wordItem.exampleTranslation}"
                            </div>
                          )}
                        </div>
                      )}

                      {/* Mnemonic / Memory Hack */}
                      {wordItem.mnemonic && (
                        <div className="text-[11px] font-mono text-purple-300 bg-purple-950/20 p-2 border border-purple-900/40">
                          💡 {wordItem.mnemonic}
                        </div>
                      )}

                      {/* Add to Lexicon Button */}
                      <button
                        onClick={() => handleSaveWordToVocab(wordItem, idx)}
                        disabled={isSaved}
                        className={`w-full py-2 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer staria-pill ${
                          isSaved
                            ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300 cursor-default'
                            : 'bg-cyan-950/50 hover:bg-cyan-400 hover:text-black border border-cyan-600 text-cyan-300 shadow-[0_0_10px_rgba(0,242,255,0.15)]'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>LUG'ATGA SAQLANDI ✓</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ SHAXSIY LUG'ATGA QO'SHISH</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. IDIOMATIC PHRASES & COLLOCATIONS */}
          {(activeSection === 'all' || activeSection === 'phrases') && recommendation.suggestedPhrases?.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-sm font-bold uppercase text-white flex items-center gap-2">
                  <MessageSquareQuote className="w-4 h-4 text-purple-400" />
                  <span>2. SOHADA ENG KO'P ISHLATILADIGAN MUHIM IBORALAR VA KOLLOKATSIYALAR</span>
                </h3>
                <span className="text-[10px] font-mono text-purple-400/80">
                  {recommendation.suggestedPhrases.length} ta ibora
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recommendation.suggestedPhrases.map((phraseItem, idx) => (
                  <div
                    key={idx}
                    className="staria-cockpit-panel p-4 rounded-2xl border border-purple-900/50 hover:border-purple-500/60 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono text-base font-bold text-white">
                          "{phraseItem.phrase}"
                        </div>
                        <div className="text-xs font-mono font-bold text-purple-300 mt-0.5">
                          🇺🇿 {phraseItem.uzbekMeaning}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handlePlayEnglish(phraseItem.phrase)}
                          className="p-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-purple-300 cursor-pointer"
                          title="Inglizcha talaffuz"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePlayUzbek(phraseItem.uzbekMeaning)}
                          className="p-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-purple-300 cursor-pointer"
                          title="O'zbekcha ovoz"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400">
                      <span className="text-purple-400 font-bold">KONTEKST:</span> {phraseItem.context}
                    </div>

                    <div className="p-2.5 bg-black/60 border border-purple-950/80 rounded-sm text-xs font-mono text-purple-200">
                      🇬🇧 "{phraseItem.exampleSentence}"
                      {phraseItem.exampleTranslation && (
                        <div className="text-slate-400 text-[11px] mt-1">
                          🇺🇿 "{phraseItem.exampleTranslation}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. PRACTICAL CODE SNIPPETS & PATTERNS */}
          {(activeSection === 'all' || activeSection === 'code') && recommendation.suggestedCodeSnippets?.length > 0 && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-sm font-bold uppercase text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-400" />
                  <span>3. AMALIY DASTURLASH KODLARI & ARXITEKTURA PATTERNLARI</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-400/80">
                  {recommendation.suggestedCodeSnippets.length} ta kod namunasi
                </span>
              </div>

              <div className="space-y-4">
                {recommendation.suggestedCodeSnippets.map((codeItem, idx) => {
                  const isCopied = copiedCodeId === (codeItem.id || `code-${idx}`);
                  return (
                    <div
                      key={idx}
                      className="staria-cockpit-panel p-5 rounded-2xl border border-cyan-800/60 space-y-3"
                    >
                      {/* Code Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-950 pb-2.5">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-cyan-400" />
                          <h4 className="font-mono text-sm font-bold text-white">
                            {codeItem.title}
                          </h4>
                          <span className="px-2 py-0.5 bg-cyan-950/80 border border-cyan-800 text-[10px] font-mono text-cyan-300 uppercase">
                            {codeItem.language || 'typescript'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Copy Code Button */}
                          <button
                            onClick={() => handleCopyCode(codeItem.id || `code-${idx}`, codeItem.code)}
                            className="px-3 py-1 bg-[#09122c] hover:bg-cyan-950 border border-cyan-600 text-cyan-300 text-xs font-mono flex items-center gap-1.5 staria-pill cursor-pointer"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>NUSXA OLINDI!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>NUSXA OLISH</span>
                              </>
                            )}
                          </button>

                          {/* Add to Task Planner Button */}
                          <button
                            onClick={() => handleAddCodeToPlanner(codeItem.title, codeItem.explanation)}
                            className="px-3 py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-1.5 staria-pill cursor-pointer"
                            title="Kun tartibiga vazifa qilib qo'shish"
                          >
                            <CalendarPlus className="w-3.5 h-3.5" />
                            <span>REJAGA QO'SHISH</span>
                          </button>
                        </div>
                      </div>

                      {/* Code Block */}
                      <div className="bg-[#02050f] border border-cyan-950 rounded-lg p-4 font-mono text-xs text-cyan-200 overflow-x-auto relative shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
                        <pre className="leading-relaxed whitespace-pre font-mono">
                          {codeItem.code}
                        </pre>
                      </div>

                      {/* Explanation & Best Practice */}
                      <div className="space-y-2 text-xs font-mono">
                        <div className="text-slate-300">
                          <span className="text-cyan-400 font-bold">KOD QANDAY ISHLAYDI:</span> {codeItem.explanation}
                        </div>
                        {codeItem.bestPracticeTip && (
                          <div className="p-2.5 bg-emerald-950/20 border border-emerald-900/40 text-emerald-300 flex items-start gap-2">
                            <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong className="text-emerald-200">BEST PRACTICE:</strong> {codeItem.bestPracticeTip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. DAILY MINI-CHALLENGE / QUEST */}
          {recommendation.miniChallenge && (
            <div className="staria-cockpit-panel p-5 rounded-2xl border border-amber-500/50 bg-amber-950/10 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/40 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h4 className="font-mono text-sm font-bold text-white uppercase">
                    🎯 KUNLIK AMALIY MISSIA: {recommendation.miniChallenge.title}
                  </h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-amber-950/80 border border-amber-700 text-amber-300">
                    ⏱️ {recommendation.miniChallenge.estimatedMinutes} daqiqa
                  </span>
                </div>

                <button
                  onClick={() => handleAddCodeToPlanner(recommendation.miniChallenge.title, recommendation.miniChallenge.description, recommendation.miniChallenge.estimatedMinutes)}
                  className="px-4 py-1.5 bg-amber-400 text-black font-mono font-bold text-xs uppercase staria-pill hover:bg-amber-300 cursor-pointer shadow-[0_0_12px_#ffb703] flex items-center gap-1.5"
                >
                  <CalendarPlus className="w-3.5 h-3.5" />
                  <span>TAQVIMGA QO'SHISH</span>
                </button>
              </div>

              <p className="text-xs font-mono text-amber-100">
                {recommendation.miniChallenge.description}
              </p>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
