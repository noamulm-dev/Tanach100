
import React from 'react';
import { Smartphone, Tablet, Monitor, X, MonitorSmartphone, ZoomIn, ZoomOut } from 'lucide-react';

interface Props {
    onClose: () => void;
    isDarkMode: boolean;
}

const SimulationMode: React.FC<Props> = ({ onClose, isDarkMode }) => {
    const appUrl = window.location.origin;
    const [activeDevice, setActiveDevice] = React.useState<'mobile' | 'tablet' | 'desktop'>('mobile');
    const [orientation, setOrientation] = React.useState<'portrait' | 'landscape'>('portrait');
    const [activeMobileModel, setActiveMobileModel] = React.useState<string>('s25ultra');

    // Zoom State
    const [zoom, setZoom] = React.useState<number>(1);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
    const handleFit = () => setZoom(1); // Reset to 100% for now, could calculate fit later

    // Classes
    const sidebarClass = isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';
    const btnClass = (active: boolean) => `p-3 rounded-xl transition-all relative group ${active
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
        : (isDarkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-indigo-50 hover:text-indigo-600')}`;

    return (
        <div className={`fixed inset-0 z-[60] flex flex-row-reverse ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'} animate-in fade-in duration-200`}>

            {/* Narrow Sidebar (Right Side) */}
            <div className={`w-20 shrink-0 flex flex-col items-center py-6 gap-6 border-l ${sidebarClass} shadow-xl z-20`}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className={`p-3 rounded-full transition-colors mb-4 ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    title="Close Simulator"
                >
                    <X size={24} />
                </button>

                <div className={`h-px w-10 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

                {/* Device Type Icons */}
                <div className="flex flex-col gap-4 w-full px-2">

                    {/* Mobile (with Flyout) */}
                    <div className="relative flex justify-center">
                        <button
                            onClick={() => { setActiveDevice('mobile'); setIsMobileMenuOpen(!isMobileMenuOpen); }}
                            className={btnClass(activeDevice === 'mobile')}
                            title="Mobile"
                        >
                            <Smartphone size={28} strokeWidth={activeDevice === 'mobile' ? 2.5 : 2} />
                        </button>

                        {/* Mobile Models Flyout */}
                        {isMobileMenuOpen && (
                            <div className={`absolute right-full top-0 mr-4 w-56 p-2 rounded-xl border shadow-2xl animate-in fade-in slide-in-from-right-4 z-50 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
                                <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Select Model</div>
                                <div className="flex flex-col gap-1">
                                    {Object.entries(mobileModels).map(([key, model]) => (
                                        <button
                                            key={key}
                                            onClick={() => { setActiveMobileModel(key); setActiveDevice('mobile'); setIsMobileMenuOpen(false); }}
                                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-bold text-right transition-colors ${activeMobileModel === key
                                                ? 'bg-indigo-600 text-white'
                                                : (isDarkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50')
                                                }`}
                                        >
                                            {model.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setActiveDevice('tablet')}
                        className={btnClass(activeDevice === 'tablet')}
                        title="Tablet"
                    >
                        <Tablet size={28} strokeWidth={activeDevice === 'tablet' ? 2.5 : 2} />
                    </button>

                    <button
                        onClick={() => setActiveDevice('desktop')}
                        className={btnClass(activeDevice === 'desktop')}
                        title="Desktop"
                    >
                        <Monitor size={28} strokeWidth={activeDevice === 'desktop' ? 2.5 : 2} />
                    </button>
                </div>

                <div className={`h-px w-10 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>

                {/* Orientation Toggle */}
                {activeDevice !== 'desktop' && (
                    <button
                        onClick={() => setOrientation(o => o === 'portrait' ? 'landscape' : 'portrait')}
                        className={btnClass(false)}
                        title="Rotate Orientation"
                    >
                        <div className={`transition-transform duration-300 ${orientation === 'landscape' ? 'rotate-90' : 'rotate-0'}`}>
                            <Smartphone size={24} />
                        </div>
                    </button>
                )}

                <div className="mt-auto flex flex-col gap-2">
                    <button onClick={handleZoomIn} className={btnClass(false)} title="Zoom In">
                        <ZoomIn size={24} />
                    </button>
                    <button onClick={handleFit} className={`text-xs font-black ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {Math.round(zoom * 100)}%
                    </button>
                    <button onClick={handleZoomOut} className={btnClass(false)} title="Zoom Out">
                        <ZoomOut size={24} />
                    </button>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-hidden flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5 relative">

                {/* Scrollable Container with Zoom */}
                <div
                    className="w-full h-full overflow-auto flex items-center justify-center p-20 custom-scrollbar"
                >
                    <div
                        className={`transition-all duration-300 ease-in-out relative flex flex-col items-center gap-4 origin-center`}
                        style={{ transform: `scale(${zoom})` }}
                    >

                        {/* The Device Frame */}
                        <div
                            className={`relative shadow-2xl bg-black overflow-hidden transition-all duration-500 ${current.frameClass}`}
                            style={{
                                width: width + (activeDevice === 'mobile' ? 24 : activeDevice === 'tablet' ? 24 : 24),
                                height: height + (activeDevice === 'mobile' ? 24 : activeDevice === 'tablet' ? 24 : 32),
                            }}
                        >
                            {/* Dynamic Notch */}
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
                                    <div className="w-6 h-6 rounded-full border-2 border-slate-400 opacity-50"></div>
                                    <div className="w-24 h-1 rounded-full bg-slate-900 dark:bg-white opacity-20"></div>
                                    <div className="w-4 h-4 border-l-2 border-b-2 border-slate-400 rotate-45 opacity-50"></div>
                                </div>
                            )}
                        </div>

                        {/* Dimensions Label (Floating below scaled item) */}
                        <div className="absolute -bottom-16 px-4 py-2 rounded-full bg-black/50 backdrop-blur-md text-white/90 text-sm font-mono font-bold whitespace-nowrap">
                            {width}px × {appHeight}px {activeDevice === 'mobile' && <span className="opacity-70 text-xs ml-2">({mobileModels[activeMobileModel].label})</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimulationMode;

