import React from 'react';

interface ConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: () => void;
    account: string;
    network: string;
}

export function ConnectModal({ isOpen, onClose, onConnect, account, network }: ConnectModalProps) {
    if (!isOpen) return null;

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-blue-600 text-2xl">🔐</span>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {account ? 'Wallet Connected' : 'Connect Wallet'}
                    </h2>

                    <p className="text-gray-600 mb-6">
                        {account
                            ? 'Your wallet is connected and ready to use the DCA Bot.'
                            : 'Connect your wallet to start using the privacy-preserving DCA Bot.'
                        }
                    </p>

                    {account && (
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700">Address:</span>
                                <span className="font-mono text-sm text-gray-900">{formatAddress(account)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Network:</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${network === 'sepolia' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-sm text-gray-900">{network}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {network && network !== 'sepolia' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-2">
                                <span className="text-yellow-600">⚠️</span>
                                <span className="text-yellow-800 text-sm">
                                    Please switch to Sepolia testnet for this application.
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3">
                        {!account ? (
                            <button
                                onClick={onConnect}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Connect Wallet
                            </button>
                        ) : (
                            <button
                                onClick={onClose}
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                Continue
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            {account ? 'Close' : 'Cancel'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
