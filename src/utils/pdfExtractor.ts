import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  try {
    // Set standard worker URL
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
  } catch (e) {
    console.warn("PDF worker configuration note:", e);
  }
}

export interface ExtractedBookData {
  title: string;
  pages: string[];
  totalPages: number;
  totalWords: number;
  fileSize: string;
}

export interface ParsedWord {
  id: string;
  word: string;
  cleanWord: string;
  orpIndex: number; // Optimal Recognition Point index for RSVP
  sentenceIndex: number;
}

/**
 * Format bytes into readable string (KB, MB)
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Clean text to remove robotic artifacts, multiple breaks, or unwanted symbols
 */
export function cleanCosmicText(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Calculate Optimal Recognition Point (ORP) for RSVP speed reading.
 * Science shows human eyes fixate slightly to the left of center for fastest word processing.
 */
export function calculateORP(word: string): number {
  const len = word.length;
  if (len <= 1) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
}

/**
 * Parse text into structured words with ORP metadata
 */
export function parseWordsWithMetadata(text: string): ParsedWord[] {
  if (!text) return [];

  // Match words and whitespace
  const rawWords = text.trim().split(/\s+/).filter(w => w.length > 0);
  let sentenceCount = 0;

  return rawWords.map((word, idx) => {
    const cleanWord = word.replace(/^[^\w\u0400-\u04FF\u00C0-\u024F]+|[^\w\u0400-\u04FF\u00C0-\u024F]+$/g, '');
    const orpIndex = calculateORP(cleanWord || word);
    
    if (/[.!?]$/.test(word)) {
      sentenceCount++;
    }

    return {
      id: `w_${idx}_${word.slice(0, 4)}`,
      word,
      cleanWord,
      orpIndex,
      sentenceIndex: sentenceCount,
    };
  });
}

/**
 * Extract full content from an uploaded PDF File
 */
export async function extractPdfContent(
  file: File,
  onProgress?: (loadedPages: number, totalPages: number) => void
): Promise<ExtractedBookData> {
  const arrayBuffer = await file.arrayBuffer();
  
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useWorkerFetch: true,
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  const pagesText: string[] = [];
  let totalWordCount = 0;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    try {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageStrings: string[] = [];
      let lastY: number | null = null;

      for (const item of textContent.items as any[]) {
        if ('str' in item) {
          // If vertical line position changed significantly, add newline
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            pageStrings.push('\n');
          }
          pageStrings.push(item.str + ' ');
          lastY = item.transform[5];
        }
      }

      const rawPageText = pageStrings.join('').replace(/ +/g, ' ');
      const cleaned = cleanCosmicText(rawPageText);
      const finalPageText = cleaned || `[${pageNum}-sahifada matn aniqlanmadi (chizma yoki rasm bo'lishi mumkin)]`;
      
      pagesText.push(finalPageText);
      
      const wordsInPage = finalPageText.split(/\s+/).filter(Boolean).length;
      totalWordCount += wordsInPage;

      if (onProgress) {
        onProgress(pageNum, numPages);
      }
    } catch (pageErr) {
      console.warn(`Error extracting page ${pageNum}:`, pageErr);
      pagesText.push(`[${pageNum}-sahifani o'qishda xatolik yuz berdi]`);
    }
  }

  const cleanTitle = file.name.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ');

  return {
    title: cleanTitle,
    pages: pagesText.length > 0 ? pagesText : ["Matn topilmadi"],
    totalPages: numPages,
    totalWords: totalWordCount,
    fileSize: formatFileSize(file.size),
  };
}

/**
 * Extract plain text / Markdown / TXT File
 */
export async function extractTextFileContent(file: File): Promise<ExtractedBookData> {
  const rawText = await file.text();
  const cleaned = cleanCosmicText(rawText);
  
  // Split into virtual pages (~400 words per page for comfortable reading)
  const allWords = cleaned.split(/\s+/).filter(Boolean);
  const wordsPerPage = 350;
  const pages: string[] = [];

  for (let i = 0; i < allWords.length; i += wordsPerPage) {
    const pageChunk = allWords.slice(i, i + wordsPerPage).join(' ');
    pages.push(pageChunk);
  }

  if (pages.length === 0) {
    pages.push(cleaned || "Faylda matn mavjud emas.");
  }

  const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

  return {
    title: cleanTitle,
    pages,
    totalPages: pages.length,
    totalWords: allWords.length,
    fileSize: formatFileSize(file.size),
  };
}
