
export enum BibleSection {
    Torah = 'תורה',
    Nevim = 'נביאים',
    Ketuvim = 'כתובים'
}

export interface BibleBook {
    id: string;
    name: string;
    section: BibleSection;
    chaptersCount: number;
}

export interface Verse {
    book: string;
    chapter: number;
    verse: number;
    text: string;
}

export interface SearchResult {
    bookId: string;
    chapter: number;
    verse: number;
    text: string;
    occurrenceIndex: number;
    elsSkip?: number;
    elsComponents?: {
        bookId: string;
        chapter: number;
        verse: number;
        letterIdx: number;
        groupId: number;
    }[];
}

export enum GematriaMethod {
    Standard = 'רגיל',
    MisparKatan = 'מספר קטן',
    MisparGadol = 'מספר גדול',
    Siduri = 'מספר סידורי',
    Atbash = 'אתב"ש'
}

export interface ReaderStyle {
    fontFamily: string;
    fontSize: number;
    showNikud: boolean;
    showVerseNumbers: boolean;
    showChapterHeaders: boolean;
    lineHeight: number;
    verseSpacing: number;
    textAlign: 'right' | 'justify';
    isContinuous: boolean;
}

export type Language = 'he' | 'en' | 'fr';

export type ViewMode = '2D' | '3D' | 'Matrix';

export interface ParashaRef {
    bookId: string;
    chapter: number;
    verse: number;
}

export interface ParashaData {
    name: string;
    hebrewName: string;
    ref: ParashaRef;
    endRef: ParashaRef;
    date: string;
    hebrewDate: string;
    summary?: string;
    shabbatTimes?: {
        candles: string;
        havdalah: string;
    };
}

export interface ThemeColors {
    bgMain: string;
    bgPaper: string;
    textMain: string;
    textSecondary: string;
    accent: string;
}

export interface ThemeSettings {
    light: ThemeColors;
    dark: ThemeColors;
}

export interface ThemeProfile {
    id: string;
    labelKey: string;
    isDark: boolean;
    bgMain: string;
    bgPaper: string;
    textMain: string;
    textSecondary: string;
    border: string;
    accent: string;
    uiBg: string;
    hover: string;
}

// Library Types - Enhanced as requested
export interface UserNote {
    id: string;
    bookId: string;
    chapter: number;
    startVerse: number;
    endVerse?: number;
    selectedText: string;
    text: string; // The personal comment
    creatorName: string;
    createdAt: number;
    updatedAt: number;
    globalLetterStart: number;
}

export interface UserBookmark {
    id: string;
    bookId: string;
    chapter: number;
    verse: number;
    title: string;
    createdAt: number;
}
