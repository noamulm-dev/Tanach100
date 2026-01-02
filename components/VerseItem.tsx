
import React, { memo } from 'react';
import { Verse, ReaderStyle, SearchResult, ThemeProfile } from '../types';
import { stripNikud, numberToHebrew } from '../utils/gematria';
import { useLanguage } from '../contexts/LanguageContext';
import WithHelp from './WithHelp';

interface VerseItemProps {
    verse: Verse;
    chapterNum: number;
    readerStyle: ReaderStyle;
    activeTheme: ThemeProfile;
    isReading: boolean;
    ttsHighlight: string;
    verseHover: string;
    globalVerseCounter: number;
    activeResult: SearchResult | null;
    searchQuery: string;
    searchWholeWord: boolean;
    isRegularSearchActive: boolean;
    elsIndices?: Map<number, number>; // Map of letterIdx to groupId
    onContextMenu: (e: React.MouseEvent, verse: Verse) => void;
    onPointerEnter: () => void;
    onPointerLeave?: () => void;
    onElsClick?: (groupId: number) => void;
}

const HIGHLIGHT_COLORS = [
    'bg-yellow-300 dark:bg-yellow-600/80 dark:text-white text-black',
    'bg-cyan-300 dark:bg-cyan-600/80 dark:text-white text-black',
    'bg-green-300 dark:bg-emerald-600/80 dark:text-white text-black',
    'bg-rose-300 dark:bg-rose-600/80 dark:text-white text-black',
    'bg-orange-300 dark:bg-orange-600/80 dark:text-white text-black',
    'bg-purple-300 dark:bg-purple-600/80 dark:text-white text-black'
];

export const ELS_COLORS = [
    '#4f46e5', // Indigo 600
    '#059669', // Emerald 600
    '#e11d48', // Rose 600
    '#d97706', // Amber 600
    '#0891b2', // Cyan 600
    '#7c3aed', // Purple 600
    '#65a30d', // Lime 600
    '#c026d3', // Fuchsia 600
    '#0284c7', // Sky 600
    '#dc2626', // Red 600
];

const normalizeForMatch = (text: string): string => {
    return text.replace(/[^\u05D0-\u05EA]/g, '');
};

const VerseItem: React.FC<VerseItemProps> = memo(({
    verse, chapterNum, readerStyle, activeTheme, isReading, ttsHighlight,
    verseHover, globalVerseCounter, activeResult, searchQuery, searchWholeWord,
    isRegularSearchActive, elsIndices, onContextMenu, onPointerEnter, onPointerLeave, onElsClick
}) => {
    const { language } = useLanguage();
    const displayText = readerStyle.showNikud ? verse.text : stripNikud(verse.text);
    const { isContinuous } = readerStyle;

    // Memoize active letters for this verse to prevent double framing of same-group matches
    const activeResultLetterIndices = React.useMemo(() => {
        if (!activeResult || !activeResult.elsComponents) return new Set<number>();
        const indices = new Set<number>();

        // Safety check: only process if the result potentially belongs to this book/chapter to avoid wasted iterations
        // Since VerseItem is only rendered for the current book, checking chapter and verse is enough.
        activeResult.elsComponents.forEach(c => {
            if (c.chapter === chapterNum && c.verse === verse.verse) {
                indices.add(c.letterIdx);
            }
        });
        return indices;
    }, [activeResult, chapterNum, verse.verse]);

    const renderTextWithHighlights = (text: string) => {
        // --- Priority 1: ELS Highlighting ---
        if (elsIndices && elsIndices.size > 0) {
            // Regex to group a Hebrew letter with its subsequent combining marks (Nikud/Cantillation)
            // OR match non-Hebrew characters (spaces, punctuation) to preserve them as is.
            const clusters = text.match(/([\u05D0-\u05EA][\u0591-\u05C7]*)|([^\u05D0-\u05EA]+)/g) || [];

            let letterCounter = 0; // Tracks the ordinal index of Hebrew letters

            return (
                <>
                    {clusters.map((cluster, cIdx) => {
                        const firstChar = cluster[0];
                        // Check if it's a Hebrew letter (and thus a valid ELS counting index)
                        const isHebrewLetter = firstChar >= '\u05D0' && firstChar <= '\u05EA';

                        if (!isHebrewLetter) {
                            return <span key={cIdx}>{cluster}</span>;
                        }

                        const currentLetterIdx = letterCounter++;

                        // Check if this specific letter ordinal has an ELS match
                        const groupId = elsIndices.get(currentLetterIdx);
                        const isElsChar = groupId !== undefined;

                        if (isElsChar) {
                            const color = ELS_COLORS[groupId % ELS_COLORS.length];

                            // Check if this specific letter index belongs to the ACTIVE result
                            const isActive = activeResultLetterIndices.has(currentLetterIdx);

                            return (
                                <span
                                    key={cIdx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onElsClick) onElsClick(groupId);
                                    }}
                                    className={`els-char els-group-${groupId} relative inline-block text-center min-w-[1.1em] cursor-pointer hover:scale-110 transition-transform z-10`}
                                    style={{
                                        margin: '0 1px',
                                        verticalAlign: 'baseline',
                                    }}
                                    data-group-id={groupId}
                                    data-letter-idx={currentLetterIdx}
                                    data-verse-key={`${chapterNum}_${verse.verse}`}
                                >
                                    {/* Background Box - Semi-transparent and Rounded */}
                                    <span
                                        className={`absolute rounded ${isActive ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 ring-black dark:ring-white shadow-sm z-10' : 'z-0'}`}
                                        style={{
                                            backgroundColor: color,
                                            // Adjusted inset for a smaller, highlighter-like appearance
                                            top: '0.05em',
                                            bottom: '0.05em',
                                            left: '-0.1em',
                                            right: '-0.1em',
                                            opacity: isActive ? 0.6 : 0.35 // Transparent background
                                        }}
                                    />

                                    {/* Text Layer - Use inherit color to blend naturally */}
                                    <span className="relative z-10 font-normal" style={{ lineHeight: 'inherit', color: 'inherit' }}>
                                        {cluster}
                                    </span>
                                </span>
                            );
                        }
                        return <span key={cIdx}>{cluster}</span>;
                    })}
                </>
            );
        }

        // --- Priority 2: Regular Multi-Word Search ---
        if (!searchQuery.trim() || !isRegularSearchActive) return text;

        const partsToParse = searchQuery.split(',').map(p => p.trim());
        const terms = partsToParse.filter(p => !/^-?\d+$/.test(p) && p.length > 0);

        if (terms.length === 0) return text;

        const patternParts = terms.map(term => {
            const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const hasNikud = /[\u0591-\u05C7]/.test(term);
            return hasNikud
                ? escaped + '[\\u0591-\u05C7]*'
                : escaped.split('').join('[\\u0591-\u05C7]*') + '[\\u0591-\u05C7]*';
        });

        let combinedPattern = `(${patternParts.join('|')})`;
        if (searchWholeWord) combinedPattern = `(?<![\\u05D0-\u05EA\\u0591-\\u05C7])` + combinedPattern + `(?![\\u05D0-\u05EA\\u0591-\\u05C7])`;
        const regex = new RegExp(combinedPattern, 'g');

        const parts = text.split(regex);
        let matchCounter = 0;

        return (
            <>
                {parts.map((part, index) => {
                    if (index % 2 === 1) {
                        // Check if the ACTIVE search result points to THIS specific match instance
                        const isContextMatch = activeResult &&
                            activeResult.chapter === chapterNum &&
                            activeResult.verse === verse.verse;

                        const isActive = isContextMatch && (matchCounter === activeResult.occurrenceIndex);

                        matchCounter++;

                        const cleanPart = normalizeForMatch(part);
                        let matchedTermIndex = terms.findIndex(t => cleanPart === normalizeForMatch(t));
                        if (matchedTermIndex === -1) matchedTermIndex = 0;
                        const colorClass = HIGHLIGHT_COLORS[matchedTermIndex % HIGHLIGHT_COLORS.length];

                        const activeClass = isActive ? `ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-900 ring-black dark:ring-white z-10 relative rounded-md` : 'rounded-[2px]';
                        return <span key={index} className={`${colorClass} ${activeClass}`}>{part}</span>;
                    }
                    return <span key={index}>{part}</span>;
                })}
            </>
        );
    };

    if (isContinuous) {
        return (
            <span
                data-verse={verse.verse}
                className={`relative inline transition-[background-color,box-shadow] group rounded-[2px] ${isReading ? ttsHighlight : verseHover} cursor-pointer select-text duration-200`}
                onContextMenu={(e) => onContextMenu(e, verse)}
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
            >
                {readerStyle.showVerseNumbers && (
                    <span className={`inline-block mx-0.5 font-bold text-[0.65em] select-none ${activeTheme.accent}`}>
                        {language === 'he' ? numberToHebrew(verse.verse) : verse.verse}
                    </span>
                )}
                {renderTextWithHighlights(displayText)}
                {" "}
            </span>
        );
    }

    return (
        <div
            data-verse={verse.verse}
            className={`relative flex items-start pl-1 pr-0 rounded-lg transition-[background-color,box-shadow] group ${isReading ? ttsHighlight : verseHover} cursor-pointer select-text duration-200`}
            onContextMenu={(e) => onContextMenu(e, verse)}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
        >
            {readerStyle.showVerseNumbers && (
                <WithHelp labelKey="label_verse_number" position="left" className="absolute top-[0.3em] right-0 flex flex-col items-center w-3.5 shrink-0 select-none">
                    <div className="flex flex-col items-center w-full">
                        <span className={`font-sans font-bold text-[0.6em] leading-none mb-0.5 ${activeTheme.accent}`}>
                            {language === 'he' ? numberToHebrew(verse.verse) : verse.verse}
                        </span>
                        <span className={`font-sans font-bold leading-none ${activeTheme.accent}`} style={{ fontSize: '0.55em' }}>
                            {globalVerseCounter}
                        </span>
                    </div>
                </WithHelp>
            )}
            <div className={`flex-1 ${readerStyle.showVerseNumbers ? 'pr-3.5' : ''}`}>
                {renderTextWithHighlights(displayText)}
            </div>
        </div>
    );
});

export default VerseItem;
