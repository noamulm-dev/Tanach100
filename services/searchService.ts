
import { SearchResult, BibleSection, BibleBook } from '../types';
import { BIBLE_BOOKS } from '../constants';
import { fetchFullBook, cleanHebrewText } from './bibleService';

const cleanForELS = (text: string): string => {
    return text.replace(/[^א-ת]/g, '');
};

const normalizeLetter = (char: string): string => {
    switch (char) {
        case 'ך': return 'כ';
        case 'ם': return 'מ';
        case 'ן': return 'נ';
        case 'ף': return 'פ';
        case 'ץ': return 'צ';
        default: return char;
    }
};

export interface GlobalSearchResponse {
    results: SearchResult[];
    regularSearchEnabled: boolean;
}

export const searchGlobal = async (
    query: string,
    wholeWord: boolean,
    scope: 'current' | 'torah' | 'tanakh',
    currentBookId: string
): Promise<GlobalSearchResponse> => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return { results: [], regularSearchEnabled: false };

    const forwardOnly = trimmedQuery.includes('+');
    const queryWithoutPlus = trimmedQuery.replace(/\+/g, '');

    const parts = queryWithoutPlus.split(',').map(p => p.trim()).filter(p => p.length > 0);
    const words: string[] = [];
    const allSkips: number[] = [];

    parts.forEach(part => {
        const rangeMatch = part.match(/^(-?\d+)-(-?\d+)$/);
        if (rangeMatch) {
            const start = parseInt(rangeMatch[1], 10);
            const end = parseInt(rangeMatch[2], 10);
            if (!isNaN(start) && !isNaN(end)) {
                const min = Math.min(start, end);
                const max = Math.max(start, end);
                for (let s = min; s <= max; s++) {
                    if (s !== 0) allSkips.push(s);
                }
                return;
            }
        }

        const num = parseInt(part, 10);
        if (!isNaN(num) && /^-?\d+$/.test(part)) {
            if (num !== 0) allSkips.push(num);
        } else {
            words.push(part);
        }
    });

    const uniqueSkips = Array.from(new Set(allSkips));
    const hasNumbers = uniqueSkips.length > 0;
    const includesOne = uniqueSkips.includes(1) || uniqueSkips.includes(-1);

    const shouldDoRegularSearch = words.length > 0 && (!hasNumbers || includesOne);

    let skipsForEls: number[] = [];
    uniqueSkips.filter(s => Math.abs(s) > 1).forEach(s => {
        skipsForEls.push(s);
        if (!forwardOnly) {
            skipsForEls.push(-s);
        }
    });
    skipsForEls = Array.from(new Set(skipsForEls));

    const shouldDoElsSearch = words.length > 0 && skipsForEls.length > 0;

    let booksToSearch: BibleBook[] = [];
    if (scope === 'current') {
        const book = BIBLE_BOOKS.find(b => b.id === currentBookId);
        if (book) booksToSearch = [book];
    } else if (scope === 'torah') {
        booksToSearch = BIBLE_BOOKS.filter(b => b.section === BibleSection.Torah);
    } else {
        booksToSearch = BIBLE_BOOKS;
    }

    const results: SearchResult[] = [];
    const booksContent = await Promise.all(
        booksToSearch.map(book => fetchFullBook(book.id))
    );

    // 1. Regular Search Logic (e.g., "מבול")
    if (shouldDoRegularSearch) {
        const effectiveWords = words.length > 1
            ? words.filter(w => cleanForELS(w).length >= 2)
            : words;

        const patternParts = effectiveWords.map(term => {
            const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            // Support both nikud-sensitive and insensitive
            const hasNikud = /[\u0591-\u05C7]/.test(term);
            return hasNikud
                ? escaped + '[\\u0591-\u05C7]*'
                : escaped.split('').join('[\\u0591-\u05C7]*') + '[\\u0591-\u05C7]*';
        });

        if (patternParts.length > 0) {
            let combinedPattern = `(${patternParts.join('|')})`;
            if (wholeWord) {
                combinedPattern = `(?<![\\u05D0-\\u05EA\\u0591-\\u05C7])` + combinedPattern + `(?![\\u05D0-\\u05EA\\u0591-\\u05C7])`;
            }
            const regex = new RegExp(combinedPattern, 'g');

            booksContent.forEach((bookChapters, bookIndex) => {
                const book = booksToSearch[bookIndex];
                bookChapters.forEach((verses, chIndex) => {
                    verses.forEach((verseObj, vIdx) => {
                        const verseText = verseObj.text;
                        const matches = Array.from(verseText.matchAll(regex));
                        matches.forEach((match, mIndex) => {
                            const matchText = match[0];
                            const matchIndex = match.index!;

                            // Correct calculation of letter position within cleaned text
                            // We must use the exact same cleaning logic as the Matrix view uses
                            const textBefore = verseText.substring(0, matchIndex);
                            const cleanTextBefore = cleanHebrewText(textBefore).replace(/[^א-ת]/g, '');
                            const letterStart = cleanTextBefore.length;

                            const cleanMatchFull = cleanHebrewText(matchText).replace(/[^א-ת]/g, "");
                            const matchLettersCount = cleanMatchFull.length;

                            const wordIdx = effectiveWords.findIndex(w => {
                                const cleanW = cleanForELS(w);
                                return cleanMatchFull.includes(cleanW) || cleanW.includes(cleanMatchFull);
                            });

                            const groupId = wordIdx === -1 ? 99 : 100 + wordIdx;
                            const elsComponents = [];
                            for (let k = 0; k < matchLettersCount; k++) {
                                elsComponents.push({
                                    bookId: book.id,
                                    chapter: chIndex + 1,
                                    verse: vIdx + 1,
                                    letterIdx: letterStart + k,
                                    groupId: groupId
                                });
                            }

                            results.push({
                                bookId: book.id,
                                chapter: chIndex + 1,
                                verse: vIdx + 1,
                                text: matchText,
                                occurrenceIndex: mIndex,
                                elsSkip: 1,
                                elsComponents
                            });
                        });
                    });
                });
            });
        }
    }

    // 2. ELS Search Logic
    if (shouldDoElsSearch) {
        const elsWords: string[] = [];
        words.forEach(w => elsWords.push(...w.split(/\s+/)));
        const cleanWords = elsWords.map(w => cleanForELS(w)).filter(w => w.length >= 2);

        if (cleanWords.length > 0) {
            let fullCleanString = "";
            const mapping: { bookId: string, chapter: number, verse: number, letterIdx: number, globalIdx: number }[] = [];

            booksContent.forEach((bookChapters, bookIndex) => {
                const book = booksToSearch[bookIndex];
                bookChapters.forEach((verses, chIndex) => {
                    verses.forEach((verseObj, vIdx) => {
                        const vText = verseObj.text;
                        let verseLetterCounter = 0;
                        for (let charIdx = 0; charIdx < vText.length; charIdx++) {
                            const char = vText[charIdx];
                            if (char >= 'א' && char <= 'ת') {
                                mapping.push({
                                    bookId: book.id,
                                    chapter: chIndex + 1,
                                    verse: vIdx + 1,
                                    letterIdx: verseLetterCounter++,
                                    globalIdx: mapping.length
                                });
                                fullCleanString += char;
                            }
                        }
                    });
                });
            });

            const seenMatches = new Set<string>();
            cleanWords.forEach((cleanWord, wordIdx) => {
                const normalizedSearchWord = cleanWord.split('').map(normalizeLetter).join('');
                skipsForEls.forEach((skip) => {
                    const absSkip = Math.abs(skip);
                    const groupId = (wordIdx * 10) + (absSkip % 10);

                    for (let i = 0; i < fullCleanString.length; i++) {
                        const lastIdx = i + ((cleanWord.length - 1) * skip);
                        if (lastIdx < 0 || lastIdx >= fullCleanString.length) continue;

                        let match = true;
                        const matchComponents = [];
                        for (let q = 0; q < cleanWord.length; q++) {
                            const targetIdx = i + (q * skip);
                            if (normalizeLetter(fullCleanString[targetIdx]) !== normalizedSearchWord[q]) {
                                match = false;
                                break;
                            }
                            matchComponents.push({ ...mapping[targetIdx], groupId });
                        }

                        if (match) {
                            const matchKey = matchComponents.map(c => c.globalIdx).sort((a, b) => a - b).join(',');
                            if (!seenMatches.has(matchKey)) {
                                seenMatches.add(matchKey);
                                const startPoint = matchComponents[0];
                                results.push({
                                    bookId: startPoint.bookId,
                                    chapter: startPoint.chapter,
                                    verse: startPoint.verse,
                                    text: cleanWord,
                                    occurrenceIndex: 0,
                                    elsSkip: skip,
                                    elsComponents: matchComponents
                                });
                            }
                        }
                    }
                });
            });
        }
    }

    const bookOrderMap = new Map(BIBLE_BOOKS.map((b, i) => [b.id, i]));
    results.sort((a, b) => {
        const bookA = bookOrderMap.get(a.bookId) ?? 0;
        const bookB = bookOrderMap.get(b.bookId) ?? 0;
        if (bookA !== bookB) return bookA - bookB;
        if (a.chapter !== b.chapter) return a.chapter - b.chapter;
        if (a.verse !== b.verse) return a.verse - b.verse;
        if (a.elsComponents && b.elsComponents && a.elsComponents.length > 0 && b.elsComponents.length > 0) {
            return a.elsComponents[0].letterIdx - b.elsComponents[0].letterIdx;
        }
        return 0;
    });

    return { results, regularSearchEnabled: shouldDoRegularSearch };
};
