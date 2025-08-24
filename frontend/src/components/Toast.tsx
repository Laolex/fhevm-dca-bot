import React, { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    duration?: number;
    onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 5000, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // Wait for exit animation
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getToastStyles = () => {
        const baseStyles = "fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-lg shadow-lg transform transition-all duration-300";

        switch (type) {
            case 'success':
                return `${baseStyles} bg-emerald-500 text-white border border-emerald-400`;
            case 'error':
                return `${baseStyles} bg-red-500 text-white border border-red-400`;
            case 'warning':
                return `${baseStyles} bg-yellow-500 text-white border border-yellow-400`;
            case 'info':
                return `${baseStyles} bg-blue-500 text-white border border-blue-400`;
            default:
                return `${baseStyles} bg-gray-500 text-white border border-gray-400`;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✅';
            case 'error':
                return '❌';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '💬';
        }
    };

    return (
        <div
            className={`${getToastStyles()} ${isVisible
                    ? 'translate-x-0 opacity-100'
                    : 'translate-x-full opacity-0'
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <span className="text-lg">{getIcon()}</span>
                    <p className="text-sm font-medium">{message}</p>
                </div>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className="text-white/80 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default Toast;
