import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  Sliders, 
  Radio, 
  Zap, 
  BellRing,
  MessageSquareQuote,
  Sparkles,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { VoiceSettings, Task, CustomMotivationalQuote } from '../types';
import { speakUzbekMotivation, playAlarmPulse, playSuccessChime, playPowerCharge, playHudClick } from '../utils/audioSynth';
import { MotivationalQuotesStudio } from './MotivationalQuotesStudio';

interface VoiceTesterProps {
  voiceSettings: VoiceSettings;
  setVoiceSettings: React.Dispatch<React.SetStateAction<VoiceSettings>>;
  onSimulateAlarm: (sampleTask: Task) => void;
  motivationalQuotes: CustomMotivationalQuote[];
  onSaveQuote: (quote: CustomMotivationalQuote) => void;
  onDeleteQuote: (id: string) => void;
  onResetQuotes: () => void;
}

export const VoiceTester: React.FC<VoiceTesterProps> = ({
  voiceSettings,
  setVoiceSettings,
  onSimulateAlarm,
  motivationalQuotes,
  onSaveQuote,
  onDeleteQuote,
  onResetQuotes,
}) => {
  const [subTab, setSubTab] = useState<'quotes' | 'audio_config'>('quotes');
  const [testText, setTestText] = useState<string>(() => {
    if (motivationalQuotes && motivationalQuotes.length > 0) {
      return motivationalQuotes[0].text;
    }
    return "Diqqat! Belgilangan vaqt yetib keldi: Siz ingliz tilidan 50 ta so'z yodlashingiz kerak! Nima qilmoqchi eding, nima qilyapsan, vaqtni bekorga sarflama! Sizga ishongan insonlar kutib tura olishmaydi, umr cheklangan! Hoziroq o'rganishni boshlang!";
  });

  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleTestSpeech = () => {
    playHudClick();
    setIsSpeaking(true);
    speakUzbekMotivation(testText, voiceSettings, () => setIsSpeaking(false));
  };

  const handleStopSpeech = () => {
    playHudClick();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const sampleTasks: Task[] = [
    {
      id: 'test-task-1',
      title: "Ingliz tili: 50 ta yangi so'z yodlash",
      category: 'til_organish',
      startTime: '08:30',
      durationMinutes: 60,
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      priority: 'CRITICAL',
      status: 'pending',
      strictness: 'brutal_alien',
      reminderEnabled: true,
      customVoicePrompt: testText,
      subtasks: [],
      createdAt: new Date().toISOString(),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-[#00f2ff]">
      
      {/* Top Banner with Subtabs and Emergency Alarm Test */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-cyan-900/50 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-cyan-500 uppercase">
            <span>[ MOTIVATION MATRIX & VOICE SENTINEL ]</span>
            <span className="text-emerald-400">ACTIVE</span>
          </div>
          <h2 className="font-mono text-lg sm:text-xl font-bold uppercase text-white tracking-wider flex items-center gap-2">
            MOTIVATSION GAPLAR & OVOZLI SENTINEL
          </h2>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Sub-tab Switcher */}
          <div className="flex p-1 bg-[#05091c] border border-cyan-900/80 rounded-xl">
            <button
              onClick={() => {
                playHudClick();
                setSubTab('quotes');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                subTab === 'quotes'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,242,255,0.4)]'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <MessageSquareQuote className="w-3.5 h-3.5" />
              <span>MOTIVATSION GAPLAR ({motivationalQuotes.length})</span>
            </button>

            <button
              onClick={() => {
                playHudClick();
                setSubTab('audio_config');
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                subTab === 'audio_config'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,242,255,0.4)]'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>OVOZ & SIGNAL SOZLAMALARI</span>
            </button>
          </div>

          <button
            id="simulate-alarm-btn"
            onClick={() => {
              playHudClick();
              onSimulateAlarm(sampleTasks[0]);
            }}
            className="flex items-center space-x-2 px-4 py-2 border border-magenta-500 bg-magenta-500/10 text-magenta-300 font-mono font-bold text-xs tracking-widest uppercase hover:bg-magenta-500 hover:text-white rounded-xl transition-all cursor-pointer shadow-[0_0_15px_rgba(188,19,254,0.3)]"
          >
            <BellRing className="w-4 h-4 animate-bounce" />
            <span>SIGNALNI SINASH</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUBTAB 1: MOTIVATIONAL QUOTES STUDIO & EDITOR                              */}
      {/* ========================================================================= */}
      {subTab === 'quotes' && (
        <MotivationalQuotesStudio
          quotes={motivationalQuotes}
          onSaveQuote={onSaveQuote}
          onDeleteQuote={onDeleteQuote}
          onResetQuotes={onResetQuotes}
          voiceSettings={voiceSettings}
          onSelectForTest={(selectedText) => {
            setTestText(selectedText);
            setSubTab('audio_config');
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* SUBTAB 2: AUDIO ENGINE CONFIGURATION & LIVE TTS TEST                       */}
      {/* ========================================================================= */}
      {subTab === 'audio_config' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          
          {/* Voice Testing Box */}
          <div className="bg-[#05091e] border border-cyan-900/70 p-6 rounded-2xl space-y-4 shadow-[inset_0_0_20px_rgba(0,242,255,0.04)]">
            <div className="flex items-center justify-between border-b border-cyan-950 pb-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                OVOZLI ESLATMA TEST LABORATORIYASI
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded">
                LIVE TTS
              </span>
            </div>

            <div>
              <label className="block text-[10px] font-mono uppercase tracking-widest text-cyan-400 mb-2">
                SINOV MATNI (O'ZBEK TILIDA O'QILADI):
              </label>
              <textarea
                rows={5}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-black/70 border border-cyan-900/80 rounded-xl text-cyan-100 font-mono text-xs focus:outline-none focus:border-cyan-400 leading-relaxed"
                placeholder="Sinov uchun matn yozing..."
              />
            </div>

            {/* Quick presets from user's custom motivational quotes */}
            <div>
              <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                SAQLANGAN MOTIVATSIYALARDAN TANLASH:
              </span>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
                {motivationalQuotes.slice(0, 6).map((q) => (
                  <button
                    key={q.id}
                    onClick={() => {
                      playHudClick();
                      setTestText(q.text);
                    }}
                    className="px-2.5 py-1 bg-cyan-950/40 border border-cyan-800/60 hover:border-cyan-400 rounded-lg text-[10px] font-mono text-cyan-300 hover:text-white transition-colors text-left truncate max-w-[200px]"
                    title={q.title}
                  >
                    [{q.title}]
                  </button>
                ))}
              </div>
            </div>

            {/* Waveform visualizer */}
            {isSpeaking && (
              <div className="flex items-center justify-center gap-1.5 py-3 border-y border-cyan-950 bg-black/40 rounded-xl">
                <div className="w-1.5 h-5 bg-cyan-400 rounded animate-pulse" />
                <div className="w-1.5 h-9 bg-cyan-400 shadow-[0_0_10px_#00f2ff] rounded" />
                <div className="w-1.5 h-4 bg-cyan-400 rounded" />
                <div className="w-1.5 h-12 bg-magenta-500 shadow-[0_0_10px_#bc13fe] animate-pulse rounded" />
                <div className="w-1.5 h-7 bg-cyan-400 rounded" />
                <div className="w-1.5 h-3 bg-cyan-400 rounded" />
              </div>
            )}

            <div className="flex items-center space-x-3 pt-2">
              <button
                id="test-voice-play-btn"
                onClick={handleTestSpeech}
                className="flex-1 py-3 px-4 border border-cyan-400 bg-cyan-400/10 text-cyan-300 font-mono font-bold text-xs tracking-widest uppercase hover:bg-cyan-400 hover:text-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,242,255,0.3)]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>OVOZLI ESLATMANI ESHITISH</span>
              </button>

              {isSpeaking && (
                <button
                  onClick={handleStopSpeech}
                  className="py-3 px-4 border border-rose-500 bg-rose-500/10 text-rose-300 font-mono text-xs hover:bg-rose-500 hover:text-white rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>TO'XTATISH</span>
                </button>
              )}
            </div>
          </div>

          {/* Audio Controls & Sliders */}
          <div className="bg-[#05091e] border border-cyan-900/70 p-6 rounded-2xl space-y-4 shadow-[inset_0_0_20px_rgba(0,242,255,0.04)]">
            <div className="flex items-center justify-between border-b border-cyan-950 pb-3">
              <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                OVOZ PARAMETRLARI
              </h3>
              <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 bg-cyan-950 border border-cyan-800 rounded">
                SPEECH CONFIG
              </span>
            </div>

            {/* Master Voice Enabled Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-cyan-950/20 border border-cyan-900/60 rounded-xl">
              <div className="flex items-center space-x-3">
                {voiceSettings.enabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                )}
                <div>
                  <div className="text-xs font-mono font-bold text-white uppercase">
                    OVOZLI ESLATMALAR TIZIMI
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Belgilangan vaqtda avtomatik ovoz chiqarish
                  </div>
                </div>
              </div>

              <input
                type="checkbox"
                checked={voiceSettings.enabled}
                onChange={(e) =>
                  setVoiceSettings((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Sci-Fi Sound Effects Toggle */}
            <div className="flex items-center justify-between p-3.5 bg-cyan-950/20 border border-cyan-900/60 rounded-xl">
              <div className="flex items-center space-x-3">
                <Zap className="w-4 h-4 text-magenta-400" />
                <div>
                  <div className="text-xs font-mono font-bold text-white uppercase">
                    FUTURISTIK KOSMIK SOUND FX
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Signallar oldidan alien sirena va energiya akkordlari
                  </div>
                </div>
              </div>

              <input
                type="checkbox"
                checked={voiceSettings.playSfx}
                onChange={(e) =>
                  setVoiceSettings((prev) => ({ ...prev, playSfx: e.target.checked }))
                }
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Rate / Speed Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-300">NUTQ TEZLIGI (RATE):</span>
                <span className="text-cyan-300 font-bold">{voiceSettings.rate}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.05"
                value={voiceSettings.rate}
                onChange={(e) =>
                  setVoiceSettings((prev) => ({ ...prev, rate: parseFloat(e.target.value) }))
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Pitch Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-300">OVOZ TONALLIGI (PITCH):</span>
                <span className="text-cyan-300 font-bold">{voiceSettings.pitch}x</span>
              </div>
              <input
                type="range"
                min="0.6"
                max="1.4"
                step="0.05"
                value={voiceSettings.pitch}
                onChange={(e) =>
                  setVoiceSettings((prev) => ({ ...prev, pitch: parseFloat(e.target.value) }))
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Test Sound FX Generators */}
            <div className="pt-2">
              <span className="block text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-2">
                FUTURISTIK OVOZ EFFEKTLARI:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => playAlarmPulse()}
                  className="px-2 py-2 bg-rose-950/30 hover:bg-rose-950 border border-rose-500/40 text-[10px] text-rose-300 font-mono rounded-xl transition-colors cursor-pointer"
                >
                  🚨 ALIEN SIRENA
                </button>
                <button
                  onClick={() => playSuccessChime()}
                  className="px-2 py-2 bg-emerald-950/30 hover:bg-emerald-950 border border-emerald-500/40 text-[10px] text-emerald-300 font-mono rounded-xl transition-colors cursor-pointer"
                >
                  💎 KRISTALL CHIME
                </button>
                <button
                  onClick={() => playPowerCharge()}
                  className="px-2 py-2 bg-cyan-950/30 hover:bg-cyan-950 border border-cyan-500/40 text-[10px] text-cyan-300 font-mono rounded-xl transition-colors cursor-pointer"
                >
                  ⚡ KVANT QUVVAT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
