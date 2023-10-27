import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@typechain/hardhat';
import 'solidity-coverage';

import 'hardhat-cannon';

import * as dotenv from 'dotenv';
dotenv.config();

// need to use `any` type here instead of HardhatUserConfig becuase somethign borky is going on with typescript resolution of cannon config overrides
const config: any = {
	defaultNetwork: 'cannon',
	solidity: '0.8.21',
	networks: {
		// The 'cannon' network is automatically injected by hardhat-cannon

		// This network should never be used
		hardhat: {
			chainId: 31337,
		},

		// This network should never be used directly, but the config is read by hardhat-cannon,
		// and is how we can pass a private key in if we need to.
		local: {
			url: 'http://127.0.0.1:8545/',
			accounts: process.env.PRIVATE_KEY?.split(','),
			chainId: 1337,
		},
	},

	cannon: {
		publicSourceCode: true,
	},
};

export default config;
