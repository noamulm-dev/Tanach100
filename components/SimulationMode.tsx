
import React from 'react';
import { Smartphone, Tablet, Monitor, X, ExternalLink } from 'lucide-react';

interface Props {
    onClose: () => void;
    isDarkMode: boolean;
}

const SimulationMode: React.FC<Props> = ({ onClose, isDarkMode }) => {
    // We append a timestamp to force reload if needed, or just use root
    const appUrl = window.location.origin;

    return (
        <div className={`fixed inset-0 z-50 flex flex-col ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'} overflow-hidden`}>
            {/* Header */}
            <div className={`h-14 shrink-0 flex items-center justify-between px-6 border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-lg text-white">
                        <Monitor size={20} />
                    </div>
                    <div>
                        <h2 className={`font-bold text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Device Simulator</h2>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Responsive Design Verification</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
                >
                    <X size={24} />
                </button>
            </div>

            {/* Scrollable Canvas */}
            <div className="flex-1 overflow-auto p-8 relative">
                <div className="flex items-start gap-16 min-w-max mx-auto justify-center pb-20">

                    {/* Mobile - iPhone SE / 13 Mini approx */}
                    <div className="flex flex-col items-center gap-4">
                        <div className={`flex items-center gap-2 text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            <Smartphone size={16} /> Mobile (375x667)
                        </div>
                        <div className="relative border-[12px] border-slate-800 rounded-[3rem] shadow-2xl bg-black overflow-hidden h-[691px] w-[399px]">
                            {/* Notch / Camera */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-10"></div>
                            <iframe
                                src={appUrl}
                                title="Mobile Simulation"
                                className="w-[375px] h-[667px] bg-white"
                                style={{ border: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Tablet - iPad Mini approx */}
                    <div className="flex flex-col items-center gap-4">
                        <div className={`flex items-center gap-2 text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            <Tablet size={16} /> Tablet (768x1024)
                        </div>
                        <div className="relative border-[12px] border-slate-800 rounded-[2rem] shadow-2xl bg-black overflow-hidden h-[1048px] w-[792px]">
                            <iframe
                                src={appUrl}
                                title="Tablet Simulation"
                                className="w-[768px] h-[1024px] bg-white"
                                style={{ border: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Desktop / Laptop */}
                    <div className="flex flex-col items-center gap-4">
                        <div className={`flex items-center gap-2 text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            <Monitor size={16} /> Desktop (1280x800)
                        </div>
                        <div className="relative border-b-[20px] border-x-[12px] border-t-[12px] border-slate-800 rounded-t-xl rounded-b-lg shadow-2xl bg-black overflow-hidden h-[832px] w-[1304px]">
                            <iframe
                                src={appUrl}
                                title="Desktop Simulation"
                                className="w-[1280px] h-[800px] bg-white"
                                style={{ border: 'none' }}
                            />
                        </div>
                        {/* Stand */}
                        <div className="w-48 h-12 bg-gray-700 bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-lg mx-auto shadow-xl relative -top-4 -z-10"></div>
                    </div>

                </div>
            </div>

            {/* Info Footer */}
            <div className={`py-2 px-4 text-center text-xs border-t ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-500' : 'bg-white border-slate-200 text-slate-400'}`}>
                Note: Each frame runs an independent session. Synchronized state between frames is not supported in this mode.
            </div>
        </div>
    );
};

export default SimulationMode;
