
import React from 'react';
import { Smartphone, Tablet, Monitor, X, MonitorSmartphone } from 'lucide-react';

interface Props {
    onClose: () => void;
    isDarkMode: boolean;
}

const SimulationMode: React.FC<Props> = ({ onClose, isDarkMode }) => {
    const appUrl = window.location.origin;
    const [activeDevice, setActiveDevice] = React.useState<'mobile' | 'tablet' | 'desktop'>('mobile');
    const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');

    const devices = {
        mobile: {
            w: 375, h: 667, label: 'Mobile', icon: Smartphone,
            frameClass: 'border-[12px] border-slate-800 rounded-[3rem]',
            notch: true
        },
        tablet: {
            w: 768, h: 1024, label: 'Tablet', icon: Tablet,
            frameClass: 'border-[12px] border-slate-800 rounded-[2rem]',
            notch: false
        },
        desktop: {
            w: 1280, h: 800, label: 'Desktop', icon: Monitor,
            frameClass: 'border-b-[20px] border-x-[12px] border-t-[12px] border-slate-800 rounded-t-xl rounded-b-lg',
            notch: false
        }
    };

    const current = devices[activeDevice];
    // Simple orientation flip for mobile/tablet
    const width = orientation === 'portrait' ? current.w : current.h;
    const height = orientation === 'portrait' ? current.h : current.w;

    return (
        <div className={`fixed inset-0 z-[60] flex flex-col ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'} animate-in fade-in duration-200`}>
            {/* Control Bar */}
            <div className={`h-16 shrink-0 flex items-center justify-between px-6 border-b ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-sm`}>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 pr-6 border-r border-slate-700/10">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                            <MonitorSmartphone size={20} />
                        </div>
                        <div>
                            <h2 className={`font-bold text-lg leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Device Simulator</h2>
                            <p className={`text-[10px] uppercase tracking-wider font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Responsive Check</p>
                        </div>
                    </div>

                    {/* Device Toggles */}
                    <div className={`flex items-center p-1 rounded-lg ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'} border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        {(Object.keys(devices) as Array<keyof typeof devices>).map((dev) => {
                            const Icon = devices[dev].icon;
                            const isActive = activeDevice === dev;
                            return (
                                <button
                                    key={dev}
                                    onClick={() => setActiveDevice(dev)}
                                    className={`flex items-center gap-2 px-4 py-1.5 rounded-md transition-all text-sm font-medium ${isActive
                                        ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-400'
                                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {devices[dev].label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Orientation Toggle */}
                    {activeDevice !== 'desktop' && (
                        <button
                            onClick={() => setOrientation(o => o === 'portrait' ? 'landscape' : 'portrait')}
                            className={`p-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-bold ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white border text-slate-600 hover:bg-slate-50'}`}
                        >
                            <div className="rotate-90"><Smartphone size={16} /></div>
                            {orientation === 'portrait' ? 'Portrait' : 'Landscape'}
                        </button>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
                >
                    <X size={24} />
                </button>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5 relative">

                <div className={`transition-all duration-500 ease-in-out relative flex flex-col items-center gap-4`}>

                    {/* The Device Frame */}
                    <div
                        className={`relative shadow-2xl bg-black overflow-hidden transition-all duration-500 ${current.frameClass}`}
                        style={{
                            width: width + (activeDevice === 'mobile' ? 24 : activeDevice === 'tablet' ? 24 : 24),
                            height: height + (activeDevice === 'mobile' ? 24 : activeDevice === 'tablet' ? 24 : 32)
                        }}
                    >
                        {/* Dynamic Notch (only on mobile portrait) */}
                        {current.notch && orientation === 'portrait' && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-20 pointer-events-none"></div>
                        )}

                        <iframe
                            src={appUrl}
                            title="Device Simulation"
                            className="bg-white transition-all duration-500"
                            style={{
                                width: `${width}px`,
                                height: `${height}px`,
                                border: 'none',
                                userSelect: 'none'
                            }}
                        />
                    </div>

                    {/* Device Dimensions Label */}
                    <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white/90 text-xs font-mono font-bold">
                        {width}px × {height}px
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SimulationMode;
