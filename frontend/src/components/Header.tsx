import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectModal } from './ConnectModal';
import { useWallet } from '../hooks/useWallet';

const CHAINS: Record<string, { name: string; short: string }> = {
  "0xaa36a7": { name: "Sepolia", short: "Sepolia" }, // 11155111
  "0x1": { name: "Ethereum", short: "Mainnet" },
};

const truncate = (addr?: string, n = 4) =>
  addr ? `${addr.slice(0, 2 + n)}…${addr.slice(-n)}` : "";

function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function ConnectionBadge({ connected, chainId }: { connected: boolean; chainId?: string }) {
  const label = connected ? CHAINS[chainId ?? ""]?.short || `Chain ${chainId}` : "Disconnected";
  return (
    <div className="flex items-center gap-2 text-xs px-2 py-1 rounded-full border border-white/20 bg-white/10 text-white">
      <span className={classNames("inline-block h-2.5 w-2.5 rounded-full", connected ? "bg-emerald-500" : "bg-neutral-400")} />
      <span className="opacity-80">{label}</span>
    </div>
  );
}

function ThemeToggle() {
  const [dark, setDark] = useState(true);
  
  React.useEffect(() => {
    const root = document.documentElement;
    dark ? root.classList.add("dark") : root.classList.remove("dark");
  }, [dark]);
  
  return (
    <button 
      onClick={() => setDark((d) => !d)} 
      className="rounded-full px-3 py-2 text-sm border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}

const Header: React.FC = () => {
  const [walletOpen, setWalletOpen] = useState(false);
  const location = useLocation();

  const {
    walletState,
    isConnecting,
    isSwitching,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    isCorrectNetwork
  } = useWallet();

  const isActive = (path: string) => location.pathname === path;

  const copyAddress = async () => {
    if (!walletState.address) return;
    try {
      await navigator.clipboard.writeText(walletState.address);
      // You could add a toast here if you want
    } catch (error) {
      console.error('Failed to copy address:', error);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 backdrop-blur bg-white/10 border-b border-white/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600" />
              <div className="font-bold text-lg text-white">FHEVM DCA Bot</div>
            </Link>
            <nav className="hidden md:flex items-center gap-4 text-sm ml-6">
              <Link 
                to="/" 
                className={`transition-colors ${isActive('/') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'}`}
              >
                🏠 Home
              </Link>
              <Link 
                to="/submit" 
                className={`transition-colors ${isActive('/submit') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'}`}
              >
                📝 Submit Intent
              </Link>
              <Link 
                to="/vault" 
                className={`transition-colors ${isActive('/vault') ? 'text-white font-semibold' : 'text-white/80 hover:text-white'}`}
              >
                💰 Vault Dashboard
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionBadge connected={walletState.connected} chainId={walletState.chainId} />
            {walletState.connected ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 text-sm rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-white">
                  <span className="font-mono">{truncate(walletState.address)}</span>
                  <button 
                    onClick={copyAddress} 
                    className="opacity-70 hover:opacity-100 transition-opacity" 
                    title="Copy address"
                  >
                    📋
                  </button>
                </div>
                <button 
                  onClick={disconnectWallet}
                  className="rounded-2xl px-3 py-2 text-sm bg-white/20 text-white hover:bg-white/30 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => setWalletOpen(true)}
                className="rounded-2xl px-3 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Connect Wallet
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <ConnectModal
        isOpen={walletOpen}
        onClose={() => setWalletOpen(false)}
        onConnect={connectWallet}
        onSwitchNetwork={switchToSepolia}
        account={walletState.address || ''}
        network={walletState.network || ''}
        isConnecting={isConnecting || isSwitching}
        installed={walletState.installed}
      />
    </>
  );
};

export default Header;
