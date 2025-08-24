import React, { useState } from 'react';
import { useService } from '../contexts/ServiceContext';
import { useToast } from '../contexts/ToastContext';
import { Button } from './ui/button';
import { ModernCard } from './ui/modern-card';

export const ContractDebug: React.FC = () => {
  const { service } = useService();
  const { showToast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const testContractConnection = async () => {
    setIsTesting(true);
    setDebugInfo('');
    
    try {
      if (!service) {
        setDebugInfo('❌ Service not initialized');
        return;
      }

      let info = '🔍 Contract Debug Information:\n\n';
      
      // Test provider connection using public method
      const debugInfo = service.getDebugInfo();
      info += `Provider connected: ${debugInfo.providerConnected}\n`;
      info += `Signer connected: ${debugInfo.signerConnected}\n`;
      info += `Registry contract: ${debugInfo.registryContract}\n`;
      info += `Executor contract: ${debugInfo.executorContract}\n`;
      info += `Token vault contract: ${debugInfo.tokenVaultContract}\n`;
      info += `Reward vault contract: ${debugInfo.rewardVaultContract}\n`;
      info += `DEX adapter contract: ${debugInfo.dexAdapterContract}\n\n`;
      
      // Test USDC balance
      try {
        const balance = await service.getUSDCBalance();
        info += `USDC Balance: ${balance}\n`;
      } catch (error) {
        info += `USDC Balance Error: ${error}\n`;
      }
      
      // Test contract call (read-only)
      try {
        const activeCount = await service.testContractCall();
        info += `Active users: ${activeCount}\n`;
      } catch (error) {
        info += `Contract call error: ${error}\n`;
      }
      
      setDebugInfo(info);
      showToast('Contract test completed', 'success');
      
    } catch (error) {
      setDebugInfo(`❌ Error: ${error}`);
      showToast('Contract test failed', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  const testSubmitIntent = async () => {
    setIsTesting(true);
    setDebugInfo('');
    
    try {
      if (!service) {
        setDebugInfo('❌ Service not initialized');
        return;
      }

      setDebugInfo('🔄 Submitting test intent...\n');
      
      // Submit a test intent
      const txHash = await service.submitDCAIntent(
        100, // totalBudget
        10,  // amountPerInterval
        3600, // intervalSeconds (1 hour)
        12   // totalPeriods
      );
      
      setDebugInfo(`✅ Intent submitted successfully!\nTransaction Hash: ${txHash}`);
      showToast('Test intent submitted successfully!', 'success');
      
    } catch (error) {
      setDebugInfo(`❌ Submit Error: ${error}`);
      showToast('Test submission failed', 'error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in-up">
      <ModernCard className="max-w-2xl mx-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6 text-center">Contract Debug Tool</h2>
          
          <div className="space-y-4 mb-6">
            <Button 
              onClick={testContractConnection}
              disabled={isTesting}
              className="w-full"
            >
              {isTesting ? 'Testing...' : 'Test Contract Connection'}
            </Button>
            
            <Button 
              onClick={testSubmitIntent}
              disabled={isTesting}
              variant="outline"
              className="w-full"
            >
              {isTesting ? 'Submitting...' : 'Test Submit Intent'}
            </Button>
          </div>
          
          {debugInfo && (
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {debugInfo}
              </pre>
            </div>
          )}
        </div>
      </ModernCard>
    </div>
  );
};
