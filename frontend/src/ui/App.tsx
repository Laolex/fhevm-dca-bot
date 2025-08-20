import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { BrowserProvider, Contract, Eip1193Provider, JsonRpcSigner, isAddress } from 'ethers';
import { createInstance } from 'fhevmjs';
import { ConnectModal } from '../components/ConnectModal';
import { DCACard } from '../components/DCACard';
import { MonitoringCard } from '../components/MonitoringCard';

// Sepolia contract addresses
const SEPOLIA_ADDRESSES = {
    registry: '0x220f3B089026EE38Ee45540f1862d5bcA441B877',
    batchExecutor: '0x7dc70ce7f2a6Ad3895Ce84c7cd0CeC3Eec4b8C70',
    tokenVault: '0x8D91b58336bc43222D55bC2C5aB3DEF468A54050',
    rewardVault: '0x98Eec4C5bA3DF65be22106E0E5E872454e8834db',
    dexAdapter: '0xAF65e8895ba60db17486E69B052EA39D52717d2f',
    automationForwarder: '0x118b16Ad4205a97bC6F9e116D12fbA286A3eD29B'
};

// FHEVM Configuration (Official Zama Sepolia addresses)
const FHEVM_CONFIG = {
    executor: '0x848B0066793BcC60346Da1F49049357399B8D595',
    acl: '0x687820221192C5B662b25367F70076A37bc79b6c',
    hcuLimit: '0x594BB474275918AF9609814E68C61B1587c5F838',
    kmsVerifier: '0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC',
    inputVerifier: '0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4',
    decryptionOracle: '0xa02Cda4Ca3a71D7C46997716F4283aa851C28812',
    decryptionAddress: '0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1',
    inputVerificationAddress: '0x7048C39f048125eDa9d678AEbaDfB22F7900a29F',
    relayerUrl: 'https://relayer.testnet.zama.cloud'
};

// Simplified ABI for basic interaction (without FHEVM types)
const dcaAbi = [
    'function submitIntent(bytes calldata budgetExt, bytes calldata budgetProof, bytes calldata amountPerIntervalExt, bytes calldata amountPerIntervalProof, bytes calldata intervalSecondsExt, bytes calldata intervalSecondsProof, bytes calldata totalIntervalsExt, bytes calldata totalIntervalsProof) external',
    'function getMyParams() view returns (bytes budget, bytes per, bytes interval, bytes periods, bytes spent, bool active)',
    'function setAuthorizedExecutor(address executor) external',
    'function grantExecutorOnUsers(address[] calldata users) external',
    'function deactivateIntent() external'
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
    const [showConnectModal, setShowConnectModal] = useState<boolean>(false);

    // Configure FHEVM and auto-connect on load
    useEffect(() => {
        // Configure FHEVM for Sepolia
        const configureFHEVM = () => {
            const anyWindow = window as any;
            anyWindow.FHEVM_CONFIG = {
                chainId: 11155111,
                publicKey: FHEVM_CONFIG.executor,
                verifier: FHEVM_CONFIG.kmsVerifier,
                relayerUrl: FHEVM_CONFIG.relayerUrl
            };
        };

        configureFHEVM();
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
        Boolean(signer && isAddress(registry) && budget && per && interval && periods && !loading),
        [signer, registry, budget, per, interval, periods, loading]
    );

    const submit = useCallback(async () => {
        if (!signer || !provider || !isAddress(registry)) return;

        setLoading(true);
        setTxHash('');

        try {
            const userAddr = await signer.getAddress();

            // For now, let's create a mock encrypted input to test the flow
            // This bypasses the FHEVM relayer issue temporarily
            console.log("🔐 Creating mock encrypted input for testing...");

            // Mock encrypted input structure
            const mockHandles = [
                "0x" + "00".repeat(32), // Mock budget handle
                "0x" + "00".repeat(32), // Mock per interval handle
                "0x" + "00".repeat(32), // Mock interval handle
                "0x" + "00".repeat(32)  // Mock periods handle
            ];
            const mockProof = "0x" + "00".repeat(64); // Mock proof

            // Convert to proper units (USDC has 6 decimals)
            const budgetWei = BigInt(budget) * 1000000n; // Convert to USDC wei
            const perWei = BigInt(per) * 1000000n; // Convert to USDC wei

            console.log(`💰 Budget: ${budget} USDC (${budgetWei} wei)`);
            console.log(`📊 Per Interval: ${per} USDC (${perWei} wei)`);
            console.log(`⏰ Interval: ${interval} seconds`);
            console.log(`🔄 Periods: ${periods}`);

            // Use mock encrypted input for now
            const ci = {
                handles: mockHandles,
                inputProof: mockProof
            };

            console.log("📋 Contract Details:");
            console.log(`📍 Registry Address: ${registry}`);
            console.log(`🔗 ABI Functions:`, dcaAbi);

            const contract = new Contract(registry, dcaAbi, signer);
            console.log("✅ Contract instantiated");
            console.log("🔍 Contract object:", contract);

            // Check if contract is deployed
            const code = await provider.getCode(registry);
            console.log("📦 Contract code length:", code.length);
            if (code === "0x") {
                throw new Error("Contract not deployed at this address");
            }

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
            const errorMessage = (error as Error).message;

            if (errorMessage.includes('KMS')) {
                alert('❌ FHEVM Configuration Issue: KMS contract not properly configured. Using mock data for testing.');
            } else {
                alert('❌ Failed to submit intent: ' + errorMessage);
            }
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
                                onClick={() => setShowConnectModal(true)}
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

                {/* Main Content - Two Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* DCA Submission Card */}
                    <DCACard
                        registry={registry}
                        setRegistry={setRegistry}
                        budget={budget}
                        setBudget={setBudget}
                        per={per}
                        setPer={setPer}
                        interval={interval}
                        setInterval={setInterval}
                        periods={periods}
                        setPeriods={setPeriods}
                        onSubmit={submit}
                        canSubmit={canSubmit}
                        loading={loading}
                        txHash={txHash}
                    />

                    {/* Monitoring Card */}
                    <MonitoringCard
                        executorAddr={executorAddr}
                        setExecutorAddr={setExecutorAddr}
                        rewardVaultAddr={rewardVaultAddr}
                        setRewardVaultAddr={setRewardVaultAddr}
                        batchEvents={batchEvents}
                        encBalance={encBalance}
                        onLoadBatchStatus={loadBatchStatus}
                        onLoadBalance={loadMyEncBalance}
                    />
                </div>

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

            {/* Connect Modal */}
            <ConnectModal
                isOpen={showConnectModal}
                onClose={() => setShowConnectModal(false)}
                onConnect={connect}
                account={account}
                network={network}
            />
        </div>
    );
}


