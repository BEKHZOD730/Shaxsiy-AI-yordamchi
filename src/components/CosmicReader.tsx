import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Rewind, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Layers, 
  Sliders, 
  Zap, 
  Rocket, 
  CheckCircle2, 
  Trash2, 
  FileText, 
  Compass, 
  Bot, 
  Plus, 
  Eye, 
  Activity,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { CosmicBook, ReadingMode, RocketSkin, VoiceSettings, VocabWord } from '../types';
import { INITIAL_COSMIC_BOOKS } from '../data/cosmicLibrary';
import { CosmicRocketSprite } from './CosmicRocketSprite';
import { 
  extractPdfContent, 
  extractTextFileContent, 
  parseWordsWithMetadata, 
  ParsedWord 
} from '../utils/pdfExtractor';
import { 
  playHudClick, 
  playRocketIgnition, 
  playCadenceTick, 
  playWarpSpeedBurst, 
  playPageFlip, 
  playSuccessChime,
  speakUzbekMotivation
} from '../utils/audioSynth';

interface CosmicReaderProps {
  voiceSettings: VoiceSettings;
  onAddVocabWord?: (word: VocabWord) => void;
  theme?: 'dark' | 'light';
}

export const CosmicReader: React.FC<CosmicReaderProps> = ({
  voiceSettings,
  onAddVocabWord,
  theme = 'dark',
}) => {
  // Books Library loaded from localStorage with fallback to default cosmic books
  const [books, setBooks] = useState<CosmicBook[]>(() => {
    try {
      const saved = localStorage.getItem('xeno_chrono_books');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load books from storage:', e);
    }
    return INITIAL_COSMIC_BOOKS;
  });

  const [activeBookId, setActiveBookId] = useState<string>(() => {
    return books[0]?.id || 'cosmic_book_1';
  });

  // Current active book object
  const activeBook = useMemo(() => {
    return books.find((b) => b.id === activeBookId) || books[0] || INITIAL_COSMIC_BOOKS[0];
  }, [books, activeBookId]);

  // Reader State
  const [currentPage, setCurrentPage] = useState<number>(activeBook?.currentPage || 0);
  const [currentWordIdx, setCurrentWordIdx] = useState<number>(activeBook?.currentWordIndex || 0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedWpm, setSpeedWpm] = useState<number>(activeBook?.speedWpm || 240);
  const [readingMode, setReadingMode] = useState<ReadingMode>('guided_flow');
  const [rocketSkin, setRocketSkin] = useState<RocketSkin>('plasma_falcon');
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [playTickSfx, setPlayTickSfx] = useState<boolean>(true);
  const [ttsSyncEnabled, setTtsSyncEnabled] = useState<boolean>(false);

  // Uploading state
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // AI Assistant & Word Explainer State
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [selectedWordInfo, setSelectedWordInfo] = useState<{ word: string; meaning?: string; context?: string } | null>(null);
  const [isWordSavedNotification, setIsWordSavedNotification] = useState<boolean>(false);

  // DOM Refs
  const readerContainerRef = useRef<HTMLDivElement>(null);
  const wordsContainerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ttsCancelRef = useRef<(() => void) | null>(null);

  // Rocket Coordinates for Guided Flow Mode
  const [rocketCoords, setRocketCoords] = useState<{ x: number; y: number; width: number; visible: boolean }>({
    x: 0,
    y: 0,
    width: 40,
    visible: false,
  });

  // Save books to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('xeno_chrono_books', JSON.stringify(books));
    } catch (e) {
      console.warn('Failed to save books to storage:', e);
    }
  }, [books]);

  // Sync current page & word when active book changes
  useEffect(() => {
    if (activeBook) {
      setCurrentPage(Math.min(activeBook.currentPage || 0, Math.max(0, activeBook.pages.length - 1)));
      setCurrentWordIdx(activeBook.currentWordIndex || 0);
      setSpeedWpm(activeBook.speedWpm || 240);
      setIsPlaying(false);
    }
  }, [activeBookId]);

  // Parse current page words
  const pageText = useMemo(() => {
    if (!activeBook || !activeBook.pages || activeBook.pages.length === 0) return '';
    const safePage = Math.min(currentPage, activeBook.pages.length - 1);
    return activeBook.pages[safePage] || '';
  }, [activeBook, currentPage]);

  const parsedWords: ParsedWord[] = useMemo(() => {
    return parseWordsWithMetadata(pageText);
  }, [pageText]);

  // Keep active book updated with progress
  const updateBookProgress = (newPage: number, newWordIdx: number) => {
    setBooks((prev) =>
      prev.map((b) =>
        b.id === activeBookId
          ? {
              ...b,
              currentPage: newPage,
              currentWordIndex: newWordIdx,
              speedWpm,
              lastReadAt: new Date().toISOString(),
            }
          : b
      )
    );
  };

  // Speed-Reading Interval Engine
  useEffect(() => {
    if (!isPlaying || parsedWords.length === 0) return;

    // Calculate delay per word in milliseconds from WPM (Words Per Minute)
    // 60,000 ms / WPM
    const intervalMs = Math.max(50, Math.round(60000 / speedWpm));

    const timer = setInterval(() => {
      setCurrentWordIdx((prev) => {
        if (prev < parsedWords.length - 1) {
          const next = prev + 1;
          if (playTickSfx && next % 3 === 0) {
            playCadenceTick();
          }
          return next;
        } else {
          // Reached end of page: auto-advance to next page if available
          if (currentPage < activeBook.totalPages - 1) {
            playPageFlip();
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            updateBookProgress(nextPage, 0);
            return 0;
          } else {
            // Finished entire book!
            setIsPlaying(false);
            playSuccessChime();
            return prev;
          }
        }
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, speedWpm, parsedWords.length, currentPage, activeBook?.totalPages, playTickSfx]);

  // Update rocket position tracking the active word DOM bounding box
  useEffect(() => {
    if (readingMode !== 'guided_flow') {
      setRocketCoords((prev) => ({ ...prev, visible: false }));
      return;
    }

    if (activeWordRef.current && wordsContainerRef.current) {
      const containerRect = wordsContainerRef.current.getBoundingClientRect();
      const wordRect = activeWordRef.current.getBoundingClientRect();

      const relX = wordRect.left - containerRect.left + wordRect.width / 2;
      const relY = wordRect.top - containerRect.top - 18; // Hover slightly above the word

      setRocketCoords({
        x: relX,
        y: relY,
        width: wordRect.width,
        visible: true,
      });

      // Smooth vertical-only auto-scroll without shaking horizontal lines
      if (isPlaying && readerContainerRef.current) {
        const container = readerContainerRef.current;
        const wordEl = activeWordRef.current;
        const containerRectEl = container.getBoundingClientRect();
        const wordRectEl = wordEl.getBoundingClientRect();

        // Check if word is nearing top or bottom edge of reader container
        const isNearBottom = wordRectEl.bottom > containerRectEl.bottom - 60;
        const isNearTop = wordRectEl.top < containerRectEl.top + 40;

        if (isNearBottom || isNearTop) {
          const offsetTop = wordEl.offsetTop - container.offsetTop;
          container.scrollTo({
            top: Math.max(0, offsetTop - 80),
            behavior: 'smooth',
          });
        }
      }
    }
  }, [currentWordIdx, readingMode, isPlaying, parsedWords, fontSize]);


  // Handle Play / Pause Toggle
  const handleTogglePlay = () => {
    if (!isPlaying) {
      playRocketIgnition();
      setIsPlaying(true);
    } else {
      playHudClick();
      setIsPlaying(false);
    }
  };

  // Keyboard shortcut listener: Space to Play/Pause, Left/Right arrows to step
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleStepForward(10);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleStepBackward(5);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying]);

  // Navigation handlers
  const handleStepForward = (count: number = 5) => {
    playHudClick();
    setCurrentWordIdx((prev) => {
      const next = Math.min(parsedWords.length - 1, prev + count);
      updateBookProgress(currentPage, next);
      return next;
    });
  };

  const handleStepBackward = (count: number = 5) => {
    playHudClick();
    setCurrentWordIdx((prev) => {
      const next = Math.max(0, prev - count);
      updateBookProgress(currentPage, next);
      return next;
    });
  };

  const handleNextPage = () => {
    if (currentPage < activeBook.totalPages - 1) {
      playPageFlip();
      const next = currentPage + 1;
      setCurrentPage(next);
      setCurrentWordIdx(0);
      updateBookProgress(next, 0);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      playPageFlip();
      const prev = currentPage - 1;
      setCurrentPage(prev);
      setCurrentWordIdx(0);
      updateBookProgress(prev, 0);
    }
  };

  const handleWordClick = (index: number) => {
    playHudClick();
    setCurrentWordIdx(index);
    updateBookProgress(currentPage, index);
  };

  // Handle PDF / Text File Upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress({ current: 0, total: 100 });

    try {
      let extractedData;
      if (file.name.toLowerCase().endsWith('.pdf')) {
        extractedData = await extractPdfContent(file, (curr, total) => {
          setUploadProgress({ current: curr, total });
        });
      } else {
        extractedData = await extractTextFileContent(file);
      }

      if (!extractedData.pages || extractedData.pages.length === 0) {
        throw new Error("Fayldan matn ajratib olinmadi. Iltimos, boshqa PDF yoki TXT fayl tanlang.");
      }

      const newBook: CosmicBook = {
        id: `book_${Date.now()}`,
        title: extractedData.title,
        author: "Yuklangan Kosmik Hujjat",
        category: "Shaxsiy PDF / Mutolaa",
        totalPages: extractedData.totalPages,
        totalWords: extractedData.totalWords,
        pages: extractedData.pages,
        currentPage: 0,
        currentWordIndex: 0,
        speedWpm: 250,
        bookmarks: [],
        uploadedAt: new Date().toISOString(),
        fileSize: extractedData.fileSize,
        coverGradient: "from-cyan-950 via-blue-950 to-slate-950",
      };

      setBooks((prev) => [newBook, ...prev]);
      setActiveBookId(newBook.id);
      setCurrentPage(0);
      setCurrentWordIdx(0);
      playSuccessChime();
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Faylni yuklashda xatolik yuz berdi");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Delete Book
  const handleDeleteBook = (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (books.length <= 1) {
      alert("Kamida bitta kitob qolishi kerak.");
      return;
    }
    playHudClick();
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    if (activeBookId === bookId) {
      const remaining = books.filter((b) => b.id !== bookId);
      setActiveBookId(remaining[0]?.id || '');
    }
  };

  // AI Page Summarizer
  const handleAiSummarizePage = async () => {
    setIsGeneratingSummary(true);
    setAiSummary(null);
    playHudClick();

    try {
      const res = await fetch('/api/motivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskTitle: `Kitob mutolaasi tahlili: ${activeBook.title} (${currentPage + 1}-sahifa)`,
          category: 'kitob_mutolaa',
          strictness: 'quantum_focus',
        }),
      });

      const data = await res.json();
      setAiSummary(
        data.speechText ||
          `Ushbu ${currentPage + 1}-sahifadagi asosiy kiber-g'oya: Ma'lumotlarni qat'iy diqqat bilan o'zlashtiring, har bir so'z yangi kognitiv neyron ko'prik hosil qiladi!`
      );
    } catch (err) {
      setAiSummary("AI serveriga ulanishda xatolik. Diqqatni jamlab mutolaani davom ettiring!");
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Save Word to Vocabulary Module
  const handleSaveToVocab = (wordStr: string) => {
    if (!onAddVocabWord) return;
    const clean = wordStr.replace(/^[^\w\u0400-\u04FF\u00C0-\u024F]+|[^\w\u0400-\u04FF\u00C0-\u024F]+$/g, '');
    if (!clean) return;

    const newVocab: VocabWord = {
      id: `vocab_${Date.now()}`,
      word: clean,
      uzbekMeaning: `"${activeBook.title}" kitobidan o'rganilgan yangi atama`,
      exampleSentence: pageText.slice(0, 120) + '...',
      status: 'new_learning',
      category: 'Kitob Mutolaasi',
      createdAt: new Date().toISOString(),
    };

    onAddVocabWord(newVocab);
    playSuccessChime();
    setIsWordSavedNotification(true);
    setTimeout(() => setIsWordSavedNotification(false), 2500);
  };

  // Current active word
  const activeWordObj = parsedWords[currentWordIdx] || { word: '', cleanWord: '', orpIndex: 0 };
  const progressPercent = activeBook.totalWords > 0 
    ? Math.min(100, Math.round(((currentPage * 350 + currentWordIdx) / activeBook.totalWords) * 100))
    : 0;

  // Font size classes
  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'sm': return 'text-sm sm:text-base leading-relaxed';
      case 'lg': return 'text-lg sm:text-xl leading-loose';
      case 'xl': return 'text-xl sm:text-2xl leading-loose';
      case 'base':
      default: return 'text-base sm:text-lg leading-loose';
    }
  };

  return (
    <div className={`space-y-6 select-none ${isFullscreen ? 'fixed inset-0 z-50 bg-[#020512] p-6 overflow-y-auto' : ''}`}>
      
      {/* Top Cockpit Header & Telemetry HUD */}
      <div className="staria-cockpit-panel p-5 sm:p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Title & Status */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(0,242,255,0.4)]">
              <Rocket className="w-6 h-6 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg sm:text-xl font-bold font-mono tracking-wider uppercase text-white flex items-center gap-2">
                  KOSMIK PDF TEZ O'QISH & RAKETA TRACKER
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,242,255,0.3)]">
                  RSVP WARP v3.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Yonuvchi raketa harakati, giper-tezlik va kiber-diqqat bilan kitoblar mutolaasi
              </p>
            </div>
          </div>

          {/* Right Action Controls (Upload, Fullscreen, Mode) */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.txt,.md"
              className="hidden"
            />

            {/* Upload PDF Button */}
            <button
              id="upload-pdf-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(0,242,255,0.35)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{isUploading ? "DEKOMPILYATSIYA..." : "PDF / KITOB YUKLASH"}</span>
            </button>

            {/* AI Summary Button */}
            <button
              onClick={handleAiSummarizePage}
              disabled={isGeneratingSummary}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-950/70 border border-purple-500/60 hover:border-purple-400 text-purple-300 font-mono text-xs rounded-xl transition-all cursor-pointer"
              title="AI Sahifa Tahlili"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">AI Tahlil</span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => {
                playHudClick();
                setIsFullscreen(!isFullscreen);
              }}
              className="p-2 bg-slate-900/80 border border-slate-700 hover:border-cyan-400 text-slate-300 rounded-xl transition-colors cursor-pointer"
              title={isFullscreen ? "Kichraytirish" : "To'liq ekran"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Upload progress banner */}
        {isUploading && uploadProgress && (
          <div className="mt-4 p-3 bg-cyan-950/80 border border-cyan-400 rounded-xl font-mono text-xs text-cyan-300 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              <span>PDF sahifalari skanerlanmoqda: {uploadProgress.current} / {uploadProgress.total} sahifa...</span>
            </div>
            <span>{Math.round((uploadProgress.current / Math.max(1, uploadProgress.total)) * 100)}%</span>
          </div>
        )}

        {/* Upload Error banner */}
        {uploadError && (
          <div className="mt-4 p-3 bg-rose-950/80 border border-rose-500 rounded-xl font-mono text-xs text-rose-300">
            {uploadError}
          </div>
        )}

        {/* Saved Word notification */}
        {isWordSavedNotification && (
          <div className="mt-3 p-2.5 bg-emerald-950/90 border border-emerald-400 rounded-xl font-mono text-xs text-emerald-300 flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>So'z Leksika Bazangizga muvaffaqiyatli saqlandi!</span>
          </div>
        )}
      </div>

      {/* Book Selection Carousel / Shelf */}
      <div className="staria-cockpit-panel p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono tracking-wider text-cyan-400 uppercase font-bold flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5" /> KOSMIK KUTUBXONA ({books.length} ta Kitob)
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Tanlangan: <strong className="text-slate-200">{activeBook.title}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {books.map((book) => {
            const isCurrent = book.id === activeBookId;
            return (
              <div
                key={book.id}
                onClick={() => {
                  playHudClick();
                  setActiveBookId(book.id);
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isCurrent
                    ? 'bg-cyan-950/80 border-cyan-400 shadow-[0_0_20px_rgba(0,242,255,0.25)]'
                    : 'bg-[#060c20] border-slate-800 hover:border-cyan-800/60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-mono text-xs font-bold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                      {book.author || "Muallif noma'lum"}
                    </p>
                  </div>
                  {books.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteBook(book.id, e)}
                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      title="Kitobni o'chirish"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400/80 mt-3 pt-2 border-t border-slate-800/80">
                  <span>{book.totalPages} Sahifa</span>
                  <span>{book.totalWords} so'z</span>
                  <span className="text-amber-400 font-bold">{book.speedWpm || 240} WPM</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Speed Reader Display */}
      <div className="staria-cockpit-panel p-6 rounded-2xl relative">
        
        {/* Top Reading Controls HUD (Mode switcher, Rocket Skin, WPM presets) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-5 border-b border-cyan-900/40">
          
          {/* Mode Switcher Tabs */}
          <div className="flex items-center space-x-1.5 p-1 bg-black/50 border border-cyan-950 rounded-xl">
            <button
              onClick={() => {
                playHudClick();
                setReadingMode('guided_flow');
              }}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                readingMode === 'guided_flow'
                  ? 'bg-cyan-600 text-white font-bold shadow-[0_0_10px_#00f2ff]'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              🚀 Raketa Tracker (Sahifa)
            </button>
            <button
              onClick={() => {
                playHudClick();
                setReadingMode('rsvp_cockpit');
              }}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer ${
                readingMode === 'rsvp_cockpit'
                  ? 'bg-cyan-600 text-white font-bold shadow-[0_0_10px_#00f2ff]'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              ⚡ RSVP Kvant Cockpit (Yagona So'z)
            </button>
          </div>

          {/* Rocket Skin Selector */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400 hidden sm:inline">Raketa Terisi:</span>
            <select
              value={rocketSkin}
              onChange={(e) => {
                playHudClick();
                setRocketSkin(e.target.value as RocketSkin);
              }}
              className="bg-[#050b1a] border border-cyan-800/80 rounded-lg px-2.5 py-1 text-cyan-300 text-xs font-mono focus:border-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="plasma_falcon">Plazma Lochin (Moviy)</option>
              <option value="solar_phoenix">Quyosh Feniksi (Oltin)</option>
              <option value="dark_matter">Qora Modda (Binafsha)</option>
              <option value="emerald_staria">Zumrad Staria (Yashil)</option>
            </select>
          </div>

          {/* Font Size Selector */}
          <div className="flex items-center gap-1 bg-black/50 border border-cyan-950 p-1 rounded-xl text-xs font-mono">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-1 rounded ${fontSize === 'sm' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400'}`}
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-1 rounded ${fontSize === 'base' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400'}`}
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-1 rounded ${fontSize === 'lg' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400'}`}
            >
              A+
            </button>
            <button
              onClick={() => setFontSize('xl')}
              className={`px-2 py-1 rounded ${fontSize === 'xl' ? 'bg-cyan-950 text-cyan-300 font-bold' : 'text-slate-400'}`}
            >
              A++
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MODE A: GUIDED FLOW MODE WITH MOVING GLOWING ROCKET TRACKER  */}
        {/* ------------------------------------------------------------- */}
        {readingMode === 'guided_flow' && (
          <div 
            ref={readerContainerRef}
            className="relative min-h-[320px] max-h-[520px] overflow-y-auto p-6 bg-[#030717]/90 rounded-2xl border border-cyan-900/60 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]"
          >
            {/* The Animated Glowing Rocket flying over words with dynamic transition speed */}
            {rocketCoords.visible && (
              <div
                className="absolute z-20 pointer-events-none"
                style={{
                  transform: `translate3d(${rocketCoords.x - 16}px, ${rocketCoords.y - 12}px, 0)`,
                  transition: `transform ${Math.max(120, Math.min(650, Math.round(32000 / speedWpm)))}ms cubic-bezier(0.2, 0.9, 0.4, 1.1)`,
                }}
              >
                <CosmicRocketSprite
                  skin={rocketSkin}
                  isBoosting={isPlaying}
                  velocityWpm={speedWpm}
                  showLaserBeam={true}
                />
              </div>
            )}

            {/* Formatted Text with Word Spans - Rock Solid Static Geometry (No Shaking/Jitter) */}
            <div 
              ref={wordsContainerRef}
              className={`relative font-sans tracking-wide leading-relaxed select-text ${getFontSizeClass()}`}
            >
              {parsedWords.map((wordObj, idx) => {
                const isActive = idx === currentWordIdx;
                const isPast = idx < currentWordIdx;

                return (
                  <span
                    key={wordObj.id}
                    ref={isActive ? activeWordRef : null}
                    onClick={() => handleWordClick(idx)}
                    onDoubleClick={() => handleSaveToVocab(wordObj.word)}
                    className={`inline-block px-1.5 py-0.5 mx-0.5 rounded-md font-normal border transition-colors duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500/30 border-cyan-400 text-cyan-100 shadow-[0_0_15px_rgba(0,242,255,0.4)]'
                        : isPast
                        ? 'border-transparent text-slate-400 hover:text-cyan-200 hover:border-cyan-800/40'
                        : 'border-transparent text-slate-100 hover:text-cyan-300 hover:border-cyan-800/40'
                    }`}
                    title="Bosing: Raketani o'tkazish | Ikki marta bosing: Lug'atga qo'shish"
                  >
                    {wordObj.word}
                  </span>
                );
              })}
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* MODE B: RSVP COCKPIT WARP (SINGLE WORD HIGH VELOCITY STREAM) */}
        {/* ------------------------------------------------------------- */}
        {readingMode === 'rsvp_cockpit' && (
          <div className="relative min-h-[320px] flex flex-col items-center justify-center p-8 bg-[#020512] rounded-2xl border border-cyan-500/40 overflow-hidden shadow-[inset_0_0_50px_rgba(0,242,255,0.1)]">
            
            {/* Hyperspace Radial Speed Lines */}
            <div className="absolute inset-0 tech-grid-bg opacity-30 pointer-events-none" />
            <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

            {/* Cockpit Targeting Crosshair HUD */}
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent pointer-events-none" />
            <div className="absolute inset-y-8 left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent pointer-events-none" />

            {/* Target Reticle Frame */}
            <div className="relative z-10 px-12 py-8 bg-[#040920]/80 border-2 border-cyan-400/80 rounded-3xl backdrop-blur-xl shadow-[0_0_40px_rgba(0,242,255,0.3)] text-center min-w-[320px] max-w-xl">
              
              {/* Single Word with Optimal Recognition Point (ORP) Highlight */}
              <div className="font-mono text-3xl sm:text-5xl font-extrabold tracking-wider text-slate-100 flex items-center justify-center">
                {activeWordObj.word.split('').map((char, charIdx) => {
                  const isORP = charIdx === activeWordObj.orpIndex;
                  return (
                    <span
                      key={charIdx}
                      className={
                        isORP
                          ? 'text-amber-400 font-black scale-110 shadow-[0_0_15px_#fbbf24] underline decoration-cyan-400 decoration-2 underline-offset-8'
                          : 'text-slate-100'
                      }
                    >
                      {char}
                    </span>
                  );
                })}
              </div>

              {/* Orbiting / Boosting Rocket Sprite */}
              <div className="mt-6 flex items-center justify-center">
                <CosmicRocketSprite
                  skin={rocketSkin}
                  isBoosting={isPlaying}
                  velocityWpm={speedWpm}
                  showLaserBeam={false}
                />
              </div>

              {/* Subtitle / Context Peek */}
              <div className="mt-3 text-xs font-mono text-cyan-400/70 truncate">
                So'z: #{currentWordIdx + 1} / {parsedWords.length}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* BOTTOM SPEED READING CONTROL CONSOLE                          */}
        {/* ------------------------------------------------------------- */}
        <div className="mt-6 space-y-4 pt-4 border-t border-cyan-950">
          
          {/* Main Playback & Navigation Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Page Step Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="flex items-center gap-1 px-3 py-2 bg-cyan-950/60 border border-cyan-800 hover:border-cyan-400 text-cyan-300 font-mono text-xs rounded-xl disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Oldingi Sahifa</span>
              </button>

              <span className="px-3 py-1.5 bg-[#060c20] border border-cyan-900/80 rounded-xl font-mono text-xs text-cyan-300 font-bold">
                {currentPage + 1} / {activeBook.totalPages} Sahifa
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage >= activeBook.totalPages - 1}
                className="flex items-center gap-1 px-3 py-2 bg-cyan-950/60 border border-cyan-800 hover:border-cyan-400 text-cyan-300 font-mono text-xs rounded-xl disabled:opacity-30 cursor-pointer"
              >
                <span className="hidden sm:inline">Keyingi Sahifa</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Central Primary Ignition / Playback Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleStepBackward(5)}
                className="p-2.5 bg-[#060c20] border border-cyan-800 hover:border-cyan-400 text-cyan-300 rounded-xl transition-all cursor-pointer"
                title="5 so'z orqaga (←)"
              >
                <Rewind className="w-4 h-4" />
              </button>

              {/* Main Glowing Launch / Pause Button */}
              <button
                id="toggle-reading-btn"
                onClick={handleTogglePlay}
                className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl font-mono text-sm font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                  isPlaying
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_25px_rgba(244,63,94,0.6)] animate-pulse'
                    : 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-[0_0_25px_rgba(0,242,255,0.6)]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    <span>TO'XTATISH</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    <span>RAKETANI UCHIRISH (START)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleStepForward(10)}
                className="p-2.5 bg-[#060c20] border border-cyan-800 hover:border-cyan-400 text-cyan-300 rounded-xl transition-all cursor-pointer"
                title="10 so'z oldinga (→)"
              >
                <FastForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  playHudClick();
                  setCurrentWordIdx(0);
                }}
                className="p-2.5 bg-[#060c20] border border-slate-800 hover:border-cyan-400 text-slate-400 rounded-xl transition-all cursor-pointer"
                title="Sahifa boshidan boshlash"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Sound & SFX Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playHudClick();
                  setPlayTickSfx(!playTickSfx);
                }}
                className={`p-2 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                  playTickSfx
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,242,255,0.2)]'
                    : 'bg-[#060c20] border-slate-800 text-slate-500'
                }`}
                title="Kadans Ovoz Pulsi (Tick SFX)"
              >
                {playTickSfx ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Velocity WPM Slider & Preset Warp Buttons (Ultra-Slow to Hyper-Speed) */}
          <div className="p-4 bg-[#04081c]/90 border border-cyan-900/60 rounded-2xl space-y-3.5">
            
            {/* Slider with Live Speed Display & Steppers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 flex-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 flex items-center gap-1.5 font-bold">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    O'QISH TEZLIGI (WPM):
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      ({(60 / Math.max(1, speedWpm)).toFixed(2)} soniya / so'z)
                    </span>
                    <span className="font-bold text-sm text-cyan-300 font-mono px-2 py-0.5 bg-cyan-950/80 border border-cyan-500/50 rounded">
                      {speedWpm} SO'Z / DAQ
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="20"
                    max="800"
                    step="5"
                    value={speedWpm}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSpeedWpm(val);
                    }}
                    className="flex-1 h-2.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />

                  {/* Fine-tune stepper buttons */}
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <button
                      onClick={() => setSpeedWpm((w) => Math.max(20, w - 10))}
                      className="px-2 py-1 bg-[#060c20] border border-cyan-900 hover:border-cyan-400 text-cyan-300 rounded cursor-pointer"
                      title="10 WPM sekinlashtirish"
                    >
                      -10
                    </button>
                    <button
                      onClick={() => setSpeedWpm((w) => Math.min(800, w + 10))}
                      className="px-2 py-1 bg-[#060c20] border border-cyan-900 hover:border-cyan-400 text-cyan-300 rounded cursor-pointer"
                      title="10 WPM tezlashtirish"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Presets: Ultra-Slow to Hyper-Speed */}
            <div className="flex items-center justify-between flex-wrap gap-1.5 pt-2 border-t border-slate-900">
              <span className="text-[10px] font-mono text-slate-500 uppercase">Tezlik rejimlari:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { label: '🐢 30 O\'ta Sekin', wpm: 30, hint: 'Har 2 soniyada 1 so\'z' },
                  { label: '🐢 60 Sekin', wpm: 60, hint: 'Har 1 soniyada 1 so\'z' },
                  { label: '🌱 100 Qulay', wpm: 100, hint: 'Boshlovchilar uchun' },
                  { label: '📖 180 Oddiy', wpm: 180, hint: 'Standart kitob o\'qish' },
                  { label: '⚡ 260 O\'rtacha', wpm: 260, hint: 'Tezlashtirilgan' },
                  { label: '🚀 400 Giper', wpm: 400, hint: 'Tez o\'qish mutaxassisi' },
                  { label: '🌌 600 Kvant', wpm: 600, hint: 'Giper fazoviy skaner' },
                ].map((preset) => (
                  <button
                    key={preset.wpm}
                    onClick={() => {
                      playWarpSpeedBurst();
                      setSpeedWpm(preset.wpm);
                    }}
                    title={preset.hint}
                    className={`px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all cursor-pointer ${
                      speedWpm === preset.wpm
                        ? 'bg-cyan-500 text-black font-bold border-cyan-300 shadow-[0_0_12px_#00f2ff]'
                        : 'bg-[#060c20] border-slate-800 text-slate-300 hover:border-cyan-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>


          {/* Book Progress Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Mutolaa jarayoni</span>
              <span className="text-cyan-400 font-bold">{progressPercent}% yakunlandi</span>
            </div>
            <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-cyan-950">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-[0_0_10px_#00f2ff] transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Cosmic Insight & Summary Panel */}
      {aiSummary && (
        <div className="staria-cockpit-panel p-5 rounded-2xl border border-purple-500/40 bg-purple-950/20 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI KOSMIK SAHIFA TAHLILI
            </span>
            <button
              onClick={() => setAiSummary(null)}
              className="text-slate-400 hover:text-slate-200 text-xs font-mono"
            >
              Yopish
            </button>
          </div>
          <p className="text-sm font-sans text-slate-200 leading-relaxed">
            {aiSummary}
          </p>
        </div>
      )}

      {/* Usage Tips & Hotkey Quick Reference */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
        <div className="p-4 bg-[#050b1a] border border-cyan-900/50 rounded-xl">
          <div className="text-cyan-400 font-bold flex items-center gap-1.5 mb-1">
            <Info className="w-3.5 h-3.5" /> TEZKOR TUGMALAR
          </div>
          <p className="text-slate-400">
            <strong className="text-slate-200">Spacebar:</strong> Raketani uchirish/to'xtatish | <strong className="text-slate-200">← / → :</strong> So'zlarni o'tkazish
          </p>
        </div>

        <div className="p-4 bg-[#050b1a] border border-cyan-900/50 rounded-xl">
          <div className="text-cyan-400 font-bold flex items-center gap-1.5 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> TELEPORTATSIYA
          </div>
          <p className="text-slate-400">
            Istalgan so'z ustiga bosing — raketa bir zumda o'sha koordinataga uchib boradi!
          </p>
        </div>

        <div className="p-4 bg-[#050b1a] border border-cyan-900/50 rounded-xl">
          <div className="text-cyan-400 font-bold flex items-center gap-1.5 mb-1">
            <Plus className="w-3.5 h-3.5 text-emerald-400" /> LUG'ATGA QO'SHISH
          </div>
          <p className="text-slate-400">
            Istalgan so'z ustiga 2 marta bosing — avtomatik tarzda Leksika bazangizga saqlanadi.
          </p>
        </div>
      </div>
    </div>
  );
};
