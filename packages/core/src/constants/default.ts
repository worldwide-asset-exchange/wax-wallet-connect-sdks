/* eslint-disable no-undef */
if (!process.env.REACT_APP_PUBLIC_PROJECT_ID)
  throw new Error('`REACT_APP_PUBLIC_PROJECT_ID` env variable is missing.')

export const DEFAULT_MAIN_CHAINS = [
  // mainnets
  'antelope:1064487b3cd1a897ce03ae5b6a865651'
]

export const DEFAULT_TEST_CHAINS = [
  // testnets
  'antelope:e0b5f2532f0f4fcc4da2fc440943131b'
]

export const DEFAULT_WAX_METHODS = {
  WAX_SIGN_TRANSACTION: 'wax_sign_transaction',
  WAX_SIGN_MESSAGE: 'wax_sign_message',
  WAX_PUSH_TRANSACTION: 'wax_push_transaction',
  WAX_SIGN_PUSH_TRANSACTION: 'wax_sign_push_transaction',
  WAX_GET_AVAILABLE_KEYS: 'wax_get_available_keys'
}

export const ACTIVE_WAX_METHODS = {
  ...DEFAULT_WAX_METHODS,
  SERIALIZED_TRANSACTION: 'serialized_transaction'
}

export const DEFAULT_WAX_EVENTS = {}

export const DEFAULT_CHAINS = [...DEFAULT_MAIN_CHAINS, ...DEFAULT_TEST_CHAINS]

export const DEFAULT_PROJECT_ID = process.env.REACT_APP_PUBLIC_PROJECT_ID || ''
export const DEFAULT_RELAY_URL = process.env.REACT_APP_PUBLIC_RELAY_URL || ''

export const DEFAULT_LOGGER = 'silent'

export const DEFAULT_APP_METADATA = {
  name: 'DApp Test',
  description: 'DApp for WalletConnect',
  url: 'https://walletconnect.com/',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

export const REGIONALIZED_RELAYER_ENDPOINTS = [
  {
    value: DEFAULT_RELAY_URL,
    label: 'Default'
  },

  {
    value: 'wss://us-east-1.relay.walletconnect.com',
    label: 'US'
  },
  {
    value: 'wss://eu-central-1.relay.walletconnect.com',
    label: 'EU'
  },
  {
    value: 'wss://ap-southeast-1.relay.walletconnect.com',
    label: 'Asia Pacific'
  }
]
