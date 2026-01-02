
import React, { useState, useEffect, useRef } from 'react';
import { GematriaMethod, ThemeProfile } from '../types';
import { calculateGematria } from '../utils/gematria';
import { Calculator, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import WithHelp from './WithHelp';

interface Props {
    initialText?: string;
    onClose?: () => void;
    activeTheme: ThemeProfile;
}

const GematriaTools: React.FC<Props> = ({ initialText = '', onClose, activeTheme }) => {
    const { t, dir } = useLanguage();
    const [text, setText] = useState(initialText);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initialize with Standard and Mispar Katan by default
    const [activeMethods, setActiveMethods] = useState<GematriaMethod[]>([
        GematriaMethod.Standard, 
        GematriaMethod.MisparKatan
    ]);

    useEffect(() => {
        if (initialText) {
            setText(initialText);
        }
    }, [initialText]);

    // Auto-resize textarea based on content
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const newHeight = Math.max(90, textareaRef.current.scrollHeight);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [text]);

    const toggleMethod = (method: GematriaMethod) => {
        setActiveMethods(prev => 
            prev.includes(method) 
                ? prev.filter(m => m !== method) 
                : [...prev, method]
        );
    };

    const words = text.trim().split(/\s+/).filter(w => w.length > 0);

    // Configuration for the methods with specific text colors
    const methodsConfig = [
        { 
            method: GematriaMethod.Standard,
            label: t('method_standard'), 
            colorClass: 'text-blue-600',
        },
        { 
            method: GematriaMethod.MisparKatan, 
            label: t('method_katan'), 
            colorClass: 'text-emerald-600',
        },
        { 
            method: GematriaMethod.MisparGadol, 
            label: t('method_gadol'), 
            colorClass: 'text-purple-600',
        },
        { 
            method: GematriaMethod.Siduri, 
            label: t('method_siduri'), 
            colorClass: 'text-amber-600',
        },
        { 
            method: GematriaMethod.Atbash, 
            label: t('method_atbash'), 
            colorClass: 'text-rose-600',
        },
    ];

    return (
        <div className={`flex flex-col h-full relative ${activeTheme.bgMain}`}>
            
            {/* Header Section: Title and Close Button */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0" dir={dir}>
                <h2 className={`text-lg font-bold ${activeTheme.textSecondary} opacity-80`}>
                    חישוב גימטריות
                </h2>
                {onClose && (
                    <WithHelp labelKey="label_close" position="bottom">
                        <button 
                            onClick={onClose}
                            className={`p-2 rounded-full shadow-sm transition-all ${activeTheme.bgPaper} ${activeTheme.textSecondary} ${activeTheme.hover}`}
                        >
                            <X size={24} />
                        </button>
                    </WithHelp>
                )}
            </div>

            {/* Main Scrollable Content (Input + Summaries + Words) */}
            <div className="flex-1 overflow-y-auto px-3 pb-4 custom-scrollbar">
                
                {/* Input Area - Detached with gap and auto-resize */}
                <textarea 
                    ref={textareaRef}
                    dir="rtl"
                    placeholder={t('gematria_placeholder')}
                    className={`w-full rounded-xl px-3 py-2 text-xl font-serif font-bold outline-none resize-none transition-all shadow-sm mb-2 mt-4 ${activeTheme.bgPaper} ${activeTheme.textMain} placeholder-slate-400/50 focus:ring-2 focus:ring-indigo-500 z-10 relative overflow-hidden`}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    style={{ minHeight: '90px' }}
                />

                {/* Totals Summary - Detached */}
                <div className={`mb-4 p-3 rounded-xl border ${activeTheme.bgPaper} ${activeTheme.border}`}>
                    <div className="flex flex-wrap justify-start items-center gap-x-6 gap-y-2">
                        {methodsConfig.map(({ method, label, colorClass }) => {
                            const isActive = activeMethods.includes(method);
                            const total = calculateGematria(text, method);
                            
                            return (
                                <WithHelp key={method} labelKey="label_gematria_method" position="top">
                                    <div
                                        onClick={() => toggleMethod(method)}
                                        className={`flex items-baseline gap-2 cursor-pointer select-none transition-all duration-300 ${
                                            isActive 
                                            ? 'opacity-100' 
                                            : 'opacity-40 grayscale hover:opacity-60 hover:grayscale-0'
                                        }`}
                                    >
                                        <span className={`text-sm font-bold tracking-wide font-sans ${colorClass}`}>
                                            {label}
                                        </span>
                                        <span className={`text-2xl font-black ${colorClass}`}>
                                            {total}
                                        </span>
                                    </div>
                                </WithHelp>
                            );
                        })}
                    </div>
                </div>

                {/* Word Analysis Visualization */}
                {words.length > 0 ? (
                    <div className="flex flex-wrap gap-x-1.5 gap-y-4 content-start justify-start pb-10" dir="rtl">
                        {words.map((word, idx) => (
                            <div key={`${word}-${idx}`} className="flex flex-col items-start min-w-[40px] p-1">
                                {/* The Word */}
                                <span className={`text-2xl font-bold font-sans mb-0 leading-tight ${activeTheme.textMain}`}>{word}</span>
                                
                                {/* Values Display - Increased font size */}
                                <div className="flex flex-col gap-0 items-start mt-0 w-full">
                                    {methodsConfig.map(config => {
                                        // Only render if this method is active
                                        if (!activeMethods.includes(config.method)) return null;
                                        
                                        return (
                                            <div key={config.method} className="flex flex-col items-start">
                                                <span 
                                                    className={`text-lg font-black leading-none ${config.colorClass}`}
                                                    title={config.label}
                                                >
                                                     {calculateGematria(word, config.method)}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center mt-10 opacity-50">
                        <Calculator size={48} className={`mb-2 ${activeTheme.textSecondary}`} />
                        <p className={activeTheme.textSecondary}>{t('gematria_no_text')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GematriaTools;
