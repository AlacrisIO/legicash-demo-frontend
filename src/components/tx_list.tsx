import * as React    from 'react';
import {Container}   from 'semantic-ui-react'
import {Address}     from '../types/address'
import {Transaction} from '../types/tx'
import {Tx}          from './tx'

export const TxList = ({ txs, owner }: { txs: Transaction[], owner: Address }) => {

    const sortByCreationDesc = (a: Transaction, b: Transaction) =>
        a.creationDate < b.creationDate
            ? 1
            : -1;

    if (txs.length) {
        return <Container className="txList">
            {
                ...txs
                    .sort(sortByCreationDesc)
                    .map((tx: Transaction, key: number): any => {
                            if (!tx) {
                                return  null;
                            }

                            const TxComponent = Tx({ tx, owner })

                            return <TxComponent key={key} />
                        })
                    .filter((item: any) => !!item)
            }
        </Container>
    } else {
        return <Container className="txList" textAlign={'center'}>
                    <span style={{fontStyle: 'italic'}}>No transactions</span>
                </Container>
    }
}
