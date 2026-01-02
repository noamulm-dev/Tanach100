
import React from 'react';
import { Calculator, ScrollText, Copy, Share2, FileText, ArrowRight, ArrowLeft, Loader2, ExternalLink, BookmarkPlus, Search, ImageIcon } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Verse } from '../types';
import WithHelp from './WithHelp';

interface Props {
    contextMenu: { x: number, y: number, verse: Verse } | null;
    menuView: 'main' | 'commentary';
    setMenuView: (view: 'main' | 'commentary') => void;
    onClose: () => void;
    onGematria: () => void;
    onCommentary: () => void;
    onCopy: () => void;
    onShare: () => void;
    onShareImage: () => void;
    onNote: () => void;
    onBookmark?: () => void;
    onSearch: (text: string) => void;
    selectedText?: string;
    dir: 'rtl' | 'ltr';
    isDarkMode: boolean;
    availableCommentators: Set<string>;
    isLoadingCommentaries: boolean;
    onOpenCommentary: (prefix: string) => void;
}

const COMMENTATORS = [
    { id: 'rashi', labelKey: 'rashi', sefariaPrefix: 'Rashi_on_' },
    { id: 'ramban', labelKey: 'ramban', sefariaPrefix: 'Ramban_on_' },
    { id: 'ibnezra', labelKey: 'ibnezra', sefariaPrefix: 'Ibn_Ezra_on_' },
    { id: 'sforno', labelKey: 'sforno', sefariaPrefix: 'Sforno_on_' },
    { id: 'baalhaturim', labelKey: 'baalhaturim', sefariaPrefix: 'Baal_HaTurim_on_' },
    { id: 'orhahayim', labelKey: 'orhahayim', sefariaPrefix: 'Or_HaChaim_on_' },
    { id: 'metzudatdavid', labelKey: 'metzudatdavid', sefariaPrefix: 'Metzudat_David_on_' },
    { id: 'metzudatzion', labelKey: 'metzudatzion', sefariaPrefix: 'Metzudat_Zion_on_' },
];

const ReaderContextMenu: React.FC<Props> = ({
    contextMenu, menuView, setMenuView, onClose, onGematria, onCommentary,
    onCopy, onShare, onShareImage, onNote, onBookmark, onSearch, selectedText, dir, isDarkMode, availableCommentators,
    isLoadingCommentaries, onOpenCommentary
}) => {
    const { t } = useLanguage();

    if (!contextMenu) return null;

    const menuBg = isDarkMode ? 'bg-slate-800 text-slate-200 border-slate-700' : 'bg-white text-slate-700 border-slate-200';
    const menuItemHover = isDarkMode ? 'hover:bg-slate-700 active:bg-slate-600 active:scale-95' : 'hover:bg-indigo-50 hover:text-indigo-700 active:bg-indigo-100 active:scale-95';

    // Helper to clean text for search: removes nikud, digits, punctuation, brackets etc.
    const getCleanSearchText = (rawText: string) => {
        if (!rawText) return "";
        return rawText
            .replace(/[\u0591-\u05C7]/g, '') // Remove Nikud & Cantillation
            .replace(/[0-9]/g, '')           // Remove numeric digits
            .replace(/[^א-ת\s]/g, ' ')       // Remove punctuation / special chars
            .replace(/\s+/g, ' ')            // Normalize spaces first to ensure standalone check works
            .replace(/(^|\s)[א-ת](?=\s|$)/g, ' ') // Remove standalone single Hebrew letters (verse nums like 'ד', 'ה' or markers 'פ','ס')
            .replace(/\s+/g, ' ')            // Collapse spaces again
            .trim();
    };

    const cleanSelectedText = selectedText ? getCleanSearchText(selectedText) : "";

    return (
        <div className="fixed inset-0 z-[100] bg-black/10" onClick={onClose}>
            <div
                className={`absolute min-w-[200px] rounded-xl shadow-2xl border overflow-hidden animate-in zoom-in-95 duration-100 ${menuBg}`}
                style={{
                    top: Math.min(contextMenu.y, window.innerHeight - 420),
                    [dir === 'rtl' ? 'left' : 'right']: Math.min(contextMenu.x, window.innerWidth - 220),
                    fontFamily: 'Assistant, sans-serif'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {menuView === 'main' ? (
                    <div className="flex flex-col text-sm font-bold">
                        {cleanSelectedText.length > 0 && (
                            <>
                                <button onClick={() => onSearch(cleanSelectedText)} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${dir === 'rtl' ? 'text-right' : 'text-left'} ${menuItemHover}`}>
                                    <Search size={16} className="text-indigo-500" />
                                    <span className="truncate max-w-[180px]">חיפוש: "{cleanSelectedText.length > 15 ? cleanSelectedText.slice(0, 15) + '...' : cleanSelectedText}"</span>
                                </button>
                                <div className={`h-px w-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                            </>
                        )}

                        <WithHelp labelKey="label_context_gematria" position="left" className="w-full">
                            <button onClick={onGematria} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${dir === 'rtl' ? 'text-right' : 'text-left'} ${menuItemHover}`}>
                                <Calculator size={16} />{t('gematria')}
                            </button>
                        </WithHelp>
                        <WithHelp labelKey="label_context_commentary" position="left" className="w-full">
                            <button onClick={onCommentary} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${dir === 'rtl' ? 'text-right' : 'text-left'} ${menuItemHover}`}>
                                <ScrollText size={16} />{t('commentary')}
                            </button>
                        </WithHelp>
                        <WithHelp labelKey="label_context_copy" position="left" className="w-full">
                            <button onClick={onCopy} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${dir === 'rtl' ? 'text-right' : 'text-left'} ${menuItemHover}`}>
                                <Copy size={16} />{t('copy')}
                            </button>
                        </WithHelp>

                        <div className={`h-px w-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}></div>

                        <button onClick={onNote} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${dir === 'rtl' ? 'text-right' : 'text-left'} ${menuItemHover}`}>
                            <FileText size={16} />הוסף הערה לספרייה
                        </button>

                        <button onClick={onBookmark} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${dir === 'rtl' ? 'text-right' : 'text-left'} ${menuItemHover}`}>
                            <BookmarkPlus size={16} />הוסף סימניה
                        </button>

                        <div className={`h-px w-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}></div>

                        <WithHelp labelKey="label_context_share" position="left" className="w-full">
                            <button onClick={onShare} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${dir === 'rtl' ? 'text-right' : 'text-left'} ${menuItemHover}`}>
                                <Share2 size={16} />{t('share_options')}
                            </button>
                        </WithHelp>

                        <button onClick={onShareImage} className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${dir === 'rtl' ? 'text-right' : 'text-left'} ${menuItemHover}`}>
                            <ImageIcon size={16} className="text-emerald-500" />{t('share_image')}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col text-sm font-bold max-h-[300px] overflow-y-auto custom-scrollbar relative">
                        <WithHelp labelKey="label_back" position="bottom" className="w-full sticky top-0 z-10">
                            <button
                                onClick={() => setMenuView('main')}
                                className={`w-full flex items-center gap-3 px-4 py-3 border-b transition-colors font-black ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-600'}`}
                            >
                                {dir === 'rtl' ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                                {t('back_to_menu')}
                            </button>
                        </WithHelp>

                        {COMMENTATORS.map((c) => {
                            const isAvailable = availableCommentators.has(c.id);
                            return (
                                <button
                                    key={c.id}
                                    disabled={isLoadingCommentaries || !isAvailable}
                                    onClick={() => isAvailable && onOpenCommentary(c.sefariaPrefix)}
                                    className={`flex items-center justify-between gap-3 px-4 py-2.5 transition-colors ${dir === 'rtl' ? 'text-right' : 'text-left'} 
                                        ${(isLoadingCommentaries || !isAvailable)
                                            ? 'opacity-50 cursor-not-allowed bg-black/5 dark:bg-white/5 grayscale'
                                            : menuItemHover
                                        }`}
                                >
                                    <span>{t(c.labelKey)}</span>
                                    {isLoadingCommentaries && <Loader2 size={12} className="animate-spin text-indigo-500" />}
                                    {!isLoadingCommentaries && isAvailable && <ExternalLink size={12} className="opacity-40" />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReaderContextMenu;
