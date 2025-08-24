// Debug script to test USDC balance detection
import { ethers } from 'ethers';

// Sepolia USDC addresses to test
const USDC_ADDRESSES = {
  // Official Sepolia USDC
  OFFICIAL: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  // Alternative Sepolia USDC
  ALTERNATIVE: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8',
  // Test USDC from environment
  TEST: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
};

// ERC20 ABI for balance checking
const ERC20_ABI = [
  "function name() external view returns (string memory)",
  "function symbol() external view returns (string memory)",
  "function decimals() external view returns (uint8)",
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)"
];

async function testUSDCBalance() {
  try {
    // Connect to Sepolia
    const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/312613a9102542da84327286ac6162c1');
    
    console.log('🔍 Testing USDC balance detection on Sepolia...\n');
    
    // Test each USDC address
    for (const [name, address] of Object.entries(USDC_ADDRESSES)) {
      try {
        console.log(`📋 Testing ${name} USDC at ${address}:`);
        
        const contract = new ethers.Contract(address, ERC20_ABI, provider);
        
        // Get token info
        const [tokenName, symbol, decimals, totalSupply] = await Promise.all([
          contract.name(),
          contract.symbol(),
          contract.decimals(),
          contract.totalSupply()
        ]);
        
        console.log(`   Name: ${tokenName}`);
        console.log(`   Symbol: ${symbol}`);
        console.log(`   Decimals: ${decimals}`);
        console.log(`   Total Supply: ${ethers.formatUnits(totalSupply, decimals)}`);
        
        // Test with a sample address (you can replace this with your address)
        const testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // Example address
        const balance = await contract.balanceOf(testAddress);
        const formattedBalance = ethers.formatUnits(balance, decimals);
        
        console.log(`   Balance for ${testAddress}: ${formattedBalance} ${symbol}\n`);
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}\n`);
      }
    }
    
    // Test with your actual address if provided
    const yourAddress = process.argv[2];
    if (yourAddress) {
      console.log(`🔍 Testing balance for your address: ${yourAddress}`);
      
      const contract = new ethers.Contract(USDC_ADDRESSES.OFFICIAL, ERC20_ABI, provider);
      const balance = await contract.balanceOf(yourAddress);
      const decimals = await contract.decimals();
      const symbol = await contract.symbol();
      
      console.log(`   Balance: ${ethers.formatUnits(balance, decimals)} ${symbol}\n`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testUSDCBalance();
