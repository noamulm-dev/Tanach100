
import { BibleBook, BibleSection, ThemeProfile, Language } from './types';

export const APP_VERSION = "1.2.7";
export const BUILD_DATE = "27/12/2025 12:00";

export const BIBLE_BOOKS: BibleBook[] = [
    // Torah
    { id: 'Genesis', name: 'בראשית', section: BibleSection.Torah, chaptersCount: 50 },
    { id: 'Exodus', name: 'שמות', section: BibleSection.Torah, chaptersCount: 40 },
    { id: 'Leviticus', name: 'ויקרא', section: BibleSection.Torah, chaptersCount: 27 },
    { id: 'Numbers', name: 'במדבר', section: BibleSection.Torah, chaptersCount: 36 },
    { id: 'Deuteronomy', name: 'דברים', section: BibleSection.Torah, chaptersCount: 34 },
    // Nevim
    { id: 'Joshua', name: 'יהושע', section: BibleSection.Nevim, chaptersCount: 24 },
    { id: 'Judges', name: 'שופטים', section: BibleSection.Nevim, chaptersCount: 21 },
    { id: 'I Samuel', name: 'שמואל א', section: BibleSection.Nevim, chaptersCount: 31 },
    { id: 'II Samuel', name: 'שמואל ב', section: BibleSection.Nevim, chaptersCount: 24 },
    { id: 'I Kings', name: 'מלכים א', section: BibleSection.Nevim, chaptersCount: 22 },
    { id: 'II Kings', name: 'מלכים ב', section: BibleSection.Nevim, chaptersCount: 25 },
    { id: 'Isaiah', name: 'ישעיהו', section: BibleSection.Nevim, chaptersCount: 66 },
    { id: 'Jeremiah', name: 'ירמיהו', section: BibleSection.Nevim, chaptersCount: 52 },
    { id: 'Ezekiel', name: 'יחזקאל', section: BibleSection.Nevim, chaptersCount: 48 },
    { id: 'Hosea', name: 'הושע', section: BibleSection.Nevim, chaptersCount: 14 },
    { id: 'Joel', name: 'יואל', section: BibleSection.Nevim, chaptersCount: 4 },
    { id: 'Amos', name: 'עמוס', section: BibleSection.Nevim, chaptersCount: 9 },
    { id: 'Obadiah', name: 'עובדיה', section: BibleSection.Nevim, chaptersCount: 1 },
    { id: 'Jonah', name: 'יונה', section: BibleSection.Nevim, chaptersCount: 4 },
    { id: 'Micah', name: 'מיכה', section: BibleSection.Nevim, chaptersCount: 7 },
    { id: 'Nahum', name: 'נחום', section: BibleSection.Nevim, chaptersCount: 3 },
    { id: 'Habakkuk', name: 'חבקוק', section: BibleSection.Nevim, chaptersCount: 3 },
    { id: 'Zephaniah', name: 'צפניה', section: BibleSection.Nevim, chaptersCount: 3 },
    { id: 'Haggai', name: 'חגי', section: BibleSection.Nevim, chaptersCount: 2 },
    { id: 'Zechariah', name: 'זכריה', section: BibleSection.Nevim, chaptersCount: 14 },
    { id: 'Malachi', name: 'מלאכי', section: BibleSection.Nevim, chaptersCount: 3 },
    // Ketuvim
    { id: 'Psalms', name: 'תהילים', section: BibleSection.Ketuvim, chaptersCount: 150 },
    { id: 'Proverbs', name: 'משלי', section: BibleSection.Ketuvim, chaptersCount: 31 },
    { id: 'Job', name: 'איוב', section: BibleSection.Ketuvim, chaptersCount: 42 },
    { id: 'Song of Songs', name: 'שיר השירים', section: BibleSection.Ketuvim, chaptersCount: 8 },
    { id: 'Ruth', name: 'רות', section: BibleSection.Ketuvim, chaptersCount: 4 },
    { id: 'Lamentations', name: 'איכה', section: BibleSection.Ketuvim, chaptersCount: 5 },
    { id: 'Ecclesiastes', name: 'קהלת', section: BibleSection.Ketuvim, chaptersCount: 12 },
    { id: 'Esther', name: 'אסתר', section: BibleSection.Ketuvim, chaptersCount: 10 },
    { id: 'Daniel', name: 'דניאל', section: BibleSection.Ketuvim, chaptersCount: 12 },
    { id: 'Ezra', name: 'עזרא', section: BibleSection.Ketuvim, chaptersCount: 10 },
    { id: 'Nehemiah', name: 'נחמיה', section: BibleSection.Ketuvim, chaptersCount: 13 },
    { id: 'I Chronicles', name: 'דברי הימים א', section: BibleSection.Ketuvim, chaptersCount: 29 },
    { id: 'II Chronicles', name: 'דברי הימים ב', section: BibleSection.Ketuvim, chaptersCount: 36 }
];

export const GEMATRIA_VALUES: Record<string, number> = {
    'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
    'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
    'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
    'ך': 20, 'ם': 40, 'ן': 50, 'ף': 80, 'ץ': 90
};

export const ATBASH_MAP: Record<string, string> = {
    'א': 'ת', 'ב': 'ש', 'ג': 'ר', 'ד': 'ק', 'ה': 'צ', 'ו': 'פ', 'ז': 'ע', 'ח': 'ס', 'ט': 'נ', 'י': 'מ', 'כ': 'ל',
    'ל': 'כ', 'מ': 'י', 'נ': 'ט', 'ס': 'ח', 'ע': 'ז', 'פ': 'ו', 'צ': 'ה', 'ק': 'ד', 'ר': 'ג', 'ש': 'ב', 'ת': 'א'
};

export const FONT_OPTIONS: { id: string, label: string }[] = [
    { id: 'Frank Ruhl Libre', label: 'פרנק-ריהל' },
    { id: 'David Libre', label: 'דוד' },
    { id: 'Noto Serif Hebrew', label: 'נוטו סריף' },
    { id: 'Miriam Libre', label: 'מרים' },
    { id: 'Tinos', label: 'טינוס' },
    { id: 'Bellefair', label: 'בלפייר' },
    { id: 'Solitreo', label: 'סוליטריאו' }, // New
    { id: 'Bona Nova', label: 'בונה נובה' }, // New
    { id: 'Alef', label: 'אלף' },
    { id: 'Assistant', label: 'אסיסטנט' },
    { id: 'Noto Sans Hebrew', label: 'נוטו סאן' },
    { id: 'Heebo', label: 'היבו' },
    { id: 'Rubik', label: 'רוביק' },
    { id: 'IBM Plex Sans Hebrew', label: 'IBM פלקס' }, // New
    { id: 'Varela Round', label: 'וארלה' },
    { id: 'Secular One', label: 'סקולר' },
    { id: 'Suez One', label: 'סואץ' },
    { id: 'Fredoka', label: 'פרדוקה' },
    { id: 'Karantina', label: 'קרנטינה' }, // New
    { id: 'Amatic SC', label: 'אמתיק' },
];

// --- Translations ---

export const TRANSLATIONS: Record<string, Record<Language, string>> = {
    // General UI
    'app_title': { he: 'תנ״ך 3D', en: 'Tanakh 3D', fr: 'Tanakh 3D' },
    'menu_main': { he: 'תפריט ראשי', en: 'Main Menu', fr: 'Menu Principal' },
    'menu_help': { he: 'הסבר / עזרה', en: 'Help & Guide', fr: 'Aide & Guide' },
    'help_title': { he: 'מדריך למשתמש', en: 'User Guide', fr: 'Guide Utilisateur' },
    'about_title': { he: 'אודות', en: 'About', fr: 'À propos' },

    // Help Labels Feature - Main
    'menu_help_labels': { he: 'תוויות עזרה', en: 'Help Labels', fr: 'Infobulles' },
    'label_book_selector': { he: 'בחירת ספר', en: 'Select Book', fr: 'Choix Livre' },
    'label_parasha': { he: 'פרשת השבוע', en: 'Weekly Parasha', fr: 'Paracha' },
    'label_chapter_selector': { he: 'בחירת פרק', en: 'Select Chapter', fr: 'Choix Chapitre' },
    'label_tts': { he: 'הקראה קולית', en: 'Text to Speech', fr: 'Lecture audio' },
    'label_theme_toggle': { he: 'ערכת נושא', en: 'Theme Toggle', fr: 'Thème' },
    'label_main_menu': { he: 'תפריט ראשי', en: 'Main Menu', fr: 'Menu' },
    'label_design_menu': { he: 'הגדרות עיצוב', en: 'Design Settings', fr: 'Design' },
    'menu_library': { he: 'הספריה שלי', en: 'My Library', fr: 'Ma Bibliothèque' },
    'label_db_manager': { he: 'ניהול מאגר', en: 'Database', fr: 'Base de données' },
    'label_help': { he: 'עזרה', en: 'Help', fr: 'Aide' },
    'label_language': { he: 'שפה', en: 'Language', fr: 'Langue' },
    'label_play': { he: 'נגן', en: 'Play', fr: 'Lire' },
    'label_stop': { he: 'עצור', en: 'Stop', fr: 'Stop' },
    'label_pause': { he: 'השהה', en: 'Pause', fr: 'Pause' },
    'label_speed': { he: 'מהירות', en: 'Speed', fr: 'Vitesse' },
    'label_voice': { he: 'קול', en: 'Voice', fr: 'Voix' },
    'label_close': { he: 'סגור', en: 'Close', fr: 'Fermer' },

    // Parasha
    'parasha_summary_title': { he: 'תקציר פרשת השבוע', en: 'Parasha Summary', fr: 'Résumé Paracha' },
    'read_parasha_summary': { he: 'לחץ לקריאת התקציר', en: 'Tap to read summary', fr: 'Lire le résumé' },
    'parasha_date': { he: 'תאריך', en: 'Date', fr: 'Date' },
    'parasha_range': { he: 'טווח', en: 'Range', fr: 'Portée' },
    'parasha_end': { he: 'סוף פרשת', en: 'End of Parasha', fr: 'Fin de la Paracha' },
    'shabbat_entry': { he: 'כניסת שבת', en: 'Candle Lighting', fr: 'Allumage des bougies' },
    'shabbat_exit': { he: 'יציאת שבת', en: 'Havdalah', fr: 'Havdalah' },
    'times_tel_aviv': { he: 'זמני שבת (תל אביב)', en: 'Shabbat Times (Tel Aviv)', fr: 'Horaires Shabbat (Tel Aviv)' },

    // Help Labels - Settings & Theme
    'label_font_item': { he: 'בחר גופן', en: 'Select Font', fr: 'Choisir Police' },
    'label_decrease': { he: 'הקטן', en: 'Decrease', fr: 'Diminuer' },
    'label_increase': { he: 'הגדל', en: 'Increase', fr: 'Augmenter' },
    'label_toggle_nikud': { he: 'הצג/הסתר ניקוד', en: 'Toggle Nikud', fr: 'Basculer Nikud' },
    'label_toggle_verses': { he: 'הצג/הסתר מספרים', en: 'Toggle Numbers', fr: 'Basculer Numéros' },
    'label_toggle_chapter_headers': { he: 'הצג/הסתר כותרות פרקים', en: 'Toggle Chapter Headers', fr: 'Basculer Titres Chapitres' },
    'label_cancel': { he: 'ביטול', en: 'Cancel', fr: 'Annuler' },
    'label_confirm': { he: 'אישור', en: 'Confirm', fr: 'Confirmer' },
    'label_reset_theme': { he: 'אפס צבעים', en: 'Reset Colors', fr: 'Réinitialiser' },
    'label_mode_light': { he: 'מצב יום', en: 'Day Mode', fr: 'Mode Jour' },
    'label_mode_dark': { he: 'מצב לילה', en: 'Night Mode', fr: 'Mode Nuit' },
    'label_color_attr': { he: 'בחר אזור לצביעה', en: 'Select Area', fr: 'Choisir Zone' },
    'label_color_palette': { he: 'בחר צבע', en: 'Pick Color', fr: 'Choisir Couleur' },

    // Help Labels - Reader Context & Elements
    'label_verse_number': { he: 'מספר פסוק', en: 'Verse Num', fr: 'Numéro' },
    'label_chapter_pill': { he: 'מידע על הפרק', en: 'Chapter Info', fr: 'Info Chapitre' },
    'label_next_book': { he: 'עבור לספר הבא', en: 'Go to Next Book', fr: 'Livre Suivant' },
    'label_context_gematria': { he: 'פתח גימטרייה', en: 'Open Gematria', fr: 'Ouvrir Guématrie' },
    'label_context_commentary': { he: 'הצג מפרשים', en: 'Show Commentary', fr: 'Voir Commentaires' },
    'label_context_copy': { he: 'העתק טקסט', en: 'Copy Text', fr: 'Copier Texte' },
    'label_context_share': { he: 'שתף פסוק', en: 'Share Verse', fr: 'Partager Verset' },
    'label_context_note': { he: 'הוסף הערה', en: 'Add Note', fr: 'Ajouter Note' },
    'label_gematria_method': { he: 'הפעל/כבה שיטה', en: 'Toggle Method', fr: 'Basculer Méחד' },
    'label_back': { he: 'חזור', en: 'Back', fr: 'Retour' },

    // Search Help Labels
    'label_search_input': { he: 'הקלד לחיפוש', en: 'Search text', fr: 'Recherche' },
    'label_search_next': { he: 'חפש / הבא', en: 'Search / Next', fr: 'Suivant' },
    'label_search_prev': { he: 'הקודם', en: 'Previous', fr: 'Précédent' },
    'label_search_results': { he: 'מוני תוצאות', en: 'Results count', fr: 'Compteur' },
    'label_expand_search': { he: 'אפשרויות מתקדמות', en: 'Advanced options', fr: 'Options' },
    'label_whole_words': { he: 'מילה שלמה', en: 'Whole word', fr: 'Mot entier' },
    'label_match_type': { he: 'סוג התאמה', en: 'Match Type', fr: 'Type de correspondance' },
    'partial_words': { he: 'חלקית', en: 'Partial', fr: 'Partiel' },
    'label_search_scope': { he: 'טווח חיפוש', en: 'Scope', fr: 'Portée' },
    'label_els_button': { he: 'כלי דילוגים', en: 'ELS Tool', fr: 'Outil ELS' },
    'label_els_input': { he: 'הזן דילוג /תחומי דילוג מופרדים בפסיק', en: 'Enter skip value...', fr: 'Valeur de saut...' },
    'els_button': { he: 'דילוגים', en: 'ELS', fr: 'ELS' },
    'els_placeholder': { he: 'הזן דילוג /תחומי דילוג מופרדים בפסיק', en: 'Enter skip value...', fr: 'Valeur de saut...' },

    // Design Menu
    'menu_design': { he: 'עיצוב', en: 'Design', fr: 'Design' },
    'menu_fonts': { he: 'פונטים', en: 'Fonts', fr: 'Polices' },
    'menu_colors': { he: 'צבעים', en: 'Colors', fr: 'Couleurs' },
    'menu_layout': { he: 'עימוד', en: 'Layout', fr: 'Mise en page' },
    'design_fonts': { he: 'פונטים ועימוד', en: 'Fonts & Layout', fr: 'Polices et Mise en page' },
    'theme_title': { he: 'ערכת נושא', en: 'Theme', fr: 'Thème' },
    'theme_light_profiles': { he: 'יום (בהיר)', en: 'Day (Light)', fr: 'Jour' },
    'theme_dark_profiles': { he: 'לילה (כהה)', en: 'Night (Dark)', fr: 'Nuit' },
    'reset_defaults': { he: 'החזר לברירת מחדל', en: 'Reset to Default', fr: 'Rétablir défaut' },

    // Themes
    'theme_classic': { he: 'קלאסי', en: 'Classic', fr: 'Classique' },
    'theme_sepia': { he: 'נייר (ספיה)', en: 'Sepia / Paper', fr: 'Sépia' },
    'theme_cool': { he: 'קרח', en: 'Cool / Ice', fr: 'Glacé' },
    'theme_nature': { he: 'טבע', en: 'Nature', fr: 'Nature' },
    'theme_peach': { he: 'אפרסק', en: 'Peach', fr: 'Pêche' },

    'theme_dark': { he: 'כהה רגיל', en: 'Dark Slate', fr: 'Ardoise' },
    'theme_black': { he: 'שחור מלא (OLED)', en: 'True Black', fr: 'Noir Profond' },
    'theme_warm': { he: 'שוקולד (כהה חם)', en: 'Warm Dark', fr: 'Chocolat' },
    'theme_navy': { he: 'כחול עמוק', en: 'Deep Navy', fr: 'Bleu Profond' },
    'theme_forest': { he: 'יער', en: 'Forest', fr: 'Forêt' },

    'db_management': { he: 'ניהול מאגר', en: 'Database', fr: 'Base de données' },
    'synced': { he: 'מסונכרן', en: 'Synced', fr: 'Synchronisé' },
    'confirm': { he: 'סגור', en: 'Close', fr: 'Fermer' },
    'font': { he: 'גופן', en: 'Font', fr: 'Police' },
    'size': { he: 'גודל פונט', en: 'Font Size', fr: 'Taille' },
    'height': { he: 'מרווח שורות', en: 'Line Height', fr: 'Hauteur' },
    'spacing': { he: 'מרווח פסקאות', en: 'Paragraph Spacing', fr: 'Espacement' },
    'show_nikud': { he: 'ניקוד', en: 'Nikud', fr: 'Nikud' },
    'show_verses': { he: 'מספרי פסוקים', en: 'Verse Numbers', fr: 'Numéros de versets' },
    'show_chapter_headers': { he: 'כותרות פרקים', en: 'Chapter Headers', fr: 'Titres de chapitres' },
    'text_align': { he: 'יישור', en: 'Justify', fr: 'Justifier' },
    'text_continuous': { he: 'טקסט רציף', en: 'Continuous Text', fr: 'Texte continu' },
    'language': { he: 'שפה', en: 'Language', fr: 'Langue' },
    'return_to_reading': { he: 'חזור לקריאה', en: 'Return to Reading', fr: 'Retour à la lecture' },

    // Reader & Navigation
    'chapter': { he: 'פרק', en: 'Chapter', fr: 'Chapitre' },
    'verse': { he: 'פסוק', en: 'Verse', fr: 'Verset' },
    'next_book': { he: 'הספר הבא', en: 'Next Book', fr: 'Livre Suivant' },
    'loading': { he: 'טוען את הספר...', en: 'Loading book...', fr: 'Chargement du livre...' },
    'search_placeholder': { he: 'חיפוש בטקסט (הפרד מילים בפסיק)...', en: 'Search text (comma separated)...', fr: 'Recherche (séparé par virgule)...' },
    'whole_words': { he: 'מילה שלמה', en: 'Whole Word', fr: 'Mot entier' },
    'scope_current': { he: 'ספר נוכחי', en: 'Current Book', fr: 'Livre actuel' },
    'scope_torah': { he: 'חומשי תורה', en: 'Torah', fr: 'Torah' },
    'scope_tanakh': { he: 'כל התנ״ך', en: 'All Tanakh', fr: 'Tout le Tanakh' },
    'no_results': { he: 'לא נמצאו תוצאות', en: 'No results found', fr: 'Aucun résultat trouvé' },
    'error_search': { he: 'שגיאה בחיפוש', en: 'Search Error', fr: 'Erreur de recherche' },
    'search_requires_sync': { he: 'החיפוש דורש סנכרון מלא של המאגר. אנא בצע סנכרון בהגדרות.', en: 'Search requires full database sync. Please sync in settings.', fr: 'La recherche nécessite une synchronisation complète.' },

    // Chapter Info
    'chapter_info_title': { he: 'מידע על הפרק', en: 'Chapter Info', fr: 'Info Chapitre' },
    'verses_in_chapter': { he: 'פסוקים בפרק', en: 'Verses in Chapter', fr: 'Versets dans le chapitre' },
    'total_verses_book': { he: 'סה״כ פסוקים בספר', en: 'Total Verses in Book', fr: 'Total versets dans le livre' },
    'chapter_subject': { he: 'נושא הפרק', en: 'Chapter Theme', fr: 'Thème du chapitre' },
    'chapter_summary': { he: 'תקציר', en: 'Summary', fr: 'Résumé' },
    'info_unavailable': { he: 'מידע זה אינו זמין כרגע', en: 'Information currently unavailable', fr: 'Information non disponible' },

    // TTS
    'tts_play': { he: 'הקרא פרק', en: 'Read Chapter', fr: 'Lire le chapitre' },
    'tts_pause': { he: 'השהה', en: 'Pause', fr: 'Pause' },
    'tts_stop': { he: 'עצור', en: 'Stop', fr: 'Arrêter' },
    'tts_resume': { he: 'המשך', en: 'Resume', fr: 'Reprendre' },
    'tts_speed': { he: 'מהירות', en: 'Speed', fr: 'Vitesse' },

    // Context Menu
    'gematria': { he: 'גימטרייה', en: 'Gematria', fr: 'Guématrie' },
    'copy': { he: 'העתק', en: 'Copy', fr: 'Copier' },
    'share': { he: 'שתף', en: 'Share', fr: 'Partager' },
    'share_image': { he: 'שלח תמונה', en: 'Send Image', fr: 'Envoyer Image' },
    'share_options': { he: 'אפשרויות שיתוף', en: 'Share via', fr: 'Partager via' },
    'preview_title': { he: 'התמונה מוכנה לשיתוף', en: 'Image Ready to Share', fr: 'Image Prête à Partager' },
    'share_action': { he: 'שתף (וואטסאפ/טלגרם)', en: 'Share (WhatsApp/Telegram)', fr: 'Partager' },
    'download_action': { he: 'שמור בגלריה', en: 'Save to Gallery', fr: 'Enregistrer' },
    'commentary': { he: 'פרשנות', en: 'Commentary', fr: 'Commentaire' },
    'back_to_menu': { he: 'חזרה לתפריט', en: 'Back', fr: 'Retour' },
    'note': { he: 'הערה', en: 'Note', fr: 'Note' },
    'copied': { he: 'הועתק ללוח', en: 'Copied to clipboard', fr: 'Copié dans le presse-papier' },
    'share_unsupported': { he: 'שיתוף לא נתמך בדפדפן זה', en: 'Sharing not supported', fr: 'Partage non supporté' },
    'feature_soon': { he: 'אפשרות זו תהיה זמינה בגרסה הבאה', en: 'Coming soon', fr: 'Bientôt disponible' },

    // Commentators
    'rashi': { he: 'רש"י', en: 'Rashi', fr: 'Rachi' },
    'ramban': { he: 'רמב"ן', en: 'Ramban', fr: 'Ramban' },
    'ibnezra': { he: 'אבן עזרא', en: 'Ibn Ezra', fr: 'Ibn Ezra' },
    'sforno': { he: 'ספורנו', en: 'Sforno', fr: 'Sforno' },
    'baalhaturim': { he: 'בעל הטורים', en: 'Baal HaTurim', fr: 'Baal HaTurim' },
    'orhahayim': { he: 'אור החיים', en: 'Ohr HaChaim', fr: 'Ohr HaChaim' },
    'metzudatdavid': { he: 'מצודת דוד', en: 'Metzudat David', fr: 'Metzudat David' },
    'metzudatzion': { he: 'מצודת ציון', en: 'Metzudat Zion', fr: 'Metzudat Zion' },

    // Book Selector
    'select_book_title': { he: 'בחירת ספר', en: 'Select a Book', fr: 'Choisir un Livre' },
    'select_book_subtitle': { he: 'כל ספרי התנ״ך בהישג ידך', en: 'The entire Tanakh at your fingertips', fr: 'Tout le Tanakh à portée de main' },
    'chapters_count': { he: 'פרקים', en: 'Chapters', fr: 'Chapitres' },
    'section_torah': { he: 'תורה', en: 'Torah', fr: 'Torah' },
    'section_nevim': { he: 'נביאים', en: 'Neviim', fr: 'Neviim' },
    'section_ketuvim': { he: 'כתובים', en: 'Ketuvim', fr: 'Ketouvim' },

    // Sync Manager & Bundler
    'sync_title': { he: 'סנכרון מאגר תנ״ך מלא', en: 'Full Tanakh Sync', fr: 'Synchro Complète Tanakh' },
    'sync_subtitle': { he: 'הורדת 23,204 פסוקים לשימוש אופליין', en: 'Download 23,204 verses for offline use', fr: 'Télécharger 23,204 versets hors ligne' },
    'processing': { he: 'מעבד', en: 'Processing', fr: 'Traitement' },
    'fetching_data': { he: 'שואב נתונים ומאנדקס ב-Database...', en: 'Fetching data and indexing...', fr: 'Récupération et indexation...' },
    'server_active': { he: 'חיבור לשרת פעיל', en: 'Server Connection Active', fr: 'Connexion Serveur Active' },
    'memory_opt': { he: 'אופטימיזציית זיכרון', en: 'Memory Optimization', fr: 'Optimisation Mémoire' },
    'success_title': { he: 'הסנכרון הסתיים בהצלחה', en: 'Sync Finished Successfully', fr: 'Synchro Terminée' },
    'success_desc': { he: 'כל הספרים, הפרקים והפסוקים סונכרנו בהצלחה למכשיר שלך.', en: 'All books and verses synced successfully.', fr: 'Livres et versets synchronisés avec succès.' },
    'refresh_db': { he: 'רענון המאגר', en: 'Refresh Database', fr: 'Rafraîchir Base' },
    'delete_db': { he: 'מחיקת המאגר', en: 'Delete Database', fr: 'Supprimer Base' },
    'start_sync': { he: 'התחל סנכרון תנ״ך מלא', en: 'Start Full Sync', fr: 'Lancer Synchro' },
    'auto_sync': { he: 'מתחיל סנכרון אוטומטי...', en: 'Starting auto sync...', fr: 'Démarrage auto...' },
    'auto_sync_alert': { he: 'המערכת מעדכנת קבצים ואינדקסים עבור ההפעלה הראשונית, אנא המתן...', en: 'System is updating files and indexes for initial run, please wait...', fr: 'Mise à jour des fichiers et index pour le premier lancement...' },
    'sync_error': { he: 'ארעה שגיאה במהלך הסנכרון.', en: 'Error during sync.', fr: 'Erreur de synchronisation.' },
    'delete_confirm': { he: 'האם אתה בטוח שברצונך למחוק את כל נתוני התנ״ך מהמכשיר?', en: 'Are you sure you want to delete all Tanakh data?', fr: 'Vוulez-vous vraiment supprimer toutes les données?' },
    // Bundler
    'create_bundle': { he: 'יצירת קובץ להפצה', en: 'Create Deploy Bundle', fr: 'Créer Bundle Déploiement' },
    'bundle_desc': { he: 'הורד קובץ יחיד להטמעה בתיקיית Public לפני העלאה לשרת', en: 'Download single file for public folder before deploy', fr: 'Télécharger fichier unique' },
    'creating_bundle': { he: 'יוצר קובץ הפצה...', en: 'Creating bundle...', fr: 'Création du bundle...' },
    'bundle_success': { he: 'קובץ נוצר בהצלחה! העבר אותו לתיקיית public/data', en: 'Bundle created! Move to public/data', fr: 'Bundle créé!' },

    // Storage Info
    'storage_info_title': { he: 'פרטי מיקום קבצים (Storage Paths)', en: 'Storage Locations', fr: 'Emplacements de stockage' },
    'storage_db_label': { he: 'מסד נתונים (תוכן התנ"ך)', en: 'Bible Database', fr: 'Base de données biblique' },
    'storage_app_label': { he: 'קבצי האפליקציה (קוד מקור)', en: 'Application Source', fr: 'Source de l\'application' },

    // Gematria
    'gematria_placeholder': { he: 'הקלד כאן מילה, משפט או פסוק...', en: 'Type a word, sentence or verse...', fr: 'Tapez un mot, une phrase ou un verset...' },
    'gematria_no_text': { he: 'הכנס טקסט כדי לראות ניתוח', en: 'Enter text to see analysis', fr: 'Entrez du texte pour voir l\'analyse' },
    'method_standard': { he: 'רגילה', en: 'Standard', fr: 'Standard' },
    'method_katan': { he: 'קטנה', en: 'Small', fr: 'Petite' },
    'method_gadol': { he: 'גדולה', en: 'Large', fr: 'Grande' },
    'method_siduri': { he: 'סדרית', en: 'Ordinal', fr: 'Ordinale' },
    'method_atbash': { he: 'אתב"ש', en: 'Atbash', fr: 'Atbash' },

    // 3D
    '3d_title': { he: 'תצוגת טקסט תלת-ממדית', en: '3D Text View', fr: 'Vue Texte 3D' },
    '3d_active': { he: 'מצב תלת-ממד פעיל • גרור לסובב', en: '3D Mode Active • Drag to rotate', fr: 'Mode 3D Actif • Glisser pour tourner' },
};

export const BOOK_NAMES: Record<string, Record<Language, string>> = {
    'Genesis': { he: 'בראשית', en: 'Genesis', fr: 'Genèse' },
    'Exodus': { he: 'שמות', en: 'Exodus', fr: 'Exode' },
    'Leviticus': { he: 'ויקרא', en: 'Leviticus', fr: 'Lévitique' },
    'Numbers': { he: 'במדבר', en: 'Numbers', fr: 'Nombres' },
    'Deuteronomy': { he: 'דברים', en: 'Deuteronomy', fr: 'Deutéronome' },
    'Joshua': { he: 'יהושע', en: 'Joshua', fr: 'Josué' },
    'Judges': { he: 'שופטים', en: 'Judges', fr: 'Juges' },
    'I Samuel': { he: 'שמואל א', en: 'I Samuel', fr: 'I Samuel' },
    'II Samuel': { he: 'שמואל ב', en: 'II Samuel', fr: 'II Samuel' },
    'I Kings': { he: 'מלכים א', en: 'I Kings', fr: 'I Rois' },
    'II Kings': { he: 'מלכים ב', en: 'II Kings', fr: 'II Rois' },
    'Isaiah': { he: 'ישעיהו', en: 'Isaiah', fr: 'Ésaïe' },
    'Jeremiah': { he: 'ירמיהו', en: 'Jeremiah', fr: 'Jérémie' },
    'Ezekiel': { he: 'יחזקאל', en: 'Ezekiel', fr: 'Ézéchiel' },
    'Hosea': { he: 'הושע', en: 'Hosea', fr: 'Osée' },
    'Joel': { he: 'יואל', en: 'Joel', fr: 'Joël' },
    'Amos': { he: 'עמוס', en: 'Amos', fr: 'Amos' },
    'Obadiah': { he: 'עובדיה', en: 'Obadiah', fr: 'Abdias' },
    'Jonah': { he: 'יונה', en: 'Jonah', fr: 'Jonas' },
    'Micah': { he: 'מיכה', en: 'Micah', fr: 'Michée' },
    'Nahum': { he: 'נחום', en: 'Nahum', fr: 'Nahum' },
    'Habakkuk': { he: 'חבקוק', en: 'Habakkuk', fr: 'Habacuc' },
    'Zephaniah': { he: 'צפניה', en: 'Zephaniah', fr: 'Sophonie' },
    'Haggai': { he: 'חגי', en: 'Haggai', fr: 'Aggée' },
    'Zechariah': { he: 'זכריה', en: 'Zechariah', fr: 'Zacharie' },
    'Malachi': { he: 'מלאכי', en: 'Malachi', fr: 'Malachie' },
    'Psalms': { he: 'תהילים', en: 'Psalms', fr: 'Psaumes' },
    'Proverbs': { he: 'משלי', en: 'Proverbs', fr: 'Proverbes' },
    'Job': { he: 'איוב', en: 'Job', fr: 'Job' },
    'Song of Songs': { he: 'שיר השירים', en: 'Song of Songs', fr: 'Cantique des Cantiques' },
    'Ruth': { he: 'רות', en: 'Ruth', fr: 'Ruth' },
    'Lamentations': { he: 'איכה', en: 'Lamentations', fr: 'Lamentations' },
    'Ecclesiastes': { he: 'קהלת', en: 'Ecclesiastes', fr: 'Ecclésiaste' },
    'Esther': { he: 'אסתר', en: 'Esther', fr: 'Esther' },
    'Daniel': { he: 'דניאל', en: 'Daniel', fr: 'Daniel' },
    'Ezra': { he: 'עזרא', en: 'Ezra', fr: 'Esdras' },
    'Nehemiah': { he: 'נחמיה', en: 'Nehemiah', fr: 'Néhémie' },
    'I Chronicles': { he: 'דברי הימים א', en: 'I Chronicles', fr: 'I Chroniques' },
    'II Chronicles': { he: 'דברי הימים ב', en: 'II Chronicles', fr: 'II Chroniques' }
};

// --- Theme Profiles ---

export const THEME_PROFILES: Record<string, ThemeProfile> = {
    // --- LIGHT THEMES ---
    'light_classic': {
        id: 'light_classic',
        labelKey: 'theme_classic',
        isDark: false,
        bgMain: 'bg-slate-50',
        bgPaper: 'bg-white',
        textMain: 'text-slate-900',
        textSecondary: 'text-slate-500',
        border: 'border-slate-200',
        accent: 'text-indigo-600',
        uiBg: 'bg-white',
        hover: 'hover:bg-slate-100'
    },
    'light_sepia': {
        id: 'light_sepia',
        labelKey: 'theme_sepia',
        isDark: false,
        bgMain: 'bg-[#f4ecd8]',
        bgPaper: 'bg-[#fdf6e3]',
        textMain: 'text-[#5b4636]',
        textSecondary: 'text-[#8f7a66]',
        border: 'border-[#e6d8b8]',
        accent: 'text-[#a35e08]',
        uiBg: 'bg-[#fdf6e3]',
        hover: 'hover:bg-[#efe4c6]'
    },
    'light_cool': {
        id: 'light_cool',
        labelKey: 'theme_cool',
        isDark: false,
        bgMain: 'bg-sky-50',
        bgPaper: 'bg-azure-50', // Uses custom hex in tailwind config or arbitrary value
        // Using arbitrary value for distinct paper look
        textMain: 'text-slate-900',
        textSecondary: 'text-slate-500',
        border: 'border-sky-100',
        accent: 'text-sky-600',
        uiBg: 'bg-white',
        hover: 'hover:bg-sky-50'
    },
    // New Light Theme 1: Nature (Greenish)
    'light_nature': {
        id: 'light_nature',
        labelKey: 'theme_nature',
        isDark: false,
        bgMain: 'bg-[#f1f8e9]', // Light Green 50
        bgPaper: 'bg-[#ffffff]',
        textMain: 'text-[#1b5e20]', // Green 900
        textSecondary: 'text-[#558b2f]', // Light Green 800
        border: 'border-[#c5e1a5]',
        accent: 'text-[#2e7d32]',
        uiBg: 'bg-white',
        hover: 'hover:bg-[#dcedc8]'
    },
    // New Light Theme 2: Peach (Warm/Pinkish)
    'light_peach': {
        id: 'light_peach',
        labelKey: 'theme_peach',
        isDark: false,
        bgMain: 'bg-[#fff3e0]', // Orange 50
        bgPaper: 'bg-[#fff8f5]', // Very light peach
        textMain: 'text-[#4e342e]', // Brown 900
        textSecondary: 'text-[#8d6e63]',
        border: 'border-[#ffccbc]',
        accent: 'text-[#d84315]', // Deep Orange 800
        uiBg: 'bg-[#fff8f5]',
        hover: 'hover:bg-[#ffe0b2]'
    },

    // --- DARK THEMES ---
    'dark_slate': {
        id: 'dark_slate',
        labelKey: 'theme_dark',
        isDark: true,
        bgMain: 'bg-slate-950',
        bgPaper: 'bg-slate-900',
        textMain: 'text-slate-100',
        textSecondary: 'text-slate-400',
        border: 'border-slate-800',
        accent: 'text-indigo-400',
        uiBg: 'bg-slate-900',
        hover: 'hover:bg-slate-800'
    },
    'dark_black': {
        id: 'dark_black',
        labelKey: 'theme_black',
        isDark: true,
        bgMain: 'bg-black',
        bgPaper: 'bg-black', // True OLED
        textMain: 'text-gray-200',
        textSecondary: 'text-gray-500',
        border: 'border-gray-800',
        accent: 'text-white',
        uiBg: 'bg-gray-900',
        hover: 'hover:bg-gray-900'
    },
    'dark_warm': {
        id: 'dark_warm',
        labelKey: 'theme_warm',
        isDark: true,
        bgMain: 'bg-[#1e1a17]',
        bgPaper: 'bg-[#2c241b]',
        textMain: 'text-[#e8dcc5]',
        textSecondary: 'text-[#9c8c74]',
        border: 'border-[#4a3f35]',
        accent: 'text-[#dcb16f]',
        uiBg: 'bg-[#2c241b]',
        hover: 'hover:bg-[#3d3226]'
    },
    // New Dark Theme 1: Deep Navy
    'dark_navy': {
        id: 'dark_navy',
        labelKey: 'theme_navy',
        isDark: true,
        bgMain: 'bg-[#0a192f]',
        bgPaper: 'bg-[#112240]',
        textMain: 'text-[#e6f1ff]',
        textSecondary: 'text-[#8892b0]',
        border: 'border-[#233554]',
        accent: 'text-[#69f0ae]',
        uiBg: 'bg-[#112240]',
        hover: 'hover:bg-[#233554]'
    },
    // New Dark Theme 2: Forest
    'dark_forest': {
        id: 'dark_forest',
        labelKey: 'theme_forest',
        isDark: true,
        bgMain: 'bg-[#051a10]', // Very dark green
        bgPaper: 'bg-[#0d2e1e]',
        textMain: 'text-[#e0f2f1]',
        textSecondary: 'text-[#80cbc4]',
        border: 'border-[#1b5e20]',
        accent: 'text-[#69f0ae]',
        uiBg: 'bg-[#0d2e1e]',
        hover: 'hover:bg-[#1b5e20]'
    }
};
