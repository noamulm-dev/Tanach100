import React, { useState } from 'react';
import { Cloud, Download, Upload, RefreshCw, Smartphone, Monitor, Database, AlertTriangle, FileJson } from 'lucide-react';
import { storageService, SyncPackage } from '../services/storageService';

interface Props {
    isDarkMode: boolean;
    onDataChanged: () => void;
}

const CloudSyncSection: React.FC<Props> = ({ isDarkMode, onDataChanged }) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState<number | null>(() => {
        const saved = localStorage.getItem('tanakh_last_cloud_sync');
        return saved ? parseInt(saved) : null;
    });

    const handleExportFile = () => {
        const pkg = storageService.getSyncPackage();
        const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tanakh_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const pkg = JSON.parse(event.target?.result as string) as SyncPackage;
                if (pkg.notes || pkg.bookmarks) {
                    storageService.importSyncPackage(pkg);
                    alert('הנתונים מוזגו בהצלחה!');
                    onDataChanged();
                } else {
                    throw new Error('Invalid format');
                }
            } catch (err) {
                alert('קובץ לא תקין או פגום.');
            }
        };
        reader.readAsText(file);
    };

    const handleCloudSyncStub = () => {
        setIsSyncing(true);
        // This is a stub for Google Drive API. 
        // Real implementation would use: gapi.client.drive.files.create / update
        setTimeout(() => {
            setIsSyncing(false);
            setLastSync(Date.now());
            localStorage.setItem('tanakh_last_cloud_sync', Date.now().toString());
            alert('סנכרון גוגל דרייב יופעל בגרסה המלאה (דורש הרשאות API). כרגע ניתן להשתמש בייצוא/ייבוא קבצים.');
        }, 1500);
    };

    const cardBase = `p-5 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Cloud Sync Hero */}
            <div className={`${cardBase} flex flex-col items-center text-center gap-4`}>
                <div className={`p-4 rounded-full ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                    <Cloud size={40} className={isSyncing ? 'animate-pulse' : ''} />
                </div>
                <div>
                    <h3 className="text-lg font-black">סנכרון ענן (Google Drive)</h3>
                    <p className="text-sm opacity-60 max-w-[250px] mx-auto mt-1">סנכרן את ההערות והסימניות שלך בין המחשב לסמארטפון באופן אוטומטי.</p>
                </div>
                
                <button 
                    onClick={handleCloudSyncStub}
                    disabled={isSyncing}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                    {isSyncing ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                    {isSyncing ? 'מסנכרן...' : 'סנכרן כעת'}
                </button>

                {lastSync && (
                    <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">
                        סנכרון אחרון: {new Date(lastSync).toLocaleString()}
                    </span>
                )}
            </div>

            {/* Manual Export/Import */}
            <div className="grid grid-cols-1 gap-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">גיבוי וסנכרון ידני</h4>
                
                <div className={`${cardBase} flex items-center justify-between py-3 px-4`}>
                    <div className="flex items-center gap-3">
                        <Download size={18} className="text-indigo-500" />
                        <span className="text-sm font-bold">ייצוא לקובץ גיבוי</span>
                    </div>
                    <button 
                        onClick={handleExportFile}
                        className={`p-2 rounded-lg ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white shadow-sm hover:bg-slate-100'}`}
                    >
                        <FileJson size={16} />
                    </button>
                </div>

                <div className={`${cardBase} flex items-center justify-between py-3 px-4 relative overflow-hidden`}>
                    <div className="flex items-center gap-3">
                        <Upload size={18} className="text-emerald-500" />
                        <span className="text-sm font-bold">ייבוא מקובץ גיבוי</span>
                    </div>
                    <label className={`p-2 rounded-lg cursor-pointer ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white shadow-sm hover:bg-slate-100'}`}>
                        <FileJson size={16} />
                        <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
                    </label>
                </div>
            </div>

            {/* Sync Tips */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3">
                <AlertTriangle size={20} className="text-amber-500 shrink-0" />
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400 leading-relaxed">
                    <strong>טיפ:</strong> כדי להעביר את ההערות מהמחשב לסלולרי ללא גוגל דרייב, השתמש ב"ייצוא לקובץ", שלח אותו לעצמך (בווטסאפ/מייל) ובצע "ייבוא" במכשיר השני.
                </p>
            </div>

            {/* Device Info */}
            <div className="flex items-center justify-center gap-6 opacity-30 grayscale py-4">
                <Monitor size={24} />
                <RefreshCw size={16} />
                <Smartphone size={24} />
            </div>
        </div>
    );
};

export default CloudSyncSection;