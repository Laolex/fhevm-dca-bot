import React, { useState, useEffect } from 'react';
import { useService } from '../contexts/ServiceContext';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../utils/contracts';

const BalanceDebug: React.FC = () => {
  const { service } = useService();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runDebug = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const info: any = {};
      
      // Check environment variables
      info.environment = {
        VITE_USDC_TOKEN: import.meta.env.VITE_USDC_TOKEN,
        VITE_CHAIN_ID: import.meta.env.VITE_CHAIN_ID,
        VITE_RPC_URL: import.meta.env.VITE_RPC_URL,
        CONTRACT_ADDRESSES_USDC: CONTRACT_ADDRESSES.USDC_TOKEN,
        NETWORK_CONFIG_CHAIN_ID: NETWORK_CONFIG.CHAIN_ID
      };
      
      // Check service status
      if (service) {
        info.service = {
          isConnected: service.isConnected(),
          provider: !!service['provider'],
          signer: !!service['signer']
        };
        
        // Try to get connected address
        try {
          const address = await service.getConnectedAddress();
          info.address = address;
          
          // Try to get USDC balance
          try {
            const balance = await service.getUSDCBalance();
            info.usdcBalance = balance;
          } catch (balanceError: any) {
            info.usdcBalanceError = balanceError.message;
          }
          
          // Try to get WETH balance
          try {
            const wethBalance = await service.getWETHBalance();
            info.wethBalance = wethBalance;
          } catch (wethError: any) {
            info.wethBalanceError = wethError.message;
          }
          
        } catch (addressError: any) {
          info.addressError = addressError.message;
        }
      } else {
        info.service = 'Service not initialized';
      }
      
      setDebugInfo(info);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runDebug();
  }, [service]);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Balance Debug Information</h2>
      
      <button
        onClick={runDebug}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Running Debug...' : 'Refresh Debug Info'}
      </button>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Environment Variables:</h3>
          <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo.environment, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Service Status:</h3>
          <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(debugInfo.service, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Wallet Info:</h3>
          <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm overflow-auto">
            {JSON.stringify({
              address: debugInfo.address,
              addressError: debugInfo.addressError
            }, null, 2)}
          </pre>
        </div>
        
        <div>
          <h3 className="font-semibold mb-2">Balance Info:</h3>
          <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-sm overflow-auto">
            {JSON.stringify({
              usdcBalance: debugInfo.usdcBalance,
              usdcBalanceError: debugInfo.usdcBalanceError,
              wethBalance: debugInfo.wethBalance,
              wethBalanceError: debugInfo.wethBalanceError
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default BalanceDebug;
