
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Book, Scroll, Library, Search, X } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onExpandScope: () => void;
    currentScope: 'current' | 'torah' | 'tanakh';
    query: string;
    isDarkMode: boolean;
}

const SearchSuggestion: React.FC<Props> = ({
    isOpen,
    onClose,
    onExpandScope,
    currentScope,
    query,
    isDarkMode
}) => {
    const { t, dir } = useLanguage();

    if (!isOpen) return null;

    // Determine next scope and labels
    let nextScopeLabel = '';
    let nextScopeIcon = null;
    let title = t('no_results_title') || 'לא נמצאו תוצאות';
    let message = t('no_results_message') || 'הביטוי לא נמצא בטווח החיפוש הנוכחי.';
    let canExpand = true;

    if (currentScope === 'current') {
        nextScopeLabel = t('scope_torah') || 'תורה';
        nextScopeIcon = <Scroll size={18} />;
    } else if (currentScope === 'torah') {
        nextScopeLabel = t('scope_tanakh') || 'תנ"ך';
        nextScopeIcon = <Library size={18} />;
    } else {
        // Tanakh - Nowhere else to go
        canExpand = false;
        message = t('no_results_tanakh') || 'הביטוי לא נמצא בכל התנ"ך.';
    }

    const modalBg = isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200';
    const textMain = isDarkMode ? 'text-white' : 'text-slate-900';
    const textSub = isDarkMode ? 'text-slate-400' : 'text-slate-600';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`relative w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden p-6 flex flex-col items-center text-center gap-4 ${modalBg}`}
                dir={dir}
            >
                <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    <Search size={32} strokeWidth={1.5} />
                </div>

                <h3 className={`text-lg font-bold ${textMain}`}>
                    {canExpand ? `להרחיב את החיפוש?` : `לא נמצאו תוצאות`}
                </h3>

                <p className={`${textSub} text-sm leading-relaxed`}>
                    <span className="font-bold">"{query}"</span><br />
                    {currentScope === 'tanakh'
                        ? 'לא נמצא באף ספר בתנ"ך.'
                        : 'לא נמצא בטווח הנוכחי. האם לחפש ב'}
                    {canExpand && (
                        <span className="font-bold text-indigo-500 mx-1">{nextScopeLabel}</span>
                    )}
                    {canExpand && '?'}
                </p>

                <div className="flex items-center gap-3 w-full mt-2">
                    <button
                        onClick={onClose}
                        className={`flex-1 py-2.5 rounded-xl font-bold transition-all ${isDarkMode
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {canExpand ? 'לא' : 'סגור'}
                    </button>

                    {canExpand && (
                        <button
                            onClick={onExpandScope}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 ${isDarkMode ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-indigo-600 hover:bg-indigo-700'
                                }`}
                        >
                            {nextScopeIcon}
                            <span>חפש ב{nextScopeLabel}</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchSuggestion;
