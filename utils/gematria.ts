
import { GEMATRIA_VALUES, ATBASH_MAP } from '../constants';
import { GematriaMethod } from '../types';

// Values for Mispar Gadol (Sofit letters get 500-900)
const SOFIT_VALUES: Record<string, number> = {
    'ך': 500, 'ם': 600, 'ן': 700, 'ף': 800, 'ץ': 900
};

// Ordinal values (Aleph=1, Bet=2... Tav=22)
const ORDINAL_MAP: Record<string, number> = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9, 'י': 10,
    'כ': 11, 'ך': 11, 'ל': 12, 'מ': 13, 'ם': 13, 'נ': 14, 'ן': 14, 'ס': 15, 'ע': 16,
    'פ': 17, 'ף': 17, 'צ': 18, 'ץ': 18, 'ק': 19, 'ר': 20, 'ש': 21, 'ת': 22
};

export const stripNikud = (text: string): string => {
    return text.replace(/[\u0591-\u05C7]/g, "");
};

// Specialized text cleaner for Text-to-Speech to avoid pronunciation errors with divine names etc.
export const prepareTextForTTS = (text: string): string => {
    let clean = text.replace(/\u05D9[\u0591-\u05C7]*\u05D4[\u0591-\u05C7]*\u05D5[\u0591-\u05C7]*\u05D4/g, 'אֲדֹנָי');
    clean = clean.replace(/[\u0591-\u05AF\u05BD\u05BF\u05C0\u05C4\u05C5\u05C6]/g, '');
    clean = clean.replace(/\u05C3/g, '. ').replace(/\u05BE/g, ' ');
    clean = clean.replace(/[^\u05D0-\u05EA\u05B0-\u05BC\u05C1\u05C2\u05C7\s\.\,\?\!\:\;\-]/g, '');
    return clean.replace(/\s+/g, ' ').trim();
};

export const calculateGematria = (text: string, method: GematriaMethod): number => {
    const cleanText = text.replace(/[^א-ת]/g, '');
    let sum = 0;

    switch (method) {
        case GematriaMethod.Standard:
            for (const char of cleanText) {
                sum += GEMATRIA_VALUES[char] || 0;
            }
            break;
            
        case GematriaMethod.MisparKatan:
            for (const char of cleanText) {
                const val = GEMATRIA_VALUES[char] || 0;
                // Calculate reduced value (e.g., 200 -> 2, 40 -> 4)
                let reduced = val;
                while (reduced >= 10) {
                    reduced = Math.floor(reduced / 10) + (reduced % 10);
                }
                sum += reduced;
            }
            break;

        case GematriaMethod.MisparGadol:
            for (const char of cleanText) {
                if (SOFIT_VALUES[char]) {
                    sum += SOFIT_VALUES[char];
                } else {
                    sum += GEMATRIA_VALUES[char] || 0;
                }
            }
            break;

        case GematriaMethod.Siduri:
            for (const char of cleanText) {
                sum += ORDINAL_MAP[char] || 0;
            }
            break;

        case GematriaMethod.Atbash:
            for (const char of cleanText) {
                const atbashChar = ATBASH_MAP[char] || char;
                sum += GEMATRIA_VALUES[atbashChar] || 0;
            }
            break;
    }

    return sum;
};

export const numberToHebrew = (num: number): string => {
    if (num <= 0) return '';
    
    // Handle hundreds separately to avoid complex logic loop for simple Bible chapters
    let str = '';
    let n = num;
    
    while (n >= 400) { str += 'ת'; n -= 400; }
    while (n >= 300) { str += 'ש'; n -= 300; }
    while (n >= 200) { str += 'ר'; n -= 200; }
    while (n >= 100) { str += 'ק'; n -= 100; }

    // Special cases for 15 and 16
    if (n === 15) {
        str += 'טו';
    } else if (n === 16) {
        str += 'טז';
    } else {
        // Tens
        if (n >= 90) { str += 'צ'; n -= 90; }
        else if (n >= 80) { str += 'פ'; n -= 80; }
        else if (n >= 70) { str += 'ע'; n -= 70; }
        else if (n >= 60) { str += 'ס'; n -= 60; }
        else if (n >= 50) { str += 'נ'; n -= 50; }
        else if (n >= 40) { str += 'מ'; n -= 40; }
        else if (n >= 30) { str += 'ל'; n -= 30; }
        else if (n >= 20) { str += 'כ'; n -= 20; }
        else if (n >= 10) { str += 'י'; n -= 10; }

        // Units
        if (n >= 9) { str += 'ט'; n -= 9; }
        else if (n >= 8) { str += 'ח'; n -= 8; }
        else if (n >= 7) { str += 'ז'; n -= 7; }
        else if (n >= 6) { str += 'ו'; n -= 6; }
        else if (n >= 5) { str += 'ה'; n -= 5; }
        else if (n >= 4) { str += 'ד'; n -= 4; }
        else if (n >= 3) { str += 'ג'; n -= 3; }
        else if (n >= 2) { str += 'ב'; n -= 2; }
        else if (n >= 1) { str += 'א'; n -= 1; }
    }

    return str;
};
