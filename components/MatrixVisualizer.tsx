
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Grid3X3, Loader2, Type, MoveHorizontal, Plus, Minus, Maximize, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { SearchResult } from '../types';
import { ELS_COLORS } from './VerseItem';
import { fetchLettersWindow, fetchLettersNext, fetchLettersPrev } from '../services/bibleService';

interface Props {
    searchResults?: SearchResult[];
    activeResult?: SearchResult | null;
    currentContext?: { bookId: string, chapter: number, verse: number };
    onClose: () => void;
    isDarkMode: boolean;
}

interface VisualLetter {
    char: string;
    bookId: string;
    chapter: number;
    verse: number;
    letterIdx: number;

    // Derived visual props
    isMatch?: boolean;
    isActive?: boolean;
    color?: string;
    groupId?: number;
    matchId?: string;
    elsSkip?: number;
}

const CHUNK_SIZE = 4000;
const INITIAL_BUFFER = 8000;

const MatrixVisualizer: React.FC<Props> = ({ searchResults, activeResult, currentContext, onClose, isDarkMode }) => {
    // --- Visual Configuration ---
    const [letterSize, setLetterSize] = useState(18); // Slightly larger default
    const spacingFactor = 1.3;
    const cellSize = Math.floor(letterSize * spacingFactor); // Integer pixel alignment

    const [cols, setCols] = useState(() => {
        return Math.floor((window.innerWidth - 64) / cellSize);
    });

    // --- Data State ---
    const [letters, setLetters] = useState<VisualLetter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAppending, setIsAppending] = useState(false);
    const [isPrepending, setIsPrepending] = useState(false);

    // --- Scroll State ---
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeight, setContainerHeight] = useState(0);

    // --- Data Loading Logic ---

    // 1. Initial Load (Jump to Target)
    const jumpToTarget = useCallback(async (bookId: string, chapter: number, verse: number, letterIdx: number = 0) => {
        setIsLoading(true);
        setLetters([]);

        try {
            // Fetch forward and backward to create a centered window
            const forward = await fetchLettersWindow(bookId, chapter, verse, letterIdx, INITIAL_BUFFER / 2);

            let combined = forward;
            if (forward.length > 0) {
                const backward = await fetchLettersPrev(forward[0], INITIAL_BUFFER / 2);
                combined = [...backward, ...forward];
            }

            setLetters(combined);

            // Scroll to center strictly
            // Find the index of the target in the loaded buffer
            const targetIndex = combined.findIndex(l =>
                l.bookId === bookId && l.chapter === chapter && l.verse === verse && l.letterIdx === letterIdx
            );

            // If exact index not found (e.g. verse start), finding closest
            const effectiveIndex = targetIndex !== -1 ? targetIndex : combined.findIndex(l =>
                l.bookId === bookId && l.chapter === chapter && l.verse === verse
            );

            if (effectiveIndex !== -1 && containerRef.current) {
                // Defer scroll to next tick to ensure render calculation
                setTimeout(() => {
                    if (!containerRef.current) return;
                    const row = Math.floor(effectiveIndex / cols);
                    const centeringOffset = (containerRef.current.clientHeight / 2) - (cellSize / 2);
                    const targetTop = (row * cellSize) - centeringOffset;
                    containerRef.current.scrollTop = Math.max(0, targetTop);
                }, 50);
            }

        } catch (e) {
            console.error("Matrix load error", e);
        } finally {
            setIsLoading(false);
        }
    }, [cols, cellSize]);


    // 2. React to Context / Active Result Changes
    useEffect(() => {
        if (activeResult?.elsComponents?.[0]) {
            // Jump to specific skip sequence start
            const start = activeResult.elsComponents[0];
            jumpToTarget(start.bookId, start.chapter, start.verse, start.letterIdx);
        } else if (currentContext) {
            // Jump to current context
            jumpToTarget(currentContext.bookId, currentContext.chapter, currentContext.verse, 0);
        }
    }, [activeResult, currentContext?.bookId, currentContext?.chapter, currentContext?.verse]);


    // 3. Infinite Scroll Handlers
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const currentScroll = target.scrollTop;
        setScrollTop(currentScroll); // Sync state for render

        const scrollRange = target.scrollHeight - target.clientHeight;
        const isNearBottom = scrollRange - currentScroll < 1000;
        const isNearTop = currentScroll < 500;

        // Append
        if (isNearBottom && !isAppending && !isLoading && letters.length > 0) {
            setIsAppending(true);
            const last = letters[letters.length - 1];
            fetchLettersNext(last, CHUNK_SIZE).then(newChunk => {
                if (newChunk.length) setLetters(prev => [...prev, ...newChunk]);
                setIsAppending(false);
            });
        }

        // Prepend (Standardbi-directional scroll trick)
        if (isNearTop && !isPrepending && !isLoading && letters.length > 0) {
            // Don't prepend if at Genesis 1:1:0
            const first = letters[0];
            if (first.bookId === 'Genesis' && first.chapter === 1 && first.verse === 1 && first.letterIdx === 0) return;

            setIsPrepending(true);
            const oldScrollHeight = target.scrollHeight; // Capture height BEFORE reflow

            fetchLettersPrev(first, CHUNK_SIZE).then(newChunk => {
                if (newChunk.length > 0) {
                    setLetters(prev => [...newChunk, ...prev]);

                    // Restore scroll position immediately after render
                    // We use requestAnimationFrame or immediate layout effect logic
                    // In React functional triggering, we need to wait for DOM update.
                    // Doing it in a layout effect dependency on letters.length is safest, 
                    // BUT detecting source of length change is tricky. 
                    // Manual adjustment here usually works if React renders synchronously enough or we calculate carefully.

                    // Simple approach: measure delta after render
                    setTimeout(() => {
                        if (containerRef.current) {
                            const newScrollHeight = containerRef.current.scrollHeight;
                            const delta = newScrollHeight - oldScrollHeight;
                            containerRef.current.scrollTop = currentScroll + delta;
                        }
                    }, 0);
                }
                setIsPrepending(false);
            });
        }
    }, [letters, isAppending, isPrepending, isLoading]);


    // --- Rendering Logic --

    // Update container height for virtualization
    useEffect(() => {
        if (!containerRef.current) return;
        const obs = new ResizeObserver(entries => {
            setContainerHeight(entries[0].contentRect.height);
            // Also Auto-Recalculate cols
            const w = entries[0].contentRect.width;
            setCols(Math.max(10, Math.floor(w / cellSize)));
        });
        obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, [cellSize]);

    // Enhanced Data with Highlights
    const visualData = useMemo(() => {
        if (!letters.length || !searchResults) return letters;

        const map = new Map<string, any>();

        // Active result identifier
        let activeMatchId = '';
        if (activeResult) {
            // Find its index in searchResults
            const idx = searchResults.indexOf(activeResult);
            if (idx !== -1) activeMatchId = `m_${idx}`;
        }

        searchResults.forEach((res, idx) => {
            if (!res.elsComponents) return;
            const mId = `m_${idx}`;
            const isActive = mId === activeMatchId;

            res.elsComponents.forEach(c => {
                const key = `${c.bookId}_${c.chapter}_${c.verse}_${c.letterIdx}`;
                // Priority: Active matches overwrite inactive ones
                if (isActive || !map.has(key)) {
                    map.set(key, {
                        isMatch: true,
                        color: res.elsComponents![0].groupId === 99 ? '#d97706' : ELS_COLORS[res.elsComponents![0].groupId % ELS_COLORS.length],
                        isActive: isActive,
                        matchId: mId,
                        elsSkip: res.elsSkip
                    });
                }
            });
        });

        return letters.map(l => {
            const key = `${l.bookId}_${l.chapter}_${l.verse}_${l.letterIdx}`;
            const meta = map.get(key);
            return meta ? { ...l, ...meta } : l;
        });
    }, [letters, searchResults, activeResult]);


    // Virtualization Calculation
    const totalRows = Math.ceil(letters.length / cols);
    const totalHeight = totalRows * cellSize;

    // Visible Window
    const overscan = 5;
    const startRow = Math.max(0, Math.floor(scrollTop / cellSize) - overscan);
    const endRow = Math.min(totalRows, Math.ceil((scrollTop + containerHeight) / cellSize) + overscan);

    const visibleSlice = visualData.slice(startRow * cols, endRow * cols);
    const sliceOffsetY = startRow * cellSize;

    // Render Lines Overlay
    const renderLines = () => {
        // Collect points by matchId
        const paths: Record<string, { x: number, y: number, active: boolean, color: string }[]> = {};

        // Optimization: Only draw lines for matches currently visible or crossing the view
        // Is this too complex? Maybe just draw lines for visible letters? 
        // We iterate visibleSlice.
        visibleSlice.forEach((l, i) => {
            if (l.matchId && l.elsSkip && Math.abs(l.elsSkip) > 1) {
                if (!paths[l.matchId]) paths[l.matchId] = [];
                // Calculate absolute coordinates relative to the huge total grid
                const absoluteIndex = startRow * cols + i;
                const row = Math.floor(absoluteIndex / cols);
                const col = (cols - 1) - (absoluteIndex % cols); // RTL

                paths[l.matchId].push({
                    x: col * cellSize + cellSize / 2,
                    y: row * cellSize + cellSize / 2,
                    active: !!l.isActive,
                    color: l.color || 'red'
                });
            }
        });

        // This approach only draws segments if points are visible. 
        // For long skips, we might see points but not the line connecting them if intermediate points are off-screen? 
        // Actually, with standard ELS, points are uniform. But rendering lines purely based on visible nodes is safest/easiest.

        return Object.values(paths).map((points, i) => {
            if (points.length < 2) return null;
            // Draw lines between sequential visible points
            // Note: If a match has points 1, 10, 20 and we only see 10, search result visual might be fragmented. 
            // This is acceptable for infinite scroll performance.
            const p = points[0];
            return (
                <polyline
                    key={i}
                    points={points.map(pt => `${pt.x},${pt.y}`).join(' ')}
                    fill="none"
                    stroke={p.color}
                    strokeWidth={p.active ? 3 : 1.5}
                    strokeDasharray={p.active ? 'none' : '4 4'}
                    opacity={0.8}
                />
            );
        });
    };

    return (
        <div className="flex flex-col w-full h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative">
            {/* --- Header --- */}
            <div className="shrink-0 h-10 border-b flex items-center justify-between px-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <Grid3X3 size={16} className="text-indigo-500" />
                    <span className="font-bold text-xs uppercase tracking-wider opacity-70">Matrix</span>
                    {isLoading && <Loader2 size={14} className="animate-spin opacity-50" />}
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => setLetterSize(s => Math.max(10, s - 2))} className="p-1 hover:bg-black/5 rounded"><Minus size={14} /></button>
                    <span className="text-xs font-mono w-6 text-center">{letterSize}</span>
                    <button onClick={() => setLetterSize(s => Math.min(40, s + 2))} className="p-1 hover:bg-black/5 rounded"><Plus size={14} /></button>
                </div>

                <button onClick={onClose} className="p-1.5 hover:bg-rose-500 hover:text-white rounded transition-colors"><X size={16} /></button>
            </div>

            {/* --- Virtual Grid --- */}
            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto relative custom-scrollbar"
                style={{ direction: 'ltr' }} // Container LTR, Grid RTL content handled manually or via dir=rtl inner
            >
                {isLoading && letters.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 opacity-50">
                            <Loader2 size={32} className="animate-spin text-indigo-500" />
                            <span className="text-xs font-mono">טוען נתונים...</span>
                        </div>
                    </div>
                ) : (
                    <div
                        className="relative w-full"
                        style={{ height: totalHeight }}
                    >
                        {/* SVG Overlay for Lines */}
                        <svg className="absolute inset-0 w-full pointer-events-none z-10" style={{ height: totalHeight }}>
                            {renderLines()}
                        </svg>

                        {/* Visible Slice Render */}
                        <div
                            className="absolute left-0 w-full grid"
                            style={{
                                top: sliceOffsetY,
                                gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
                                gridAutoRows: `${cellSize}px`,
                                direction: 'rtl', // Make the grid flow RTL
                                justifyContent: 'center'
                            }}
                        >
                            {visibleSlice.map((l, idx) => (
                                <div
                                    key={`${l.bookId}_${l.chapter}_${l.verse}_${l.letterIdx}`}
                                    className={`flex items-center justify-center font-serif transition-colors select-none cursor-pointer
                                        ${l.isMatch ? 'font-bold' : 'opacity-40'}
                                    `}
                                    style={{
                                        fontSize: letterSize,
                                        width: cellSize,
                                        height: cellSize,
                                        backgroundColor: l.isActive ? l.color : (l.isMatch ? `${l.color}40` : 'transparent'), // 40 = 25% opacity hex
                                        color: l.isMatch ? (l.isActive ? '#fff' : l.color) : 'inherit',
                                        borderRadius: l.isMatch ? 4 : 0,
                                        boxShadow: l.isActive ? `0 0 0 2px ${isDarkMode ? '#fff' : '#000'}` : 'none',
                                        zIndex: l.isActive ? 20 : 1
                                    }}
                                    title={`${l.bookId} ${l.chapter}:${l.verse}`}
                                >
                                    {l.char}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- Footer Status --- */}
            <div className="shrink-0 h-6 bg-black text-white text-[10px] flex items-center justify-between px-2 font-mono opacity-80 z-20">
                <span>Total: {letters.length.toLocaleString()}</span>
                <span>Active: {activeResult ? `${activeResult.text} (${activeResult.bookId} ${activeResult.chapter}:${activeResult.verse})` : 'None'}</span>
                <span>Rows: {totalRows.toLocaleString()}</span>
            </div>
        </div>
    );
};

export default MatrixVisualizer;
