import React, { useEffect, useState } from 'react';
import { ParashaData, Verse } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Scroll, Loader2, Calendar, BookOpen } from 'lucide-react';
import { fetchParashaVerses } from '../services/bibleService';
import { numberToHebrew } from '../utils/gematria';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    parasha: ParashaData;
    isDarkMode: boolean;
}

const ParashaSummaryModal: React.FC<Props> = ({ isOpen, onClose, parasha, isDarkMode }) => {
    const { t, dir, language } = useLanguage();
    const [verses, setVerses] = useState<Verse[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && parasha) {
            setIsLoading(true);
            setVerses([]);
            fetchParashaVerses(parasha).then(data => {
                setVerses(data);
                setIsLoading(false);
            });
        }
    }, [isOpen, parasha]);

    if (!isOpen) return null;

    const modalBg = isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-white text-slate-900 border-slate-200';
    const verseTextClass = isDarkMode ? 'text-slate-100' : 'text-slate-900';
    const headerBg = isDarkMode ? 'bg-indigo-900/30 border-indigo-800' : 'bg-indigo-50 border-indigo-100';

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-0 md:p-6 backdrop-blur-sm" onClick={onClose}>
            <div 
                className={`w-full h-full md:h-[85vh] md:max-w-2xl md:rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${modalBg}`}
                onClick={(e) => e.stopPropagation()}
                dir={dir}
            >
                {/* Fixed Header */}
                <div className={`p-4 border-b flex items-center justify-between shrink-0 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                         <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-md">
                            <Scroll size={22} />
                         </div>
                         <div>
                            <h3 className="font-bold text-xl leading-none tracking-tight">{t('label_parasha')}: {parasha.hebrewName}</h3>
                            <p className="text-xs opacity-60 mt-1 font-bold">{parasha.date} | {parasha.hebrewDate}</p>
                         </div>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 bg-slate-800/50' : 'hover:bg-slate-100 bg-slate-50'}`}>
                        <X size={20} />
                    </button>
                </div>
                
                {/* Meta Information Bar */}
                <div className={`px-4 py-3 flex flex-col gap-2 border-b shrink-0 ${headerBg} ${isDarkMode ? 'border-indigo-900' : 'border-indigo-100'}`}>
                    <div className="flex items-center justify-between text-xs font-bold opacity-80">
                        <div className="flex items-center gap-2">
                            <BookOpen size={14} className="text-indigo-500" />
                            <span>
                                {numberToHebrew(parasha.ref.chapter)}:{numberToHebrew(parasha.ref.verse)} - {numberToHebrew(parasha.endRef.chapter)}:{numberToHebrew(parasha.endRef.verse)}
                            </span>
                        </div>
                        
                        {parasha.shabbatTimes && (
                            <div className="flex items-center gap-2">
                                <Calendar size={14} className="text-indigo-500" />
                                <span>{t('shabbat_entry')}: {parasha.shabbatTimes.candles}</span>
                                <span className="opacity-40">|</span>
                                <span>{t('shabbat_exit')}: {parasha.shabbatTimes.havdalah}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                            <Loader2 size={40} className="animate-spin text-indigo-500" />
                            <span className="font-bold text-sm">טוען את פסוקי הפרשה...</span>
                        </div>
                    ) : (
                        <div className={`space-y-4 font-serif text-2xl leading-relaxed text-justify ${verseTextClass}`} style={{ fontFamily: 'Frank Ruhl Libre' }}>
                            {verses.map((v, idx) => {
                                const isNewChapter = idx > 0 && v.chapter !== verses[idx - 1].chapter;
                                return (
                                    <React.Fragment key={`${v.chapter}-${v.verse}`}>
                                        {isNewChapter && (
                                            <div className="flex items-center gap-4 my-8 opacity-40">
                                                <div className="h-px bg-current flex-1"></div>
                                                <span className="text-sm font-sans font-bold">פרק {language === 'he' ? numberToHebrew(v.chapter) : v.chapter}</span>
                                                <div className="h-px bg-current flex-1"></div>
                                            </div>
                                        )}
                                        <span className="inline">
                                            <span className="text-xs font-sans font-bold opacity-50 select-none mx-1 relative -top-1">
                                                {language === 'he' ? numberToHebrew(v.verse) : v.verse}
                                            </span>
                                            {v.text}{' '}
                                        </span>
                                    </React.Fragment>
                                );
                            })}
                            
                            <div className="mt-12 mb-4 flex items-center justify-center opacity-50 gap-2">
                                <div className="w-16 h-px bg-current"></div>
                                <span className="text-xs font-bold font-sans">{t('parasha_end')} {parasha.hebrewName}</span>
                                <div className="w-16 h-px bg-current"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParashaSummaryModal;