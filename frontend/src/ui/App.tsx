import React, { useCallback, useMemo, useState } from 'react';
import { BrowserProvider, Contract, Eip1193Provider, JsonRpcSigner, isAddress } from 'ethers';
import { createInstance } from 'fhevmjs';

const dcaAbi = [
    'function submitIntent(bytes32 budget, bytes budgetProof, bytes32 per, bytes perProof, bytes32 interval, bytes intervalProof, bytes32 periods, bytes periodsProof) external',
    'function getMyParams() view returns (bytes budget, bytes per, bytes interval, bytes periods, bytes spent, bool active)'
];

export function App() {
    const [provider, setProvider] = useState<BrowserProvider | null>(null);
    const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
    const [account, setAccount] = useState<string>('');
    const [registry, setRegistry] = useState<string>('');
    const [budget, setBudget] = useState<string>('');
    const [per, setPer] = useState<string>('');
    const [interval, setInterval] = useState<string>('');
    const [periods, setPeriods] = useState<string>('');
    const [executorAddr, setExecutorAddr] = useState<string>('');
    const [rewardVaultAddr, setRewardVaultAddr] = useState<string>('');
    const [batchEvents, setBatchEvents] = useState<Array<{ name: string; batchId: string; data?: any }>>([]);
    const [encBalance, setEncBalance] = useState<string>('');

    const connect = useCallback(async () => {
        const anyWindow = window as any;
        const injected: Eip1193Provider | undefined = anyWindow.ethereum;
        if (!injected) return alert('Install MetaMask');
        await injected.request?.({ method: 'eth_requestAccounts' });
        const prov = new BrowserProvider(injected);
        setProvider(prov);
        const s = await prov.getSigner();
        setSigner(s);
        setAccount(await s.getAddress());
    }, []);

    const canSubmit = useMemo(() => signer && isAddress(registry) && budget && per && interval && periods, [signer, registry, budget, per, interval, periods]);

    const submit = useCallback(async () => {
        if (!signer || !provider || !isAddress(registry)) return;
        const userAddr = await signer.getAddress();
        const relayer = await createInstance((provider as any).provider);
        const ci = await relayer
            .createEncryptedInput(registry, userAddr)
            .add64(BigInt(budget))
            .add64(BigInt(per))
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
        await tx.wait();
        alert('Intent submitted');
    }, [signer, provider, registry, budget, per, interval, periods]);

    const loadBatchStatus = useCallback(async () => {
        if (!provider || !isAddress(executorAddr)) return;
        const fromBlock = (await provider.getBlockNumber()) - 2000;
        const iface = new (require('ethers').Interface)([
            'event BatchPrepared(uint256 indexed batchId, uint256 userCount)',
            'event BatchDecryptionFulfilled(uint256 indexed batchId, uint64 decryptedTotal)'
        ]);
        const logs = await provider.getLogs({ address: executorAddr, fromBlock });
        const parsed: Array<{ name: string; batchId: string; data?: any }> = [];
        for (const log of logs) {
            try {
                const p = iface.parseLog(log as any);
                if (p?.name === 'BatchPrepared') {
                    parsed.push({ name: 'BatchPrepared', batchId: (p.args[0] as bigint).toString(), data: { userCount: (p.args[1] as bigint).toString() } });
                } else if (p?.name === 'BatchDecryptionFulfilled') {
                    parsed.push({ name: 'BatchDecryptionFulfilled', batchId: (p.args[0] as bigint).toString(), data: { total: (p.args[1] as bigint).toString() } });
                }
            } catch (_) {
                // ignore
            }
        }
        setBatchEvents(parsed);
    }, [provider, executorAddr]);

    const loadMyEncBalance = useCallback(async () => {
        if (!signer || !isAddress(rewardVaultAddr)) return;
        const rv = new Contract(rewardVaultAddr, ['function getMyEncryptedBalance() view returns (bytes)'], signer);
        const h = await rv.getMyEncryptedBalance();
        setEncBalance(String(h));
    }, [signer, rewardVaultAddr]);

    return (
        <div style={{ fontFamily: 'ui-sans-serif, system-ui', maxWidth: 720, margin: '2rem auto', padding: '0 1rem' }}>
            <h1>FHE DCA Bot</h1>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <button onClick={connect}>{account ? `Connected: ${account.slice(0, 6)}…${account.slice(-4)}` : 'Connect Wallet'}</button>
            </div>

            <section style={{ marginTop: 24 }}>
                <h2>Submit DCA Intent</h2>
                <label>Registry Address
                    <input value={registry} onChange={e => setRegistry(e.target.value)} placeholder="0x..." style={{ display: 'block', width: '100%' }} />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                    <label>Budget (USDC wei)
                        <input value={budget} onChange={e => setBudget(e.target.value)} />
                    </label>
                    <label>Per Interval (USDC wei)
                        <input value={per} onChange={e => setPer(e.target.value)} />
                    </label>
                    <label>Interval (seconds)
                        <input value={interval} onChange={e => setInterval(e.target.value)} />
                    </label>
                    <label>Periods (count)
                        <input value={periods} onChange={e => setPeriods(e.target.value)} />
                    </label>
                </div>
                <button disabled={!canSubmit} onClick={submit} style={{ marginTop: 12 }}>Encrypt & Submit</button>
            </section>

            <section style={{ marginTop: 24 }}>
                <h2>Batch Status</h2>
                <label>BatchExecutor Address
                    <input value={executorAddr} onChange={e => setExecutorAddr(e.target.value)} placeholder="0x..." style={{ display: 'block', width: '100%' }} />
                </label>
                <button onClick={loadBatchStatus} style={{ marginTop: 12 }}>Load Recent Batch Events</button>
                <ul>
                    {batchEvents.map((e, i) => (
                        <li key={i}>{e.name} #{e.batchId} {e.data ? JSON.stringify(e.data) : ''}</li>
                    ))}
                </ul>
            </section>

            <section style={{ marginTop: 24 }}>
                <h2>My Encrypted Balance</h2>
                <label>RewardVault Address
                    <input value={rewardVaultAddr} onChange={e => setRewardVaultAddr(e.target.value)} placeholder="0x..." style={{ display: 'block', width: '100%' }} />
                </label>
                <button onClick={loadMyEncBalance} style={{ marginTop: 12 }}>Load</button>
                {encBalance && <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{encBalance}</pre>}
            </section>
        </div>
    );
}


