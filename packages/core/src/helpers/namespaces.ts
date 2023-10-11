import { ProposalTypes } from '@walletconnect/types'
import { DEFAULT_WAX_EVENTS, DEFAULT_WAX_METHODS } from '../constants'

export const getNamespacesFromChains = (chains: string[]) => {
  const supportedNamespaces: string[] = []
  chains.forEach((chainId) => {
    const [namespace] = chainId.split(':')
    if (!supportedNamespaces.includes(namespace)) {
      supportedNamespaces.push(namespace)
    }
  })

  return supportedNamespaces
}

export const getSupportedMethodsByNamespace = (namespace: string) => {
  switch (namespace) {
    case 'antelope':
      return Object.values(DEFAULT_WAX_METHODS)
    default:
      throw new Error(`No default methods for namespace: ${namespace}`)
  }
}

export const getSupportedEventsByNamespace = (namespace: string) => {
  switch (namespace) {
    case 'antelope':
      return Object.values(DEFAULT_WAX_EVENTS)
    default:
      throw new Error(`No default events for namespace: ${namespace}`)
  }
}

export const getRequiredNamespaces = (
  chains: string[]
): ProposalTypes.RequiredNamespaces => {
  const selectedNamespaces = getNamespacesFromChains(chains)

  return Object.fromEntries(
    selectedNamespaces.map((namespace) => [
      namespace,
      {
        methods: getSupportedMethodsByNamespace(namespace),
        chains: chains.filter((chain) => chain.startsWith(namespace)),
        events: getSupportedEventsByNamespace(namespace)
      }
    ])
  ) as ProposalTypes.RequiredNamespaces
}
