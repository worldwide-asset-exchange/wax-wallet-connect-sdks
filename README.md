# Wax WalletConnect SDK

This repository provides [Wax WalletConnect](https://monica.thh.io/wax/wax-wallet-connect-sdks.git) functionality in ReactJS for developing DApp With Wax WalletConnect.

### Supported features

WAX WalletConnect Functional: 
- Connect Session WalletConnect.
- Call methods wallet connect testnet or mainnet. Ex: Sign Message, Sign Transaction, Sign And Push Transaction.
- Api Get Information.
---

## Contents

- [Set up]()
- [Implementation]()
---

## Set up

### Prerequisites

- [ReactJS](https://react.dev/learn).

### Installation

Install package @wax-wallet-connect/sdk-core
```
npm install @wax-wallet-connect/sdk-core
```



### Setup Provider

Define signClient Options and Web3Modal Actions.

`
  const signClientOpts = {
    logger: '...',
    projectId: '...',
    metadata: '...',
    ...
  };

  const web3ModalOpts = {
    projectId: '....',
    themeMode: '...',
    ...
  };
`


Define Context Provider With Init Options.

`
  <ChainDataContextProvider>
    <ClientContextProvider
      web3ModalOpts={web3ModalOpts}
      signClientOpts={signClientOpts}
      ...
    >
      <JsonRpcContextProvider>
        {..YOUR_CODE_HERE...}
      </JsonRpcContextProvider>
    </ClientContextProvider>
  </ChainDataContextProvider>
`

## Implementation SDK.

### Implement a connect session client Dapp using hooks called useWalletConnectClient.

Example:
`
const { connect,... } =
    useWalletConnectClient();
`
### Implement WAX RPC methods using hooks called useJsonRpc.
Example: 
`
  const { waxRpc, serializeTransaction,... } =
    useWalletConnectClient();
`

### Get Chain Data using hooks called useChainData.
`
  const { chainData } = useChainData()
`

### Environment variables

Create a new file `.env` at the `PROJECT-ROOT` and copy/paste the following environment variables. 

```
```
