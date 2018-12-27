import * as React from 'react';
import {Container} from 'semantic-ui-react'
import { Address } from '../types/address'
import { Transaction } from '../types/tx'
import { Tx } from './tx'

export const TxList = ({ txs, owner }: { txs: Transaction[], owner: Address }) => {
    
    if (txs.length) {
        return <Container className="txList">
            {...txs.map((tx: Transaction, key: number): any => {
                const TxComponent = Tx({ tx, owner })
                return <TxComponent key={key} />
            })}
        </Container>
    } else {
        return <Container className="txList" textAlign={'center'}>
                    <span style={{fontStyle: 'italic'}}>No transactions</span>
                </Container>
    }
    
}
    
