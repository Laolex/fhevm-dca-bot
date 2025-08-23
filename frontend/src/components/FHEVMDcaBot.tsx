import React, { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useIntentsStore } from '../hooks/useIntentsStore';
import { useToast } from '../contexts/ToastContext';
import { encryptAndSubmitIntent, generateChartData } from '../utils/fhe';
import { DCAIntent } from '../types/dca';
import Countdown from './Countdown';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Wallet, TrendingUp, Clock, Target } from 'lucide-react';

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
  const chartData = generateChartData(intents);

  // Countdown logic
  useEffect(() => {
    const timer = window.setInterval(() => {
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

    return () => window.clearInterval(timer);
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
        perInterval: amountPerInterval,
        interval,
        totalPeriods,
      });

      // Create new intent
      const newIntent: DCAIntent = {
        id: `intent-${Date.now()}`,
        user: "0x3F9D1D64CbbD69aBcB79faBD156817655b48050c",
        totalBudget,
        perInterval: amountPerInterval,
        interval,
        totalPeriods,
        executedPeriods: 0,
        createdAt: Date.now(),
        isActive: true,
        nextExecution: nextExecution,
        hasDynamicConditions: false
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
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            🔐 FHEVM DCA Bot
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Total Budget (USDC)</label>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Amount Per Interval (USDC)</label>
            <input
              type="number"
              value={amountPerInterval}
              onChange={(e) => setAmountPerInterval(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Interval (seconds)</label>
            <input
              type="number"
              value={interval}
              onChange={(e) => setInterval(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <small className="text-xs text-muted-foreground">86400 = Daily, 3600 = Hourly</small>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Total Periods</label>
            <input
              type="number"
              value={totalPeriods}
              onChange={(e) => setTotalPeriods(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={loading || !walletState.connected || !isCorrectNetwork}
            size="lg"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Encrypting & Submitting...
              </>
            ) : (
              <>
                <Wallet className="h-4 w-4" />
                🔐 Encrypt & Submit Intent
              </>
            )}
          </Button>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Next Execution:</span>
            <span className="font-semibold">{countdown}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Executions Done:</span>
            <span className="font-bold">{executions} / {totalPeriods}</span>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            📊 Spend vs Remaining
          </CardTitle>
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
