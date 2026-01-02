
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
    const [activeMobileModel, setActiveMobileModel] = React.useState<string>('s25ultra');

    const mobileModels: Record<string, { w: number, h: number, label: string }> = {
        s25ultra: { w: 412, h: 920, label: 'Samsung S25 Ultra' }, // Futuristic high-end
        iphone15pro: { w: 430, h: 932, label: 'iPhone 15 Pro Max' },
        pixel8pro: { w: 412, h: 915, label: 'Pixel 8 Pro' },
        iphonese: { w: 375, h: 667, label: 'iPhone SE' }
    };

    const devices = {
        mobile: {
            // Mobile dimensions depend on selected model
            w: mobileModels[activeMobileModel].w,
            h: mobileModels[activeMobileModel].h,
            label: 'Mobile', icon: Smartphone,
            frameClass: 'border-[12px] border-slate-800 rounded-[3rem]',
            notch: true,
            hasModels: true
        },
        tablet: {
            w: 768, h: 1024, label: 'Tablet', icon: Tablet,
            frameClass: 'border-[12px] border-slate-800 rounded-[2rem]',
            notch: false,
            hasModels: false
        },
        desktop: {
            w: 1280, h: 800, label: 'Desktop', icon: Monitor,
            frameClass: 'border-b-[20px] border-x-[12px] border-t-[12px] border-slate-800 rounded-t-xl rounded-b-lg',
            notch: false,
            hasModels: false
        }
    };

    const current = devices[activeDevice];
    // Simple orientation flip
    const width = orientation === 'portrait' ? current.w : current.h;
    const height = orientation === 'portrait' ? current.h : current.w;

    // Browser Interface Dimensions (approximate for realism)
    const browserTopBarHeight = (activeDevice === 'mobile' && orientation === 'portrait') ? 60 : 0; // Address Bar
    const browserBottomBarHeight = (activeDevice === 'mobile' && orientation === 'portrait') ? 48 : 0; // Nav Bar / Tab Bar

    // Effective App Viewport
    const appHeight = height - browserTopBarHeight - browserBottomBarHeight;

    return (
        <div className={`fixed inset-0 z-[60] flex flex-row-reverse ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'} animate-in fade-in duration-200`}>

            {/* Sidebar Control Panel (Right Side) */}
            <div className={`w-72 shrink-0 flex flex-col border-l ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} shadow-xl z-10 overflow-y-auto`}>

                {/* Header Area */}
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-6">
                        <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/20">
                            <MonitorSmartphone size={24} />
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <h2 className={`font-bold text-xl leading-tight mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Device Simulator</h2>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Responsive & UI Check</p>
                </div>

                <div className={`h-px mx-6 mb-6 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}></div>

                {/* Controls Container */}
                <div className="px-6 flex flex-col gap-6 flex-1">

                    {/* Device Types */}
                    <div className="space-y-3">
                        <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Device Type</label>
                        <div className="flex flex-col gap-2">
                            {(Object.keys(devices) as Array<keyof typeof devices>).map((dev) => {
                                const Icon = devices[dev].icon;
                                const isActive = activeDevice === dev;
                                return (
                                    <button
                                        key={dev}
                                        onClick={() => setActiveDevice(dev)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold ${isActive
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20 translate-x-[-4px]'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        <Icon size={18} />
                                        {devices[dev].label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Specific Mobile Models */}
                    {activeDevice === 'mobile' && (
                        <div className="space-y-3 animate-in slide-in-from-right-4 duration-300">
                            <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Model</label>
                            <div className="flex flex-col gap-2">
                                {Object.entries(mobileModels).map(([key, model]) => (
                                    <button
                                        key={key}
                                        onClick={() => setActiveMobileModel(key)}
                                        className={`flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-xs font-medium border ${activeMobileModel === key
                                            ? 'border-indigo-500 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400'
                                            : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {model.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Orientation */}
                    {activeDevice !== 'desktop' && (
                        <div className="space-y-3">
                            <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Orientation</label>
                            <button
                                onClick={() => setOrientation(o => o === 'portrait' ? 'landscape' : 'portrait')}
                                className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border transition-all font-bold text-sm ${isDarkMode
                                    ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                <div className={`transition-transform duration-300 ${orientation === 'landscape' ? 'rotate-90' : 'rotate-0'}`}>
                                    <Smartphone size={18} />
                                </div>
                                {orientation === 'portrait' ? 'Portrait' : 'Landscape'}
                            </button>
                        </div>
                    )}

                    {/* Active Viewport Info (Moved from under simulator) */}
                    <div className={`mt-auto mb-6 p-4 rounded-xl ${isDarkMode ? 'bg-slate-950/50' : 'bg-slate-100'} border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                        <div className="flex flex-col gap-1 text-center">
                            <span className={`text-[10px] uppercase font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Current Viewport</span>
                            <span className={`text-xl font-mono font-black ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{width} × {appHeight}</span>
                            <span className={`text-[10px] ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>
                                {activeDevice === 'mobile' && orientation === 'portrait' ? '(Reduced by Browser UI)' : '(Full Screen)'}
                            </span>
                        </div>
                    </div>

                </div>
            </div>

            {/* Canvas Area (Fills remaining space) */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5 relative custom-scrollbar">

                <div className={`transition-all duration-500 ease-in-out relative flex flex-col items-center gap-4`}>

                    {/* The Device Frame */}
                    <div
                        className={`relative shadow-2xl bg-black overflow-hidden transition-all duration-500 ${current.frameClass}`}
                        style={{
                            width: width + (activeDevice === 'mobile' ? 24 : activeDevice === 'tablet' ? 24 : 24),
                            height: height + (activeDevice === 'mobile' ? 24 : activeDevice === 'tablet' ? 24 : 32),
                            // Allow shrinking on very small screens if necessary
                            maxWidth: '100%',
                            maxHeight: '100%'
                        }}
                    >
                        {/* Dynamic Notch (only on mobile portrait) */}
                        {current.notch && orientation === 'portrait' && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-xl z-20 pointer-events-none"></div>
                        )}

                        {/* Browser Address Bar Simulation */}
                        {browserTopBarHeight > 0 && (
                            <div className="w-full bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 flex items-center gap-3" style={{ height: browserTopBarHeight }}>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                                    <div className="w-2 h-2 rounded-full bg-slate-400 opacity-50"></div>
                                </div>
                                <div className="flex-1 bg-white dark:bg-slate-900 h-8 rounded-lg flex items-center justify-center shadow-sm">
                                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                                        🔒 {appUrl.replace(/https?:\/\//, '')}
                                    </span>
                                </div>
                            </div>
                        )}

                        <iframe
                            src={appUrl}
                            title="Device Simulation"
                            className="bg-white transition-all duration-500"
                            style={{
                                width: `${width}px`,
                                height: `${appHeight}px`,
                                border: 'none',
                                userSelect: 'none'
                            }}
                        />

                        {/* Browser Bottom Bar Simulation */}
                        {browserBottomBarHeight > 0 && (
                            <div className="w-full bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-around px-4" style={{ height: browserBottomBarHeight }}>
                                <div className="w-6 h-6 rounded-full border-2 border-slate-400 opacity-50"></div> {/* Homeish */}
                                <div className="w-24 h-1 rounded-full bg-slate-900 dark:bg-white opacity-20"></div> {/* Swipe Indicator */}
                                <div className="w-4 h-4 border-l-2 border-b-2 border-slate-400 rotate-45 opacity-50"></div> {/* Backish */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimulationMode;

