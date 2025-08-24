import React, { useState, useEffect } from 'react';
import { Contract } from 'ethers';

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
    signer: any;
    userAddress: string;
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
    txHash,
    signer,
    userAddress
}: DCACardProps) {
    const [approvalStatus, setApprovalStatus] = useState<'checking' | 'needed' | 'approved' | 'approving'>('checking');
    const [approvalTxHash, setApprovalTxHash] = useState<string>('');
    const [usdcBalance, setUsdcBalance] = useState<string>('0');
    const [usdcAllowance, setUsdcAllowance] = useState<string>('0');

    const USDC_ADDRESS = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
    const VAULT_ADDRESS = '0x8D91b58336bc43222D55bC2C5aB3DEF468A54050';

    // Check USDC balance and allowance
    useEffect(() => {
        const checkApprovalStatus = async () => {
            if (!signer || !userAddress) return;

            try {
                const usdcContract = new Contract(USDC_ADDRESS, [
                    'function balanceOf(address owner) view returns (uint256)',
                    'function allowance(address owner, address spender) view returns (uint256)'
                ], signer);

                const [balance, allowance] = await Promise.all([
                    usdcContract.balanceOf(userAddress),
                    usdcContract.allowance(userAddress, VAULT_ADDRESS)
                ]);

                const balanceFormatted = (Number(balance) / 1000000).toFixed(2);
                const allowanceFormatted = (Number(allowance) / 1000000).toFixed(2);
                const budgetWei = BigInt(budget) * 1000000n;

                setUsdcBalance(balanceFormatted);
                setUsdcAllowance(allowanceFormatted);

                if (allowance >= budgetWei) {
                    setApprovalStatus('approved');
                } else {
                    setApprovalStatus('needed');
                }
            } catch (error) {
                console.error('Failed to check approval status:', error);
                setApprovalStatus('needed');
            }
        };

        checkApprovalStatus();
    }, [signer, userAddress, budget]);

    const handleApprove = async () => {
        if (!signer) return;

        setApprovalStatus('approving');
        setApprovalTxHash('');

        try {
            const usdcContract = new Contract(USDC_ADDRESS, [
                'function approve(address spender, uint256 amount) external returns (bool)'
            ], signer);

            const budgetWei = BigInt(budget) * 1000000n;
            const approveAmount = budgetWei * 2n; // Approve 2x budget for future use

            console.log(`🔐 Approving ${Number(approveAmount) / 1000000} USDC to vault...`);

            const tx = await usdcContract.approve(VAULT_ADDRESS, approveAmount);
            setApprovalTxHash(tx.hash);

            await tx.wait();
            console.log('✅ USDC approved successfully!');

            setApprovalStatus('approved');
            setApprovalTxHash('');
        } catch (error) {
            console.error('Approval failed:', error);
            setApprovalStatus('needed');
            alert('❌ USDC approval failed: ' + (error as Error).message);
        }
    };
    return (
        <div className="w-full">
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

                {/* USDC Balance & Approval Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">💰 USDC Status</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <span className="text-sm text-blue-700">Balance:</span>
                            <div className="font-mono font-semibold text-blue-900">{usdcBalance} USDC</div>
                        </div>
                        <div>
                            <span className="text-sm text-blue-700">Vault Allowance:</span>
                            <div className="font-mono font-semibold text-blue-900">{usdcAllowance} USDC</div>
                        </div>
                    </div>

                    {approvalStatus === 'checking' && (
                        <div className="text-blue-700 text-sm">⏳ Checking approval status...</div>
                    )}

                    {(approvalStatus === 'needed' || approvalStatus === 'approving') && (
                        <div className="space-y-3">
                            <div className="text-orange-700 text-sm">
                                ⚠️ You need to approve USDC to the vault before submitting your DCA intent
                            </div>
                            <button
                                onClick={handleApprove}
                                disabled={approvalStatus === 'approving'}
                                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 ${approvalStatus === 'approving'
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl'
                                    }`}
                            >
                                {approvalStatus === 'approving' ? '⏳ Approving...' : '🔐 Approve USDC to Vault'}
                            </button>
                        </div>
                    )}

                    {approvalStatus === 'approved' && (
                        <div className="text-emerald-700 text-sm flex items-center gap-2">
                            ✅ USDC approved! Ready to submit DCA intent
                        </div>
                    )}

                    {approvalTxHash && (
                        <div className="mt-3 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="text-blue-600">⏳</span>
                                <span className="text-blue-800 text-sm">Approval transaction pending...</span>
                            </div>
                            <a
                                href={`https://sepolia.etherscan.io/tx/${approvalTxHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs mt-1 block"
                            >
                                View on Etherscan →
                            </a>
                        </div>
                    )}
                </div>

                <button
                    disabled={!canSubmit || approvalStatus !== 'approved'}
                    onClick={onSubmit}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${canSubmit && approvalStatus === 'approved'
                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    {loading ? '⏳ Encrypting & Submitting...' : '🔐 Encrypt & Submit Intent'}
                </button>

                {txHash && (
                    <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-emerald-600 text-lg">✅</span>
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
