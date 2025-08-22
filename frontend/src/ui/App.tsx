import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * FHEVM DCA Bot – Privacy-Preserving Dollar-Cost Averaging (Single-file demo)
 * UI Features
 * - Modal-based wallet selection (MetaMask)
 * - Connection status indicators + chain (Sepolia)
 * - Truncated address + copy + disconnect
 * - Loading states during connection and tx simulation
 *
 * Pages
 * - Home (hero + stats + recent intents)
 * - Submit Intent (validated form)
 * - Vault Dashboard (balances, active intents, execution history)
 *
 * Notes
 * - Self-contained: no external UI libs; Tailwind-style utility classes
 * - Mocked encryption + on-chain calls (replace with fhEVM SDK / contracts)
 */

// -------------------------- Utils --------------------------
const truncate = (addr?: string, n = 4) =>
  addr ? `${addr.slice(0, 2 + n)}…${addr.slice(-n)}` : "";

const CHAINS: Record<string, { name: string; short: string }> = {
  "0xaa36a7": { name: "Sepolia", short: "Sepolia" }, // 11155111
  "0x1": { name: "Ethereum", short: "Mainnet" },
};

function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

// Simple in-app toast
function useToast() {
  const [items, setItems] = useState<{ id: number; text: string }[]>([]);
  const id = useRef(1);
  const push = (text: string) => {
    const next = id.current++;
    setItems((t) => [...t, { id: next, text }]);
    setTimeout(() => setItems((t) => t.filter((i) => i.id !== next)), 2200);
  };
  const Host = () => (
    <div className="fixed top-3 right-3 z-50 space-y-2">
      {items.map((t) => (
        <div key={t.id} className="px-4 py-2 rounded-2xl bg-black/85 text-white text-sm shadow-lg">
          {t.text}
        </div>
      ))}
    </div>
  );
  return { push, Host } as const;
}

// -------------------------- MetaMask hook --------------------------
interface WalletState {
  installed: boolean;
  connecting: boolean;
  connected: boolean;
  address?: string;
  chainId?: string;
}

function useMetaMask() {
  const [state, set] = useState<WalletState>({ installed: false, connecting: false, connected: false });
  useEffect(() => {
    const eth = (window as any).ethereum;
    const installed = Boolean(eth && eth.isMetaMask);
    set((s) => ({ ...s, installed }));
    if (!installed) return;

    eth.request({ method: "eth_accounts" }).then((accs: string[]) => {
      if (accs?.length) set((s) => ({ ...s, connected: true, address: accs[0] }));
    });
    eth.request({ method: "eth_chainId" }).then((cid: string) => set((s) => ({ ...s, chainId: cid })));

    const onAcc = (accs: string[]) => set((s) => ({ ...s, connected: !!accs?.length, address: accs?.[0] }));
    const onChain = (cid: string) => set((s) => ({ ...s, chainId: cid }));
    eth.on?.("accountsChanged", onAcc);
    eth.on?.("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAcc);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, []);

  const connect = async () => {
    const eth = (window as any).ethereum;
    if (!eth?.isMetaMask) {
      window.open("https://metamask.io/download/", "_blank");
      return;
    }
    try {
      set((s) => ({ ...s, connecting: true }));
      const accs: string[] = await eth.request({ method: "eth_requestAccounts" });
      const cid: string = await eth.request({ method: "eth_chainId" });
      set({ installed: true, connecting: false, connected: true, address: accs[0], chainId: cid });
    } catch (e) {
      set((s) => ({ ...s, connecting: false }));
      console.error(e);
    }
  };

  const disconnect = () => set((s) => ({ ...s, connected: false, address: undefined })); // clear local

  return { state, connect, disconnect } as const;
}

// -------------------------- Layout --------------------------
function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const root = document.documentElement;
    dark ? root.classList.add("dark") : root.classList.remove("dark");
  }, [dark]);
  return (
    <button onClick={() => setDark((d) => !d)} className="rounded-full px-3 py-2 text-sm border dark:border-neutral-700 hover:bg-black/5 dark:hover:bg-white/5">
      {dark ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}

function ConnectionBadge({ connected, chainId }: { connected: boolean; chainId?: string }) {
  const label = connected ? CHAINS[chainId ?? ""]?.short || `Chain ${chainId}` : "Disconnected";
  return (
    <div className="flex items-center gap-2 text-xs px-2 py-1 rounded-full border dark:border-neutral-700">
      <span className={classNames("inline-block h-2.5 w-2.5 rounded-full", connected ? "bg-emerald-500" : "bg-neutral-400")} />
      <span className="opacity-80">{label}</span>
    </div>
  );
}

function Navbar({ openWallet, wallet }: any) {
  const copy = async () => {
    if (!wallet.state.address) return;
    await navigator.clipboard.writeText(wallet.state.address);
  };
  return (
    <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-neutral-950/70 bg-white/60 dark:bg-neutral-950/60 border-b dark:border-neutral-800">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600" />
          <div className="font-bold">FHEVM DCA Bot</div>
          <nav className="hidden md:flex items-center gap-4 text-sm ml-6">
            <a href="#/" className="hover:opacity-80">Home</a>
            <a href="#/submit" className="hover:opacity-80">Submit Intent</a>
            <a href="#/vault" className="hover:opacity-80">Vault Dashboard</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ConnectionBadge connected={wallet.state.connected} chainId={wallet.state.chainId} />
          {wallet.state.connected ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm rounded-full border dark:border-neutral-700 px-3 py-1.5">
                <span className="font-mono">{truncate(wallet.state.address)}</span>
                <button onClick={copy} className="opacity-70 hover:opacity-100" title="Copy">📋</button>
              </div>
              <button onClick={wallet.disconnect} className="rounded-2xl px-3 py-2 text-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90">Disconnect</button>
            </div>
          ) : (
            <button onClick={openWallet} className="rounded-2xl px-3 py-2 text-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90">Connect Wallet</button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function Modal({ open, onClose, title, children }: any) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-[92vw] max-w-xl rounded-2xl bg-white dark:bg-neutral-900 p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/5" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function WalletModal({ open, onClose, wallet }: any) {
  const installed = wallet.state.installed;
  return (
    <Modal open={open} onClose={onClose} title="Select a wallet">
      <div className="space-y-3">
        <button onClick={wallet.connect} className="w-full flex items-center justify-between rounded-2xl border dark:border-neutral-800 p-3 hover:bg-black/5 dark:hover:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-400 to-amber-600" />
            <div className="text-left">
              <div className="font-medium">MetaMask</div>
              <div className="text-xs opacity-70">{installed ? "Detected" : "Not installed"}</div>
            </div>
          </div>
          {wallet.state.connecting ? (
            <span className="text-xs">Connecting… <span className="inline-block h-3 w-3 rounded-full border-2 border-transparent border-l-neutral-800 animate-spin"/></span>
          ) : (
            <span className="text-sm">{installed ? "Connect" : "Install"}</span>
          )}
        </button>
        {!installed && (
          <a className="block text-center text-sm underline opacity-80 hover:opacity-100" href="https://metamask.io/download/" target="_blank" rel="noreferrer">Get MetaMask</a>
        )}
      </div>
    </Modal>
  );
}

// -------------------------- Data Models (mocked) --------------------------
export type DCAIntent = {
  id: string;
  registry: string;
  totalBudget: number;
  perInterval: number;
  interval: number; // seconds
  totalPeriods: number;
  executed: number;
  createdAt: number;
  status: "active" | "completed" | "cancelled";
};

// In-memory store (replace with on-chain queries)
function useIntentsStore() {
  const [intents, setIntents] = useState<DCAIntent[]>([]);
  useEffect(() => {
    // hydrate from localStorage for demo
    try {
      const raw = localStorage.getItem("fhevm_dca_intents");
      if (raw) setIntents(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("fhevm_dca_intents", JSON.stringify(intents)); } catch {}
  }, [intents]);
  return { intents, setIntents } as const;
}

// -------------------------- Pages --------------------------
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border dark:border-neutral-800 p-4 flex flex-col bg-white/60 dark:bg-white/5">
      <span className="text-xs opacity-60">{label}</span>
      <span className="text-xl font-semibold">{value}</span>
    </div>
  );
}

function HomePage({ onOpenIntent, intents }: { onOpenIntent: (x: DCAIntent) => void; intents: DCAIntent[] }) {
  const recent = intents.slice(-8).reverse();
  const totalBudget = intents.reduce((s, i) => s + i.totalBudget, 0);
  const active = intents.filter((i) => i.status === "active").length;
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="rounded-3xl p-6 bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 border dark:border-neutral-800">
        <div className="text-sm opacity-70">Privacy-Preserving Dollar-Cost Averaging</div>
        <h1 className="text-2xl md:text-3xl font-semibold mt-1">🔐 FHEVM DCA Bot</h1>
        <p className="mt-2 opacity-80 max-w-2xl text-sm">Submit encrypted DCA intents, monitor execution in real time, and maintain strategy privacy on-chain.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <Stat label="Active Intents" value={String(active)} />
          <Stat label="Total Budget (USDC)" value={`$${totalBudget.toLocaleString()}`} />
          <Stat label="Network" value="Sepolia" />
          <Stat label="Anonymity" value="Batch-enabled" />
        </div>
      </div>

      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Recent Intents</h3>
          <a href="#/vault" className="text-sm opacity-70 hover:opacity-100">Open Dashboard</a>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {recent.map((i) => (
            <div key={i.id} className="flex-shrink-0 w-72 rounded-2xl border dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
              <div className="text-sm opacity-60">Registry</div>
              <div className="font-mono text-sm">{truncate(i.registry, 6)}</div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div className="rounded-xl p-2 bg-emerald-500/10">
                  <div className="opacity-60">Budget</div>
                  <div className="font-semibold">${i.totalBudget}</div>
                </div>
                <div className="rounded-xl p-2 bg-blue-500/10">
                  <div className="opacity-60">Per Interval</div>
                  <div className="font-semibold">${i.perInterval}</div>
                </div>
              </div>
              <button className="w-full mt-4 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 py-2 text-sm" onClick={() => onOpenIntent(i)}>
                View Details
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function SubmitIntentPage({ onSubmitted }: { onSubmitted: (i: DCAIntent) => void }) {
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    registry: "0x3F9D1D64CbbD69aBcB79faBD156817655b48050c",
    totalBudget: 1000,
    perInterval: 100,
    interval: 86400,
    totalPeriods: 10,
  });

  const onChange = (k: string, v: any) => setValues((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    setLoading(true);
    try {
      // TODO replace with FHE encryption + contract call
      await new Promise((r) => setTimeout(r, 1200));
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
      onSubmitted(intent);
      window.location.hash = "#/vault";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="rounded-3xl p-6 border dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow">
        <h2 className="text-xl font-semibold">📊 Submit DCA Intent</h2>
        <p className="text-sm opacity-70 mt-1">86400 = Daily, 3600 = Hourly</p>
        <div className="grid gap-4 mt-4">
          <div>
            <label className="text-sm">Registry Address</label>
            <input value={values.registry} onChange={(e) => onChange("registry", e.target.value)} className="w-full mt-1 rounded-xl border dark:border-neutral-700 p-3 bg-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Total Budget (USDC)</label>
              <input type="number" value={values.totalBudget} onChange={(e) => onChange("totalBudget", e.target.value)} className="w-full mt-1 rounded-xl border dark:border-neutral-700 p-3 bg-transparent" />
            </div>
            <div>
              <label className="text-sm">Amount Per Interval (USDC)</label>
              <input type="number" value={values.perInterval} onChange={(e) => onChange("perInterval", e.target.value)} className="w-full mt-1 rounded-xl border dark:border-neutral-700 p-3 bg-transparent" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Interval (seconds)</label>
              <input type="number" value={values.interval} onChange={(e) => onChange("interval", e.target.value)} className="w-full mt-1 rounded-xl border dark:border-neutral-700 p-3 bg-transparent" />
            </div>
            <div>
              <label className="text-sm">Total Periods</label>
              <input type="number" value={values.totalPeriods} onChange={(e) => onChange("totalPeriods", e.target.value)} className="w-full mt-1 rounded-xl border dark:border-neutral-700 p-3 bg-transparent" />
            </div>
          </div>
          <button onClick={submit} disabled={loading} className="w-full rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 py-3">
            {loading ? "Encrypting & Submitting…" : "🔐 Encrypt & Submit Intent"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 mt-6">
        <Stat label="Encrypted Params" value="Yes" />
        <Stat label="Zero Leakage" value="Enabled" />
        <Stat label="Batch Anonymity" value="On" />
      </div>
    </div>
  );
}

function VaultDashboard({ intents, setIntents }: { intents: DCAIntent[]; setIntents: (xs: DCAIntent[]) => void }) {
  const totalUSDC = intents.reduce((s, i) => s + i.totalBudget - i.perInterval * i.executed, 0);
  const executions = intents.reduce((s, i) => s + i.executed, 0);

  const cancel = (id: string) => {
    setIntents(intents.map((i) => (i.id === id ? { ...i, status: "cancelled" } : i)));
  };

  const simulateExec = (id: string) => {
    setIntents(
      intents.map((i) =>
        i.id === id
          ? {
              ...i,
              executed: Math.min(i.executed + 1, i.totalPeriods),
              status: i.executed + 1 >= i.totalPeriods ? "completed" : i.status,
            }
          : i
      )
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Vault Balance (USDC)" value={`$${totalUSDC.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
        <Stat label="Active Intents" value={String(intents.filter((i) => i.status === "active").length)} />
        <Stat label="Executions" value={String(executions)} />
        <Stat label="Network" value="Sepolia" />
      </div>

      <div className="rounded-3xl p-6 border dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">DCA Intents</h3>
          <a href="#/submit" className="text-sm opacity-70 hover:opacity-100">New Intent</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {intents.map((i) => (
            <div key={i.id} className="p-4 rounded-2xl border dark:border-neutral-800 bg-white dark:bg-neutral-900">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs opacity-60">Registry</div>
                  <div className="font-mono text-sm">{truncate(i.registry, 6)}</div>
                </div>
                <span className={classNames(
                  "px-2 py-1 rounded text-xs",
                  i.status === "active" && "bg-emerald-200 text-emerald-800",
                  i.status === "completed" && "bg-gray-200 text-gray-800",
                  i.status === "cancelled" && "bg-rose-200 text-rose-800"
                )}>{i.status}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                <div className="rounded-xl p-2 bg-emerald-500/10">
                  <div className="opacity-60">Budget</div>
                  <div className="font-semibold">${i.totalBudget}</div>
                </div>
                <div className="rounded-xl p-2 bg-blue-500/10">
                  <div className="opacity-60">Per Interval</div>
                  <div className="font-semibold">${i.perInterval}</div>
                </div>
                <div className="rounded-xl p-2 bg-purple-500/10">
                  <div className="opacity-60">Interval</div>
                  <div className="font-semibold">{i.interval === 86400 ? "Daily" : i.interval === 3600 ? "Hourly" : `${i.interval}s`}</div>
                </div>
                <div className="rounded-xl p-2 bg-amber-500/10">
                  <div className="opacity-60">Progress</div>
                  <div className="font-semibold">{i.executed}/{i.totalPeriods}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button onClick={() => simulateExec(i.id)} disabled={i.status !== "active"} className="flex-1 rounded-xl border dark:border-neutral-700 py-2 text-sm disabled:opacity-50">Simulate Exec</button>
                <button onClick={() => cancel(i.id)} disabled={i.status !== "active"} className="flex-1 rounded-xl border dark:border-neutral-700 py-2 text-sm disabled:opacity-50">Cancel</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl p-6 border dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <h3 className="font-semibold mb-3">Execution History (mock)</h3>
        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left opacity-60">
              <tr>
                <th className="py-2 pr-4">Time</th>
                <th className="py-2 pr-4">Intent</th>
                <th className="py-2 pr-4">Amount</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Tx</th>
              </tr>
            </thead>
            <tbody>
              {intents.flatMap((i) =>
                Array.from({ length: i.executed }).map((_, k) => (
                  <tr key={`${i.id}-${k}`} className="border-t dark:border-neutral-800">
                    <td className="py-2 pr-4">{new Date(i.createdAt + (k + 1) * i.interval * 1000).toLocaleString()}</td>
                    <td className="py-2 pr-4 font-mono">{truncate(i.id, 6)}</td>
                    <td className="py-2 pr-4">${i.perInterval}</td>
                    <td className="py-2 pr-4 text-emerald-600">Executed</td>
                    <td className="py-2 pr-4 opacity-60">—</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// -------------------------- Router-lite --------------------------
function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || "#/");
  useEffect(() => {
    const onHash = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const parts = useMemo(() => hash.replace(/^#\//, "").split("/"), [hash]);
  return parts as string[]; // ["", "submit"], ["vault"]
}

// -------------------------- App --------------------------
export default function App() {
  const wallet = useMetaMask();
  const [walletOpen, setWalletOpen] = useState(false);
  const route = useHashRoute();
  const { intents, setIntents } = useIntentsStore();
  const { Host: ToastHost, push } = useToast();

  const onOpenRecent = (i: DCAIntent) => {
    window.location.hash = "#/vault";
  };

  const addIntent = (i: DCAIntent) => {
    setIntents([...intents, i]);
    push("Intent submitted (encrypted)");
  };

  let page: React.ReactNode = null;
  if (route[0] === "submit") page = <SubmitIntentPage onSubmitted={addIntent} />;
  else if (route[0] === "vault") page = <VaultDashboard intents={intents} setIntents={setIntents} />;
  else page = <HomePage onOpenIntent={onOpenRecent} intents={intents} />;

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <Navbar openWallet={() => setWalletOpen(true)} wallet={wallet} />
      {page}
      <footer className="max-w-6xl mx-auto p-4 opacity-70 text-xs">🔐 Built for FHEVM DCA • Replace mocks with on-chain reads/writes • © {new Date().getFullYear()}</footer>
      <WalletModal open={walletOpen} onClose={() => setWalletOpen(false)} wallet={wallet} />
      <ToastHost />
    </div>
  );
}
