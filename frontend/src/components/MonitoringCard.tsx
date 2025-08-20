import React from 'react';

interface MonitoringCardProps {
    executorAddr: string;
    setExecutorAddr: (value: string) => void;
    rewardVaultAddr: string;
    setRewardVaultAddr: (value: string) => void;
    batchEvents: Array<{ name: string; batchId: string; data?: any; timestamp: number }>;
    encBalance: string;
    onLoadBatchStatus: () => void;
    onLoadBalance: () => void;
}

export function MonitoringCard({
    executorAddr,
    setExecutorAddr,
    rewardVaultAddr,
    setRewardVaultAddr,
    batchEvents,
    encBalance,
    onLoadBatchStatus,
    onLoadBalance
}: MonitoringCardProps) {
    const formatDate = (timestamp: number) => new Date(timestamp * 1000).toLocaleString();

    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-lg">📈</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Monitor & Track</h2>
            </div>
            
            <div className="space-y-8">
                {/* Batch Status Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch Status</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                BatchExecutor Address
                            </label>
                            <input 
                                value={executorAddr} 
                                onChange={e => setExecutorAddr(e.target.value)} 
                                placeholder="0x..." 
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                        
                        <button 
                            onClick={onLoadBatchStatus}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            🔄 Load Recent Batch Events
                        </button>
                        
                        <div className="max-h-64 overflow-y-auto space-y-3">
                            {batchEvents.length > 0 ? (
                                batchEvents.map((e, i) => (
                                    <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <span className="font-semibold text-gray-900">{e.name}</span>
                                                <span className="text-gray-600 ml-2">#{e.batchId}</span>
                                            </div>
                                            <span className="text-xs text-gray-500">{formatDate(e.timestamp)}</span>
                                        </div>
                                        {e.data && (
                                            <p className="text-sm text-gray-600 mt-2">
                                                {Object.entries(e.data).map(([key, value]) => `${key}: ${value}`).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-gray-400 text-4xl mb-3">📊</div>
                                    <p className="text-gray-500">No batch events found</p>
                                    <p className="text-gray-400 text-sm mt-1">Click "Load Recent Batch Events" to fetch data</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Balance Section */}
                <div className="border-t border-gray-200 pt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Encrypted Balance</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                RewardVault Address
                            </label>
                            <input 
                                value={rewardVaultAddr} 
                                onChange={e => setRewardVaultAddr(e.target.value)} 
                                placeholder="0x..." 
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                        
                        <button 
                            onClick={onLoadBalance}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            🔍 Load Encrypted Balance
                        </button>
                        
                        {encBalance && (
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Encrypted WETH Balance:</p>
                                <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all bg-white p-3 rounded-lg border border-gray-200 overflow-x-auto">
                                    {encBalance}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
