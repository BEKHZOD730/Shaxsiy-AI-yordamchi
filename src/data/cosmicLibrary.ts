import { CosmicBook } from '../types';

export const INITIAL_COSMIC_BOOKS: CosmicBook[] = [
  {
    id: 'cosmic_book_1',
    title: 'Koinot va Vaqt Falsafasi: Kvant Sakrashi',
    author: 'Dr. Alistair Vance (Xeno Ilmiy Kengashi)',
    category: 'Kosmik Fizika & Ong',
    totalPages: 3,
    totalWords: 480,
    currentPage: 0,
    currentWordIndex: 0,
    speedWpm: 240,
    bookmarks: [],
    uploadedAt: '2026-08-16T05:00:00.000Z',
    fileSize: '185 KB',
    coverGradient: 'from-cyan-900 via-indigo-950 to-slate-950',
    isPreloaded: true,
    pages: [
      `Insoniyat doimo koinot qa'riga va vaqt tubiga nazar tashlab kelgan. Biz yashayotgan olam faqat ko'zimiz ko'rgan uch o'lchamli fazodan iborat emas. Kvant fizikasi shuni isbotlaydiki, har bir zarracha bir vaqtning o'zida ham modda, ham to'lqin xarakteriga ega. Qachonki biz o'z diqqatimizni yagona nuqtaga qaratganimizda, butun koinot bizning irodamiz atrofida shakllana boshlaydi. Vaqt esa chiziqli oqim emas, balki fazoviy koordinataning o'zgarmas to'rtinchi o'lchamidir. Har bir sarflangan soniya qaytarib bo'lmas kiber-resurs hisoblanadi.`,
      `Ongimiz koinotdagi eng murakkab neyron tarmoqdir. Olimlar inson miyasidagi neyronlar soni Somon Yo'li galaktikasidagi yulduzlar soniga teng ekanligini ta'kidlaydilar. Qachonki siz yangi kitob o'qisangiz, miyangizda milliardlab yangi sinaptik ko'priklar vujudga keladi. Bu esa sizning aqliy quvvatingizni yangi bosqichga ko'taradi. Dangasalik — bu kosmik gravitatsiyaning ongni tortishi, harakat esa bu gravitatsiyani yengib o'tuvchi reaktiv raketa motoridir!`,
      `Buyuk maqsadlarga erishish uchun har kuni o'z ustingizda ishlashingiz zarur. Kvant sakrashi to'satdan sodir bo'lmaydi — u kichik, ammo qat'iy harakatlarning jamlanishidan hosil bo'ladi. Har bir o'qilgan kitob sahifasi, har bir o'rganilgan yangi so'z va har bir bajarilgan vazifa sizni yulduzlar sari yaqinlashtiradi. Hech qachon to'xtamang, chunki koinot faqat oldinga intiluvchi jasur qalblar oldida o'z eshiklarini ochadi!`
    ]
  },
  {
    id: 'cosmic_book_2',
    title: 'Elon Musk: Mars Missiyasi va Kiber-Kelajak',
    author: 'Kosmik Muhandislik Arxivlari',
    category: 'Texnologiya & Mars',
    totalPages: 3,
    totalWords: 420,
    currentPage: 0,
    currentWordIndex: 0,
    speedWpm: 280,
    bookmarks: [],
    uploadedAt: '2026-08-16T05:00:00.000Z',
    fileSize: '142 KB',
    coverGradient: 'from-rose-950 via-purple-950 to-slate-950',
    isPreloaded: true,
    pages: [
      `Marsga parvoz — insoniyat tarixidagi eng ulkan qadamdir. Sayyoralararo tsivilizatsiyaga aylanish insoniyatning yashab qolishi uchun yagona kafolatdir. Starship kemasi aynan shu maqsad yo'lida yaratilmoqda. Ko'p martalik reaktiv dvigatellar kosmik sayohatlar narxini yuzlab baravarga arzonlashtirdi. Kelajak kutib turmaydi, uni hoziroq o'z qo'llarimiz bilan qurishimiz shart.`,
      `Muvaffaqiyat kaliti — bu birinchi prinsiplar (First Principles) bo'yicha fikrlashdir. Har qanday murakkab muammoni eng mayda asosiy tarkibiy qismlariga ajrating va uni tubdan qayta quring. An'anaviy qoliplarga ko'r-ko'rona ergashishni to'xtating. Agar siz o'z oldingizga imkonsiz tuyulgan maqsadlarni qo'ymasangiz, hech qachon buyuk natijalarga erisha olmaysiz.`,
      `Mehnatsevarlik va qat'iyat har qanday to'siqni yorib o'tadi. Haftasiga yuz soatlik giper-fokus bilan ishlagan inson, boshqalar bir yilda erishadigan natijaga bir necha oyda erishadi. O'z vaqtingizni qadrlang, diqqatingizni arzimas chalg'ishlarga sarflamang va o'z orzularingizning bosh muhandisiga aylaning!`
    ]
  },
  {
    id: 'cosmic_book_3',
    title: 'Deep Work: Giper-Fokus va Tez O\'qish Kuchi',
    author: 'Kiber Psixologiya Markazi',
    category: 'Miya Salohiyati & Produktivlik',
    totalPages: 2,
    totalWords: 360,
    currentPage: 0,
    currentWordIndex: 0,
    speedWpm: 320,
    bookmarks: [],
    uploadedAt: '2026-08-16T05:00:00.000Z',
    fileSize: '120 KB',
    coverGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    isPreloaded: true,
    pages: [
      `Chuqur diqqat (Deep Work) — zamonaviy dunyoda eng qimmatbaho valyutadir. Raqamli bildirishnomalar, ijtimoiy tarmoqlar va keraksiz shovqin inson ongini mayda bo'laklarga parchalab yuboradi. Giper-fokus holatiga kirish uchun barcha tashqi chalg'ituvchi manbalarni bloklang. Miyangiz yagona vazifaga 100 foiz yo'naltirilganda, o'rganish tezligi va axborotni o'zlashtirish darajasi 5 barobarga oshadi.`,
      `Tez o'qish texnikasi va RSVP (Rapid Serial Visual Presentation) usuli orqali inson ko'zi so'zlarni tovushsiz, to'g'ridan-to'g'ri vizual tushuncha sifatida qabul qiladi. Har bir so'zni ovoz chiqarib o'qish (subvokalizatsiya) tezlikni pasaytiradi. Raketaning harakatlanishiga ergashib, butun e'tiboringizni markaziy nuqtaga qarating. Sizning ongingiz cheksiz imkoniyatlarga ega kiber-protsessordir!`
    ]
  },
  {
    id: 'cosmic_book_4',
    title: 'English Sci-Fi: The Andromeda Transmission',
    author: 'Captain Elena Vance (Starlight Archives)',
    category: 'English Reading & Vocabulary',
    totalPages: 2,
    totalWords: 340,
    currentPage: 0,
    currentWordIndex: 0,
    speedWpm: 260,
    bookmarks: [],
    uploadedAt: '2026-08-16T05:00:00.000Z',
    fileSize: '110 KB',
    coverGradient: 'from-amber-950 via-indigo-950 to-slate-950',
    isPreloaded: true,
    pages: [
      `The deep silence of interstellar space was interrupted by a rhythmic electromagnetic pulse coming from the Andromeda galaxy. Commander Sarah adjusted the quantum sensors aboard the Odyssey Starship. Every photon of light revealed secrets that had traveled across the universe for two million years. The crew gathered in the observation deck, observing the luminous spiral nebula dancing in the velvet void.`,
      `Knowledge is the ultimate shield of any cosmic civilization. As the starship accelerated to warp speed, space and time bent around the magnetic warp field. Stars stretched into radiant lines of pure azure energy. With every light year conquered, humanity proved that curiosity and disciplined perseverance can overcome any barrier in the infinite cosmos.`
    ]
  }
];
