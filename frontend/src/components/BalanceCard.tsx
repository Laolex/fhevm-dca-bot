import React, { useState, useEffect } from 'react';
import { Contract } from 'ethers';

interface BalanceCardProps {
    signer: any;
    userAddress: string;
}

const BalanceCard: React.FC<BalanceCardProps> = ({ signer, userAddress }) => {
    const [balance, setBalance] = useState<string>('0');
    const [allowance, setAllowance] = useState<string>('0');
    const [loading, setLoading] = useState(false);

    const usdcAddress = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
    const vaultAddress = '0x8D91b58336bc43222D55bC2C5aB3DEF468A54050';

    const loadBalances = async () => {
        if (!signer || !userAddress) return;
        
        setLoading(true);
        try {
            const usdcContract = new Contract(usdcAddress, [
                'function balanceOf(address owner) view returns (uint256)',
                'function allowance(address owner, address spender) view returns (uint256)'
            ], signer);

            const [balanceWei, allowanceWei] = await Promise.all([
                usdcContract.balanceOf(userAddress),
                usdcContract.allowance(userAddress, vaultAddress)
            ]);

            setBalance((Number(balanceWei) / 1000000).toFixed(2));
            setAllowance((Number(allowanceWei) / 1000000).toFixed(2));
        } catch (error) {
            console.error('Failed to load balances:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBalances();
    }, [signer, userAddress]);

    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/30">
            <h3 className="text-xl font-bold text-gray-900 mb-4">💰 Balance Status</h3>
            
            <div className="space-y-3">
                <div className="flex justify-between">
                    <span>USDC Balance:</span>
                    <span className="font-semibold text-emerald-600">
                        {loading ? '...' : `${balance} USDC`}
                    </span>
                </div>
                
                <div className="flex justify-between">
                    <span>Vault Allowance:</span>
                    <span className="font-semibold text-blue-600">
                        {loading ? '...' : `${allowance} USDC`}
                    </span>
                </div>

                {!loading && (
                    <div className="mt-3 p-2 rounded text-sm">
                        {Number(balance) === 0 ? (
                            <div className="bg-red-50 text-red-700 p-2 rounded">
                                ⚠️ No USDC balance
                            </div>
                        ) : Number(allowance) === 0 ? (
                            <div className="bg-yellow-50 text-yellow-700 p-2 rounded">
                                ⚠️ No vault allowance
                            </div>
                        ) : (
                            <div className="bg-emerald-50 text-emerald-700 p-2 rounded">
                                ✅ Ready to submit DCA intents!
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BalanceCard;
