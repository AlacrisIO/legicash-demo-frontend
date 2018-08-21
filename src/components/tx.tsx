import * as React from 'react';
import { connect } from 'react-redux'

import { proofRequested } from '../types/actions/proofs'
import { UIState } from '../types/state';
import { defaultValues, Transaction } from '../types/tx'

import { ProofDisplay } from './merkle_proof'
import { SecondsSince } from './seconds_since'

// XXX: Needs some indication of the direction cross-chain txs go in.

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

/* tslint:disable:object-literal-sort-keys */  // Ordered this way in display
const defaultColumns = {
    'src num': (tx: Transaction) => tx.srcSideChainRevision,
    'dst num': (tx: Transaction) => tx.dstSideChainRevision,
    'seen for': (tx: Transaction) =>
        tx.creationDate && <SecondsSince time={tx.creationDate} />,
    'from': (tx: Transaction) => (tx.from && tx.from.toString().slice(0, 10)),
    'to': (tx: Transaction) => (tx.to && tx.to.toString().slice(0, 10)),
    'amount': (tx: Transaction) => tx.amount,
    'validated': (tx: Transaction) =>
        (tx.validated && 'valid') || (
            tx.rejected && 'rejected: ' + tx.failureMessage) || 'pending',
}

interface ITx { tx: Transaction, requestProof: () => void }
/** A row corresponding to a tx. */
export const DumbTx = ({ tx, requestProof }: ITx): JSX.Element => {
    const txVals = []
    /* tslint:disable:forin */
    for (const colName in defaultColumns) {
        txVals.push(<td key={txVals.length}>{defaultColumns[colName](tx)}</td>)
    }
    txVals.push(
        <td key={txVals.length}>
            <ProofDisplay tx={tx} requestProof={requestProof} />
        </td>
    )
    return <tr className={txClass(tx)}>
        {...txVals}
    </tr>
}

export const Tx = ({ tx }: ITx) => connect(
    (state: UIState) => ({ tx: state.txByGUID.get(tx.getGUID()) }),
    (dispatch: any) => ({ requestProof: dispatch(proofRequested(tx)) }))(
        DumbTx)

export const txHeader = ({ colOrder }: { colOrder?: headers }) =>
    <tr>{...Object.keys(defaultColumns).map(
        (h, i) => <td key={i}><b>{h}</b></td>)}</tr>
