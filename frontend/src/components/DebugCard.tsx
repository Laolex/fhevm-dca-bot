import React from 'react';

interface DebugCardProps {
    children: React.ReactNode;
    className?: string;
}

const DebugCard: React.FC<DebugCardProps> = ({ children, className = '' }) => {
    return (
        <div className={`bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/30 ${className}`}>
            {children}
        </div>
    );
};

export default DebugCard;
