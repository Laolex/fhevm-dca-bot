import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Shield,
  Lock,
  TrendingUp,
  Clock,
  ArrowRight,
  BarChart3,
  Wallet,
  FileText,
  Zap,
  Target,
  Users,
  DollarSign
} from 'lucide-react';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 text-sm font-medium mb-6" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Shield className="h-4 w-4" />
            Privacy-First DCA Trading
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 dark:from-yellow-400 dark:to-yellow-600 bg-clip-text text-transparent mb-6" style={{ background: 'linear-gradient(to right, #d97706, #92400e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            FHEVM DCA Bot
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            Automated Dollar-Cost Averaging with Fully Homomorphic Encryption.
            Your trading strategies remain completely private while optimizing your crypto investments.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-white" style={{ backgroundColor: '#eab308', color: 'white' }}>
              <Link to="/submit">
                <FileText className="h-5 w-5 mr-2" />
                Start DCA Strategy
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-yellow-300 text-yellow-700 dark:border-yellow-600 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-950/20" style={{ borderColor: '#fbbf24', color: '#d97706' }}>
              <Link to="/dashboard">
                <BarChart3 className="h-5 w-5 mr-2" />
                View Dashboard
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Volume</p>
                  <p className="text-2xl font-bold text-blue-600">$2.4M</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold text-green-600">1,247</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-purple-600">98.5%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. ROI</p>
                  <p className="text-2xl font-bold text-orange-600">+12.4%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-950/40 w-fit">
                <Lock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-xl">🔐 FHE Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Your trading strategies remain completely private with Fully Homomorphic Encryption.
                No one can see your amounts, timing, or strategy details.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-950/40 w-fit">
                <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-xl">📈 Smart DCA</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Automated Dollar-Cost Averaging with intelligent batch execution and
                dynamic conditions. Optimize your entry points automatically.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-4">
              <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-950/40 w-fit">
                <Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <CardTitle className="text-xl">🛡️ Secure Vault</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Multi-signature vault with time-locks and emergency controls.
                Your funds are always secure and accessible when you need them.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Start Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50/50 to-yellow-100/30 dark:from-yellow-950/20 dark:to-yellow-900/10" style={{ borderColor: '#fbbf24', backgroundColor: '#fef3c7' }}>
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 dark:from-yellow-400 dark:to-yellow-600 bg-clip-text text-transparent" style={{ background: 'linear-gradient(to right, #d97706, #92400e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              🚀 Get Started in 3 Steps
            </CardTitle>
            <p className="text-yellow-700 dark:text-yellow-300" style={{ color: '#d97706' }}>
              Simple setup for your first private DCA strategy
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-950/40 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#fef3c7' }}>
                  <Wallet className="h-8 w-8 text-yellow-600 dark:text-yellow-400" style={{ color: '#d97706' }} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-yellow-800 dark:text-yellow-200" style={{ color: '#92400e' }}>1. Connect Wallet</h3>
                <p className="text-yellow-700 dark:text-yellow-300 leading-relaxed" style={{ color: '#d97706' }}>
                  Connect your MetaMask wallet and switch to Sepolia testnet for testing
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-950/40 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#fef3c7' }}>
                  <FileText className="h-8 w-8 text-yellow-600 dark:text-yellow-400" style={{ color: '#d97706' }} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-yellow-800 dark:text-yellow-200" style={{ color: '#92400e' }}>2. Configure DCA</h3>
                <p className="text-yellow-700 dark:text-yellow-300 leading-relaxed" style={{ color: '#d97706' }}>
                  Set your budget, frequency, and trading parameters with privacy protection
                </p>
              </div>

              <div className="text-center group">
                <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-950/40 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform" style={{ backgroundColor: '#fef3c7' }}>
                  <Zap className="h-8 w-8 text-yellow-600 dark:text-yellow-400" style={{ color: '#d97706' }} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-yellow-800 dark:text-yellow-200" style={{ color: '#92400e' }}>3. Start Trading</h3>
                <p className="text-yellow-700 dark:text-yellow-300 leading-relaxed" style={{ color: '#d97706' }}>
                  Submit your encrypted intent and let automation take over your strategy
                </p>
              </div>
            </div>

            <div className="text-center mt-8 space-y-4">
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-lg hover:shadow-xl transition-all duration-200" style={{ backgroundColor: '#eab308', color: 'white' }}>
                  <Link to="/submit">
                    <FileText className="h-5 w-5 mr-2" />
                    Create Your First Strategy
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50 dark:border-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-950/20 shadow-lg hover:shadow-xl transition-all duration-200" style={{ borderColor: '#fbbf24', color: '#d97706' }}>
                  <Link to="/vault">
                    <Shield className="h-5 w-5 mr-2" />
                    View Vault
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
