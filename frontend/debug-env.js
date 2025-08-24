// Debug script to check environment variables
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from './src/utils/contracts.js';

console.log('🔍 Checking environment variables...\n');

console.log('📋 Contract Addresses:');
console.log('USDC_TOKEN:', CONTRACT_ADDRESSES.USDC_TOKEN);
console.log('WETH_TOKEN:', CONTRACT_ADDRESSES.WETH_TOKEN);
console.log('DCA_INTENT_REGISTRY:', CONTRACT_ADDRESSES.DCA_INTENT_REGISTRY);
console.log('BATCH_EXECUTOR:', CONTRACT_ADDRESSES.BATCH_EXECUTOR);

console.log('\n📋 Network Configuration:');
console.log('CHAIN_ID:', NETWORK_CONFIG.CHAIN_ID);
console.log('RPC_URL:', NETWORK_CONFIG.RPC_URL);
console.log('EXPLORER_URL:', NETWORK_CONFIG.EXPLORER_URL);

console.log('\n📋 Environment Variables (import.meta.env):');
console.log('VITE_USDC_TOKEN:', import.meta.env.VITE_USDC_TOKEN);
console.log('VITE_WETH_TOKEN:', import.meta.env.VITE_WETH_TOKEN);
console.log('VITE_CHAIN_ID:', import.meta.env.VITE_CHAIN_ID);
console.log('VITE_RPC_URL:', import.meta.env.VITE_RPC_URL);
