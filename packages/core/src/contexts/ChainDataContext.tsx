import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState
} from 'react'

import { WAXChainData } from '../constants'
import { getAllChainNamespaces } from '../helpers'

/**
 * Context
 */
export const ChainDataContext = createContext({})

/**
 * Provider
 */
export function ChainDataContextProvider({ children }: PropsWithChildren) {
  const [chainData, setChainData] = useState({})

  const loadChainData = async () => {
    const namespaces = getAllChainNamespaces()
    const chainData: any = {}
    await Promise.all(
      namespaces.map(async (namespace: string) => {
        let chains
        switch (namespace) {
          case 'antelope':
            chains = WAXChainData
            break
          default:
            console.error('Unknown chain namespace: ', namespace)
        }

        if (typeof chains !== 'undefined') {
          chainData[namespace] = chains
        }
      })
    )

    setChainData(chainData)
  }

  useEffect(() => {
    loadChainData()
  }, [])

  return (
    <ChainDataContext.Provider
      value={{
        chainData
      }}
    >
      {children}
    </ChainDataContext.Provider>
  )
}

export function useChainData() {
  const context = useContext(ChainDataContext)
  if (context === undefined) {
    throw new Error(
      'useChainData must be used within a ChainDataContextProvider'
    )
  }
  return context
}
