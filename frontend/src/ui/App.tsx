import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { BrowserProvider, Contract, Eip1193Provider, JsonRpcSigner, isAddress } from 'ethers';
import { createInstance } from 'fhevmjs';

// Sepolia contract addresses
const SEPOLIA_ADDRESSES = {
    registry: '0x220f3B089026EE38Ee45540f1862d5bcA441B877',
    batchExecutor: '0x7dc70ce7f2a6Ad3895Ce84c7cd0CeC3Eec4b8C70',
    tokenVault: '0x8D91b58336bc43222D55bC2C5aB3DEF468A54050',
    rewardVault: '0x98Eec4C5bA3DF65be22106E0E5E872454e8834db',
    dexAdapter: '0xAF65e8895ba60db17486E69B052EA39D52717d2f',
    automationForwarder: '0x118b16Ad4205a97bC6F9e116D12fbA286A3eD29B'
};

const dcaAbi = [
    'function submitIntent(externalEuint64 budgetExt, bytes calldata budgetProof, externalEuint64 amountPerIntervalExt, bytes calldata amountPerIntervalProof, externalEuint32 intervalSecondsExt, bytes calldata intervalSecondsProof, externalEuint32 totalIntervalsExt, bytes calldata totalIntervalsProof) external',
    'function getMyParams() view returns (bytes budget, bytes per, bytes interval, bytes periods, bytes spent, bool active)'
];

export function App() {
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
    const [account, setAccount] = useState<string>('');
    const [registry, setRegistry] = useState<string>(SEPOLIA_ADDRESSES.registry);
    const [budget, setBudget] = useState<string>('1000'); // $1000 in USDC
    const [per, setPer] = useState<string>('100'); // $100 per interval
    const [interval, setInterval] = useState<string>('86400'); // Daily
    const [periods, setPeriods] = useState<string>('10'); // 10 periods
    const [executorAddr, setExecutorAddr] = useState<string>(SEPOLIA_ADDRESSES.batchExecutor);
    const [rewardVaultAddr, setRewardVaultAddr] = useState<string>(SEPOLIA_ADDRESSES.rewardVault);
    const [batchEvents, setBatchEvents] = useState<Array<{ name: string; batchId: string; data?: any; timestamp: number }>>([]);
    const [encBalance, setEncBalance] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [txHash, setTxHash] = useState<string>('');
    const [network, setNetwork] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'submit' | 'status' | 'balance'>('submit');

    // Auto-connect on load
    useEffect(() => {
        connect();
    }, []);

    const connect = useCallback(async () => {
        try {
            const anyWindow = window as any;
            const injected: Eip1193Provider | undefined = anyWindow.ethereum;
            if (!injected) {
                alert('Please install MetaMask to use this application');
                return;
            }
            
            await injected.request?.({ method: 'eth_requestAccounts' });
            const prov = new BrowserProvider(injected);
            setProvider(prov);
            const s = await prov.getSigner();
            setSigner(s);
            setAccount(await s.getAddress());
            
            // Check network
            const network = await prov.getNetwork();
            setNetwork(network.name);
            
            if (network.chainId !== 11155111n) { // Sepolia
                alert('Please switch to Sepolia testnet for this application');
            }
        } catch (error) {
            console.error('Connection error:', error);
            alert('Failed to connect wallet');
        }
    }, []);

    const canSubmit = useMemo(() => 
        signer && isAddress(registry) && budget && per && interval && periods && !loading, 
        [signer, registry, budget, per, interval, periods, loading]
    );

    const submit = useCallback(async () => {
        if (!signer || !provider || !isAddress(registry)) return;
        
        setLoading(true);
        setTxHash('');
        
        try {
            const userAddr = await signer.getAddress();
            const relayer = await createInstance((provider as any).provider);
            
            // Convert to proper units (USDC has 6 decimals)
            const budgetWei = BigInt(budget) * 1000000n; // Convert to USDC wei
            const perWei = BigInt(per) * 1000000n; // Convert to USDC wei
            
            const ci = await relayer
                .createEncryptedInput(registry, userAddr)
                .add64(budgetWei)
                .add64(perWei)
                .add32(Number(interval))
                .add32(Number(periods))
                .encrypt();
            
            const contract = new Contract(registry, dcaAbi, signer);
            const tx = await contract.submitIntent(
                ci.handles[0], ci.inputProof,
                ci.handles[1], ci.inputProof,
                ci.handles[2], ci.inputProof,
                ci.handles[3], ci.inputProof
            );
            
            setTxHash(tx.hash);
            await tx.wait();
            alert('✅ DCA Intent submitted successfully!');
            
            // Clear form
            setBudget('1000');
            setPer('100');
            setInterval('86400');
            setPeriods('10');
            
        } catch (error) {
            console.error('Submission error:', error);
            alert('❌ Failed to submit intent: ' + (error as Error).message);
        } finally {
            setLoading(false);
        }
    }, [signer, provider, registry, budget, per, interval, periods]);

    const loadBatchStatus = useCallback(async () => {
        if (!provider || !isAddress(executorAddr)) return;
        
        try {
            const fromBlock = (await provider.getBlockNumber()) - 2000;
            const iface = new (require('ethers').Interface)([
                'event BatchPrepared(uint256 indexed batchId, uint256 userCount)',
                'event BatchDecryptionFulfilled(uint256 indexed batchId, uint64 decryptedTotal)',
                'event BatchFinalized(uint256 indexed batchId, uint256 amountOut)'
            ]);
            
            const logs = await provider.getLogs({ address: executorAddr, fromBlock });
            const parsed: Array<{ name: string; batchId: string; data?: any; timestamp: number }> = [];
            
            for (const log of logs) {
                try {
                    const p = iface.parseLog(log as any);
                    const block = await provider.getBlock(log.blockNumber);
                    
                    if (p?.name === 'BatchPrepared') {
                        parsed.push({ 
                            name: 'BatchPrepared', 
                            batchId: (p.args[0] as bigint).toString(), 
                            data: { userCount: (p.args[1] as bigint).toString() },
                            timestamp: block?.timestamp || 0
                        });
                    } else if (p?.name === 'BatchDecryptionFulfilled') {
                        parsed.push({ 
                            name: 'BatchDecryptionFulfilled', 
                            batchId: (p.args[0] as bigint).toString(), 
                            data: { total: (p.args[1] as bigint).toString() },
                            timestamp: block?.timestamp || 0
                        });
                    } else if (p?.name === 'BatchFinalized') {
                        parsed.push({ 
                            name: 'BatchFinalized', 
                            batchId: (p.args[0] as bigint).toString(), 
                            data: { amountOut: (p.args[1] as bigint).toString() },
                            timestamp: block?.timestamp || 0
                        });
                    }
                } catch (_) {
                    // ignore parsing errors
                }
            }
            
            // Sort by timestamp (newest first)
            parsed.sort((a, b) => b.timestamp - a.timestamp);
            setBatchEvents(parsed);
        } catch (error) {
            console.error('Failed to load batch events:', error);
            alert('Failed to load batch events');
        }
    }, [provider, executorAddr]);

    const loadMyEncBalance = useCallback(async () => {
        if (!signer || !isAddress(rewardVaultAddr)) return;
        
        try {
            const rv = new Contract(rewardVaultAddr, ['function getMyEncryptedBalance() view returns (bytes)'], signer);
            const h = await rv.getMyEncryptedBalance();
            setEncBalance(String(h));
        } catch (error) {
            console.error('Failed to load balance:', error);
            alert('Failed to load encrypted balance');
        }
    }, [signer, rewardVaultAddr]);

    const formatAddress = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;
    const formatDate = (timestamp: number) => new Date(timestamp * 1000).toLocaleString();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="max-w-6xl mx-auto p-4">
                {/* Header */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                🔐 FHEVM DCA Bot
                            </h1>
                            <p className="text-gray-600 mt-2 text-lg">
                                Privacy-Preserving Dollar-Cost Averaging on FHEVM
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <button 
                                onClick={connect}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                {account ? `Connected: ${formatAddress(account)}` : 'Connect Wallet'}
                            </button>
                            {network && (
                                <div className="flex items-center gap-2 text-sm">
                                    <div className={`w-2 h-2 rounded-full ${network === 'sepolia' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className="text-gray-600">Network: {network}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-2 mb-8 border border-white/20">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setActiveTab('submit')}
                            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                                activeTab === 'submit'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            📊 Submit DCA Intent
                        </button>
                        <button
                            onClick={() => setActiveTab('status')}
                            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                                activeTab === 'status'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            📈 Batch Status
                        </button>
                        <button
                            onClick={() => setActiveTab('balance')}
                            className={`flex-1 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
                                activeTab === 'balance'
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            💰 My Balance
                        </button>
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'submit' && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Submit DCA Intent</h2>
                        
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
                                onClick={submit}
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
                )}

                {activeTab === 'status' && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">📈 Batch Status</h2>
                        
                        <div className="space-y-6">
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
                                onClick={loadBatchStatus}
                                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                🔄 Load Recent Batch Events
                            </button>
                            
                            <div className="max-h-96 overflow-y-auto space-y-3">
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
                                    <div className="text-center py-12">
                                        <div className="text-gray-400 text-6xl mb-4">📊</div>
                                        <p className="text-gray-500">No batch events found</p>
                                        <p className="text-gray-400 text-sm mt-2">Click "Load Recent Batch Events" to fetch data</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'balance' && (
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">💰 My Encrypted Balance</h2>
                        
                        <div className="space-y-6">
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
                                onClick={loadMyEncBalance}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                🔍 Load Encrypted Balance
                            </button>
                            
                            {encBalance && (
                                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Encrypted WETH Balance:</p>
                                    <pre className="text-xs text-gray-600 whitespace-pre-wrap break-all bg-white p-4 rounded-lg border border-gray-200 overflow-x-auto">
                                        {encBalance}
                                    </pre>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Info Section */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mt-8 border border-blue-200/50">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">ℹ️ How It Works</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-blue-600 text-xl">🔐</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Privacy First</h4>
                            <p className="text-gray-600 text-sm">Your DCA parameters are encrypted and never revealed on-chain. Only aggregated batch totals are decrypted.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-green-600 text-xl">⚡</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Automated</h4>
                            <p className="text-gray-600 text-sm">Batches are executed automatically via Chainlink Keepers. No manual intervention required.</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="text-purple-600 text-xl">🌐</span>
                            </div>
                            <h4 className="font-semibold text-gray-900 mb-2">Decentralized</h4>
                            <p className="text-gray-600 text-sm">Built on FHEVM with Uniswap V3 integration. Fully decentralized and trustless.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


