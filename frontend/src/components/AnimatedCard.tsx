import React, { useState, useEffect } from 'react';

interface AnimatedCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    immediate?: boolean;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
    children, 
    className = '', 
    delay = 0, 
    direction = 'up',
    immediate = false
}) => {
    const [isVisible, setIsVisible] = useState(immediate);
    const [isHovered, setIsHovered] = useState(false);

    // Animate in after delay (unless immediate is true)
    useEffect(() => {
        if (immediate) {
            setIsVisible(true);
            return;
        }
        
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, delay);
        return () => clearTimeout(timer);
    }, [delay, immediate]);

    const getTransformClass = () => {
        switch (direction) {
            case 'up': return 'translate-y-4';
            case 'down': return '-translate-y-4';
            case 'left': return 'translate-x-4';
            case 'right': return '-translate-x-4';
            default: return 'translate-y-4';
        }
    };

    return (
        <div 
            className={`transform transition-all duration-500 ease-out ${
                isVisible ? 'translate-y-0 opacity-100' : `${getTransformClass()} opacity-0`
            } ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/30">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AnimatedCard;
