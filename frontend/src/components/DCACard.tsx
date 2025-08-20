import React from 'react';

interface DCACardProps {
    registry: string;
    setRegistry: (value: string) => void;
    budget: string;
    setBudget: (value: string) => void;
    per: string;
    setPer: (value: string) => void;
    interval: string;
    setInterval: (value: string) => void;
    periods: string;
    setPeriods: (value: string) => void;
    onSubmit: () => void;
    canSubmit: boolean;
    loading: boolean;
    txHash: string;
}

export function DCACard({
    registry,
    setRegistry,
    budget,
    setBudget,
    per,
    setPer,
    interval,
    setInterval,
    periods,
    setPeriods,
    onSubmit,
    canSubmit,
    loading,
    txHash
}: DCACardProps) {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-lg">📊</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Submit DCA Intent</h2>
            </div>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Registry Address
                    </label>
                    <input 
                        value={registry} 
                        onChange={e => setRegistry(e.target.value)} 
                        placeholder="0x..." 
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Total Budget (USDC)
                        </label>
                        <input 
                            value={budget} 
                            onChange={e => setBudget(e.target.value)} 
                            placeholder="1000"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Amount Per Interval (USDC)
                        </label>
                        <input 
                            value={per} 
                            onChange={e => setPer(e.target.value)} 
                            placeholder="100"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Interval (seconds)
                        </label>
                        <input 
                            value={interval} 
                            onChange={e => setInterval(e.target.value)} 
                            placeholder="86400"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">86400 = Daily, 3600 = Hourly</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Total Periods
                        </label>
                        <input 
                            value={periods} 
                            onChange={e => setPeriods(e.target.value)} 
                            placeholder="10"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        />
                    </div>
                </div>
                
                <button 
                    disabled={!canSubmit} 
                    onClick={onSubmit}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                        canSubmit 
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                >
                    {loading ? '⏳ Encrypting & Submitting...' : '🔐 Encrypt & Submit Intent'}
                </button>
                
                {txHash && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 text-lg">✅</span>
                            </div>
                            <div>
                                <p className="text-green-800 font-medium">Transaction submitted successfully!</p>
                                <a 
                                    href={`https://sepolia.etherscan.io/tx/${txHash}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm"
                                >
                                    View on Etherscan →
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
