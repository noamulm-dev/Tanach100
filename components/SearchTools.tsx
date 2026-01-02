
import React, { useState } from 'react';
import { Search, Info, Settings, Zap } from 'lucide-react';

const SearchTools: React.FC = () => {
    const [searchType, setSearchType] = useState<'regular' | 'els'>('regular');
    const [query, setQuery] = useState('');
    const [skip, setSkip] = useState(7);
    const [isSearching, setIsSearching] = useState(false);

    const handleSearch = () => {
        setIsSearching(true);
        // Simulate search delay
        setTimeout(() => setIsSearching(false), 800);
    };

    return (
        <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                    <button 
                        onClick={() => setSearchType('regular')}
                        className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${searchType === 'regular' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
                    >
                        חיפוש מורכב
                    </button>
                    <button 
                        onClick={() => setSearchType('els')}
                        className={`flex-1 py-2 px-4 rounded-lg font-bold transition-all ${searchType === 'els' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
                    >
                        דילוגי אותיות (ELS)
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder={searchType === 'regular' ? "חפש מילה או משפט..." : "הכנס מילה לחיפוש דילוגים..."}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-4 text-lg font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    </div>

                    {searchType === 'els' && (
                        <div className="flex items-center gap-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <Settings size={20} className="text-indigo-600" />
                            <div className="flex-1">
                                <label className="block text-xs font-bold text-indigo-700 mb-1">דילוג קבוע (אופציונלי)</label>
                                <input 
                                    type="number" 
                                    value={skip}
                                    onChange={(e) => setSkip(parseInt(e.target.value))}
                                    className="w-24 bg-white border border-indigo-200 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500"
                                />
                            </div>
                            <div className="text-xs text-indigo-600 max-w-[200px]">
                                חיפוש דילוגים מתבצע על פני כל התנ״ך כרצף אותיות אחד.
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={handleSearch}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                        {isSearching ? <Zap className="animate-pulse" /> : <Search size={20} />}
                        בצע חיפוש בתנ״ך
                    </button>
                </div>
            </div>

            <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center text-slate-400 gap-4">
                <Info size={40} strokeWidth={1.5} />
                <div className="text-center">
                    <p className="font-bold text-slate-600">אין תוצאות להצגה</p>
                    <p className="text-sm">הזן שאילתה למעלה כדי להתחיל בחיפוש</p>
                </div>
            </div>
        </div>
    );
};

export default SearchTools;
