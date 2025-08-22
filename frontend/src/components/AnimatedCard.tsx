import React, { useState } from 'react';

interface AnimatedCardProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
    children, 
    className = '', 
    delay = 0, 
    direction = 'up' 
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const getTransformClass = () => {
        switch (direction) {
            case 'up': return 'translate-y-8';
            case 'down': return '-translate-y-8';
            case 'left': return 'translate-x-8';
            case 'right': return '-translate-x-8';
            default: return 'translate-y-8';
        }
    };

    return (
        <div 
            className={`transform transition-all duration-700 ease-out delay-${delay} hover:scale-105 ${
                isHovered ? 'translate-y-0 opacity-100 scale-100' : `${getTransformClass()} opacity-0 scale-95`
            } ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AnimatedCard;
