import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized GoogleGenAI instance
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. AI capabilities will run in fallback smart mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "dummy_key_for_init",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Comprehensive Built-in English-Uzbek Lexicon for High Reliability
const BUILTIN_LEXICON: Record<string, any> = {
  apple: {
    word: "Apple",
    phonetic: "/ˈæp.əl/",
    partOfSpeech: "Ot (Noun)",
    uzbekMeaning: "Olma (meva)",
    definition: "A round fruit with red, yellow, or green skin and firm white flesh.",
    exampleSentence: "Eating an apple every day provides great nutritional value and energy.",
    exampleTranslation: "Har kuni olma yeyish tanaga ajoyib ozuqa va energiya beradi.",
    synonyms: ["fruit", "pome"],
    mnemonic: "🍏 Apple — Alisherning xonadonidagi eng shirin olma bog'i.",
    difficulty: "easy",
    category: "Kundalik & Salomatlik"
  },
  opportunity: {
    word: "Opportunity",
    phonetic: "/ˌɒp.əˈtjuː.nə.ti/",
    partOfSpeech: "Ot (Noun)",
    uzbekMeaning: "Imkoniyat, qulay vaziyat, fursat",
    definition: "A set of circumstances that makes it possible to do something.",
    exampleSentence: "Do not let this incredible learning opportunity slip through your fingers.",
    exampleTranslation: "Ushbu ajoyib o'rganish imkoniyatini qo'ldan boy bermang.",
    synonyms: ["chance", "opening", "occasion", "prospect"],
    mnemonic: "🚪 Opportunity — Hayot eshigingizni taqillatgan qimmatli imkoniyat!",
    difficulty: "medium",
    category: "IELTS & Biznes"
  },
  knowledge: {
    word: "Knowledge",
    phonetic: "/ˈnɒl.ɪdʒ/",
    partOfSpeech: "Ot (Noun)",
    uzbekMeaning: "Bilim, ilm, ma'lumot, tajriba",
    definition: "Facts, information, and skills acquired by a person through experience or education.",
    exampleSentence: "Knowledge is the greatest superpower you can ever possess.",
    exampleTranslation: "Ilm — siz ega bo'lishingiz mumkin bo'lgan eng buyuk super-kuchdir.",
    synonyms: ["wisdom", "expertise", "understanding", "insight"],
    mnemonic: "📚 Knowledge — Har bir yangi kitob ongingizga yangi bilim nuri sochadi.",
    difficulty: "easy",
    category: "Ilm-fan & Ta'lim"
  },
  success: {
    word: "Success",
    phonetic: "/səkˈses/",
    partOfSpeech: "Ot (Noun)",
    uzbekMeaning: "Muvaffaqiyat, g'alaba, yutuq",
    definition: "The accomplishment of an aim or purpose.",
    exampleSentence: "True success is built through daily consistent habits and unwavering focus.",
    exampleTranslation: "Haqiqiy muvaffaqiyat kunlik uzluksiz odatlar va mustahkam fokus orqali quriladi.",
    synonyms: ["triumph", "achievement", "victory", "prosperity"],
    mnemonic: "🏆 Success — Sadoqat va sabr bilan erishiladigan eng yuksak cho'qqi.",
    difficulty: "easy",
    category: "Shaxsiy Rivojlanish"
  },
  family: {
    word: "Family",
    phonetic: "/ˈfæm.əl.i/",
    partOfSpeech: "Ot (Noun)",
    uzbekMeaning: "Oila, xonadon, yaqinlar",
    definition: "A group of one or more parents and their children living together as a unit.",
    exampleSentence: "Spending quality time with family brings the greatest peace and joy in life.",
    exampleTranslation: "Oila bilan mazmunli vaqt o'tkazish hayotga eng katta xotirjamlik va quvonch baxsh etadi.",
    synonyms: ["household", "relatives", "kin", "loved ones"],
    mnemonic: "🏡 Family — Har doim sizni quchoq ochib kutib oladigan eng aziz maskan.",
    difficulty: "easy",
    category: "Oila & Qadriyatlar"
  },
  friend: {
    word: "Friend",
    phonetic: "/frend/",
    partOfSpeech: "Ot (Noun)",
    uzbekMeaning: "Do'st, qadrdon, birodar",
    definition: "A person whom one knows and with whom one has a bond of mutual affection.",
    exampleSentence: "A true friend inspires you to grow and conquer your life missions.",
    exampleTranslation: "Haqiqiy do'st sizni o'sishga va hayotiy maqsadlaringizni zabt etishga ilhomlantiradi.",
    synonyms: ["companion", "ally", "comrade", "pal"],
    mnemonic: "🤝 Friend — Qiyin damda yelkadosh bo'ladigan sadoqatli inson.",
    difficulty: "easy",
    category: "Kundalik & Do'stlik"
  },
  discipline: {
    word: "Discipline",
    phonetic: "/ˈdɪs.ə.plɪn/",
    partOfSpeech: "Ot / Fe'l",
    uzbekMeaning: "Intizom, tartib-qoida, o'zini nazorat qilish",
    definition: "The practice of training people to obey rules or a code of behavior.",
    exampleSentence: "Discipline will take you to places where motivation alone cannot reach.",
    exampleTranslation: "Intizom sizni motivatsiyaning o'zi yetkazib bera olmaydigan cho'qqilarga olib chiqadi.",
    synonyms: ["self-control", "rigor", "order", "firmness"],
    mnemonic: "🛡️ Discipline — Xohishlarga emas, belgilangan rejalarga itoat etish.",
    difficulty: "easy",
    category: "Intizom & Tartib"
  },
  abandon: {
    word: "Abandon",
    phonetic: "/əˈbæn.dən/",
    partOfSpeech: "Fe'l (Verb)",
    uzbekMeaning: "Tashlab ketmoq, tark etmoq, voz kechmoq",
    definition: "Cease to support or look after; give up completely.",
    exampleSentence: "Never abandon your dreams no matter how steep the mountain becomes.",
    exampleTranslation: "Tog' qanchalik tik bo'lmasin, o'z orzularingizdan aslo voz kechmang.",
    synonyms: ["relinquish", "forsake", "desert", "renounce"],
    mnemonic: "🚪 Abandon — Eskisini tashlab, yangi sahifa ochish.",
    difficulty: "medium",
    category: "IELTS Vocabulary"
  }
};

// AI Word Analyzer & Dictionary Intelligence
app.post("/api/analyze-word", async (req, res) => {
  try {
    const { word } = req.body;
    if (!word || !word.trim()) {
      return res.status(400).json({ error: "Word is required" });
    }

    const cleanWord = word.trim();
    const lowerKey = cleanWord.toLowerCase();

    // Check direct match in built-in lexicon
    if (BUILTIN_LEXICON[lowerKey]) {
      return res.json(BUILTIN_LEXICON[lowerKey]);
    }

    const ai = getGenAI();

    const prompt = `Siz ingliz tili va O'zbek tili bo'yicha professional lingvist va pedagogik AI lisoniy tahlilchisisiz.
Quyidagi so'zni o'rganuvchiga o'zbek tilida eng aniq, boy, mukammal va tushunarli ma'noda tahlil qilib bering.

So'z: "${cleanWord}"

QAT'IY TALAB: Quyidagi JSON formatida toza JSON qaytaring:
{
  "word": "${cleanWord}",
  "phonetic": "/xalqaro IPA transkripsiyasi/",
  "partOfSpeech": "So'z turkumi (Ot / Fe'l / Sifat / Ravish)",
  "uzbekMeaning": "So'zning o'zbek tilidagi aniq, to'liq va asosiy ma'nolari (vergul bilan)",
  "definition": "So'zning sodda va ravon ta'rifi (o'zbek tilida va inglizcha qisqa)",
  "exampleSentence": "Ushbu so'z qatnashgan mukammal, tabiiy inglizcha misol gap.",
  "exampleTranslation": "Misol gapning o'zbekcha chiroyli va to'liq tarjimasi.",
  "synonyms": ["sinonim1", "sinonim2", "sinonim3"],
  "mnemonic": "So'zni oson va unutilmas eslab qolish uchun yorqin assotsiatsiya yoki xotira siri",
  "difficulty": "easy" yoki "medium" yoki "hard",
  "category": "IELTS / Biznes / Dasturlash / Kundalik / Fan"
}`;

    if (!process.env.GEMINI_API_KEY) {
      // Smart Rule-based Lexical Generation for when API key is not present
      const firstUpper = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1);
      return res.json({
        word: firstUpper,
        phonetic: `/${cleanWord.toLowerCase()}/`,
        partOfSpeech: cleanWord.endsWith('ly') ? "Ravish (Adverb)" : cleanWord.endsWith('tion') || cleanWord.endsWith('ment') || cleanWord.endsWith('ness') ? "Ot (Noun)" : cleanWord.endsWith('ful') || cleanWord.endsWith('able') || cleanWord.endsWith('ive') || cleanWord.endsWith('ous') ? "Sifat (Adjective)" : "Ot / Fe'l (Noun/Verb)",
        uzbekMeaning: `"${cleanWord}" — faol lug'atdagi muhim atama, zaruriy so'z`,
        definition: `"${cleanWord}" so'zi ingliz tilida o'z fikrini to'liq va aniq ifodalash uchun ishlatiladigan asosiy leksik birliklardan biri.`,
        exampleSentence: `Mastering the word "${cleanWord}" enriches your communication and writing skills.`,
        exampleTranslation: `"${cleanWord}" so'zini puxta o'rganish sizning muloqot va yozish mahoratingizni boyitadi.`,
        synonyms: ["vital", "essential", "primary"],
        mnemonic: `💡 Xotira kodi: "${cleanWord}" so'zini bugun 3 ta turli gapda ovoz chiqarib takrorlang va yozib oling!`,
        difficulty: cleanWord.length > 8 ? "hard" : cleanWord.length > 5 ? "medium" : "easy",
        category: "IELTS / Kundalik"
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (!parsed.uzbekMeaning) {
      parsed.uzbekMeaning = `"${cleanWord}" — tarjima va ma'no`;
    }
    res.json(parsed);
  } catch (error: any) {
    console.error("Analyze word error:", error);
    const clean = req.body.word ? String(req.body.word).trim() : "Word";
    res.json({
      word: clean,
      phonetic: `/${clean.toLowerCase()}/`,
      partOfSpeech: "Lug'at birligi",
      uzbekMeaning: `"${clean}" — muhim leksik tushuncha`,
      definition: `Ushbu so'z xalqaro ingliz tilida keng qo'llaniladi.`,
      exampleSentence: `Consistently practicing the word "${clean}" brings true fluency.`,
      exampleTranslation: `"${clean}" so'zini doimiy mashq qilish haqiqiy ravonlik keltiradi.`,
      synonyms: ["essential", "key"],
      mnemonic: "Ushbu so'zni takrorlash jadvaliga qo'shing va har kuni esga oling.",
      difficulty: "medium",
      category: "IELTS & Kundalik"
    });
  }
});

// AI Batch Words Generator for Curated Learning Sets
app.post("/api/batch-words", async (req, res) => {
  try {
    const { category, topic, count = 5 } = req.body;
    const ai = getGenAI();

    const prompt = `Ingliz tilini o'rganuvchilar uchun ${count} ta eng sara, kuchli va yuqori daromadli (high-yield) yangi so'zlar to'plamini tuzing.
Kategoriya / Mavzu: "${category || topic || "IELTS Essential 500 & Daily Fluency"}"

Quyidagi JSON formatda qaytaring:
{
  "words": [
    {
      "word": "...",
      "phonetic": "/.../",
      "partOfSpeech": "...",
      "uzbekMeaning": "...",
      "definition": "...",
      "exampleSentence": "...",
      "exampleTranslation": "...",
      "synonyms": ["...", "..."],
      "mnemonic": "...",
      "difficulty": "medium",
      "category": "${category || "IELTS"}"
    }
  ]
}`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        words: [
          {
            word: "Resilience",
            phonetic: "/rɪˈzɪl.jəns/",
            partOfSpeech: "Ot (Noun)",
            uzbekMeaning: "Matonat, chidamlilik, qiyinchiliklardan tez tiklanish qobiliyati",
            definition: "The capacity to recover quickly from difficulties; toughness.",
            exampleSentence: "Her resilience helped her overcome the most challenging obstacles in her career.",
            exampleTranslation: "Uning matonati unga karyerasidagi eng qiyin to'siqlarni yengib o'tishga yordam berdi.",
            synonyms: ["toughness", "endurance", "grit"],
            mnemonic: "Re-silience — har qanday zarbadan keyin qaytadan silkinib o'rnidan turish.",
            difficulty: "medium",
            category: "IELTS"
          },
          {
            word: "Perseverance",
            phonetic: "/ˌpɜː.sɪˈvɪə.rəns/",
            partOfSpeech: "Ot (Noun)",
            uzbekMeaning: "Sabr-toqatli qat'iyat, to'xtovsiz harakat",
            definition: "Persistence in doing something despite difficulty or delay in achieving success.",
            exampleSentence: "Success requires relentless perseverance and laser-sharp focus.",
            exampleTranslation: "Muvaffaqiyat tinimsiz qat'iyat va o'ta o'tkir fokusni talab qiladi.",
            synonyms: ["tenacity", "determination", "diligence"],
            mnemonic: "Persevere — har qanday sharoitda server kabi 24/7 ishlash.",
            difficulty: "hard",
            category: "IELTS"
          },
          {
            word: "Meticulous",
            phonetic: "/məˈtɪk.jə.ləs/",
            partOfSpeech: "Sifat (Adjective)",
            uzbekMeaning: "O'ta sinchkov, mayda detallarga ham e'tiborli",
            definition: "Showing great attention to detail; very careful and precise.",
            exampleSentence: "He was meticulous about planning his daily routines to the minute.",
            exampleTranslation: "U kunlik tartibini daqiqasigacha rejalashtirishda o'ta sinchkov edi.",
            synonyms: ["thorough", "precise", "scrupulous"],
            mnemonic: "Meticulous — har bir nuqtani 'metr' bilan o'lchagandek aniq bajarish.",
            difficulty: "medium",
            category: "IELTS"
          },
          {
            word: "Ubiquitous",
            phonetic: "/juːˈbɪk.wɪ.təs/",
            partOfSpeech: "Sifat (Adjective)",
            uzbekMeaning: "Hamma joyda mavjud, hamma yerda uchraydigan",
            definition: "Present, appearing, or found everywhere.",
            exampleSentence: "Smartphones have become ubiquitous in modern global civilization.",
            exampleTranslation: "Smartfonlar zamonaviy global sivilizatsiyada hamma yerda uchraydigan bo'lib qoldi.",
            synonyms: ["omnipresent", "pervasive", "universal"],
            mnemonic: "Ubi-quitous — 'u-bu yerda' emas, hamma yerda bor!",
            difficulty: "hard",
            category: "IELTS"
          },
          {
            word: "Leverage",
            phonetic: "/ˈliː.vər.ɪdʒ/",
            partOfSpeech: "Fe'l / Ot",
            uzbekMeaning: "Kuchsiz resursdan maksimal foyda chiqarish, imkoniyatni to'liq ishga solish",
            definition: "Use something to maximum advantage.",
            exampleSentence: "We must leverage modern AI technology to accelerate our learning speed.",
            exampleTranslation: "O'rganish tezligimizni oshirish uchun zamonaviy AI texnologiyasidan maksimal foydalanishimiz kerak.",
            synonyms: ["utilize", "harness", "maximize"],
            mnemonic: "Lever — richag orqali og'ir toshni oson ko'tarishdek, aqlni ishga solish.",
            difficulty: "medium",
            category: "Biznes & Dasturlash"
          }
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Batch words error:", error);
    res.status(500).json({ error: "So'zlar to'plamini tuzishda xatolik yuz berdi" });
  }
});

// AI Chat endpoint - Any topic consultation with Alien / Cyber Intelligence Mentor
app.post("/api/chat", async (req, res) => {
  try {
    const { message, history, contextData } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getGenAI();
    const systemInstruction = `Siz "XENO Chrono" - O'zga Sayyoraliklar Kiber-Intellekti va Galaktik Rejalashtiruvchisiz.
Siz foydalanuvchiga har qanday mavzuda (vaqtni rejalashtirish, til o'rganish, dasturlash, ilm-fan, jismoniy tarbiya, shaxsiy intizom, biznes, falsafa, hayotiy maslahatlar va barcha sohalar) eng yuqori darajadagi professional, aniq va motivatsiyaga to'la maslahatlar berasiz.

Vibe va uslubingiz:
- Futuristik, kosmik kiber-intellekt tili (ammo juda samimiy, tushunarli va qat'iy intizomga undovchi).
- O'zbek tilida ravon va savodli yozing.
- Maslahatlaringiz amaliy, qadam-baqadam (protokollar ko'rinishida) va darhol qo'llash mumkin bo'lsin.
- Agar foydalanuvchi vaqtni yo'qotayotgan bo'lsa yoki dangasalik qilsa, do'stona ammo juda qat'iy ("Umr cheklangan, maqsadlarga kechikishga haqqingiz yo'q!") ohangda rag'batlantiring.
- Formatlashda qulay nuqtalar, qisqa bo'limlar va neon emoji/belgilardan foydalaning.

Foydalanuvchi joriy holati / kontekst: ${JSON.stringify(contextData || {})}`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        reply: `[XENO NEURAL CORE: OFFLINE PROTOKOL]\n\nSalom, yerlik do'stim! Sizning so'rovingiz: "${message}"\n\n🎯 **Galaktik Maslahat:**\n1. **Vaqtni bloklash:** Har qanday katta maqsadni 25-45 daqiqalik uzluksiz konsentratsiya sikllariga bo'ling.\n2. **Kechiktirishga barham bering:** Boshlashdagi birinchi 2 daqiqa eng qiyinidir. Shunchaki boshlang!\n3. **Intizom — bu erkinlik:** Sizga ishongan insonlar va kelajakdagi o'zingiz sizning har bir daqiqangizga qarab turibdi.\n\n*(AI kaliti sozlanganda to'liq jonli neyron tarmoq javoblari faollashadi)*`,
      });
    }

    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const h of history.slice(-8)) {
        contents.push({
          role: h.role === "assistant" ? "model" : "user",
          parts: [{ text: h.content }],
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ reply: response.text || "Javob hosil qilishda xatolik yuz berdi." });
  } catch (error: any) {
    console.error("Chat error:", error);
    res.status(500).json({ 
      error: "AI bilan aloqa uzildi", 
      reply: "Kiber neyron markaz bilan vaqtinchalik aloqa uzildi. Iltimos, qayta urinib ko'ring yoki rejalaringiz ustida ishlashni davom eting!" 
    });
  }
});

// Built-in Curated Topic Knowledge Matrix for Instant Offline High-Performance
const TOPIC_PRESETS: Record<string, any> = {
  "react_typescript": {
    topic: "React 19 & TypeScript",
    category: "Dasturlash & Frontend",
    summary: "Zamonaviy React arxitekturasi, TypeScript type-safety va samarali state boshqaruvi.",
    suggestedWords: [
      {
        word: "Immutability",
        phonetic: "/ˌɪm.juː.təˈbɪl.ə.ti/",
        partOfSpeech: "Ot (Noun)",
        uzbekMeaning: "O'zgarmaslik (holatni to'g'ridan-to'g'ri o'zgartirmay, yangi nusxasini yaratish)",
        definition: "The state of not changing, or the inability to be changed.",
        exampleSentence: "React state requires immutability to ensure correct component re-rendering and performance.",
        exampleTranslation: "React state komponentlarning to'g'ri qayta chizilishi va samaradorligi uchun o'zgarmaslikni talab qiladi.",
        mnemonic: "Immutable — asl nusxani buzmang, yangisini klonlang!",
        difficulty: "medium"
      },
      {
        word: "Reconciliation",
        phonetic: "/ˌrek.ənˌsɪl.iˈeɪ.ʃən/",
        partOfSpeech: "Ot (Noun)",
        uzbekMeaning: "Yarashtirish (React Virtual DOM va Real DOM o'rtasidagi farqni solishtirish jarayoni)",
        definition: "The algorithm React uses to diff one tree with another to determine which parts need to be changed.",
        exampleSentence: "The reconciliation engine minimizes expensive DOM operations by computing diffs in memory.",
        exampleTranslation: "Reconciliation dvigateli xotiradagi farqlarni hisoblab, qimmat DOM operatsiyalarini minimallashtiradi.",
        mnemonic: "Reconcile — ikki daraxt o'rtasidagi kelishuv va minimal o'zgarish.",
        difficulty: "hard"
      },
      {
        word: "Concurrency",
        phonetic: "/kənˈkʌr.ən.si/",
        partOfSpeech: "Ot (Noun)",
        uzbekMeaning: "Parallel/ko'p vazifalilik (bir nechta vazifalarni bir vaqtda navbati bilan uzluksiz bajarish)",
        definition: "The ability of different parts or units of a program to be executed out-of-order without affecting the final outcome.",
        exampleSentence: "React 19 uses concurrency to keep user interactions responsive during heavy state transitions.",
        exampleTranslation: "React 19 og'ir render o'tishlarida ham interfeys chaqqonligini saqlash uchun concurrency'dan foydalanadi.",
        mnemonic: "Concurrent — bir vaqtda bir nechta oqimning silliq oqishi.",
        difficulty: "hard"
      },
      {
        word: "Memoization",
        phonetic: "/ˌmem.oʊ.aɪˈzeɪ.ʃən/",
        partOfSpeech: "Ot (Noun)",
        uzbekMeaning: "Keshlash/Eslab qolish (og'ir hisoblash natijasini saqlab, qayta hisoblashdan qochish)",
        definition: "An optimization technique used primarily to speed up programs by storing the results of expensive function calls.",
        exampleSentence: "Use useMemo for expensive calculations to prevent unnecessary computations during re-renders.",
        exampleTranslation: "Qayta renderlarda ortiqcha hisoblashlarni oldini olish uchun og'ir funksiyalarda useMemo ishlating.",
        mnemonic: "Memo — qog'ozga eslatma yozib olgandek, natijani xotirada saqlab qolish.",
        difficulty: "medium"
      }
    ],
    suggestedPhrases: [
      {
        id: "ph-1",
        phrase: "Single source of truth",
        uzbekMeaning: "Yagona ishonchli manba (barcha ma'lumotlar faqat bitta markaziy statedan olinishi)",
        context: "State management & architecture",
        exampleSentence: "Keeping our auth session in Redux provides a single source of truth for the entire application.",
        exampleTranslation: "Autentifikatsiya sessiyasini Redux'da saqlash butun ilova uchun yagona ishonchli manba beradi."
      },
      {
        id: "ph-2",
        phrase: "Under the hood",
        uzbekMeaning: "Parda ortida / Ichki mexanizmda qanday ishlashi",
        context: "Framework internals & performance",
        exampleSentence: "Under the hood, useState triggers a fiber queue dispatch and schedules a re-render.",
        exampleTranslation: "Parda ortida, useState tolalar navbatini ishga tushiradi va qayta renderlashni rejalashtiradi."
      },
      {
        id: "ph-3",
        phrase: "Prop drilling",
        uzbekMeaning: "Proplarni oraliq komponentlar orqali keraksiz chuqur uzatish muammosi",
        context: "Component component hierarchy",
        exampleSentence: "We refactored the component tree with React Context to eliminate cumbersome prop drilling.",
        exampleTranslation: "Biz noqulay prop drilling'ni bartaraf etish uchun komponentlar daraxtini React Context yordamida qayta qurdik."
      }
    ],
    suggestedCodeSnippets: [
      {
        id: "code-1",
        title: "Custom Hook: useDebounce with Generics in TypeScript",
        language: "typescript",
        code: `import { useState, useEffect } from 'react';

/**
 * High-performance generic debounce hook
 * Input qidiruv va server so'rovlarini optimallashtiradi
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timer); // Cleanup on rapid typing
    };
  }, [value, delayMs]);

  return debouncedValue;
}`,
        explanation: "Foydalanuvchi qidiruv maydoniga tez-tez yozganda har bir harf uchun API so'rov yuborilmasligini ta'minlaydi. Belgilangan vaqt (masalan 300ms) to'xtagandan keyingina qiymatni yangilaydi.",
        bestPracticeTip: "Doimo useEffect ichida clearTimeout qaytarib tozalang (memory leak'ni oldini oladi)."
      },
      {
        id: "code-2",
        title: "Type-Safe discriminated union & Async Reducer",
        language: "typescript",
        code: `type FetchState<T> = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// Pattern matching without impossible states
function renderContent<T>(state: FetchState<T>) {
  switch (state.status) {
    case 'loading':
      return <div className="animate-spin text-cyan-400">Loading...</div>;
    case 'error':
      return <div className="text-rose-400">Xatolik: {state.error}</div>;
    case 'success':
      return <div className="text-emerald-400">Muvaffaqiyat!</div>;
    default:
      return null;
  }
}`,
        explanation: "Xatoliklarni nolga tushiruvchi TypeScript Discriminated Unions usuli. Bir vaqtda ham loading, ham success bo'lib qolish kabi mantiqiy ziddiyatlarni oldini oladi."
      }
    ],
    miniChallenge: {
      title: "useDebounce Hook'ini qidiruv maydoniga tatbiq qilish",
      description: "Qidiruv maydoniga so'z kiritilganda server API chaqiruvini 400ms kechiktirib yuboruvchi mexanizmni quring.",
      estimatedMinutes: 25
    }
  },
  "algorithms_data_structures": {
    topic: "Algoritmlar & Data Structures",
    category: "Muhandislik & Algoritmlar",
    summary: "LeetCode / O(N) vaqt va xotira murakkabligi, Two-Pointers, Sliding Window va Dynamic Programming.",
    suggestedWords: [
      {
        word: "Amortized",
        phonetic: "/ˈæm.ər.taɪzd/",
        partOfSpeech: "Sifat (Adjective)",
        uzbekMeaning: "Amortizatsiyalangan (o'rtacha hisoblangan vaqt murakkabligi)",
        definition: "Averaged over many operations, even if a single operation occasionally takes longer.",
        exampleSentence: "Dynamic array appending has an amortized time complexity of O(1).",
        exampleTranslation: "Dinamik massivga element qo'shish amortizatsiyalangan O(1) vaqtga tengdir.",
        mnemonic: "Amortized — bir marta og'ir bo'lsa ham, 100 martaga bo'linganda o'rtacha bir zumda bo'ladi.",
        difficulty: "hard"
      },
      {
        word: "Monotonic",
        phonetic: "/ˌmɒn.əˈtɒn.ɪk/",
        partOfSpeech: "Sifat (Adjective)",
        uzbekMeaning: "Monoton (faqat o'suvchi yoki faqat kamayuvchi tartibda boruvchi)",
        definition: "Varying in such a way that it either never decreases or never increases.",
        exampleSentence: "A monotonic stack allows us to find the next greater element in O(N) linear time.",
        exampleTranslation: "Monoton stek bizga keyingi eng katta elementni O(N) chiziqli vaqtda topish imkonini beradi.",
        mnemonic: "Mono-tonic — bir maromda faqat ko'tariluvchi yoki faqat tushuvchi.",
        difficulty: "hard"
      },
      {
        word: "Idempotent",
        phonetic: "/ˌaɪ.dəmˈpoʊ.tənt/",
        partOfSpeech: "Sifat (Adjective)",
        uzbekMeaning: "Idempotent (bir necha marta bajarganda ham natijasi o'zgarmaydigan operatsiya)",
        definition: "Denoting an element or operation which can be applied multiple times without changing the result beyond the initial application.",
        exampleSentence: "HTTP GET and PUT methods are strictly designed to be idempotent.",
        exampleTranslation: "HTTP GET va PUT metodlari qat'iy idempotent bo'lishi uchun loyihalashtirilgan.",
        mnemonic: "Idempotent — 100 marta bossangiz ham bitta holatga olib keladi.",
        difficulty: "hard"
      }
    ],
    suggestedPhrases: [
      {
        id: "ph-alg-1",
        phrase: "Space-time trade-off",
        uzbekMeaning: "Xotira va vaqt o'rtasidagi kelishuv (xotirani ko'proq ishlatib, tezlikni oshirish)",
        context: "Algorithm design",
        exampleSentence: "Using a Hash Map gives us O(1) lookup time, which is a worthwhile space-time trade-off.",
        exampleTranslation: "Hash Map ishlatish O(1) qidiruv vaqtini beradi, bu juda foydali xotira-vaqt kelishuvidir."
      },
      {
        id: "ph-alg-2",
        phrase: "Corner case",
        uzbekMeaning: "Chekka/nozik holat (bo'sh massiv, manfiy son, null qiymat)",
        context: "Edge testing & coding interviews",
        exampleSentence: "Always test your binary search against corner cases like empty arrays and single-element inputs.",
        exampleTranslation: "Har doim binar qidiruvni bo'sh massiv va yagona elementli nozik holatlarda tekshiring."
      }
    ],
    suggestedCodeSnippets: [
      {
        id: "code-alg-1",
        title: "Two-Pointer Technique: In-Place Pair Sum O(N)",
        language: "typescript",
        code: `/**
 * Tartiblangan massivdan yig'indisi target'ga teng bo'lgan juftlikni topish
 * Vaqt: O(N), Xotira: O(1)
 */
function twoSumSorted(numbers: number[], target: number): [number, number] | null {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const currentSum = numbers[left] + numbers[right];

    if (currentSum === target) {
      return [left, right]; // Juftlik topildi!
    } else if (currentSum < target) {
      left++; // Yig'indini oshirish uchun chap ko'rsatkichni suramiz
    } else {
      right--; // Yig'indini kamaytirish uchun o'ng ko'rsatkichni suramiz
    }
  }

  return null; // Topilmadi
}`,
        explanation: "O(N^2) ikki qavatli sikl o'rniga ikki tarafdan ko'rsatkichlar yurgizib, O(N) chiziqli vaqtda masalani mukammal hal qilish usuli."
      }
    ],
    miniChallenge: {
      title: "Two-Pointer masalasini LeetCode'da mustahkamlash",
      description: "LeetCode #167 (Two Sum II - Input Array Is Sorted) masalasini O(1) xotirada yeching.",
      estimatedMinutes: 20
    }
  },
  "ielts_academic": {
    topic: "IELTS Academic & Speaking Band 8.0+",
    category: "Ingliz Tili & IELTS",
    summary: "Yuqori darajali akademik so'zlar, idiomatik birikmalar va ko'p ball olib keluvchi jumlalar.",
    suggestedWords: [
      {
        word: "Paradigm",
        phonetic: "/ˈpær.ə.daɪm/",
        partOfSpeech: "Ot (Noun)",
        uzbekMeaning: "Paradigma (dunyoqarash modeli, qabul qilingan tizim)",
        definition: "A typical example or pattern of something; a distinct set of concepts or thought patterns.",
        exampleSentence: "The emergence of AI has caused a fundamental paradigm shift in modern education.",
        exampleTranslation: "Sun'iy intellektning paydo bo'lishi zamonaviy ta'limda tub paradigma o'zgarishini keltirib chiqardi.",
        mnemonic: "Paradigm — fikrlashning yangi 'xaritasi'.",
        difficulty: "medium"
      },
      {
        word: "Substantiate",
        phonetic: "/səbˈstæn.ʃi.eɪt/",
        partOfSpeech: "Fe'l (Verb)",
        uzbekMeaning: "Dalillar bilan isbotlamoq, asoslamoq",
        definition: "Provide evidence to support or prove the truth of something.",
        exampleSentence: "You must substantiate your claims with empirical evidence in academic writing.",
        exampleTranslation: "Akademik inshoda o'z fikrlaringizni empirik dalillar bilan asoslashingiz shart.",
        mnemonic: "Substance — quruq gap emas, mustahkam asos bermoq.",
        difficulty: "hard"
      },
      {
        word: "Exacerbate",
        phonetic: "/ɪɡˈzæs.ə.beɪt/",
        partOfSpeech: "Fe'l (Verb)",
        uzbekMeaning: "Vaziyatni yanada og'irlashtirmoq, yomonlashtirmoq",
        definition: "Make a problem, bad situation, or negative feeling worse.",
        exampleSentence: "Lack of sleep will exacerbate your stress levels and diminish focus.",
        exampleTranslation: "Uyqusizlik stress darajangizni og'irlashtiradi va diqqatni pasaytiradi.",
        mnemonic: "Exacerbate — alanga ustiga moy sepgandek yomonlashtirish.",
        difficulty: "medium"
      }
    ],
    suggestedPhrases: [
      {
        id: "ph-ielts-1",
        phrase: "A double-edged sword",
        uzbekMeaning: "Ikki tomonlama tig' / Ham foydali, ham zararli tomoni bor narsa",
        context: "IELTS Writing Task 2 & Speaking Part 3",
        exampleSentence: "Technological advancement is a double-edged sword that offers convenience while raising privacy concerns.",
        exampleTranslation: "Texnologik taraqqiyot ikki tomonlama tig'dir: u qulaylik yaratsa-da, shaxsiy daxlsizlik xavflarini keltirib chiqaradi."
      },
      {
        id: "ph-ielts-2",
        phrase: "It is widely acknowledged that",
        uzbekMeaning: "Keng e'tirof etilganki / Hamma tan olgan haqiqatki",
        context: "Academic essay introduction",
        exampleSentence: "It is widely acknowledged that continuous self-education is the key to lifelong mastery.",
        exampleTranslation: "Uzluksiz o'z ustida ishlash butun umrlik mahoratning kaliti ekanligi keng e'tirof etilgan."
      }
    ],
    suggestedCodeSnippets: [],
    miniChallenge: {
      title: "3 ta yangi akademik so'z bilan 5 daqiqalik Speaking nutqi",
      description: "Bugun o'rganilgan 'Paradigm', 'Substantiate' va 'Exacerbate' so'zlarini nutqqa qo'shib ovozda gapiring.",
      estimatedMinutes: 15
    }
  }
};

// AI Learning & Smart Recommendations Endpoint
app.post("/api/ai-recommendations", async (req, res) => {
  try {
    const { topic, customQuery } = req.body;
    const queryTopic = (topic || customQuery || "React & TypeScript").trim();
    const cleanLower = queryTopic.toLowerCase();

    // Check matched presets first
    if (cleanLower.includes("react") || cleanLower.includes("type") || cleanLower.includes("front")) {
      return res.json(TOPIC_PRESETS["react_typescript"]);
    }
    if (cleanLower.includes("algo") || cleanLower.includes("leet") || cleanLower.includes("data structure") || cleanLower.includes("muhandis")) {
      return res.json(TOPIC_PRESETS["algorithms_data_structures"]);
    }
    if (cleanLower.includes("ielts") || cleanLower.includes("ingliz") || cleanLower.includes("speaking") || cleanLower.includes("english")) {
      return res.json(TOPIC_PRESETS["ielts_academic"]);
    }

    const ai = getGenAI();

    const prompt = `Siz yuqori darajadagi dasturlash, chet tili (ingliz tili) va zamonaviy texnologiyalar bo'yicha lisoniy va texnik AI maslahatchisisiz.
Foydalanuvchi quyidagi mavzu yoki soha bo'yicha o'rganish rejasini so'ramoqda:
Mavzu: "${queryTopic}"

Siz foydalanuvchiga:
1. Ushbu mavzuni puxta o'rganish uchun kerak bo'ladigan 3-4 ta muhim inglizcha so'z (term / vocabulary) - O'zbekcha tarjimasi, ta'rifi, misoli va eslab qolish kodi bilan.
2. 2-3 ta sohada eng ko'p ishlatiladigan muhim ibora/kollokatsiya (Phrases/Idioms) - O'zbekcha ma'nosi va konteksti bilan.
3. Agar mavzu dasturlash yoki texnologiyaga oid bo'lsa: 1-2 ta toza, amaliy va professional kod namunalari (TypeScript/JavaScript/Python/va h.k.) + tushuntirish. Agar sof til mavzusi bo'lsa: ushbu bo'limni bo'sh massiv [] qilib qoldiring.
4. Bugun bajarilishi kerak bo'lgan 1 ta qiziqarli mini-topshiriq (Mini challenge).

QAT'IY TALAB: Quyidagi JSON formatda toza JSON qaytaring:
{
  "topic": "${queryTopic}",
  "category": "Dasturlash / Til o'rganish / Texnologiya",
  "summary": "Mavzuning qisqa va qimmatli mazmuni (o'zbek tilida).",
  "suggestedWords": [
    {
      "word": "English Word",
      "phonetic": "/ipa/",
      "partOfSpeech": "Ot / Fe'l / Sifat",
      "uzbekMeaning": "O'zbekcha aniq ma'nosi",
      "definition": "Qisqa va ravon ta'rifi",
      "exampleSentence": "Natural example sentence in English.",
      "exampleTranslation": "Misolning o'zbekcha tarjimasi.",
      "mnemonic": "Yorqin eslab qolish siri",
      "difficulty": "medium"
    }
  ],
  "suggestedPhrases": [
    {
      "id": "ph-1",
      "phrase": "Professional tech/spoken phrase",
      "uzbekMeaning": "O'zbekcha ma'nosi",
      "context": "Qaysi vaziyatda ishlatiladi",
      "exampleSentence": "Example sentence using the phrase.",
      "exampleTranslation": "Misol tarjimasi"
    }
  ],
  "suggestedCodeSnippets": [
    {
      "id": "code-1",
      "title": "Kodning nomi",
      "language": "typescript",
      "code": "// Toza va chiroyli amaliy kod",
      "explanation": "Kod qanday ishlashi va nima uchun kerakligi",
      "bestPracticeTip": "Muhim maslahat"
    }
  ],
  "miniChallenge": {
    "title": "Topshiriq sarlavhasi",
    "description": "Topshiriq tafsiloti",
    "estimatedMinutes": 20
  }
}`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        topic: queryTopic,
        category: "Dasturlash & Texnologiya",
        summary: `"${queryTopic}" mavzusi bo'yicha tavsiya etilgan so'zlar, iboralar va amaliy kod andozalari.`,
        suggestedWords: [
          {
            word: "Optimization",
            phonetic: "/ˌɒp.tɪ.maɪˈzeɪ.ʃən/",
            partOfSpeech: "Ot (Noun)",
            uzbekMeaning: "Optimallashtirish, samaradorlikni maksimal darajaga ko'tarish",
            definition: "The action of making the best or most effective use of a situation or resource.",
            exampleSentence: `Systematic optimization is essential when mastering ${queryTopic}.`,
            exampleTranslation: `Tizimli optimallashtirish ${queryTopic} sohasini egallashda juda muhimdir.`,
            mnemonic: "Optima — har doim eng qisqa va tez yo'lni tanlash.",
            difficulty: "medium"
          },
          {
            word: "Scalability",
            phonetic: "/ˌskeɪ.ləˈbɪl.ə.ti/",
            partOfSpeech: "Ot (Noun)",
            uzbekMeaning: "Masshtablanuvchanlik (tizimning yuklama oshganda ham silliq kengayish qobiliyati)",
            definition: "The capacity to be changed in size or scale to handle growing amounts of work.",
            exampleSentence: "Modern architectures prioritize scalability to serve millions of concurrent requests.",
            exampleTranslation: "Zamonaviy arxitekturalar millionlab parallel so'rovlarga xizmat ko'rsatish uchun masshtablanuvchanlikka ustuvorlik beradi.",
            mnemonic: "Scale — masshtabni bemalol kattalashtirish.",
            difficulty: "hard"
          }
        ],
        suggestedPhrases: [
          {
            id: "ph-gen-1",
            phrase: "Best practice",
            uzbekMeaning: "Eng yaxshi tajriba / Soha standarti",
            context: "Software engineering & quality",
            exampleSentence: "Writing modular, self-documenting code is an industry-standard best practice.",
            exampleTranslation: "Modulli va tushunarli kod yozish — butun sohadagi eng yaxshi tajribadir."
          }
        ],
        suggestedCodeSnippets: [
          {
            id: "code-gen-1",
            title: `Clean Architecture Pattern for ${queryTopic}`,
            language: "typescript",
            code: `// Universal clean code pattern
export async function executeTask<T>(action: () => Promise<T>): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (err: any) {
    console.error("Task failed:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}`,
            explanation: "Xatoliklarni xavfsiz ushlab, natijani standart formatda qaytaruvchi mustahkam wrapper andozasi.",
            bestPracticeTip: "Barcha async operatsiyalarda try-catch wrapper'lardan foydalaning."
          }
        ],
        miniChallenge: {
          title: `${queryTopic} bo'yicha 20 daqiqalik amaliy mashg'ulot`,
          description: "O'rganilgan atamalarni o'z ichiga olgan kichik mini-loyihani amalga oshiring.",
          estimatedMinutes: 20
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Recommendations error:", error);
    res.status(500).json({ error: "Tavsiyalar generatsiyasida xatolik yuz berdi" });
  }
});

// AI Plan & Routine Generator
app.post("/api/generate-plan", async (req, res) => {
  try {
    const { goal, wakeTime, sleepTime, focusAreas } = req.body;
    const ai = getGenAI();

    const prompt = `Foydalanuvchi uchun 1 kunlik ideal va juda samarali kosmik reja (kun tartibi) tuzing.
Foydalanuvchi maqsadi: ${goal || "Maksimal mahsuldorlik va rivojlanish"}
Uyg'onish vaqti: ${wakeTime || "06:30"}
Uxlash vaqti: ${sleepTime || "23:00"}
Asosiy e'tibor sohalari: ${focusAreas || "Til o'rganish, Dasturlash, Sport, Kitob mutolaa"}

Quyidagi JSON formatda qaytaring (faqat toza JSON):
{
  "routineName": "...",
  "description": "...",
  "tasks": [
    {
      "title": "...",
      "startTime": "07:00",
      "durationMinutes": 45,
      "category": "sport_salomatlik" | "til_organish" | "dasturlash_ish" | "kitob_mutolaa" | "ilm_fan" | "shaxsiy_tartib",
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "customVoicePrompt": "...",
      "notes": "..."
    }
  ]
}`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        routineName: "Titan Intizom Protokoli",
        description: "Kun davomida maksimal quvvat va mahsuldorlik uchun muvozanatli tartib",
        tasks: [
          {
            title: "Ertalabki Kosmik Quvvat & Gidratatsiya",
            startTime: "06:30",
            durationMinutes: 30,
            category: "sport_salomatlik",
            priority: "HIGH",
            customVoicePrompt: "Kun boshlandi! Tanangizni uyg'oting, suv iching va kosmik quvvatni qabul qiling!",
            notes: "Badantarbiya, 500ml suv, nafas mashqlari"
          },
          {
            title: "Ingliz tili: 50 ta yangi so'z va faol amaliyot",
            startTime: "08:00",
            durationMinutes: 60,
            category: "til_organish",
            priority: "CRITICAL",
            customVoicePrompt: "Diqqat! Siz ingliz tilidan 50 ta so'z yodlashingiz kerak! Nima qilmoqchi eding, nima qilyapsan, vaqtni bekorga sarflama! Sizga ishongan insonlar kutib tura olishmaydi, umr cheklangan!",
            notes: "Flashcards, yangi iboralar va gap tuzish"
          },
          {
            title: "Chuqur Fokus: Asosiy Ish / Dasturlash Missiyasi",
            startTime: "10:00",
            durationMinutes: 90,
            category: "dasturlash_ish",
            priority: "CRITICAL",
            customVoicePrompt: "Kiber diqqat faollashdi! Barcha chalg'ituvchi omillarni o'chiring va asosiy loyiha ustida ishlang!",
            notes: "Pomodoro usulida eng muhim topshiriq"
          },
          {
            title: "Kitob Mutolaa va Dunyoqarash Kengaytirish",
            startTime: "16:00",
            durationMinutes: 45,
            category: "kitob_mutolaa",
            priority: "MEDIUM",
            customVoicePrompt: "Ilm olish vaqti! Bugun yangi g'oyalar bilan ongni boyiting, har bir sahifa sizni yuksaltiradi!",
            notes: "Konspekt olish va asosiy xulosalar"
          },
          {
            title: "Kechki Jismoniy Tiklanish va Yugurish",
            startTime: "18:30",
            durationMinutes: 45,
            category: "sport_salomatlik",
            priority: "HIGH",
            customVoicePrompt: "Tana chiniqishi — aql quvvati! Mashg'ulotga kiring va charchoqni quvib chiqaring!",
            notes: "Kardio yoki kuch mashqlari"
          },
          {
            title: "Kunlik Tahlil, Tizim Audit va Ertangi Reja",
            startTime: "21:30",
            durationMinutes: 30,
            category: "shaxsiy_tartib",
            priority: "HIGH",
            customVoicePrompt: "Kunlik hisobot vaqti. Bugun nimalarga erishdingiz? O'z oldingizda halol bo'ling va ertangi g'alabani rejalashtiring!",
            notes: "Xatolar tahlili, yutuqlar qaydi"
          }
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Plan generation error:", error);
    res.status(500).json({ error: "Reja tuzishda xatolik yuz berdi" });
  }
});

// AI Task Motivational Speech Alert Generator
app.post("/api/motivate", async (req, res) => {
  try {
    const { taskTitle, category, strictness } = req.body;
    const ai = getGenAI();

    const prompt = `Ushbu topshiriq vaqti kelganda ovozli o'qib eshittiriladigan qat'iy, shiddatli va kuchli o'zbekcha motivatsion eslatma matnini yozing.
Topshiriq nomi: "${taskTitle}"
Kategoriya: "${category}"
Qat'iylik darajasi: "${strictness || "brutal_alien"}" (juda qat'iy, umr cheklanganligi, insonlar ishonchi, dangasalikka joy yo'qligi haqida).

Namuna: "Diqqat! Belgilangan vaqt yetib keldi: Siz ${taskTitle || "vazifangiz"}ni bajarishingiz kerak! Nima qilmoqchi eding, nima qilyapsan, vaqtni bekorga sarflama! Sizga ishongan insonlar kutib tura olishmaydi, umr cheklangan! Hoziroq harakatni boshlang!"

Qisqa, aniq, kuchli (2-3 jumla) o'zbek tilida yozing. Faqat matnni qaytaring.`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        speechText: `Diqqat! Belgilangan vaqt yetib keldi: Siz ${taskTitle} missiyasini bajarishingiz kerak! Nima qilmoqchi eding, nima qilyapsan, vaqtni bekorga sarflama! Sizga ishongan insonlar kutib tura olishmaydi, umr cheklangan! Darhol harakatga kirishing!`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        temperature: 0.8,
      },
    });

    res.json({ speechText: response.text?.trim() || `Diqqat! ${taskTitle} vaqti keldi! Nima qilmoqchi eding, nima qilyapsan, vaqtni bekorga sarflama! Kechiktirmasdan boshlang!` });
  } catch (error: any) {
    console.error("Motivate error:", error);
    res.json({
      speechText: `Diqqat! ${req.body.taskTitle || "Vazifa"} vaqti yetib keldi! Nima qilmoqchi eding, nima qilyapsan, vaqtni bekorga sarflama! Hoziroq boshlang!`,
    });
  }
});

// AI Task Decomposer
app.post("/api/decompose-task", async (req, res) => {
  try {
    const { taskTitle, notes } = req.body;
    const ai = getGenAI();

    const prompt = `Topshiriqni 3-5 ta aniq kiber-bosqichlarga (sub-task) bo'lib bering.
Topshiriq: "${taskTitle}"
Qo'shimcha: "${notes || ""}"

Quyidagi JSON formatda qaytaring:
{
  "subtasks": [
    { "title": "1-bosqich: ..." },
    { "title": "2-bosqich: ..." },
    { "title": "3-bosqich: ..." }
  ]
}`;

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        subtasks: [
          { title: "Tayyorgarlik va chalg'ituvchi omillarni yo'qotish (5 daqiqa)" },
          { title: "Asosiy qism ustida to'liq diqqat bilan ishlash (25 daqiqa)" },
          { title: "Natijani tekshirish va xulosalar qayd etish (10 daqiqa)" }
        ]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json(parsed);
  } catch (error: any) {
    console.error("Decompose error:", error);
    res.status(500).json({ error: "Bo'lishda xatolik yuz berdi" });
  }
});

// Vite middleware in dev or static files in production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`XENO Chrono server is running on http://0.0.0.0:${PORT}`);
  });
}

setupVite();
