import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Volume2, 
  Plus, 
  CheckCircle2, 
  RotateCw, 
  Flame, 
  Search, 
  Trash2, 
  Layers, 
  BrainCircuit, 
  ArrowRight, 
  Loader2, 
  VolumeX, 
  Shuffle, 
  Lightbulb, 
  BookMarked,
  Check,
  ChevronRight,
  Zap,
  Globe,
  MessageSquareQuote
} from 'lucide-react';
import { VocabWord, WordStatus, VoiceSettings } from '../types';
import { 
  speakEnglishWord, 
  speakBilingualWord, 
  speakUzbekMotivation, 
  playHudClick, 
  playSuccessChime, 
  playLevelUpChime 
} from '../utils/audioSynth';
import { findDictionaryWord } from '../data/defaultVocab';

interface VocabModuleProps {
  words: VocabWord[];
  onAddWord: (word: VocabWord) => void;
  onUpdateWordStatus: (wordId: string, status: WordStatus) => void;
  onDeleteWord: (wordId: string) => void;
  onBatchAddWords: (newWords: VocabWord[]) => void;
  voiceSettings: VoiceSettings;
}

export const VocabModule: React.FC<VocabModuleProps> = ({
  words,
  onAddWord,
  onUpdateWordStatus,
  onDeleteWord,
  onBatchAddWords,
  voiceSettings,
}) => {
  const [activeGroup, setActiveGroup] = useState<WordStatus | 'all'>('new_learning');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputWord, setInputWord] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [analyzedPreview, setAnalyzedPreview] = useState<Partial<VocabWord> | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  
  // Flashcard mode
  const [isFlashcardOpen, setIsFlashcardOpen] = useState(false);
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Group counts
  const newCount = words.filter((w) => w.status === 'new_learning').length;
  const reviewCount = words.filter((w) => w.status === 'review').length;
  const learnedCount = words.filter((w) => w.status === 'learned').length;
  const totalCount = words.length;

  // Filtered words
  const filteredWords = words.filter((w) => {
    const matchesGroup = activeGroup === 'all' || w.status === activeGroup;
    const matchesSearch = 
      w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.uzbekMeaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (w.category && w.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesGroup && matchesSearch;
  });

  // AI Single Word Deep Analysis
  const handleAnalyzeWord = async () => {
    const trimmed = inputWord.trim();
    if (!trimmed || isAnalyzing) return;
    playHudClick();
    setIsAnalyzing(true);

    // Instant local dictionary lookup for instant responsiveness
    const localMatch = findDictionaryWord(trimmed);
    if (localMatch) {
      setAnalyzedPreview({
        ...localMatch,
        status: 'new_learning',
      });
    }

    try {
      const response = await fetch('/api/analyze-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: trimmed }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalyzedPreview({
          word: data.word || trimmed,
          phonetic: data.phonetic || (localMatch?.phonetic || `/${trimmed.toLowerCase()}/`),
          partOfSpeech: data.partOfSpeech || (localMatch?.partOfSpeech || "Ot / Sifat"),
          uzbekMeaning: data.uzbekMeaning || (localMatch?.uzbekMeaning || "O'zbekcha tarjima"),
          definition: data.definition || (localMatch?.definition || ""),
          exampleSentence: data.exampleSentence || (localMatch?.exampleSentence || `Practice using ${trimmed} daily.`),
          exampleTranslation: data.exampleTranslation || (localMatch?.exampleTranslation || `Har kuni ${trimmed} so'zini qo'llang.`),
          synonyms: data.synonyms || (localMatch?.synonyms || []),
          mnemonic: data.mnemonic || (localMatch?.mnemonic || ""),
          difficulty: data.difficulty || (localMatch?.difficulty || 'medium'),
          category: data.category || (localMatch?.category || 'IELTS'),
          status: 'new_learning',
        });
      } else if (!localMatch) {
        setAnalyzedPreview({
          word: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
          phonetic: `/${trimmed.toLowerCase()}/`,
          partOfSpeech: "Lug'at birligi",
          uzbekMeaning: `"${trimmed}" — o'rganiladigan yangi so'z`,
          definition: `Ushbu so'z leksik boylikni oshirish uchun tavsiya etiladi.`,
          exampleSentence: `Learning the word ${trimmed} expands vocabulary.`,
          exampleTranslation: `${trimmed} so'zini o'rganish nutqni boyitadi.`,
          synonyms: ["vocabulary", "key-word"],
          mnemonic: `"${trimmed}" so'zini 3 marta baland ovozda takrorlang!`,
          status: 'new_learning',
        });
      }
    } catch (e) {
      console.error("AI analysis fetch error:", e);
      if (!localMatch) {
        setAnalyzedPreview({
          word: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
          phonetic: `/${trimmed.toLowerCase()}/`,
          partOfSpeech: "Lug'at birligi",
          uzbekMeaning: `"${trimmed}" — o'rganiladigan yangi so'z`,
          exampleSentence: `Practice using ${trimmed} every single day.`,
          exampleTranslation: `Har kuni ${trimmed} so'zini mashq qiling.`,
          status: 'new_learning',
        });
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Save Analyzed Word to List
  const handleSaveAnalyzedWord = (statusTarget: WordStatus = 'new_learning') => {
    if (!analyzedPreview || !analyzedPreview.word) return;
    playSuccessChime();

    const newVocab: VocabWord = {
      id: `vocab-${Date.now()}`,
      word: analyzedPreview.word,
      phonetic: analyzedPreview.phonetic,
      partOfSpeech: analyzedPreview.partOfSpeech,
      uzbekMeaning: analyzedPreview.uzbekMeaning || "O'zbekcha ma'nosi",
      definition: analyzedPreview.definition,
      exampleSentence: analyzedPreview.exampleSentence,
      exampleTranslation: analyzedPreview.exampleTranslation,
      synonyms: analyzedPreview.synonyms,
      mnemonic: analyzedPreview.mnemonic,
      status: statusTarget,
      difficulty: analyzedPreview.difficulty || 'medium',
      category: analyzedPreview.category || 'Kundalik',
      audioPlayedCount: 0,
      createdAt: new Date().toISOString(),
    };

    onAddWord(newVocab);
    setInputWord('');
    setAnalyzedPreview(null);
  };

  // Generate Batch of High-Yield Words
  const handleGenerateBatch = async (categoryName: string) => {
    playHudClick();
    setIsGeneratingBatch(true);

    try {
      const response = await fetch('/api/batch-words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: categoryName, count: 5 }),
      });

      const data = await response.json();
      if (data.words && Array.isArray(data.words)) {
        const mappedWords: VocabWord[] = data.words.map((w: any, index: number) => ({
          id: `vocab-batch-${Date.now()}-${index}`,
          word: w.word,
          phonetic: w.phonetic,
          partOfSpeech: w.partOfSpeech,
          uzbekMeaning: w.uzbekMeaning,
          definition: w.definition,
          exampleSentence: w.exampleSentence,
          exampleTranslation: w.exampleTranslation,
          synonyms: w.synonyms || [],
          mnemonic: w.mnemonic || '',
          status: 'new_learning' as WordStatus,
          difficulty: w.difficulty || 'medium',
          category: categoryName,
          audioPlayedCount: 0,
          createdAt: new Date().toISOString(),
        }));

        onBatchAddWords(mappedWords);
        playSuccessChime();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  // Play Audio for English Word
  const handlePlayEnglish = (word: string) => {
    playHudClick();
    speakEnglishWord(word, 0.85);
  };

  // Play Uzbek Meaning in clean natural voice
  const handlePlayUzbekMeaning = (meaning: string) => {
    playHudClick();
    speakUzbekMotivation(`So'z ma'nosi: ${meaning}`, voiceSettings);
  };

  // Play Bilingual Audio
  const handlePlayBilingual = (word: string, meaning: string) => {
    playHudClick();
    speakBilingualWord(word, meaning);
  };

  // Play Sentence in English + Uzbek
  const handlePlaySentenceAudio = (enSentence: string, uzTranslation?: string) => {
    playHudClick();
    speakEnglishWord(enSentence, 0.9, () => {
      if (uzTranslation) {
        setTimeout(() => {
          speakUzbekMotivation(`Tarjimasi: ${uzTranslation}`, voiceSettings);
        }, 300);
      }
    });
  };

  // Move status with sound FX
  const handleStatusChange = (wordId: string, targetStatus: WordStatus) => {
    if (targetStatus === 'learned') {
      playLevelUpChime();
    } else {
      playHudClick();
    }
    onUpdateWordStatus(wordId, targetStatus);
  };

  // Active flashcard items
  const flashcardList = filteredWords.length > 0 ? filteredWords : words;
  const currentFlashcard = flashcardList[flashcardIndex] || null;

  return (
    <div className="space-y-6 animate-fade-in text-[#00f2ff]">
      
      {/* Top Header & Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-cyan-900/50 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-cyan-500 uppercase">
            <span>[ NEURAL LEXICON MATRIX // FAOL ]</span>
            <span>AI VOCABULARY ENGINE</span>
          </div>
          <h2 className="font-mono text-lg sm:text-xl font-bold uppercase text-white tracking-wider flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-cyan-400" />
            SO'ZLAR BAZASI VA AI BILAN O'RGANISH TIZIMI
          </h2>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          {words.length > 0 && (
            <button
              onClick={() => {
                playHudClick();
                setFlashcardIndex(0);
                setIsFlipped(false);
                setIsFlashcardOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 border border-magenta-500 bg-magenta-500/10 text-magenta-300 font-mono font-bold text-xs tracking-wider uppercase hover:bg-magenta-500 hover:text-white transition-all cursor-pointer shadow-[0_0_15px_rgba(188,19,254,0.3)]"
            >
              <Zap className="w-4 h-4 text-magenta-400 animate-pulse" />
              <span>FLASHKART VIKTORINASI</span>
            </button>
          )}

          {/* Quick AI Presets Dropdown / Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleGenerateBatch("IELTS Essential")}
              disabled={isGeneratingBatch}
              className="px-3 py-2 border border-cyan-800/80 bg-cyan-950/40 text-cyan-300 hover:border-cyan-400 text-[10px] font-mono uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isGeneratingBatch ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-cyan-400" />}
              <span>+5 IELTS SO'Z</span>
            </button>
            <button
              onClick={() => handleGenerateBatch("Dasturlash & IT")}
              disabled={isGeneratingBatch}
              className="px-3 py-2 border border-cyan-800/80 bg-cyan-950/40 text-cyan-300 hover:border-cyan-400 text-[10px] font-mono uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <span>+5 IT SO'Z</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cockpit / Telemetry HUD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Words */}
        <div 
          onClick={() => { playHudClick(); setActiveGroup('all'); }}
          className={`bg-[#080b1a] border p-4 cursor-pointer transition-all ${
            activeGroup === 'all' 
              ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,242,255,0.25)]' 
              : 'border-cyan-900/60 hover:border-cyan-700'
          }`}
        >
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center justify-between">
            <span>BARCHA SO'ZLAR</span>
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-white mt-1">
            {totalCount} <span className="text-xs text-cyan-500 font-normal">TA</span>
          </div>
        </div>

        {/* New to learn */}
        <div 
          onClick={() => { playHudClick(); setActiveGroup('new_learning'); }}
          className={`bg-[#080b1a] border p-4 cursor-pointer transition-all ${
            activeGroup === 'new_learning' 
              ? 'border-cyan-400 shadow-[0_0_15px_rgba(0,242,255,0.25)]' 
              : 'border-cyan-900/60 hover:border-cyan-700'
          }`}
        >
          <div className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest flex items-center justify-between">
            <span>YANGI O'RGANILADIGAN</span>
            <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-cyan-300 mt-1">
            {newCount} <span className="text-xs text-slate-400 font-normal">TA</span>
          </div>
        </div>

        {/* Review / Takrorlash */}
        <div 
          onClick={() => { playHudClick(); setActiveGroup('review'); }}
          className={`bg-[#080b1a] border p-4 cursor-pointer transition-all ${
            activeGroup === 'review' 
              ? 'border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.25)]' 
              : 'border-cyan-900/60 hover:border-amber-700'
          }`}
        >
          <div className="text-[10px] font-mono text-amber-400 uppercase tracking-widest flex items-center justify-between">
            <span>TAKRORLASH</span>
            <RotateCw className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-amber-300 mt-1">
            {reviewCount} <span className="text-xs text-slate-400 font-normal">TA</span>
          </div>
        </div>

        {/* Learned / O'rganilgan */}
        <div 
          onClick={() => { playHudClick(); setActiveGroup('learned'); }}
          className={`bg-[#080b1a] border p-4 cursor-pointer transition-all ${
            activeGroup === 'learned' 
              ? 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]' 
              : 'border-cyan-900/60 hover:border-emerald-700'
          }`}
        >
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest flex items-center justify-between">
            <span>O'RGANILGAN</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-mono font-bold text-emerald-300 mt-1">
            {learnedCount} <span className="text-xs text-slate-400 font-normal">TA</span>
          </div>
        </div>
      </div>

      {/* Input & AI Analysis Section */}
      <div className="bg-[#080b1a] border border-cyan-900/70 p-5 space-y-4 shadow-[inset_0_0_20px_rgba(0,242,255,0.03)]">
        <div className="flex items-center justify-between border-b border-cyan-950 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              YANGI SO'Z JOYLASHTIRISH VA AI BILAN TAHLIL QILISH
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-500">[ PROMPT INTERFACE ]</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            id="vocab-input-word"
            type="text"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAnalyzeWord();
              }
            }}
            placeholder="Inglizcha so'z kiriting (masalan: Ephemeral, Serendipity, Diligent, Opportunity)..."
            className="flex-1 px-4 py-3 bg-black/60 border border-cyan-900/80 rounded-none text-white placeholder-slate-600 font-mono text-sm focus:outline-none focus:border-cyan-400 transition-all"
          />

          <button
            id="vocab-analyze-btn"
            onClick={handleAnalyzeWord}
            disabled={!inputWord.trim() || isAnalyzing}
            className="px-6 py-3 bg-cyan-400 text-black font-mono font-bold text-xs uppercase tracking-widest hover:bg-cyan-300 transition-all disabled:opacity-40 shadow-[0_0_15px_rgba(0,242,255,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BrainCircuit className="w-4 h-4" />
            )}
            <span>AI BILAN TAHLIL QILISH</span>
          </button>
        </div>

        {/* AI Analyzed Word Preview Card */}
        {analyzedPreview && (
          <div className="p-4 bg-[#040612] border-l-4 border-cyan-400 border-y border-r border-cyan-900/80 space-y-3 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-950 pb-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-bold text-white tracking-wide">
                  {analyzedPreview.word}
                </span>
                {analyzedPreview.phonetic && (
                  <span className="font-mono text-xs text-cyan-400">
                    {analyzedPreview.phonetic}
                  </span>
                )}
                <span className="px-2 py-0.5 bg-cyan-950/60 border border-cyan-800 text-[10px] font-mono text-cyan-300">
                  {analyzedPreview.partOfSpeech}
                </span>
              </div>

              {/* Audio Listen Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handlePlayEnglish(analyzedPreview.word || '')}
                  className="px-2.5 py-1 bg-cyan-950/50 hover:bg-cyan-900 border border-cyan-600 text-cyan-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                  title="Inglizcha talaffuz"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>TALAFFUZ (EN)</span>
                </button>
                <button
                  onClick={() => handlePlayUzbekMeaning(analyzedPreview.uzbekMeaning || '')}
                  className="px-2.5 py-1 bg-emerald-950/50 hover:bg-emerald-900 border border-emerald-600 text-emerald-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                  title="O'zbekcha ma'nosini ovozli tinglash"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>O'ZBEKCHA OVOZ</span>
                </button>
                <button
                  onClick={() => handlePlayBilingual(analyzedPreview.word || '', analyzedPreview.uzbekMeaning || '')}
                  className="px-2.5 py-1 bg-purple-950/50 hover:bg-purple-900 border border-purple-600 text-purple-300 text-xs font-mono flex items-center gap-1 cursor-pointer"
                  title="Ikki tilli (so'z + ma'no) eshitish"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>IKKI TILLI</span>
                </button>
              </div>
            </div>

            {/* Uzbek Meaning */}
            <div className="text-base font-mono text-emerald-300 font-bold bg-emerald-950/20 p-2.5 border border-emerald-900/60">
              <span className="text-emerald-400 mr-2 uppercase text-xs tracking-wider">O'ZBEKCHA MA'NOSI:</span> 
              {analyzedPreview.uzbekMeaning}
            </div>

            {/* Definition */}
            {analyzedPreview.definition && (
              <div className="text-xs font-mono text-slate-300">
                <span className="text-cyan-400 font-bold">TA'RIFI:</span> {analyzedPreview.definition}
              </div>
            )}

            {/* Example sentence */}
            {analyzedPreview.exampleSentence && (
              <div className="p-3 bg-black/50 border border-cyan-950 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-cyan-200">
                    🇬🇧 "{analyzedPreview.exampleSentence}"
                  </div>
                  <button
                    onClick={() => handlePlaySentenceAudio(analyzedPreview.exampleSentence || '', analyzedPreview.exampleTranslation)}
                    className="text-[10px] font-mono text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                  >
                    <Volume2 className="w-3 h-3" />
                    <span>GAPNI TINGLASH</span>
                  </button>
                </div>
                {analyzedPreview.exampleTranslation && (
                  <div className="text-xs font-mono text-slate-400">
                    🇺🇿 "{analyzedPreview.exampleTranslation}"
                  </div>
                )}
              </div>
            )}

            {/* Synonyms & Mnemonic */}
            {analyzedPreview.synonyms && analyzedPreview.synonyms.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-slate-400">SINONIMLAR:</span>
                {analyzedPreview.synonyms.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-300">
                    {s}
                  </span>
                ))}
              </div>
            )}

            {analyzedPreview.mnemonic && (
              <div className="p-2.5 bg-purple-950/20 border border-purple-900/60 text-xs font-mono text-purple-200 flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>{analyzedPreview.mnemonic}</span>
              </div>
            )}

            {/* Save Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-cyan-950">
              <span className="text-[10px] font-mono text-slate-400 uppercase mr-2">QAYSI GURUHGA QO'SHILSIN?</span>
              <button
                onClick={() => handleSaveAnalyzedWord('new_learning')}
                className="px-3 py-1.5 bg-cyan-400 text-black font-mono font-bold text-xs hover:bg-cyan-300 cursor-pointer shadow-[0_0_10px_#00f2ff]"
              >
                + YANGI O'RGANILADIGAN
              </button>
              <button
                onClick={() => handleSaveAnalyzedWord('review')}
                className="px-3 py-1.5 bg-amber-500/20 border border-amber-500 text-amber-300 font-mono text-xs hover:bg-amber-500 hover:text-black cursor-pointer"
              >
                + TAKRORLASHGA
              </button>
              <button
                onClick={() => handleSaveAnalyzedWord('learned')}
                className="px-3 py-1.5 bg-emerald-500/20 border border-emerald-500 text-emerald-300 font-mono text-xs hover:bg-emerald-500 hover:text-black cursor-pointer"
              >
                + O'RGANILGANGA
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-cyan-900/50 pb-3">
        {/* Group Selector Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => { playHudClick(); setActiveGroup('new_learning'); }}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeGroup === 'new_learning'
                ? 'border-b-2 border-cyan-400 text-cyan-300 font-bold bg-cyan-950/30'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            Yangi ({newCount})
          </button>
          <button
            onClick={() => { playHudClick(); setActiveGroup('review'); }}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeGroup === 'review'
                ? 'border-b-2 border-amber-400 text-amber-300 font-bold bg-amber-950/30'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            Takrorlash ({reviewCount})
          </button>
          <button
            onClick={() => { playHudClick(); setActiveGroup('learned'); }}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeGroup === 'learned'
                ? 'border-b-2 border-emerald-400 text-emerald-300 font-bold bg-emerald-950/30'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            O'rganilgan ({learnedCount})
          </button>
          <button
            onClick={() => { playHudClick(); setActiveGroup('all'); }}
            className={`px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition-all cursor-pointer ${
              activeGroup === 'all'
                ? 'border-b-2 border-white text-white font-bold bg-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Barchasi ({totalCount})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="So'z yoki ma'no bo'yicha qidiruv..."
            className="pl-8 pr-3 py-1.5 bg-black/60 border border-cyan-900 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Words List Grid */}
      {filteredWords.length === 0 ? (
        <div className="bg-[#080b1a] border border-cyan-950 p-12 text-center space-y-3">
          <BookOpen className="w-8 h-8 text-cyan-600 mx-auto" />
          <p className="font-mono text-xs text-slate-400 uppercase tracking-widest">
            {searchQuery ? "QIDIRUV BO'YICHA SO'Z TOPILMADI" : "USHBU GURUHDAGI SO'ZLAR HOZIRCHA BO'SH"}
          </p>
          <p className="font-mono text-[11px] text-cyan-500">
            Yuqoridagi maydonga yangi so'z yozing yoki "+5 IELTS SO'Z" tugmasini bosing!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWords.map((wordItem) => {
            const isExpanded = activeCardId === wordItem.id;
            const isLearned = wordItem.status === 'learned';
            const isReview = wordItem.status === 'review';

            return (
              <div
                key={wordItem.id}
                className={`bg-[#080b1a] border p-4 space-y-3 transition-all relative ${
                  isLearned
                    ? 'border-l-4 border-l-emerald-400 border-y-cyan-950 border-r-cyan-950'
                    : isReview
                    ? 'border-l-4 border-l-amber-400 border-y-cyan-950 border-r-cyan-950'
                    : 'border-l-4 border-l-cyan-400 border-y-cyan-950 border-r-cyan-950'
                }`}
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-mono text-base font-bold text-white tracking-wide">
                        {wordItem.word}
                      </h4>
                      {wordItem.phonetic && (
                        <span className="font-mono text-xs text-cyan-400">
                          {wordItem.phonetic}
                        </span>
                      )}
                      {wordItem.partOfSpeech && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 bg-cyan-950/60 border border-cyan-900 text-cyan-300">
                          {wordItem.partOfSpeech}
                        </span>
                      )}
                    </div>
                    <div 
                      onClick={() => handlePlayUzbekMeaning(wordItem.uzbekMeaning)}
                      className="text-xs font-mono font-bold text-emerald-300 mt-1 cursor-pointer hover:underline flex items-center gap-1"
                      title="O'zbekcha talaffuzni tinglash"
                    >
                      <span>🇺🇿 {wordItem.uzbekMeaning}</span>
                    </div>
                  </div>

                  {/* Audio triggers */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePlayEnglish(wordItem.word)}
                      className="p-1.5 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 transition-colors cursor-pointer"
                      title="Inglizcha talaffuzni eshitish"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handlePlayUzbekMeaning(wordItem.uzbekMeaning)}
                      className="p-1.5 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 transition-colors cursor-pointer"
                      title="O'zbekcha ma'nosini ovozli tinglash"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    </button>
                    <button
                      onClick={() => handlePlayBilingual(wordItem.word, wordItem.uzbekMeaning)}
                      className="p-1.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-800 text-purple-300 transition-colors cursor-pointer"
                      title="Ikki tilli (so'z + ma'no) ketma-ket eshitish"
                    >
                      <Globe className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Definition if available */}
                {wordItem.definition && (
                  <div className="text-xs font-mono text-slate-300">
                    <span className="text-cyan-500 font-bold">TA'RIF:</span> {wordItem.definition}
                  </div>
                )}

                {/* Example sentence */}
                {wordItem.exampleSentence && (
                  <div className="p-2.5 bg-black/40 border border-cyan-950 text-xs font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="text-cyan-200">
                        🇬🇧 "{wordItem.exampleSentence}"
                      </div>
                      <button
                        onClick={() => handlePlaySentenceAudio(wordItem.exampleSentence || '', wordItem.exampleTranslation)}
                        className="text-[10px] text-cyan-400 hover:text-white ml-1 shrink-0 cursor-pointer"
                        title="Gapni eshitish"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {wordItem.exampleTranslation && (
                      <div className="text-slate-400 text-[11px]">
                        🇺🇿 "{wordItem.exampleTranslation}"
                      </div>
                    )}
                  </div>
                )}

                {/* Mnemonic trick if available */}
                {wordItem.mnemonic && (
                  <div className="text-[11px] font-mono text-purple-300 flex items-center gap-1.5 bg-purple-950/10 p-1.5 border border-purple-900/40">
                    <Lightbulb className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{wordItem.mnemonic}</span>
                  </div>
                )}

                {/* Status Transfer Controls */}
                <div className="flex items-center justify-between pt-2 border-t border-cyan-950">
                  <div className="flex items-center gap-1">
                    {wordItem.status !== 'new_learning' && (
                      <button
                        onClick={() => handleStatusChange(wordItem.id, 'new_learning')}
                        className="px-2 py-1 bg-cyan-950/40 border border-cyan-900 hover:border-cyan-400 text-[10px] font-mono text-cyan-300 transition-colors cursor-pointer"
                      >
                        [ YANGIGA ]
                      </button>
                    )}
                    {wordItem.status !== 'review' && (
                      <button
                        onClick={() => handleStatusChange(wordItem.id, 'review')}
                        className="px-2 py-1 bg-amber-950/40 border border-amber-900 hover:border-amber-400 text-[10px] font-mono text-amber-300 transition-colors cursor-pointer"
                      >
                        [ TAKRORLASH ]
                      </button>
                    )}
                    {wordItem.status !== 'learned' && (
                      <button
                        onClick={() => handleStatusChange(wordItem.id, 'learned')}
                        className="px-2 py-1 bg-emerald-950/40 border border-emerald-900 hover:border-emerald-400 text-[10px] font-mono text-emerald-300 transition-colors cursor-pointer"
                      >
                        [ O'RGANILDI ✓ ]
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => { playHudClick(); onDeleteWord(wordItem.id); }}
                    className="text-slate-600 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                    title="O'chirish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Fullscreen Interactive Flashcard Modal */}
      {isFlashcardOpen && currentFlashcard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-xl bg-[#040612] border border-magenta-500 p-6 sm:p-8 space-y-6 shadow-[0_0_40px_rgba(188,19,254,0.3)]">
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-magenta-950 pb-2">
              <div className="text-xs font-mono text-magenta-400">
                [ FLASHKART: {flashcardIndex + 1} / {flashcardList.length} ]
              </div>
              <button
                onClick={() => setIsFlashcardOpen(false)}
                className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                [ YOPISH ✕ ]
              </button>
            </div>

            {/* Flashcard Body */}
            <div
              onClick={() => {
                playHudClick();
                setIsFlipped(!isFlipped);
              }}
              className="min-h-[220px] bg-[#080b1a] border border-cyan-900/80 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyan-400 transition-all select-none space-y-3"
            >
              {!isFlipped ? (
                // Front
                <div className="space-y-3">
                  <div className="text-3xl font-mono font-bold text-white tracking-wider">
                    {currentFlashcard.word}
                  </div>
                  {currentFlashcard.phonetic && (
                    <div className="text-sm font-mono text-cyan-400">
                      {currentFlashcard.phonetic}
                    </div>
                  )}
                  {currentFlashcard.partOfSpeech && (
                    <div className="text-xs font-mono text-cyan-300">
                      {currentFlashcard.partOfSpeech}
                    </div>
                  )}
                  <div className="text-[11px] font-mono text-slate-500 uppercase tracking-widest pt-4">
                    [ BOSING: O'ZBEKCHA MA'NOSINI KO'RISH UCHUN ]
                  </div>
                </div>
              ) : (
                // Back
                <div className="space-y-3 animate-fade-in text-left w-full">
                  <div className="text-xl font-mono font-bold text-emerald-300 border-b border-emerald-950 pb-1">
                    🇺🇿 {currentFlashcard.uzbekMeaning}
                  </div>
                  {currentFlashcard.definition && (
                    <div className="text-xs font-mono text-slate-300">
                      <span className="text-cyan-400 font-bold">TA'RIF:</span> {currentFlashcard.definition}
                    </div>
                  )}
                  {currentFlashcard.exampleSentence && (
                    <div className="text-xs font-mono text-cyan-300 bg-black/60 p-2.5 border border-cyan-950 space-y-1">
                      <div>🇬🇧 "{currentFlashcard.exampleSentence}"</div>
                      {currentFlashcard.exampleTranslation && (
                        <div className="text-slate-400 text-[11px]">🇺🇿 "{currentFlashcard.exampleTranslation}"</div>
                      )}
                    </div>
                  )}
                  {currentFlashcard.mnemonic && (
                    <div className="text-[11px] font-mono text-purple-300 bg-purple-950/20 p-2 border border-purple-900/40">
                      💡 {currentFlashcard.mnemonic}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Audio Buttons */}
            <div className="flex justify-center gap-2 flex-wrap">
              <button
                onClick={() => handlePlayEnglish(currentFlashcard.word)}
                className="px-3.5 py-2 bg-cyan-400 text-black font-mono font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_#00f2ff]"
              >
                <Volume2 className="w-4 h-4" />
                <span>TALAFFUZ (EN)</span>
              </button>
              <button
                onClick={() => handlePlayUzbekMeaning(currentFlashcard.uzbekMeaning)}
                className="px-3.5 py-2 bg-emerald-600 text-white font-mono font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_#10b981]"
              >
                <Volume2 className="w-4 h-4" />
                <span>O'ZBEKCHA OVOZ</span>
              </button>
              <button
                onClick={() => handlePlayBilingual(currentFlashcard.word, currentFlashcard.uzbekMeaning)}
                className="px-3.5 py-2 bg-purple-600 text-white font-mono font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer shadow-[0_0_10px_#bc13fe]"
              >
                <Globe className="w-4 h-4" />
                <span>IKKI TILLI</span>
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-magenta-950">
              <button
                onClick={() => {
                  handleStatusChange(currentFlashcard.id, 'review');
                  setIsFlipped(false);
                  if (flashcardIndex < flashcardList.length - 1) {
                    setFlashcardIndex(flashcardIndex + 1);
                  } else {
                    setIsFlashcardOpen(false);
                  }
                }}
                className="py-2.5 bg-amber-950/40 border border-amber-500 text-amber-300 font-mono text-xs hover:bg-amber-500 hover:text-black transition-colors cursor-pointer"
              >
                ✕ QIYNALDIM (TAKRORLASH)
              </button>

              <button
                onClick={() => {
                  handleStatusChange(currentFlashcard.id, 'learned');
                  setIsFlipped(false);
                  if (flashcardIndex < flashcardList.length - 1) {
                    setFlashcardIndex(flashcardIndex + 1);
                  } else {
                    setIsFlashcardOpen(false);
                  }
                }}
                className="py-2.5 bg-emerald-950/40 border border-emerald-500 text-emerald-300 font-mono font-bold text-xs hover:bg-emerald-500 hover:text-black transition-colors cursor-pointer"
              >
                ✓ BILAMAN (O'RGANILGAN)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

