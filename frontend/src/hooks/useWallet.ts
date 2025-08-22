import { useState, useEffect, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';

interface WalletState {
  installed: boolean;
  connecting: boolean;
  connected: boolean;
  address?: string;
  chainId?: string;
  network?: string;
}

const CHAINS: Record<string, { name: string; short: string }> = {
  "0xaa36a7": { name: "Sepolia", short: "Sepolia" }, // 11155111
  "0x1": { name: "Ethereum", short: "Mainnet" },
};

const SEPOLIA_CHAIN_ID = '0xaa36a7';

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({ 
    installed: false, 
    connecting: false, 
    connected: false 
  });
  const [isSwitching, setIsSwitching] = useState(false);
  const { showToast } = useToast();

  // Initialize wallet state
  useEffect(() => {
    const eth = (window as any).ethereum;
    const installed = Boolean(eth && eth.isMetaMask);
    setWalletState(s => ({ ...s, installed }));
    
    if (!installed) return;

    // Check existing connection
    eth.request({ method: "eth_accounts" }).then((accs: string[]) => {
      if (accs?.length) {
        setWalletState(s => ({ 
          ...s, 
          connected: true, 
          address: accs[0],
          network: CHAINS[s.chainId || '']?.name || 'Unknown'
        }));
      }
    });
    
    eth.request({ method: "eth_chainId" }).then((cid: string) => {
      setWalletState(s => ({ 
        ...s, 
        chainId: cid,
        network: CHAINS[cid]?.name || 'Unknown'
      }));
    });

    // Listen for account changes
    const onAccountsChanged = (accs: string[]) => {
      const connected = !!accs?.length;
      setWalletState(s => ({ 
        ...s, 
        connected, 
        address: accs?.[0],
        network: CHAINS[s.chainId || '']?.name || 'Unknown'
      }));
      
      if (connected) {
        showToast('Wallet connected', 'success');
      } else {
        showToast('Wallet disconnected', 'info');
      }
    };

    // Listen for chain changes
    const onChainChanged = (cid: string) => {
      setWalletState(s => ({ 
        ...s, 
        chainId: cid,
        network: CHAINS[cid]?.name || 'Unknown'
      }));
      
      const chainName = CHAINS[cid]?.name || 'Unknown';
      showToast(`Switched to ${chainName}`, 'info');
    };

    eth.on?.("accountsChanged", onAccountsChanged);
    eth.on?.("chainChanged", onChainChanged);
    
    return () => {
      eth.removeListener?.("accountsChanged", onAccountsChanged);
      eth.removeListener?.("chainChanged", onChainChanged);
    };
  }, [showToast]);

  const connectWallet = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth?.isMetaMask) {
      window.open("https://metamask.io/download/", "_blank");
      showToast('MetaMask not installed', 'error');
      return;
    }
    
    try {
      setWalletState(s => ({ ...s, connecting: true }));
      const accs: string[] = await eth.request({ method: "eth_requestAccounts" });
      const cid: string = await eth.request({ method: "eth_chainId" });
      
      setWalletState({ 
        installed: true, 
        connecting: false, 
        connected: true, 
        address: accs[0], 
        chainId: cid,
        network: CHAINS[cid]?.name || 'Unknown'
      });
      
      showToast('Wallet connected successfully', 'success');
    } catch (error) {
      setWalletState(s => ({ ...s, connecting: false }));
      console.error('Connection failed:', error);
      showToast('Failed to connect wallet', 'error');
    }
  }, [showToast]);

  const disconnectWallet = useCallback(() => {
    setWalletState(s => ({ 
      ...s, 
      connected: false, 
      address: undefined 
    }));
    showToast('Wallet disconnected', 'info');
  }, [showToast]);

  const switchToSepolia = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      showToast('No wallet detected', 'error');
      return;
    }

    try {
      setIsSwitching(true);
      
      // Try to switch to Sepolia
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID }],
      });
      
      showToast('Switched to Sepolia', 'success');
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: SEPOLIA_CHAIN_ID,
                chainName: 'Sepolia',
                nativeCurrency: {
                  name: 'Sepolia Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc.sepolia.org'],
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          showToast('Sepolia network added and switched', 'success');
        } catch (addError) {
          console.error('Failed to add Sepolia network:', addError);
          showToast('Failed to add Sepolia network', 'error');
        }
      } else {
        console.error('Failed to switch to Sepolia:', switchError);
        showToast('Failed to switch to Sepolia', 'error');
      }
    } finally {
      setIsSwitching(false);
    }
  }, [showToast]);

  const isCorrectNetwork = walletState.chainId === SEPOLIA_CHAIN_ID;

  return {
    walletState,
    isConnecting: walletState.connecting,
    isSwitching,
    connectWallet,
    disconnectWallet,
    switchToSepolia,
    isCorrectNetwork
  };
};
