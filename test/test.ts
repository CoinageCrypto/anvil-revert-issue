import hardhat, { ethers } from 'hardhat';
import { ForwarderGreeterTest__factory, InfinexERC2771Forwarder__factory } from '../typechain';
import { signMetaTxRequest } from './sign-meta-tx-request';

let cannonBuildResult: any;
const cannonBuild = async () => {
	if (!cannonBuildResult) {
		cannonBuildResult = await hardhat.run('cannon:build');
	}

	return cannonBuildResult;
};

describe('Relayer', function () {
	if (hardhat.network.name === 'hardhat') {
		it('Should work on hardhat', async function () {
			const [user] = await hardhat.ethers.getSigners();

			const Relayer = await ethers.getContractFactory('InfinexERC2771Forwarder');
			const relayer = await Relayer.deploy();

			const Greeter = await ethers.getContractFactory('ForwarderGreeterTest');
			const greeter = await Greeter.deploy('Hello', relayer.address);

			// Here's the signed message to send to the relayer
			const request = await signMetaTxRequest(user, relayer, {
				from: user.address,
				to: greeter.address,
				data: greeter.interface.encodeFunctionData('greet'),
			});

			// The forwarder should be able to execute the transaction on the user's behalf at this stage
			const tx = await relayer.execute(request);
			await tx.wait();
		});
	}

	if (hardhat.network.name === 'cannon') {
		it('Should work on cannon / anvil', async function () {
			const { signers, outputs } = await cannonBuild();
			const [gasPayer, user, nobodyCaresWhoThisIs] = signers;

			const relayer = InfinexERC2771Forwarder__factory.connect(
				outputs.contracts.Relayer.address,
				gasPayer
			);
			const greeter = ForwarderGreeterTest__factory.connect(
				outputs.contracts.ForwarderGreeterTest.address,
				nobodyCaresWhoThisIs
			);

			// Here's the signed message to send to the relayer
			const request = await signMetaTxRequest(user, relayer, {
				from: user.address,
				to: outputs.contracts.ForwarderGreeterTest.address,
				data: greeter.interface.encodeFunctionData('greet'),
			});

			// The forwarder should be able to execute the transaction on the user's behalf at this stage
			const tx = await relayer.execute(request);
			await tx.wait();
		});
	}
});
