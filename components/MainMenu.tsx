import React, { useState } from 'react';
import { Type, HardDrive, CircleHelp, ChevronRight, ChevronLeft, Globe, Check, ToggleLeft, ToggleRight, HelpCircle, Scroll, Library, Volume2, MonitorSmartphone } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language, ParashaData } from '../types';
import { APP_VERSION } from '../constants';
import WithHelp from './WithHelp';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    activeTab: string;
    setActiveTab: (tab: 'reader' | 'settings' | 'help' | 'library' | 'simulation') => void;
    isDarkMode: boolean;
    openSettingsModal: () => void;
    openThemeModal: () => void;
    isSynced: boolean;
    currentParasha: ParashaData | null;
    onJumpToParasha: () => void;
    onOpenDevPage: () => void;
    onToggleTTS: () => void;
    onOpenLegacyMatrix: () => void;
}

const LANGUAGES: { code: Language, label: string }[] = [
    { code: 'he', label: 'עברית' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
];

const MainMenu: React.FC<Props> = ({
    isOpen, onClose, activeTab, setActiveTab, isDarkMode,
    openSettingsModal, isSynced, currentParasha, onJumpToParasha, onOpenDevPage, onToggleTTS, onOpenLegacyMatrix
}) => {
    const { t, dir, language, setLanguage, showHelpLabels, setShowHelpLabels } = useLanguage();
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const [devClicks, setDevClicks] = useState(0);

    if (!isOpen) return null;

    const modalBgClass = isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900';
    const modalBorderClass = isDarkMode ? 'border-slate-800' : 'border-slate-200';

    const handleNavigation = (tab: 'reader' | 'settings' | 'help' | 'library' | 'simulation') => {
        setActiveTab(tab);
        onClose();
    };

    const handleVersionClick = () => {
        const newCount = devClicks + 1;
        setDevClicks(newCount);
        if (newCount >= 7) {
            onOpenDevPage();
            setDevClicks(0);
            onClose();
        }
    };

    const menuItemClass = (active: boolean) => `w-full flex items-center justify-start p-3 rounded-xl transition-all font-bold group active:scale-95 ${active
        ? (isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-indigo-50 text-indigo-700')
        : (isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-indigo-50 hover:text-indigo-700 text-slate-700')
        }`;

    return (
        <>
            <div className="fixed inset-0 z-[70] bg-black/20" onClick={onClose}></div>
            <div
                className={`absolute z-[80] w-max min-w-[200px] max-w-[260px] rounded-2xl shadow-2xl border p-2 animate-in slide-in-from-top-2 fade-in duration-200 ${dir === 'rtl' ? 'left-2 origin-top-left' : 'right-2 origin-top-right'} flex flex-col gap-1 ${modalBgClass} ${modalBorderClass} overflow-visible max-h-[85vh] overflow-y-auto custom-scrollbar`}
                style={{ top: 'calc(54px + env(safe-area-inset-top))' }}
            >
                <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider text-start">{t('menu_main')}</div>

                {currentParasha && (
                    <WithHelp labelKey="label_parasha" position="left" className="w-full">
                        <button
                            onClick={() => { onJumpToParasha(); onClose(); }}
                            className={menuItemClass(false)}
                        >
                            <span className="flex items-center gap-3 w-full">
                                <Scroll size={18} className="text-indigo-500 shrink-0" />
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-xs opacity-70 mb-0.5">{t('label_parasha')}</span>
                                    <span className="text-sm truncate max-w-[120px]">{currentParasha.hebrewName}</span>
                                </div>
                            </span>
                        </button>
                    </WithHelp>
                )}

                <div className={`h-px w-full my-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}></div>

                {/* Library Button */}
                <WithHelp labelKey="menu_library" position="left" className="w-full">
                    <button onClick={() => handleNavigation('library')} className={menuItemClass(activeTab === 'library')}>
                        <span className="flex items-center gap-3">
                            <Library size={18} className={activeTab === 'library' ? 'text-indigo-500' : 'text-slate-400 group-hover:text-indigo-600'} />
                            <span>{t('menu_library')}</span>
                        </span>
                    </button>
                </WithHelp>

                {/* TTS Button */}
                <WithHelp labelKey="label_tts" position="left" className="w-full">
                    <button onClick={() => { onToggleTTS(); onClose(); }} className={menuItemClass(false)}>
                        <span className="flex items-center gap-3">
                            <Volume2 size={18} className="text-slate-400 group-hover:text-indigo-600" />
                            <span>{t('label_tts')}</span>
                        </span>
                    </button>
                </WithHelp>



                <div className={`h-px w-full my-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}></div>

                <WithHelp labelKey="label_design_menu" position="left" className="w-full">
                    <button
                        onClick={() => { openSettingsModal(); onClose(); }}
                        className={menuItemClass(false)}
                    >
                        <span className="flex items-center gap-3">
                            <Type size={18} className="text-slate-400 group-hover:text-indigo-600" />
                            {t('menu_design')}
                        </span>
                    </button>
                </WithHelp>

                <WithHelp labelKey="label_db_manager" position="left" className="w-full">
                    <button onClick={() => handleNavigation('settings')} className={menuItemClass(activeTab === 'settings')}>
                        <span className="flex items-center gap-3">
                            <HardDrive size={18} className={activeTab === 'settings' ? 'text-indigo-500' : 'text-slate-400 group-hover:text-indigo-600'} />
                            <div className="flex flex-col items-start">
                                <span>{t('db_management')}</span>
                                {isSynced && <span className="text-[9px] font-normal opacity-70 text-emerald-500">{t('synced')}</span>}
                            </div>
                        </span>
                    </button>
                </WithHelp>

                <div className={`h-px w-full my-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}></div>

                {/* Legacy Matrix */}
                <button onClick={() => { onOpenLegacyMatrix(); onClose(); }} className={menuItemClass(false)}>
                    <span className="flex items-center gap-3">
                        <MonitorSmartphone size={18} className="text-slate-400 group-hover:text-amber-600" />
                        <span>{t('menu_matrix_legacy') || 'מטריצה (ישן)'}</span>
                    </span>
                </button>

                <div className={`h-px w-full my-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}></div>

                <div className="relative">
                    <WithHelp labelKey="label_language" position="left" className="w-full">
                        <button onClick={() => { setIsLanguageMenuOpen(!isLanguageMenuOpen); }} className={menuItemClass(false)}>
                            {dir === 'rtl' ? (
                                <><span className="flex items-center gap-3"><Globe size={18} className={isLanguageMenuOpen ? 'text-indigo-500' : 'text-slate-400 group-hover:text-indigo-600'} />{t('language')}</span><ChevronRight size={16} className="opacity-50 mr-auto" /></>
                            ) : (
                                <><span className="flex items-center gap-3"><Globe size={18} className={isLanguageMenuOpen ? 'text-indigo-500' : 'text-slate-400 group-hover:text-indigo-600'} />{t('language')}</span><ChevronLeft size={16} className="opacity-50 ml-auto" /> </>
                            )}
                        </button>
                    </WithHelp>

                    {isLanguageMenuOpen && (
                        <div className={`absolute top-0 w-36 p-2 rounded-xl shadow-xl border z-[90] animate-in zoom-in-95 duration-200 flex flex-col gap-1 ${dir === 'rtl' ? 'left-full ml-2 top-0' : 'right-full mr-2 top-0'} ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                            {LANGUAGES.map((lang) => (
                                <button key={lang.code} onClick={() => { setLanguage(lang.code); onClose(); }} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${language === lang.code ? (isDarkMode ? 'bg-indigo-900/40 text-indigo-300' : 'bg-slate-50 shadow-sm text-indigo-700 font-bold') : (isDarkMode ? 'text-slate-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-50 hover:shadow-sm')}`}>
                                    {lang.label}{language === lang.code && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div
                    onClick={handleVersionClick}
                    className="mt-auto pt-4 pb-2 text-center text-sm font-mono font-bold text-red-600 cursor-pointer select-none active:scale-95 transition-transform"
                >
                    v{APP_VERSION}
                </div>
            </div>
        </>
    );
};

export default MainMenu;
