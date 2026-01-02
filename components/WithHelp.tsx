
import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface Props {
    labelKey: string;
    children: React.ReactNode;
    className?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

const WithHelp: React.FC<Props> = ({ labelKey, children, className = '', position = 'bottom' }) => {
    const { t, showHelpLabels } = useLanguage();
    const [isHovered, setIsHovered] = useState(false);

    // FIX: We removed the conditional return here.
    // Previously, if (!showHelpLabels) returned only children, stripping the wrapper <div>.
    // This caused layout shifts because 'className' (containing width/position) was lost.
    
    const posClasses = {
        top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
        bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
        left: 'right-full mr-2 top-1/2 -translate-y-1/2',
        right: 'left-full ml-2 top-1/2 -translate-y-1/2'
    };

    return (
        <div 
            className={`relative inline-flex items-center justify-center ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
            {/* Conditional rendering is now applied ONLY to the tooltip element */}
            {showHelpLabels && isHovered && (
                <div className={`absolute z-[100] px-2 py-1 text-[10px] font-bold text-white bg-indigo-600 rounded shadow-lg whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-200 ${posClasses[position]}`}>
                    {t(labelKey)}
                    <div className={`absolute w-2 h-2 bg-indigo-600 rotate-45 ${
                        position === 'top' ? '-bottom-1 left-1/2 -translate-x-1/2' :
                        position === 'bottom' ? '-top-1 left-1/2 -translate-x-1/2' :
                        position === 'left' ? '-right-1 top-1/2 -translate-y-1/2' :
                        '-left-1 top-1/2 -translate-y-1/2'
                    }`}></div>
                </div>
            )}
        </div>
    );
};

export default WithHelp;
