import { WAXRpc } from '../constants'
import { Api, JsonRpc } from 'eosjs'

export const getEOSConfig = (chainId: string) => {
  const provider: any = null
  const rpc = new JsonRpc(WAXRpc[chainId].rpc)
  const api = new Api({ rpc, signatureProvider: provider })
  return { rpc, api }
}
