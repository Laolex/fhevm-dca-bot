import React, { useState, useEffect } from 'react';

interface AnimatedStatProps {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    trend?: string;
    trendValue?: string;
    delay?: number;
}

const AnimatedStat: React.FC<AnimatedStatProps> = ({ 
    title, 
    value, 
    icon, 
    color, 
    trend = 'up', 
    trendValue = '+0%', 
    delay = 0 
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(timer);
    }, [delay]);

    useEffect(() => {
        if (isVisible) {
            const targetValue = typeof value === 'number' ? value : parseFloat(value.replace(/[^0-9.]/g, ''));
            const duration = 2000;
            const steps = 60;
            const increment = targetValue / steps;
            let current = 0;

            const interval = setInterval(() => {
                current += increment;
                if (current >= targetValue) {
                    setDisplayValue(targetValue);
                    clearInterval(interval);
                } else {
                    setDisplayValue(current);
                }
            }, duration / steps);

            return () => clearInterval(interval);
        }
    }, [isVisible, value]);

    const formatValue = (val: number) => {
        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
        if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
        return val.toFixed(0);
    };

    return (
        <div 
            className={`transform transition-all duration-1000 ease-out ${
                isVisible 
                    ? 'translate-y-0 opacity-100 scale-100' 
                    : 'translate-y-8 opacity-0 scale-95'
            }`}
        >
            <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl animate-bounce">{icon}</div>
                    <div className={`text-sm px-2 py-1 rounded-full ${
                        trend === 'up' ? 'bg-green-400/20 text-green-100' : 'bg-red-400/20 text-red-100'
                    }`}>
                        {trend === 'up' ? '↗' : '↘'} {trendValue}
                    </div>
                </div>
                <div className="space-y-2">
                    <p className="text-white/80 text-sm font-medium">{title}</p>
                    <p className="text-4xl font-bold tracking-tight">
                        {typeof value === 'string' && value.includes('$') ? '$' : ''}
                        {formatValue(displayValue)}
                        {typeof value === 'string' && value.includes('WETH') ? ' WETH' : ''}
                    </p>
                </div>
                <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
                    <div 
                        className={`h-full bg-white/60 rounded-full transition-all duration-2000 ease-out ${
                            isVisible ? 'w-full' : 'w-0'
                        }`}
                    />
                </div>
            </div>
        </div>
    );
};

export default AnimatedStat;
