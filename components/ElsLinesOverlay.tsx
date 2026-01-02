
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { SearchResult, ReaderStyle } from '../types';
import { ELS_COLORS } from './VerseItem';

interface Props {
    searchResults: SearchResult[];
    containerRef: React.RefObject<HTMLDivElement>;
    readerStyle: ReaderStyle;
}

interface LineData {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string;
    skip: number;
    groupId: number;
}

const ElsLinesOverlay: React.FC<Props> = ({ searchResults, containerRef, readerStyle }) => {
    const [lines, setLines] = useState<LineData[]>([]);
    const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

    const calculateLines = useCallback(() => {
        if (!containerRef.current) return;
        
        const container = containerRef.current;
        const contentArea = container.querySelector('.reader-content-area');
        if (!contentArea) return;

        const containerRect = contentArea.getBoundingClientRect();
        setSvgSize({ width: containerRect.width, height: containerRect.height });
        
        const newLines: LineData[] = [];
        const elsResults = searchResults.filter(r => r.elsComponents && r.elsComponents.length > 1);

        elsResults.forEach(result => {
            const skip = result.elsSkip || 0;

            // Skip drawing lines if skip is 1 or -1 (adjacent letters)
            if (Math.abs(skip) === 1) return;

            const comps = result.elsComponents!;
            const groupId = comps[0].groupId;
            const color = ELS_COLORS[groupId % ELS_COLORS.length];

            const points: { x: number, y: number }[] = [];
            
            comps.forEach(comp => {
                // Selector matches data-letter-idx from VerseItem
                const el = container.querySelector(`.els-char[data-group-id="${groupId}"][data-letter-idx="${comp.letterIdx}"][data-verse-key="${comp.chapter}_${comp.verse}"]`) as HTMLElement;
                
                if (el) {
                    const rect = el.getBoundingClientRect();
                    points.push({
                        x: rect.left - containerRect.left + rect.width / 2,
                        y: rect.top - containerRect.top + rect.height / 2
                    });
                }
            });

            for (let i = 0; i < points.length - 1; i++) {
                newLines.push({
                    x1: points[i].x,
                    y1: points[i].y,
                    x2: points[i + 1].x,
                    y2: points[i + 1].y,
                    color,
                    skip,
                    groupId
                });
            }
        });

        setLines(newLines);
    }, [searchResults, containerRef]);

    useEffect(() => {
        const initialTimer = setTimeout(() => {
            requestAnimationFrame(calculateLines);
        }, 300);

        const contentArea = containerRef.current?.querySelector('.reader-content-area');
        const resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(calculateLines);
        });

        if (contentArea) {
            resizeObserver.observe(contentArea);
        }

        const handleResize = () => requestAnimationFrame(calculateLines);
        window.addEventListener('resize', handleResize);
        
        return () => {
            clearTimeout(initialTimer);
            resizeObserver.disconnect();
            window.removeEventListener('resize', handleResize);
        };
    }, [calculateLines, containerRef, readerStyle]);

    if (lines.length === 0) return null;

    return (
        <svg 
            className="absolute top-0 left-0 pointer-events-none z-0 overflow-visible"
            style={{ 
                width: svgSize.width, 
                height: svgSize.height,
                transition: 'opacity 0.3s'
            }}
        >
            {lines.map((line, idx) => {
                const midX = (line.x1 + line.x2) / 2;
                const midY = (line.y1 + line.y2) / 2;
                const showLabel = Math.abs(line.skip) !== 1;
                
                return (
                    <g key={`els-line-${idx}`} className="animate-in fade-in duration-500">
                        {/* Connecting Line */}
                        <line 
                            x1={line.x1} y1={line.y1} 
                            x2={line.x2} y2={line.y2} 
                            stroke={line.color} 
                            strokeWidth="2.5" 
                            strokeDasharray="4 3"
                            className="opacity-50"
                        />
                        
                        {/* Solid Circle Skip Label */}
                        {showLabel && (
                            <g transform={`translate(${midX}, ${midY})`}>
                                {/* Solid Background Circle */}
                                <circle 
                                    r="10" 
                                    fill="var(--color-bg-paper)" 
                                    stroke={line.color} 
                                    strokeWidth="1.5" 
                                />
                                {/* Skip number text */}
                                <text 
                                    textAnchor="middle" 
                                    dy="0.35em" 
                                    fontSize="10" 
                                    fontWeight="bold" 
                                    fill={line.color}
                                    style={{ fontFamily: 'sans-serif' }}
                                >
                                    {line.skip}
                                </text>
                            </g>
                        )}
                    </g>
                );
            })}
        </svg>
    );
};

export default ElsLinesOverlay;
