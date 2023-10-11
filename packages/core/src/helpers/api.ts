import axios from 'axios'

export const waxRpcProviders: {
  [key: string]: {
    name: string
    baseURL: string
    token: {
      name: string
      symbol: string
    }
  }
} = {
  e0b5f2532f0f4fcc4da2fc440943131b: {
    name: 'WAX Testnet',
    baseURL: 'https://stg2-history.thh.io/v1/chain',
    token: {
      name: 'WAX Token',
      symbol: 'WAX'
    }
  },
  '1064487b3cd1a897ce03ae5b6a865651': {
    name: 'WAX Mainnet',
    baseURL: 'https://api.waxnet.io/v1/chain',
    token: {
      name: 'WAX Token',
      symbol: 'WAX'
    }
  }
}

const api = axios.create({
  baseURL: 'https://ethereum-api.xyz',
  timeout: 10000, // 10 secs
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

export async function apiGetAccountBalance(address: string, chainId: string) {
  const namespace = chainId.split(':')[0]
  if (namespace === 'antelope') {
    const waxChainId = chainId.split(':')[1]
    const rpc = waxRpcProviders[waxChainId]

    const { baseURL, token } = rpc
    const response = await api.post(`${baseURL}/get_account`, {
      account_name: address
    })

    let balance = response.data.core_liquid_balance
    balance = balance.split(' ')[0].replace('.', '')

    return { balance, ...token }
  }
}
