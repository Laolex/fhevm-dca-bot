import React, { useState } from 'react';

interface ConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: () => void;
    onSwitchNetwork?: () => void;
    account: string;
    network: string;
    isConnecting?: boolean;
    installed?: boolean;
}

export function ConnectModal({
    isOpen,
    onClose,
    onConnect,
    onSwitchNetwork,
    account,
    network,
    isConnecting = false,
    installed = false
}: ConnectModalProps) {
    const [error, setError] = useState<string>('');

    if (!isOpen) return null;

    const handleConnect = async () => {
        setError('');
        try {
            await onConnect();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to connect wallet');
        }
    };

    const handleSwitchNetwork = async () => {
        setError('');
        try {
            if (onSwitchNetwork) {
                await onSwitchNetwork();
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to switch network');
        }
    };

    const isCorrectNetwork = network === 'Sepolia' || network === '0xaa36a7';

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-50 w-[92vw] max-w-xl rounded-2xl bg-white dark:bg-neutral-900 p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Select a wallet</h3>
                    <button className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/5" onClick={onClose}>✕</button>
                </div>
                
                <div className="space-y-3">
                    {network && !isCorrectNetwork && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-yellow-600">⚠️</span>
                                <span className="text-yellow-800 text-sm font-medium">
                                    Wrong Network Detected
                                </span>
                            </div>
                            <p className="text-yellow-800 text-sm mb-3">
                                Please switch to Sepolia testnet for this application.
                            </p>
                            <button
                                onClick={handleSwitchNetwork}
                                disabled={isConnecting}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                            >
                                {isConnecting ? '⏳ Switching...' : '🔄 Switch to Sepolia'}
                            </button>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-2">
                                <span className="text-red-600">❌</span>
                                <span className="text-red-800 text-sm">{error}</span>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={handleConnect} 
                        className="w-full flex items-center justify-between rounded-2xl border dark:border-neutral-800 p-3 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-600" />
                            <div className="text-left">
                                <div className="font-medium">MetaMask</div>
                                <div className="text-xs opacity-70">{installed ? "Detected" : "Not installed"}</div>
                            </div>
                        </div>
                        {isConnecting ? (
                            <span className="text-xs">
                                Connecting… 
                                <span className="inline-block h-3 w-3 rounded-full border-2 border-transparent border-l-neutral-800 animate-spin ml-1"/>
                            </span>
                        ) : (
                            <span className="text-sm">{installed ? "Connect" : "Install"}</span>
                        )}
                    </button>
                    
                    {!installed && (
                        <a 
                            className="block text-center text-sm underline opacity-80 hover:opacity-100" 
                            href="https://metamask.io/download/" 
                            target="_blank" 
                            rel="noreferrer"
                        >
                            Get MetaMask
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
