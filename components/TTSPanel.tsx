
import React from 'react';
import { X, Square, Pause, Play, Minus, Plus, User } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import WithHelp from './WithHelp';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    isDarkMode: boolean;
    dir: 'rtl' | 'ltr';
    isTTSActive: boolean;
    handleStop: () => void;
    handlePlayPause: () => void;
    ttsSpeed: number;
    changeSpeed: (delta: number) => void;
    selectedVoiceURI: string;
    changeVoice: (uri: string) => void;
    availableVoices: SpeechSynthesisVoice[];
}

const TTSPanel: React.FC<Props> = ({
    isOpen, onClose, isDarkMode, dir, isTTSActive, handleStop, handlePlayPause,
    ttsSpeed, changeSpeed, selectedVoiceURI, changeVoice, availableVoices
}) => {
    const { t } = useLanguage();
    
    if (!isOpen) return null;

    const modalBgClass = isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900';
    const modalBorderClass = isDarkMode ? 'border-slate-800' : 'border-slate-200';

    return (
        <>
            <div className="fixed inset-0 z-[70] bg-transparent" onClick={onClose}></div>
            <div 
                className={`absolute ${dir === 'rtl' ? 'left-0' : 'right-0'} w-64 p-4 rounded-2xl shadow-2xl border z-[80] animate-in zoom-in-95 duration-200 ${modalBgClass} ${modalBorderClass}`} 
                style={{ top: 'calc(58px + env(safe-area-inset-top))' }}
                onClick={(e) => e.stopPropagation()}
            >
                <WithHelp labelKey="label_close" position="top">
                    <button 
                        onClick={onClose}
                        className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                    >
                        <X size={16} />
                    </button>
                </WithHelp>

                <div className="flex flex-col gap-4 mt-2">
                    <div className="flex items-center justify-center gap-4">
                        <WithHelp labelKey="label_stop" position="top">
                            <button onClick={handleStop} className={`p-3 rounded-full transition-colors ${isDarkMode ? 'bg-rose-900/50 text-rose-400 hover:bg-rose-900' : 'bg-rose-100 text-rose-600 hover:bg-rose-200'}`}>
                                <Square size={20} fill="currentColor" />
                            </button>
                        </WithHelp>
                        
                        <WithHelp labelKey={isTTSActive ? "label_pause" : "label_play"} position="top">
                            <button 
                                onClick={handlePlayPause} 
                                className={`p-4 rounded-full shadow-lg transition-transform active:scale-95 ${isTTSActive ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'}`}
                            >
                                {isTTSActive ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                            </button>
                        </WithHelp>
                    </div>

                    <div className={`h-px w-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold opacity-60 text-center">{t('tts_speed')}</span>
                        <div className={`flex items-center justify-between rounded-xl p-1 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                            <button onClick={() => changeSpeed(-0.05)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}>
                                <Minus size={16} />
                            </button>
                            <span className="font-bold text-sm w-12 text-center">x{ttsSpeed.toFixed(2)}</span>
                            <button onClick={() => changeSpeed(0.05)} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-200'}`}>
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold opacity-60 text-center flex items-center justify-center gap-1">
                            <User size={10} />
                            {t('label_voice')}
                        </span>
                        <select 
                            value={selectedVoiceURI}
                            onChange={(e) => changeVoice(e.target.value)}
                            className={`w-full text-xs p-2 rounded-xl border outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                        >
                            {availableVoices.length === 0 && <option value="">ברירת מחדל</option>}
                            {availableVoices.map(v => (
                                <option key={v.voiceURI} value={v.voiceURI}>
                                    {v.name.replace('Microsoft', '').replace('Google', '').substring(0, 20)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </>
    );
};

export default TTSPanel;
