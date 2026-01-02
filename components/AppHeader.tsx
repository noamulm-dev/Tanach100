
import React from 'react';
import { Book, Menu, Moon, Sun, Box, Layout, Grid3X3, Grid2X2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { BibleBook, ParashaData, ViewMode } from '../types';
import { numberToHebrew } from '../utils/gematria';
import WithHelp from './WithHelp';

interface Props {
    isReaderMode: boolean;
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    toggleTTSPanel: () => void;
    toggleMenu: () => void;
    isTTSPanelOpen: boolean;
    isMenuOpen: boolean;
    selectedBook: BibleBook | null;
    selectedChapter: number;
    currentVerse: number;
    hoveredVerse?: { chapter: number, verse: number } | null; // Added
    openBookModal: () => void;
    viewMode: ViewMode;
    setViewMode: (mode: ViewMode) => void;
    currentParasha: ParashaData | null;
    onJumpToParasha: () => void;
    onOpenLibrary?: () => void;
}

const AppHeader: React.FC<Props> = ({
    isReaderMode, isDarkMode, toggleDarkMode, toggleMenu,
    isMenuOpen, selectedBook, selectedChapter, currentVerse, hoveredVerse, openBookModal,
    viewMode, setViewMode
}) => {
    const { t, getBookName, language, dir } = useLanguage();

    const headerClass = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
    const selectClass = isDarkMode
        ? 'bg-slate-800 text-indigo-300 hover:bg-slate-700'
        : 'bg-white text-slate-700 hover:bg-slate-50';

    // Definition of the view tabs - Icons only
    const VIEW_TABS: { id: ViewMode; icon: React.ElementType; label: string }[] = [
        { id: '2D', icon: Layout, label: 'רגיל' },
        { id: 'Matrix', icon: Grid3X3, label: 'מטריצה' },
        { id: '3D', icon: Box, label: 'תלת מימד' },
    ];

    const renderChromeTabs = () => {
        // Define colors for the active tab to match the body content
        // Dark Mode: Content is bg-slate-950 (#020617)
        // Light Mode: Content is bg-slate-50 (#f8fafc) based on standard light theme
        const activeColors = isDarkMode
            ? { fill: '#020617', stroke: '#1e293b', bg: 'bg-slate-950', border: 'border-slate-800', text: 'text-indigo-400' }
            : { fill: '#f8fafc', stroke: '#e2e8f0', bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-indigo-600' };

        return (
            <div className="flex items-end h-full px-2 gap-1" dir={dir}>
                {VIEW_TABS.map((tab) => {
                    const isActive = viewMode === tab.id;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setViewMode(tab.id)}
                            className={`
                                relative flex items-center justify-center px-4 py-2 min-w-[60px] transition-all
                                group select-none rounded-t-lg
                                ${isActive
                                    ? `z-10 ${activeColors.text} ${activeColors.bg} border-t border-x ${activeColors.border}`
                                    : `text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 border-transparent`
                                }
                            `}
                            // Pull active tab down 1px to cover the header border
                            style={{ marginBottom: isActive ? '-1px' : '0', paddingBottom: isActive ? '9px' : '8px' }}
                            title={tab.label}
                        >
                            <tab.icon
                                size={24}
                                strokeWidth={isActive ? 2.5 : 2}
                                className={`transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}
                            />

                            {/* Chrome-like SVG Curve Effect for Active Tab */}
                            {isActive && (
                                <>
                                    {/* Left Curve */}
                                    <svg width="12" height="12" viewBox="0 0 12 12"
                                        className="absolute -left-[12px] bottom-0 pointer-events-none"
                                        style={{ fill: activeColors.fill, stroke: activeColors.stroke }}
                                    >
                                        <path d="M 12,12 L 12,0 Q 12,12 0,12 Z" stroke="none" />
                                        <path d="M 0,12 Q 12,12 12,0" fill="none" strokeWidth="1" />
                                    </svg>

                                    {/* Right Curve */}
                                    <svg width="12" height="12" viewBox="0 0 12 12"
                                        className="absolute -right-[12px] bottom-0 pointer-events-none"
                                        style={{ fill: activeColors.fill, stroke: activeColors.stroke }}
                                    >
                                        <path d="M 0,12 L 0,0 Q 0,12 12,12 Z" stroke="none" />
                                        <path d="M 0,0 Q 0,12 12,12" fill="none" strokeWidth="1" />
                                    </svg>

                                    {/* Bottom Hider: Hides the header's bottom border under the tab */}
                                    <div
                                        className={`absolute -bottom-[1px] left-0 right-0 h-[2px] ${activeColors.bg}`}
                                        style={{ zIndex: 20 }}
                                    ></div>
                                </>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    };

    const iconBtnClass = (active: boolean) => `flex-1 flex items-center justify-center px-2 h-full transition-all active:scale-90 ${active
        ? 'bg-indigo-600 text-white shadow-inner'
        : (isDarkMode ? 'text-indigo-400 hover:bg-slate-800' : 'text-indigo-600 hover:bg-slate-100')
        }`;

    return (
        <header className={`shrink-0 z-[60] shadow-sm flex flex-col border-b overflow-hidden relative ${headerClass}`}>
            {/* Safe Area Spacer */}
            <div className="w-full bg-inherit h-[env(safe-area-inset-top)]"></div>

            {/* Main Content Bar */}
            <div className="h-[52px] flex items-stretch w-full">
                {isReaderMode ? (
                    <>
                        {/* Book Selector */}
                        <div className="w-[95px] shrink-0 h-full border-l border-current/10 overflow-hidden relative z-20">
                            <WithHelp labelKey="label_book_selector" position="bottom" className="w-full h-full">
                                <button
                                    onClick={openBookModal}
                                    className={`flex flex-col justify-center items-start gap-0 px-2 w-full h-full transition-colors text-right border-none active:bg-black/5 dark:active:bg-white/5 ${selectClass}`}
                                >
                                    <span className="font-black text-[20px] leading-[0.9] whitespace-nowrap overflow-hidden text-ellipsis w-full -mb-0.5 tracking-tight">
                                        {selectedBook ? getBookName(selectedBook.id) : t('select_book_title')}
                                    </span>
                                    {selectedBook && (
                                        <span className={`font-bold text-[14px] leading-none ${hoveredVerse ? 'text-indigo-500 font-black' : 'opacity-70'}`}>
                                            {language === 'he'
                                                ? hoveredVerse
                                                    ? `${numberToHebrew(hoveredVerse.chapter)}:${numberToHebrew(hoveredVerse.verse)}`
                                                    : `${numberToHebrew(selectedChapter)}:${numberToHebrew(currentVerse)}`
                                                : hoveredVerse
                                                    ? `${hoveredVerse.chapter}:${hoveredVerse.verse}`
                                                    : `${selectedChapter}:${currentVerse}`
                                            }
                                        </span>
                                    )}
                                </button>
                            </WithHelp>
                        </div>

                        {/* Actions Area */}
                        <div className="flex-1 flex items-end justify-between min-w-0 pr-0 relative">

                            {/* Tabs Section - Flexible width, aligned bottom */}
                            <div className="flex-1 overflow-hidden h-full flex items-end pl-2">
                                {renderChromeTabs()}
                            </div>

                            {/* Right Icons Section */}
                            <div className="flex items-center h-full border-r border-current/10 shrink-0 z-20 bg-inherit px-1 gap-1">
                                <WithHelp labelKey="label_theme_toggle" position="bottom" className="h-[42px] w-[42px] my-auto">
                                    <button onClick={toggleDarkMode} className={`w-full h-full rounded-xl flex items-center justify-center transition-all active:scale-90 ${isDarkMode ? 'hover:bg-slate-800 text-indigo-400' : 'hover:bg-slate-100 text-indigo-600'}`}>
                                        {isDarkMode ? <Moon size={22} className="text-yellow-400" /> : <Sun size={22} className="text-orange-500" />}
                                    </button>
                                </WithHelp>

                                <WithHelp labelKey="label_main_menu" position="bottom" className="h-[42px] w-[42px] my-auto">
                                    <button onClick={toggleMenu} className={`w-full h-full rounded-xl flex items-center justify-center transition-all active:scale-90 ${isMenuOpen ? 'bg-indigo-600 text-white shadow-sm' : (isDarkMode ? 'hover:bg-slate-800 text-indigo-400' : 'hover:bg-slate-100 text-indigo-600')}`}>
                                        <Menu size={24} />
                                    </button>
                                </WithHelp>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex justify-between items-stretch w-full h-full">
                        <div className="flex flex-col items-center leading-none">
                            {selectedBook && (
                                <>
                                    <span className="text-[20px] font-bold">{getBookName(selectedBook.id)}</span>
                                    <span className={`text-[22px] opacity-75 ${hoveredVerse ? 'text-indigo-500 font-black' : ''}`}>
                                        {language === 'he'
                                            ? hoveredVerse
                                                ? `${numberToHebrew(hoveredVerse.chapter)}:${numberToHebrew(hoveredVerse.verse)}`
                                                : `${numberToHebrew(selectedChapter)}:${numberToHebrew(currentVerse)}`
                                            : hoveredVerse
                                                ? `${hoveredVerse.chapter}:${hoveredVerse.verse}`
                                                : `${selectedChapter}:${currentVerse}`
                                        }
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="flex items-stretch h-full">
                            <WithHelp labelKey="label_theme_toggle" position="bottom">
                                <button onClick={toggleDarkMode} className={iconBtnClass(false)}>
                                    {isDarkMode ? <Moon size={20} className="text-yellow-400" /> : <Sun size={20} className="text-orange-500" />}
                                </button>
                            </WithHelp>

                            <WithHelp labelKey="label_main_menu" position="bottom">
                                <button onClick={toggleMenu} className={iconBtnClass(isMenuOpen)}>
                                    <Menu size={24} />
                                </button>
                            </WithHelp>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
};

export default AppHeader;
