import crypto from 'crypto';
import { BigNumber, BytesLike } from 'ethers';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { InfinexERC2771Forwarder } from '../typechain';

interface ForwardRequest {
	from: string;
	to: string;
	value?: bigint;
	gas?: bigint;
	nonce?: string;
	data: BytesLike;
}

const ForwardRequestABI = {
	ForwardRequest: [
		{ name: 'from', type: 'address' },
		{ name: 'to', type: 'address' },
		{ name: 'value', type: 'uint256' },
		{ name: 'gas', type: 'uint256' },
		{ name: 'nonce', type: 'uint256' },
		{ name: 'data', type: 'bytes' },
	],
};

const getMetaTransactionDomain = async (forwarder: InfinexERC2771Forwarder) => {
	// We need the chain ID to sign correctly, so the contract must be attached to a network at this stage
	// or we can't build the message to sign.
	if (!forwarder.provider) {
		throw new Error('Forwarder must be attached to a provider to determine chainId');
	}
	const chainId = (await forwarder.provider.getNetwork()).chainId;

	return {
		name: 'InfinexERC2771Forwarder',
		version: '1',
		chainId,
		verifyingContract: forwarder.address,
	};
};

const randomNonce = () =>
	// 32 bytes === 256 bits, nonces in this context are 256 bits.
	BigInt(`0x${crypto.randomBytes(32).toString('hex')}`).toString();

export const signMetaTxRequest = async (
	signer: SignerWithAddress,
	forwarder: InfinexERC2771Forwarder,
	input: ForwardRequest
) => {
	const message = {
		// Let's default to a random nonce
		nonce: randomNonce(),

		...input,

		// But ensure the value and gas are always in our control.
		value: BigNumber.from(0),
		gas: BigNumber.from(1_000_000),
	};

	// This is the EIP712 domain information which is needed for ethers to be able to sign the struct.
	const domain = await getMetaTransactionDomain(forwarder);
	const signature = await signer._signTypedData(domain, ForwardRequestABI, message);

	return { ...message, signature };
};
