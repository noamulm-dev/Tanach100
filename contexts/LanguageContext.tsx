
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS, BOOK_NAMES } from '../constants';
import { storageService } from '../services/storageService';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    getBookName: (bookId: string) => string;
    dir: 'rtl' | 'ltr';
    showHelpLabels: boolean;
    setShowHelpLabels: (show: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => (storageService.loadLanguage() as Language) || 'he');
    const [showHelpLabels, setShowHelpLabels] = useState(false);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        storageService.saveLanguage(lang);
    };

    const t = (key: string): string => {
        return TRANSLATIONS[key]?.[language] || key;
    };

    const getBookName = (bookId: string): string => {
        return BOOK_NAMES[bookId]?.[language] || bookId;
    };

    const dir = language === 'he' ? 'rtl' : 'ltr';

    useEffect(() => {
        document.documentElement.dir = dir;
        document.documentElement.lang = language;
    }, [dir, language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, getBookName, dir, showHelpLabels, setShowHelpLabels }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
