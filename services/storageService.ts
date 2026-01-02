import { ThemeSettings, ReaderStyle, UserNote, UserBookmark } from '../types';

const KEYS = {
    SETTINGS: 'tanakh_settings',
    READER_STYLE: 'tanakh_reader_style',
    SEARCH_HISTORY: 'tanakh_search_history',
    NOTES: 'tanakh_user_notes',
    BOOKMARKS: 'tanakh_user_bookmarks',
    DARK_MODE: 'tanakh_dark_mode'
};

export interface SyncPackage {
    notes: UserNote[];
    bookmarks: UserBookmark[];
    history: string[];
    timestamp: number;
    deviceId: string;
}

export const storageService = {
    // Settings & Mode
    saveSettings: (settings: ThemeSettings) => localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings)),
    loadSettings: (): ThemeSettings | null => {
        const data = localStorage.getItem(KEYS.SETTINGS);
        return data ? JSON.parse(data) : null;
    },

    saveReaderStyle: (style: ReaderStyle) => localStorage.setItem(KEYS.READER_STYLE, JSON.stringify(style)),
    loadReaderStyle: (): ReaderStyle | null => {
        const data = localStorage.getItem(KEYS.READER_STYLE);
        return data ? JSON.parse(data) : null;
    },

    saveDarkMode: (isDark: boolean) => localStorage.setItem(KEYS.DARK_MODE, JSON.stringify(isDark)),
    loadDarkMode: (): boolean | null => {
        const data = localStorage.getItem(KEYS.DARK_MODE);
        return data ? JSON.parse(data) : null;
    },

    // Session State (Location, Language, ViewMode)
    saveLastLocation: (loc: { bookId: string, chapter: number, verse: number }) => localStorage.setItem('tanakh_last_location', JSON.stringify(loc)),
    loadLastLocation: (): { bookId: string, chapter: number, verse: number } | null => {
        const data = localStorage.getItem('tanakh_last_location');
        return data ? JSON.parse(data) : null;
    },

    saveLanguage: (lang: string) => localStorage.setItem('tanakh_language', lang),
    loadLanguage: (): string | null => localStorage.getItem('tanakh_language'),

    saveViewMode: (mode: string) => localStorage.setItem('tanakh_view_mode', mode),
    loadViewMode: (): string | null => localStorage.getItem('tanakh_view_mode'),

    // Search History
    saveSearchHistory: (history: string[]) => localStorage.setItem(KEYS.SEARCH_HISTORY, JSON.stringify(history)),
    loadSearchHistory: (): string[] => {
        const data = localStorage.getItem(KEYS.SEARCH_HISTORY);
        return data ? JSON.parse(data) : [];
    },

    // Notes
    saveNote: (note: UserNote) => {
        const notes = storageService.loadNotes();
        const existingIdx = notes.findIndex(n => n.id === note.id || (n.bookId === note.bookId && n.chapter === note.chapter && n.startVerse === note.startVerse));
        if (existingIdx > -1) {
            notes[existingIdx] = { ...note, updatedAt: Date.now() };
        } else {
            notes.push({ ...note, createdAt: note.createdAt || Date.now(), updatedAt: Date.now() });
        }
        localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
    },
    loadNotes: (): UserNote[] => {
        const data = localStorage.getItem(KEYS.NOTES);
        return data ? JSON.parse(data) : [];
    },
    deleteNote: (id: string) => {
        const notes = storageService.loadNotes().filter(n => n.id !== id);
        localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
    },

    // Bookmarks
    saveBookmark: (bookmark: UserBookmark) => {
        const bms = storageService.loadBookmarks();
        if (!bms.find(b => b.bookId === bookmark.bookId && b.chapter === bookmark.chapter && b.verse === bookmark.verse)) {
            bms.push(bookmark);
            localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bms));
        }
    },
    loadBookmarks: (): UserBookmark[] => {
        const data = localStorage.getItem(KEYS.BOOKMARKS);
        return data ? JSON.parse(data) : [];
    },
    deleteBookmark: (id: string) => {
        const bms = storageService.loadBookmarks().filter(b => b.id !== id);
        localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(bms));
    },

    // --- Sync Operations ---

    getSyncPackage: (): SyncPackage => {
        return {
            notes: storageService.loadNotes(),
            bookmarks: storageService.loadBookmarks(),
            history: storageService.loadSearchHistory(),
            timestamp: Date.now(),
            deviceId: navigator.userAgent.substring(0, 50)
        };
    },

    importSyncPackage: (pkg: SyncPackage) => {
        // 1. Merge Notes (latest updatedAt wins)
        const localNotes = storageService.loadNotes();
        const incomingNotes = pkg.notes || [];
        const mergedNotes = [...localNotes];

        incomingNotes.forEach(incoming => {
            const idx = mergedNotes.findIndex(n => n.id === incoming.id);
            if (idx === -1) {
                mergedNotes.push(incoming);
            } else if ((incoming.updatedAt || 0) > (mergedNotes[idx].updatedAt || 0)) {
                mergedNotes[idx] = incoming;
            }
        });
        localStorage.setItem(KEYS.NOTES, JSON.stringify(mergedNotes));

        // 2. Merge Bookmarks (Set-like behavior)
        const localBms = storageService.loadBookmarks();
        const incomingBms = pkg.bookmarks || [];
        const mergedBms = [...localBms];
        incomingBms.forEach(incoming => {
            if (!mergedBms.find(b => b.id === incoming.id)) {
                mergedBms.push(incoming);
            }
        });
        localStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(mergedBms));

        // 3. Merge History
        const localHistory = storageService.loadSearchHistory();
        const incomingHistory = pkg.history || [];
        const mergedHistory = Array.from(new Set([...localHistory, ...incomingHistory])).slice(0, 20);
        storageService.saveSearchHistory(mergedHistory);

        return true;
    }
};