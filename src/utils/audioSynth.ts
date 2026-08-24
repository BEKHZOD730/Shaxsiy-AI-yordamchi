import { VoiceSettings } from '../types';

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Normalizes Uzbek text so Web Speech API voices read it fluently,
 * smoothly, and without unnatural stuttering on apostrophes, quotes, or numbers.
 */
export function normalizeUzbekTextForSpeech(rawText: string): string {
  if (!rawText) return '';

  let text = rawText
    // Remove markdown formatting like bold, italic, code, bullets
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[(.*?)\]/g, '$1')
    .replace(/#{1,6}\s?/g, '')
    // Remove robotic slashes, brackets and decorative ASCII
    .replace(/\/\//g, '')
    .replace(/[\{\}\(\)<>]/g, ' ')
    // Normalize Uzbek special letters and apostrophes (o', g', sh, ch)
    // Replacing typographic apostrophes with normal vowel combinations so TTS does not pause abruptly
    .replace(/o['‘’ʻ`]/gi, 'o')
    .replace(/g['‘’ʻ`]/gi, 'g')
    .replace(/['‘’ʻ`]/g, '')
    // Numbers to Uzbek words for natural flow
    .replace(/\b50\s*ta\b/gi, 'ellikta')
    .replace(/\b50\b/g, 'ellik')
    .replace(/\b30\s*ta\b/gi, 'o‘ttizta')
    .replace(/\b30\b/g, 'o‘ttiz')
    .replace(/\b25\b/g, 'yigirma besh')
    .replace(/\b20\b/g, 'yigirma')
    .replace(/\b15\b/g, 'o‘n besh')
    .replace(/\b10\b/g, 'o‘n')
    .replace(/\b5\s*daqiqa\b/gi, 'besh daqiqa')
    .replace(/\b5\b/g, 'besh')
    .replace(/\b1\b/g, 'bir')
    .replace(/\b2\b/g, 'ikki')
    .replace(/\b3\b/g, 'uch')
    .replace(/\b4\b/g, 'to‘rt')
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    .trim();

  return text;
}

/**
 * Soft, elegant crystal notification chime (plays before voice reminders)
 */
export function playSoftNotificationChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + idx * 0.05);

      gain.gain.setValueAtTime(0.001, now + idx * 0.05);
      gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.55);
    });
  } catch (e) {
    console.warn("Chime synthesis error:", e);
  }
}

/**
 * Futuristic sci-fi alarm siren
 */
export function playAlarmPulse() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(520, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    osc1.frequency.exponentialRampToValueAtTime(520, now + 0.35);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.4);
  } catch (e) {
    console.warn("Audio synthesis error:", e);
  }
}

/**
 * Triumphant Alien Crystal Chime (for task completion / milestone)
 */
export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    freqs.forEach((f, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, now + index * 0.07);

      gain.gain.setValueAtTime(0.01, now + index * 0.07);
      gain.gain.linearRampToValueAtTime(0.15, now + index * 0.07 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.07);
      osc.stop(now + index * 0.07 + 0.85);
    });
  } catch (e) {
    console.warn("Audio synthesis error:", e);
  }
}

/**
 * Mastery Level Up sound (for vocabulary mastered / moved to learned)
 */
export function playLevelUpChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const freqs = [440, 554.37, 659.25, 880, 1108.73];
    freqs.forEach((f, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + index * 0.05);

      gain.gain.setValueAtTime(0.01, now + index * 0.05);
      gain.gain.linearRampToValueAtTime(0.18, now + index * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + index * 0.05);
      osc.stop(now + index * 0.05 + 0.55);
    });
  } catch (e) {
    console.warn("Audio synthesis error:", e);
  }
}

/**
 * Sci-Fi HUD Interface Click / Tap
 */
export function playHudClick() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  } catch (e) {
    // ignore
  }
}

/**
 * Quantum Core Power Up
 */
export function playPowerCharge() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.5);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.55);
  } catch (e) {
    // ignore
  }
}

/**
 * Find best matching voice for Uzbek speech:
 * 1. Native Uzbek voice (uz / uz-UZ)
 * 2. Turkish voice (tr / tr-TR) — has almost 95% identical phonetic vowel & consonant structure to Uzbek, making it sound very natural and clean!
 * 3. Russian or clean high-clarity voice
 */
function getBestUzbekVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // 1. Direct Uzbek match
  const uzVoice = voices.find(v => v.lang.toLowerCase().startsWith('uz'));
  if (uzVoice) return uzVoice;

  // 2. Turkish match (closely matches Uzbek pronunciation)
  const trVoice = voices.find(v => v.lang.toLowerCase().startsWith('tr'));
  if (trVoice) return trVoice;

  // 3. High quality natural multilingual voice
  const naturalVoice = voices.find(v => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Neural'));
  if (naturalVoice) return naturalVoice;

  // 4. Russian
  const ruVoice = voices.find(v => v.lang.toLowerCase().startsWith('ru'));
  if (ruVoice) return ruVoice;

  return voices[0] || null;
}

/**
 * Find best native English voice for vocabulary pronunciation
 */
function getBestEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  const enNatural = voices.find(v => 
    v.lang.toLowerCase().startsWith('en') && 
    (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Alex'))
  );
  if (enNatural) return enNatural;

  const enGeneral = voices.find(v => v.lang.toLowerCase().startsWith('en'));
  if (enGeneral) return enGeneral;

  return voices[0] || null;
}

/**
 * Speak English Word or Sentence clearly using native English voice
 */
export function speakEnglishWord(
  text: string, 
  rate: number = 0.9,
  onEnd?: () => void
): () => void {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return () => {};
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const enVoice = getBestEnglishVoice(voices);

  if (enVoice) {
    utterance.voice = enVoice;
    utterance.lang = enVoice.lang || 'en-US';
  } else {
    utterance.lang = 'en-US';
  }

  utterance.rate = rate;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  utterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
}

/**
 * Speak Bilingual Word + Meaning (English word first, then Uzbek translation)
 */
export function speakBilingualWord(
  word: string,
  meaning: string,
  onEnd?: () => void
) {
  if (!('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  window.speechSynthesis.cancel();
  const voices = window.speechSynthesis.getVoices();
  const enVoice = getBestEnglishVoice(voices);
  const uzVoice = getBestUzbekVoice(voices);

  // Step 1: English word
  const enUtterance = new SpeechSynthesisUtterance(word);
  if (enVoice) {
    enUtterance.voice = enVoice;
    enUtterance.lang = enVoice.lang || 'en-US';
  }
  enUtterance.rate = 0.85;

  enUtterance.onend = () => {
    // Step 2: Clear Uzbek meaning
    setTimeout(() => {
      const cleanUzbek = normalizeUzbekTextForSpeech(`So'z ma'nosi: ${meaning}`);
      const uzUtterance = new SpeechSynthesisUtterance(cleanUzbek);
      
      if (uzVoice) {
        uzUtterance.voice = uzVoice;
        uzUtterance.lang = uzVoice.lang || 'tr-TR';
      }
      uzUtterance.rate = 0.95;
      uzUtterance.pitch = 1.0;

      uzUtterance.onend = () => {
        if (onEnd) onEnd();
      };
      uzUtterance.onerror = () => {
        if (onEnd) onEnd();
      };
      window.speechSynthesis.speak(uzUtterance);
    }, 300);
  };

  enUtterance.onerror = () => {
    if (onEnd) onEnd();
  };

  window.speechSynthesis.speak(enUtterance);
}

/**
 * High-clarity Uzbek motivational & mission speaker
 */
export function speakUzbekMotivation(
  text: string,
  settings: VoiceSettings,
  onEnd?: () => void
): () => void {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported in this browser.');
    if (onEnd) onEnd();
    return () => {};
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  if (settings.playSfx) {
    playSoftNotificationChime();
  }

  const cleanText = normalizeUzbekTextForSpeech(text);

  // Small delay to allow chime SFX to play first smoothly
  const timer = setTimeout(() => {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Select best available voice
    const voices = window.speechSynthesis.getVoices();
    const bestVoice = getBestUzbekVoice(voices);

    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang || 'tr-TR';
    }

    utterance.rate = settings.rate || 0.95;
    utterance.pitch = settings.pitch || 1.0;
    utterance.volume = settings.volume || 1.0;

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }, settings.playSfx ? 450 : 50);

  return () => {
    clearTimeout(timer);
    window.speechSynthesis.cancel();
  };
}

/**
 * Cosmic Rocket Plasma Thruster Ignition Sound
 */
export function playRocketIgnition() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.3);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.6);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.3);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.6);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.65);
  } catch (e) {
    // ignore
  }
}

/**
 * Cadence Word Tick: Subtle, highly pleasant futuristic rhythmic pulse
 */
export function playCadenceTick() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, now);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.018);

    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.022);
  } catch (e) {
    // ignore
  }
}

/**
 * Warp Speed Boost Burst Sound
 */
export function playWarpSpeedBurst() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.25);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.32);
  } catch (e) {
    // ignore
  }
}

/**
 * Cosmic Page Flip / Sector Jump Sound
 */
export function playPageFlip() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.09);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  } catch (e) {
    // ignore
  }
}

