
import React, { useState, useEffect } from 'react';
import { X, Save, User, FileText, Info } from 'lucide-react';
import { storageService } from '../services/storageService';
import { getGlobalLetterOffset } from '../services/bibleService';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    refData: { bookId: string, chapter: number, startVerse: number, endVerse?: number, selectedText?: string };
    isDarkMode: boolean;
}

const NoteEditorModal: React.FC<Props> = ({ isOpen, onClose, refData, isDarkMode }) => {
    const [text, setText] = useState('');
    const [creator, setCreator] = useState(localStorage.getItem('tanakh_last_creator') || '');
    const [globalIdx, setGlobalIdx] = useState<number>(0);

    useEffect(() => {
        if (isOpen) {
            getGlobalLetterOffset(refData.bookId, refData.chapter, refData.startVerse).then(setGlobalIdx);
        }
    }, [isOpen, refData]);

    const handleSave = () => {
        if (!text.trim()) return;
        localStorage.setItem('tanakh_last_creator', creator);
        
        storageService.saveNote({
            id: Date.now().toString(),
            bookId: refData.bookId,
            chapter: refData.chapter,
            startVerse: refData.startVerse,
            endVerse: refData.endVerse || refData.startVerse,
            selectedText: refData.selectedText || '',
            text,
            creatorName: creator || 'אנונימי',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            globalLetterStart: globalIdx
        });
        onClose();
    };

    if (!isOpen) return null;

    const bgClass = isDarkMode ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200';
    const inputBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200';

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 flex flex-col gap-4 border ${bgClass} animate-in zoom-in-95 duration-200`}>
                <div className="flex justify-between items-center border-b pb-3 border-current/10">
                    <div className="flex items-center gap-2">
                        <FileText className="text-indigo-500" size={20} />
                        <h3 className="font-black text-lg leading-none">הוספת הערה לספרייה</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-black/10 rounded-full"><X size={20} /></button>
                </div>

                {/* Context Header */}
                <div className={`p-3 rounded-xl border-dashed border-2 flex flex-col gap-1.5 ${isDarkMode ? 'border-indigo-500/30' : 'border-indigo-100'}`}>
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-indigo-500">{refData.bookId} {refData.chapter}:{refData.startVerse}</span>
                        <div className="flex items-center gap-1 text-[10px] opacity-60">
                            <Info size={10} />
                            <span>מיקום גלובלי: {globalIdx.toLocaleString()}</span>
                        </div>
                    </div>
                    {refData.selectedText && (
                        <div className="text-sm font-serif italic border-r-4 border-indigo-400 pr-3 py-1 bg-black/5 rounded">
                            "{refData.selectedText}"
                        </div>
                    )}
                </div>

                {/* Creator Field */}
                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider opacity-60 flex items-center gap-1">
                        <User size={10} /> שם היוצר
                    </label>
                    <input 
                        type="text" 
                        value={creator}
                        onChange={e => setCreator(e.target.value)}
                        placeholder="הזן שם..."
                        className={`w-full p-2.5 rounded-lg border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${inputBg}`}
                    />
                </div>

                {/* Note Content */}
                <div className="flex flex-col gap-1.5 flex-1">
                    <label className="text-[10px] font-black uppercase tracking-wider opacity-60">הערה אישית</label>
                    <textarea
                        autoFocus
                        className={`w-full h-32 p-3 rounded-xl border outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium ${inputBg}`}
                        placeholder="הקלד כאן את הערה שלך..."
                        value={text}
                        onChange={e => setText(e.target.value)}
                    />
                </div>

                <button
                    onClick={handleSave}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                    <Save size={18} />
                    שמור לספרייה האישית
                </button>
            </div>
        </div>
    );
};

export default NoteEditorModal;
