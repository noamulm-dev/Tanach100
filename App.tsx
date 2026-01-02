
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BIBLE_BOOKS } from './constants';
import { BibleBook, ReaderStyle, ThemeSettings, ThemeProfile, ParashaData, ViewMode, SearchResult, UserNote, UserBookmark } from './types';
import BibleReader, { BibleReaderHandle } from './components/BibleReader';
import GematriaTools from './components/GematriaTools';
import SyncManager from './components/SyncManager';
import HelpScreen from './components/HelpScreen';
import SettingsModal from './components/SettingsModal';
import BookSelectionModal from './components/BookSelectionModal';
import AppHeader from './components/AppHeader';
import MainMenu from './components/MainMenu';
import TTSPanel from './components/TTSPanel';
import ParashaSummaryModal from './components/ParashaSummaryModal';
import DeveloperPage from './components/DeveloperPage';
import ThreeDVisualizer from './components/ThreeDVisualizer';
import MatrixVisualizer from './components/MatrixVisualizer';
import SearchPanel from './components/SearchPanel';
import LibraryView from './components/LibraryView';
import NoteEditorModal from './components/NoteEditorModal';
import { checkSyncStatus } from './services/bibleService';
import { searchGlobal } from './services/searchService';
import { fetchCurrentParasha } from './services/parashaService';
import { storageService } from './services/storageService';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const DEFAULT_THEME_SETTINGS: ThemeSettings = {
    light: { bgMain: '#ffffff', bgPaper: '#fffbf0', textMain: '#0f1745', textSecondary: '#64748b', accent: '#4338ca' },
    dark: { bgMain: '#020617', bgPaper: '#0f172a', textMain: '#f1f5f9', textSecondary: '#94a3b8', accent: '#818cf8' }
};

const AppContent: React.FC = () => {
    const { t, dir } = useLanguage();
    const [activeTab, setActiveTab] = useState<'reader' | 'gematria' | 'settings' | 'help' | 'library'>('reader');

    // Load persisted state
    const [viewMode, setViewModeState] = useState<ViewMode>(() => (storageService.loadViewMode() as ViewMode) || '2D');

    const [selectedBook, setSelectedBook] = useState<BibleBook | null>(() => {
        const saved = storageService.loadLastLocation();
        if (saved) return BIBLE_BOOKS.find(b => b.id === saved.bookId) || BIBLE_BOOKS[0];
        return BIBLE_BOOKS[0];
    });

    const [selectedChapter, setSelectedChapter] = useState(() => storageService.loadLastLocation()?.chapter || 1);
    const [currentVerse, setCurrentVerse] = useState(() => storageService.loadLastLocation()?.verse || 1);

    // Wrappers to save state on change
    const setViewMode = (mode: ViewMode) => {
        setViewModeState(mode);
        storageService.saveViewMode(mode);
    };

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isBookModalOpen, setIsBookModalOpen] = useState(false);
    const [isSynced, setIsSynced] = useState(false);
    const [autoStartSync, setAutoStartSync] = useState(false);
    const [isDevPageOpen, setIsDevPageOpen] = useState(false);

    const [currentParasha, setCurrentParasha] = useState<ParashaData | null>(null);
    const [isParashaModalOpen, setIsParashaModalOpen] = useState(false);

    // Local Library State
    const [activeNoteRef, setActiveNoteRef] = useState<{ bookId: string, chapter: number, startVerse: number, endVerse?: number, selectedText?: string } | null>(null);

    const [isDarkMode, setIsDarkMode] = useState(() => storageService.loadDarkMode() ?? false);
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => storageService.loadSettings() ?? DEFAULT_THEME_SETTINGS);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);
    const [searchWholeWord, setSearchWholeWord] = useState(false);
    const [searchScope, setSearchScope] = useState<'current' | 'torah' | 'tanakh'>('current');
    const [isSearchPanelExpanded, setIsSearchPanelExpanded] = useState(true);
    const [lastSearchTerm, setLastSearchTerm] = useState('');
    const [isRegularSearchActive, setIsRegularSearchActive] = useState(true);

    const currentModeColors = isDarkMode ? themeSettings.dark : themeSettings.light;
    const themeStyles = {
        '--color-bg-main': currentModeColors.bgMain,
        '--color-bg-paper': currentModeColors.bgPaper,
        '--color-text-main': currentModeColors.textMain,
        '--color-text-secondary': currentModeColors.textSecondary,
        '--color-accent': currentModeColors.accent,
    } as React.CSSProperties;

    const activeTheme: ThemeProfile = {
        id: 'custom', labelKey: 'custom', isDark: isDarkMode,
        bgMain: 'bg-[var(--color-bg-main)]', bgPaper: 'bg-[var(--color-bg-paper)]',
        textMain: 'text-[var(--color-text-main)]', textSecondary: 'text-[var(--color-text-secondary)]',
        border: 'border-[var(--color-text-secondary)]/20', accent: 'text-[var(--color-accent)]',
        uiBg: 'bg-[var(--color-bg-paper)]', hover: 'hover:bg-[var(--color-text-secondary)]/10'
    };

    const [isTTSPanelOpen, setIsTTSPanelOpen] = useState(false);
    const [isTTSActive, setIsTTSActive] = useState(false);
    const [ttsSpeed, setTtsSpeed] = useState(0.9);
    const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');

    const [gematriaInitialText, setGematriaInitialText] = useState('');
    const bibleReaderRef = useRef<BibleReaderHandle>(null);

    // Scroll Signal State to handle reliable scrolling
    const [scrollSignal, setScrollSignal] = useState<{ ts: number, chapter: number, verse: number } | null>(null);

    const [readerStyle, setReaderStyle] = useState<ReaderStyle>(() => storageService.loadReaderStyle() ?? {
        fontFamily: 'Frank Ruhl Libre',
        fontSize: 1.0,
        showNikud: true,
        showVerseNumbers: true,
        showChapterHeaders: true,
        lineHeight: 1.6,
        verseSpacing: 0.5,
        textAlign: 'right',
        isContinuous: false
    });

    const refreshSyncStatus = useCallback(async () => {
        const status = await checkSyncStatus();
        setIsSynced(status);
        return status;
    }, []);

    useEffect(() => {
        const init = async () => {
            const status = await refreshSyncStatus();
            if (!status) {
                setAutoStartSync(true);
                setActiveTab('settings');
            }
            fetchCurrentParasha().then(parasha => {
                if (parasha) setCurrentParasha(parasha);
            });
        };
        init();
    }, [refreshSyncStatus]);

    useEffect(() => {
        if (isDarkMode) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        storageService.saveDarkMode(isDarkMode);
    }, [isDarkMode]);

    useEffect(() => storageService.saveSettings(themeSettings), [themeSettings]);
    useEffect(() => storageService.saveReaderStyle(readerStyle), [readerStyle]);

    useEffect(() => {
        if (selectedBook) {
            storageService.saveLastLocation({
                bookId: selectedBook.id,
                chapter: selectedChapter,
                verse: currentVerse
            });
        }
    }, [selectedBook, selectedChapter, currentVerse]);

    useEffect(() => {
        const setAppHeight = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight * 0.01}px`);
        setAppHeight();
        window.addEventListener('resize', setAppHeight);
        return () => window.removeEventListener('resize', setAppHeight);
    }, []);

    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            const hebrewVoices = voices.filter(v => v.lang.toLowerCase().includes('he') || v.lang.toLowerCase().includes('iw'));
            setAvailableVoices(hebrewVoices);
            if (hebrewVoices.length > 0 && !selectedVoiceURI) {
                const preferred = hebrewVoices.find(v => v.name.includes('Google') || v.name.includes('Microsoft')) || hebrewVoices[0];
                setSelectedVoiceURI(preferred.voiceURI);
            }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    const toggleTTSPanel = () => { setIsTTSPanelOpen(!isTTSPanelOpen); setIsMenuOpen(false); };

    const handlePlayPause = () => {
        if (!bibleReaderRef.current) return;
        if (isTTSActive) {
            bibleReaderRef.current.pause();
            setIsTTSActive(false);
        } else {
            if (selectedVoiceURI) bibleReaderRef.current.setVoice(selectedVoiceURI);
            bibleReaderRef.current.setSpeed(ttsSpeed);
            bibleReaderRef.current.play();
            setIsTTSActive(true);
        }
    };

    const handleStop = () => {
        if (!bibleReaderRef.current) return;
        bibleReaderRef.current.stop();
        setIsTTSActive(false);
    };

    const changeSpeed = (delta: number) => {
        const nextSpeed = parseFloat((ttsSpeed + delta).toFixed(2));
        const newSpeed = Math.max(0.5, Math.min(3.0, nextSpeed));
        setTtsSpeed(newSpeed);
        if (bibleReaderRef.current) bibleReaderRef.current.setSpeed(newSpeed);
    };

    const changeVoice = (voiceURI: string) => {
        setSelectedVoiceURI(voiceURI);
        if (bibleReaderRef.current) bibleReaderRef.current.setVoice(voiceURI);
    };

    const handleBookSelect = (book: BibleBook, chapter: number = 1, verse: number = 1) => {
        setSelectedBook(book);
        setSelectedChapter(chapter);
        setCurrentVerse(verse);
        // Dispatch scroll signal when selecting directly from modal
        setScrollSignal({ ts: Date.now(), chapter, verse });
    };

    const handleJumpToParasha = () => {
        if (!currentParasha) return;
        setIsParashaModalOpen(true);
    };

    const executeSearch = async (forceNew: boolean = false, queryOverride?: string) => {
        const effectiveQuery = (queryOverride ?? searchQuery).trim();
        if (!forceNew && effectiveQuery === lastSearchTerm && searchResults.length > 0) {
            const nextIndex = (currentResultIndex + 1) % searchResults.length;
            setCurrentResultIndex(nextIndex);
            scrollToResult(searchResults[nextIndex]);
            return;
        }
        if (!effectiveQuery) {
            // User cleared the search: Clear results and highlights, but stay in place.
            setSearchResults([]);
            setCurrentResultIndex(-1);
            setLastSearchTerm('');
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        try {
            const { results, regularSearchEnabled } = await searchGlobal(effectiveQuery, searchWholeWord, searchScope, selectedBook?.id || '');
            setIsRegularSearchActive(regularSearchEnabled);

            // Always update lastSearchTerm when search executes, so reader highlights match the executed search (or clear if empty)
            setLastSearchTerm(effectiveQuery);

            if (results.length > 0) {
                setSearchResults(results);
                setCurrentResultIndex(0);
                scrollToResult(results[0]);
            } else {
                setSearchResults([]);
                setCurrentResultIndex(-1);
                if (!forceNew) alert(t('no_results'));
            }
        } catch (error) { console.error(error); } finally { setIsSearching(false); }
    };

    // Re-run search when scope or whole-word setting changes
    useEffect(() => {
        if (searchQuery.trim().length > 0 && lastSearchTerm.length > 0) {
            executeSearch(true);
        }
    }, [searchScope, searchWholeWord]);

    const handleSearchRequest = (text: string) => {
        setSearchQuery(text);
        executeSearch(true, text);
        setIsSearchPanelExpanded(true);
    };

    const scrollToResult = (result: { bookId: string, chapter: number, verse: number }) => {
        if (!result) return;
        if (result.bookId !== selectedBook?.id) {
            const newBook = BIBLE_BOOKS.find(b => b.id === result.bookId);
            if (newBook) {
                setSelectedBook(newBook);
                setSelectedChapter(result.chapter);
                setCurrentVerse(result.verse);
                // When book changes, we need to wait for load, so we send the signal
                setScrollSignal({ ts: Date.now(), chapter: result.chapter, verse: result.verse });
                return;
            }
        }
        // Same book, just update state and signal
        setSelectedChapter(result.chapter);
        setCurrentVerse(result.verse);
        setScrollSignal({ ts: Date.now(), chapter: result.chapter, verse: result.verse });
        setActiveTab('reader');
    };

    const renderReaderContent = () => {
        if (!selectedBook) return null;
        if (viewMode === '2D') {
            return (
                <BibleReader
                    ref={bibleReaderRef} selectedBook={selectedBook} selectedChapter={selectedChapter}
                    onBookChange={handleBookSelect} onChapterChange={setSelectedChapter} onVerseChange={setCurrentVerse}
                    readerStyle={readerStyle} onStyleChange={setReaderStyle} activeTheme={activeTheme} isDarkMode={isDarkMode}
                    onNavigateToGematria={(text) => { setGematriaInitialText(text); setActiveTab('gematria'); }}
                    activeParasha={currentParasha}
                    onOpenParashaSummary={() => setIsParashaModalOpen(true)}
                    searchResults={searchResults}
                    activeResult={searchResults[currentResultIndex] || null} // Pass active result
                    searchQuery={lastSearchTerm} // Pass lastSearchTerm instead of live searchQuery to avoid auto-highlighting
                    searchWholeWord={searchWholeWord}
                    isRegularSearchActive={isRegularSearchActive}
                    onAddNote={(bookId, chapter, verse) => {
                        const selection = window.getSelection()?.toString();
                        setActiveNoteRef({ bookId, chapter, startVerse: verse, selectedText: selection || undefined });
                    }}
                    onAddBookmark={(bookId, chapter, verse) => storageService.saveBookmark({
                        id: Date.now().toString(), bookId, chapter, verse, title: `${t(bookId)} ${chapter}:${verse}`, createdAt: Date.now()
                    })}
                    onSearchRequest={handleSearchRequest}
                    scrollSignal={scrollSignal} // Pass the signal to reader
                />
            );
        } else if (viewMode === '3D') {
            return <ThreeDVisualizer isDarkMode={isDarkMode} onClose={() => setViewMode('2D')} currentContext={{ bookId: selectedBook.id, chapter: selectedChapter, verse: currentVerse }} searchResults={searchResults} activeResult={searchResults[currentResultIndex] || null} />;
        } else if (viewMode === 'Matrix') {
            return <MatrixVisualizer isDarkMode={isDarkMode} onClose={() => setViewMode('2D')} currentContext={{ bookId: selectedBook.id, chapter: selectedChapter, verse: currentVerse }} searchResults={searchResults} activeResult={searchResults[currentResultIndex] || null} />;
        }
        return null;
        return null;
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'reader': return renderReaderContent();
            case 'gematria': return <GematriaTools initialText={gematriaInitialText} onClose={() => setActiveTab('reader')} activeTheme={activeTheme} />;
            case 'settings': return <SyncManager onSyncComplete={refreshSyncStatus} onClose={() => { setActiveTab('reader'); setAutoStartSync(false); }} autoStart={autoStartSync} />;
            case 'help': return <HelpScreen onClose={() => setActiveTab('reader')} />;
            case 'library': return <LibraryView activeTheme={activeTheme} isDarkMode={isDarkMode} onJump={scrollToResult} onClose={() => setActiveTab('reader')} />;
            default: return null;
        }
    };

    return (
        <div className={`fixed top-0 w-full flex flex-col bg-[var(--color-bg-main)] text-[var(--color-text-main)]`} dir={dir} style={{ ...themeStyles, height: 'calc(var(--app-height, 1vh) * 100)' }}>
            {activeTab !== 'gematria' && activeTab !== 'help' && (
                <AppHeader
                    isReaderMode={activeTab === 'reader'} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                    toggleTTSPanel={toggleTTSPanel} toggleMenu={() => setIsMenuOpen(!isMenuOpen)} isTTSPanelOpen={isTTSPanelOpen}
                    isMenuOpen={isMenuOpen} selectedBook={selectedBook} selectedChapter={selectedChapter} currentVerse={currentVerse}
                    openBookModal={() => setIsBookModalOpen(true)} viewMode={viewMode} setViewMode={setViewMode}
                    currentParasha={null} onJumpToParasha={() => { }}
                    onOpenLibrary={() => setActiveTab('library')}
                />
            )}

            <TTSPanel isOpen={isTTSPanelOpen} onClose={() => setIsTTSPanelOpen(false)} isDarkMode={isDarkMode} dir={dir} isTTSActive={isTTSActive} handleStop={handleStop} handlePlayPause={handlePlayPause} ttsSpeed={ttsSpeed} changeSpeed={changeSpeed} selectedVoiceURI={selectedVoiceURI} changeVoice={changeVoice} availableVoices={availableVoices} />
            <MainMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isDarkMode={isDarkMode}
                openSettingsModal={() => setIsSettingsModalOpen(true)}
                openThemeModal={() => setIsSettingsModalOpen(true)}
                isSynced={isSynced}
                currentParasha={currentParasha}
                onJumpToParasha={handleJumpToParasha}
                onOpenDevPage={() => setIsDevPageOpen(true)}
                onToggleTTS={toggleTTSPanel}
                onOpenLegacyMatrix={() => setViewMode('MatrixLegacy')}
            />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} currentStyle={readerStyle} onStyleChange={setReaderStyle} currentSettings={themeSettings} onSettingsChange={setThemeSettings} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} dir={dir} />
            <BookSelectionModal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} currentBook={selectedBook || BIBLE_BOOKS[0]} currentChapter={selectedChapter} onSelectBook={handleBookSelect} isDarkMode={isDarkMode} />
            {currentParasha && <ParashaSummaryModal isOpen={isParashaModalOpen} onClose={() => setIsParashaModalOpen(false)} parasha={currentParasha} isDarkMode={isDarkMode} />}
            <DeveloperPage isOpen={isDevPageOpen} onClose={() => setIsDevPageOpen(false)} isDarkMode={isDarkMode} />

            {activeNoteRef && (
                <NoteEditorModal
                    isOpen={!!activeNoteRef}
                    onClose={() => setActiveNoteRef(null)}
                    refData={activeNoteRef}
                    isDarkMode={isDarkMode}
                />
            )}

            <main className={`flex-1 overflow-hidden relative ${activeTheme.bgMain}`}>
                {renderContent()}
            </main>

            <SearchPanel searchQuery={searchQuery} setSearchQuery={setSearchQuery} onSearch={executeSearch} searchResults={searchResults} currentResultIndex={currentResultIndex} onPrevious={() => { if (searchResults.length > 0) { const prevIndex = (currentResultIndex - 1 + searchResults.length) % searchResults.length; setCurrentResultIndex(prevIndex); scrollToResult(searchResults[prevIndex]); } }} isSearching={isSearching} isExpanded={isSearchPanelExpanded} toggleExpanded={() => setIsSearchPanelExpanded(!isSearchPanelExpanded)} searchWholeWord={searchWholeWord} setSearchWholeWord={setSearchWholeWord} searchScope={searchScope} setSearchScope={setSearchScope} isDarkMode={isDarkMode} readerStyle={readerStyle} onStyleChange={setReaderStyle} />
        </div>
    );
};

const App: React.FC = () => <LanguageProvider><AppContent /></LanguageProvider>;
export default App;
