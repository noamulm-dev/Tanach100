
import React from 'react';
import { X, Folder, File, Terminal, FolderTree } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
}

// Representation of the file structure based on the project description
const FILE_STRUCTURE = [
    { name: 'public', type: 'folder', children: [
        { name: 'manifest.json', type: 'file' },
        { name: 'favicon.ico', type: 'file' }
    ]},
    { name: 'src', type: 'folder', children: [
        { name: 'components', type: 'folder', children: [{ name: '...', type: 'file' }] },
        { name: 'services', type: 'folder', children: [
            { name: 'bibleService.ts', type: 'file' },
            { name: 'parashaService.ts', type: 'file' },
            { name: 'searchService.ts', type: 'file' }
        ]},
        { name: 'utils', type: 'folder', children: [{ name: 'gematria.ts', type: 'file' }] },
        { name: 'App.tsx', type: 'file' },
        { name: 'index.tsx', type: 'file' },
        { name: 'types.ts', type: 'file' },
        { name: 'constants.ts', type: 'file' }
    ]},
    { name: 'index.html', type: 'file' },
    { name: 'package.json', type: 'file' },
    { name: 'tsconfig.json', type: 'file' },
    { name: 'metadata.json', type: 'file' }
];

const FileNode: React.FC<{ item: any, level: number, isDarkMode: boolean }> = ({ item, level, isDarkMode }) => {
    return (
        <div style={{ paddingInlineStart: `${level * 20}px` }} className="py-1">
            <div className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                {item.type === 'folder' ? (
                    <Folder size={16} className="text-amber-500 fill-amber-500/20" />
                ) : (
                    <File size={16} className="text-blue-400" />
                )}
                <span className="font-mono text-sm">{item.name}</span>
                {item.note && <span className="text-xs text-emerald-500 font-bold ml-2">({item.note})</span>}
            </div>
            {item.children && (
                <div className={`ml-1 pl-1 border-l ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    {item.children.map((child: any, idx: number) => (
                        <FileNode key={idx} item={child} level={level + 1} isDarkMode={isDarkMode} />
                    ))}
                </div>
            )}
        </div>
    );
};

const DeveloperPage: React.FC<Props> = ({ isOpen, onClose, isDarkMode }) => {
    const { dir } = useLanguage();

    if (!isOpen) return null;

    const bgClass = isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
    const cardBg = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

    return (
        <div className={`fixed inset-0 z-[100] ${bgClass} flex flex-col`} dir={dir}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                    <Terminal size={24} className="text-emerald-500" />
                    <div>
                        <h2 className="text-xl font-black tracking-tight">כלי מפתח (Developer Tools)</h2>
                        <p className="text-xs opacity-60 font-mono">Tanakh App Internal System</p>
                    </div>
                </div>
                <button onClick={onClose} className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}`}>
                    <X size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                
                {/* File Structure Section */}
                <div className={`p-6 rounded-2xl border shadow-sm flex-1 ${cardBg}`}>
                    <div className="flex items-center gap-3 mb-4 border-b pb-4 border-dashed border-slate-200 dark:border-slate-700">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                            <FolderTree size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">מבנה קבצים בשרת</h3>
                            <p className="text-sm opacity-70">תצוגת היררכיית הקבצים של האפליקציה</p>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto font-mono text-sm leading-relaxed" dir="ltr">
                        {FILE_STRUCTURE.map((item, idx) => (
                            <FileNode key={idx} item={item} level={0} isDarkMode={isDarkMode} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeveloperPage;
