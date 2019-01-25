import * as React from 'react'
import { connect } from 'react-redux'
import { Container } from 'semantic-ui-react'
import { Address } from '../types/address'
import { List } from '../types/immutable'
import { UIState } from '../types/state'
import { Wallet } from './wallet'

export const DumbWalletList = ({ wl }: { wl: List<Address> }) =>
    <Container>
    <div className={'slider'} style={{marginTop: '10px', marginBottom: '50px' }} >
        {
        ...wl.map((address: Address, key: number) => {
            const WalletComponent = Wallet({ address })
            return <div key={key} className={'slide'} ><WalletComponent key={key} /></div>
        }).toArray()
        }
    </div>
    </Container>

export const WalletList = connect(
    (state: UIState) => ({ wl: state.displayedAccounts }),
    (dispatch: (a: any) => any) => ({ /* empty */ })
)(DumbWalletList)
