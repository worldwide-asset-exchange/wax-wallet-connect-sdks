import Client from '@walletconnect/sign-client'
import { Web3Modal, Web3ModalConfig } from '@web3modal/standalone'

import React, {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import { getSdkError } from '@walletconnect/utils'
import { DEFAULT_RELAY_URL, DEFAULT_TEST_CHAINS } from '../constants'
import { apiGetAccountBalance } from '../helpers'
import { getRequiredNamespaces } from '../helpers/namespaces'
import {
  SignClientTypes,
  SessionTypes,
  PairingTypes
} from '@walletconnect/types'

export interface ClientContextState {
  pairings?: PairingTypes.Struct[]
  isInitializing?: boolean
  balances?: any
  isFetchingBalances?: boolean
  accounts?: any[]
  chains?: string[]
  relayerRegion?: string
  client?: Client
  session?: SessionTypes.Struct
  connect?: (pairing?: any) => Promise<void>
  disconnect?: () => Promise<void>
  setChains?: React.Dispatch<React.SetStateAction<string[]>>
  setRelayerRegion?: React.Dispatch<React.SetStateAction<string>>
  getAccountBalances?: (_accounts: string[]) => Promise<void>
}
export interface ClientContextProviderProps {
  defaultChains?: string[]
  defaultRelayUrl?: string
  signClientOpts: SignClientTypes.Options
  web3ModalOpts: Web3ModalConfig
}

export const ClientContext = createContext<ClientContextState>({})
export function ClientContextProvider({
  children,
  defaultChains = DEFAULT_TEST_CHAINS,
  defaultRelayUrl = DEFAULT_RELAY_URL,
  web3ModalOpts,
  signClientOpts
}: PropsWithChildren<ClientContextProviderProps>) {
  const [client, setClient] = useState<Client>()
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>()
  const [pairings, setPairings] = useState<PairingTypes.Struct[]>([])
  const [session, setSession] = useState<SessionTypes.Struct>()

  const [isFetchingBalances, setIsFetchingBalances] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const prevRelayerValue = useRef('')

  const [balances, setBalances] = useState<any>({})
  const [accounts, setAccounts] = useState<any[]>([])
  const [chains, setChains] = useState<string[]>(defaultChains)
  const [relayerRegion, setRelayerRegion] = useState(defaultRelayUrl)

  const reset = useCallback(() => {
    setSession(undefined)
    setBalances({})
    setAccounts([])
    setChains(defaultChains)
    setRelayerRegion(defaultRelayUrl || '')
  }, [defaultChains, defaultRelayUrl])

  const getAccountBalances = useCallback(async (_accounts: string[]) => {
    setIsFetchingBalances(true)
    try {
      const arr = await Promise.all(
        _accounts.map(async (account) => {
          const [namespace, reference, address] = account.split(':')
          const chainId = `${namespace}:${reference}`
          const assets = await apiGetAccountBalance(address, chainId)
          return { account, assets: [assets] }
        })
      )

      const balances: any = {}
      arr.forEach(({ account, assets }) => {
        balances[account] = assets
      })
      console.log('balances', { balances })
      setBalances(balances)
    } catch (e) {
      console.error(e)
    } finally {
      setIsFetchingBalances(false)
    }
  }, [])

  const onSessionConnected = useCallback(
    async (_session: SessionTypes.Struct) => {
      const allNamespaceAccounts = Object.values(_session.namespaces)
        .map((namespace: any) => namespace.accounts)
        .flat()

      setSession(_session)
      setChains(_session.requiredNamespaces?.antelope.chains || [])
      setAccounts(allNamespaceAccounts)
      await getAccountBalances(allNamespaceAccounts)
    },
    [getAccountBalances]
  )

  const connect = useCallback(
    async (pairing?: any) => {
      if (typeof client === 'undefined') {
        throw new Error('WalletConnect is not initialized')
      }
      console.log('connect, pairing topic is:', pairing?.topic)
      try {
        const requiredNamespaces = getRequiredNamespaces(chains)
        console.log(
          'requiredNamespaces config for connect:',
          requiredNamespaces,
          chains
        )

        const { uri, approval } = await client.connect({
          pairingTopic: pairing?.topic,
          requiredNamespaces
        })

        // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
        if (uri) {
          // Create a flat array of all requested chains across namespaces.
          const standaloneChains = Object.values(requiredNamespaces)
            .map((namespace) => namespace.chains)
            .flat()

          web3Modal?.openModal({ uri, standaloneChains })
        }

        const session = await approval()
        console.log('Established session:', session)
        await onSessionConnected(session)
        // Update known pairings after session is connected.
        setPairings(client?.pairing.getAll({ active: true }))
      } catch (e) {
        console.error(e)
        // ignore rejection
      } finally {
        // close modal in case it was open
        web3Modal?.closeModal()
      }
    },
    [chains, client, onSessionConnected, web3Modal]
  )

  const disconnect = useCallback(async () => {
    if (typeof client === 'undefined') {
      throw new Error('WalletConnect is not initialized')
    }
    if (typeof session === 'undefined') {
      throw new Error('Session is not connected')
    }

    try {
      await client.disconnect({
        topic: session.topic,
        reason: getSdkError('USER_DISCONNECTED')
      })
    } catch (error) {
      console.error('SignClient.disconnect failed:', error)
    } finally {
      // Reset app state after disconnect.
      reset()
    }
  }, [client, reset, session])

  const _subscribeToEvents = useCallback(
    async (_client: Client) => {
      if (typeof _client === 'undefined') {
        throw new Error('WalletConnect is not initialized')
      }

      _client.on('session_ping', (args) => {
        console.log('EVENT', 'session_ping', args)
      })

      _client.on('session_event', (args) => {
        console.log('EVENT', 'session_event', args)
      })

      _client.on('session_update', ({ topic, params }) => {
        console.log('EVENT', 'session_update', { topic, params })
        const { namespaces } = params
        const _session = _client.session.get(topic)
        const updatedSession = { ..._session, namespaces }
        onSessionConnected(updatedSession)
      })

      _client.on('session_delete', () => {
        console.log('EVENT', 'session_delete')
        reset()
      })
    },
    [onSessionConnected, reset]
  )

  const _checkPersistedState = useCallback(
    async (_client: Client) => {
      if (typeof _client === 'undefined') {
        throw new Error('WalletConnect is not initialized')
      }
      // populates existing pairings to state
      setPairings(_client.pairing.getAll({ active: true }))
      console.log(
        'RESTORED PAIRINGS: ',
        _client.pairing.getAll({ active: true })
      )

      if (typeof session !== 'undefined') return
      // populates (the last) existing session to state
      if (_client.session.length) {
        const lastKeyIndex = _client.session.keys.length - 1
        const _session = _client.session.get(_client.session.keys[lastKeyIndex])
        console.log('RESTORED SESSION:', _session)
        await onSessionConnected(_session)
        return _session
      }
    },
    [session, onSessionConnected]
  )

  const _logClientId = useCallback(async (_client: Client) => {
    if (typeof _client === 'undefined') {
      throw new Error('WalletConnect is not initialized')
    }
    try {
      const clientId = await _client.core.crypto.getClientId()
      console.log('WalletConnect ClientID: ', clientId)
      localStorage.setItem('WALLETCONNECT_CLIENT_ID', clientId)
    } catch (error) {
      console.error(
        'Failed to set WalletConnect clientId in localStorage: ',
        error
      )
    }
  }, [])

  const createClient = useCallback(async () => {
    try {
      const _web3Modal = new Web3Modal({
        ...web3ModalOpts,
        walletConnectVersion: 2
      })
      setIsInitializing(true)

      const _client = await Client.init({
        ...signClientOpts,
        relayUrl: relayerRegion
      })
      setWeb3Modal(_web3Modal)
      setClient(_client)
      prevRelayerValue.current = relayerRegion
      await _subscribeToEvents(_client)
      await _checkPersistedState(_client)
      await _logClientId(_client)
    } catch (err) {
      throw err
    } finally {
      setIsInitializing(false)
    }
  }, [
    web3ModalOpts,
    signClientOpts,
    relayerRegion,
    _subscribeToEvents,
    _checkPersistedState,
    _logClientId
  ])

  useEffect(() => {
    if (!client) {
      createClient()
    } else if (prevRelayerValue.current !== relayerRegion) {
      client.core.relayer.restartTransport(relayerRegion)
      prevRelayerValue.current = relayerRegion || ''
    }
  }, [createClient, relayerRegion, client])

  const value = useMemo(
    () =>
      ({
        pairings,
        isInitializing,
        balances,
        isFetchingBalances,
        accounts,
        chains,
        relayerRegion,
        client,
        session,
        connect,
        disconnect,
        setChains,
        setRelayerRegion,
        getAccountBalances
      }) as ClientContextState,
    [
      pairings,
      isInitializing,
      balances,
      isFetchingBalances,
      accounts,
      chains,
      relayerRegion,
      client,
      session,
      connect,
      disconnect,
      setChains,
      setRelayerRegion,
      getAccountBalances
    ]
  )

  return (
    <ClientContext.Provider
      value={{
        ...value
      }}
    >
      {children}
    </ClientContext.Provider>
  )
}

export function useWalletConnectClient() {
  const context = useContext(ClientContext)
  if (context === undefined) {
    throw new Error(
      'useWalletConnectClient must be used within a ClientContextProvider'
    )
  }
  return context
}
