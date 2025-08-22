import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useIntentsStore } from '../hooks/useIntentsStore';
import { useToast } from '../contexts/ToastContext';
import { encryptAndSubmitIntent, generatePeriodChartData } from '../utils/fhe';
import { DCAIntent } from '../types/dca';
import Countdown from './Countdown';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface FHEVMDcaBotProps {
  className?: string;
}

const FHEVMDcaBot: React.FC<FHEVMDcaBotProps> = ({ className = '' }) => {
  const [totalBudget, setTotalBudget] = useState(1000);
  const [amountPerInterval, setAmountPerInterval] = useState(100);
  const [interval, setInterval] = useState(86400); // daily
  const [totalPeriods, setTotalPeriods] = useState(10);
  const [executions, setExecutions] = useState(0);
  const [nextExecution, setNextExecution] = useState(Date.now() + interval * 1000);
  const [countdown, setCountdown] = useState("");
  const [loading, setLoading] = useState(false);

  const { walletState, isCorrectNetwork } = useWallet();
  const { intents, setIntents } = useIntentsStore();
  const { showToast } = useToast();

  // Chart data
  const chartData = generatePeriodChartData(totalBudget, amountPerInterval, totalPeriods);

  // Countdown logic
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = nextExecution - Date.now();
      if (diff <= 0) {
        setCountdown("Executing...");
        setNextExecution(Date.now() + interval * 1000);
        setExecutions((e) => e + 1);
        showToast('DCA execution completed!', 'success');
      } else {
        const hrs = Math.floor(diff / 1000 / 3600);
        const mins = Math.floor((diff / 1000 % 3600) / 60);
        const secs = Math.floor(diff / 1000 % 60);
        setCountdown(`${hrs}h ${mins}m ${secs}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextExecution, interval, showToast]);

  const handleSubmit = async () => {
    if (!walletState.connected) {
      showToast('Please connect your wallet first', 'error');
      return;
    }

    if (!isCorrectNetwork) {
      showToast('Please switch to Sepolia network', 'error');
      return;
    }

    setLoading(true);
    try {
      await encryptAndSubmitIntent({
        totalBudget,
        amountPerInterval,
        interval,
        totalPeriods,
      });

      // Create new intent
      const newIntent: DCAIntent = {
        id: `intent-${Date.now()}`,
        registry: "0x3F9D1D64CbbD69aBcB79faBD156817655b48050c",
        totalBudget,
        perInterval: amountPerInterval,
        interval,
        totalPeriods,
        executed: 0,
        createdAt: Date.now(),
        status: "active",
        tokenIn: "USDC",
        tokenOut: "ETH",
        amount: amountPerInterval,
        frequency: interval,
        nextExecution: nextExecution,
      };

      setIntents([...intents, newIntent]);
      showToast('DCA intent submitted successfully!', 'success');
    } catch (error) {
      console.error('Submission failed:', error);
      showToast('Failed to submit DCA intent', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 grid grid-cols-1 gap-6 lg:grid-cols-2 ${className}`}>
      {/* Config + Actions */}
      <Card>
        <CardHeader>
          <CardTitle>🔐 FHEVM DCA Bot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <label className="text-sm font-medium">Interval (seconds)</label>
            <input
              type="number"
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="w-full rounded-xl border dark:border-neutral-700 p-3 bg-transparent"
            />
            <small className="text-xs opacity-70">86400 = Daily, 3600 = Hourly</small>
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

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading || !walletState.connected || !isCorrectNetwork}
            variant="primary"
            size="lg"
          >
            {loading ? "🔐 Encrypting & Submitting..." : "🔐 Encrypt & Submit Intent"}
          </Button>

          <div className="text-center text-sm opacity-70">
            Next Execution in: <span className="font-semibold">{countdown}</span>
          </div>
          <div className="text-center text-sm">
            Executions Done: <span className="font-bold">{executions}</span> / {totalPeriods}
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Spend vs Remaining</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Spent area */}
              <path
                d={`M 0 100 ${chartData.map((d, i) => `L ${(i / (chartData.length - 1)) * 100} ${100 - (d.spent / totalBudget) * 100}`).join(' ')} L 100 100 Z`}
                fill="url(#gSpent)"
                opacity="0.6"
              />
              {/* Remaining area */}
              <path
                d={`M 0 100 ${chartData.map((d, i) => `L ${(i / (chartData.length - 1)) * 100} ${100 - (d.spent / totalBudget) * 100 - (d.remaining / totalBudget) * 100}`).join(' ')} L 100 100 Z`}
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
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Spent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FHEVMDcaBot;
