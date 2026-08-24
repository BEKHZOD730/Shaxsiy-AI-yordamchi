import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Star, 
  Copy, 
  Check, 
  Search, 
  Filter, 
  RotateCcw, 
  Bot, 
  Flame, 
  Zap, 
  Save, 
  X, 
  CheckCircle2,
  Tag,
  Clock,
  Send,
  MessageSquareQuote
} from 'lucide-react';
import { CustomMotivationalQuote, TaskCategory, StrictnessLevel, VoiceSettings } from '../types';
import { CATEGORY_LABELS, STRICTNESS_LABELS } from '../utils/motivationalQuotes';
import { speakUzbekMotivation, playHudClick, playSuccessChime } from '../utils/audioSynth';

interface MotivationalQuotesStudioProps {
  quotes: CustomMotivationalQuote[];
  onSaveQuote: (quote: CustomMotivationalQuote) => void;
  onDeleteQuote: (id: string) => void;
  onResetQuotes: () => void;
  voiceSettings: VoiceSettings;
  onSelectForTest?: (text: string) => void;
}

export const MotivationalQuotesStudio: React.FC<MotivationalQuotesStudioProps> = ({
  quotes,
  onSaveQuote,
  onDeleteQuote,
  onResetQuotes,
  voiceSettings,
  onSelectForTest,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStrictness, setSelectedStrictness] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Editor Modal / Drawer state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<CustomMotivationalQuote | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [category, setCategory] = useState<TaskCategory>('til_organish');
  const [strictness, setStrictness] = useState<StrictnessLevel>('brutal_alien');
  const [author, setAuthor] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);

  // Audio State
  const [activePlayingId, setActivePlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Open Create New Modal
  const handleOpenCreate = () => {
    playHudClick();
    setEditingQuote(null);
    setTitle('');
    setText("Diqqat! Belgilangan vaqt yetib keldi: Siz o'z vazifangizni bajarishingiz kerak! Nima qilmoqchi eding, nima qilyapsan, vaqtni bekorga sarflama! Sizga ishongan insonlar kutib tura olishmaydi, umr cheklangan! Hoziroq harakatni boshlang!");
    setCategory('til_organish');
    setStrictness('brutal_alien');
    setAuthor("O'zim");
    setTags(['Shaxsiy', 'Intizom']);
    setIsFavorite(false);
    setIsEditorOpen(true);
  };

  // Open Edit Existing Modal
  const handleOpenEdit = (quote: CustomMotivationalQuote) => {
    playHudClick();
    setEditingQuote(quote);
    setTitle(quote.title);
    setText(quote.text);
    setCategory(quote.category);
    setStrictness(quote.strictness);
    setAuthor(quote.author || "O'zim");
    setTags(quote.tags || []);
    setIsFavorite(!!quote.isFavorite);
    setIsEditorOpen(true);
  };

  // Save Quote Handler
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      alert("Iltimos, motivatsion gap matnini kiriting!");
      return;
    }

    const newOrUpdatedQuote: CustomMotivationalQuote = {
      id: editingQuote ? editingQuote.id : `quote_${Date.now()}`,
      title: title.trim() || `${CATEGORY_LABELS[category]?.label || 'Motivatsiya'} Eslatmasi`,
      text: text.trim(),
      category,
      strictness,
      author: author.trim() || "O'zim",
      isFavorite,
      tags: tags.length > 0 ? tags : [CATEGORY_LABELS[category]?.label || 'Umumiy'],
      timesPlayed: editingQuote?.timesPlayed || 0,
      createdAt: editingQuote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveQuote(newOrUpdatedQuote);
    playSuccessChime();
    setIsEditorOpen(false);
  };

  // Toggle Favorite
  const handleToggleFavorite = (quote: CustomMotivationalQuote, e: React.MouseEvent) => {
    e.stopPropagation();
    playHudClick();
    onSaveQuote({
      ...quote,
      isFavorite: !quote.isFavorite,
      updatedAt: new Date().toISOString(),
    });
  };

  // Delete Quote
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Ushbu motivatsion gapni o'chirmoqchimisiz?")) {
      playHudClick();
      onDeleteQuote(id);
    }
  };

  // Play Live Voice
  const handlePlayVoice = (quote: CustomMotivationalQuote, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playHudClick();

    if (activePlayingId === quote.id) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setActivePlayingId(null);
      return;
    }

    setActivePlayingId(quote.id);
    speakUzbekMotivation(quote.text, voiceSettings, () => {
      setActivePlayingId(null);
    });

    // Increment played counter
    onSaveQuote({
      ...quote,
      timesPlayed: (quote.timesPlayed || 0) + 1,
    });
  };

  // Copy Quote Text to Clipboard
  const handleCopyText = (quote: CustomMotivationalQuote, e: React.MouseEvent) => {
    e.stopPropagation();
    playHudClick();
    navigator.clipboard.writeText(quote.text);
    setCopiedId(quote.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Add Tag
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // AI Quote Generator
  const handleGenerateWithAi = async () => {
    setIsGeneratingAi(true);
    playHudClick();

    try {
      const categoryInfo = CATEGORY_LABELS[category]?.label || category;
      const res = await fetch('/api/motivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: title || categoryInfo,
          category,
          strictness,
        }),
      });

      const data = await res.json();
      if (data.speechText) {
        setText(data.speechText);
        if (!title) {
          setTitle(`AI: ${categoryInfo} Galaktik Eslatmasi`);
        }
      }
    } catch (err) {
      console.error("AI motivation generation error:", err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Filtered quotes
  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.author && q.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.tags && q.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedCategory === 'all' || q.category === selectedCategory;
    const matchesStrictness = selectedStrictness === 'all' || q.strictness === selectedStrictness;
    const matchesFavorite = !onlyFavorites || q.isFavorite;

    return matchesSearch && matchesCategory && matchesStrictness && matchesFavorite;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header Controls */}
      <div className="p-5 sm:p-6 bg-[#04081c] border border-cyan-900/60 rounded-2xl relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,242,255,0.03)]">
        <div className="absolute top-0 right-0 w-72 h-72 bg-magenta-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.3)]">
              <MessageSquareQuote className="w-6 h-6 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-mono uppercase text-white tracking-wider flex items-center gap-2">
                MOTIVATSION GAPLAR & ESLATMALAR MUHARRIRI
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                O'zingiz xohlagan motivatsiyalarni yozing, tahrirlang, ovozda tinglang va signallarga biriktiring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleOpenCreate}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(0,242,255,0.4)] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>YANGI GAP YOZISH</span>
            </button>

            <button
              onClick={() => {
                if (confirm("Barcha motivatsion gaplarni boshlang'ich holatga qaytarasizmi?")) {
                  onResetQuotes();
                  playSuccessChime();
                }
              }}
              className="p-2.5 bg-[#060c20] border border-slate-800 hover:border-cyan-500 text-slate-400 hover:text-cyan-300 rounded-xl transition-all cursor-pointer"
              title="Boshlang'ich andozalarga qaytarish"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-cyan-950">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Qidiruv (matn, sarlavha, teg)..."
              className="w-full pl-9 pr-3 py-2 bg-black/60 border border-cyan-900/60 rounded-xl text-xs font-mono text-cyan-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-black/60 border border-cyan-900/60 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all">Barcha Kategoriyalar</option>
              {Object.entries(CATEGORY_LABELS).map(([catKey, info]) => (
                <option key={catKey} value={catKey}>
                  {info.label}
                </option>
              ))}
            </select>
          </div>

          {/* Strictness Filter */}
          <div>
            <select
              value={selectedStrictness}
              onChange={(e) => setSelectedStrictness(e.target.value)}
              className="w-full px-3 py-2 bg-black/60 border border-cyan-900/60 rounded-xl text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="all">Barcha Qat'iylik Darajalari</option>
              {Object.entries(STRICTNESS_LABELS).map(([stKey, info]) => (
                <option key={stKey} value={stKey}>
                  {info.label}
                </option>
              ))}
            </select>
          </div>

          {/* Favorites Only Toggle */}
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
              onlyFavorites
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
                : 'bg-black/60 border-cyan-900/60 text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Faqat Tanlanganlar ⭐ ({quotes.filter((q) => q.isFavorite).length})</span>
          </button>
        </div>
      </div>

      {/* Quotes Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuotes.map((quote) => {
          const catInfo = CATEGORY_LABELS[quote.category] || CATEGORY_LABELS.shaxsiy_tartib;
          const strictInfo = STRICTNESS_LABELS[quote.strictness] || STRICTNESS_LABELS.brutal_alien;
          const isCurrentPlaying = activePlayingId === quote.id;

          return (
            <div
              key={quote.id}
              className={`p-5 rounded-2xl border transition-all duration-200 relative group flex flex-col justify-between ${
                isCurrentPlaying
                  ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_25px_rgba(0,242,255,0.3)] ring-1 ring-cyan-400'
                  : 'bg-[#05091e]/90 border-slate-800 hover:border-cyan-800/80'
              }`}
            >
              <div>
                {/* Top Badge Row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${catInfo.neonClass}`}>
                      {catInfo.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${strictInfo.badge}`}>
                      {strictInfo.label.split(' ')[0]}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => handleToggleFavorite(quote, e)}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        quote.isFavorite
                          ? 'text-amber-400 hover:text-amber-300'
                          : 'text-slate-600 hover:text-amber-400'
                      }`}
                      title={quote.isFavorite ? "Tanlanganlardan o'chirish" : "Tanlanganlarga qo'shish"}
                    >
                      <Star className={`w-4 h-4 ${quote.isFavorite ? 'fill-amber-400' : ''}`} />
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(quote)}
                      className="p-1.5 text-slate-400 hover:text-cyan-300 transition-colors rounded-lg cursor-pointer"
                      title="Tahrirlash"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDelete(quote.id, e)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors rounded-lg cursor-pointer"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-mono text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors mb-2">
                  {quote.title}
                </h4>

                {/* Quote Text */}
                <div className="p-3.5 bg-black/50 border border-cyan-950 rounded-xl mb-3">
                  <p className="text-xs sm:text-sm font-sans text-slate-200 leading-relaxed italic">
                    "{quote.text}"
                  </p>
                </div>

                {/* Tags & Author */}
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-3">
                  <span className="flex items-center gap-1 text-slate-400">
                    ✍️ <strong className="text-slate-300">{quote.author || "O'zim"}</strong>
                  </span>

                  {quote.tags && quote.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      {quote.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="px-1.5 py-0.5 bg-slate-900 border border-slate-800 rounded text-[9px] text-cyan-400/80">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions Row */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 gap-2">
                
                {/* Voice Play Button */}
                <button
                  onClick={(e) => handlePlayVoice(quote, e)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                    isCurrentPlaying
                      ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)] animate-pulse'
                      : 'bg-cyan-950/80 border border-cyan-500/60 hover:border-cyan-400 text-cyan-300'
                  }`}
                >
                  {isCurrentPlaying ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>TO'XTATISH</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>OVOZDA ESHITISH</span>
                    </>
                  )}
                </button>

                {/* Secondary Action: Select for Live Test or Copy */}
                <div className="flex items-center gap-1.5">
                  {onSelectForTest && (
                    <button
                      onClick={() => {
                        playHudClick();
                        onSelectForTest(quote.text);
                      }}
                      className="px-2.5 py-1.5 bg-[#060c20] border border-slate-800 hover:border-cyan-400 text-[11px] font-mono text-slate-300 hover:text-cyan-300 rounded-xl transition-all cursor-pointer"
                      title="Ushbu matnni sinov maydoniga o'tkazish"
                    >
                      Sinovga Qo'yish
                    </button>
                  )}

                  <button
                    onClick={(e) => handleCopyText(quote, e)}
                    className="p-1.5 bg-[#060c20] border border-slate-800 hover:border-cyan-400 text-slate-400 hover:text-cyan-300 rounded-xl transition-all cursor-pointer"
                    title="Matndan nusxa olish"
                  >
                    {copiedId === quote.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredQuotes.length === 0 && (
          <div className="col-span-full p-8 text-center bg-[#04081c] border border-cyan-950 rounded-2xl">
            <p className="font-mono text-sm text-slate-400">
              Hech qanday motivatsion gap topilmadi.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs rounded-xl cursor-pointer"
            >
              + Birinchi Motivatsiyani Yozish
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT MOTIVATIONAL QUOTE MODAL                                      */}
      {/* ========================================================================= */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-[#050a22] border border-cyan-400/80 rounded-2xl shadow-[0_0_50px_rgba(0,242,255,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-cyan-950 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-black">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-400 flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-cyan-300" />
                </div>
                <h3 className="font-mono text-sm sm:text-base font-bold uppercase text-white tracking-wider">
                  {editingQuote ? "MOTIVATSION GAPNI TAHRIRLASH" : "YANGI MOTIVATSION GAP YOZISH"}
                </h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs font-mono">
              
              {/* Title */}
              <div>
                <label className="block text-slate-400 uppercase tracking-widest mb-1.5">
                  SARLAVHA / NOMI:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: 50 ta so'z yodlash va vaqt qadri"
                  className="w-full px-3.5 py-2.5 bg-black/60 border border-cyan-900 rounded-xl text-cyan-100 font-mono text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>

              {/* Category and Strictness Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 uppercase tracking-widest mb-1.5">
                    KATEGORIYA:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as TaskCategory)}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-cyan-900 rounded-xl text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([catKey, info]) => (
                      <option key={catKey} value={catKey}>
                        {info.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 uppercase tracking-widest mb-1.5">
                    QAT'IYLIK DARAJASI:
                  </label>
                  <select
                    value={strictness}
                    onChange={(e) => setStrictness(e.target.value as StrictnessLevel)}
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-cyan-900 rounded-xl text-cyan-300 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {Object.entries(STRICTNESS_LABELS).map(([stKey, info]) => (
                      <option key={stKey} value={stKey}>
                        {info.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Motivation Text Area with AI Generate button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <span>MOTIVATSION MATN (O'ZBEK TILIDA O'QILADI):</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateWithAi}
                    disabled={isGeneratingAi}
                    className="flex items-center gap-1 px-2.5 py-1 bg-purple-950/80 border border-purple-500/60 hover:border-purple-400 text-purple-300 rounded-lg text-[10px] transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>{isGeneratingAi ? "AI Yozmoqda..." : "AI Yordamida Yozish"}</span>
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Diqqat! Belgilangan vaqt yetib keldi..."
                  className="w-full px-3.5 py-2.5 bg-black/80 border border-cyan-900 rounded-xl text-cyan-100 font-mono text-xs focus:outline-none focus:border-cyan-400 leading-relaxed"
                  required
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                  <span>{text.split(/\s+/).filter(Boolean).length} ta so'z</span>
                  <span>{text.length} ta belgi</span>
                </div>
              </div>

              {/* Author & Favorite */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 uppercase tracking-widest mb-1.5">
                    MUALLIF / NOM:
                  </label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Masalan: O'zim, Spartan Coach, Elon Musk"
                    className="w-full px-3.5 py-2.5 bg-black/60 border border-cyan-900 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isFavorite}
                      onChange={(e) => setIsFavorite(e.target.checked)}
                      className="w-4 h-4 rounded border-cyan-900 bg-black text-cyan-500 focus:ring-0 cursor-pointer"
                    />
                    <span>Tanlanganlarga qo'shish (⭐ Favorite)</span>
                  </label>
                </div>
              </div>

              {/* Tags Input */}
              <div>
                <label className="block text-slate-400 uppercase tracking-widest mb-1.5">
                  TEGLAR (KALIT SO'ZLAR):
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Teg yozing va Enter bosing (masalan: Intizom)"
                    className="flex-1 px-3 py-2 bg-black/60 border border-cyan-900 rounded-xl text-cyan-100 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-cyan-950 border border-cyan-800 text-cyan-300 rounded-xl hover:border-cyan-400 cursor-pointer"
                  >
                    Qo'shish
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-slate-900 border border-cyan-900 rounded-lg text-cyan-300 flex items-center gap-1 text-[10px]"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-rose-400 ml-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Footer Action Buttons */}
              <div className="pt-4 border-t border-cyan-950 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-xl cursor-pointer"
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(0,242,255,0.4)] cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>SAQLASH</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
