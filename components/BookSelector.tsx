
import React from 'react';
import { BIBLE_BOOKS } from '../constants';
import { BibleBook, BibleSection } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
    onSelectBook: (book: BibleBook) => void;
}

const BookSelector: React.FC<Props> = ({ onSelectBook }) => {
    const { t, getBookName } = useLanguage();

    const sections = [
        { id: 'section_torah', titleKey: BibleSection.Torah, color: 'bg-amber-50 text-amber-700 border-amber-200', icon: '📜' },
        { id: 'section_nevim', titleKey: BibleSection.Nevim, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '⚔️' },
        { id: 'section_ketuvim', titleKey: BibleSection.Ketuvim, color: 'bg-sky-50 text-sky-700 border-sky-200', icon: '🖋️' },
    ];

    const getTranslatedSectionTitle = (sectionKey: BibleSection) => {
        if (sectionKey === BibleSection.Torah) return t('section_torah');
        if (sectionKey === BibleSection.Nevim) return t('section_nevim');
        if (sectionKey === BibleSection.Ketuvim) return t('section_ketuvim');
        return sectionKey;
    };

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black text-slate-800">{t('select_book_title')}</h2>
                <p className="text-slate-500">{t('select_book_subtitle')}</p>
            </div>

            {sections.map((section) => (
                <div key={section.id} className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <span className="text-2xl">{section.icon}</span>
                        <h3 className="text-xl font-bold text-slate-700">{getTranslatedSectionTitle(section.titleKey)}</h3>
                        <div className="h-px flex-1 bg-slate-200"></div>
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {BIBLE_BOOKS.filter(b => b.section === section.titleKey).map((book) => (
                            <button
                                key={book.id}
                                onClick={() => onSelectBook(book)}
                                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all hover:shadow-md active:scale-95 group ${section.color}`}
                            >
                                <span className="text-lg font-black group-hover:scale-110 transition-transform">{getBookName(book.id)}</span>
                                <span className="text-[10px] opacity-70 font-bold mt-1">{book.chaptersCount} {t('chapters_count')}</span>
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BookSelector;
