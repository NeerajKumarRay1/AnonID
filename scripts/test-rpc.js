const { ethers } = require('hardhat');

async function testRPCEndpoints() {
  console.log('Testing RPC endpoints for Polygon Amoy...\n');
  
  const endpoints = [
    'https://rpc-amoy.polygon.technology/',
    'https://polygon-amoy-bor-rpc.publicnode.com',
    'https://polygon-amoy.drpc.org',
    'https://rpc.ankr.com/polygon_amoy',
    'https://polygon-amoy.blockpi.network/v1/rpc/public'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint}`);
      const startTime = Date.now();
      
      const provider = new ethers.JsonRpcProvider(endpoint);
      const blockNumber = await Promise.race([
        provider.getBlockNumber(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 10000)
        )
      ]);
      
      const responseTime = Date.now() - startTime;
      console.log(`✅ Success - Block: ${blockNumber}, Response time: ${responseTime}ms`);
      
      // Test contract read if we have the address
      if (process.env.ANON_ID_CONTRACT_ADDRESS) {
        try {
          const contractStartTime = Date.now();
          const contract = new ethers.Contract(
            process.env.ANON_ID_CONTRACT_ADDRESS,
            ['function owner() view returns (address)'],
            provider
          );
          
          const owner = await Promise.race([
            contract.owner(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Contract timeout')), 8000)
            )
          ]);
          
          const contractResponseTime = Date.now() - contractStartTime;
          console.log(`   Contract read: ${owner}, Response time: ${contractResponseTime}ms`);
        } catch (contractError) {
          console.log(`   Contract read failed: ${contractError.message}`);
        }
      }
      
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
    console.log('');
  }
}

testRPCEndpoints()
  .then(() => {
    console.log('RPC endpoint testing completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error testing RPC endpoints:', error);
    process.exit(1);
  });