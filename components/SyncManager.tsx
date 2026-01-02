
import React, { useState, useEffect, useRef } from 'react';
import { syncCompleteTanakh, checkSyncStatus, clearLocalDatabase, verifyDatabaseIntegrity, SyncProgress, DB_NAME, STORE_NAME } from '../services/bibleService';
import { Database, Download, CheckCircle2, RefreshCw, Trash2, X, BookOpen, HardDrive, Globe, Server, Cloud, Home, PackagePlus, FileDown, AlertCircle, Terminal, Activity, Square, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
    onSyncComplete?: () => void;
    onClose?: () => void;
    autoStart?: boolean;
}

const SyncManager: React.FC<Props> = ({ onSyncComplete, onClose, autoStart = false }) => {
    const { t, dir } = useLanguage();
    const [status, setStatus] = useState<SyncProgress | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    
    // Logs State
    const [logs, setLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);
    
    // Abort Controller for stopping sync
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        checkSyncStatus().then((complete) => {
            setIsComplete(complete);
        });
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    useEffect(() => {
        if (autoStart && isComplete && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [autoStart, isComplete, onClose]);

    const handleStartSync = async () => {
        if (isSyncing) return;
        
        const controller = new AbortController();
        abortControllerRef.current = controller;
        
        setIsSyncing(true);
        setIsComplete(false);
        setLogs(['מאתחל תהליך סנכרון...']);
        try {
            await syncCompleteTanakh((progress) => {
                setStatus(progress);
                if (progress.detailedLog) {
                    setLogs(prev => [...prev, progress.detailedLog!]);
                }
            }, controller.signal);
            setIsComplete(true);
            if (onSyncComplete) onSyncComplete();
        } catch (error: any) {
            if (error.message === 'AbortError' || error.name === 'AbortError') {
                setLogs(prev => [...prev, '[STOPPED] תהליך נעצר על ידי המשתמש.']);
            } else {
                alert(t('sync_error'));
                setLogs(prev => [...prev, `[FATAL ERROR] ${error}`]);
                console.error(error);
            }
        } finally {
            setIsSyncing(false);
            abortControllerRef.current = null;
        }
    };

    const handleStopSync = () => {
        if (abortControllerRef.current) {
            setLogs(prev => [...prev, '[STOPPING] מבצע עצירת חירום...']);
            abortControllerRef.current.abort();
        }
    };

    const handleVerify = async () => {
        if (isSyncing) return;
        setLogs(prev => [...prev, '>>> בדיקת תקינות מערכת יזומה <<<']);
        try {
            await verifyDatabaseIntegrity((msg) => setLogs(prev => [...prev, msg]));
        } catch (e) {
            setLogs(prev => [...prev, `[FATAL] Error verifying: ${e}`]);
        }
    };

    useEffect(() => {
        if (autoStart && !isComplete && !isSyncing) {
            handleStartSync();
        }
    }, [autoStart, isComplete]);

    const handleReset = async () => {
        if (window.confirm(t('delete_confirm'))) {
            await clearLocalDatabase();
            setIsComplete(false);
            setStatus(null);
            setLogs([]);
            if (onSyncComplete) onSyncComplete();
        }
    };

    // Helper to color code logs
    const getLogColor = (log: string) => {
        if (log.includes('[ERROR]')) return 'text-red-400';
        if (log.includes('[STOPPED]')) return 'text-rose-400';
        if (log.includes('[FAIL]')) return 'text-rose-400';
        if (log.includes('[DB]')) return 'text-yellow-400';
        if (log.includes('[IDB]')) return 'text-yellow-400';
        if (log.includes('[NET]')) return 'text-cyan-400';
        if (log.includes('[BUNDLE]')) return 'text-cyan-400';
        if (log.includes('[COMMIT]')) return 'text-green-400';
        if (log.includes('[SUCCESS]')) return 'text-green-400';
        return 'text-slate-300';
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-w-lg mx-auto w-full mb-10 animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-5 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm">
                        <Database size={18} className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">{t('db_management')}</h2>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                {isComplete ? t('synced') : 'Not Synced'}
                            </span>
                        </div>
                    </div>
                </div>
                {onClose && !isSyncing && !autoStart && (
                    <button onClick={onClose} className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"><X size={18} /></button>
                )}
            </div>

            {/* Technical Info */}
            <div className="bg-slate-50 dark:bg-black/20 border-b border-slate-200 dark:border-slate-800 p-4 space-y-3 shrink-0" dir="ltr">
                <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                        <Server size={12} /> System Storage Status
                    </h4>
                </div>
                
                <div className="grid gap-2">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1"><HardDrive size={10} /> Local IndexedDB</span>
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300 shadow-sm truncate">
                            indexeddb://{DB_NAME}/{STORE_NAME} ({isComplete ? 'Full' : 'Partial/Empty'})
                        </div>
                    </div>
                </div>
                
                <button 
                    onClick={handleVerify}
                    className="w-full flex items-center justify-center gap-2 py-1.5 mt-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded border border-indigo-200 dark:border-indigo-800 transition-colors"
                >
                    <ShieldCheck size={12} /> בדיקת תקינות (Run Diagnostics)
                </button>
            </div>

            {/* Terminal / Logs Area */}
            {(isSyncing || logs.length > 0) && (
                <div className="flex-1 bg-black border-y border-slate-800 p-3 overflow-hidden flex flex-col min-h-[160px]" dir="ltr">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 border-b border-slate-800 pb-2 mb-2">
                        <Terminal size={12} /> 
                        <span>SYNC LOG OUTPUT</span>
                        {isSyncing ? (
                            <span className="ml-auto flex items-center gap-1"><Activity size={10} className="animate-pulse text-green-500"/> LIVE</span>
                        ) : (
                            <span className="ml-auto flex items-center gap-1 text-slate-600">IDLE</span>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar font-mono text-[10px] leading-relaxed space-y-1">
                        {logs.map((log, i) => (
                            <div key={i} className={`${getLogColor(log)} break-all`}>
                                <span className="opacity-50 mr-2">{new Date().toLocaleTimeString().split(' ')[0]}</span>
                                {log}
                            </div>
                        ))}
                        <div ref={logsEndRef} />
                    </div>
                </div>
            )}

            {/* Main Action Area */}
            <div className="p-5 shrink-0">
                {isSyncing ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('processing')}</span>
                                {status?.source === 'remote' && (
                                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase"><Cloud size={10} /> From Sefaria API</span>
                                )}
                            </div>
                            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{status?.percentage}%</span>
                        </div>
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-normal break-words bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                            {autoStart ? t('auto_sync_alert') : status?.currentBook}
                        </div>
                        <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-300 ease-out" style={{ width: `${status?.percentage}%` }}></div>
                        </div>
                        
                        {/* STOP BUTTON */}
                        <button 
                            onClick={handleStopSync}
                            className="w-full mt-2 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                            <Square size={16} fill="currentColor" />
                            עצור סנכרון
                        </button>
                    </div>
                ) : isComplete ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl">
                            <div className="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 p-2 rounded-full"><CheckCircle2 size={20} /></div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">{t('success_title')}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{t('success_desc')}</p>
                            </div>
                        </div>
                        {!autoStart && (
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                {onClose && (
                                    <button onClick={onClose} className="col-span-2 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shadow-sm transition-all text-sm">
                                        <BookOpen size={16} />{t('return_to_reading')}
                                    </button>
                                )}
                                <button onClick={handleStartSync} className="flex items-center justify-center gap-2 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg border border-slate-200 dark:border-slate-700 text-xs transition-colors">
                                    <RefreshCw size={14} />{t('refresh_db')}
                                </button>
                                <button onClick={handleReset} className="flex items-center justify-center gap-2 py-2.5 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold rounded-lg text-xs transition-colors">
                                    <Trash2 size={14} />{t('delete_db')}
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                            <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed font-medium text-center">{t('sync_subtitle')}</p>
                        </div>
                        <button onClick={handleStartSync} className="w-full bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 text-sm">
                            <Download size={18} />{autoStart ? t('auto_sync') : t('start_sync')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SyncManager;
