import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import {
  Wallet,
  DollarSign,
  TrendingUp,
  Clock,
  Target,
  Loader2,
  BarChart3,
  ArrowRight,
  Plus,
  Shield,
  Lock,
  Users,
  Timer,
  Zap,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  TrendingDown,
  Vault,
  Gift,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { useService } from '../contexts/ServiceContext';
import { BatchInfo, BatchConfig, DCAIntent } from '../types/dca';
import { ModernCard, StatsCard, FeatureCard, ActionCard } from '../components/ui/modern-card';
import { Link } from 'react-router-dom';

const VaultPage: React.FC = () => {
  const { service } = useService();
  const [isLoading, setIsLoading] = useState(true);
  const [batchInfo, setBatchInfo] = useState<BatchInfo | null>(null);
  const [batchConfig, setBatchConfig] = useState<BatchConfig | null>(null);
  const [userIntent, setUserIntent] = useState<DCAIntent | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [balances, setBalances] = useState({
    usdc: '0.00',
    weth: '0.0000',
    vault: '0.00',
    rewardVault: '0.00'
  });

  useEffect(() => {
    loadVaultData();
  }, []);

  const loadVaultData = async () => {
    setIsLoading(true);
    try {
      if (!service) {
        throw new Error('Service not initialized');
      }

      // Try to load real balances first
      const usdcBalance = await service.getUSDCBalance();
      const wethBalance = await service.getWETHBalance();
      const vaultBalance = await service.getVaultBalance();
      const rewardVaultBalance = await service.getRewardVaultBalance();

      setBalances({
        usdc: usdcBalance,
        weth: wethBalance,
        vault: vaultBalance,
        rewardVault: rewardVaultBalance
      });

      // Try to load real batch information first
      const currentBatch = await service.getCurrentBatchInfo();
      const config = await service.getBatchConfig();

      setBatchInfo(currentBatch);
      setBatchConfig(config);

      // Load user intent (if connected)
      if (service.isConnected()) {
        const address = await service.getConnectedAddress();
        if (address) {
          // In a real implementation, you'd fetch the actual intent
          // For now, we'll use mock data
          setUserIntent({
            id: '1',
            user: address,
            totalBudget: 5000,
            perInterval: 100,
            interval: 3600,
            totalPeriods: 24,
            executedPeriods: 5,
            nextExecution: Date.now() / 1000 + 1800,
            isActive: true,
            createdAt: Date.now() - 86400000,
            hasDynamicConditions: true
          });
        }
      }
    } catch (error) {
      console.log('Using demo vault data:', error);

      // Demo mode - simulate balances
      setBalances({
        usdc: '1250.50',
        weth: '0.8500',
        vault: '500.00',
        rewardVault: '25.75'
      });

      // Demo batch info
      setBatchInfo({
        batchId: 1,
        participantCount: 8,
        totalAmount: 5000,
        batchDeadline: Date.now() + 1800000,
        isExecuted: false,
        participants: [],
        createdAt: Date.now() - 3600000,
        timeUntilExecution: 1800
      });

      setBatchConfig({
        targetSize: 10,
        timeout: 3600,
        minSize: 100,
        maxSize: 1000
      });

      // Demo user intent
      setUserIntent({
        id: '1',
        user: '0x1234...5678',
        totalBudget: 5000,
        perInterval: 100,
        interval: 3600,
        totalPeriods: 24,
        executedPeriods: 5,
        nextExecution: Date.now() / 1000 + 1800,
        isActive: true,
        createdAt: Date.now() - 86400000,
        hasDynamicConditions: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteBatch = async () => {
    setIsExecuting(true);
    try {
      if (!service) {
        throw new Error('Service not initialized');
      }

      const txHash = await service.executeBatch();
      console.log('Batch executed:', txHash);
      // Reload data after execution
      await loadVaultData();
    } catch (error) {
      console.error('Error executing batch:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDeactivateIntent = async () => {
    try {
      if (!service || !userIntent) {
        throw new Error('Service not initialized or no intent found');
      }

      const txHash = await service.deactivateIntent();
      console.log('Intent deactivated:', txHash);
      setUserIntent(null);
    } catch (error) {
      console.error('Error deactivating intent:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const formatCurrency = (amount: string, symbol: string = 'USDC') => {
    const num = parseFloat(amount);
    if (isNaN(num)) return `0.00 ${symbol}`;
    return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} ${symbol}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="text-gray-600 dark:text-gray-400">Loading vault data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200/50 dark:border-purple-700/50 rounded-full backdrop-blur-sm">
            <Vault className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Vault Dashboard
            </span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-900 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
            Vault Overview
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Monitor your encrypted DCA strategies and vault balances in real-time
          </p>
        </div>

        {/* Balance Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <StatsCard
            title="USDC Balance"
            value={formatCurrency(balances.usdc, 'USDC')}
            icon={<DollarSign className="h-6 w-6 text-emerald-600" />}
            trend={{ value: 'Available', isPositive: true }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200/50 dark:border-green-700/50"
          />

          <StatsCard
            title="WETH Balance"
            value={formatCurrency(balances.weth, 'WETH')}
            icon={<TrendingUp className="h-6 w-6 text-orange-600" />}
            trend={{ value: 'Accumulated', isPositive: true }}
            className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200/50 dark:border-orange-700/50"
          />

          <StatsCard
            title="Vault Balance"
            value={formatCurrency(balances.vault, 'USDC')}
            icon={<Shield className="h-6 w-6 text-blue-600" />}
            trend={{ value: 'Locked', isPositive: true }}
            className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-200/50 dark:border-blue-700/50"
          />

          <StatsCard
            title="Rewards"
            value={formatCurrency(balances.rewardVault, 'USDC')}
            icon={<Gift className="h-6 w-6 text-purple-600" />}
            trend={{ value: 'Earned', isPositive: true }}
            className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/50 dark:border-purple-700/50"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Batch Information */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <ModernCard variant="glass" className="p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      Current Batch
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">
                      Real-time batch execution status
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${batchInfo?.isExecuted ? 'bg-emerald-500' : 'bg-yellow-500 animate-pulse'}`} />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {batchInfo?.isExecuted ? 'Executed' : 'Pending'}
                    </span>
                  </div>
                </div>

                {batchInfo && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {batchInfo.participantCount}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Participants
                      </div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-200/50 dark:border-emerald-700/50">
                      <DollarSign className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        ${batchInfo.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Total Amount
                      </div>
                    </div>

                    <div className="text-center p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl border border-orange-200/50 dark:border-orange-700/50">
                      <Timer className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {formatTime(batchInfo.timeUntilExecution)}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Time Remaining
                      </div>
                    </div>
                  </div>
                )}

                {batchConfig && (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Batch Configuration
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Target Size:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{batchConfig.targetSize}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Min Size:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">${batchConfig.minSize}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Max Size:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">${batchConfig.maxSize}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-400">Timeout:</span>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{formatTime(batchConfig.timeout)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Actions
                      </h3>
                      <div className="space-y-3">
                        <Button
                          onClick={handleExecuteBatch}
                          disabled={isExecuting || batchInfo?.isExecuted || (batchInfo?.participantCount || 0) < (batchConfig?.targetSize || 0)}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
                        >
                          {isExecuting ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Executing...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              <span>Execute Batch</span>
                            </div>
                          )}
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => window.location.reload()}
                        >
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            <span>Refresh Data</span>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ModernCard>
          </div>

          {/* User Intent Sidebar */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {userIntent ? (
              <ModernCard variant="glass" className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Your DCA Intent
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${userIntent.isActive
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
                      }`}>
                      {userIntent.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Budget:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">${userIntent.totalBudget}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Per Interval:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">${userIntent.perInterval}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Progress:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {userIntent.executedPeriods}/{userIntent.totalPeriods}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Next Execution:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatTime(Math.max(0, userIntent.nextExecution - Date.now() / 1000))}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      onClick={handleDeactivateIntent}
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:border-red-700 dark:hover:bg-red-950/20"
                    >
                      <div className="flex items-center gap-2">
                        <Pause className="h-4 w-4" />
                        <span>Deactivate Intent</span>
                      </div>
                    </Button>
                  </div>
                </div>
              </ModernCard>
            ) : (
              <ModernCard variant="glass" className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-200/50 dark:border-blue-700/50">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                    <Plus className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No Active Intent</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      You don't have any active DCA intents. Create one to start dollar-cost averaging.
                    </p>
                  </div>
                  <Button asChild className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Link to="/submit">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Intent
                    </Link>
                  </Button>
                </div>
              </ModernCard>
            )}

            {/* Features */}
            <div className="space-y-4">
              <FeatureCard
                icon={<Shield className="h-6 w-6 text-emerald-600" />}
                title="Secure Vault"
                description="All funds are secured in smart contracts with FHE encryption"
                className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200/50 dark:border-emerald-700/50"
              />

              <FeatureCard
                icon={<Zap className="h-6 w-6 text-purple-600" />}
                title="Automated Execution"
                description="Batches execute automatically when conditions are met"
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/50 dark:border-purple-700/50"
              />

              <FeatureCard
                icon={<Gift className="h-6 w-6 text-orange-600" />}
                title="Rewards System"
                description="Earn rewards for participating in batch executions"
                className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-200/50 dark:border-orange-700/50"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaultPage;
