/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AlienHeader, AppTab } from './components/AlienHeader';
import { TaskPlanner } from './components/TaskPlanner';
import { CosmicReader } from './components/CosmicReader';
import { VocabModule } from './components/VocabModule';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { AiAdvisor } from './components/AiAdvisor';
import { AiSmartMatrix } from './components/AiSmartMatrix';
import { VoiceTester } from './components/VoiceTester';
import { AddTaskModal } from './components/AddTaskModal';
import { VoiceAlertModal } from './components/VoiceAlertModal';
import { Task, VoiceSettings, ActiveAlarm, VocabWord, WordStatus, ThemeMode, CustomMotivationalQuote } from './types';
import { INITIAL_TASKS, INITIAL_VOICE_SETTINGS } from './data/defaultTasks';
import { INITIAL_VOCAB_WORDS } from './data/defaultVocab';
import { INITIAL_MOTIVATIONAL_QUOTES } from './data/initialQuotes';
import { generateDefaultSpeechText } from './utils/motivationalQuotes';
import { playHudClick, playSuccessChime } from './utils/audioSynth';

export default function App() {
  // Theme Mode: 'dark' (Obsidian Staria) or 'light' (Titanium Silver Horizon)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const savedTheme = localStorage.getItem('xeno_chrono_theme') as ThemeMode;
      if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    } catch (e) {
      console.warn("Theme load error:", e);
    }
    return 'dark';
  });

  // Toggle theme mode
  const handleToggleTheme = () => {
    setTheme(prev => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('xeno_chrono_theme', nextTheme);
      } catch (e) {
        console.warn("Theme save error:", e);
      }
      return nextTheme;
    });
  };

  // Sync theme class to document body / root
  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('theme-light');
      document.body.classList.add('theme-light');
    } else {
      document.documentElement.classList.remove('theme-light');
      document.body.classList.remove('theme-light');
    }
  }, [theme]);

  // Load tasks & voice settings from localStorage with fallback to default presets
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('xeno_chrono_tasks');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Storage load error:", e);
    }
    return INITIAL_TASKS;
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(() => {
    try {
      const saved = localStorage.getItem('xeno_chrono_voice_settings');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Storage load error:", e);
    }
    return INITIAL_VOICE_SETTINGS;
  });

  // Load Vocabulary Words
  const [vocabWords, setVocabWords] = useState<VocabWord[]>(() => {
    try {
      const saved = localStorage.getItem('xeno_chrono_vocab_words');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Storage load error:", e);
    }
    return INITIAL_VOCAB_WORDS;
  });

  // Load Customizable Motivational Quotes
  const [motivationalQuotes, setMotivationalQuotes] = useState<CustomMotivationalQuote[]>(() => {
    try {
      const saved = localStorage.getItem('xeno_custom_motivational_quotes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Motivational quotes load error:", e);
    }
    return INITIAL_MOTIVATIONAL_QUOTES;
  });

  const [activeTab, setActiveTab] = useState<AppTab>('planner');
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeAlarm, setActiveAlarm] = useState<ActiveAlarm | null>(null);
  
  // Track triggered alarm timestamps to prevent duplicate alerts in same minute
  const triggeredAlarmsRef = useRef<Set<string>>(new Set());

  // Save tasks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('xeno_chrono_tasks', JSON.stringify(tasks));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }, [tasks]);

  // Save voice settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('xeno_chrono_voice_settings', JSON.stringify(voiceSettings));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }, [voiceSettings]);

  // Save vocab words to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('xeno_chrono_vocab_words', JSON.stringify(vocabWords));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }, [vocabWords]);

  // Save custom motivational quotes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('xeno_custom_motivational_quotes', JSON.stringify(motivationalQuotes));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
  }, [motivationalQuotes]);

  // Motivational Quote Handlers
  const handleSaveMotivationalQuote = (quote: CustomMotivationalQuote) => {
    setMotivationalQuotes((prev) => {
      const exists = prev.some((q) => q.id === quote.id);
      if (exists) {
        return prev.map((q) => (q.id === quote.id ? quote : q));
      }
      return [quote, ...prev];
    });
  };

  const handleDeleteMotivationalQuote = (id: string) => {
    setMotivationalQuotes((prev) => prev.filter((q) => q.id !== id));
  };

  const handleResetMotivationalQuotes = () => {
    setMotivationalQuotes(INITIAL_MOTIVATIONAL_QUOTES);
    try {
      localStorage.setItem('xeno_custom_motivational_quotes', JSON.stringify(INITIAL_MOTIVATIONAL_QUOTES));
    } catch (e) {
      console.warn("Reset error:", e);
    }
  };

  // Calculate dynamic Energy Core Level based on task completion and vocabulary mastery
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const learnedVocabCount = vocabWords.filter((w) => w.status === 'learned').length;
  const vocabBonus = Math.min(20, learnedVocabCount * 3);
  const energyCoreLevel = Math.min(100, Math.max(10, 20 + Math.round(taskCompletionRate * 0.6) + vocabBonus));

  // Live Task Sentinel Timer: checks current time every 5 seconds
  useEffect(() => {
    const checkAlarms = () => {
      if (!voiceSettings.enabled) return;

      const now = new Date();
      const currentHH = String(now.getHours()).padStart(2, '0');
      const currentMM = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHH}:${currentMM}`;
      const todayDateStr = now.toISOString().split('T')[0];

      tasks.forEach((task) => {
        if (!task.reminderEnabled || task.status === 'completed') return;

        // Check if task matches current time slot
        if (task.startTime === currentTimeStr) {
          const alarmKey = `${task.id}_${todayDateStr}_${currentTimeStr}`;
          
          if (!triggeredAlarmsRef.current.has(alarmKey)) {
            triggeredAlarmsRef.current.add(alarmKey);

            // Find matching custom user quote for this category/strictness, or fallback
            const matchingCustom = motivationalQuotes.find(
              (q) => q.category === task.category && q.strictness === task.strictness
            ) || motivationalQuotes.find((q) => q.category === task.category);

            const speech = task.customVoicePrompt || (matchingCustom ? matchingCustom.text : generateDefaultSpeechText(task.title, task.category, task.strictness));
            
            setActiveAlarm({
              task,
              triggeredAt: new Date().toISOString(),
              speechText: speech,
              isPlayingAudio: true,
            });
          }
        }
      });
    };

    const interval = setInterval(checkAlarms, 5000);
    return () => clearInterval(interval);
  }, [tasks, voiceSettings, motivationalQuotes]);


  // Task Handlers
  const handleSaveTask = (savedTask: Task) => {
    setTasks((prev) => {
      const exists = prev.some((t) => t.id === savedTask.id);
      if (exists) {
        return prev.map((t) => (t.id === savedTask.id ? savedTask : t));
      }
      return [...prev, savedTask];
    });
    setEditingTask(null);
  };

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const newStatus = t.status === 'completed' ? 'pending' : 'completed';
          return {
            ...t,
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId && t.subtasks) {
          const updatedSubtasks = t.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          );
          const allCompleted = updatedSubtasks.every((st) => st.completed);
          return {
            ...t,
            subtasks: updatedSubtasks,
            status: allCompleted && updatedSubtasks.length > 0 ? 'completed' : t.status,
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleTriggerAlarmNow = (task: Task) => {
    const speech = task.customVoicePrompt || generateDefaultSpeechText(task.title, task.category, task.strictness);
    setActiveAlarm({
      task,
      triggeredAt: new Date().toISOString(),
      speechText: speech,
      isPlayingAudio: true,
    });
  };

  const handleImportPlanTasks = (newTasks: Task[]) => {
    setTasks((prev) => [...prev, ...newTasks]);
    setActiveTab('planner');
  };

  const handleSnoozeAlarm = (minutes: number) => {
    if (!activeAlarm) return;
    const currentTask = activeAlarm.task;
    const [h, m] = currentTask.startTime.split(':').map(Number);
    const newTotal = h * 60 + m + minutes;
    const newH = Math.floor((newTotal % 1440) / 60);
    const newM = newTotal % 60;
    const newTime = `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;

    setTasks((prev) =>
      prev.map((t) => (t.id === currentTask.id ? { ...t, startTime: newTime } : t))
    );
    setActiveAlarm(null);
  };

  const handleStartTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'in_progress' } : t))
    );
    setActiveAlarm(null);
  };

  const handleCompleteAlarmTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'completed', completedAt: new Date().toISOString() } : t))
    );
    setActiveAlarm(null);
  };

  // Vocab Handlers
  const handleAddVocabWord = (newWord: VocabWord) => {
    setVocabWords((prev) => [newWord, ...prev]);
  };

  const handleUpdateVocabStatus = (wordId: string, status: WordStatus) => {
    setVocabWords((prev) =>
      prev.map((w) =>
        w.id === wordId
          ? { ...w, status, lastReviewedAt: new Date().toISOString() }
          : w
      )
    );
  };

  const handleDeleteVocabWord = (wordId: string) => {
    setVocabWords((prev) => prev.filter((w) => w.id !== wordId));
  };

  const handleBatchAddVocabWords = (newWords: VocabWord[]) => {
    setVocabWords((prev) => [...newWords, ...prev]);
  };

  return (
    <div className={`min-h-screen immersive-space-bg immersive-dot-grid relative overflow-x-hidden transition-colors duration-500 ${
      theme === 'light' ? 'theme-light text-slate-800' : 'text-slate-100'
    }`}>
      
      {/* Background glowing ambient cosmic halos */}
      <div className={`fixed top-0 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none -z-10 transition-opacity duration-500 ${
        theme === 'light' ? 'bg-sky-400/20' : 'bg-cyan-600/10'
      }`} />
      <div className={`fixed bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none -z-10 transition-opacity duration-500 ${
        theme === 'light' ? 'bg-purple-400/15' : 'bg-purple-600/10'
      }`} />
      <div className={`fixed top-1/2 right-10 w-80 h-80 rounded-full blur-3xl pointer-events-none -z-10 transition-opacity duration-500 ${
        theme === 'light' ? 'bg-amber-400/10' : 'bg-rose-600/5'
      }`} />

      {/* Main Alien Header */}
      <AlienHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        voiceSettings={voiceSettings}
        setVoiceSettings={setVoiceSettings}
        energyCoreLevel={energyCoreLevel}
        activeAlarmsCount={tasks.filter((t) => t.status !== 'completed' && t.reminderEnabled).length}
        vocabCount={vocabWords.length}
        quotesCount={motivationalQuotes.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'planner' && (
          <TaskPlanner
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onToggleSubtask={handleToggleSubtask}
            onOpenAddTask={() => {
              setEditingTask(null);
              setIsAddTaskModalOpen(true);
            }}
            onEditTask={(task) => {
              setEditingTask(task);
              setIsAddTaskModalOpen(true);
            }}
            onDeleteTask={handleDeleteTask}
            onTriggerAlarmNow={handleTriggerAlarmNow}
            onOpenAIPlan={() => setActiveTab('ai')}
            onOpenVocab={() => setActiveTab('vocab')}
            voiceSettings={voiceSettings}
            motivationalQuotes={motivationalQuotes}
            onOpenQuotesStudio={() => setActiveTab('voice_settings')}
          />
        )}

        {activeTab === 'reader' && (
          <CosmicReader
            voiceSettings={voiceSettings}
            onAddVocabWord={handleAddVocabWord}
            theme={theme}
          />
        )}

        {activeTab === 'matrix' && (
          <AiSmartMatrix
            onAddVocabWord={handleAddVocabWord}
            onAddTask={(newTask) => {
              setTasks(prev => [newTask, ...prev]);
            }}
            voiceSettings={voiceSettings}
          />
        )}

        {activeTab === 'vocab' && (
          <VocabModule
            words={vocabWords}
            onAddWord={handleAddVocabWord}
            onUpdateWordStatus={handleUpdateVocabStatus}
            onDeleteWord={handleDeleteVocabWord}
            onBatchAddWords={handleBatchAddVocabWords}
            voiceSettings={voiceSettings}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPanel
            tasks={tasks}
            energyCoreLevel={energyCoreLevel}
          />
        )}

        {activeTab === 'ai' && (
          <AiAdvisor
            onImportPlanTasks={handleImportPlanTasks}
            voiceSettings={voiceSettings}
            currentTasks={tasks}
          />
        )}

        {activeTab === 'voice_settings' && (
          <VoiceTester
            voiceSettings={voiceSettings}
            setVoiceSettings={setVoiceSettings}
            onSimulateAlarm={handleTriggerAlarmNow}
            motivationalQuotes={motivationalQuotes}
            onSaveQuote={handleSaveMotivationalQuote}
            onDeleteQuote={handleDeleteMotivationalQuote}
            onResetQuotes={handleResetMotivationalQuotes}
          />
        )}
      </main>

      {/* Add / Edit Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => {
          setIsAddTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSaveTask={handleSaveTask}
        initialTask={editingTask}
        motivationalQuotes={motivationalQuotes}
        onSaveCustomQuote={handleSaveMotivationalQuote}
      />

      {/* Active Voice Holographic Alarm HUD Modal */}
      <VoiceAlertModal
        activeAlarm={activeAlarm}
        voiceSettings={voiceSettings}
        onDismiss={() => setActiveAlarm(null)}
        onSnooze={handleSnoozeAlarm}
        onStartTask={handleStartTask}
        onCompleteTask={handleCompleteAlarmTask}
      />
    </div>
  );
}
