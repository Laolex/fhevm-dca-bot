import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import ThemeToggle from './ThemeToggle';
import { useService } from '../contexts/ServiceContext';
import { useToast } from '../contexts/ToastContext';
import {
  Wallet,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  BarChart3,
  FileText,
  Shield,
  Bug
} from 'lucide-react';

const truncate = (addr?: string, n = 4) =>
  addr ? `${addr.slice(0, 2 + n)}…${addr.slice(-n)}` : "";

function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function ConnectionBadge({
  isConnected,
  address,
  isCorrectNetwork
}: {
  isConnected: boolean;
  address: string | null;
  isCorrectNetwork: boolean;
}) {
  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div className="w-2 h-2 rounded-full bg-destructive" />
        <span>Not Connected</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className={classNames(
        "w-2 h-2 rounded-full",
        isCorrectNetwork ? "bg-emerald-600" : "bg-yellow-600"
      )} />
      <span className="text-sm font-mono">{truncate(address || undefined)}</span>
      {!isCorrectNetwork && (
        <span className="text-xs text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 px-2 py-1 rounded">
          Wrong Network
        </span>
      )}
    </div>
  );
}

const Header: React.FC = () => {
  const location = useLocation();
  const { service } = useService();
  const { showToast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', href: '/', icon: Sparkles },
    { name: 'Submit', href: '/submit', icon: FileText },
    { name: 'Vault', href: '/vault', icon: Shield },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Debug', href: '/debug', icon: Bug },
    { name: 'Contract Debug', href: '/contract-debug', icon: Bug },
  ];

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    checkConnectionStatus();
    checkNetwork();
  }, [service]);

  const checkConnectionStatus = async () => {
    if (!service) return;

    try {
      const connected = service.isConnected();
      setIsConnected(connected);

      if (connected) {
        const addr = await service.getConnectedAddress();
        setAddress(addr);
      } else {
        setAddress(null);
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      setIsConnected(false);
      setAddress(null);
    }
  };

  const checkNetwork = async () => {
    if (!service) return;

    try {
      // Check if connected to Sepolia (chain ID 11155111)
      const chainId = await service['provider']?.getNetwork();
      setIsCorrectNetwork(chainId?.chainId === 11155111n);
    } catch (error) {
      console.error('Error checking network:', error);
      setIsCorrectNetwork(false);
    }
  };

  const switchToSepolia = async () => {
    if (!service) return;

    try {
      await service['provider']?.send('wallet_switchEthereumChain', [
        { chainId: '0xaa36a7' } // Sepolia chain ID
      ]);
      await checkNetwork();
      showToast('Switched to Sepolia network', 'success');
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        try {
          await service['provider']?.send('wallet_addEthereumChain', [
            {
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              nativeCurrency: {
                name: 'Sepolia Ether',
                symbol: 'SEP',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.infura.io/v3/your-project-id'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ]);
          await checkNetwork();
          showToast('Added and switched to Sepolia network', 'success');
        } catch (addError) {
          showToast('Failed to add Sepolia network', 'error');
        }
      } else {
        showToast('Failed to switch network', 'error');
      }
    }
  };

  const connectWallet = async () => {
    if (!service) {
      showToast('Service not initialized', 'error');
      return;
    }

    setIsConnecting(true);
    try {
      await service.reinitializeProvider();
      await checkConnectionStatus();
      await checkNetwork();
      showToast('Wallet connected successfully', 'success');
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      showToast(error.message || 'Failed to connect wallet', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      // In a real implementation, you might want to clear the connection
      setIsConnected(false);
      setAddress(null);
      showToast('Wallet disconnected', 'info');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const copyAddress = async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      showToast('Address copied to clipboard', 'success');
    } catch (error) {
      showToast('Failed to copy address', 'error');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">FHEVM DCA</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    "flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Vault Button */}
            <Link
              to="/vault"
              className="flex items-center gap-2 px-3 py-2 text-sm border border-yellow-300 dark:border-yellow-700 rounded-lg bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-950/60 transition-colors"
              title="View Vault"
            >
              <Shield className="h-4 w-4" />
              Vault
            </Link>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Wallet Connection */}
            <div className="hidden sm:flex items-center space-x-4">
              {isConnected ? (
                <div className="flex items-center space-x-3">
                  <ConnectionBadge
                    isConnected={isConnected}
                    address={address}
                    isCorrectNetwork={isCorrectNetwork}
                  />
                  {!isCorrectNetwork && (
                    <Button
                      onClick={switchToSepolia}
                      size="sm"
                      variant="outline"
                    >
                      Switch to Sepolia
                    </Button>
                  )}
                  <Button
                    onClick={copyAddress}
                    size="sm"
                    variant="ghost"
                  >
                    Copy
                  </Button>
                  <Button
                    onClick={disconnectWallet}
                    size="sm"
                    variant="outline"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  variant="default"
                >
                  {isConnecting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      <span>Connecting...</span>
                    </div>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect Wallet
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={classNames(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium",
                      isActive(item.href)
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* Mobile wallet section */}
              <div className="pt-4 border-t">
                {isConnected ? (
                  <div className="space-y-2">
                    <ConnectionBadge
                      isConnected={isConnected}
                      address={address}
                      isCorrectNetwork={isCorrectNetwork}
                    />
                    {!isCorrectNetwork && (
                      <Button
                        onClick={switchToSepolia}
                        size="sm"
                        variant="outline"
                        className="w-full"
                      >
                        Switch to Sepolia
                      </Button>
                    )}
                    <Button
                      onClick={disconnectWallet}
                      size="sm"
                      variant="outline"
                      className="w-full"
                    >
                      Disconnect Wallet
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    variant="default"
                    className="w-full"
                  >
                    {isConnecting ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        <span>Connecting...</span>
                      </div>
                    ) : (
                      <>
                        <Wallet className="h-4 w-4 mr-2" />
                        Connect Wallet
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
