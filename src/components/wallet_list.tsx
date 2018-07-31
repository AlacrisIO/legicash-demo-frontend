import * as React from 'react'
import { connect } from 'react-redux'
import { Address } from '../types/address'
import { List } from '../types/immutable'
import { UIState } from '../types/state'
import { Wallet } from './wallet'

export const DumbWalletList = ({ wl }: { wl: List<Address> }) =>
    <div>{...wl.map((address: Address, i: number) => {
        const WalletComponent = Wallet({ address })
        return <WalletComponent key={i} />
    }).toArray()}</div>

export const WalletList = connect(
    (state: UIState) => ({ wl: state.displayedAccounts }),
    (dispatch: (a: any) => any) => ({ /* empty */ })
)(DumbWalletList)
