# Anvil Revert FE Opcode Issue

I believe this is an Anvil bug. Here's what I know:

- In `ERC2771Forwarder.sol` Open Zeppelin have included an invalid opcode like so

```solidity
assembly {
    invalid()
}
```

- Their reasons for doing so are explained in that file starting on line 377.
- The `if` statement there definitely evaluates to false, and the `invalid()` opcode is not being run.
  - You can verify this by commenting out the `assembly { invalid() }` and replacing it with `revert("stuff")`. It will then not revert, proving the `if` statement is not running.
- Running this code with the `invalid()` opcode there inside the if statement on hardhat works.
  - To test this, run `pnpm t -- --network hardhat`. You should get output similar to:

```console
> synthetix-sandbox-trading-example@0.0.1 test /Users/kevin/development/infinex/anvil-revert-issue
> hardhat test "--network" "hardhat"

No need to generate any newer typings.


  Relayer
Deploying a Greeter with greeting: Hello
    ✔ Should work independent of cannon tooling (644ms)


  1 passing (645ms)
```

- Running identical code on cannon / anvil breaks, whether I deploy it through cannon or using ethers directly.
  - To test this, run `pnpm t -- --network cannon`
  - This test suite runs the test from before, and it also has a new test which uses `cannonfile.toml` to deploy the contracts just in case you want to see it working that way.
  - You should get output similar to:

```console
> hardhat test "--network" "cannon"

No need to generate any newer typings.


  Relayer
    1) Should work independent of cannon tooling
Nothing to compile
No need to generate any newer typings.


Using Frame as the default registry provider. If you don't have Frame installed cannon defaults to: https://ethereum.publicnode.com/ when publishing to the registry.
Set a custom registry provider url in your settings (run cannon setup) or pass it as an env variable (CANNON_REGISTRY_PROVIDER_URL).


Checking IPFS for package anvil-revert-example:0.0.1@main with chain Id 13370...

Existing package found.

Using package...
Name: anvil-revert-example
Version: 0.0.1
Preset: main (default)
Source code will be included in the package

Building the chain (ID 13370)...

CONTRACTS:
╔══════════════════════╤════════════════════════════════════════════╗
║ Relayer              │ 0xE661b3F15d0310af885f4D5c6482C0b5a8C0523D ║
╟──────────────────────┼────────────────────────────────────────────╢
║ ForwarderGreeterTest │ 0xF275321e2e6a907F9113F037ef9ECc22b4DD4ff4 ║
╚══════════════════════╧════════════════════════════════════════════╝

Successfully built package anvil-revert-example:0.0.1@main
 - Deploy Url: ipfs://QmXCCMdLdoDibzJfsu7f4U1KrTpMdVJCS5FuzpK8kGttcU

    2) Should work on cannon / anvil


  0 passing (4s)
  2 failing

  1) Relayer
       Should work independent of cannon tooling:
     HardhatError: HH108: Cannot connect to the network cannon.
Please make sure your node is running, and check your internet connection and networks config
      at HttpProvider._fetchJsonRpcResponse (/Users/kevin/development/infinex/anvil-revert-issue/node_modules/.pnpm/hardhat@2.18.1_ts-node@10.9.1_typescript@4.9.5/node_modules/hardhat/src/internal/core/providers/http.ts:221:15)
      at processTicksAndRejections (node:internal/process/task_queues:95:5)
      at async HttpProvider.request (/Users/kevin/development/infinex/anvil-revert-issue/node_modules/.pnpm/hardhat@2.18.1_ts-node@10.9.1_typescript@4.9.5/node_modules/hardhat/src/internal/core/providers/http.ts:85:29)
      at async ChainIdValidatorProvider._getChainIdFromEthNetVersion (/Users/kevin/development/infinex/anvil-revert-issue/node_modules/.pnpm/hardhat@2.18.1_ts-node@10.9.1_typescript@4.9.5/node_modules/hardhat/src/internal/core/providers/chainId.ts:33:17)
      at async ChainIdValidatorProvider._getChainId (/Users/kevin/development/infinex/anvil-revert-issue/node_modules/.pnpm/hardhat@2.18.1_ts-node@10.9.1_typescript@4.9.5/node_modules/hardhat/src/internal/core/providers/chainId.ts:17:25)
      at async ChainIdValidatorProvider.request (/Users/kevin/development/infinex/anvil-revert-issue/node_modules/.pnpm/hardhat@2.18.1_ts-node@10.9.1_typescript@4.9.5/node_modules/hardhat/src/internal/core/providers/chainId.ts:55:29)
      at async EthersProviderWrapper.send (/Users/kevin/development/infinex/anvil-revert-issue/node_modules/.pnpm/@nomiclabs+hardhat-ethers@2.2.3_ethers@5.7.2_hardhat@2.18.1/node_modules/@nomiclabs/hardhat-ethers/src/internal/ethers-provider-wrapper.ts:13:20)
      at async getSigners (/Users/kevin/development/infinex/anvil-revert-issue/node_modules/.pnpm/@nomiclabs+hardhat-ethers@2.2.3_ethers@5.7.2_hardhat@2.18.1/node_modules/@nomiclabs/hardhat-ethers/src/internal/helpers.ts:45:20)
      at async Context.<anonymous> (/Users/kevin/development/infinex/anvil-revert-issue/test/test.ts:16:18)

      Caused by: Error: connect ECONNREFUSED 127.0.0.1:8545
          at TCPConnectWrap.afterConnect [as oncomplete] (node:net:1494:16)

  2) Relayer
       Should work on cannon / anvil:
     Error: transaction reverted in contract unknown: processing response error (body="{\"jsonrpc\":\"2.0\",\"id\":53,\"error\":{\"code\":-32603,\"message\":\"EVM error InvalidFEOpcode\"}}", error={"code":-32603}, requestBody="{\"method\":\"eth_estimateGas\",\"params\":[{\"type\":\"0x2\",\"maxFeePerGas\":\"0xd09dc300\",\"maxPriorityFeePerGas\":\"0x59682f00\",\"from\":\"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266\",\"to\":\"0xe661b3f15d0310af885f4d5c6482c0b5a8c0523d\",\"data\":\"0xd7513467000000000000000000000000000000000000000000000000000000000000002000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8000000000000000000000000f275321e2e6a907f9113f037ef9ecc22b4dd4ff4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f4240c5252ba8408473d755b81cda8ce62768ac07f0a0f2ed3f273a0367921887dbbf00000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000004cfae32170000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000410878e63ba1775beed2f51e397717e71a40c2d4c73780573a2ede7a6835e891d45cc313ba69ae8fcc853284497ed5c47822400334a2307d4042163ec6e8f02cd11c00000000000000000000000000000000000000000000000000000000000000\"}],\"id\":53,\"jsonrpc\":\"2.0\"}", requestMethod="POST", url="http://127.0.0.1:8545", code=SERVER_ERROR, version=web/5.7.1)

  CALL Relayer.execute("0x70997970C51812dc3A010C7d01b50e0d17dc79C8,0xF275321e2e6a907F9113F037ef9ECc22b4DD4ff4,0,1000000,89171305823458705272022837833383937619399951135741210018490855282000555137983,0xcfae3217,0x0878e63ba1775beed2f51e397717e71a40c2d4c73780573a2ede7a6835e891d45cc313ba69ae8fcc853284497ed5c47822400334a2307d4042163ec6e8f02cd11c") => () (45,831 gas)
    STATICCALL 0x0000000000000000000000000000000000000001.0x71e9e67fe644cfd3b6bc4a7964e0e6c1d2b57944657107a880814f838885f344000000000000000000000000000000000000000000000000000000000000001c0878e63ba1775beed2f51e397717e71a40c2d4c73780573a2ede7a6835e891d45cc313ba69ae8fcc853284497ed5c47822400334a2307d4042163ec6e8f02cd1 => 0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8 (3,000 gas)
    STATICCALL ForwarderGreeterTest.isTrustedForwarder("0xE661b3F15d0310af885f4D5c6482C0b5a8C0523D") => ("true") (2,786 gas)
    CALL ForwarderGreeterTest.greet() => () (4,968 gas)


      at /Users/kevin/development/infinex/anvil-revert-issue/node_modules/.pnpm/@usecannon+builder@2.9.0_ethers@5.7.2_hardhat@2.18.1_solc@0.8.22_typedoc@0.25.2/node_modules/@usecannon/builder/src/error/index.ts:83:11
      at Generator.next (<anonymous>)
      at fulfilled (node_modules/.pnpm/@usecannon+builder@2.9.0_ethers@5.7.2_hardhat@2.18.1_solc@0.8.22_typedoc@0.25.2/node_modules/@usecannon/builder/dist/error/index.js:5:58)
      at processTicksAndRejections (node:internal/process/task_queues:95:5)



 ELIFECYCLE  Test failed. See above for more details.
```
