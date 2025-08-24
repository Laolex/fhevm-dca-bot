import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  StatsCard, 
  FeatureCard, 
  ActionCard, 
  ModernCard 
} from '../components/ui/modern-card';
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
  DollarSign,
  Sparkles,
  CheckCircle,
  ArrowUpRight
} from 'lucide-react';

const HomePage: React.FC = () => {
  const stats = [
    {
      title: "Total Volume",
      value: "$2.4M",
      icon: <DollarSign className="h-6 w-6" />,
      trend: { value: "+12.5%", isPositive: true }
    },
    {
      title: "Active Users",
      value: "1,247",
      icon: <Users className="h-6 w-6" />,
      trend: { value: "+8.2%", isPositive: true }
    },
    {
      title: "Success Rate",
      value: "98.5%",
      icon: <Target className="h-6 w-6" />,
      trend: { value: "+2.1%", isPositive: true }
    },
    {
      title: "Avg. ROI",
      value: "+12.4%",
      icon: <TrendingUp className="h-6 w-6" />,
      trend: { value: "+1.8%", isPositive: true }
    }
  ];

  const features = [
    {
      title: "🔐 FHE Privacy",
      description: "Your trading strategies remain completely private with Fully Homomorphic Encryption. No one can see your amounts, timing, or strategy details.",
      icon: <Lock className="h-6 w-6" />
    },
    {
      title: "📈 Smart DCA",
      description: "Automated Dollar-Cost Averaging with intelligent batch execution and dynamic conditions. Optimize your entry points automatically.",
      icon: <TrendingUp className="h-6 w-6" />
    },
    {
      title: "🛡️ Secure Vault",
      description: "Multi-signature vault with time-locks and emergency controls. Your funds are always secure and accessible when you need them.",
      icon: <Shield className="h-6 w-6" />
    }
  ];

  const steps = [
    {
      title: "Connect Wallet",
      description: "Connect your MetaMask wallet and switch to Sepolia testnet for testing",
      icon: <Wallet className="h-8 w-8" />
    },
    {
      title: "Configure DCA",
      description: "Set your budget, frequency, and trading parameters with privacy protection",
      icon: <FileText className="h-8 w-8" />
    },
    {
      title: "Start Trading",
      description: "Submit your encrypted intent and let automation take over your strategy",
      icon: <Zap className="h-8 w-8" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-blue-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="h-4 w-4" />
              Privacy-First DCA Trading
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <span className="gradient-text">FHEVM</span>
              <br />
              <span className="text-foreground">DCA Bot</span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Automated Dollar-Cost Averaging with Fully Homomorphic Encryption.
              Your trading strategies remain completely private while optimizing your crypto investments.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Button asChild size="lg" className="btn-primary">
                <Link to="/submit">
                  <FileText className="h-5 w-5 mr-2" />
                  Start DCA Strategy
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="btn-outline">
                <Link to="/dashboard">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  View Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StatsCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                trend={stat.trend}
                className="animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose FHEVM DCA Bot?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of private, automated cryptocurrency trading
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                className="animate-fade-in-up"
                style={{ animationDelay: `${0.1 * index}s` }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <ActionCard
            title="🚀 Get Started in 3 Steps"
            description="Simple setup for your first private DCA strategy"
            action={
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {steps.map((step, index) => (
                  <div key={step.title} className="text-center group">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            }
            className="animate-fade-in-up"
          />
          
          <div className="text-center space-y-4">
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild size="lg" className="btn-primary">
                <Link to="/submit">
                  <FileText className="h-5 w-5 mr-2" />
                  Create Your First Strategy
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="btn-outline">
                <Link to="/vault">
                  <Shield className="h-5 w-5 mr-2" />
                  View Vault
                  <ArrowUpRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ModernCard variant="glass" className="p-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Private DCA Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of users who are already benefiting from privacy-preserving automated trading.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="btn-primary">
                <Link to="/submit">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Get Started Now
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="btn-outline">
                <Link to="/dashboard">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Explore Dashboard
                </Link>
              </Button>
            </div>
          </ModernCard>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
