import * as React from 'react';
import { Transaction } from '../types/tx'
import { Tx, txHeader } from './tx'

export const TxList = ({ txs }: { txs: Transaction[] }) =>
    <table className="txList">
        <thead>{txHeader({})}</thead>
        <tbody>
            {...txs.map((tx: Transaction, key: number): any => {
                const TxComponent = Tx({ tx })
                return <TxComponent key={key} />
            })}
        </tbody>
    </table>
