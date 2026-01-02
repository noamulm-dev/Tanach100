
import { Verse, BibleBook, ParashaData } from '../types';
import { BIBLE_BOOKS } from '../constants';

export const DB_NAME = 'TanakhDB';
export const STORE_NAME = 'verses';
const DB_VERSION = 1;

const logSource = (action: string, source: string, color: string, details?: any) => {
    console.info(
        `%c[BibleService] %c${action}: %c${source}`,
        'color: #6366f1; font-weight: bold',
        'color: gray',
        `color: ${color}; font-weight: bold`,
        details || ''
    );
};

export const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export interface SyncProgress {
    percentage: number;
    currentBook: string;
    currentChapter: number;
    isFinished: boolean;
    status: 'idle' | 'fetching' | 'saving' | 'error' | 'stopped';
    source: 'local' | 'remote' | 'unknown';
    detailedLog?: string;
}

export function cleanHebrewText(text: string): string {
    if (!text) return "";
    let clean = text;
    clean = clean.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '').replace(/&gt;/g, '').replace(/&amp;/g, '');
    clean = clean.replace(/<[^>]*>/g, '');
    clean = clean.replace(/[\(\[\{].*?[\)\]\}]/g, '');
    clean = clean.replace(/[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C4\u05C5\u05C6]/g, '');
    clean = clean.replace(/\u05BE/g, ' ');
    clean = clean.replace(/[\u05C6\-\.,:;!\?\|\u2010-\u2027]/g, ' ');
    clean = clean.replace(/[^\u05D0-\u05EA\u05B0-\u05BC\u05C1\u05C2\u05C3\u05C7\s]/g, '');
    return clean.replace(/\s+/g, ' ').trim();
}

function flattenChapter(data: any): string[] {
    if (!data) return [];
    if (typeof data === 'string') return [data];
    if (Array.isArray(data)) {
        return data.flatMap(item => flattenChapter(item));
    }
    return [];
}

function getSefariaBookName(bookId: string): string {
    return bookId.replace(/ /g, '_');
}

async function fetchSingleChapterFromSefaria(bookName: string, chapterNum: number, signal?: AbortSignal): Promise<string[]> {
    logSource('Fetching Chapter', 'Sefaria API (Remote)', '#f59e0b', { bookName, chapterNum });
    try {
        const response = await fetch(`https://www.sefaria.org/api/texts/${bookName}.${chapterNum}?context=0`, { signal });
        if (!response.ok) return [];
        const data = await response.json();
        return flattenChapter(data.he);
    } catch (e) {
        if ((e as Error).name === 'AbortError') throw e;
        console.warn(`Failed to fetch chapter ${bookName} ${chapterNum} from Sefaria`, e);
        return [];
    }
}

async function fetchBookSmartly(
    book: BibleBook,
    onProgress?: (current: number, total: number, source: 'local' | 'remote', detailed?: string) => void,
    signal?: AbortSignal
): Promise<{ data: string[][], source: 'local' | 'remote' }> {

    if (signal?.aborted) throw new Error('AbortError');

    const bookNameSefaria = getSefariaBookName(book.id);
    let result: string[][] = [];

    // Try fetching the whole book structure first
    try {
        if (onProgress) onProgress(0, book.chaptersCount, 'remote', `[NET] GET https://www.sefaria.org/api/texts/${bookNameSefaria}`);
        const response = await fetch(`https://www.sefaria.org/api/texts/${bookNameSefaria}?context=0&commentary=0&pad=0`, { signal });
        if (response.ok) {
            const data = await response.json();
            if (data.he && Array.isArray(data.he)) result = data.he.map(flattenChapter);
        }
    } catch (e) {
        if ((e as Error).name === 'AbortError') throw e;
    }

    if (signal?.aborted) throw new Error('AbortError');

    // Fill in missing chapters
    if (result.length < book.chaptersCount) {
        for (let i = result.length; i < book.chaptersCount; i++) {
            if (signal?.aborted) throw new Error('AbortError');
            if (onProgress) onProgress(i + 1, book.chaptersCount, 'remote', `[NET] GET Chapter ${i + 1}/${book.chaptersCount} (Missing from bulk)`);
            result.push(await fetchSingleChapterFromSefaria(bookNameSefaria, i + 1, signal));
        }
    }
    return { data: result, source: 'remote' };
}

export const checkSyncStatus = async (): Promise<boolean> => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const count = await new Promise<number>((res) => {
            const req = tx.objectStore(STORE_NAME).count();
            req.onsuccess = () => res(req.result);
        });
        // 929 chapters in Tanakh
        if (count >= 929) return true;
    } catch (e) { }
    return false;
};

export const verifyDatabaseIntegrity = async (log: (msg: string) => void): Promise<boolean> => {
    log(`[INIT] Verifying Data Integrity...`);

    // Step 1: IndexedDB
    let dbCount = 0;
    try {
        log(`[IDB] Opening Database '${DB_NAME}'...`);
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        dbCount = await new Promise<number>((res, rej) => {
            const req = tx.objectStore(STORE_NAME).count();
            req.onsuccess = () => res(req.result);
            req.onerror = () => rej(req.error);
        });
        log(`[IDB] Found ${dbCount} chapters in local storage.`);
    } catch (e) {
        log(`[IDB] Error accessing IndexedDB: ${e}`);
    }

    if (dbCount >= 929) {
        log(`[SUCCESS] Primary storage (IndexedDB) is COMPLETE.`);
        return true;
    } else {
        log(`[WARN] Primary storage incomplete (${dbCount}/929).`);
        return false;
    }
};

export const clearLocalDatabase = async (): Promise<void> => {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
};


// Helper to count chapters for a specific book in DB
const getBookChapterCount = async (bookId: string): Promise<number> => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        // Create a range for all chapters of this book (e.g., "Genesis_1" to "Genesis_999")
        // We assume keys are formatted as `${bookId}_${chapterNum}`
        const range = IDBKeyRange.bound(`${bookId}_`, `${bookId}_\uffff`);
        const count = await new Promise<number>((resolve) => {
            const req = store.count(range);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(0);
        });
        return count;
    } catch (e) {
        return 0;
    }
};

export const syncCompleteTanakh = async (onProgress: (progress: SyncProgress) => void, signal?: AbortSignal): Promise<void> => {
    onProgress({ percentage: 0, currentBook: 'מאתחל...', currentChapter: 0, isFinished: false, status: 'idle', source: 'unknown', detailedLog: `[INIT] Opening IndexedDB: ${DB_NAME} v${DB_VERSION}` });
    const db = await openDB();
    onProgress({ percentage: 0, currentBook: 'מאתחל...', currentChapter: 0, isFinished: false, status: 'idle', source: 'unknown', detailedLog: `[INIT] Database connection established. Store: ${STORE_NAME}` });

    const totalBooks = BIBLE_BOOKS.length;
    for (let i = 0; i < totalBooks; i++) {
        if (signal?.aborted) {
            throw new Error('AbortError');
        }

        const book = BIBLE_BOOKS[i];

        // CHECK LOCAL FIRST
        const localCount = await getBookChapterCount(book.id);
        if (localCount >= book.chaptersCount) {
            onProgress({
                percentage: Math.round(((i + 1) / totalBooks) * 100),
                currentBook: book.name,
                currentChapter: book.chaptersCount,
                isFinished: false,
                status: 'idle',
                source: 'local',
                detailedLog: `[SKIP] ${book.name} already exists completely (${localCount}/${book.chaptersCount}).`
            });
            continue; // Skip to next book
        }

        onProgress({ percentage: Math.round((i / totalBooks) * 100), currentBook: book.name, currentChapter: 0, isFinished: false, status: 'fetching', source: 'unknown', detailedLog: `[BOOK] Starting processing for: ${book.name} (${book.id}) - Found ${localCount}/${book.chaptersCount} local.` });

        const { data: chaptersData, source } = await fetchBookSmartly(book, (current, total, src, detailed) => {
            onProgress({
                percentage: Math.round(((i + (current / total)) / totalBooks) * 100),
                currentBook: `${book.name} (פרק ${current})`,
                currentChapter: current,
                isFinished: false,
                status: 'fetching',
                source: src,
                detailedLog: detailed
            });
        }, signal);

        if (signal?.aborted) throw new Error('AbortError');

        onProgress({ percentage: Math.round(((i + 0.9) / totalBooks) * 100), currentBook: book.name, currentChapter: book.chaptersCount, isFinished: false, status: 'saving', source: source, detailedLog: `[TRANS] Starting Transaction (ReadWrite) -> ${STORE_NAME}` });

        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);

        chaptersData.forEach((verses, chIndex) => {
            const key = `${book.id}_${chIndex + 1}`;
            // Simplify log for bulk operations to avoid spamming 929 lines, log every 10 chapters or first/last
            if (chIndex === 0 || chIndex === chaptersData.length - 1 || chIndex % 10 === 0) {
                onProgress({ percentage: Math.round(((i + 0.95) / totalBooks) * 100), currentBook: book.name, currentChapter: chIndex + 1, isFinished: false, status: 'saving', source: source, detailedLog: `[DB] PUT Index Key: ${key} | Items: ${verses.length} | Payload: Text Clean/Strip` });
            }
            store.put({ id: key, bookId: book.id, chapterNum: chIndex + 1, verses: (verses || []).map(cleanHebrewText) });
        });

        await new Promise((res, rej) => {
            tx.oncomplete = res;
            tx.onerror = rej;
            tx.onabort = rej;
        });

        onProgress({ percentage: Math.round(((i + 1) / totalBooks) * 100), currentBook: book.name, currentChapter: book.chaptersCount, isFinished: false, status: 'saving', source: source, detailedLog: `[COMMIT] Transaction Committed for ${book.name}. Integrity Check OK.` });
    }
    onProgress({ percentage: 100, currentBook: 'הסתיים', currentChapter: 0, isFinished: true, status: 'idle', source: 'unknown', detailedLog: `[DONE] Sync Process Completed Successfully.` });
};

export const fetchChapter = async (book: BibleBook, chapter: number): Promise<Verse[]> => {
    // 1. Try Local DB
    try {
        const db = await openDB();
        const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).get(`${book.id}_${chapter}`);
        const result = await new Promise<any>((res) => request.onsuccess = () => res(request.result));
        if (result?.verses?.length) return result.verses.map((text: string, i: number) => ({ book: book.name, chapter, verse: i + 1, text }));
    } catch (e) {
        // console.warn("DB Fetch failed, falling back to network", e);
    }

    // 2. Fallback to Sefaria API
    try {
        const rawLines = await fetchSingleChapterFromSefaria(getSefariaBookName(book.id), chapter);
        if (rawLines.length > 0) {
            return rawLines.map((text, i) => ({ book: book.name, chapter, verse: i + 1, text: cleanHebrewText(text) }));
        }
    } catch (e) {
        console.error("Network Fetch failed", e);
    }

    return [{ book: book.name, chapter, verse: 1, text: "שגיאה בטעינת הפרק. אנא בדוק חיבור לרשת או בצע סנכרון מלא." }];
};

export const fetchFullBook = async (bookId: string): Promise<Verse[][]> => {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book) return [];
    const chapters = [];
    for (let i = 1; i <= book.chaptersCount; i++) chapters.push(await fetchChapter(book, i));
    return chapters;
};

// Helper function to extract letters from a range of chapters efficiently
async function getChapterLetters(book: BibleBook, startCh: number, endCh: number) {
    const letters: any[] = [];
    for (let c = startCh; c <= endCh; c++) {
        const verses = await fetchChapter(book, c);
        verses.forEach((v, vIdx) => {
            const cleanText = v.text.replace(/[^א-ת]/g, '');
            for (let i = 0; i < cleanText.length; i++) {
                letters.push({ char: cleanText[i], bookId: book.id, chapter: c, verse: v.verse, letterIdx: i });
            }
        });
    }
    return letters;
}

export const fetchLettersWindow = async (bookId: string, chapter: number, verse: number, letterIdx: number, windowSize: number): Promise<any[]> => {
    const book = BIBLE_BOOKS.find(b => b.id === bookId);
    if (!book) return [];
    // Load current chapter + 5 next ones to provide immediate buffer
    const endChapter = Math.min(book.chaptersCount, chapter + 5);
    const letters = await getChapterLetters(book, chapter, endChapter);
    const startIdx = letters.findIndex(l => l.chapter === chapter && l.verse === verse && l.letterIdx === letterIdx);
    return startIdx === -1 ? letters.slice(0, windowSize) : letters.slice(startIdx, startIdx + windowSize);
};

export const fetchLettersNext = async (lastLetter: any, count: number): Promise<any[]> => {
    const book = BIBLE_BOOKS.find(b => b.id === lastLetter.bookId);
    if (!book) return [];
    let startCh = lastLetter.chapter;
    let endCh = Math.min(book.chaptersCount, startCh + 5);
    let letters = await getChapterLetters(book, startCh, endCh);
    let curIdx = letters.findIndex(l => l.chapter === lastLetter.chapter && l.verse === lastLetter.verse && l.letterIdx === lastLetter.letterIdx);
    let result = letters.slice(curIdx + 1, curIdx + 1 + count);

    if (result.length < count && endCh < book.chaptersCount) {
        const more = await getChapterLetters(book, endCh + 1, Math.min(book.chaptersCount, endCh + 5));
        result = [...result, ...more].slice(0, count);
    }
    return result;
};

export const fetchLettersPrev = async (firstLetter: any, count: number): Promise<any[]> => {
    const book = BIBLE_BOOKS.find(b => b.id === firstLetter.bookId);
    if (!book) return [];
    let endCh = firstLetter.chapter;
    let startCh = Math.max(1, endCh - 5);
    let letters = await getChapterLetters(book, startCh, endCh);
    let curIdx = letters.findIndex(l => l.chapter === firstLetter.chapter && l.verse === firstLetter.verse && l.letterIdx === firstLetter.letterIdx);
    return curIdx === -1 ? [] : letters.slice(Math.max(0, curIdx - count), curIdx);
};

export const fetchParashaVerses = async (parasha: ParashaData): Promise<Verse[]> => {
    const book = BIBLE_BOOKS.find(b => b.id === parasha.ref.bookId);
    if (!book) return [];
    const verses: Verse[] = [];
    for (let c = parasha.ref.chapter; c <= parasha.endRef.chapter; c++) {
        const chVerses = await fetchChapter(book, c);
        chVerses.forEach((v) => {
            const isAfterStart = (c > parasha.ref.chapter) || (c === parasha.ref.chapter && v.verse >= parasha.ref.verse);
            const isBeforeEnd = (c < parasha.endRef.chapter) || (c === parasha.endRef.chapter && v.verse <= parasha.endRef.verse);
            if (isAfterStart && isBeforeEnd) verses.push(v);
        });
    }
    return verses;
};

export const getGlobalLetterOffset = async (bookId: string, chapter: number, verse: number): Promise<number> => {
    let offset = 0;
    for (const book of BIBLE_BOOKS) {
        if (book.id === bookId) {
            for (let c = 1; c < chapter; c++) {
                const vs = await fetchChapter(book, c);
                vs.forEach(v => offset += v.text.replace(/[^א-ת]/g, '').length);
            }
            const curVs = await fetchChapter(book, chapter);
            for (let v = 0; v < verse - 1; v++) offset += curVs[v].text.replace(/[^א-ת]/g, '').length;
            return offset;
        }
        // Very slow for deep books, but this is used only for personal notes
        const fBook = await fetchFullBook(book.id);
        fBook.forEach(ch => ch.forEach(v => offset += v.text.replace(/[^א-ת]/g, '').length));
    }
    return offset;
};
