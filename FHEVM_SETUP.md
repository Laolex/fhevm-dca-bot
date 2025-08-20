# FHEVM Configuration Guide

## 🔍 **Current Issue: KMS Contract Address Error**

The frontend is encountering a "KMS contract address is not valid or empty" error when trying to create FHEVM instances.

## 📋 **Official Zama FHEVM Addresses (Sepolia)**

| Contract/Service             | Address                                      |
| ---------------------------- | -------------------------------------------- |
| FHEVM_EXECUTOR_CONTRACT      | `0x848B0066793BcC60346Da1F49049357399B8D595` |
| ACL_CONTRACT                 | `0x687820221192C5B662b25367F70076A37bc79b6c` |
| HCU_LIMIT_CONTRACT           | `0x594BB474275918AF9609814E68C61B1587c5F838` |
| KMS_VERIFIER_CONTRACT        | `0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC` |
| INPUT_VERIFIER_CONTRACT      | `0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4` |
| DECRYPTION_ORACLE_CONTRACT   | `0xa02Cda4Ca3a71D7C46997716F4283aa851C28812` |
| DECRYPTION_ADDRESS           | `0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1` |
| INPUT_VERIFICATION_ADDRESS   | `0x7048C39f048125eDa9d678AEbaDfB22F7900a29F` |
| RELAYER_URL                  | `https://relayer.testnet.zama.cloud`         |

## 🔧 **Configuration Methods**

### Method 1: Environment Variables
```bash
export FHEVM_EXECUTOR_CONTRACT="0x848B0066793BcC60346Da1F49049357399B8D595"
export FHEVM_KMS_VERIFIER_CONTRACT="0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC"
export FHEVM_RELAYER_URL="https://relayer.testnet.zama.cloud"
```

### Method 2: Browser Configuration
```javascript
// In frontend
window.FHEVM_CONFIG = {
    chainId: 11155111,
    publicKey: "0x848B0066793BcC60346Da1F49049357399B8D595",
    verifier: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
    relayerUrl: "https://relayer.testnet.zama.cloud"
};
```

### Method 3: Direct Instance Configuration
```javascript
const relayer = await createInstance({
    chainId: 11155111,
    publicKey: "0x848B0066793BcC60346Da1F49049357399B8D595",
    verifier: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
    relayerUrl: "https://relayer.testnet.zama.cloud"
}, provider);
```

## 🚨 **Current Status**

### ✅ **What's Working:**
- Contracts deployed and functional on Sepolia
- Frontend UI with mock encryption for testing
- All contract addresses properly configured
- SepoliaConfig inheritance working correctly

### ❌ **What's Not Working:**
- FHEVM instance creation in frontend (KMS error)
- Real encryption/decryption flow
- Relayer integration

### 🔄 **Temporary Solution:**
- Using mock encrypted inputs for UI testing
- Frontend can submit "intents" but with mock data
- Real encryption will be implemented once KMS issue is resolved

## 🧪 **Testing Commands**

### Test FHEVM Configuration:
```bash
npx hardhat run scripts/test-fhevm-config.ts --network sepolia
```

### Test Frontend (Mock Mode):
```bash
cd frontend && npm run dev
# Visit http://localhost:5173
# Submit DCA intent (will use mock encryption)
```

### Test Contract Deployment:
```bash
npx hardhat run scripts/verify-config.ts --network sepolia
```

## 🔍 **Troubleshooting**

### 1. KMS Address Error
**Error:** `KMS contract address is not valid or empty`

**Possible Causes:**
- Environment variables not set correctly
- Network mismatch (not on Sepolia)
- FHEVM library version incompatibility
- Relayer URL not accessible

**Solutions:**
- Verify all environment variables are set
- Ensure connected to Sepolia network
- Check fhevmjs version compatibility
- Test relayer URL accessibility

### 2. Network Issues
**Error:** `Network not supported`

**Solution:**
- Ensure using Sepolia testnet
- Verify RPC URL is correct
- Check network chain ID (11155111)

### 3. Relayer Issues
**Error:** `Relayer not accessible`

**Solution:**
- Test relayer URL: `https://relayer.testnet.zama.cloud`
- Check network connectivity
- Verify relayer service status

## 📚 **Resources**

### Official Documentation:
- [Zama FHEVM Documentation](https://docs.zama.ai/fhevm/)
- [FHEVM.js Library](https://github.com/zama-ai/fhevmjs)
- [Sepolia Testnet Guide](https://docs.zama.ai/fhevm/getting-started/quick-start)

### Community Support:
- [Zama Discord](https://discord.gg/zama)
- [GitHub Issues](https://github.com/zama-ai/fhevmjs/issues)

## 🎯 **Next Steps**

1. **Investigate KMS Configuration:**
   - Check fhevmjs source code for correct configuration
   - Test different configuration methods
   - Verify address format requirements

2. **Alternative Approaches:**
   - Use different FHEVM initialization method
   - Check if relayer is required for basic operations
   - Test with different fhevmjs versions

3. **Fallback Strategy:**
   - Implement client-side encryption without relayer
   - Use direct contract calls with encrypted data
   - Consider alternative privacy solutions

## 📝 **Notes**

- The mock solution allows testing the UI flow
- Real encryption is required for production use
- KMS configuration is critical for FHEVM functionality
- SepoliaConfig handles on-chain FHEVM setup automatically
- Frontend FHEVM configuration is separate from contract configuration

---

**Status:** 🔄 **Investigating KMS Configuration Issue**
**Priority:** 🔴 **High** - Need to resolve for production use
**Workaround:** ✅ **Mock encryption for UI testing**
