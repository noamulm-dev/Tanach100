
import React, { useState, useEffect, useRef } from 'react';
import { BibleBook, BibleSection } from '../types';
import { BIBLE_BOOKS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { numberToHebrew } from '../utils/gematria';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentBook: BibleBook;
    currentChapter: number;
    onSelectBook: (book: BibleBook, chapter?: number, verse?: number) => void;
    isDarkMode: boolean;
}

const BookSelectionModal: React.FC<Props> = ({ 
    isOpen, onClose, currentBook, currentChapter, onSelectBook, isDarkMode 
}) => {
    const { t, getBookName, dir, language } = useLanguage();
    const [selectedBookId, setSelectedBookId] = useState<string>(currentBook.id);
    const [tempChapter, setTempChapter] = useState(currentChapter);

    const bookListRef = useRef<HTMLDivElement>(null);
    const chapterListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setSelectedBookId(currentBook.id);
            setTempChapter(currentChapter);
        }
    }, [isOpen, currentBook, currentChapter]);

    useEffect(() => {
        if (!isOpen) return;
        const timer = setTimeout(() => {
            if (bookListRef.current) {
                const targetId = selectedBookId || currentBook.id;
                const activeBookBtn = bookListRef.current.querySelector(`[data-book-id="${targetId}"]`);
                if (activeBookBtn) activeBookBtn.scrollIntoView({ block: 'center' });
            }
            if (chapterListRef.current) {
                const activeChapterBtn = chapterListRef.current.querySelector(`[data-chapter="${tempChapter}"]`);
                if (activeChapterBtn) activeChapterBtn.scrollIntoView({ block: 'center' });
            }
        }, 50);
        return () => clearTimeout(timer);
    }, [isOpen]); 

    const handleBookClick = (book: BibleBook) => {
        if (book.id === selectedBookId) {
            onSelectBook(book, 1, 1);
            onClose();
        } else {
            setSelectedBookId(book.id);
            setTempChapter(1); 
            if (chapterListRef.current) chapterListRef.current.scrollTop = 0;
        }
    };

    const handleChapterClick = (chapter: number) => {
        const book = BIBLE_BOOKS.find(b => b.id === selectedBookId);
        if (book) {
            onSelectBook(book, chapter, 1);
            onClose();
        }
    };

    if (!isOpen) return null;

    const sections = [
        { id: BibleSection.Torah, label: 'section_torah' },
        { id: BibleSection.Nevim, label: 'section_nevim' },
        { id: BibleSection.Ketuvim, label: 'section_ketuvim' },
    ];

    const selectedBookObj = BIBLE_BOOKS.find(b => b.id === selectedBookId) || BIBLE_BOOKS[0];
    const chaptersArray = Array.from({ length: selectedBookObj.chaptersCount }, (_, i) => i + 1);

    const modalBgClass = isDarkMode ? 'bg-slate-900 text-slate-100 border-slate-700' : 'bg-white text-slate-900 border-slate-200';
    const panelBorder = isDarkMode ? 'border-slate-800' : 'border-slate-100';

    return (
        <div className="fixed inset-0 z-[50] flex items-center justify-center p-4 bg-black/40 animate-in fade-in duration-200 backdrop-blur-sm" onClick={onClose}>
            <div 
                className={`w-[60vw] max-w-[260px] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${modalBgClass} border h-[70vh] max-h-[600px]`}
                onClick={(e) => e.stopPropagation()} 
                dir={dir}
            >
                <div className="flex flex-1 overflow-hidden">
                    {/* Books Column */}
                    <div className={`w-[70%] flex flex-col border-${dir === 'rtl' ? 'l' : 'r'} ${panelBorder}`}>
                        <div ref={bookListRef} className="flex-1 overflow-y-auto no-scrollbar pb-10">
                            {sections.map(section => {
                                const sectionBooks = BIBLE_BOOKS.filter(b => b.section === section.id);
                                if (sectionBooks.length === 0) return null;
                                return (
                                    <React.Fragment key={section.id}>
                                        <div className="flex items-center gap-1 px-3 py-2 mt-2 mb-1 opacity-50">
                                            <span className="text-xs font-black whitespace-nowrap uppercase tracking-tighter">{t(section.label)}</span>
                                            <div className={`h-px flex-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            {sectionBooks.map(book => (
                                                <button
                                                    key={book.id}
                                                    data-book-id={book.id}
                                                    onClick={() => handleBookClick(book)}
                                                    className={`w-full text-right rtl:text-right ltr:text-left px-3 py-2 text-lg font-bold leading-none tracking-tight transition-all ${
                                                        selectedBookId === book.id
                                                        ? (isDarkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-900')
                                                        : (isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50')
                                                    }`}
                                                >
                                                    {getBookName(book.id)}
                                                </button>
                                            ))}
                                        </div>
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>

                    {/* Chapters Column */}
                    <div className="w-[30%] flex flex-col bg-slate-50/50 dark:bg-slate-800/20">
                        <div ref={chapterListRef} className="flex-1 overflow-y-auto no-scrollbar pb-10 pt-2">
                             <div className="flex flex-col gap-0.5">
                                {chaptersArray.map(ch => (
                                    <button
                                        key={ch}
                                        data-chapter={ch}
                                        onClick={() => handleChapterClick(ch)}
                                        className={`w-full py-2 px-1 text-center text-lg font-bold leading-none tracking-tight transition-all ${
                                            tempChapter === ch
                                            ? 'bg-indigo-600 text-white'
                                            : (isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-200')
                                        }`}
                                    >
                                        {language === 'he' ? numberToHebrew(ch) : ch}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookSelectionModal;
