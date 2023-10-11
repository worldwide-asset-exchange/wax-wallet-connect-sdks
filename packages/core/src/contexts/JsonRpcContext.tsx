import React, { PropsWithChildren } from 'react'
import { createContext, useContext } from 'react'

import { DEFAULT_WAX_METHODS, ERROR_MESSAGES } from '../constants'
import { useWalletConnectClient } from './ClientContext'
import { getEOSConfig } from '../helpers'
import { Transaction } from 'eosjs/dist/eosjs-api-interfaces'
import { SerializedAction } from 'eosjs/dist/eosjs-serialize'

export const JsonRpcContext = createContext({})

export function JsonRpcContextProvider({ children }: PropsWithChildren) {
  const { client, session } = useWalletConnectClient()

  const _createJsonRpcRequestHandler =
    (rpcRequest: any) =>
    async (
      chainId: string,
      account: string,
      publicKeys?: string[],
      transaction?: any,
      serializedTransaction?: any,
      serializedContextFreeData?: any
    ) => {
      if (typeof client === 'undefined') {
        throw new Error(ERROR_MESSAGES.WalletConnect_NotInitialize)
      }
      if (typeof session === 'undefined') {
        throw new Error(ERROR_MESSAGES.WalletConnect_SessionNotConnected)
      }

      const result = await rpcRequest(
        chainId,
        account,
        publicKeys,
        transaction,
        serializedTransaction,
        serializedContextFreeData
      )
      return result
    }

  const ping = async () => {
    if (typeof client === 'undefined') {
      throw new Error(ERROR_MESSAGES.WalletConnect_NotInitialize)
    }
    if (typeof session === 'undefined') {
      throw new Error(ERROR_MESSAGES.WalletConnect_SessionNotConnected)
    }

    let valid = false

    try {
      await client.ping({ topic: session.topic })
      valid = true
    } catch (e) {
      valid = false
    }
    return valid
  }

  const serializeTransaction = async (chainId: string, actions: any) => {
    const { api } = getEOSConfig(chainId)

    const result = await api.transact(
      {
        actions
      },
      {
        blocksBehind: 3,
        expireSeconds: 30,
        broadcast: false,
        sign: false
      }
    )
    return result
  }

  const waxRpc = {
    signTransaction: _createJsonRpcRequestHandler(
      async (
        chainId: string,
        account: string,
        publicKeys: string[],
        transaction: Transaction,
        serializedTransaction: SerializedAction,
        serializedContextFreeData = null
      ) => {
        const result = await client?.request({
          chainId: chainId,
          topic: session?.topic || '',
          request: {
            method: DEFAULT_WAX_METHODS.WAX_SIGN_TRANSACTION,
            params: {
              required_keys: publicKeys,
              transaction,
              serialized_transaction: serializedTransaction,
              serialized_context_free_data: serializedContextFreeData
            }
          }
        })

        return {
          method: DEFAULT_WAX_METHODS.WAX_SIGN_TRANSACTION,
          account,
          publicKeys,
          valid: true,
          result
        }
      }
    ),

    getAvailablePublicKey: _createJsonRpcRequestHandler(
      async (chainId: string, account: string) => {
        const result: { public_keys: string[] } | undefined =
          await client?.request({
            chainId,
            topic: session?.topic || '',
            request: {
              method: DEFAULT_WAX_METHODS.WAX_GET_AVAILABLE_KEYS,
              params: {
                account
              }
            }
          })

        return {
          method: DEFAULT_WAX_METHODS.WAX_GET_AVAILABLE_KEYS,
          account,
          publicKeys: result?.public_keys,
          valid: true,
          result: result
        }
      }
    ),

    signMessage: _createJsonRpcRequestHandler(
      async (
        chainId: string,
        account: string,
        publicKeys: string[],
        messages: string[]
      ) => {
        const result = await client?.request({
          chainId,
          topic: session?.topic || '',
          request: {
            method: DEFAULT_WAX_METHODS.WAX_SIGN_MESSAGE,
            params: { required_keys: publicKeys, message: messages }
          }
        })

        return {
          method: DEFAULT_WAX_METHODS.WAX_SIGN_MESSAGE,
          account,
          publicKeys,
          valid: true,
          result
        }
      }
    ),
    signAndPushTransaction: _createJsonRpcRequestHandler(
      async (
        chainId: string,
        account: string,
        publicKeys: string[],
        transaction: Transaction,
        serialized_transaction: SerializedAction,
        serializedContextFreeData = null
      ) => {
        const result = await client?.request({
          chainId: chainId,
          topic: session?.topic || '',
          request: {
            method: DEFAULT_WAX_METHODS.WAX_SIGN_PUSH_TRANSACTION,
            params: {
              required_keys: publicKeys,
              transaction,
              serialized_transaction,
              serialized_context_free_data: serializedContextFreeData
            }
          }
        })

        return {
          method: DEFAULT_WAX_METHODS.WAX_SIGN_PUSH_TRANSACTION,
          account,
          publicKeys,
          valid: true,
          result
        }
      }
    )
  }

  return (
    <JsonRpcContext.Provider
      value={{
        ping,
        waxRpc,
        serializeTransaction
      }}
    >
      {children}
    </JsonRpcContext.Provider>
  )
}

export function useJsonRpc() {
  const context = useContext(JsonRpcContext)
  if (context === undefined) {
    throw new Error('useJsonRpc must be used within a JsonRpcContextProvider')
  }
  return context
}
