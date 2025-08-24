import { ethers } from 'ethers';
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
  // Mock implementation for now
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
  
  // Generate mock transaction hash
  const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
  
  // Store in localStorage for demo purposes
  const demoIntents = JSON.parse(localStorage.getItem('dcaIntents') || '[]');
  const newIntent = {
    id: Date.now().toString(),
    user: '0x' + Math.random().toString(16).substr(2, 40),
    amount: params.totalBudget,
    timestamp: Date.now(),
    status: 'active'
  };
  demoIntents.push(newIntent);
  localStorage.setItem('dcaIntents', JSON.stringify(demoIntents));
  
  return mockTxHash;
}

// Submit intent with dynamic conditions
export async function submitIntentWithDynamicConditions(intent: Intent): Promise<string> {
  // Mock implementation for now
  await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
  
  // Generate mock transaction hash
  const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
  
  // Store in localStorage for demo purposes
  const demoIntents = JSON.parse(localStorage.getItem('dcaIntents') || '[]');
  const newIntent = {
    id: Date.now().toString(),
    user: intent.user,
    amount: intent.amount,
    timestamp: intent.timestamp,
    status: 'active'
  };
  demoIntents.push(newIntent);
  localStorage.setItem('dcaIntents', JSON.stringify(demoIntents));
  
  return mockTxHash;
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
  // Mock implementation for now
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  
  // Generate mock transaction hash
  const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
  
  return mockTxHash;
}

// Execute batch
export async function executeBatch(): Promise<string> {
  // Mock implementation for now
  await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate network delay
  
  // Generate mock transaction hash
  const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
  
  return mockTxHash;
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
