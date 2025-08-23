import { ethers } from 'ethers';
import { fhevmService } from '../services/fhevmService';
import { DCAIntent, Intent } from '../types/dca';

// Mock FHE encryption function
export function mockFHEEncrypt(value: number): string {
  return ethers.hexlify(ethers.toUtf8Bytes(value.toString()));
}

// Mock FHE decryption function
export function mockFHEDecrypt(encryptedValue: string): number {
  return parseInt(ethers.toUtf8String(encryptedValue));
}

// Submit encrypted DCA intent
export async function encryptAndSubmitIntent(params: {
  totalBudget: number;
  perInterval: number;
  interval: number;
  totalPeriods: number;
  dynamicConditions?: {
    enabled: boolean;
    dipThreshold: number;
    dipMultiplier: number;
    dipRemainingBuys: number;
  };
}): Promise<string> {
  try {
    const txHash = await fhevmService.submitDCAIntent(
      params.totalBudget,
      params.perInterval,
      params.interval,
      params.totalPeriods,
      params.dynamicConditions
    );
    return txHash;
  } catch (error) {
    console.error('Error submitting encrypted intent:', error);
    throw error;
  }
}

// Submit intent with dynamic conditions
export async function submitIntentWithDynamicConditions(intent: Intent): Promise<string> {
  try {
    const txHash = await fhevmService.submitDCAIntent(
      intent.amount,
      intent.amount, // Using amount as perInterval for simplicity
      86400, // Default to daily intervals
      10, // Default to 10 periods
      {
        enabled: true,
        dipThreshold: 300, // 3%
        dipMultiplier: 2.0,
        dipRemainingBuys: 5
      }
    );
    return txHash;
  } catch (error) {
    console.error('Error submitting intent with dynamic conditions:', error);
    throw error;
  }
}

// Get USDC balance (mock implementation)
export async function getUSDCBalance(): Promise<string> {
  // In a real implementation, this would call the contract
  return "1000.00";
}

// Get vault balance (mock implementation)
export async function getVaultBalance(): Promise<string> {
  // In a real implementation, this would call the contract
  return "500.00";
}

// Get reward vault balance (mock implementation)
export async function getRewardVaultBalance(): Promise<string> {
  // In a real implementation, this would call the contract
  return "0.25";
}

// Get WETH balance (mock implementation)
export async function getWETHBalance(): Promise<string> {
  // In a real implementation, this would call the contract
  return "0.50";
}

// Get DCA parameters (mock implementation)
export async function getMyDCAParams(): Promise<DCAIntent | null> {
  // In a real implementation, this would call the contract
  return {
    id: '1',
    user: '0x1234...',
    totalBudget: 5000,
    perInterval: 100,
    interval: 3600,
    totalPeriods: 24,
    executedPeriods: 5,
    nextExecution: Date.now() / 1000 + 1800,
    isActive: true,
    createdAt: Date.now() - 86400000,
    hasDynamicConditions: true
  };
}

// Deactivate DCA intent
export async function deactivateDCAIntent(): Promise<string> {
  try {
    const txHash = await fhevmService.deactivateIntent();
    return txHash;
  } catch (error) {
    console.error('Error deactivating DCA intent:', error);
    throw error;
  }
}

// Execute batch
export async function executeBatch(): Promise<string> {
  try {
    const txHash = await fhevmService.executeBatch();
    return txHash;
  } catch (error) {
    console.error('Error executing batch:', error);
    throw error;
  }
}

// Get automation info (mock implementation)
export async function getAutomationInfo(): Promise<{
  lastExecution: number;
  nextExecution: number;
  isActive: boolean;
}> {
  return {
    lastExecution: Date.now() - 3600000, // 1 hour ago
    nextExecution: Date.now() + 1800000, // 30 minutes from now
    isActive: true
  };
}

// Generate chart data for DCA progress
export function generateChartData(intents: DCAIntent[]): Array<{
  timestamp: number;
  spent: number;
  remaining: number;
}> {
  const data = [];
  const now = Date.now();
  
  for (let i = 0; i < 30; i++) {
    const timestamp = now - (29 - i) * 24 * 60 * 60 * 1000; // Last 30 days
    const spent = intents.reduce((sum, intent) => {
      const daysSinceStart = Math.floor((timestamp - intent.createdAt) / (24 * 60 * 60 * 1000));
      const executed = Math.min(daysSinceStart, intent.executedPeriods);
      return sum + (executed * intent.perInterval);
    }, 0);
    
    const remaining = intents.reduce((sum, intent) => {
      return sum + intent.totalBudget;
    }, 0) - spent;
    
    data.push({
      timestamp,
      spent,
      remaining: Math.max(0, remaining)
    });
  }
  
  return data;
}

// Truncate address for display
export function truncate(address: string, start: number = 6, end: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}
