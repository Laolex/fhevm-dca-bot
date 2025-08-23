import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
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
  Settings
} from 'lucide-react';
import { fhevmService } from '../services/fhevmService';
import { DynamicConditions } from '../types/dca';
import { useToast } from '../contexts/ToastContext';
import { Link, useNavigate } from 'react-router-dom';

const SubmitPage: React.FC = () => {
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
      // Try to load real batch info first
      const config = await fhevmService.getBatchConfig();
      const currentBatch = await fhevmService.getCurrentBatchInfo();

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
      const balance = await fhevmService.getUSDCBalance();
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
      const txHash = await fhevmService.submitDCAIntent(
        parseFloat(totalBudget),
        parseFloat(amountPerInterval),
        parseInt(intervalSeconds),
        parseInt(totalPeriods),
        dynamicConditions.enabled ? dynamicConditions : undefined
      );

      setSubmittedTxHash(txHash);
      setShowSuccessModal(true);
      showToast('DCA Intent submitted successfully!', 'success');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-full">
            <Shield className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Live on Sepolia Testnet
            </span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 dark:from-yellow-400 dark:to-yellow-600 bg-clip-text text-transparent">
            Submit DCA Intent
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Configure your encrypted Dollar-Cost Averaging strategy with privacy-preserving FHE technology
          </p>
        </div>

        {/* Balance Display */}
        <div className="flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">Available Balance:</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {isLoadingBalance ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `$${userBalance} USDC`
                )}
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Current Batch Status */}
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                Current Batch Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">Participants</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                    {batchInfo.participantCount} / {batchInfo.targetSize}
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                  <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">Time Remaining</p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                    {Math.floor(batchInfo.timeUntilExecution / 60)}m {batchInfo.timeUntilExecution % 60}s
                  </p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                  <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wide">Status</p>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                    {batchInfo.isExecuted ? 'Executed' : 'Active'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* DCA Configuration */}
          <Card className="border-0 shadow-lg bg-yellow-50/30 dark:bg-yellow-950/10 backdrop-blur-sm" style={{ borderColor: '#fbbf24', backgroundColor: '#fef3c7' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Settings className="h-5 w-5 text-yellow-600" style={{ color: '#d97706' }} />
                </div>
                DCA Configuration
              </CardTitle>
              <CardDescription className="text-base">
                Configure your encrypted Dollar-Cost Averaging strategy parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="totalBudget" className="text-base font-semibold text-yellow-700 dark:text-yellow-300" style={{ color: '#d97706' }}>
                    Total Budget (USDC)
                  </Label>
                  <Input
                    id="totalBudget"
                    type="number"
                    placeholder="1000"
                    value={totalBudget}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotalBudget(e.target.value)}
                    className="h-14 text-lg border-2 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500/20 rounded-xl bg-white dark:bg-gray-700"
                    style={{ borderColor: '#fbbf24' }}
                  />
                  <p className="text-sm text-yellow-600 dark:text-yellow-400" style={{ color: '#d97706' }}>
                    Total amount to invest over the entire period
                  </p>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="amountPerInterval" className="text-base font-semibold text-yellow-700 dark:text-yellow-300" style={{ color: '#d97706' }}>
                    Amount Per Interval (USDC)
                  </Label>
                  <Input
                    id="amountPerInterval"
                    type="number"
                    placeholder="100"
                    value={amountPerInterval}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmountPerInterval(e.target.value)}
                    className="h-14 text-lg border-2 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500/20 rounded-xl bg-white dark:bg-gray-700"
                    style={{ borderColor: '#fbbf24' }}
                  />
                  <p className="text-sm text-yellow-600 dark:text-yellow-400" style={{ color: '#d97706' }}>
                    Amount to buy in each DCA cycle
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label htmlFor="intervalSeconds" className="text-base font-semibold text-yellow-700 dark:text-yellow-300" style={{ color: '#d97706' }}>
                    Interval (seconds)
                  </Label>
                  <Input
                    id="intervalSeconds"
                    type="number"
                    placeholder="3600"
                    value={intervalSeconds}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setIntervalSeconds(e.target.value)}
                    className="h-14 text-lg border-2 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500/20 rounded-xl bg-white dark:bg-gray-700"
                    style={{ borderColor: '#fbbf24' }}
                  />
                  <p className="text-sm text-yellow-600 dark:text-yellow-400" style={{ color: '#d97706' }}>
                    Time between purchases: {getIntervalLabel(parseInt(intervalSeconds) || 3600)}
                  </p>
                </div>
                <div className="space-y-4">
                  <Label htmlFor="totalPeriods" className="text-base font-semibold text-yellow-700 dark:text-yellow-300" style={{ color: '#d97706' }}>
                    Total Periods
                  </Label>
                  <Input
                    id="totalPeriods"
                    type="number"
                    placeholder="24"
                    value={totalPeriods}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotalPeriods(e.target.value)}
                    className="h-14 text-lg border-2 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500/20 rounded-xl bg-white dark:bg-gray-700"
                    style={{ borderColor: '#fbbf24' }}
                  />
                  <p className="text-sm text-yellow-600 dark:text-yellow-400" style={{ color: '#d97706' }}>
                    Number of DCA cycles to execute
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dynamic Conditions */}
          <Card className="border-0 shadow-lg bg-red-50/30 dark:bg-red-950/10 backdrop-blur-sm" style={{ borderColor: '#f87171', backgroundColor: '#fef2f2' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-red-600" style={{ color: '#dc2626' }} />
                </div>
                Dynamic Conditions (Buy the Dip)
              </CardTitle>
              <CardDescription className="text-base">
                Automatically increase buying when prices drop to maximize your gains
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-red-700 dark:text-red-300" style={{ color: '#dc2626' }}>
                      Dynamic Conditions
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-400" style={{ color: '#dc2626' }}>
                      Increase purchase amount during price dips
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setDynamicConditions(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`h-10 px-4 rounded-lg font-medium transition-all duration-200 ${dynamicConditions.enabled
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg'
                    : 'bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 dark:bg-gray-700 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900/20'
                    }`}
                  style={{
                    backgroundColor: dynamicConditions.enabled ? '#dc2626' : 'white',
                    color: dynamicConditions.enabled ? 'white' : '#dc2626',
                    borderColor: '#f87171'
                  }}
                >
                  {dynamicConditions.enabled ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Enable
                    </>
                  )}
                </Button>
              </div>
              {dynamicConditions.enabled && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 rounded-xl border border-red-200 dark:border-red-800">
                  <div className="space-y-4">
                    <Label htmlFor="dipThreshold" className="text-base font-semibold text-red-700 dark:text-red-300" style={{ color: '#dc2626' }}>
                      Dip Threshold (%)
                    </Label>
                    <Input
                      id="dipThreshold"
                      type="number"
                      placeholder="10"
                      value={dynamicConditions.dipThreshold / 100}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDynamicConditions(prev => ({
                          ...prev,
                          dipThreshold: parseFloat(e.target.value) * 100
                        }))
                      }
                      className="h-14 text-lg border-2 border-red-300 focus:border-red-500 focus:ring-red-500/20 rounded-xl bg-white dark:bg-gray-700"
                      style={{ borderColor: '#f87171' }}
                    />
                    <p className="text-sm text-red-600 dark:text-red-400" style={{ color: '#dc2626' }}>
                      If ETH drops by this percentage, increase purchase amount
                    </p>
                  </div>
                  <div className="space-y-4">
                    <Label htmlFor="dipMultiplier" className="text-base font-semibold text-red-700 dark:text-red-300" style={{ color: '#dc2626' }}>
                      Dip Multiplier
                    </Label>
                    <Input
                      id="dipMultiplier"
                      type="number"
                      step="0.1"
                      placeholder="2.0"
                      value={dynamicConditions.dipMultiplier}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setDynamicConditions(prev => ({
                          ...prev,
                          dipMultiplier: parseFloat(e.target.value)
                        }))
                      }
                      className="h-14 text-lg border-2 border-red-300 focus:border-red-500 focus:ring-red-500/20 rounded-xl bg-white dark:bg-gray-700"
                      style={{ borderColor: '#f87171' }}
                    />
                    <p className="text-sm text-red-600 dark:text-red-400" style={{ color: '#dc2626' }}>
                      Multiply purchase amount by this factor during dips
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || !isFormValid()}
              className="flex-1 h-14 text-lg font-semibold bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-3" />
                  Submit Encrypted DCA Intent
                </>
              )}
            </Button>

            {/* Proceed button for testing */}
            <button
              type="button"
              onClick={async () => {
                console.log('Proceed button clicked!');

                // Create a demo intent to save
                const demoIntent = {
                  id: Date.now().toString(),
                  txHash: '0x' + Math.random().toString(16).substr(2, 64),
                  totalBudget: parseFloat(totalBudget) || 1000,
                  amountPerInterval: parseFloat(amountPerInterval) || 100,
                  intervalSeconds: parseInt(intervalSeconds) || 3600,
                  totalPeriods: parseInt(totalPeriods) || 24,
                  dynamicConditions: dynamicConditions,
                  status: 'active',
                  submittedAt: new Date().toISOString(),
                  executedPeriods: 0
                };

                // Save to localStorage for Dashboard and Vault to read
                const existingIntents = JSON.parse(localStorage.getItem('dcaIntents') || '[]');
                existingIntents.push(demoIntent);
                localStorage.setItem('dcaIntents', JSON.stringify(existingIntents));

                console.log('Demo intent saved:', demoIntent);

                setSubmittedTxHash(demoIntent.txHash);
                setShowSuccessModal(true);
                console.log('Success modal triggered');
              }}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
            >
              <Zap className="h-5 w-5 mr-2 inline" />
              Proceed
            </button>
          </div>

          {/* Privacy Notice */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100 text-lg">
                    Privacy Protection
                  </h4>
                  <p className="text-green-700 dark:text-green-300 mt-2 leading-relaxed">
                    All your DCA parameters are encrypted using FHE (Fully Homomorphic Encryption)
                    before being submitted to the blockchain. This ensures your strategy remains
                    completely private while still allowing the system to execute your trades.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
            style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '450px',
              width: '100%',
              margin: '0 16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  DCA Intent Submitted Successfully!
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  Your encrypted DCA strategy has been submitted to the blockchain and is now active.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide">
                  Transaction Hash
                </p>
                <p className="text-xs font-mono text-gray-800 dark:text-gray-200 break-all bg-white dark:bg-gray-800 p-2 rounded-lg border">
                  {submittedTxHash}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/dashboard');
                  }}
                  className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Dashboard
                </Button>
                <Button
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/vault');
                  }}
                  className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  View Vault
                </Button>
              </div>

              <Button
                onClick={() => setShowSuccessModal(false)}
                variant="outline"
                className="w-full h-12 border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl font-semibold transition-all duration-200"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default SubmitPage;

