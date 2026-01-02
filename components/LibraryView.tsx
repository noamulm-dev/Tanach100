
import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { UserNote, UserBookmark, ThemeProfile } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { X, Bookmark, FileText, History, Trash2, ExternalLink, Library, User, Clock, Info, RefreshCw } from 'lucide-react';
import CloudSyncSection from './CloudSyncSection';

interface Props {
    activeTheme: ThemeProfile;
    isDarkMode: boolean;
    onJump: (result: { bookId: string, chapter: number, verse: number }) => void;
    onClose: () => void;
}

const LibraryView: React.FC<Props> = ({ activeTheme, isDarkMode, onJump, onClose }) => {
    const { t, dir } = useLanguage();
    const [activeSection, setActiveSection] = useState<'notes' | 'bookmarks' | 'history' | 'sync'>('notes');
    const [notes, setNotes] = useState<UserNote[]>([]);
    const [bookmarks, setBookmarks] = useState<UserBookmark[]>([]);
    const [history, setHistory] = useState<string[]>([]);

    const refreshData = () => {
        setNotes((storageService.loadNotes() || []).filter(Boolean).sort((a, b) => b.createdAt - a.createdAt));
        setBookmarks((storageService.loadBookmarks() || []).filter(Boolean).sort((a, b) => b.createdAt - a.createdAt));
        setHistory((storageService.loadSearchHistory() || []).filter(Boolean));
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleDeleteNote = (id: string) => {
        if (window.confirm('האם למחוק הערה זו?')) {
            storageService.deleteNote(id);
            setNotes(prev => prev.filter(n => n.id !== id));
        }
    };

    const handleDeleteBookmark = (id: string) => {
        storageService.deleteBookmark(id);
        setBookmarks(prev => prev.filter(b => b.id !== id));
    };

    const cardClass = `p-4 rounded-xl border mb-3 transition-all relative overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`;

    return (
        <div className={`flex flex-col h-full animate-in slide-in-from-bottom duration-300 ${activeTheme.bgMain}`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${activeTheme.border} bg-white/5`}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500">
                        <Library size={20} />
                    </div>
                    <h2 className="text-xl font-black">הספריה שלי</h2>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5"><X /></button>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-black/5 dark:bg-white/5 mx-4 mt-4 rounded-xl border border-current/10 overflow-x-auto no-scrollbar">
                {[
                    { id: 'notes', label: 'הערות', icon: <FileText size={14}/> },
                    { id: 'bookmarks', label: 'סימניות', icon: <Bookmark size={14}/> },
                    { id: 'history', label: 'חיפושים', icon: <History size={14}/> },
                    { id: 'sync', label: 'סנכרון', icon: <RefreshCw size={14}/> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSection(tab.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${activeSection === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-indigo-400'}`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeSection === 'notes' && (
                    notes.length === 0 ? <EmptyState msg="אין הערות שמורות" /> :
                    notes.map(note => (
                        <div key={note.id} className={cardClass}>
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-indigo-500 flex items-center gap-1.5">
                                        {note.bookId} {note.chapter}:{note.startVerse}{note.endVerse !== note.startVerse ? `-${note.endVerse}` : ''}
                                    </span>
                                    <div className="flex items-center gap-2 mt-1 opacity-50 text-[10px]">
                                        <span className="flex items-center gap-1"><User size={10} /> {note.creatorName}</span>
                                        <span className="flex items-center gap-1"><Clock size={10} /> {new Date(note.createdAt).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><Info size={10} /> {note.globalLetterStart.toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => onJump({ bookId: note.bookId, chapter: note.chapter, verse: note.startVerse })} className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg hover:bg-indigo-500/20 transition-colors">
                                        <ExternalLink size={16}/>
                                    </button>
                                    <button onClick={() => handleDeleteNote(note.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors">
                                        <Trash2 size={16}/>
                                    </button>
                                </div>
                            </div>
                            
                            {note.selectedText && (
                                <div className="text-xs font-serif italic border-r-4 border-indigo-400/30 pr-3 py-1.5 mb-2 bg-black/5 rounded opacity-80">
                                    "{note.selectedText}"
                                </div>
                            )}

                            <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{note.text}</p>
                        </div>
                    ))
                )}

                {activeSection === 'bookmarks' && (
                    bookmarks.length === 0 ? <EmptyState msg="אין סימניות שמורות" /> :
                    bookmarks.map(bm => (
                        <div key={bm.id} className={cardClass + " flex items-center justify-between"}>
                            <div className="flex items-center gap-3">
                                <Bookmark size={18} className="text-indigo-500" />
                                <div>
                                    <p className="font-bold">{bm.title}</p>
                                    <p className="text-[10px] opacity-50">{new Date(bm.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => onJump(bm)} className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg hover:bg-indigo-500/20 transition-colors">
                                    <ExternalLink size={16}/>
                                </button>
                                <button onClick={() => handleDeleteBookmark(bm.id)} className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                    ))
                )}

                {activeSection === 'history' && (
                    history.length === 0 ? <EmptyState msg="אין היסטוריית חיפוש" /> :
                    history.map((term, i) => (
                        <div key={i} className={cardClass + " flex items-center justify-between py-3"}>
                            <span className="font-bold">{term}</span>
                            <History size={14} className="opacity-30" />
                        </div>
                    ))
                )}

                {activeSection === 'sync' && (
                    <CloudSyncSection isDarkMode={isDarkMode} onDataChanged={refreshData} />
                )}
            </div>
        </div>
    );
};

const EmptyState = ({ msg }: { msg: string }) => (
    <div className="flex flex-col items-center justify-center h-40 opacity-30">
        <Library size={48} className="mb-2" />
        <p className="font-bold">{msg}</p>
    </div>
);

export default LibraryView;
