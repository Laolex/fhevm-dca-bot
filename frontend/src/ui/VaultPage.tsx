import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
  Gift
} from 'lucide-react';
import { fhevmService } from '../services/fhevmService';
import { BatchInfo, BatchConfig, DCAIntent } from '../types/dca';

const VaultPage: React.FC = () => {
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
      // Try to load real balances first
      const usdcBalance = await fhevmService.getUSDCBalance();
      const wethBalance = await fhevmService.getWETHBalance();
      const vaultBalance = await fhevmService.getVaultBalance();
      const rewardVaultBalance = await fhevmService.getRewardVaultBalance();

      setBalances({
        usdc: usdcBalance,
        weth: wethBalance,
        vault: vaultBalance,
        rewardVault: rewardVaultBalance
      });

      // Try to load real batch information first
      const currentBatch = await fhevmService.getCurrentBatchInfo();
      const config = await fhevmService.getBatchConfig();

      setBatchInfo(currentBatch);
      setBatchConfig(config);

      // Load user intent (if connected)
      if (fhevmService.isConnected()) {
        const address = await fhevmService.getConnectedAddress();
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
        usdc: (Math.random() * 10000).toFixed(2),
        weth: (Math.random() * 5).toFixed(4),
        vault: (Math.random() * 5000).toFixed(2),
        rewardVault: (Math.random() * 100).toFixed(2)
      });

      // Demo mode - simulate vault data
      const demoIntents = JSON.parse(localStorage.getItem('dcaIntents') || '[]');
      const activeIntents = demoIntents.filter((intent: any) =>
        intent.status === 'active' // Filter active intents
      );

      // Mock batch info
      setBatchInfo({
        batchId: 1,
        participantCount: activeIntents.length,
        totalAmount: 0, // Encrypted, not revealed
        batchDeadline: Date.now() / 1000 + 300, // 5 minutes from now
        isExecuted: false,
        participants: activeIntents.map((intent: any) => `0x${Math.random().toString(16).substr(2, 40)}`),
        createdAt: Date.now(),
        timeUntilExecution: 300
      });

      setBatchConfig({
        targetSize: 10,
        timeout: 300,
        minSize: 3,
        maxSize: 20
      });

      // Mock user intent from localStorage
      if (activeIntents.length > 0) {
        const latestIntent = activeIntents[activeIntents.length - 1];
        setUserIntent({
          id: latestIntent.id,
          user: '0x' + Math.random().toString(16).substr(2, 40),
          totalBudget: latestIntent.totalBudget,
          perInterval: latestIntent.amountPerInterval,
          interval: latestIntent.intervalSeconds,
          totalPeriods: latestIntent.totalPeriods,
          executedPeriods: latestIntent.executedPeriods || 0,
          nextExecution: Date.now() / 1000 + Math.random() * 3600,
          isActive: latestIntent.status === 'active',
          createdAt: new Date(latestIntent.submittedAt).getTime(),
          hasDynamicConditions: !!latestIntent.dynamicConditions
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteBatch = async () => {
    setIsExecuting(true);
    try {
      // Try to execute real batch first
      const txHash = await fhevmService.executeBatch();
      alert(`Batch executed successfully! Transaction: ${txHash}`);

      // Reload data
      await loadVaultData();
    } catch (error) {
      console.log('Using demo execute batch:', error);

      // Demo mode - simulate batch execution
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate network delay

      // Generate mock transaction hash
      const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);

      // Update batch status
      if (batchInfo) {
        setBatchInfo({
          ...batchInfo,
          isExecuted: true,
          timeUntilExecution: 0
        });
      }

      alert(`Demo: Batch executed successfully! Transaction: ${mockTxHash}`);

      // Reload data
      await loadVaultData();
    } finally {
      setIsExecuting(false);
    }
  };

  const handleDeactivateIntent = async () => {
    try {
      // Try to deactivate real intent first
      const txHash = await fhevmService.deactivateIntent();
      alert(`Intent deactivated successfully! Transaction: ${txHash}`);
      setUserIntent(null);
    } catch (error) {
      console.log('Using demo deactivate intent:', error);

      // Demo mode - simulate deactivation
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      // Remove from localStorage
      const demoIntents = JSON.parse(localStorage.getItem('dcaIntents') || '[]');
      const updatedIntents = demoIntents.map((intent: any) =>
        intent.id === userIntent?.id
          ? { ...intent, status: 'inactive' }
          : intent
      );
      localStorage.setItem('dcaIntents', JSON.stringify(updatedIntents));

      alert('Demo: Intent deactivated successfully!');
      setUserIntent(null);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeUntilExecution = (timestamp: number) => {
    const now = Date.now() / 1000;
    const diff = timestamp - now;
    if (diff <= 0) return 'Ready to execute';
    return formatTime(diff);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 dark:from-yellow-400 dark:to-yellow-600 bg-clip-text text-transparent mb-4" style={{ background: 'linear-gradient(to right, #d97706, #92400e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Vault Dashboard
          </h1>
          <p className="text-lg text-muted-foreground">
            Monitor your encrypted DCA intents and vault balances
          </p>
        </div>

        {/* Vault Balances */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-yellow-200 bg-yellow-50/30 dark:border-yellow-800 dark:bg-yellow-950/10" style={{ borderColor: '#fbbf24', backgroundColor: '#fef3c7' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300" style={{ color: '#d97706' }}>
                USDC Balance
              </CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" style={{ color: '#d97706' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" style={{ color: '#d97706' }}>
                ${balances.usdc}
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50/30 dark:border-yellow-800 dark:bg-yellow-950/10" style={{ borderColor: '#fbbf24', backgroundColor: '#fef3c7' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300" style={{ color: '#d97706' }}>
                WETH Balance
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-600" style={{ color: '#d97706' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" style={{ color: '#d97706' }}>
                {balances.weth}
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50/30 dark:border-yellow-800 dark:bg-yellow-950/10" style={{ borderColor: '#fbbf24', backgroundColor: '#fef3c7' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300" style={{ color: '#d97706' }}>
                Vault Balance
              </CardTitle>
              <Vault className="h-4 w-4 text-yellow-600" style={{ color: '#d97706' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" style={{ color: '#d97706' }}>
                ${balances.vault}
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50/30 dark:border-yellow-800 dark:bg-yellow-950/10" style={{ borderColor: '#fbbf24', backgroundColor: '#fef3c7' }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300" style={{ color: '#d97706' }}>
                Rewards
              </CardTitle>
              <Gift className="h-4 w-4 text-yellow-600" style={{ color: '#d97706' }} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600" style={{ color: '#d97706' }}>
                ${balances.rewardVault}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Batch Status Overview */}
        {batchInfo && batchConfig && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Current Batch Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Participants</p>
                  <p className="text-2xl font-bold text-primary">
                    {batchInfo.participantCount} / {batchConfig.targetSize}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((batchInfo.participantCount / batchConfig.targetSize) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Time Until Execution</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatTime(batchInfo.timeUntilExecution)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Batch Status</p>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    {batchInfo.isExecuted ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-green-600 font-semibold">Executed</span>
                      </>
                    ) : batchInfo.participantCount >= batchConfig.targetSize ? (
                      <>
                        <Play className="h-5 w-5 text-blue-600" />
                        <span className="text-blue-600 font-semibold">Ready</span>
                      </>
                    ) : (
                      <>
                        <Timer className="h-5 w-5 text-yellow-600" />
                        <span className="text-yellow-600 font-semibold">Waiting</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Actions</p>
                  <Button
                    onClick={handleExecuteBatch}
                    disabled={isExecuting || batchInfo.isExecuted || batchInfo.participantCount < batchConfig.minSize}
                    size="sm"
                    className="mt-2"
                  >
                    {isExecuting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-1" />
                        Execute
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User's DCA Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Your DCA Strategy
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userIntent ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Budget</p>
                      <p className="text-lg font-semibold">${userIntent.totalBudget} USDC</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Per Purchase</p>
                      <p className="text-lg font-semibold">${userIntent.perInterval} USDC</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-lg font-semibold">
                        {userIntent.executedPeriods} / {userIntent.totalPeriods}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Next Execution</p>
                      <p className="text-lg font-semibold">
                        {formatTimeUntilExecution(userIntent.nextExecution)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round((userIntent.executedPeriods / userIntent.totalPeriods) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(userIntent.executedPeriods / userIntent.totalPeriods) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Dynamic Conditions */}
                  {userIntent.hasDynamicConditions && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-blue-900 dark:text-blue-100">
                          Dynamic Conditions Active
                        </span>
                      </div>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Your strategy includes buy-the-dip logic that automatically increases
                        purchase amounts when ETH price drops.
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleDeactivateIntent}
                    variant="outline"
                    className="w-full"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    Deactivate Strategy
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No active DCA strategy</p>
                  <Button asChild>
                    <a href="/submit">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Strategy
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Batch Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Batch Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              {batchConfig ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Target Size</p>
                      <p className="text-lg font-semibold">{batchConfig.targetSize} users</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Min Size</p>
                      <p className="text-lg font-semibold">{batchConfig.minSize} users</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Max Size</p>
                      <p className="text-lg font-semibold">{batchConfig.maxSize} users</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Timeout</p>
                      <p className="text-lg font-semibold">{formatTime(batchConfig.timeout)}</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-900 dark:text-yellow-100">
                          Batch Execution Triggers
                        </p>
                        <ul className="text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                          <li>• Primary: {batchConfig.targetSize} users submit intents</li>
                          <li>• Fallback: {formatTime(batchConfig.timeout)} timeout</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Loading configuration...</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Privacy & Security Info */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100">
                  Privacy & Security Features
                </h4>
                <ul className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-1">
                  <li>• All DCA parameters are encrypted using FHE</li>
                  <li>• Individual amounts remain private during batching</li>
                  <li>• Proportional token distribution using encrypted calculations</li>
                  <li>• Decentralized execution with Chainlink Automation</li>
                  <li>• Single DEX swap per batch for efficiency</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VaultPage;
