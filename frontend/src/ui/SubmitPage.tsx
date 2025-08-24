import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import {
  DollarSign,
  Clock,
  Target,
  TrendingDown,
  Zap,
  Shield,
  Lock,
  ArrowRight,
  Info,
  Wallet,
  CheckCircle,
  BarChart3,
  Loader2,
  Settings,
  Sparkles,
  Eye,
  EyeOff
} from 'lucide-react';
import { useService } from '../contexts/ServiceContext';
import { DynamicConditions } from '../types/dca';
import { useToast } from '../contexts/ToastContext';
import { Link, useNavigate } from 'react-router-dom';
import { ModernCard, StatsCard, FeatureCard, ActionCard } from '../components/ui/modern-card';

const SubmitPage: React.FC = () => {
  const { service } = useService();
  const [totalBudget, setTotalBudget] = useState('');
  const [amountPerInterval, setAmountPerInterval] = useState('');
  const [intervalSeconds, setIntervalSeconds] = useState('3600'); // 1 hour default
  const [totalPeriods, setTotalPeriods] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dynamicConditions, setDynamicConditions] = useState<DynamicConditions>({
    enabled: false,
    dipThreshold: 300, // 3% in basis points
    dipMultiplier: 2.0,
    dipRemainingBuys: 5
  });

  const [batchInfo, setBatchInfo] = useState({
    participantCount: 0,
    timeUntilExecution: 0,
    targetSize: 10,
    isExecuted: false
  });
  const [userBalance, setUserBalance] = useState<string>('0.00');
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedTxHash, setSubmittedTxHash] = useState<string>('');

  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadBatchInfo();
    loadUserBalance();
  }, []);

  const loadBatchInfo = async () => {
    try {
      if (!service) {
        throw new Error('Service not initialized');
      }
      
      // Try to load real batch info first
      const config = await service.getBatchConfig();
      const currentBatch = await service.getCurrentBatchInfo();

      setBatchInfo({
        participantCount: currentBatch.participantCount,
        timeUntilExecution: currentBatch.timeUntilExecution,
        targetSize: config.targetSize,
        isExecuted: currentBatch.isExecuted
      });
    } catch (error) {
      console.log('Using demo batch info:', error);

      // Demo mode - simulate batch info
      const demoIntents = JSON.parse(localStorage.getItem('dcaIntents') || '[]');
      const activeIntents = demoIntents.filter((intent: any) => intent.status === 'active');

      setBatchInfo({
        participantCount: activeIntents.length,
        timeUntilExecution: Math.max(0, 300 - (Date.now() % 300)), // Random time between 0-5 minutes
        targetSize: 10,
        isExecuted: false
      });
    }
  };

  const loadUserBalance = async () => {
    setIsLoadingBalance(true);
    try {
      if (!service) {
        throw new Error('Service not initialized');
      }
      
      const balance = await service.getUSDCBalance();
      setUserBalance(balance);
    } catch (error) {
      console.error('Error loading balance:', error);
      setUserBalance('0.00');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const isFormValid = () => {
    return (
      totalBudget &&
      amountPerInterval &&
      intervalSeconds &&
      totalPeriods &&
      parseFloat(totalBudget) > 0 &&
      parseFloat(amountPerInterval) > 0 &&
      parseInt(intervalSeconds) > 0 &&
      parseInt(totalPeriods) > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) {
      showToast('Please fill in all required fields with valid values.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (!service) {
        throw new Error('Service not initialized');
      }
      
      console.log('SubmitPage: Starting submission process');
      console.log('SubmitPage: Form values:', {
        totalBudget,
        amountPerInterval,
        intervalSeconds,
        totalPeriods,
        dynamicConditions
      });
      
      // Submit intent using the real service
      const txHash = await service.submitDCAIntent(
        parseFloat(totalBudget),
        parseFloat(amountPerInterval),
        parseInt(intervalSeconds),
        parseInt(totalPeriods),
        dynamicConditions.enabled ? dynamicConditions : undefined
      );

      setSubmittedTxHash(txHash);
      setShowSuccessModal(true);
      showToast('DCA Intent submitted successfully!', 'success');
      
      // Store in localStorage for demo tracking
      const newIntent = {
        id: Date.now().toString(),
        txHash: txHash,
        totalBudget: parseFloat(totalBudget),
        amountPerInterval: parseFloat(amountPerInterval),
        intervalSeconds: parseInt(intervalSeconds),
        totalPeriods: parseInt(totalPeriods),
        dynamicConditions,
        status: 'active',
        submittedAt: new Date().toISOString(),
        executedPeriods: 0
      };
      
      const existingIntents = JSON.parse(localStorage.getItem('dcaIntents') || '[]');
      existingIntents.push(newIntent);
      localStorage.setItem('dcaIntents', JSON.stringify(existingIntents));
      
    } catch (error) {
      console.error('Error submitting intent:', error);
      showToast('Error submitting intent. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIntervalLabel = (seconds: number) => {
    switch (seconds) {
      case 300: return '5 minutes';
      case 900: return '15 minutes';
      case 1800: return '30 minutes';
      case 3600: return '1 hour';
      case 7200: return '2 hours';
      case 86400: return '1 day';
      case 604800: return '1 week';
      default: return `${seconds} seconds`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-200/50 dark:border-emerald-700/50 rounded-full backdrop-blur-sm">
            <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              Live on Sepolia Testnet
            </span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
            Submit DCA Intent
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Configure your encrypted Dollar-Cost Averaging strategy with privacy-preserving FHE technology
          </p>
        </div>

        {/* Balance Display */}
        <div className="flex justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <StatsCard
            title="Available Balance"
            value={isLoadingBalance ? 'Loading...' : `$${userBalance} USDC`}
            icon={<Wallet className="h-6 w-6 text-emerald-600" />}
            trend={{ value: 'Live', isPositive: true }}
            className="max-w-md"
          />
        </div>

        {/* Main Form */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <ModernCard variant="glass" className="p-8">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Configure Your Strategy
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Set up your encrypted DCA parameters
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Budget Configuration */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="totalBudget" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total Budget (USDC)
                      </Label>
                      <Input
                        id="totalBudget"
                        type="number"
                        value={totalBudget}
                        onChange={(e) => setTotalBudget(e.target.value)}
                        placeholder="1000"
                        className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amountPerInterval" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Amount per Interval (USDC)
                      </Label>
                      <Input
                        id="amountPerInterval"
                        type="number"
                        value={amountPerInterval}
                        onChange={(e) => setAmountPerInterval(e.target.value)}
                        placeholder="100"
                        className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Timing Configuration */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="intervalSeconds" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Interval
                      </Label>
                      <select
                        id="intervalSeconds"
                        value={intervalSeconds}
                        onChange={(e) => setIntervalSeconds(e.target.value)}
                        className="w-full px-3 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md focus:border-blue-500 focus:ring-blue-500"
                        required
                      >
                        <option value="300">5 minutes</option>
                        <option value="900">15 minutes</option>
                        <option value="1800">30 minutes</option>
                        <option value="3600">1 hour</option>
                        <option value="7200">2 hours</option>
                        <option value="86400">1 day</option>
                        <option value="604800">1 week</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalPeriods" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Total Periods
                      </Label>
                      <Input
                        id="totalPeriods"
                        type="number"
                        value={totalPeriods}
                        onChange={(e) => setTotalPeriods(e.target.value)}
                        placeholder="10"
                        className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Dynamic Conditions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Dynamic Conditions
                        </Label>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Automatically adjust buying during market dips
                        </p>
                      </div>
                      <Switch
                        checked={dynamicConditions.enabled}
                        onCheckedChange={(checked) => 
                          setDynamicConditions(prev => ({ ...prev, enabled: checked }))
                        }
                      />
                    </div>

                    {dynamicConditions.enabled && (
                      <div className="grid md:grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            Dip Threshold (%)
                          </Label>
                          <Input
                            type="number"
                            value={dynamicConditions.dipThreshold / 100}
                            onChange={(e) => 
                              setDynamicConditions(prev => ({ 
                                ...prev, 
                                dipThreshold: parseFloat(e.target.value) * 100 
                              }))
                            }
                            className="bg-white/50 dark:bg-gray-800/50 border-blue-200 dark:border-blue-700"
                            placeholder="3"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            Multiplier
                          </Label>
                          <Input
                            type="number"
                            value={dynamicConditions.dipMultiplier}
                            onChange={(e) => 
                              setDynamicConditions(prev => ({ 
                                ...prev, 
                                dipMultiplier: parseFloat(e.target.value) 
                              }))
                            }
                            className="bg-white/50 dark:bg-gray-800/50 border-blue-200 dark:border-blue-700"
                            placeholder="2.0"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium text-blue-700 dark:text-blue-300">
                            Remaining Buys
                          </Label>
                          <Input
                            type="number"
                            value={dynamicConditions.dipRemainingBuys}
                            onChange={(e) => 
                              setDynamicConditions(prev => ({ 
                                ...prev, 
                                dipRemainingBuys: parseInt(e.target.value) 
                              }))
                            }
                            className="bg-white/50 dark:bg-gray-800/50 border-blue-200 dark:border-blue-700"
                            placeholder="5"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      <span>Submit Encrypted DCA Intent</span>
                    )}
                  </Button>
                </form>
              </div>
            </ModernCard>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {/* Batch Info */}
            <StatsCard
              title="Current Batch"
              value={`${batchInfo.participantCount}/${batchInfo.targetSize} participants`}
              icon={<BarChart3 className="h-6 w-6 text-blue-600" />}
              trend={{ value: `${Math.floor(batchInfo.timeUntilExecution / 60)}m left`, isPositive: true }}
            />

            {/* Features */}
            <div className="space-y-4">
              <FeatureCard
                icon={<Lock className="h-6 w-6 text-purple-600" />}
                title="Privacy Preserved"
                description="All parameters are encrypted using FHE technology"
                className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-200/50 dark:border-purple-700/50"
              />
              
              <FeatureCard
                icon={<Zap className="h-6 w-6 text-blue-600" />}
                title="Automated Execution"
                description="Batches execute automatically on schedule"
                className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-200/50 dark:border-blue-700/50"
              />
              
              <FeatureCard
                icon={<TrendingDown className="h-6 w-6 text-emerald-600" />}
                title="Smart DCA"
                description="Dynamic conditions for optimal buying"
                className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-200/50 dark:border-emerald-700/50"
              />
            </div>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fade-in">
            <ModernCard variant="glass" className="max-w-md p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-emerald-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Intent Submitted!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Your encrypted DCA intent has been successfully submitted to the network.
                </p>
              </div>
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Transaction Hash</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-gray-100 break-all">
                    {submittedTxHash}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowSuccessModal(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => navigate('/vault')}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    View Vault
                  </Button>
                </div>
              </div>
            </ModernCard>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitPage;

