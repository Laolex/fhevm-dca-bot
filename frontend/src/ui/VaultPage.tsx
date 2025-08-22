import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AnimatedCard from '../components/AnimatedCard';
import { useWallet } from '../hooks/useWallet';
import { useIntentsStore } from '../hooks/useIntentsStore';
import { DCAIntent, Intent } from '../types/dca';
import { truncate, classNames, formatCountdown, generateChartData, generatePeriodChartData } from '../utils/fhe';
import Countdown from '../components/Countdown';

// Simple chart component (you can replace with recharts if needed)
function SimpleChart({ data }: { data: Array<{ t: number; spent: number; remaining: number }> }) {
  if (data.length === 0) return <div className="h-64 flex items-center justify-center text-gray-500">No data</div>;

  const maxValue = Math.max(...data.map(d => d.spent + d.remaining));
  const points = data.map((d, i) => ({
    x: (i / (data.length - 1)) * 100,
    spent: (d.spent / maxValue) * 100,
    remaining: (d.remaining / maxValue) * 100
  }));

  return (
    <div className="h-64">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Spent area */}
        <path
          d={`M 0 100 ${points.map(p => `L ${p.x} ${100 - p.spent}`).join(' ')} L 100 100 Z`}
          fill="url(#gSpent)"
          opacity="0.6"
        />
        {/* Remaining area */}
        <path
          d={`M 0 100 ${points.map(p => `L ${p.x} ${100 - p.spent - p.remaining}`).join(' ')} L 100 100 Z`}
          fill="url(#gRemain)"
          opacity="0.6"
        />
        <defs>
          <linearGradient id="gSpent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="gRemain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

function buildChartData(intents: DCAIntent[]) {
  // Collect all execution timestamps up to now for ACTUAL spent
  const now = Date.now();
  const stamps = new Set<number>();

  intents.forEach((i) => {
    for (let k = 0; k <= i.executed; k++) {
      const t = i.createdAt + k * i.interval * 1000;
      if (t <= now) stamps.add(t);
    }
  });

  const sorted = Array.from(stamps).sort((a, b) => a - b);
  const points = sorted.map((t) => {
    let spent = 0;
    let total = 0;
    intents.forEach((i) => {
      total += i.totalBudget;
      const execsAtT = Math.min(i.executed, Math.floor((t - i.createdAt) / (i.interval * 1000)));
      spent += Math.max(0, execsAtT) * i.perInterval;
    });
    return { t, spent, remaining: Math.max(0, total - spent) };
  });

  if (points.length === 0) {
    const total = intents.reduce((s, i) => s + i.totalBudget, 0);
    points.push({ t: now, spent: 0, remaining: total });
  }

  return points;
}

const VaultPage: React.FC = () => {
  const [dark, setDark] = useState(true);
  const [enhancedIntents, setEnhancedIntents] = useState<Intent[]>([]);
  const [totalBudget, setTotalBudget] = useState(1000);
  const [amountPerInterval, setAmountPerInterval] = useState(100);
  const [totalPeriods, setTotalPeriods] = useState(10);

  const {
    walletState,
    isCorrectNetwork
  } = useWallet();

  const { intents, setIntents } = useIntentsStore();

  useEffect(() => {
    const root = document.documentElement;
    dark ? root.classList.add("dark") : root.classList.remove("dark");
  }, [dark]);

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

  const chartData = useMemo(() => buildChartData(intents), [intents]);
  const enhancedChartData = useMemo(() => generatePeriodChartData(totalBudget, amountPerInterval, totalPeriods), [totalBudget, amountPerInterval, totalPeriods]);

  const handleAddEnhancedIntent = () => {
    const newIntent: Intent = {
      id: enhancedIntents.length + 1,
      tokenIn: "USDC",
      tokenOut: "ETH",
      amount: amountPerInterval,
      frequency: 86400, // daily
      createdAt: Math.floor(Date.now() / 1000),
    };
    setEnhancedIntents([...enhancedIntents, newIntent]);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <div className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-2xl border dark:border-neutral-800 p-4 flex flex-col bg-white/60 dark:bg-white/5">
            <span className="text-xs opacity-60">Vault Balance (USDC)</span>
            <span className="text-xl font-semibold">${totalUSDC.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="rounded-2xl border dark:border-neutral-800 p-4 flex flex-col bg-white/60 dark:bg-white/5">
            <span className="text-xs opacity-60">Active Intents</span>
            <span className="text-xl font-semibold">{intents.filter((i) => i.status === "active").length}</span>
          </div>
          <div className="rounded-2xl border dark:border-neutral-800 p-4 flex flex-col bg-white/60 dark:bg-white/5">
            <span className="text-xs opacity-60">Executions</span>
            <span className="text-xl font-semibold">{executions}</span>
          </div>
          <div className="rounded-2xl border dark:border-neutral-800 p-4 flex flex-col bg-white/60 dark:bg-white/5">
            <span className="text-xs opacity-60">Network</span>
            <span className="text-xl font-semibold">Sepolia</span>
          </div>
        </div>

        {/* Enhanced DCA Configuration */}
        <div className="rounded-3xl p-6 border dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">🔐 Enhanced DCA Configuration</h3>
            <button
              onClick={handleAddEnhancedIntent}
              className="text-sm bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-3 py-1 rounded-lg hover:opacity-90"
            >
              Add Intent
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Total Budget (USDC)</label>
              <input
                type="number"
                value={totalBudget}
                onChange={(e) => setTotalBudget(Number(e.target.value))}
                className="w-full rounded-xl border dark:border-neutral-700 p-3 bg-transparent"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Amount Per Interval (USDC)</label>
              <input
                type="number"
                value={amountPerInterval}
                onChange={(e) => setAmountPerInterval(Number(e.target.value))}
                className="w-full rounded-xl border dark:border-neutral-700 p-3 bg-transparent"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Total Periods</label>
              <input
                type="number"
                value={totalPeriods}
                onChange={(e) => setTotalPeriods(Number(e.target.value))}
                className="w-full rounded-xl border dark:border-neutral-700 p-3 bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* Enhanced Intents */}
        <div className="rounded-3xl p-6 border dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <h3 className="text-xl font-semibold mb-4">Enhanced Intents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enhancedIntents.map((intent) => {
              const nextExec = intent.createdAt + intent.frequency;
              return (
                <div key={intent.id} className="rounded-2xl border dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">
                      {intent.tokenIn} → {intent.tokenOut}
                    </h4>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Active</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="opacity-60">Amount:</span>
                      <span className="font-semibold">{intent.amount} {intent.tokenIn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Frequency:</span>
                      <span className="font-semibold">{intent.frequency}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-60">Next Exec:</span>
                      <Countdown target={nextExec} showLabel={false} />
                    </div>
                  </div>
                </div>
              );
            })}
            {enhancedIntents.length === 0 && (
              <div className="col-span-full text-center py-8">
                <div className="text-neutral-500 text-lg">No enhanced intents yet</div>
                <button
                  onClick={handleAddEnhancedIntent}
                  className="inline-block mt-4 px-6 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl hover:opacity-90 transition-all"
                >
                  Create Your First Enhanced Intent
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Spend vs Remaining over time */}
        <div className="rounded-3xl p-6 border dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <h3 className="font-semibold mb-3">Spend vs Remaining (actual)</h3>
          <SimpleChart data={chartData} />
        </div>

        {/* Enhanced Chart */}
        <div className="rounded-3xl p-6 border dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <h3 className="font-semibold mb-3">📊 Enhanced Spend vs Remaining</h3>
          <div className="h-64">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Spent area */}
              <path
                d={`M 0 100 ${enhancedChartData.map((d, i) => `L ${(i / (enhancedChartData.length - 1)) * 100} ${100 - (d.spent / totalBudget) * 100}`).join(' ')} L 100 100 Z`}
                fill="url(#gSpent)"
                opacity="0.6"
              />
              {/* Remaining area */}
              <path
                d={`M 0 100 ${enhancedChartData.map((d, i) => `L ${(i / (enhancedChartData.length - 1)) * 100} ${100 - (d.spent / totalBudget) * 100 - (d.remaining / totalBudget) * 100}`).join(' ')} L 100 100 Z`}
                fill="url(#gRemain)"
                opacity="0.6"
              />
              <defs>
                <linearGradient id="gSpent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="gRemain" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <span>Spent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Remaining</span>
            </div>
          </div>
        </div>

        <div className="rounded-3xl p-6 border dark:border-neutral-800 bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">DCA Intents</h3>
            <Link to="/submit" className="text-sm opacity-70 hover:opacity-100">New Intent</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {intents.length > 0 ? (
              intents.map((i) => {
                const nextTs = i.createdAt + (i.executed + 1) * i.interval * 1000;
                return (
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
                    {i.status === "active" && (
                      <div className="mt-3 text-xs opacity-80">Next execution in <Countdown target={nextTs / 1000} showLabel={false} /></div>
                    )}
                    <div className="flex items-center gap-2 mt-4">
                      <button
                        onClick={() => simulateExec(i.id)}
                        disabled={i.status !== "active"}
                        className="flex-1 rounded-xl border dark:border-neutral-700 py-2 text-sm disabled:opacity-50"
                      >
                        Simulate Exec
                      </button>
                      <button
                        onClick={() => cancel(i.id)}
                        disabled={i.status !== "active"}
                        className="flex-1 rounded-xl border dark:border-neutral-700 py-2 text-sm disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-8">
                <div className="text-gray-500 text-lg">No intents yet</div>
                <Link
                  to="/submit"
                  className="inline-block mt-4 px-6 py-3 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 rounded-xl hover:opacity-90 transition-all"
                >
                  Create Your First Intent
                </Link>
              </div>
            )}
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
                {intents.reduce((acc, i) => acc + i.executed, 0) === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">No executions yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <footer className="max-w-6xl mx-auto p-4 opacity-70 text-xs">
        🔐 Built for FHEVM DCA • Replace mocks with on-chain reads/writes • © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default VaultPage;
