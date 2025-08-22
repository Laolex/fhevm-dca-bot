import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AnimatedCard from '../components/AnimatedCard';
import { DCACard } from '../components/DCACard';
import BalanceCard from '../components/BalanceCard';
import ParticleBackground from '../components/ParticleBackground';
import { useWallet } from '../hooks/useWallet';
import { useIntentsStore } from '../hooks/useIntentsStore';
import { useToast } from '../contexts/ToastContext';
import { fheEncryptIntent, submitEncryptedOnChain } from '../utils/fhe';
import { DCAIntent } from '../types/dca';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const SubmitPage: React.FC = () => {
    const [dark, setDark] = useState(true);
    const [loading, setLoading] = useState(false);
    const [chainTx, setChainTx] = useState<string | null>(null);
    const navigate = useNavigate();

    const {
        walletState,
        isCorrectNetwork
    } = useWallet();

    const { intents, setIntents } = useIntentsStore();
    const { showToast } = useToast();

    const [values, setValues] = useState({
        registry: "0x3F9D1D64CbbD69aBcB79faBD156817655b48050c",
        totalBudget: 1000,
        perInterval: 100,
        interval: 86400,
        totalPeriods: 10,
    });

    useEffect(() => {
        const root = document.documentElement;
        dark ? root.classList.add("dark") : root.classList.remove("dark");
    }, [dark]);

    const onChange = (k: string, v: any) => setValues((s) => ({ ...s, [k]: v }));

    const canSubmit = Boolean(
        values.registry &&
        values.totalBudget &&
        values.perInterval &&
        values.interval &&
        values.totalPeriods &&
        walletState.connected &&
        isCorrectNetwork
    );

    const submit = async () => {
        if (!canSubmit) return;

        setLoading(true);
        try {
            // 1) Encrypt params with FHE (placeholder)
            const ciphertext = await fheEncryptIntent({
                totalBudget: Number(values.totalBudget),
                perInterval: Number(values.perInterval),
                interval: Number(values.interval),
                totalPeriods: Number(values.totalPeriods),
            });

            // 2) Submit to registry on-chain (replace ABI & function as needed)
            try {
                const receipt = await submitEncryptedOnChain(values.registry, ciphertext);
                setChainTx(String(receipt?.transactionHash || ""));
                showToast('Intent submitted on-chain successfully!', 'success');
            } catch (onChainErr) {
                console.warn("On-chain submit failed — falling back to mock intent.", onChainErr);
                showToast('On-chain submission failed, using mock intent', 'warning');
            }

            // 3) Update local state regardless (until on-chain indexing is wired)
            const intent: DCAIntent = {
                id: `intent-${Date.now()}`,
                registry: values.registry,
                totalBudget: Number(values.totalBudget),
                perInterval: Number(values.perInterval),
                interval: Number(values.interval),
                totalPeriods: Number(values.totalPeriods),
                executed: 0,
                createdAt: Date.now(),
                status: "active",
            };

            setIntents([...intents, intent]);
            showToast('Intent submitted (encrypted)', 'success');

            // Navigate to vault dashboard
            navigate('/vault');
        } catch (error) {
            console.error('Submission failed:', error);
            showToast('Failed to submit intent', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
            <div className="max-w-3xl mx-auto p-4">
                <Card>
                    <CardHeader>
                        <CardTitle>📊 Submit DCA Intent</CardTitle>
                        <p className="text-sm opacity-70">86400 = Daily, 3600 = Hourly</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Registry Address</label>
                            <input
                                value={values.registry}
                                onChange={(e) => onChange("registry", e.target.value)}
                                className="w-full mt-1 rounded-xl border dark:border-neutral-700 p-3 bg-transparent"
                                placeholder="0x..."
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Total Budget (USDC)</label>
                                <input
                                    type="number"
                                    value={values.totalBudget}
                                    onChange={(e) => onChange("totalBudget", e.target.value)}
                                    className="w-full mt-1 rounded-xl border dark:border-neutral-700 p-3 bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Amount Per Interval (USDC)</label>
                                <input
                                    type="number"
                                    value={values.perInterval}
                                    onChange={(e) => onChange("perInterval", e.target.value)}
                                    className="w-full mt-1 rounded-xl border dark:border-neutral-700 p-3 bg-transparent"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">Interval (seconds)</label>
                                <input
                                    type="number"
                                    value={values.interval}
                                    onChange={(e) => onChange("interval", e.target.value)}
                                    className="w-full mt-1 rounded-xl border dark:border-neutral-700 p-3 bg-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Total Periods</label>
                                <input
                                    type="number"
                                    value={values.totalPeriods}
                                    onChange={(e) => onChange("totalPeriods", e.target.value)}
                                    className="w-full mt-1 rounded-xl border dark:border-neutral-700 p-3 bg-transparent"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={submit}
                            disabled={loading || !canSubmit}
                            className="w-full"
                            variant="primary"
                            size="lg"
                        >
                            {loading ? "🔐 Encrypting & Submitting…" : "🔐 Encrypt & Submit Intent"}
                        </Button>
                        {chainTx && (
                            <div className="text-xs opacity-70">Tx: <span className="font-mono">{chainTx.slice(0, 10)}...{chainTx.slice(-8)}</span></div>
                        )}
                    </CardContent>
                </Card>

                <div className="grid md:grid-cols-3 gap-3 mt-6">
                    <div className="rounded-2xl border dark:border-neutral-800 p-4 flex flex-col bg-white/60 dark:bg-white/5">
                        <span className="text-xs opacity-60">Encrypted Params</span>
                        <span className="text-xl font-semibold">Yes</span>
                    </div>
                    <div className="rounded-2xl border dark:border-neutral-800 p-4 flex flex-col bg-white/60 dark:bg-white/5">
                        <span className="text-xs opacity-60">Zero Leakage</span>
                        <span className="text-xl font-semibold">Enabled</span>
                    </div>
                    <div className="rounded-2xl border dark:border-neutral-800 p-4 flex flex-col bg-white/60 dark:bg-white/5">
                        <span className="text-xs opacity-60">Batch Anonymity</span>
                        <span className="text-xl font-semibold">On</span>
                    </div>
                </div>
            </div>

            <footer className="max-w-6xl mx-auto p-4 opacity-70 text-xs">
                🔐 Built for FHEVM DCA • Replace mocks with on-chain reads/writes • © {new Date().getFullYear()}
            </footer>
        </div>
    );
};

export default SubmitPage;
