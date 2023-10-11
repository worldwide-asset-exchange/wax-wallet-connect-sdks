export const WAXChainData: {
  [key: string]: {
    id: string
    name: string
    rpc: string[]
    slip44: number
    testnet: boolean
  }
} = {
  '1064487b3cd1a897ce03ae5b6a865651': {
    id: 'antelope:1064487b3cd1a897ce03ae5b6a865651',
    name: 'WAX Mainnet',
    rpc: ['https://wax.greymass.com/v1/chain/'],
    slip44: 501,
    testnet: false
  },
  e0b5f2532f0f4fcc4da2fc440943131b: {
    id: 'antelope:e0b5f2532f0f4fcc4da2fc440943131b',
    name: 'WAX Testnet',
    rpc: ['https://stg2-history.thh.io/v1/chain/'],
    slip44: 501,
    testnet: true
  }
}

export const WAXMetadata: {
  [key: string]: {
    logo: string
    rgb: string
  }
} = {
  // WAX Mainnet
  '1064487b3cd1a897ce03ae5b6a865651': {
    logo: '/assets/wax-logo-512.png',
    rgb: '0, 0, 0'
  },
  // WAX Testnet
  e0b5f2532f0f4fcc4da2fc440943131b: {
    logo: '/assets/wax-logo-512.png',
    rgb: '0, 0, 0'
  }
}

export const WAXRpc: {
  [key: string]: {
    name: string
    rpc: string
  }
} = {
  'antelope:1064487b3cd1a897ce03ae5b6a865651': {
    name: 'WAX Mainnet',
    rpc: 'https://wax.greymass.com'
  },
  'antelope:e0b5f2532f0f4fcc4da2fc440943131b': {
    name: 'WAX Testnet',
    rpc: 'https://stg2-history.thh.io'
  }
}

export function getChainMetadata(chainId: string) {
  const reference: string = chainId.split(':')[1] || ''
  const metadata = WAXMetadata[reference]
  if (typeof metadata === 'undefined') {
    throw new Error(`No chain metadata found for chainId: ${chainId}`)
  }
  return metadata
}
