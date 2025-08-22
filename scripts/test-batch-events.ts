import { ethers } from 'hardhat';

async function main() {
    console.log('🔍 Testing Batch Events Loading...\n');

    // Contract addresses
    const BATCH_EXECUTOR_ADDRESS = '0x7dc70ce7f2a6Ad3895Ce84c7cd0CeC3Eec4b8C70';
    const REWARD_VAULT_ADDRESS = '0x98Eec4C5bA3DF65be22106E0E5E872454e8834db';

    try {
        // Get provider
        const provider = new ethers.JsonRpcProvider('https://eth-sepolia.g.alchemy.com/v2/demo');
        console.log('✅ Connected to Sepolia network');

        // Test BatchExecutor events
        console.log('\n📊 Checking BatchExecutor events...');
        const fromBlock = (await provider.getBlockNumber()) - 2000;
        console.log(`Searching from block: ${fromBlock}`);

        const iface = new ethers.Interface([
            'event BatchPrepared(uint256 indexed batchId, uint256 userCount)',
            'event BatchDecryptionFulfilled(uint256 indexed batchId, uint64 decryptedTotal)',
            'event BatchFinalized(uint256 indexed batchId, uint256 amountOut)'
        ]);

        const logs = await provider.getLogs({ 
            address: BATCH_EXECUTOR_ADDRESS, 
            fromBlock 
        });

        console.log(`Found ${logs.length} logs from BatchExecutor`);

        if (logs.length === 0) {
            console.log('ℹ️  No batch events found - this is expected if no batches have been executed yet');
        } else {
            console.log('📋 Parsing batch events:');
            for (const log of logs) {
                try {
                    const parsed = iface.parseLog(log as any);
                    console.log(`  - ${parsed.name}: Batch ID ${parsed.args[0]}`);
                } catch (error) {
                    console.log(`  - Unparseable log: ${log.topics[0]}`);
                }
            }
        }

        // Test RewardVault balance
        console.log('\n💰 Checking RewardVault balance...');
        const rewardVault = new ethers.Contract(
            REWARD_VAULT_ADDRESS,
            ['function getMyEncryptedBalance() view returns (bytes)'],
            provider
        );

        try {
            const balance = await rewardVault.getMyEncryptedBalance();
            console.log(`Encrypted balance: ${balance}`);
        } catch (error) {
            console.log(`❌ Error getting balance: ${error.message}`);
        }

        // Test contract code exists
        console.log('\n🔍 Checking contract code...');
        const batchCode = await provider.getCode(BATCH_EXECUTOR_ADDRESS);
        const rewardCode = await provider.getCode(REWARD_VAULT_ADDRESS);

        console.log(`BatchExecutor has code: ${batchCode !== '0x' ? '✅ Yes' : '❌ No'}`);
        console.log(`RewardVault has code: ${rewardCode !== '0x' ? '✅ Yes' : '❌ No'}`);

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
