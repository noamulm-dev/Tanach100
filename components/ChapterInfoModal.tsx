
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X, FileText, Hash, Info, BookOpen } from 'lucide-react';
import { BibleBook } from '../types';
import { numberToHebrew } from '../utils/gematria';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    book: BibleBook;
    chapter: number;
    verseCount: number;
    totalBookVerses: number;
    isDarkMode: boolean;
}

// Temporary mock data for chapter descriptions
// In a real app, this would be fetched from a DB or API
const CHAPTER_METADATA: Record<string, { subject: string; summary: string }> = {
    'Genesis_1': {
        subject: 'בריאת העולם',
        summary: 'תיאור ששת ימי הבריאה: יצירת האור, הרקיע, היבשה והצומח, המאורות, הדגים והעופות, חיות היבשה והאדם בצלם אלוהים.'
    },
    'Genesis_2': {
        subject: 'השבת וגן עדן',
        summary: 'קידוש היום השביעי, תיאור נוסף של יצירת האדם, נטיעת גן עדן, יצירת האישה מהצלע.'
    }
    // Add more chapters as needed...
};

const ChapterInfoModal: React.FC<Props> = ({ 
    isOpen, onClose, book, chapter, verseCount, totalBookVerses, isDarkMode 
}) => {
    const { t, getBookName, dir, language } = useLanguage();

    if (!isOpen) return null;

    const modalBgClass = isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-white text-slate-900 border-slate-200';
    const itemBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100';

    const metadata = CHAPTER_METADATA[`${book.id}_${chapter}`];
    const subject = metadata?.subject || t('info_unavailable');
    const summary = metadata?.summary || t('info_unavailable');
    
    const displayChapter = language === 'he' ? numberToHebrew(chapter) : chapter;

    return (
        <>
            <div className="fixed inset-0 z-[100] bg-black/20" onClick={onClose}></div>
            <div 
                className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-[90%] max-w-sm rounded-2xl shadow-2xl border p-0 overflow-hidden animate-in zoom-in-95 duration-200 ${modalBgClass}`}
                dir={dir}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-md">
                            <Info size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg leading-none">{t('chapter_info_title')}</h3>
                            <p className="text-xs opacity-60 mt-1 font-medium">{getBookName(book.id)} • {t('chapter')} {displayChapter}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 ${itemBg}`}>
                            <Hash size={18} className="text-indigo-500 mb-1" />
                            <span className="text-2xl font-black">{verseCount}</span>
                            <span className="text-[10px] font-bold opacity-60">{t('verses_in_chapter')}</span>
                        </div>
                        <div className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center gap-1 ${itemBg}`}>
                            <BookOpen size={18} className="text-emerald-500 mb-1" />
                            <span className="text-2xl font-black">{totalBookVerses}</span>
                            <span className="text-[10px] font-bold opacity-60">{t('total_verses_book')}</span>
                        </div>
                    </div>

                    <div className={`h-px w-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>

                    {/* Subject */}
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider">
                            <FileText size={14} />
                            {t('chapter_subject')}
                        </div>
                        <div className={`p-3 rounded-xl border text-sm font-medium leading-relaxed ${itemBg}`}>
                            {subject}
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                         <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider">
                            <FileText size={14} />
                            {t('chapter_summary')}
                        </div>
                        <div className={`p-3 rounded-xl border text-sm leading-relaxed opacity-90 ${itemBg}`}>
                            {summary}
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default ChapterInfoModal;
