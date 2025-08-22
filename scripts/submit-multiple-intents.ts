import { ethers } from 'hardhat';

async function main() {
    console.log('📊 Submitting Multiple DCA Intents to Trigger Batch...\n');

    // Contract addresses
    const DCA_REGISTRY_ADDRESS = '0x3F9D1D64CbbD69aBcB79faBD156817655b48050c';

    // Test parameters (different for each user to simulate real usage)
    const testIntents = [
        {
            name: 'User 1 - Conservative',
            budget: 500, // $500 USDC
            amountPerInterval: 50, // $50 per interval
            intervalSeconds: 86400, // Daily
            totalIntervals: 10
        },
        {
            name: 'User 2 - Aggressive',
            budget: 1000, // $1000 USDC
            amountPerInterval: 100, // $100 per interval
            intervalSeconds: 3600, // Hourly
            totalIntervals: 10
        },
        {
            name: 'User 3 - Moderate',
            budget: 750, // $750 USDC
            amountPerInterval: 75, // $75 per interval
            intervalSeconds: 43200, // 12 hours
            totalIntervals: 10
        }
    ];

    try {
        // Get signer
        const [signer] = await ethers.getSigners();
        console.log(`✅ Using signer: ${signer.address}`);

        // Get contract
        const registry = new ethers.Contract(
            DCA_REGISTRY_ADDRESS,
            ['function submitTestIntent(uint64 budget, uint64 amountPerInterval, uint32 intervalSeconds, uint32 totalIntervals) external'],
            signer
        );

        console.log(`📋 Submitting ${testIntents.length} test intents...\n`);

        for (let i = 0; i < testIntents.length; i++) {
            const intent = testIntents[i];
            console.log(`📝 Submitting intent ${i + 1}: ${intent.name}`);
            console.log(`   Budget: ${intent.budget} USDC`);
            console.log(`   Amount per interval: ${intent.amountPerInterval} USDC`);
            console.log(`   Interval: ${intent.intervalSeconds} seconds`);
            console.log(`   Total intervals: ${intent.totalIntervals}`);

            try {
                const tx = await registry.submitTestIntent(
                    intent.budget * 1000000, // Convert to wei (6 decimals)
                    intent.amountPerInterval * 1000000,
                    intent.intervalSeconds,
                    intent.totalIntervals
                );

                console.log(`   ✅ Transaction submitted: ${tx.hash}`);
                console.log(`   ⏳ Waiting for confirmation...`);

                const receipt = await tx.wait();
                console.log(`   ✅ Confirmed in block ${receipt.blockNumber}\n`);

                // Wait a bit between transactions
                if (i < testIntents.length - 1) {
                    console.log(`   ⏸️  Waiting 5 seconds before next intent...\n`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }

            } catch (error) {
                console.error(`   ❌ Error submitting intent ${i + 1}:`, error.message);
            }
        }

        console.log('🎉 All test intents submitted!');
        console.log('\n📊 Next Steps:');
        console.log('1. Check the frontend to see your intents');
        console.log('2. Execute a batch using: npx hardhat run scripts/auto-batch.ts --network sepolia');
        console.log('3. Monitor batch events in the frontend');

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
