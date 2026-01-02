
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Check, Sun, Moon } from 'lucide-react';
import { ThemeSettings, ThemeColors } from '../types';
import WithHelp from './WithHelp';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentSettings: ThemeSettings;
    onSettingsChange: (settings: ThemeSettings) => void;
    isDarkMode: boolean;
    setIsDarkMode: (isDark: boolean) => void;
}

// --- HSV/HEX Helpers moved outside component to prevent recreation ---
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
    let r = 0, g = 0, b = 0; // Initialize with default
    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s / 100);
    const q = v * (1 - f * s / 100);
    const t = v * (1 - (1 - f) * s / 100);
    
    // Normalize to 0-1 for assignment
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
    
    // Ensure r,g,b are defined numbers before using
    const toHex = (x: number = 0) => {
        const hex = Math.round(x * 255).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// --- Theme Presets Definition ---
const PRESETS = [
    {
        id: 'classic',
        label: 'קלאסי',
        settings: {
            light: {
                bgMain: '#ffffff',       
                bgPaper: '#fffbf0',      
                textMain: '#0f1745',     
                textSecondary: '#64748b', 
                accent: '#4338ca'        
            },
            dark: {
                bgMain: '#020617',
                bgPaper: '#0f172a',
                textMain: '#f1f5f9',
                textSecondary: '#94a3b8',
                accent: '#818cf8'
            }
        }
    },
    {
        id: 'warm',
        label: 'חם',
        settings: {
            light: {
                bgMain: '#f5f5dc',
                bgPaper: '#fdf6e3', // Solarized Light Paper
                textMain: '#5d4037', // Brown
                textSecondary: '#8d6e63',
                accent: '#d84315' // Deep Orange
            },
            dark: {
                bgMain: '#1e1b18',
                bgPaper: '#2b2623', // Deep Cocoa
                textMain: '#d7ccc8',
                textSecondary: '#a1887f',
                accent: '#ffab91'
            }
        }
    },
    {
        id: 'forest',
        label: 'רענן',
        settings: {
            light: {
                bgMain: '#f1f8e9',
                bgPaper: '#ffffff',
                textMain: '#1b5e20', // Green
                textSecondary: '#558b2f',
                accent: '#2e7d32'
            },
            dark: {
                bgMain: '#051a10',
                bgPaper: '#0d2e1e', // Dark Forest
                textMain: '#e0f2f1',
                textSecondary: '#80cbc4',
                accent: '#69f0ae'
            }
        }
    }
];

const ThemeModal: React.FC<Props> = ({ 
    isOpen, onClose, 
    currentSettings, onSettingsChange,
    isDarkMode, setIsDarkMode
}) => {
    const { t, dir } = useLanguage();

    // Use lazy initialization for state to ensure correct initial values on mount
    const [initialSettings] = useState<ThemeSettings>(() => JSON.parse(JSON.stringify(currentSettings)));
    const [initialMode] = useState<boolean>(isDarkMode);
    
    // Ensure activeTab starts with the current mode
    const [activeTab, setActiveTab] = useState<'light' | 'dark'>(isDarkMode ? 'dark' : 'light');

    // Force sync activeTab with isDarkMode prop whenever it changes.
    // This ensures that if the user toggles the mode (even via this modal), 
    // the tab updates to match the visible screen.
    useEffect(() => {
        setActiveTab(isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

    const [activeAttribute, setActiveAttribute] = useState<keyof ThemeColors>('textMain'); 

    // Initialize HSV based on the current active attribute and mode
    const [hsv, setHsv] = useState(() => {
        const mode = isDarkMode ? 'dark' : 'light';
        const color = currentSettings[mode].textMain;
        return hexToHsv(color);
    });
    
    // Refs for drag interaction
    const paletteRef = useRef<HTMLDivElement>(null);
    const [isDraggingPalette, setIsDraggingPalette] = useState(false);

    // Update HSV when switching tabs or attributes
    useEffect(() => {
        const color = currentSettings[activeTab][activeAttribute];
        setHsv(hexToHsv(color));
    }, [activeTab, activeAttribute]);

    const handleCancel = () => {
        if (initialSettings) {
            onSettingsChange(initialSettings);
            setIsDarkMode(initialMode);
        }
        onClose();
    };

    const handleApplyPreset = (presetSettings: ThemeSettings) => {
        // Apply the new settings
        onSettingsChange(presetSettings);
        
        // Update the slider to match the new color of the currently selected attribute
        const color = presetSettings[activeTab][activeAttribute];
        setHsv(hexToHsv(color));
    };

    // Update settings live when HSV changes
    const updateColorFromHsv = (h: number, s: number, v: number) => {
        const hex = hsvToHex(h, s, v);
        const newSettings = { ...currentSettings };
        newSettings[activeTab] = {
            ...newSettings[activeTab],
            [activeAttribute]: hex
        };
        onSettingsChange(newSettings);
        setHsv({ h, s, v });
    };

    // --- Palette Drag Logic ---
    const handlePaletteMove = useCallback((clientX: number, clientY: number) => {
        if (!paletteRef.current) return;
        const rect = paletteRef.current.getBoundingClientRect();
        // Force LTR logic even if app is RTL
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        
        // x is Saturation (0 -> 100)
        // y is Value (100 -> 0)
        updateColorFromHsv(hsv.h, x * 100, (1 - y) * 100);
    }, [hsv.h, activeTab, activeAttribute, currentSettings]);

    const onPaletteMouseDown = (e: React.MouseEvent) => {
        setIsDraggingPalette(true);
        handlePaletteMove(e.clientX, e.clientY);
    };

    const onPaletteTouchStart = (e: React.TouchEvent) => {
        setIsDraggingPalette(true);
        handlePaletteMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    useEffect(() => {
        const handleWindowMove = (e: MouseEvent) => {
            if (isDraggingPalette) {
                e.preventDefault(); // prevent scroll
                handlePaletteMove(e.clientX, e.clientY);
            }
        };
        const handleWindowUp = () => setIsDraggingPalette(false);
        
        const handleWindowTouchMove = (e: TouchEvent) => {
             if (isDraggingPalette) {
                 e.preventDefault(); // prevent scroll
                 handlePaletteMove(e.touches[0].clientX, e.touches[0].clientY);
             }
        };

        if (isDraggingPalette) {
            window.addEventListener('mousemove', handleWindowMove);
            window.addEventListener('mouseup', handleWindowUp);
            window.addEventListener('touchmove', handleWindowTouchMove, { passive: false });
            window.addEventListener('touchend', handleWindowUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleWindowMove);
            window.removeEventListener('mouseup', handleWindowUp);
            window.removeEventListener('touchmove', handleWindowTouchMove);
            window.removeEventListener('touchend', handleWindowUp);
        };
    }, [isDraggingPalette, handlePaletteMove]);


    const handleTabChange = (mode: 'light' | 'dark') => {
        setActiveTab(mode);
        // This switches the main app background immediately so the user sees the effect
        setIsDarkMode(mode === 'dark');
    };

    if (!isOpen) return null;

    const modalBgClass = isDarkMode 
        ? 'bg-slate-900/95 backdrop-blur-xl text-slate-100 border-slate-800' 
        : 'bg-white/95 backdrop-blur-xl text-slate-900 border-slate-200';

    // Renamed attributes and removed icons
    const attributes: { id: keyof ThemeColors, label: string }[] = [
        { id: 'textMain', label: 'טקסט ראשי' },
        { id: 'bgPaper', label: 'רקע קריאה' },
        { id: 'bgMain', label: 'רקע כותרות' },
        { id: 'accent', label: 'פסוק' },
        { id: 'textSecondary', label: 'תוויות' },
    ];

    return (
        <>
            <div className="fixed inset-0 z-[100]" onClick={handleCancel}></div>
            
            <div 
                className={`fixed bottom-0 left-0 right-0 sm:bottom-4 sm:left-4 sm:right-4 sm:mx-auto sm:max-w-xs z-[101] rounded-t-3xl sm:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.3)] border flex flex-col animate-in slide-in-from-bottom-4 duration-300 ${modalBgClass}`}
                onClick={(e) => e.stopPropagation()} 
                dir={dir}
                style={{ maxHeight: '60vh' }}
            >
                {/* Header: Presets and Mode Toggle */}
                <div className={`flex items-center justify-between px-3 py-3 shrink-0 border-b ${isDarkMode ? 'border-slate-700/50' : 'border-slate-200/50'}`}>
                    
                    {/* Left Side: Presets and Mode */}
                    <div className="flex items-center gap-3">
                        {/* Preset Buttons */}
                        <div className="flex items-center gap-1.5">
                            {PRESETS.map((preset) => (
                                <WithHelp key={preset.id} labelKey={`theme_${preset.id}` as any} position="bottom">
                                    <button
                                        onClick={() => handleApplyPreset(preset.settings)}
                                        className="w-8 h-8 rounded-full shadow-sm ring-1 ring-black/10 hover:scale-110 active:scale-95 transition-transform overflow-hidden relative"
                                        title={preset.label}
                                    >
                                        <div 
                                            className="absolute inset-0"
                                            style={{
                                                background: `linear-gradient(135deg, ${preset.settings.light.bgPaper} 50%, ${preset.settings.dark.bgPaper} 50%)`
                                            }}
                                        ></div>
                                    </button>
                                </WithHelp>
                            ))}
                        </div>

                        <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                        
                        {/* Mode Toggle */}
                        <div className={`flex p-1 rounded-xl ${isDarkMode ? 'bg-black/40' : 'bg-slate-100'}`}>
                             <WithHelp labelKey="label_mode_light" position="bottom">
                                 <button
                                    onClick={() => handleTabChange('light')}
                                    className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                                        activeTab === 'light'
                                        ? 'bg-white text-indigo-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    <Sun size={14} />
                                </button>
                             </WithHelp>
                            <WithHelp labelKey="label_mode_dark" position="bottom">
                                <button
                                    onClick={() => handleTabChange('dark')}
                                    className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                                        activeTab === 'dark'
                                        ? 'bg-slate-700 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                    }`}
                                >
                                    <Moon size={14} />
                                </button>
                            </WithHelp>
                        </div>
                    </div>
                    
                    {/* Right Side: Actions */}
                    <div className="flex items-center gap-2">
                        <WithHelp labelKey="label_cancel" position="bottom">
                            <button 
                                onClick={handleCancel}
                                className={`p-2.5 rounded-full transition-colors flex items-center justify-center ${isDarkMode ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                            >
                                <X size={22} strokeWidth={2.5} />
                            </button>
                        </WithHelp>

                        <WithHelp labelKey="label_confirm" position="bottom">
                            <button 
                                onClick={() => onClose()}
                                className={`p-2.5 rounded-full transition-colors flex items-center justify-center ${isDarkMode ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                            >
                                <Check size={22} strokeWidth={3} />
                            </button>
                        </WithHelp>
                    </div>
                </div>

                {/* Attribute Selector - Text Only, Compact */}
                <div className="px-3 py-2 border-b border-transparent">
                    <div className="flex gap-1 overflow-x-auto no-scrollbar justify-between">
                        {attributes.map(attr => {
                            const isActive = activeAttribute === attr.id;
                            const currentColor = currentSettings[activeTab][attr.id];
                            return (
                                <WithHelp key={attr.id} labelKey="label_color_attr" position="top">
                                    <button
                                        onClick={() => setActiveAttribute(attr.id)}
                                        className={`flex flex-col items-center gap-1.5 p-1.5 rounded-lg border transition-all flex-1 min-w-0 ${
                                            isActive
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md transform scale-105'
                                            : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-600')
                                        }`}
                                    >
                                        <span className="text-[10px] font-bold truncate w-full text-center leading-tight">{attr.label}</span>
                                        <div className="w-8 h-2.5 rounded-full opacity-90 shadow-sm border border-black/10" style={{ backgroundColor: currentColor }}></div>
                                    </button>
                                </WithHelp>
                            );
                        })}
                    </div>
                </div>

                {/* Color Picker Studio - Enforce LTR for correct slider behavior */}
                <div className="p-3 flex flex-col gap-3" dir="ltr">
                    
                    {/* 1. Saturation / Value Area */}
                    <div 
                        ref={paletteRef}
                        className="w-full h-32 rounded-xl relative cursor-crosshair touch-none shadow-inner overflow-hidden ring-1 ring-black/10"
                        style={{
                            backgroundColor: hsvToHex(hsv.h, 100, 100),
                            backgroundImage: `
                                linear-gradient(to top, #000, transparent),
                                linear-gradient(to right, #fff, transparent)
                            `
                        }}
                        onMouseDown={onPaletteMouseDown}
                        onTouchStart={onPaletteTouchStart}
                    >
                        <div 
                            className="absolute w-5 h-5 rounded-full border-2 border-white shadow-[0_0_2px_rgba(0,0,0,0.5)] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={{
                                left: `${hsv.s}%`,
                                top: `${100 - hsv.v}%`,
                                backgroundColor: hsvToHex(hsv.h, hsv.s, hsv.v)
                            }}
                        ></div>
                    </div>

                    {/* 2. Hue Slider only - removed Hex display */}
                    <div className="flex items-center gap-3">
                        <div className="h-8 flex-1 rounded-lg relative overflow-hidden shadow-sm ring-1 ring-black/10">
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)' }}></div>
                            <input 
                                type="range" 
                                min="0" max="360" 
                                value={hsv.h}
                                onChange={(e) => updateColorFromHsv(parseFloat(e.target.value), hsv.s, hsv.v)}
                                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                            />
                            <div 
                                className="absolute top-0 bottom-0 w-2 bg-white border border-slate-300 shadow-sm pointer-events-none"
                                style={{ left: `${(hsv.h / 360) * 100}%`, transform: 'translateX(-50%)' }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ThemeModal;
