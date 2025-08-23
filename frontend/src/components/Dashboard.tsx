import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Link } from 'react-router-dom';
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
    ExternalLink,
    Calendar,
    Zap
} from 'lucide-react';

interface DCAIntent {
    id: string;
    txHash: string;
    totalBudget: number;
    amountPerInterval: number;
    intervalSeconds: number;
    totalPeriods: number;
    dynamicConditions: any;
    status: string;
    submittedAt: string;
    executedPeriods: number;
}

const Dashboard: React.FC = () => {
    const [countdown, setCountdown] = useState("00:00:00");
    const [intents, setIntents] = useState<DCAIntent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load intents from localStorage
        const loadIntents = () => {
            try {
                const storedIntents = JSON.parse(localStorage.getItem('dcaIntents') || '[]');
                setIntents(storedIntents);
            } catch (error) {
                console.error('Error loading intents:', error);
                setIntents([]);
            } finally {
                setLoading(false);
            }
        };

        loadIntents();

        const timer = setInterval(() => {
            const now = new Date();
            const target = new Date(now.getTime() + 86400000); // 24 hours from now
            const diff = target.getTime() - now.getTime();

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
    };

    const totalBudget = intents.reduce((sum, intent) => sum + intent.totalBudget, 0);
    const activeIntents = intents.filter(intent => intent.status === 'active').length;

    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 dark:from-yellow-400 dark:to-yellow-600 bg-clip-text text-transparent flex items-center justify-center gap-2" style={{ background: 'linear-gradient(to right, #d97706, #92400e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        <Shield className="h-8 w-8" />
                        FHEVM DCA Dashboard
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Secure, automated trading with homomorphic encryption
                    </p>

                    {/* Production Mode Banner */}
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mt-4">
                        <p className="text-sm text-green-700 dark:text-green-300">
                            ✅ <strong>Live on Sepolia:</strong> FHEVM DCA Bot is live with real smart contracts!
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border-yellow-200 bg-yellow-50/30 dark:border-yellow-800 dark:bg-yellow-950/10" style={{ borderColor: '#fbbf24', backgroundColor: '#fef3c7' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300" style={{ color: '#d97706' }}>
                                Total Budget
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-yellow-600" style={{ color: '#d97706' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600" style={{ color: '#d97706' }}>
                                ${totalBudget.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-200 bg-yellow-50/30 dark:border-yellow-800 dark:bg-yellow-950/10" style={{ borderColor: '#fbbf24', backgroundColor: '#fef3c7' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300" style={{ color: '#d97706' }}>
                                Active Intents
                            </CardTitle>
                            <Zap className="h-4 w-4 text-yellow-600" style={{ color: '#d97706' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600" style={{ color: '#d97706' }}>
                                {activeIntents}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-200 bg-yellow-50/30 dark:border-yellow-800 dark:bg-yellow-950/10" style={{ borderColor: '#fbbf24', backgroundColor: '#fef3c7' }}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300" style={{ color: '#d97706' }}>
                                Batch Status
                            </CardTitle>
                            <Target className="h-4 w-4 text-yellow-600" style={{ color: '#d97706' }} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600" style={{ color: '#d97706' }}>
                                Active
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* DCA Progress Chart */}
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                DCA Progress
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center text-muted-foreground">
                                <div className="text-center">
                                    <div className="text-lg mb-2">No DCA Data</div>
                                    <div className="text-sm">Create your first intent to see progress</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trade Controls */}
                    <Card className="shadow-lg flex flex-col justify-between">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Next Buy Cycle
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-2">Time until next execution</p>
                                <p className="text-4xl font-mono font-bold text-primary">{countdown}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Wallet Status:</span>
                                    <span className="text-red-600">Disconnected</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Network:</span>
                                    <span className="text-red-600">Not Connected</span>
                                </div>
                            </div>

                            <div className="text-center text-sm text-muted-foreground">
                                Go to <strong>Submit Intent</strong> page to create your DCA strategy
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* DCA Intents Section */}
                <Card className="border-yellow-200 bg-yellow-50/30 dark:border-yellow-800 dark:bg-yellow-950/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-yellow-600" />
                            Your DCA Intents
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-yellow-600" />
                                <span className="ml-2">Loading intents...</span>
                            </div>
                        ) : intents.length === 0 ? (
                            <div className="text-center py-8">
                                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No DCA Intents Yet</h3>
                                <p className="text-muted-foreground mb-4">
                                    Submit your first DCA intent to start automated trading with privacy protection.
                                </p>
                                <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-white">
                                    <Link to="/submit">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create DCA Intent
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {intents.map((intent) => (
                                    <div key={intent.id} className="border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 bg-white dark:bg-gray-900">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-yellow-600" />
                                                <span className="font-semibold">DCA Intent #{intent.id.slice(-6)}</span>
                                                <span className={`px-2 py-1 rounded-full text-xs ${intent.status === 'active'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300'
                                                    }`}>
                                                    {intent.status}
                                                </span>
                                            </div>
                                            <a
                                                href={`https://sepolia.etherscan.io/tx/${intent.txHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                            </a>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Total Budget</p>
                                                <p className="font-semibold">${intent.totalBudget.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Per Interval</p>
                                                <p className="font-semibold">${intent.amountPerInterval.toFixed(2)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Frequency</p>
                                                <p className="font-semibold">{getIntervalLabel(intent.intervalSeconds)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Progress</p>
                                                <p className="font-semibold">{intent.executedPeriods}/{intent.totalPeriods}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-yellow-200 dark:border-yellow-800">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                <span>Submitted: {formatDate(intent.submittedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
