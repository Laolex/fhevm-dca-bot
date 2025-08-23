import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Home, FileText, Wallet, Copy, LogOut, AlertTriangle, Shield } from 'lucide-react';
import { fhevmService } from '../services/fhevmService';
import ThemeToggle from './ThemeToggle';

const truncate = (addr?: string, n = 4) =>
  addr ? `${addr.slice(0, 2 + n)}…${addr.slice(-n)}` : "";

function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function ConnectionBadge({ isConnected, address, isCorrectNetwork }: { 
  isConnected: boolean; 
  address: string | null;
  isCorrectNetwork: boolean;
}) {
  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 text-xs px-2 py-1 rounded-full border bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-red-500" />
        <span className="opacity-80">Disconnected</span>
      </div>
    );
  }

  if (!isCorrectNetwork) {
    return (
      <div className="flex items-center gap-2 text-xs px-2 py-1 rounded-full border bg-yellow-50 dark:bg-yellow-950/20 text-yellow-600 dark:text-yellow-400">
        <AlertTriangle className="h-3 w-3" />
        <span className="opacity-80">Wrong Network</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs px-2 py-1 rounded-full border bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400">
      <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
      <span className="opacity-80">{truncate(address || undefined)}</span>
    </div>
  );
}

const Header: React.FC = () => {
  const location = useLocation();
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<string>('');

  const isActive = (path: string) => location.pathname === path;

  // Check connection status on mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const connected = fhevmService.isConnected();
      setIsConnected(connected);
      
      if (connected) {
        const addr = await fhevmService.getConnectedAddress();
        setAddress(addr);
        
        // Check network
        await checkNetwork();
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  };

  const checkNetwork = async () => {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) return;
      
      const provider = new (await import('ethers')).BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      
      setCurrentNetwork(network.name);
      setIsCorrectNetwork(chainId === 11155111); // Sepolia chain ID
    } catch (error) {
      console.error('Error checking network:', error);
      setIsCorrectNetwork(false);
    }
  };

  const switchToSepolia = async () => {
    try {
      if (typeof window === 'undefined' || !(window as any).ethereum) return;
      
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID in hex
      });
      
      await checkNetwork();
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        try {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0xaa36a7',
              chainName: 'Sepolia',
              nativeCurrency: {
                name: 'Sepolia Ether',
                symbol: 'SEP',
                decimals: 18
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io/']
            }]
          });
          await checkNetwork();
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
          alert('Failed to add Sepolia network. Please add it manually in MetaMask.');
        }
      } else {
        console.error('Error switching to Sepolia:', error);
        alert('Failed to switch to Sepolia network.');
      }
    }
  };

  const connectWallet = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      // Check if MetaMask is installed
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        alert('MetaMask is not installed. Please install MetaMask to use this application.');
        return;
      }

      // Request account access
      const provider = new (await import('ethers')).BrowserProvider((window as any).ethereum);
      await provider.send("eth_requestAccounts", []);
      
      // Get the signer
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      
      // Update connection status
      setIsConnected(true);
      setAddress(addr);
      
      // Check network
      await checkNetwork();
      
      // Reinitialize the service with the new provider
      await fhevmService.reinitializeProvider();
      
      console.log('Wallet connected:', addr);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error instanceof Error) {
        alert(`Failed to connect wallet: ${error.message}`);
      } else {
        alert('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setIsConnected(false);
      setAddress(null);
      setIsCorrectNetwork(false);
      setCurrentNetwork('');
      console.log('Wallet disconnected');
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const copyAddress = async () => {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      // You could add a toast notification here
      console.log('Address copied to clipboard');
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-yellow-50/80 dark:bg-yellow-950/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-yellow-500 to-yellow-600" />
            <div className="font-bold text-lg text-yellow-900 dark:text-yellow-100">FHEVM DCA Bot</div>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-yellow-600" style={{ color: 'inherit' }}>
              Home
            </Link>
            <Link to="/submit" className="text-sm font-medium transition-colors hover:text-yellow-600" style={{ color: 'inherit' }}>
              Submit Intent
            </Link>
            <Link to="/dashboard" className="text-sm font-medium transition-colors hover:text-yellow-600" style={{ color: 'inherit' }}>
              Dashboard
            </Link>
            <Link to="/vault" className="text-sm font-medium transition-colors hover:text-yellow-600" style={{ color: 'inherit' }}>
              Vault
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Vault Button */}
          <Link 
            to="/vault"
            className="flex items-center gap-2 px-3 py-2 text-sm border border-yellow-300 dark:border-yellow-700 rounded-lg bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-950/60 transition-colors"
            title="View Vault"
          >
            <Shield className="h-4 w-4" />
            Vault
          </Link>
          
          <ConnectionBadge isConnected={isConnected} address={address} isCorrectNetwork={isCorrectNetwork} />
          <ThemeToggle />
          
          {isConnected ? (
            <div className="flex items-center gap-2">
              {!isCorrectNetwork && (
                <button 
                  onClick={switchToSepolia}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-yellow-300 dark:border-yellow-700 rounded-lg bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-950/60 transition-colors"
                  title="Switch to Sepolia"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Switch to Sepolia
                </button>
              )}
              <button 
                onClick={copyAddress}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-yellow-300 dark:border-yellow-700 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-950/40 transition-colors"
                title="Copy address"
              >
                <Copy className="h-4 w-4" />
                {truncate(address || undefined)}
              </button>
              <button 
                onClick={disconnectWallet}
                className="flex items-center gap-2 px-3 py-2 text-sm border border-yellow-300 dark:border-yellow-700 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-950/40 transition-colors"
                title="Disconnect wallet"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={connectWallet}
              disabled={isConnecting}
              className="flex items-center gap-2 px-3 py-2 text-sm border border-yellow-300 dark:border-yellow-700 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Wallet className="h-4 w-4" />
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
