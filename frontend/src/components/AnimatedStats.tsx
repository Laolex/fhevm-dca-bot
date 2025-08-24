import React, { useState, useEffect } from 'react';

interface AnimatedStatsProps {
    title: string;
    value: number;
    icon: string;
    color: string;
    trend?: 'up' | 'down';
    trendValue?: string;
    delay?: number;
}

const AnimatedStats: React.FC<AnimatedStatsProps> = ({
    title,
    value,
    icon,
    color,
    trend,
    trendValue,
    delay = 0
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (isVisible) {
            const duration = 1000;
            const steps = 60;
            const increment = value / steps;
            let current = 0;
            
            const interval = setInterval(() => {
                current += increment;
                if (current >= value) {
                    setDisplayValue(value);
                    clearInterval(interval);
                } else {
                    setDisplayValue(Math.floor(current));
                }
            }, duration / steps);

            return () => clearInterval(interval);
        }
    }, [isVisible, value]);

    return (
        <div 
            className={`transform transition-all duration-500 ease-out ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
        >
            <div className="rounded-2xl border dark:border-neutral-800 p-4 flex flex-col bg-white/60 dark:bg-white/5">
                <span className="text-xs opacity-60">{title}</span>
                <span className="text-xl font-semibold">{displayValue.toLocaleString()}</span>
                {trend && trendValue && (
                    <div className={`text-xs ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {trend === 'up' ? '↗' : '↘'} {trendValue}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnimatedStats;
