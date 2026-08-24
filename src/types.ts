export type TaskCategory = 
  | 'oilaviy_vaqt'
  | 'dostlar_uchrashuv'
  | 'biznes_uchrashuv'
  | 'til_organish'
  | 'dasturlash_ish'
  | 'sport_salomatlik'
  | 'kitob_mutolaa'
  | 'ilm_fan'
  | 'maxsus_missiya'
  | 'shaxsiy_tartib';

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'missed';

export type StrictnessLevel = 'brutal_alien' | 'spartan_mentor' | 'quantum_focus' | 'calm_commander';

export type ThemeMode = 'dark' | 'light';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  startTime: string; // "HH:MM" 24h format
  durationMinutes: number;
  daysOfWeek: number[]; // 0=Sunday, 1=Monday ... 6=Saturday, empty or [0..6] means every day
  priority: TaskPriority;
  status: TaskStatus;
  completedAt?: string;
  notes?: string;
  customVoicePrompt?: string;
  strictness: StrictnessLevel;
  reminderEnabled: boolean;
  subtasks: SubTask[];
  createdAt: string;
}

export interface VoiceSettings {
  enabled: boolean;
  volume: number; // 0.1 to 1.0
  rate: number; // 0.7 to 1.3
  pitch: number; // 0.5 to 1.5
  strictStyle: StrictnessLevel;
  playSfx: boolean;
  preferredVoiceLang: string;
  autoSpeakOnAlarm: boolean;
}

export interface DailyAnalytics {
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalMinutesPlanned: number;
  totalMinutesCompleted: number;
  energyCoreLevel: number; // 0 - 100
  streakDays: number;
  categoryDistribution: Record<TaskCategory, number>;
  rankTitle: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'chat' | 'plan' | 'motivation' | 'system';
}

export interface ActiveAlarm {
  task: Task;
  triggeredAt: string;
  speechText: string;
  isPlayingAudio: boolean;
}

// Vocabulary / Lexicon Architecture
export type WordStatus = 'new_learning' | 'learned' | 'review';

export interface VocabWord {
  id: string;
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  uzbekMeaning: string;
  definition?: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  synonyms?: string[];
  mnemonic?: string;
  status: WordStatus;
  difficulty?: 'easy' | 'medium' | 'hard';
  category?: string;
  audioPlayedCount?: number;
  lastReviewedAt?: string;
  createdAt: string;
  notes?: string;
}

// AI Smart Recommendations for Vocabulary, Phrases & Code Snippets
export interface CodeSnippetRecommendation {
  id: string;
  title: string;
  language: string;
  code: string;
  explanation: string;
  bestPracticeTip?: string;
}

export interface PhraseRecommendation {
  id: string;
  phrase: string;
  uzbekMeaning: string;
  context: string;
  exampleSentence: string;
  exampleTranslation?: string;
}

export interface TopicRecommendationBundle {
  topic: string;
  category: string;
  summary: string;
  suggestedWords: Array<{
    word: string;
    phonetic?: string;
    partOfSpeech?: string;
    uzbekMeaning: string;
    definition: string;
    exampleSentence: string;
    exampleTranslation: string;
    mnemonic?: string;
    difficulty?: 'easy' | 'medium' | 'hard';
  }>;
  suggestedPhrases: PhraseRecommendation[];
  suggestedCodeSnippets: CodeSnippetRecommendation[];
  miniChallenge: {
    title: string;
    description: string;
    estimatedMinutes: number;
  };
}

// Cosmic PDF Book & Speed Reading Engine Types
export type ReadingMode = 'guided_flow' | 'rsvp_cockpit' | 'laser_beam';
export type RocketSkin = 'plasma_falcon' | 'solar_phoenix' | 'dark_matter' | 'emerald_staria';

export interface CosmicBook {
  id: string;
  title: string;
  author?: string;
  category: string;
  totalPages: number;
  totalWords: number;
  pages: string[]; // Text array indexed by page (0-based)
  currentPage: number;
  currentWordIndex: number;
  uploadedAt: string;
  fileSize?: string;
  coverGradient?: string;
  speedWpm: number;
  bookmarks: number[];
  lastReadAt?: string;
  isPreloaded?: boolean;
}

export interface ReadingTelemetry {
  totalWordsRead: number;
  minutesSpent: number;
  averageWpm: number;
  warpJumps: number;
  focusScore: number;
}

// User-Editable Motivational Quotes & Voice Prompts
export interface CustomMotivationalQuote {
  id: string;
  title: string;
  text: string;
  category: TaskCategory;
  strictness: StrictnessLevel;
  author?: string;
  isFavorite?: boolean;
  timesPlayed?: number;
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
}
