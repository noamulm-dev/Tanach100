
import { SearchResult, ReaderStyle } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import {
    Loader2, ArrowLeft, ArrowRight, CheckCircle2,
    Book, Scroll, Library, WholeWord, Star,
    History, Trash2, X, SlidersHorizontal, Hash, LayoutList, AlignJustify, Search, ChevronDown, ChevronUp
} from 'lucide-react';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import WithHelp from './WithHelp';

interface Props {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    onSearch: (forceNew?: boolean, queryOverride?: string) => void;
    searchResults: SearchResult[];
    currentResultIndex: number;
    onPrevious: () => void;
    isSearching: boolean;
    searchProgress?: number;
    // Deprecated but kept for compatibility
    isExpanded?: boolean;
    toggleExpanded?: () => void;

    searchWholeWord: boolean;
    setSearchWholeWord: (val: boolean) => void;
    searchScope: 'current' | 'torah' | 'tanakh';
    setSearchScope: (scope: 'current' | 'torah' | 'tanakh') => void;
    isDarkMode: boolean;
    readerStyle?: ReaderStyle;
    onStyleChange?: (style: ReaderStyle) => void;
}

const SearchPanel: React.FC<Props> = ({
    searchQuery, setSearchQuery, onSearch, searchResults, currentResultIndex, onPrevious,
    isSearching, searchProgress = 0, searchWholeWord, setSearchWholeWord,
    searchScope, setSearchScope, isDarkMode, readerStyle, onStyleChange
}) => {
    const { t, dir } = useLanguage();
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const historyRef = useRef<HTMLDivElement>(null);

    // Initialize history
    useEffect(() => {
        const savedHistory = localStorage.getItem('bible_search_history');
        let historyData: string[] = [];
        if (savedHistory) {
            try { historyData = JSON.parse(savedHistory); } catch (e) { console.error(e); }
        }
        const defaults = ["אברהם, יצחק, 1-49", "משה , אהרן", "קין, הבל, 1, 7", "מבול, ארבעים", "תורה, יהוה, 14, 49,50", "אלהים, 7, 49, 1", "תורה, יהוה, 48-51", "משה , אהרן , 1 ,7", "אדמה , צאן, 1, 7"];
        let updated = false;
        defaults.slice().reverse().forEach(d => {
            if (!historyData.includes(d)) { historyData.unshift(d); updated = true; }
        });
        if (updated) {
            historyData = historyData.slice(0, 15);
            localStorage.setItem('bible_search_history', JSON.stringify(historyData));
        }
        setSearchHistory(historyData);
    }, []);

    const isCurrentQueryStarred = useMemo(() => {
        return searchHistory.includes(searchQuery.trim()) && searchQuery.trim() !== '';
    }, [searchHistory, searchQuery]);

    const toggleStar = (e: React.MouseEvent) => {
        e.stopPropagation();
        const trimmed = searchQuery.trim();
        if (!trimmed) return;
        let newHistory = isCurrentQueryStarred
            ? searchHistory.filter(item => item !== trimmed)
            : [trimmed, ...searchHistory.filter(item => item !== trimmed)].slice(0, 15);
        setSearchHistory(newHistory);
        localStorage.setItem('bible_search_history', JSON.stringify(newHistory));
    };

    const autoCorrectInput = (input: string): string => input.replace(/([\u0590-\u05FFa-zA-Z]+)\s+(\d+)/g, "$1, $2");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.currentTarget.blur();
            setIsHistoryOpen(false);
            const corrected = autoCorrectInput(searchQuery);
            if (corrected !== searchQuery) setSearchQuery(corrected);
            setTimeout(() => onSearch(false, corrected), 50);
        }
    };

    const handleSearchClick = () => {
        setIsHistoryOpen(false);
        const corrected = autoCorrectInput(searchQuery);
        if (corrected !== searchQuery) setSearchQuery(corrected);
        onSearch(false, corrected);
    };

    const handleHistoryItemClick = (item: string) => {
        setSearchQuery(item);
        setIsHistoryOpen(false);
        onSearch(true, item);
    };

    const getScopeIcon = (scope: string) => {
        switch (scope) {
            case 'current': return <Book size={16} />;
            case 'torah': return <Scroll size={16} />;
            case 'tanakh': return <Library size={16} />;
            default: return <Library size={16} />;
        }
    };

    const getScopeLabel = (scope: string) => {
        switch (scope) {
            case 'current': return t('scope_current');
            case 'torah': return t('scope_torah');
            case 'tanakh': return t('scope_tanakh');
            default: return t('scope_tanakh');
        }
    };

    const hasResults = searchResults.length > 0;
    const panelBg = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

    const renderToggleItem = (label: string, icon: React.ReactNode, value: boolean, onClick: () => void) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors text-sm font-bold ${value
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : (isDarkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-700')
                }`}
        >
            <div className="flex items-center gap-3">
                {icon}
                <span>{label}</span>
            </div>
            {value && <CheckCircle2 size={16} />}
        </button>
    );

    return (
        <div
            className={`shrink-0 z-50 flex flex-col border-t shadow-[0_-8px_20px_rgba(0,0,0,0.15)] transition-all relative ${panelBg}`}
            dir={dir}
            style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom))' }}
        >
            {/* Progress Bar */}
            {isSearching && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 overflow-hidden z-50">
                    <div
                        className={`h-full transition-all duration-300 ease-out ${isDarkMode ? 'bg-indigo-500' : 'bg-indigo-600'}`}
                        style={{ width: `${Math.max(5, searchProgress)}%` }}
                    />
                </div>
            )}

            <div className="px-3 py-3 flex items-center gap-3 relative z-30">
                {/* 1. Settings Button (Popover Trigger) */}
                <div className="relative shrink-0">
                    <WithHelp labelKey="label_search_settings" position="top">
                        <button
                            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95 border-2 ${isSettingsOpen
                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                    : (isDarkMode
                                        ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                                        : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-indigo-600')
                                }`}
                        >
                            <SlidersHorizontal size={20} />
                        </button>
                    </WithHelp>

                    {/* Settings Popover */}
                    {isSettingsOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsSettingsOpen(false)}></div>
                            <div className={`absolute bottom-full mb-3 z-50 w-72 rounded-2xl border shadow-2xl p-2 animate-in slide-in-from-bottom-2 fade-in duration-200 flex flex-col gap-1 max-h-[60vh] overflow-y-auto custom-scrollbar ${dir === 'rtl' ? 'right-0' : 'left-0'
                                } ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>

                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 py-1.5">{t('label_search_scope')}</span>
                                {/* Scope Selection */}
                                <div className="flex flex-col gap-1 mb-2">
                                    {(['current', 'torah', 'tanakh'] as const).map(s => (
                                        renderToggleItem(getScopeLabel(s), getScopeIcon(s), searchScope === s, () => setSearchScope(s))
                                    ))}
                                </div>

                                <div className={`h-px w-full my-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 py-1.5">{t('menu_display')}</span>
                                {/* Toggles */}
                                {renderToggleItem(t('label_whole_words') || 'מילים שלמות', <WholeWord size={18} />, searchWholeWord, () => setSearchWholeWord(!searchWholeWord))}

                                {readerStyle && onStyleChange && (
                                    <>
                                        {renderToggleItem(t('show_nikud'), <span className="font-bold text-lg leading-none w-[18px] text-center">אְ</span>, readerStyle.showNikud, () => onStyleChange({ ...readerStyle, showNikud: !readerStyle.showNikud }))}
                                        {renderToggleItem(t('show_verses'), <Hash size={18} />, readerStyle.showVerseNumbers, () => onStyleChange({ ...readerStyle, showVerseNumbers: !readerStyle.showVerseNumbers }))}
                                        {renderToggleItem(t('show_chapter_headers'), <LayoutList size={18} />, readerStyle.showChapterHeaders, () => onStyleChange({ ...readerStyle, showChapterHeaders: !readerStyle.showChapterHeaders }))}
                                        {renderToggleItem('תצוגת רצף', <AlignJustify size={18} />, readerStyle.isContinuous, () => onStyleChange({ ...readerStyle, isContinuous: !readerStyle.isContinuous }))}
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* 2. Input Field (Flexible) */}
                <div className="relative flex-1 flex items-center">
                    <WithHelp labelKey="label_search_input" position="top" className="w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => { if (searchHistory.length > 0) setIsHistoryOpen(true); }}
                            placeholder={t('search_placeholder')}
                            className={`w-full h-11 px-9 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-base ${isDarkMode
                                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                                    : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
                                } ${dir === 'rtl' ? 'text-right pl-20' : 'text-left pr-20'}`}
                        />

                        {/* History Button (Left) */}
                        <button
                            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                            className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors text-slate-400 hover:text-indigo-500 ${dir === 'rtl' ? 'left-1' : 'right-1'}`}
                        >
                            <History size={20} />
                        </button>

                        {/* Clear Button */}
                        {searchQuery && (
                            <button
                                onClick={() => { setSearchQuery(''); onSearch(false, ''); }}
                                className={`absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-slate-400 ${dir === 'rtl' ? 'left-9' : 'right-9'
                                    }`}
                            >
                                <X size={16} strokeWidth={3} />
                            </button>
                        )}

                        {/* Star Button (Right) */}
                        <button
                            onClick={toggleStar}
                            className={`absolute top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all active:scale-90 ${isCurrentQueryStarred ? 'text-amber-500' : 'text-slate-400 hover:text-slate-500'} ${dir === 'rtl' ? 'right-1' : 'left-1'}`}
                        >
                            <Star size={20} fill={isCurrentQueryStarred ? "currentColor" : "none"} />
                        </button>
                    </WithHelp>

                    {/* History Popover */}
                    {isHistoryOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setIsHistoryOpen(false)}></div>
                            <div ref={historyRef} className={`absolute bottom-full left-0 right-0 mb-3 z-50 rounded-2xl border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 duration-200 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">היסטוריה</span>
                                    {searchHistory.length > 0 && <button onClick={(e) => { e.stopPropagation(); setSearchHistory([]); localStorage.removeItem('bible_search_history'); }} className="text-rose-500 hover:text-rose-400 p-1"><Trash2 size={14} /></button>}
                                </div>
                                <div className="max-h-56 overflow-y-auto custom-scrollbar">
                                    {searchHistory.map((item, idx) => (
                                        <button key={idx} onClick={() => handleHistoryItemClick(item)} className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold border-b last:border-0 text-right ${isDarkMode ? 'border-slate-700/50 hover:bg-slate-700 text-slate-200' : 'border-slate-100 hover:bg-slate-50 text-slate-700'}`}>
                                            <History size={16} className="text-indigo-500 shrink-0" />
                                            <span className="flex-1 truncate">{item}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* 3. Navigation Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <WithHelp labelKey="label_search_next" position="top">
                        <button
                            onClick={handleSearchClick}
                            disabled={isSearching}
                            className={`h-11 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all text-sm font-bold border-2 ${isDarkMode ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-indigo-600 text-white border-indigo-600'
                                } ${isSearching ? 'opacity-80' : ''}`}
                        >
                            {isSearching ? <Loader2 size={20} className="animate-spin" /> : <Search size={20} strokeWidth={2.5} />}
                            {hasResults && <span className="tabular-nums text-xs">{currentResultIndex + 1}/{searchResults.length}</span>}
                        </button>
                    </WithHelp>

                    {hasResults && (
                        <WithHelp labelKey="label_search_prev" position="top">
                            <button
                                onClick={onPrevious}
                                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all active:scale-95 border-2 ${isDarkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}
                            >
                                {dir === 'rtl' ? <ArrowRight size={20} strokeWidth={2.5} /> : <ArrowLeft size={20} strokeWidth={2.5} />}
                            </button>
                        </WithHelp>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchPanel;
