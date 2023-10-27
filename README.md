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
    ✔ Should work on hardhat (649ms)


  1 passing (649ms)
```

- Running identical code on cannon / anvil breaks.
  - To test this, run `pnpm t -- --network cannon`
  - This test suite deploys the same contracts using `cannonfile.toml`.
  - You should get output similar to:

```console
> synthetix-sandbox-trading-example@0.0.1 test /Users/kevin/development/infinex/anvil-revert-issue
> hardhat test "--network" "cannon"

No need to generate any newer typings.


  Relayer
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
 - Deploy Url: ipfs://QmXvzBkKAMDFB7GGFBatzv1cpY459pa5sNH4KciEAQ1Sn9

    1) Should work on cannon / anvil


  0 passing (4s)
  1 failing

  1) Relayer
       Should work on cannon / anvil:
     Error: transaction reverted in contract unknown: processing response error (body="{\"jsonrpc\":\"2.0\",\"id\":53,\"error\":{\"code\":-32603,\"message\":\"EVM error InvalidFEOpcode\"}}", error={"code":-32603}, requestBody="{\"method\":\"eth_estimateGas\",\"params\":[{\"type\":\"0x2\",\"maxFeePerGas\":\"0xd09dc300\",\"maxPriorityFeePerGas\":\"0x59682f00\",\"from\":\"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266\",\"to\":\"0xe661b3f15d0310af885f4d5c6482c0b5a8c0523d\",\"data\":\"0xd7513467000000000000000000000000000000000000000000000000000000000000002000000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8000000000000000000000000f275321e2e6a907f9113f037ef9ecc22b4dd4ff4000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000f4240f11f70161e18a98ef976d4690cb725e856bed5af38bff4d42085db7fa2104c1600000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000004cfae3217000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000041b2d02e882e354782f2abdd80fa61b4c4f88c2312106755d3552c24642788ff986ac263ce63c4edfbe8373df2ad3ef3f92b2e4ef1c05af612d5aea061565ca8fe1b00000000000000000000000000000000000000000000000000000000000000\"}],\"id\":53,\"jsonrpc\":\"2.0\"}", requestMethod="POST", url="http://127.0.0.1:8545", code=SERVER_ERROR, version=web/5.7.1)

  CALL Relayer.execute("0x70997970C51812dc3A010C7d01b50e0d17dc79C8,0xF275321e2e6a907F9113F037ef9ECc22b4DD4ff4,0,1000000,109062942359454510980041885896715456382021449455679722187535746009388207328278,0xcfae3217,0xb2d02e882e354782f2abdd80fa61b4c4f88c2312106755d3552c24642788ff986ac263ce63c4edfbe8373df2ad3ef3f92b2e4ef1c05af612d5aea061565ca8fe1b") => () (45,831 gas)
    STATICCALL 0x0000000000000000000000000000000000000001.0xb372f08aa818006e9cfc5c1adf2ce3b139489390da62fba607e1af1af19ca06b000000000000000000000000000000000000000000000000000000000000001bb2d02e882e354782f2abdd80fa61b4c4f88c2312106755d3552c24642788ff986ac263ce63c4edfbe8373df2ad3ef3f92b2e4ef1c05af612d5aea061565ca8fe => 0x00000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c8 (3,000 gas)
    STATICCALL ForwarderGreeterTest.isTrustedForwarder("0xE661b3F15d0310af885f4D5c6482C0b5a8C0523D") => ("true") (2,786 gas)
    CALL ForwarderGreeterTest.greet() => () (4,968 gas)


      at /Users/kevin/development/infinex/anvil-revert-issue/node_modules/.pnpm/@usecannon+builder@2.9.0_ethers@5.7.2_hardhat@2.18.1_solc@0.8.22_typedoc@0.25.2/node_modules/@usecannon/builder/src/error/index.ts:83:11
      at Generator.next (<anonymous>)
      at fulfilled (node_modules/.pnpm/@usecannon+builder@2.9.0_ethers@5.7.2_hardhat@2.18.1_solc@0.8.22_typedoc@0.25.2/node_modules/@usecannon/builder/dist/error/index.js:5:58)
      at processTicksAndRejections (node:internal/process/task_queues:95:5)



 ELIFECYCLE  Test failed. See above for more details.
```

## Expected Outcome

Running these tests should succeed on both hardhat and anvil.

## Actual Outcome

Running these tests succeeds on hardhat but not on anvil. Replacing `invalid()` with `revert()` also resolves the issue, but it should not, as the body of the `if` statement there is clearly not running.
