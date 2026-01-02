
import { ParashaData } from '../types';

// Simplified mapping for the start and end of each Parasha
// Key: Transliterated English Name from Hebcal (or similar)
// Value: { bookId: 'Genesis', chapter: 1, verse: 1, endChapter: 6, endVerse: 8, hebrewName: 'בראשית' }
export const PARASHA_MAPPING: Record<string, { bookId: string, chapter: number, verse: number, endChapter: number, endVerse: number, hebrewName: string }> = {
    // Genesis
    'Bereshit': { bookId: 'Genesis', chapter: 1, verse: 1, endChapter: 6, endVerse: 8, hebrewName: 'בראשית' },
    'Noach': { bookId: 'Genesis', chapter: 6, verse: 9, endChapter: 11, endVerse: 32, hebrewName: 'נח' },
    'Lech-Lecha': { bookId: 'Genesis', chapter: 12, verse: 1, endChapter: 17, endVerse: 27, hebrewName: 'לך-לך' },
    'Vayera': { bookId: 'Genesis', chapter: 18, verse: 1, endChapter: 22, endVerse: 24, hebrewName: 'וירא' },
    'Chayei Sara': { bookId: 'Genesis', chapter: 23, verse: 1, endChapter: 25, endVerse: 18, hebrewName: 'חיי שרה' },
    'Toldot': { bookId: 'Genesis', chapter: 25, verse: 19, endChapter: 28, endVerse: 9, hebrewName: 'תולדות' },
    'Vayetzei': { bookId: 'Genesis', chapter: 28, verse: 10, endChapter: 32, endVerse: 3, hebrewName: 'ויצא' },
    'Vayishlach': { bookId: 'Genesis', chapter: 32, verse: 4, endChapter: 36, endVerse: 43, hebrewName: 'וישלח' },
    'Vayeshev': { bookId: 'Genesis', chapter: 37, verse: 1, endChapter: 40, endVerse: 23, hebrewName: 'וישב' },
    'Miketz': { bookId: 'Genesis', chapter: 41, verse: 1, endChapter: 44, endVerse: 17, hebrewName: 'מקץ' },
    'Vayigash': { bookId: 'Genesis', chapter: 44, verse: 18, endChapter: 47, endVerse: 27, hebrewName: 'ויגש' },
    'Vayechi': { bookId: 'Genesis', chapter: 47, verse: 28, endChapter: 50, endVerse: 26, hebrewName: 'ויחי' },
    // Exodus
    'Shemot': { bookId: 'Exodus', chapter: 1, verse: 1, endChapter: 6, endVerse: 1, hebrewName: 'שמות' },
    'Vaera': { bookId: 'Exodus', chapter: 6, verse: 2, endChapter: 9, endVerse: 35, hebrewName: 'וארא' },
    'Bo': { bookId: 'Exodus', chapter: 10, verse: 1, endChapter: 13, endVerse: 16, hebrewName: 'בא' },
    'Beshalach': { bookId: 'Exodus', chapter: 13, verse: 17, endChapter: 17, endVerse: 16, hebrewName: 'בשלח' },
    'Yitro': { bookId: 'Exodus', chapter: 18, verse: 1, endChapter: 20, endVerse: 23, hebrewName: 'יתרו' },
    'Mishpatim': { bookId: 'Exodus', chapter: 21, verse: 1, endChapter: 24, endVerse: 18, hebrewName: 'משפטים' },
    'Terumah': { bookId: 'Exodus', chapter: 25, verse: 1, endChapter: 27, endVerse: 19, hebrewName: 'תרומה' },
    'Tetzaveh': { bookId: 'Exodus', chapter: 27, verse: 20, endChapter: 30, endVerse: 10, hebrewName: 'תצוה' },
    'Ki Tisa': { bookId: 'Exodus', chapter: 30, verse: 11, endChapter: 34, endVerse: 35, hebrewName: 'כי תשא' },
    'Vayakhel': { bookId: 'Exodus', chapter: 35, verse: 1, endChapter: 38, endVerse: 20, hebrewName: 'ויקהל' },
    'Pekudei': { bookId: 'Exodus', chapter: 38, verse: 21, endChapter: 40, endVerse: 38, hebrewName: 'פקודי' },
    // Leviticus
    'Vayikra': { bookId: 'Leviticus', chapter: 1, verse: 1, endChapter: 5, endVerse: 26, hebrewName: 'ויקרא' },
    'Tzav': { bookId: 'Leviticus', chapter: 6, verse: 1, endChapter: 8, endVerse: 36, hebrewName: 'צו' },
    'Shemini': { bookId: 'Leviticus', chapter: 9, verse: 1, endChapter: 11, endVerse: 47, hebrewName: 'שמיני' },
    'Tazria': { bookId: 'Leviticus', chapter: 12, verse: 1, endChapter: 13, endVerse: 59, hebrewName: 'תזריע' },
    'Metzora': { bookId: 'Leviticus', chapter: 14, verse: 1, endChapter: 15, endVerse: 33, hebrewName: 'מצורע' },
    'Acharei Mot': { bookId: 'Leviticus', chapter: 16, verse: 1, endChapter: 18, endVerse: 30, hebrewName: 'אחרי מות' },
    'Kedoshim': { bookId: 'Leviticus', chapter: 19, verse: 1, endChapter: 20, endVerse: 27, hebrewName: 'קדושים' },
    'Emor': { bookId: 'Leviticus', chapter: 21, verse: 1, endChapter: 24, endVerse: 23, hebrewName: 'אמור' },
    'Behar': { bookId: 'Leviticus', chapter: 25, verse: 1, endChapter: 26, endVerse: 2, hebrewName: 'בהר' },
    'Bechukotai': { bookId: 'Leviticus', chapter: 26, verse: 3, endChapter: 27, endVerse: 34, hebrewName: 'בחוקותי' },
    // Numbers
    'Bamidbar': { bookId: 'Numbers', chapter: 1, verse: 1, endChapter: 4, endVerse: 20, hebrewName: 'במדבר' },
    'Nasso': { bookId: 'Numbers', chapter: 4, verse: 21, endChapter: 7, endVerse: 89, hebrewName: 'נשא' },
    'Beha\'alotcha': { bookId: 'Numbers', chapter: 8, verse: 1, endChapter: 12, endVerse: 16, hebrewName: 'בהעלותך' },
    'Sh\'lach': { bookId: 'Numbers', chapter: 13, verse: 1, endChapter: 15, endVerse: 41, hebrewName: 'שלח' },
    'Korach': { bookId: 'Numbers', chapter: 16, verse: 1, endChapter: 18, endVerse: 32, hebrewName: 'קרח' },
    'Chukat': { bookId: 'Numbers', chapter: 19, verse: 1, endChapter: 22, endVerse: 1, hebrewName: 'חקת' },
    'Balak': { bookId: 'Numbers', chapter: 22, verse: 2, endChapter: 25, endVerse: 9, hebrewName: 'בלק' },
    'Pinchas': { bookId: 'Numbers', chapter: 25, verse: 10, endChapter: 30, endVerse: 1, hebrewName: 'פנחס' },
    'Matot': { bookId: 'Numbers', chapter: 30, verse: 2, endChapter: 32, endVerse: 42, hebrewName: 'מטות' },
    'Masei': { bookId: 'Numbers', chapter: 33, verse: 1, endChapter: 36, endVerse: 13, hebrewName: 'מסעי' },
    // Deuteronomy
    'Devarim': { bookId: 'Deuteronomy', chapter: 1, verse: 1, endChapter: 3, endVerse: 22, hebrewName: 'דברים' },
    'Vaetchanan': { bookId: 'Deuteronomy', chapter: 3, verse: 23, endChapter: 7, endVerse: 11, hebrewName: 'ואתחנן' },
    'Eikev': { bookId: 'Deuteronomy', chapter: 7, verse: 12, endChapter: 11, endVerse: 25, hebrewName: 'עקב' },
    'Re\'eh': { bookId: 'Deuteronomy', chapter: 11, verse: 26, endChapter: 16, endVerse: 17, hebrewName: 'ראה' },
    'Shoftim': { bookId: 'Deuteronomy', chapter: 16, verse: 18, endChapter: 21, endVerse: 9, hebrewName: 'שופטים' },
    'Ki Teitzei': { bookId: 'Deuteronomy', chapter: 21, verse: 10, endChapter: 25, endVerse: 19, hebrewName: 'כי תצא' },
    'Ki Tavo': { bookId: 'Deuteronomy', chapter: 26, verse: 1, endChapter: 29, endVerse: 8, hebrewName: 'כי תבוא' },
    'Nitzavim': { bookId: 'Deuteronomy', chapter: 29, verse: 9, endChapter: 30, endVerse: 20, hebrewName: 'נצבים' },
    'Vayeilech': { bookId: 'Deuteronomy', chapter: 31, verse: 1, endChapter: 31, endVerse: 30, hebrewName: 'וילך' },
    'Ha\'Azinu': { bookId: 'Deuteronomy', chapter: 32, verse: 1, endChapter: 32, endVerse: 52, hebrewName: 'האזינו' },
    'Vezot Haberakhah': { bookId: 'Deuteronomy', chapter: 33, verse: 1, endChapter: 34, endVerse: 12, hebrewName: 'וזאת הברכה' }
};

export const fetchCurrentParasha = async (): Promise<ParashaData | null> => {
    try {
        // Use Hebcal API to get this week's Parasha (for Tel Aviv - 293397)
        const response = await fetch('https://www.hebcal.com/shabbat?cfg=json&geonameid=293397&M=on');
        if (!response.ok) return null;

        const data = await response.json();
        const items = data.items || [];
        
        // Find the item with category "parashat"
        const parashaItem = items.find((item: any) => item.category === 'parashat');
        
        if (!parashaItem) return null;

        // Extract English name (Hebcal sometimes returns "Parashat X")
        let name = parashaItem.title.replace('Parashat ', '');
        
        // Handle double parashot
        const firstParashaName = name.split('-')[0];
        
        // Find in our mapping
        const mapping = PARASHA_MAPPING[firstParashaName] || PARASHA_MAPPING[name];

        if (!mapping) {
            console.warn(`Parasha ${name} not found in mapping.`);
            return null;
        }

        // Fetch Hebrew Date string
        let hebrewDate = "";
        try {
            const dateStr = parashaItem.date; // YYYY-MM-DD
            const convRes = await fetch(`https://www.hebcal.com/converter?cfg=json&date=${dateStr}&g2h=1&strict=1`);
            if (convRes.ok) {
                const convData = await convRes.json();
                hebrewDate = convData.hebrew;
            }
        } catch (e) {
            console.error("Failed to convert date", e);
        }

        // Extract Shabbat Times
        const candlesItem = items.find((item: any) => item.category === 'candles');
        const havdalahItem = items.find((item: any) => item.category === 'havdalah');

        const extractTime = (item: any) => {
            if (!item) return "";
            const timeMatch = item.title.match(/\d{1,2}:\d{2}/);
            return timeMatch ? timeMatch[0] : "";
        };

        const shabbatTimes = {
            candles: extractTime(candlesItem),
            havdalah: extractTime(havdalahItem)
        };

        return {
            name: name,
            hebrewName: parashaItem.hebrew || mapping.hebrewName,
            ref: {
                bookId: mapping.bookId,
                chapter: mapping.chapter,
                verse: mapping.verse
            },
            endRef: {
                bookId: mapping.bookId, // Parashot don't span across books generally
                chapter: mapping.endChapter,
                verse: mapping.endVerse
            },
            date: parashaItem.date,
            hebrewDate: hebrewDate,
            summary: `תקציר לפרשת ${parashaItem.hebrew} זמין בלחיצה.`,
            shabbatTimes: shabbatTimes
        };

    } catch (error) {
        console.error("Failed to fetch parasha:", error);
        return null;
    }
};

// Generic summary generator or fetcher
export const getParashaSummary = async (parashaName: string): Promise<string> => {
    // In a real app, fetch from Sefaria API: https://www.sefaria.org/api/texts/[ParashaName]
    // For now, return a placeholder or fetch description
    try {
         const response = await fetch(`https://www.sefaria.org/api/texts/${parashaName}?commentary=0&context=0`);
         if(response.ok) {
             const data = await response.json();
             return `לצערי, תקציר מלא של פרשת ${parashaName} אינו זמין כרגע במצב אופליין. \n\nבקרוב נוסיף מאגר תקצירים מובנה.`;
         }
    } catch(e) {}
    
    return "תקציר הפרשה אינו זמין כרגע.";
};
