import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AnimatedCard from '../components/AnimatedCard';
import AnimatedStats from '../components/AnimatedStats';
import FHEVMDcaBot from '../components/FHEVMDcaBot';
import { useIntentsStore } from '../hooks/useIntentsStore';
import { DCAIntent, Intent } from '../types/dca';
import { truncate, generateChartData } from '../utils/fhe';
import Countdown from '../components/Countdown';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const HomePage: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [enhancedIntents, setEnhancedIntents] = useState<Intent[]>([]);
  const { intents } = useIntentsStore();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const recent = intents.slice(-8).reverse();
  const totalBudget = intents.reduce((s, i) => s + i.totalBudget, 0);
  const active = intents.filter((i) => i.status === "active").length;

  const onOpenIntent = (intent: DCAIntent) => {
    // Navigate to vault dashboard to view intent details
    window.location.href = '#/vault';
  };

  const handleEnhancedSubmit = async () => {
    const newIntent: Intent = {
      id: enhancedIntents.length + 1,
      tokenIn: "USDC",
      tokenOut: "ETH",
      amount: 50,
      frequency: 60,
      createdAt: Math.floor(Date.now() / 1000),
    };

    setEnhancedIntents([...enhancedIntents, newIntent]);
  };

  const enhancedChartData = generateChartData(intents);

  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
      <div className="max-w-6xl mx-auto p-4">
        <div className="rounded-3xl p-6 bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/15 border dark:border-neutral-800">
          <div className="text-sm opacity-70">Privacy-Preserving Dollar-Cost Averaging</div>
          <h1 className="text-2xl md:text-3xl font-semibold mt-1">🔐 FHEVM DCA Bot</h1>
          <p className="mt-2 opacity-80 max-w-2xl text-sm">Submit encrypted DCA intents, monitor execution in real time, and maintain strategy privacy on-chain.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="rounded-2xl border dark:border-neutral-800 p-4 flex flex-col bg-white/60 dark:bg-white/5">
              <span className="text-xs opacity-60">Active Intents</span>
              <span className="text-xl font-semibold">{active}</span>
            </div>
            <div className="rounded-2xl border dark:border-neutral-800 p-4 flex flex-col bg-white/60 dark:bg-white/5">
              <span className="text-xs opacity-60">Total Budget (USDC)</span>
              <span className="text-xl font-semibold">${totalBudget.toLocaleString()}</span>
            </div>
            <div className="rounded-2xl border dark:border-neutral-800 p-4 flex flex-col bg-white/60 dark:bg-white/5">
              <span className="text-xs opacity-60">Network</span>
              <span className="text-xl font-semibold">Sepolia</span>
            </div>
            <div className="rounded-2xl border dark:border-neutral-800 p-4 flex flex-col bg-white/60 dark:bg-white/5">
              <span className="text-xs opacity-60">Anonymity</span>
              <span className="text-xl font-semibold">Batch-enabled</span>
            </div>
          </div>
        </div>

        {/* Enhanced DCA Bot Section */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">🔐 FHEVM DCA Bot</h3>
            <span className="text-sm opacity-70">Real-time DCA Management</span>
          </div>
          <FHEVMDcaBot />
        </section>

        {/* Enhanced Intent List */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Enhanced Intents</h3>
            <Button
              onClick={handleEnhancedSubmit}
              variant="outline"
              size="sm"
            >
              Add Intent
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enhancedIntents.map((intent) => {
              const nextExec = intent.createdAt + intent.frequency;
              return (
                <Card key={intent.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {intent.tokenIn} → {intent.tokenOut}
                      </CardTitle>
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">Active</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
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
                  </CardContent>
                </Card>
              );
            })}
            {enhancedIntents.length === 0 && (
              <div className="col-span-full text-center py-8">
                <div className="text-neutral-500 text-lg">No enhanced intents yet</div>
                <Button
                  onClick={handleEnhancedSubmit}
                  variant="primary"
                  className="mt-4"
                >
                  Create Your First Enhanced Intent
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Recent Intents Section */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Recent Intents</h3>
            <Link to="/vault" className="text-sm opacity-70 hover:opacity-100">Open Dashboard</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recent.length > 0 ? (
              recent.map((intent) => (
                <Card key={intent.id} className="flex-shrink-0 w-72">
                  <CardContent className="p-4">
                    <div className="text-sm opacity-60">Registry</div>
                    <div className="font-mono text-sm">{truncate(intent.registry, 6)}</div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div className="rounded-xl p-2 bg-emerald-500/10">
                        <div className="opacity-60">Budget</div>
                        <div className="font-semibold">${intent.totalBudget}</div>
                      </div>
                      <div className="rounded-xl p-2 bg-blue-500/10">
                        <div className="opacity-60">Per Interval</div>
                        <div className="font-semibold">${intent.perInterval}</div>
                      </div>
                    </div>
                    <Button
                      className="w-full mt-4"
                      variant="outline"
                      onClick={() => onOpenIntent(intent)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="w-full text-center py-8">
                <div className="text-neutral-500 text-lg">No intents yet</div>
                <Link to="/submit">
                  <Button
                    variant="primary"
                    className="mt-4"
                  >
                    Create Your First Intent
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Enhanced Chart Section */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">📊 Spend vs Remaining Chart</h3>
            <span className="text-sm opacity-70">Real-time data</span>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="h-64">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Spent area */}
                  <path
                    d={`M 0 100 ${enhancedChartData.map((d, i) => `L ${(i / (enhancedChartData.length - 1)) * 100} ${100 - (d.spent / Math.max(...enhancedChartData.map(x => x.spent + x.remaining))) * 100}`).join(' ')} L 100 100 Z`}
                    fill="url(#gSpent)"
                    opacity="0.6"
                  />
                  {/* Remaining area */}
                  <path
                    d={`M 0 100 ${enhancedChartData.map((d, i) => `L ${(i / (enhancedChartData.length - 1)) * 100} ${100 - (d.spent / Math.max(...enhancedChartData.map(x => x.spent + x.remaining))) * 100 - (d.remaining / Math.max(...enhancedChartData.map(x => x.spent + x.remaining))) * 100}`).join(' ')} L 100 100 Z`}
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
              <div className="flex justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                  <span>Spent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                  <span>Remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <footer className="max-w-6xl mx-auto p-4 opacity-70 text-xs">
        🔐 Built for FHEVM DCA • Replace mocks with on-chain reads/writes • © {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default HomePage;
