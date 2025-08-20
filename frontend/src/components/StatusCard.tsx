import React from 'react';

interface StatusCardProps {
    title: string;
    status: 'connected' | 'disconnected' | 'error' | 'loading';
    address?: string;
    network?: string;
    children?: React.ReactNode;
}

export function StatusCard({ title, status, address, network, children }: StatusCardProps) {
    const getStatusColor = () => {
        switch (status) {
            case 'connected': return 'bg-green-100 text-green-800 border-green-200';
            case 'disconnected': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'error': return 'bg-red-100 text-red-800 border-red-200';
            case 'loading': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'connected': return '✅';
            case 'disconnected': return '❌';
            case 'error': return '⚠️';
            case 'loading': return '⏳';
            default: return '❓';
        }
    };

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}>
                    {getStatusIcon()} {status}
                </span>
            </div>
            
            {address && (
                <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Address:</p>
                    <p className="font-mono text-sm bg-gray-100 p-2 rounded-lg break-all">
                        {address}
                    </p>
                </div>
            )}
            
            {network && (
                <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Network:</p>
                    <p className="font-medium text-gray-900">{network}</p>
                </div>
            )}
            
            {children}
        </div>
    );
}
