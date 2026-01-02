
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Book, Search, Type, Calculator, HardDrive, X, CircleHelp, Volume2, Info } from 'lucide-react';
import { Language } from '../types';
import { APP_VERSION, BUILD_DATE } from '../constants';

interface Props {
    onClose: () => void;
}

interface HelpSection {
    title: string;
    icon: React.ReactNode;
    items: string[];
}

const HelpScreen: React.FC<Props> = ({ onClose }) => {
    const { t, language } = useLanguage();

    const HELP_CONTENT: Record<Language, HelpSection[]> = {
        he: [
            {
                title: "ניווט וקריאה",
                icon: <Book className="text-indigo-600" />,
                items: [
                    "בחר ספר, פרק ופסוק מהתפריט העליון לניווט מהיר. התפריט מחולק לקטגוריות (תורה, נביאים, כתובים) להתמצאות קלה.",
                    "גלילה רציפה: המעבר בין פרקים מתבצע אוטומטית בעת הגלילה מטה, לחווית קריאה זורמת ללא הפסקות.",
                    "לחיצה ארוכה (או קליק ימני) על כל פסוק תפתח תפריט פעולות מתקדם: העתקה, שיתוף וגימטרייה.",
                    "שיתוף מועשר: בעת בחירה ב'שיתוף', הפסוק נשלח מעוצב, מנוקד וכולל מראה מקום מדויק (ספר, פרק, פסוק).",
                    "כפתור 'הספר הבא' המופיע בסוף כל ספר מאפשר מעבר מיידי לספר הבא ברצף התנ״ך."
                ]
            },
            {
                title: "הקראה קולית חכמה",
                icon: <Volume2 className="text-rose-600" />,
                items: [
                    "מנוע הקראה מותאם לתנ״ך: המערכת מנקה טעמי מקרא ומבצעת התאמות אינטונציה לקריאה טבעית ומדויקת.",
                    "שליטה מלאה: ניתן לשנות את מהירות ההקראה (ברירת מחדל 0.9) ואת סוג הקול תוך כדי האזנה.",
                    "רצף קריאה: שינוי הגדרות בזמן אמת אינו קוטע את הרצף אלא מתאים את הפסוק הנוכחי לשינויים.",
                    "מעקב ויזואלי: האפליקציה מדגישה את הפסוק המוקרא וגוללת את המסך אוטומטית כדי שתוכל לעקוב אחר הטקסט.",
                    "ההקראה פועלת גם ללא חיבור לאינטרנט (Offline) באמצעות מנוע הדיבור המובנה של המכשיר."
                ]
            },
            {
                title: "חיפוש מתקדם",
                icon: <Search className="text-emerald-600" />,
                items: [
                    "מנוע חיפוש גמיש: איתור מילים, חלקי מילים או ביטויים שלמים. ניתן לחפש עם או בלי ניקוד.",
                    "מסננים חכמים: מיקוד החיפוש ב'ספר נוכחי', 'חומשי תורה' או 'כל התנ״ך' לקבלת תוצאות רלוונטיות.",
                    "מילים שלמות: אפשרות לסינון תוצאות מדויק (למשל, חיפוש 'אור' לא יציג את המילה 'מאורות').",
                    "ניווט בתוצאות: סרגל החיפוש מציג את מספר התוצאות ומאפשר דילוג מהיר ביניהן באמצעות חיצים.",
                    "הדגשה צבעונית: מילות החיפוש מסומנות בטקסט בצבעים בולטים לנוחות הקריאה."
                ]
            },
            {
                title: "עיצוב ותצוגה מותאמים אישית",
                icon: <Type className="text-purple-600" />,
                items: [
                    "גופנים: מגוון רחב של גופנים לבחירה - החל מכתב תנ״כי מסורתי (כמו 'פרנק-ריהל') ועד גופנים מודרניים ונקיים.",
                    "התאמת טקסט: שליטה מלאה בגודל האותיות, גובה השורות והמרווח בין הפסקאות לקריאה נוחה.",
                    "תוכן דינמי: כפתורים להצגה או הסתרה של ניקוד ומספרי פסוקים, למיקוד בטקסט עצמו.",
                    "מצב לילה (Dark Mode): ערכת צבעים כהה המקל על העיניים בקריאה בחושך וחוסכת סוללה במסכים תואמים."
                ]
            },
            {
                title: "כלי גימטרייה וניתוח",
                icon: <Calculator className="text-amber-600" />,
                items: [
                    "מחשבון משולב: סמן טקסט לקבלת חישוב מיידי או השתמש במסך הגימטרייה להקלדה וניתוח חופשי.",
                    "ניתוח מעמיק: הכלי מציג ערך גימטרי לכל מילה בנפרד וכן סכום כולל לכל הביטוי.",
                    "ריבוי שיטות: תמיכה ב-5 שיטות חישוב במקביל: רגיל, מספר קטן, מספר גדול, סידורי ואתב״ש.",
                    "ממשק אינטראקטיבי: לחץ על שמות השיטות בתחתית המסך כדי להציג או להסתיר חישובים ספציפיים.",
                    "עריכה גמישה: ניתן לערוך את הטקסט המקורי בחלונית הגימטרייה לבחינת וריאציות שונות."
                ]
            },
            {
                title: "סנכרון ושימוש ללא רשת",
                icon: <HardDrive className="text-blue-600" />,
                items: [
                    "עצמאות מלאה: הורדת כל מאגר התנ״ך (כ-23,000 פסוקים) למכשיר מאפשרת שימוש מלא בכל מקום, גם במצב טיסה.",
                    "ביצועים משופרים: עבודה עם מאגר מקומי מבטיחה מעבר מיידי בין פרקים וחיפוש מהיר במיוחד.",
                    "ניהול חכם: המערכת מנהלת את הזיכרון ביעילות, וניתן למחוק את המאגר המקומי בכל עת דרך ההגדרות."
                ]
            },
            {
                title: t('about_title'),
                icon: <Info className="text-slate-600" />,
                items: [
                    `${t('app_title')} v${APP_VERSION}`,
                    `Build Date: ${BUILD_DATE}`,
                    "Built with React & TypeScript",
                    "Developed for optimal mobile experience."
                ]
            }
        ],
        en: [
            {
                title: "Navigation & Reading",
                icon: <Book className="text-indigo-600" />,
                items: [
                    "Select any Book, Chapter, or Verse from the categorized top menu (Torah, Neviim, Ketuvim).",
                    "Continuous Scrolling: The app automatically transitions to the next chapter as you scroll down.",
                    "Context Menu: Long-press (or right-click) any verse to access Copy, Share, and Gematria tools.",
                    "Smart Sharing: Share verses formatted with full Nikud (vowels) and exact citation details.",
                    "Use the 'Next Book' button at the end of each book for a seamless transition through the Tanakh."
                ]
            },
            {
                title: "Smart Text-to-Speech",
                icon: <Volume2 className="text-rose-600" />,
                items: [
                    "Optimized Reading Engine: Cleans cantillation marks and adjusts intonation for natural Hebrew speech.",
                    "Full Control: Adjust reading speed (default 0.9) and select preferred voices on the fly.",
                    "Seamless Experience: Changing settings during playback adjusts the current verse without stopping the flow.",
                    "Visual Tracking: The app highlights the spoken verse and auto-scrolls to keep your place.",
                    "Works Offline: Utilizes your device's built-in text-to-speech engine, requiring no internet connection."
                ]
            },
            {
                title: "Advanced Search",
                icon: <Search className="text-emerald-600" />,
                items: [
                    "Flexible Search: Find words, phrases, or partial matches with or without Nikud.",
                    "Smart Filters: Narrow down search to 'Current Book', 'Torah', or 'All Tanakh'.",
                    "Whole Words: Toggle for exact word matching (e.g., 'Light' won't match 'Lightning').",
                    "Result Navigation: View match count and jump between results using the navigation arrows.",
                    "Visual Highlights: Search terms are clearly highlighted in the text for quick scanning."
                ]
            },
            {
                title: "Design & Display",
                icon: <Type className="text-purple-600" />,
                items: [
                    "Fonts: Choose from a wide variety of fonts, from traditional Biblical styles to modern sans-serifs.",
                    "Custom Layout: Adjust font size, line height, and paragraph spacing for optimal readability.",
                    "Content Toggles: Easily show or hide Nikud (vowels) and verse numbers to focus on the text.",
                    "Dark Mode: Eye-friendly dark theme for low-light reading, accessible via the toggle in the header."
                ]
            },
            {
                title: "Gematria & Analysis",
                icon: <Calculator className="text-amber-600" />,
                items: [
                    "Integrated Calculator: Select text for instant calculation or type freely in the Gematria tool.",
                    "Deep Analysis: View values for individual words as well as the total sum for the phrase.",
                    "Multiple Methods: Support for 5 calculation methods simultaneously: Standard, Small, Large, Ordinal, and Atbash.",
                    "Interactive UI: Tap method names to toggle their visibility and focus on specific values.",
                    "Flexible Editing: Modify the text within the tool to explore different Gematria combinations."
                ]
            },
            {
                title: "Sync & Offline Mode",
                icon: <HardDrive className="text-blue-600" />,
                items: [
                    "Full Independence: Download the entire Tanakh database for unrestricted offline access.",
                    "Enhanced Performance: Local database ensures instant page loads and lightning-fast search results.",
                    "Data Efficient: Once downloaded, the app requires no data connection for reading.",
                    "Storage Control: Manage or delete the local database at any time via settings."
                ]
            },
            {
                title: t('about_title'),
                icon: <Info className="text-slate-600" />,
                items: [
                    `${t('app_title')} v${APP_VERSION}`,
                    `Build Date: ${BUILD_DATE}`,
                    "Built with React & TypeScript",
                    "Developed for optimal mobile experience."
                ]
            }
        ],
        fr: [
            {
                title: "Navigation et Lecture",
                icon: <Book className="text-indigo-600" />,
                items: [
                    "Sélectionnez un Livre, Chapitre ou Verset depuis le menu catégorisé (Torah, Neviim, Ketouvim).",
                    "Défilement Continu : L'application passe automatiquement au chapitre suivant lorsque vous faites défiler.",
                    "Menu Contextuel : Appui long (ou clic droit) sur un verset pour Copier, Partager ou calculer la Guématrie.",
                    "Partage Intelligent : Partagez des versets formatés avec Nikud (voyelles) et citation exacte.",
                    "Utilisez le bouton 'Livre Suivant' à la fin de chaque livre pour une transition fluide."
                ]
            },
            {
                title: "Synthèse Vocale Intelligente",
                icon: <Volume2 className="text-rose-600" />,
                items: [
                    "Moteur Optimisé : Nettoie les marques de cantillation pour une lecture naturelle en hébreu.",
                    "Contrôle Total : Ajustez la vitesse (défaut 0.9) et changez de voix pendant la lecture.",
                    "Expérience Fluide : Les changements de paramètres s'appliquent sans arrêter la lecture en cours.",
                    "Suivi Visuel : Le verset lu est surligné et l'écran défile automatiquement.",
                    "Fonctionne Hors Ligne : Utilise le moteur TTS de votre appareil, sans connexion internet."
                ]
            },
            {
                title: "Recherche Avancée",
                icon: <Search className="text-emerald-600" />,
                items: [
                    "Recherche Flexible : Trouvez des mots ou phrases, avec ou sans Nikud.",
                    "Filtres Intelligents : Ciblez 'Livre Actuel', 'Torah' ou 'Tout le Tanakh'.",
                    "Mots Entiers : Option pour correspondances exactes uniquement.",
                    "Navigation : Visualisez le nombre de résultats et naviguez avec les flèches.",
                    "Surlignage : Les termes trouvés sont mis en évidence pour une lecture rapide."
                ]
            },
            {
                title: "Design et Affichage",
                icon: <Type className="text-purple-600" />,
                items: [
                    "Polices : Large choix, du style biblique traditionnel aux polices modernes.",
                    "Mise en Page : Ajustez la taille, la hauteur de ligne et l'espacement.",
                    "Contenu : Affichez ou masquez le Nikud et les numéros de versets.",
                    "Mode Sombre : Thème sombre confortable pour la lecture nocturne."
                ]
            },
            {
                title: "Guématrie et Analyse",
                icon: <Calculator className="text-amber-600" />,
                items: [
                    "Calculateur Intégré : Sélectionnez du texte ou tapez librement pour l'analyser.",
                    "Analyse Détaillée : Valeurs par mot et somme totale de la phrase.",
                    "Méthodes Multiples : 5 méthodes simultanées (Standard, Petit nombre, etc.).",
                    "Interface Interactive : Masquez ou affichez les méthodes selon vos besoins.",
                    "Édition : Modifiez le texte dans l'outil pour tester des combinaisons."
                ]
            },
            {
                title: "Synchro et Hors Ligne",
                icon: <HardDrive className="text-blue-600" />,
                items: [
                    "Indépendance Totale : Téléchargez toute la base de données pour un accès hors ligne.",
                    "Performance : La base locale assure une navigation instantanée et une recherche ultra-rapide.",
                    "Économie de Données : Plus besoin de connexion internet une fois téléchargé.",
                    "Gestion : Supprimez la base locale à tout moment via les paramètres."
                ]
            },
            {
                title: t('about_title'),
                icon: <Info className="text-slate-600" />,
                items: [
                    `${t('app_title')} v${APP_VERSION}`,
                    `Build Date: ${BUILD_DATE}`,
                    "Built with React & TypeScript",
                    "Developed for optimal mobile experience."
                ]
            }
        ]
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm shrink-0">
                <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <CircleHelp className="text-indigo-600" size={24} />
                    {t('help_title')}
                </h2>
                <button 
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-6 pb-8">
                    {HELP_CONTENT[language].map((section, idx) => (
                        <div 
                            key={idx} 
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-all hover:shadow-md"
                        >
                            <div className="flex items-center gap-3 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                    {section.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{section.title}</h3>
                            </div>
                            <ul className="space-y-4">
                                {section.items.map((item, itemIdx) => (
                                    <li key={itemIdx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 leading-relaxed text-lg md:text-xl font-medium">
                                        <div className="mt-2.5 min-w-[8px] h-[8px] rounded-full bg-indigo-500/50 shrink-0"></div>
                                        <span dir="ltr" className="text-right w-full">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HelpScreen;
