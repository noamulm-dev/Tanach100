
import React, { useState, useEffect, useRef } from 'react';
import { X, Type, Palette, ArrowUpFromLine, AlignJustify, Minus, Plus, Sun, Moon, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { ReaderStyle, ThemeSettings, ThemeColors } from '../types';
import { FONT_OPTIONS } from '../constants';
import WithHelp from './WithHelp';

// --- Color Helpers ---
function hexToHsv(hex: string) {
    let r = 0, g = 0, b = 0;
    const hx = hex.replace('#', '');
    if (hx.length === 3) {
        r = parseInt(hx[0] + hx[0], 16);
        g = parseInt(hx[1] + hx[1], 16);
        b = parseInt(hx[2] + hx[2], 16);
    } else if (hx.length === 6) {
        r = parseInt(hx.substring(0, 2), 16);
        g = parseInt(hx.substring(2, 4), 16);
        b = parseInt(hx.substring(4, 6), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, v: v * 100 };
}

function hsvToHex(h: number, s: number, v: number) {
    let r = 0, g = 0, b = 0;
    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s / 100);
    const q = v * (1 - f * s / 100);
    const t = v * (1 - (1 - f) * s / 100);

    const v1 = v / 100;
    const p1 = p / 100;
    const q1 = q / 100;
    const t1 = t / 100;

    switch (i % 6) {
        case 0: r = v1; g = t1; b = p1; break;
        case 1: r = q1; g = v1; b = p1; break;
        case 2: r = p1; g = v1; b = t1; break;
        case 3: r = p1; g = q1; b = v1; break;
        case 4: r = t1; g = p1; b = v1; break;
        case 5: r = v1; g = p1; b = q1; break;
    }

    const toHex = (x: number = 0) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

const PRESETS = [
    {
        id: 'classic',
        label: 'קלאסי',
        settings: {
            light: { bgMain: '#ffffff', bgPaper: '#fffbf0', textMain: '#0f1745', textSecondary: '#64748b', accent: '#4338ca' },
            dark: { bgMain: '#020617', bgPaper: '#0f172a', textMain: '#f1f5f9', textSecondary: '#94a3b8', accent: '#818cf8' }
        }
    },
    {
        id: 'warm',
        label: 'חם',
        settings: {
            light: { bgMain: '#f5f5dc', bgPaper: '#fdf6e3', textMain: '#5d4037', textSecondary: '#8d6e63', accent: '#d84315' },
            dark: { bgMain: '#1e1b18', bgPaper: '#2b2623', textMain: '#d7ccc8', textSecondary: '#a1887f', accent: '#ffab91' }
        }
    },
    {
        id: 'forest',
        label: 'רענן',
        settings: {
            light: { bgMain: '#f1f8e9', bgPaper: '#ffffff', textMain: '#1b5e20', textSecondary: '#558b2f', accent: '#2e7d32' },
            dark: { bgMain: '#051a10', bgPaper: '#0d2e1e', textMain: '#e0f2f1', textSecondary: '#80cbc4', accent: '#69f0ae' }
        }
    }
];

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentStyle: ReaderStyle;
    onStyleChange: (style: ReaderStyle) => void;
    currentSettings: ThemeSettings;
    onSettingsChange: (settings: ThemeSettings) => void;
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
    dir: 'rtl' | 'ltr';
}

const SettingsModal: React.FC<Props> = ({
    isOpen, onClose,
    currentStyle, onStyleChange,
    currentSettings, onSettingsChange,
    isDarkMode, setIsDarkMode,
    dir
}) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'typography' | 'theme'>('typography');

    // Theme State
    const [themeModeTab, setThemeModeTab] = useState<'light' | 'dark'>(isDarkMode ? 'dark' : 'light');
    const [activeAttribute, setActiveAttribute] = useState<keyof ThemeColors>('textMain');
    const [hsv, setHsv] = useState({ h: 0, s: 0, v: 0 });
    const paletteRef = useRef<HTMLDivElement>(null);
    const [isDraggingPalette, setIsDraggingPalette] = useState(false);

    // Initial State for Revert/Cancel functionality
    const [initialStyle, setInitialStyle] = useState<ReaderStyle | null>(null);
    const [initialSettings, setInitialSettings] = useState<ThemeSettings | null>(null);
    const [initialDarkMode, setInitialDarkMode] = useState<boolean | null>(null);

    // Capture initial state when modal opens
    useEffect(() => {
        if (isOpen) {
            setInitialStyle({ ...currentStyle });
            setInitialSettings(JSON.parse(JSON.stringify(currentSettings)));
            setInitialDarkMode(isDarkMode);
            // Also sync internal tab state
            setThemeModeTab(isDarkMode ? 'dark' : 'light');
        }
    }, [isOpen]);

    // Handle Cancel (X button) - Revert changes
    const handleCancel = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (initialStyle) onStyleChange(initialStyle);
        if (initialSettings) onSettingsChange(initialSettings);
        if (initialDarkMode !== null && initialDarkMode !== isDarkMode) setIsDarkMode(initialDarkMode);
        onClose();
    };

    // Handle Confirm (V button or Outside click) - Keep changes
    const handleConfirm = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        // Only close if clicked directly on the backdrop, not bubbles
        if (e.target === e.currentTarget) {
            handleConfirm(e);
        }
    };

    // Sync themeModeTab with isDarkMode prop changes (only if not dragging to avoid loops)
    useEffect(() => {
        if (!isDraggingPalette) {
            setThemeModeTab(isDarkMode ? 'dark' : 'light');
        }
    }, [isDarkMode, isDraggingPalette]);

    // Update HSV when switching tabs/attributes
    useEffect(() => {
        if (isOpen) {
            const color = currentSettings[themeModeTab][activeAttribute];
            setHsv(hexToHsv(color));
        }
    }, [themeModeTab, activeAttribute, currentSettings, isOpen]);

    if (!isOpen) return null;

    // Define colors for Chrome-style tabs
    const headerBg = isDarkMode ? 'bg-slate-950' : 'bg-slate-100'; // Darker header for contrast
    const bodyBg = isDarkMode ? 'bg-slate-900' : 'bg-white'; // Body background
    const borderColor = isDarkMode ? 'border-slate-800' : 'border-slate-300';
    const textColor = isDarkMode ? 'text-slate-100' : 'text-slate-900';

    const renderCompactStepper = (icon: React.ReactNode, label: string, valueDisplay: string, onDec: () => void, onInc: () => void) => (
        <div
            className={`flex flex-col items-center justify-center p-1 rounded-lg border h-full ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
            onClick={e => { e.preventDefault(); e.stopPropagation(); }}
            onMouseDown={e => e.stopPropagation()}
        >
            <span className="text-[9px] font-bold opacity-60 flex items-center gap-1 mb-0.5">{icon} {label}</span>
            <div className="flex items-center gap-1 w-full justify-between px-1">
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDec(); }} onMouseDown={e => e.stopPropagation()} className={`p-0.5 rounded-md ${isDarkMode ? 'hover:bg-slate-700 bg-black/20' : 'hover:bg-slate-200 bg-white shadow-sm'}`}><Minus size={10} /></button>
                <span className="text-xs font-bold tabular-nums">{valueDisplay}</span>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onInc(); }} onMouseDown={e => e.stopPropagation()} className={`p-0.5 rounded-md ${isDarkMode ? 'hover:bg-slate-700 bg-black/20' : 'hover:bg-slate-200 bg-white shadow-sm'}`}><Plus size={10} /></button>
            </div>
        </div>
    );

    const updateColorFromHsv = (h: number, s: number, v: number) => {
        const hex = hsvToHex(h, s, v);
        const newSettings = { ...currentSettings };
        newSettings[themeModeTab] = {
            ...newSettings[themeModeTab],
            [activeAttribute]: hex
        };
        onSettingsChange(newSettings);
        setHsv({ h, s, v });
    };

    const handlePaletteMove = (clientX: number, clientY: number) => {
        if (!paletteRef.current) return;
        const rect = paletteRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        updateColorFromHsv(hsv.h, x * 100, (1 - y) * 100);
    };

    const onPaletteMouseDown = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDraggingPalette(true);
        handlePaletteMove(e.clientX, e.clientY);
    };

    const handleApplyPreset = (presetSettings: ThemeSettings) => {
        onSettingsChange(presetSettings);
        const color = presetSettings[themeModeTab][activeAttribute];
        setHsv(hexToHsv(color));
    };

    const attributes: { id: keyof ThemeColors, label: string }[] = [
        { id: 'textMain', label: 'טקסט ראשי' },
        { id: 'bgPaper', label: 'רקע קריאה' },
        { id: 'bgMain', label: 'רקע כותרות' },
        { id: 'accent', label: 'הדגשות' },
        { id: 'textSecondary', label: 'משני' },
    ];

    const getTabClass = (isActive: boolean) => {
        // Significantly increased padding (py-3.5) to double the height visually
        if (isActive) {
            return `relative px-4 py-3.5 text-[13px] font-bold rounded-t-lg border-t border-x ${borderColor} ${bodyBg} ${textColor} -mb-[1px] z-10`;
        }
        return `relative px-4 py-3.5 text-[13px] font-bold rounded-t-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent hover:bg-black/5 dark:hover:bg-white/5`;
    };

    return (
        <div className="fixed inset-0 z-[100] bg-transparent flex items-end sm:items-center justify-center sm:p-4 pointer-events-none">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/5 pointer-events-auto" onClick={handleBackdropClick} onMouseUp={() => setIsDraggingPalette(false)} onMouseMove={(e) => isDraggingPalette && handlePaletteMove(e.clientX, e.clientY)}></div>

            <div
                className={`w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 pointer-events-auto ${bodyBg} ${borderColor} z-50`}
                onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                onMouseDown={e => e.stopPropagation()}
                dir={dir}
            >
                {/* Header Container - Increased height */}
                <div className={`flex items-end justify-between px-2 pt-1 border-b ${borderColor} ${headerBg} shrink-0`}>

                    {/* Tabs */}
                    <div className="flex gap-0.5 overflow-x-auto no-scrollbar items-end pl-1">
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('typography'); }} onMouseDown={e => e.stopPropagation()} className={getTabClass(activeTab === 'typography')}>
                            <span className="flex items-center gap-1.5"><Type size={14} /> {t('design_fonts')}</span>
                        </button>
                        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveTab('theme'); }} onMouseDown={e => e.stopPropagation()} className={getTabClass(activeTab === 'theme')}>
                            <span className="flex items-center gap-1.5"><Palette size={14} /> צבעים</span>
                        </button>
                    </div>

                    {/* Actions - Larger buttons (p-3) */}
                    <div className="flex items-center gap-2 pb-2 px-2">
                        <button
                            onClick={handleConfirm}
                            onMouseDown={e => e.stopPropagation()}
                            className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 active:scale-95 transition-all shadow-sm"
                            title={t('confirm')}
                        >
                            <Check size={22} strokeWidth={3} />
                        </button>
                        <button
                            onClick={handleCancel}
                            onMouseDown={e => e.stopPropagation()}
                            className={`p-3 rounded-xl transition-all active:scale-95 ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}
                            title={t('label_cancel')}
                        >
                            <X size={22} />
                        </button>
                    </div>
                </div>

                {/* Content Body */}
                <div className={`p-3 overflow-y-auto custom-scrollbar h-[240px] ${textColor}`}>
                    {activeTab === 'typography' ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col">
                            {/* Steppers */}
                            <div className="grid grid-cols-3 gap-2 h-12 shrink-0 mb-3">
                                {renderCompactStepper(
                                    <Type size={10} />,
                                    t('size'),
                                    `${Math.round(currentStyle.fontSize * 100)}%`,
                                    () => onStyleChange({ ...currentStyle, fontSize: Math.max(0.5, parseFloat((currentStyle.fontSize - 0.05).toFixed(2))) }),
                                    () => onStyleChange({ ...currentStyle, fontSize: Math.min(2.0, parseFloat((currentStyle.fontSize + 0.05).toFixed(2))) })
                                )}
                                {renderCompactStepper(
                                    <ArrowUpFromLine size={10} />,
                                    t('height'),
                                    currentStyle.lineHeight.toFixed(1),
                                    () => onStyleChange({ ...currentStyle, lineHeight: Math.max(1.0, parseFloat((currentStyle.lineHeight - 0.1).toFixed(1))) }),
                                    () => onStyleChange({ ...currentStyle, lineHeight: Math.min(3.0, parseFloat((currentStyle.lineHeight + 0.1).toFixed(1))) })
                                )}
                                {renderCompactStepper(
                                    <AlignJustify size={10} />,
                                    t('spacing'),
                                    currentStyle.verseSpacing.toFixed(1),
                                    () => onStyleChange({ ...currentStyle, verseSpacing: Math.max(0.0, parseFloat((currentStyle.verseSpacing - 0.1).toFixed(1))) }),
                                    () => onStyleChange({ ...currentStyle, verseSpacing: Math.min(2.0, parseFloat((currentStyle.verseSpacing + 0.1).toFixed(1))) })
                                )}
                            </div>

                            {/* Font Grid - Label Removed, Text increased to 16px */}
                            <div className="flex-1 overflow-y-auto no-scrollbar">
                                <div className="grid grid-cols-5 gap-1">
                                    {FONT_OPTIONS.map(font => (
                                        <button
                                            key={font.id}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onStyleChange({ ...currentStyle, fontFamily: font.id });
                                            }}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            className={`h-8 px-0.5 rounded-lg border text-[16px] font-bold flex items-center justify-center text-center transition-all leading-tight break-words ${currentStyle.fontFamily === font.id
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md ring-1 ring-indigo-200 dark:ring-indigo-900'
                                                    : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50')
                                                }`}
                                            style={{ fontFamily: font.id }}
                                            title={font.label}
                                        >
                                            {font.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Top Row: Presets & Mode */}
                            <div className="flex justify-between items-center shrink-0">
                                <div className="flex gap-2">
                                    {PRESETS.map((preset) => (
                                        <WithHelp key={preset.id} labelKey={`theme_${preset.id}` as any} position="bottom">
                                            <button
                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleApplyPreset(preset.settings); }}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                className="w-7 h-7 rounded-full shadow-sm ring-1 ring-black/10 hover:scale-110 active:scale-95 transition-transform overflow-hidden relative"
                                            >
                                                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${preset.settings.light.bgPaper} 50%, ${preset.settings.dark.bgPaper} 50%)` }}></div>
                                            </button>
                                        </WithHelp>
                                    ))}
                                </div>
                                <div className={`flex p-0.5 rounded-lg ${isDarkMode ? 'bg-black/40' : 'bg-slate-100'}`}>
                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setThemeModeTab('light'); setIsDarkMode(false); }} onMouseDown={e => e.stopPropagation()} className={`px-2 py-0.5 rounded-md transition-all ${themeModeTab === 'light' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} title="יום"><Sun size={20} /></button>
                                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setThemeModeTab('dark'); setIsDarkMode(true); }} onMouseDown={e => e.stopPropagation()} className={`px-2 py-0.5 rounded-md transition-all ${themeModeTab === 'dark' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`} title="לילה"><Moon size={20} /></button>
                                </div>
                            </div>

                            {/* Middle Row: Attributes */}
                            <div className="flex gap-1 overflow-x-auto no-scrollbar justify-between shrink-0">
                                {attributes.map(attr => {
                                    const isActive = activeAttribute === attr.id;
                                    const currentColor = currentSettings[themeModeTab][attr.id];
                                    return (
                                        <button
                                            key={attr.id}
                                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveAttribute(attr.id); }}
                                            onMouseDown={e => e.stopPropagation()}
                                            className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all flex-1 min-w-0 ${isActive
                                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-105'
                                                    : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-600')
                                                }`}
                                        >
                                            <span className="text-[10px] font-bold truncate w-full text-center">{attr.label}</span>
                                            <div className="w-4 h-4 rounded-full shadow-sm border border-black/10" style={{ backgroundColor: currentColor }}></div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Bottom: Palette (Fills remaining space) */}
                            <div
                                className="flex flex-col gap-2 flex-1 min-h-0"
                                dir="ltr"
                                onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                                onMouseDown={e => e.stopPropagation()}
                            >
                                <div
                                    ref={paletteRef}
                                    className="flex-1 w-full rounded-xl relative cursor-crosshair touch-none shadow-inner overflow-hidden ring-1 ring-black/10 min-h-[60px]"
                                    style={{
                                        backgroundColor: hsvToHex(hsv.h, 100, 100),
                                        backgroundImage: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)`
                                    }}
                                    onMouseDown={onPaletteMouseDown}
                                    onTouchStart={e => { setIsDraggingPalette(true); handlePaletteMove(e.touches[0].clientX, e.touches[0].clientY); }}
                                    onTouchMove={e => { if (isDraggingPalette) handlePaletteMove(e.touches[0].clientX, e.touches[0].clientY); }}
                                >
                                    <div
                                        className="absolute w-5 h-5 rounded-full border-2 border-white shadow-[0_0_2px_rgba(0,0,0,0.5)] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                                        style={{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, backgroundColor: hsvToHex(hsv.h, hsv.s, hsv.v) }}
                                    ></div>
                                </div>
                                <div className="h-3 rounded-full relative overflow-hidden shadow-sm ring-1 ring-black/10 shrink-0">
                                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}></div>
                                    <input
                                        type="range" min="0" max="360" value={hsv.h}
                                        onChange={(e) => updateColorFromHsv(parseFloat(e.target.value), hsv.s, hsv.v)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onClick={e => { e.preventDefault(); e.stopPropagation(); }}
                                        onMouseDown={e => e.stopPropagation()}
                                    />
                                    {/* Handle indicator */}
                                    <div
                                        className="absolute top-0 bottom-0 w-1.5 bg-white border border-slate-400 shadow-sm pointer-events-none"
                                        style={{ left: `${(hsv.h / 360) * 100}%`, transform: 'translateX(-50%)' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
