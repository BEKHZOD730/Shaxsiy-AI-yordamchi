import { StrictnessLevel, TaskCategory } from '../types';

export interface MotivationalPreset {
  category: TaskCategory;
  strictness: StrictnessLevel;
  speechText: (taskTitle: string) => string;
}

export const CATEGORY_LABELS: Record<TaskCategory, { label: string; icon: string; color: string; neonClass: string }> = {
  oilaviy_vaqt: {
    label: "Oilaviy Vaqt & Yaqinlar",
    icon: "Heart",
    color: "#ec4899",
    neonClass: "neon-glow-rose text-pink-400 border-pink-500/40",
  },
  dostlar_uchrashuv: {
    label: "Do'stlar & Ijtimoiy",
    icon: "Users",
    color: "#8b5cf6",
    neonClass: "neon-glow-purple text-purple-400 border-purple-500/40",
  },
  biznes_uchrashuv: {
    label: "Biznes & Hamkorlik",
    icon: "Briefcase",
    color: "#f59e0b",
    neonClass: "neon-glow-amber text-amber-400 border-amber-500/40",
  },
  til_organish: {
    label: "Til O'rganish",
    icon: "Languages",
    color: "#06b6d4",
    neonClass: "neon-glow-cyan text-cyan-400 border-cyan-500/40",
  },
  dasturlash_ish: {
    label: "Dasturlash & Ish",
    icon: "Code2",
    color: "#3b82f6",
    neonClass: "neon-glow-cyan text-blue-400 border-blue-500/40",
  },
  sport_salomatlik: {
    label: "Sport & Salomatlik",
    icon: "Flame",
    color: "#10b981",
    neonClass: "neon-glow-green text-emerald-400 border-emerald-500/40",
  },
  kitob_mutolaa: {
    label: "Kitob & Mutolaa",
    icon: "BookOpen",
    color: "#a855f7",
    neonClass: "neon-glow-purple text-purple-400 border-purple-500/40",
  },
  ilm_fan: {
    label: "Ilm-fan & Tadqiqot",
    icon: "Atom",
    color: "#eab308",
    neonClass: "neon-glow-rose text-yellow-400 border-yellow-500/40",
  },
  maxsus_missiya: {
    label: "Maxsus Missiya",
    icon: "Target",
    color: "#f43f5e",
    neonClass: "neon-glow-rose text-rose-400 border-rose-500/40",
  },
  shaxsiy_tartib: {
    label: "Shaxsiy Tartib",
    icon: "Clock",
    color: "#06b6d4",
    neonClass: "neon-glow-cyan text-cyan-300 border-cyan-500/40",
  },
};

export const STRICTNESS_LABELS: Record<StrictnessLevel, { label: string; desc: string; badge: string }> = {
  brutal_alien: {
    label: "Qat'iy Galaktik Qo'mondon",
    desc: "Umr cheklanganligi, insonlar ishonchi va qat'iy intizom haqidagi eng kuchli eslatmalar",
    badge: "bg-rose-500/20 text-rose-300 border-rose-500/50",
  },
  spartan_mentor: {
    label: "Spartan / Chempion Intizomi",
    desc: "Og'ir mehnat, g'alaba va to'xtamaslik ruhiyati",
    badge: "bg-amber-500/20 text-amber-300 border-amber-500/50",
  },
  quantum_focus: {
    label: "Kvant Fokus & Chuqur Diqqat",
    desc: "Maksimal konsentratsiya, chalg'imaslik va kiber-samaradorlik",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50",
  },
  calm_commander: {
    label: "Xotirjam Kosmik Strateg",
    desc: "Mantiqiy, do'stona va barqaror maqsad sari yo'naltirish",
    badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
  },
};

export function generateDefaultSpeechText(taskTitle: string, category: TaskCategory, strictness: StrictnessLevel): string {
  if (category === 'oilaviy_vaqt') {
    return `Eslatma: ${taskTitle}! Oila va yaqinlar — hayotingizdagi eng qimmatli xazina. Ish va tashvishlarni bir chetga surib, bor diqqat-e'tiboringiz va mehr-muhabbatingizni yaqinlaringizga bag'ishlang!`;
  }
  if (category === 'dostlar_uchrashuv') {
    return `Do'stona eslatma: ${taskTitle}! Do'stlar bilan suhbat va uchrashuv vaqti bo'ldi. Samimiy aloqalarni mustahkamlang, yaxshi xotiralar qoldiring va vaqtni maroqli o'tkazing!`;
  }
  if (category === 'biznes_uchrashuv') {
    return `Strategik ogohlantirish: ${taskTitle}! Biznes uchrashuv va muhim muzokaralar vaqti keldi. Barcha hujjatlar, fikrlar va strategiyangizni tayyorlang. Professionalizm va qat'iyat bilan g'alaba qozoning!`;
  }

  if (strictness === 'brutal_alien') {
    if (category === 'til_organish') {
      return `Diqqat! Belgilangan vaqt yetib keldi: Siz ${taskTitle} vazifasini bajarishingiz kerak! Nima qilmoqchi eding, nima qilyapsan, vaqtni bekorga sarflama! Sizga ishongan insonlar kutib tura olishmaydi, umr cheklangan! Hoziroq o'rganishni boshlang!`;
    }
    if (category === 'sport_salomatlik') {
      return `Kosmik ogohlantirish! ${taskTitle} vaqti keldi! Nima qilmoqchi eding, nima qilyapsan, vaqtni bekorga sarflama! Kuchli tana bo'lmasa, buyuk maqsadlarga yetib bo'lmaydi! Dangasalikni unuting, darhol mashg'ulotga kiring!`;
    }
    if (category === 'dasturlash_ish') {
      return `Diqqat! Kiber-tizim ishga tushdi: ${taskTitle}! Nima qilmoqchi eding, nima qilyapsan, vaqtni bekorga sarflama! Har bir daqiqa sizni chempionga yoki yutqazuvchiga aylantiradi. Chalg'ishni to'xtating va kodga sho'ng'ing!`;
    }
    return `Tizim ogohlantirishi: Belgilangan vaqt yetib keldi! Siz ${taskTitle} missiyasini bajarishingiz shart! Nima qilmoqchi eding, nima qilyapsan, vaqtni bekorga sarflama! O'z kelajagingizga xiyonat qilmang, vaqt shafqatsiz o'tmoqda, hoziroq boshlang!`;
  }

  if (strictness === 'spartan_mentor') {
    return `Jangchi! ${taskTitle} vaqti boshlandi. Nima qilmoqchi eding, nima qilyapsan, vaqtni bekorga sarflama! Og'riq va charchoq vaqtinchalik, ammo g'alaba abadiy qoladi. To'xtamang, 100 foiz kuchingizni bering!`;
  }

  if (strictness === 'quantum_focus') {
    return `Kvant fokus protokoli faollashtirildi: ${taskTitle}. Nima qilmoqchi eding, nima qilyapsan, vaqtni bekorga sarflama! Barcha ikkilamchi oqimlarni o'chiring, ongni yagona nuqtaga jamlang va natijaga erishing!`;
  }

  return `Vaqt yetib keldi: ${taskTitle}. Nima qilmoqchi eding, nima qilyapsan, vaqtni bekorga sarflama! Rejangizga sodiq qoling, qadam-baqadam yuksaklik sari harakatlaning. Omad sizga!`;
}

export const COSMIC_RANKS = [
  { minRate: 0, title: "Kvant Yangi Chaqiriluvchi", icon: "Sparkles", color: "text-slate-400" },
  { minRate: 25, title: "Orbital Qidiruvchi", icon: "Compass", color: "text-blue-400" },
  { minRate: 50, title: "Kosmik Yetakchi", icon: "Shield", color: "text-emerald-400" },
  { minRate: 75, title: "Galaktik Strateg", icon: "Zap", color: "text-cyan-300" },
  { minRate: 90, title: "Titan Kiber Qahramon", icon: "Crown", color: "text-amber-300" },
];
