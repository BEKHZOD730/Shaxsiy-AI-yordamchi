import React, { useEffect, useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  CheckCircle2, 
  Clock, 
  Play, 
  FastForward, 
  ShieldAlert
} from 'lucide-react';
import { ActiveAlarm, VoiceSettings } from '../types';
import { speakUzbekMotivation, playHudClick, playSuccessChime } from '../utils/audioSynth';
import { CATEGORY_LABELS, STRICTNESS_LABELS } from '../utils/motivationalQuotes';

interface VoiceAlertModalProps {
  activeAlarm: ActiveAlarm | null;
  voiceSettings: VoiceSettings;
  onDismiss: () => void;
  onSnooze: (minutes: number) => void;
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
}

export const VoiceAlertModal: React.FC<VoiceAlertModalProps> = ({
  activeAlarm,
  voiceSettings,
  onDismiss,
  onSnooze,
  onStartTask,
  onCompleteTask,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);

  useEffect(() => {
    if (!activeAlarm) return;

    // Trigger audio speech & SFX on alarm pop up if sound is enabled
    if (voiceSettings.enabled) {
      setIsPlaying(true);
      const cancelSpeech = speakUzbekMotivation(
        activeAlarm.speechText,
        voiceSettings,
        () => setIsPlaying(false)
      );

      return () => {
        cancelSpeech();
      };
    }
  }, [activeAlarm, voiceSettings]);

  useEffect(() => {
    if (!activeAlarm) return;
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeAlarm]);

  if (!activeAlarm) return null;

  const { task, speechText } = activeAlarm;
  const categoryInfo = CATEGORY_LABELS[task.category] || CATEGORY_LABELS.shaxsiy_tartib;
  const strictnessInfo = STRICTNESS_LABELS[task.strictness] || STRICTNESS_LABELS.brutal_alien;

  const handleReplayVoice = () => {
    playHudClick();
    setIsPlaying(true);
    speakUzbekMotivation(speechText, voiceSettings, () => setIsPlaying(false));
  };

  const handleStopVoice = () => {
    playHudClick();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      {/* Outer pulsing glow rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[500px] h-[500px] rounded-full border border-cyan-400/20 animate-pulse" />
        <div className="w-[700px] h-[700px] rounded-full border border-magenta-500/15" />
      </div>

      <div 
        id="voice-alert-hud-modal"
        className="relative w-full max-w-2xl bg-[#040612] border border-cyan-500/80 rounded-none p-6 sm:p-8 shadow-[inset_0_0_30px_rgba(0,242,255,0.06),0_0_50px_rgba(0,242,255,0.3)] overflow-hidden"
      >
        {/* Top HUD scanline & decorative status */}
        <div className="flex items-center justify-between border-b border-cyan-900/60 pb-3 mb-5">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 rounded-full bg-magenta-500 animate-ping" />
            <span className="font-mono text-xs font-bold text-magenta-400 uppercase tracking-widest">
              [ ALERT: PROTOCOL_ACTIVE // KOSMIK SENTINEL ]
            </span>
          </div>

          <div className="text-right">
            <div className="font-mono text-cyan-300 text-sm font-bold">
              MUHLAT: {task.startTime} ({task.durationMinutes}m)
            </div>
          </div>
        </div>

        {/* Central Focus Quote Section */}
        <div className="space-y-4 mb-6">
          <div className="inline-block px-3 py-0.5 border border-magenta-500 text-magenta-400 text-[10px] font-mono tracking-widest uppercase">
            DIQQAT: QAT'IY ESLATMA
          </div>

          <h3 className="text-xl sm:text-2xl font-mono font-light leading-tight tracking-tight text-white">
            "{speechText}"
          </h3>

          <p className="text-xs font-mono text-slate-400">
            // VAZIFA: {task.title}
          </p>

          {/* Immersive Audio Waveform Visualizer */}
          <div className="flex items-center justify-center gap-1.5 py-4 border-y border-cyan-950">
            <div className="w-1.5 h-6 bg-cyan-400" />
            <div className="w-1.5 h-10 bg-cyan-400 shadow-[0_0_10px_#00f2ff]" />
            <div className="w-1.5 h-4 bg-cyan-400" />
            <div className="w-1.5 h-14 bg-magenta-500 shadow-[0_0_15px_#bc13fe] animate-pulse" />
            <div className="w-1.5 h-8 bg-cyan-400" />
            <div className="w-1.5 h-3 bg-cyan-400" />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono opacity-50 uppercase tracking-widest">
            <span>Ovozli modul faollashtirilgan // Qat'iy intizom</span>
            {isPlaying ? (
              <button 
                onClick={handleStopVoice}
                className="text-magenta-400 hover:underline cursor-pointer"
              >
                [ OVOZNI TO'XTATISH ]
              </button>
            ) : (
              <button 
                onClick={handleReplayVoice}
                className="text-cyan-400 hover:underline cursor-pointer"
              >
                [ QAYTA TINGLASH ]
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            id="alarm-start-btn"
            onClick={() => {
              playSuccessChime();
              onStartTask(task.id);
            }}
            className="flex items-center justify-center space-x-2 py-3 px-4 bg-cyan-400 text-black font-mono font-bold text-xs uppercase tracking-widest shadow-[0_0_15px_#00f2ff] hover:bg-cyan-300 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>KIRISHISH</span>
          </button>

          <button
            id="alarm-snooze-btn"
            onClick={() => {
              playHudClick();
              onSnooze(5);
            }}
            className="flex items-center justify-center space-x-2 py-3 px-4 border border-cyan-900/60 bg-[#080b1a] text-cyan-300 font-mono text-xs uppercase tracking-wider hover:bg-cyan-950 transition-all cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>5 DAQIQA SURISH</span>
          </button>

          <button
            id="alarm-complete-btn"
            onClick={() => {
              playSuccessChime();
              onCompleteTask(task.id);
            }}
            className="flex items-center justify-center space-x-2 py-3 px-4 border border-magenta-500/60 bg-magenta-500/10 text-magenta-300 font-mono text-xs uppercase tracking-wider hover:bg-magenta-500 hover:text-black transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>BAJARILDI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
