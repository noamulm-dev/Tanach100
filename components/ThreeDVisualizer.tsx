
import React, { useState, useEffect, useMemo } from 'react';
import { RotateCcw, ZoomIn, ZoomOut, X, Box, Loader2, Palette, Type, Move, Plus, Minus, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SearchResult } from '../types';
import { ELS_COLORS } from './VerseItem';
import { fetchLettersWindow, fetchLettersNext, fetchLettersPrev } from '../services/bibleService';

interface Props {
    elsResult?: SearchResult | null;
    searchResults?: SearchResult[];
    activeResult?: SearchResult | null;
    currentContext?: { bookId: string, chapter: number, verse: number };
    onClose: () => void;
    isDarkMode: boolean;
}

interface CubeLetter {
    char: string;
    isMatch: boolean;
    bookId: string;
    chapter: number;
    verse: number;
    letterIdx: number;
    color?: string;
    groupId?: number;
    gx: number;
    gy: number;
    gz: number;
    delay: number;
}

interface CubeStyleConfig {
    id: string;
    name: string;
    ordinaryText: (dark: boolean) => string;
    matchGlowIntensity: number;
    textWeight: string;
    textOpacity: number;
    glowSize: string;
}

const CUBE_STYLES: CubeStyleConfig[] = [
    { id: 'hologram', name: 'Holographic', ordinaryText: (d) => d ? '#6366f1' : '#4f46e5', matchGlowIntensity: 0.8, textWeight: '900', textOpacity: 0.7, glowSize: 'blur-2xl' },
    { id: 'classic', name: 'Classic', ordinaryText: (d) => d ? '#f8fafc' : '#0f172a', matchGlowIntensity: 0.6, textWeight: '800', textOpacity: 0.9, glowSize: 'blur-xl' },
    { id: 'neon', name: 'Neon', ordinaryText: (d) => '#22c55e', matchGlowIntensity: 1.0, textWeight: '900', textOpacity: 0.5, glowSize: 'blur-3xl' },
    { id: 'minimal', name: 'Pure', ordinaryText: (d) => d ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)', matchGlowIntensity: 0.7, textWeight: '900', textOpacity: 1, glowSize: 'blur-xl' }
];

const CUBE_SIZE = 7;
const TOTAL_LETTERS = Math.pow(CUBE_SIZE, 3);

const LetterNode: React.FC<{ 
    item: CubeLetter; isDarkMode: boolean; style: CubeStyleConfig; rotation: { x: number, y: number }; letterSize: number; spacing: number;
}> = ({ item, isDarkMode, style, rotation, letterSize, spacing }) => {
    const ordinaryTextColor = style.ordinaryText(isDarkMode);
    const centerOffset = (CUBE_SIZE - 1) / 2;
    const ox = (item.gx - centerOffset) * spacing;
    const oy = (item.gy - centerOffset) * spacing;
    const oz = (item.gz - centerOffset) * spacing;
    const billboardTransform = `rotateY(${-rotation.y}deg) rotateX(${-rotation.x}deg)`;
    const baseFontSize = item.isMatch ? letterSize * 1.4 : letterSize;
    return (
        <div 
            className="absolute animate-in zoom-in duration-700 ease-out fill-mode-backwards flex items-center justify-center transition-all"
            style={{ width: 40, height: 40, left: '50%', top: '50%', marginLeft: -20, marginTop: -20, transform: `translate3d(${ox}px, ${oy}px, ${oz}px) ${billboardTransform}`, transformStyle: 'preserve-3d', zIndex: item.isMatch ? 100 : 0, animationDelay: `${item.delay}ms`, backfaceVisibility: 'visible' }}
        >
            {item.isMatch && <div className={`absolute inset-0 rounded-full ${style.glowSize} transition-all duration-500 animate-pulse`} style={{ backgroundColor: item.color, transform: 'translateZ(-2px) scale(1.5)', opacity: style.matchGlowIntensity * 0.4 }}></div>}
            <span 
                className={`select-none pointer-events-none transition-all duration-500 text-center leading-none ${item.isMatch ? "scale-125 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" : "scale-100"}`}
                style={{ color: item.isMatch ? 'white' : ordinaryTextColor, fontWeight: item.isMatch ? '900' : style.textWeight, fontSize: `${baseFontSize}px`, opacity: item.isMatch ? 1 : style.textOpacity, textShadow: item.isMatch ? `0 0 10px ${item.color}, 0 0 20px ${item.color}` : isDarkMode ? '0 0 5px rgba(0,0,0,0.5)' : 'none', WebkitTextStroke: item.isMatch ? '1px rgba(255,255,255,0.3)' : 'none' }}
            >{item.char}</span>
        </div>
    );
};

const VerticalStepper: React.FC<{ icon: React.ReactNode, onPlus: () => void, onMinus: () => void, isDarkMode: boolean }> = ({ icon, onPlus, onMinus, isDarkMode }) => (
    <div className={`flex items-center gap-1 px-1 rounded-lg border h-[32px] ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="opacity-60">{icon}</div>
        <div className="flex flex-col gap-0 justify-center"><button onClick={onPlus} className="p-0.5 rounded hover:bg-indigo-500/10 transition-colors leading-none"><Plus size={10} /></button><button onClick={onMinus} className="p-0.5 rounded hover:bg-indigo-500/10 transition-colors leading-none"><Minus size={10} /></button></div>
    </div>
);

const ThreeDVisualizer: React.FC<Props> = ({ elsResult, searchResults, activeResult, currentContext, onClose, isDarkMode }) => {
    const { t } = useLanguage();
    const [rotation, setRotation] = useState({ x: 25, y: -35 });
    const [zoom, setZoom] = useState(0.85);
    const [letterSize, setLetterSize] = useState(19);
    const [spacing, setSpacing] = useState(55);
    const [isDragging, setIsDragging] = useState(false);
    const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
    const [cubeData, setCubeData] = useState<CubeLetter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [styleIdx, setStyleIdx] = useState(0);
    const currentStyle = CUBE_STYLES[styleIdx];

    const cycleStyle = () => setStyleIdx((prev) => (prev + 1) % CUBE_STYLES.length);

    const formatLetters = (letters: any[]) => {
        const componentsMap = new Map<string, { groupId: number, text: string }>();
        const listToProcess = searchResults || (elsResult ? [elsResult] : []);
        listToProcess.forEach(res => {
            if (res && res.elsComponents) {
                res.elsComponents.forEach(c => {
                    if (!c) return; // Defensive
                    componentsMap.set(`${c.bookId}_${c.chapter}_${c.verse}_${c.letterIdx}`, { groupId: c.groupId, text: res.text || "" });
                });
            }
        });
        return letters.map((item, i) => {
            if (!item) return null; // Defensive
            const key = `${item.bookId}_${item.chapter}_${item.verse}_${item.letterIdx}`;
            const matchMeta = componentsMap.get(key);
            let color, groupId;
            if (matchMeta !== undefined) {
                groupId = matchMeta.groupId;
                const cleanText = (matchMeta.text || "").replace(/[\u0591-\u05C7]/g, "");
                if (cleanText.includes("בראשית")) { color = isDarkMode ? '#a855f7' : '#7e22ce'; }
                else if (groupId === 99) { color = isDarkMode ? '#fbbf24' : '#d97706'; }
                else { color = ELS_COLORS[groupId % ELS_COLORS.length]; }
            }
            return {
                ...item, isMatch: matchMeta !== undefined, groupId, color,
                gx: i % CUBE_SIZE, gy: Math.floor(i / CUBE_SIZE) % CUBE_SIZE, gz: Math.floor(i / (CUBE_SIZE * CUBE_SIZE)),
                delay: Math.floor(i / (CUBE_SIZE * CUBE_SIZE)) * 80 + (Math.floor(i / CUBE_SIZE) % CUBE_SIZE) * 40 + (i % CUBE_SIZE) * 15
            };
        }).filter(Boolean) as CubeLetter[];
    };

    const loadData = async () => {
        setIsLoading(true);
        try {
            let bookId, chapter, verse, letterIdx = 0;
            const anchor = activeResult || elsResult;
            if (anchor && anchor.elsComponents && anchor.elsComponents.length > 0) {
                const first = anchor.elsComponents[0];
                if (first) {
                    bookId = first.bookId; chapter = first.chapter; verse = first.verse; letterIdx = first.letterIdx;
                }
            } else if (currentContext) {
                bookId = currentContext.bookId; chapter = currentContext.chapter; verse = currentContext.verse;
            } 
            
            if (!bookId) { setIsLoading(false); return; }
            
            const letters = await fetchLettersWindow(bookId, chapter, verse, letterIdx, TOTAL_LETTERS);
            setCubeData(formatLetters(letters));
        } catch (err) { console.error(err); } finally { setIsLoading(false); }
    };

    useEffect(() => { loadData(); }, [elsResult, searchResults, activeResult, currentContext, isDarkMode]);

    const handleNext = async () => {
        if (cubeData.length === 0) return;
        setIsLoading(true);
        const next = await fetchLettersNext(cubeData[Math.floor(cubeData.length / 2)], TOTAL_LETTERS);
        setCubeData(formatLetters(next));
        setIsLoading(false);
    };

    const handlePrev = async () => {
        if (cubeData.length === 0) return;
        setIsLoading(true);
        const prev = await fetchLettersPrev(cubeData[Math.floor(cubeData.length / 2)], TOTAL_LETTERS);
        setCubeData(formatLetters(prev));
        setIsLoading(false);
    };

    const handleMouseDown = (e: React.MouseEvent) => { setIsDragging(true); setLastMousePos({ x: e.clientX, y: e.clientY }); };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - lastMousePos.x; const dy = e.clientY - lastMousePos.y;
        setRotation(prev => ({ x: prev.x - dy * 0.4, y: prev.y + dx * 0.4 }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
    };
    const handleMouseUp = () => setIsDragging(false);

    const isModal = !!elsResult;

    return (
        <div 
            className={`${isModal ? 'fixed inset-0 z-[200] p-0 backdrop-blur-3xl bg-black/60' : 'relative w-full h-full'} flex items-start justify-center animate-in fade-in duration-700 overflow-hidden`}
            onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
        >
            <div className={`${isModal ? 'w-full h-full max-w-6xl shadow-[0_0_120px_rgba(0,0,0,0.6)]' : 'w-full h-full'} relative flex flex-col transition-colors duration-1000 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`} onClick={(e) => e.stopPropagation()}>
                <div className="w-full z-20 flex justify-center pointer-events-none bg-slate-900/10 backdrop-blur-md border-b border-white/5">
                    <div className="flex items-center gap-1.5 pointer-events-auto h-[40px] px-2">
                        <button onClick={handlePrev} className="p-1.5 rounded-md hover:bg-white/10 transition-colors"><ChevronRight size={18} /></button>
                        <div className="w-px h-5 bg-white/10 mx-0.5"></div>
                        <div className={`p-1.5 text-indigo-400 rounded-md ${isLoading ? 'animate-pulse' : ''}`}><Box size={16} strokeWidth={2.5} /></div>
                        <button onClick={cycleStyle} className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all shadow-sm"><Palette size={14} /></button>
                        <VerticalStepper icon={<ZoomIn size={12}/>} onPlus={() => setZoom(z => Math.min(z+0.1, 3))} onMinus={() => setZoom(z => Math.max(z-0.1, 0.1))} isDarkMode={isDarkMode} />
                        <VerticalStepper icon={<Type size={12}/>} onPlus={() => setLetterSize(s => Math.min(s+2, 50))} onMinus={() => setLetterSize(s => Math.max(s-2, 8))} isDarkMode={isDarkMode} />
                        <VerticalStepper icon={<Move size={12}/>} onPlus={() => setSpacing(s => Math.min(s+5, 150))} onMinus={() => setSpacing(s => Math.max(s-5, 20))} isDarkMode={isDarkMode} />
                        <button onClick={() => setRotation({ x: 25, y: -35 })} className={`p-1.5 rounded-md transition-all ${isDarkMode ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-black/5'}`}><RotateCcw size={14} /></button>
                        {isModal && <button onClick={onClose} className="p-1.5 bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-all"><X size={14} strokeWidth={3} /></button>}
                        <div className="w-px h-5 bg-white/10 mx-0.5"></div>
                        <button onClick={handleNext} className="p-1.5 rounded-md hover:bg-white/10 transition-colors"><ChevronLeft size={18} /></button>
                    </div>
                </div>
                <div className="flex-1 relative overflow-hidden flex items-center justify-center perspective-[3000px] cursor-move select-none" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}>
                    {isLoading ? <Loader2 size={48} className="animate-spin text-indigo-500" /> : (
                        <div className="transition-transform duration-300 ease-out will-change-transform" style={{ transform: `scale(${zoom}) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`, transformStyle: 'preserve-3d', width: '400px', height: '400px' }}>
                            <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
                                {cubeData.map((item, i) => <LetterNode key={i} item={item} isDarkMode={isDarkMode} style={currentStyle} rotation={rotation} letterSize={letterSize} spacing={spacing} />)}
                            </div>
                        </div>
                    )}
                </div>
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(#4f46e5_1.5px,transparent_1.5px)] [background-size:24px_24px]"></div>
            </div>
        </div>
    );
};

export default ThreeDVisualizer;
