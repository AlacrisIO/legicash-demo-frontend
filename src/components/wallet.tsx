import * as React from 'react'
import { connect } from 'react-redux'
import { Address } from '../types/address'
import { UIState } from '../types/state'
// import { TxList } from './tx_list'  // Will need this later...
import { Wallet as WalletType } from '../types/wallet'

export const DumbWallet = ({ wallet }: { wallet: WalletType }) =>
    <div>
        <h2>Username: {wallet.username}</h2>
        <p>Address: {wallet.address.toString()}</p>
        <p>Offchain balance: {wallet.offchainBalance}</p>
        <p>Onchain balance: {wallet.onchainBalance}</p>
        <p>Transaction list: To be completed</p>
    </div>

export const Wallet =
    ({ address }: { address: Address }) =>
        connect(
            (state: UIState) => {
                const wallet = state.accounts.get(address)
                if (wallet === undefined) {
                    throw Error(`Wallet for unknown address! \
${address}`)
                }
                return { wallet }
            },
            (dispatch: (a: any) => any) => ({ /* empty */ })
        )(DumbWallet) 
