import * as React from 'react';

import { defaultValues, Transaction } from '../types/tx'

/* Representation of the epistemic state of a Tx in the frontend */
export type txCSSClass = 'pending' | 'valid' | 'invalid'

/* Determine CSS class name for Tx representation, based on epistemic status */
const txClass = (tx: Transaction) => {
    if (tx.validated) {
        if (tx.rejected) {
            throw Error(`Tx with inconsistent validation/rejection status! ${tx}`)
        }
        return 'valid'
    }
    if (tx.rejected) { return 'invalid' }
    return 'pending'
}

type header = keyof (typeof defaultValues)
type headers = header[]
const defaultColumns: headers =
    ['from', 'to', 'amount', 'validated', 'rejected', 'failureMessage']

// Verify that columns are all keys of transactions
const t = new Transaction({})
defaultColumns.map((k: string) => {
    if (!t.has(k)) { throw Error(`Missing key! ${k}, ${t}`) }
})

const concreteColOrder = (colOrder: headers | undefined, f: (n: header) => JSX.Element
): JSX.Element[] =>
    (colOrder ? colOrder : defaultColumns).map((fieldName: header, key: number) =>
        <td key={key}>{f(fieldName)}</td>)

interface ITx { tx: Transaction; colOrder?: headers }

/** A row corresponding to a tx. */
// XXX: Do something prettier with pending Txs. Maybe a spinner...
export const Tx = ({ tx, colOrder }: ITx) =>
    <tr className={txClass(tx)}>
        {...concreteColOrder(colOrder, (k: header) =>
            <p>{`${(tx.get(k) || '').toString().slice(0, 15)}`}</p>)}
    </tr>

export const txHeader = ({ colOrder }: { colOrder?: headers }) =>
    <tr>{...concreteColOrder(colOrder, (n: header) => <b>{n}</b>)}</tr>
