
import React, { useState, useEffect, useRef, useMemo, useImperativeHandle, forwardRef, useCallback } from 'react';
import { BibleBook, Verse, ReaderStyle, SearchResult, ThemeProfile, ParashaData } from '../types';
import { BIBLE_BOOKS } from '../constants';
import { fetchFullBook } from '../services/bibleService';
import { numberToHebrew, prepareTextForTTS } from '../utils/gematria';
import { Loader2, ArrowLeft, ArrowRight, BookOpen, RotateCcw, Share2, Download, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import ChapterInfoModal from './ChapterInfoModal';
import WithHelp from './WithHelp';
import VerseItem from './VerseItem';
import ReaderContextMenu from './ReaderContextMenu';
import ElsLinesOverlay from './ElsLinesOverlay';
import ThreeDVisualizer from './ThreeDVisualizer';
import { toJpeg } from 'https://esm.sh/html-to-image@1.11.11';

export interface BibleReaderHandle {
    play: () => void;
    pause: () => void;
    stop: () => void;
    setSpeed: (speed: number) => void;
    setVoice: (voiceURI: string) => void;
    isTTSPlaying: boolean;
    scrollToVerse: (chapter: number, verse: number) => void;
}

interface Props {
    selectedBook: BibleBook;
    selectedChapter: number;
    onBookChange: (book: BibleBook, chapter?: number, verse?: number) => void;
    onChapterChange: (chapter: number) => void;
    onVerseChange?: (verse: number) => void;
    readerStyle?: ReaderStyle;
    onStyleChange?: (style: ReaderStyle) => void;
    activeTheme: ThemeProfile;
    isDarkMode: boolean;
    onNavigateToGematria?: (text: string) => void;
    activeParasha: ParashaData | null;
    onOpenParashaSummary: () => void;
    searchResults: SearchResult[];
    activeResult: SearchResult | null;
    searchQuery: string;
    searchWholeWord: boolean;
    isRegularSearchActive: boolean;
    onAddNote: (bookId: string, chapter: number, verse: number) => void;
    onAddBookmark: (bookId: string, chapter: number, verse: number) => void;
    onSearchRequest: (text: string) => void;
    scrollSignal?: { ts: number, chapter: number, verse: number } | null;
    onVerseHover?: (chapter: number, verse: number) => void;
}

type MenuMenuView = 'main' | 'commentary';
type TTSState = 'idle' | 'playing' | 'paused';

const BibleReader = forwardRef<BibleReaderHandle, Props>(({
    selectedBook,
    selectedChapter,
    onBookChange,
    onChapterChange,
    onVerseChange,
    readerStyle = { fontFamily: 'Frank Ruhl Libre', fontSize: 1.2, showNikud: true, showVerseNumbers: true, showChapterHeaders: true, lineHeight: 1.6, verseSpacing: 0.5, textAlign: 'right', isContinuous: false },
    activeTheme,
    isDarkMode,
    onNavigateToGematria,
    activeParasha,
    onOpenParashaSummary,
    searchResults,
    activeResult,
    searchQuery,
    searchWholeWord,
    isRegularSearchActive,
    onAddNote,
    onAddBookmark,
    onSearchRequest,
    scrollSignal,
    onVerseHover
}, ref) => {
    const { t, getBookName, language, dir } = useLanguage();
    const [fullBookData, setFullBookData] = useState<Verse[][]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, verse: Verse, selectedText?: string } | null>(null);
    const [menuView, setMenuView] = useState<MenuMenuView>('main');
    const [availableCommentators, setAvailableCommentators] = useState<Set<string>>(new Set());
    const [isLoadingCommentaries, setIsLoadingCommentaries] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const chapterRefs = useRef<(HTMLElement | null)[]>([]);
    const [ttsState, setTtsState] = useState<TTSState>('idle');
    const [ttsVerse, setTtsVerse] = useState<{ chapter: number, verse: number } | null>(null);
    const [infoModalData, setInfoModalData] = useState<{ chapter: number, verseCount: number } | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [shareData, setShareData] = useState<{ blob: Blob, url: string } | null>(null);

    const ttsActiveRef = useRef(false);
    const ttsSpeedRef = useRef(0.9);
    const ttsVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
    const selectedChapterRef = useRef(selectedChapter);

    // Track last reported position to avoid state spam
    const lastReportedPos = useRef({ chapter: selectedChapter, verse: 1 });

    let globalVerseCounter = 0;

    const totalVerses = useMemo(() => fullBookData.reduce((acc, ch) => acc + ch.length, 0), [fullBookData]);

    const currentElsHighlights = useMemo(() => {
        if (searchResults.length === 0) return null;
        const map = new Map<string, Map<number, number>>();
        searchResults.forEach(res => {
            if (res.elsComponents && res.bookId === selectedBook.id && Math.abs(res.elsSkip || 0) !== 1) {
                res.elsComponents.forEach(comp => {
                    const key = `${comp.chapter}_${comp.verse}`;
                    if (!map.has(key)) map.set(key, new Map());
                    map.get(key)!.set(comp.letterIdx, comp.groupId);
                });
            }
        });
        return map;
    }, [searchResults, selectedBook.id]);

    useEffect(() => { selectedChapterRef.current = selectedChapter; }, [selectedChapter]);
    useEffect(() => () => { ttsActiveRef.current = false; window.speechSynthesis.cancel(); }, []);

    // Scroll Handler for Tracking Position
    const handleScroll = useCallback(() => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const rect = container.getBoundingClientRect();

        // Check point at 20% height from top (reading line)
        const checkX = rect.left + rect.width / 2;
        const checkY = rect.top + (rect.height * 0.2);

        const el = document.elementFromPoint(checkX, checkY);

        if (el) {
            const verseEl = el.closest('[data-verse]');
            const chapterEl = el.closest('article');

            let newChapter = -1;
            let newVerse = -1;

            if (verseEl && chapterEl) {
                newVerse = parseInt(verseEl.getAttribute('data-verse') || '1');
                const chIdx = chapterRefs.current.indexOf(chapterEl as HTMLElement);
                if (chIdx !== -1) newChapter = chIdx + 1;
            } else if (chapterEl) {
                const chIdx = chapterRefs.current.indexOf(chapterEl as HTMLElement);
                if (chIdx !== -1) {
                    newChapter = chIdx + 1;
                    newVerse = 1; // Default to start of chapter
                }
            }

            if (newChapter !== -1 && (newChapter !== lastReportedPos.current.chapter || newVerse !== lastReportedPos.current.verse)) {
                lastReportedPos.current = { chapter: newChapter, verse: newVerse };
                if (newChapter !== selectedChapterRef.current) {
                    onChapterChange(newChapter);
                }
                if (onVerseChange && newVerse !== -1) {
                    onVerseChange(newVerse);
                }
            }
        }
    }, [onChapterChange, onVerseChange]);

    useEffect(() => {
        const el = scrollContainerRef.current;
        if (el) {
            el.addEventListener('scroll', handleScroll, { passive: true });
            return () => el.removeEventListener('scroll', handleScroll);
        }
    }, [handleScroll, isLoading]);

    const handleTtsPlay = () => {
        if (ttsState === 'paused') { ttsActiveRef.current = true; window.speechSynthesis.resume(); setTtsState('playing'); } else {
            window.speechSynthesis.cancel(); ttsActiveRef.current = true;
            const startChapterIdx = selectedChapter - 1; const startVerseIdx = 0;
            setTimeout(() => { if (ttsActiveRef.current) speakVerse(startChapterIdx, startVerseIdx >= 0 ? startVerseIdx : 0); }, 50);
        }
    };
    const handleTtsPause = () => { window.speechSynthesis.pause(); setTtsState('paused'); };
    const handleTtsStop = () => { ttsActiveRef.current = false; window.speechSynthesis.cancel(); setTtsState('idle'); setTtsVerse(null); };

    const scrollToVerse = (chapter: number, verse: number) => {
        const chapterEl = chapterRefs.current[chapter - 1];
        if (chapterEl) {
            const verseEl = chapterEl.querySelector(`[data-verse="${verse}"]`);
            if (verseEl) {
                verseEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                chapterEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    useImperativeHandle(ref, () => ({
        play: handleTtsPlay, pause: handleTtsPause, stop: handleTtsStop,
        setSpeed: (speed: number) => { ttsSpeedRef.current = speed; },
        setVoice: (voiceURI: string) => { const voices = window.speechSynthesis.getVoices(); const found = voices.find(v => v.voiceURI === voiceURI); if (found) ttsVoiceRef.current = found; },
        isTTSPlaying: ttsState === 'playing', scrollToVerse
    }));

    useEffect(() => {
        let isMounted = true;
        const loadBook = async () => {
            setIsLoading(true); setFullBookData([]); handleTtsStop();
            try {
                const data = await fetchFullBook(selectedBook.id);
                if (isMounted) { setFullBookData(data); setIsLoading(false); }
            } catch (error) { if (isMounted) setIsLoading(false); }
        };
        loadBook(); return () => { isMounted = false; };
    }, [selectedBook.id]);

    useEffect(() => {
        if (!isLoading && scrollSignal && fullBookData.length > 0) {
            setTimeout(() => {
                scrollToVerse(scrollSignal.chapter, scrollSignal.verse);
                // Update internal tracking to match the jump
                lastReportedPos.current = { chapter: scrollSignal.chapter, verse: scrollSignal.verse };
            }, 100);
        }
    }, [scrollSignal, isLoading, fullBookData.length]);

    const speakVerse = (chapterIdx: number, verseIdx: number) => {
        if (!ttsActiveRef.current || chapterIdx >= fullBookData.length) return;
        const chapterVerses = fullBookData[chapterIdx];
        if (verseIdx >= chapterVerses.length) { speakVerse(chapterIdx + 1, 0); return; }
        const v = chapterVerses[verseIdx]; setTtsVerse({ chapter: chapterIdx + 1, verse: verseIdx + 1 });
        const text = prepareTextForTTS(v.text);
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'he-IL'; utterance.rate = ttsSpeedRef.current;
        if (ttsVoiceRef.current) utterance.voice = ttsVoiceRef.current;
        utterance.onend = () => speakVerse(chapterIdx, verseIdx + 1);
        window.speechSynthesis.speak(utterance);
    };

    const handleShareImage = async () => {
        setContextMenu(null);
        setIsCapturing(true);

        // Allow UI to update before blocking with capture
        await new Promise(r => setTimeout(r, 100));

        try {
            const container = scrollContainerRef.current;
            if (!container) throw new Error("Container not found");

            const containerRect = container.getBoundingClientRect();

            const dataUrl = await toJpeg(container, {
                quality: 0.92,
                pixelRatio: 2, // Use device independent pixel ratio for quality
                backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                style: {
                    overflow: 'hidden',
                    height: `${container.clientHeight}px`,
                    maxHeight: `${container.clientHeight}px`,
                },
                filter: (node) => {
                    if (node.classList && node.classList.contains('screen-capture-ignore')) return false;
                    if (node instanceof HTMLElement && node.tagName === 'ARTICLE') {
                        const rect = node.getBoundingClientRect();
                        if (rect.top > (containerRect.bottom + 500)) return false;
                    }
                    return true;
                }
            });

            const res = await fetch(dataUrl);
            const blob = await res.blob();

            setShareData({ blob, url: dataUrl });
        } catch (err) {
            console.error('Capture failed', err);
            alert('אירעה שגיאה ביצירת התמונה');
        } finally {
            setIsCapturing(false);
        }
    };

    const handleCloseShare = () => {
        if (shareData) URL.revokeObjectURL(shareData.url);
        setShareData(null);
    };

    const handleNativeShare = async () => {
        if (!shareData) return;
        const file = new File([shareData.blob], `tanakh_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    files: [file],
                    title: t('app_title'),
                    text: `${getBookName(selectedBook.id)} ${selectedChapter}`
                });
            } catch (e) {
                console.warn('Share failed', e);
            }
        } else {
            alert(t('share_unsupported'));
        }
    };

    const handleDownloadImage = () => {
        if (!shareData) return;
        const a = document.createElement('a');
        a.href = shareData.url;
        a.download = `tanakh_${selectedBook.id}_${selectedChapter}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const currentBookIdx = BIBLE_BOOKS.findIndex(b => b.id === selectedBook.id);
    const isLastBook = currentBookIdx === BIBLE_BOOKS.length - 1;
    const nextBookIdx = (currentBookIdx + 1) % BIBLE_BOOKS.length;
    const nextBook = BIBLE_BOOKS[nextBookIdx];

    const modalBg = isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200';

    return (
        <div className={`flex flex-col h-full overflow-hidden animate-in slide-in-from-left duration-300 relative ${activeTheme.bgMain}`}>
            {isCapturing && (
                <div className="absolute inset-0 z-[200] bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center gap-4 animate-in fade-in screen-capture-ignore">
                    <Loader2 size={48} className="animate-spin text-white" />
                    <span className="text-white font-bold text-lg drop-shadow-md">מייצר תמונה...</span>
                </div>
            )}

            {shareData && (
                <div className="absolute inset-0 z-[200] bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in screen-capture-ignore">
                    <div className={`w-full max-w-md rounded-2xl shadow-2xl border flex flex-col overflow-hidden ${modalBg}`}>
                        <div className={`p-4 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                            <h3 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{t('preview_title')}</h3>
                            <button onClick={handleCloseShare} className={`p-1 rounded-full ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}><X size={20} /></button>
                        </div>
                        <div className="p-6 flex flex-col items-center gap-6 bg-black/5">
                            <div className="relative shadow-lg border border-white/10 rounded-lg overflow-hidden max-h-[50vh]">
                                <img src={shareData.url} alt="Capture" className="max-w-full h-auto object-contain" />
                            </div>
                            <div className="flex flex-col gap-3 w-full">
                                <button onClick={handleNativeShare} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2">
                                    <Share2 size={20} />
                                    {t('share_action')}
                                </button>
                                <button onClick={handleDownloadImage} className={`w-full py-3 font-bold rounded-xl border flex items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}>
                                    <Download size={20} />
                                    {t('download_action')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto min-h-0 relative pb-40" dir={language === 'he' ? 'ltr' : 'rtl'}>
                {isLoading ? <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400"><Loader2 size={40} className={`animate-spin ${activeTheme.accent}`} /><p className="font-bold">{t('loading')}</p></div> : (
                    <div className={`${activeTheme.bgPaper} reader-content-area min-h-full max-w-4xl mx-auto shadow-sm relative`} dir="rtl">
                        <ElsLinesOverlay searchResults={searchResults} containerRef={scrollContainerRef} readerStyle={readerStyle} />
                        <div className={`px-5 py-6 md:p-10 lg:p-16 relative z-10 ${!readerStyle.showChapterHeaders ? 'pt-2' : ''}`}>
                            {fullBookData.map((verses, index) => (
                                <article key={index} className={`${readerStyle.showChapterHeaders ? 'mb-10' : 'mb-0'} scroll-mt-4`} ref={el => { chapterRefs.current[index] = el; }}>
                                    {readerStyle.showChapterHeaders && (
                                        <div className={`flex items-center justify-center gap-4 mb-6 p-4 rounded-xl border border-black/5`} style={{ backgroundColor: activeTheme.bgPaper }}>
                                            <button
                                                onClick={() => {
                                                    if ((index + 1) > 1) {
                                                        onChapterChange(index);
                                                        scrollToVerse(index, 1);
                                                    }
                                                }}
                                                className={`p-2 transition-colors rounded-full ${(index + 1) > 1 ? 'hover:bg-black/5 opacity-100' : 'opacity-20 cursor-default'}`}
                                            >
                                                <ArrowRight size={20} />
                                            </button>
                                            <div className={`px-6 py-1 border font-bold text-sm uppercase rounded-full cursor-pointer transition-colors ${activeTheme.bgMain} ${activeTheme.border} hover:bg-black/5`} onClick={() => setInfoModalData({ chapter: index + 1, verseCount: verses.length })}>
                                                {getBookName(selectedBook.id)} • {t('chapter')} {numberToHebrew(index + 1)}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if ((index + 1) < selectedBook.chaptersCount) {
                                                        onChapterChange(index + 2);
                                                        scrollToVerse(index + 2, 1);
                                                    }
                                                }}
                                                className={`p-2 transition-colors rounded-full ${(index + 1) < selectedBook.chaptersCount ? 'hover:bg-black/5 opacity-100' : 'opacity-20 cursor-default'}`}
                                            >
                                                <ArrowLeft size={20} />
                                            </button>
                                        </div>
                                    )}
                                    <div className={`${activeTheme.textMain} w-full`} style={{ fontFamily: readerStyle.fontFamily, fontSize: `${readerStyle.fontSize * 1.5}rem`, lineHeight: readerStyle.lineHeight, textAlign: readerStyle.textAlign }}>
                                        {verses.map(v => {
                                            globalVerseCounter++;
                                            return <VerseItem key={v.verse} verse={v} chapterNum={index + 1} readerStyle={readerStyle} activeTheme={activeTheme} isReading={ttsVerse?.chapter === index + 1 && ttsVerse?.verse === v.verse} ttsHighlight={isDarkMode ? 'bg-orange-500/20' : 'bg-orange-200'} verseHover={activeTheme.hover} globalVerseCounter={globalVerseCounter} activeResult={activeResult} searchQuery={searchQuery} searchWholeWord={searchWholeWord} isRegularSearchActive={isRegularSearchActive} elsIndices={currentElsHighlights?.get(`${index + 1}_${v.verse}`)} onContextMenu={(e) => { e.preventDefault(); const selectedText = window.getSelection()?.toString().trim(); setContextMenu({ x: e.clientX, y: e.clientY, verse: v, selectedText }); }} onMouseEnter={() => { if (onVerseHover) onVerseHover(index + 1, v.verse); }} />;
                                        })}
                                    </div>
                                </article>
                            ))}

                            {!isLoading && fullBookData.length > 0 && (
                                <div className="mt-20 mb-8 flex flex-col items-center justify-center text-center animate-in fade-in duration-700 opacity-90 hover:opacity-100 transition-opacity">
                                    <div className={`w-24 h-1.5 rounded-full mb-6 opacity-20 ${activeTheme.textMain}`} style={{ backgroundColor: 'currentColor' }}></div>
                                    <h3 className={`text-xl font-serif font-bold mb-4 ${activeTheme.textSecondary}`}>
                                        {isLastBook ? `חזק חזק ונתחזק! סיימת את כל ספרי התנ"ך` : `סוף ספר ${getBookName(selectedBook.id)}`}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            onBookChange(nextBook, 1, 1);
                                            if (scrollContainerRef.current) {
                                                scrollContainerRef.current.scrollTop = 0;
                                            }
                                        }}
                                        className={`group flex items-center gap-4 px-6 py-4 rounded-2xl border shadow-sm transition-all hover:shadow-md active:scale-95 ${activeTheme.bgMain} ${activeTheme.border}`}
                                    >
                                        <div className="flex flex-col items-start text-right">
                                            <span className={`text-xs font-bold opacity-60 uppercase tracking-wider ${activeTheme.textSecondary}`}>
                                                {isLastBook ? 'חזרה להתחלה' : 'הספר הבא'}
                                            </span>
                                            <span className={`text-xl font-black ${activeTheme.textMain} group-hover:${activeTheme.accent}`}>
                                                {getBookName(nextBook.id)}
                                            </span>
                                        </div>
                                        <div className={`p-2.5 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} group-hover:bg-indigo-500 group-hover:text-white transition-colors`}>
                                            {isLastBook ? <RotateCcw size={20} /> : (dir === 'rtl' ? <ArrowLeft size={24} /> : <ArrowRight size={24} />)}
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <ReaderContextMenu
                contextMenu={contextMenu} menuView={menuView} setMenuView={setMenuView} onClose={() => setContextMenu(null)}
                onGematria={() => {
                    const textToCalc = contextMenu?.selectedText ? contextMenu.selectedText : contextMenu!.verse.text;
                    onNavigateToGematria?.(textToCalc);
                    setContextMenu(null);
                }}
                onCommentary={() => setMenuView('commentary')}
                onCopy={() => { navigator.clipboard.writeText(contextMenu!.verse.text); setContextMenu(null); }}
                onShare={() => setContextMenu(null)}
                onShareImage={handleShareImage}
                onNote={() => { onAddNote(selectedBook.id, contextMenu!.verse.chapter, contextMenu!.verse.verse); setContextMenu(null); }}
                onBookmark={() => { onAddBookmark(selectedBook.id, contextMenu!.verse.chapter, contextMenu!.verse.verse); setContextMenu(null); }}
                onSearch={(text) => { onSearchRequest(text); setContextMenu(null); }}
                selectedText={contextMenu?.selectedText}
                dir={dir} isDarkMode={isDarkMode} availableCommentators={availableCommentators} isLoadingCommentaries={isLoadingCommentaries} onOpenCommentary={() => { }}
            />
            {infoModalData && (
                <ChapterInfoModal
                    isOpen={!!infoModalData}
                    onClose={() => setInfoModalData(null)}
                    book={selectedBook}
                    chapter={infoModalData.chapter}
                    verseCount={infoModalData.verseCount}
                    totalBookVerses={totalVerses}
                    isDarkMode={isDarkMode}
                />
            )}
        </div>
    );
});

export default BibleReader;
