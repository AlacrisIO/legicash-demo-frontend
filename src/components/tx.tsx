import * as React from 'react';
import { connect } from 'react-redux'
import { Segment } from 'semantic-ui-react'
import { proofRequested } from '../types/actions/proofs'
import { Address } from '../types/address'
import { UIState } from '../types/state';
import { Transaction } from '../types/tx'
import { ProofDisplay } from './merkle_proof'
import { name } from './select_account'

// XXX: Needs some indication of the direction cross-chain txs go in.

/* Representation of the epistemic state of a Tx in the frontend */
export type txCSSClass = 'pending' | 'valid' | 'invalid'

// /* Determine CSS class name for Tx representation, based on epistemic status */
const txClass = (tx: Transaction) => {
    if (tx.validated) {
        if (tx.rejected) {
            // throw Error(`Tx with inconsistent validation/rejection status! ${tx}`)
            return <span className={"gray status"} >Inconsistent</span>
        }
        return <span className={"green status"} >Valid</span>
    }
    if (tx.rejected) { 
        return <span className={"red status"} >Invalid</span>
    }
    
    return <span className={"yellow status"} >Pending</span>
}

const txType = (tx: Transaction, owner: Address) => {
    if (owner.equals(tx.from)) {
        return 'Payment'
    }

    if (owner.equals(tx.to)) {
        return 'Received'
    }

    if (owner.equals(tx.to) && owner.equals(tx.from)) {
        return 'Payment to self'
    }

    return 'Unknown'
}

interface ITx { 
    tx: Transaction,
    requestProof: () => void,
    owner: Address
}

/** A row corresponding to a tx. */
export const DumbTx = ({ tx, requestProof, owner }: ITx): JSX.Element => {
    return (<Segment vertical={true} style={{ textAlign: 'left', padding: '5px'}}>
            <div className={'lrsplit txsSegment'}>
                <span style={{flex: 1}}>
                    <span className={'gray'} >Transaction type: </span>
                    <span className={'black'}>{txType(tx, owner)}</span>
                </span>
            </div>
            <div className={'lrsplit txsSegment'}>
                <span style={{flex: 0.5}}>
                    <span className={'gray'} >From: </span>
                    <span className={'black'}>{name(tx.from)}</span>
                </span>
                <span style={{flex: 0.5}}>
                    <span className={'gray'} >To: </span>
                    <span className={'black'}>{name(tx.to)}</span>
                </span>
            </div>
            <div className={'lrsplit txsSegment'}>
                <span style={{flex: 0.5}}>
                    <span className={'gray'} >Amount: </span>
                    <span className={'black'}> {tx.amount}</span>
                </span>
                <span style={{flex: 0.5}}>
                    <span className={'gray'} >Status: </span>
                    <span className={'black'}> {txClass(tx)}</span>
                </span>
            </div>
            <ProofDisplay tx={tx} requestProof={requestProof} />
    </Segment>)
}

export const Tx = ({ tx, owner }: { tx: Transaction, owner: Address }) => {
    const guid = tx.getGUID()
    return connect(
        (state: UIState) => ({ tx: state.txByGUID.get(guid) }),
        (dispatch: any) => ({ requestProof: () => dispatch(proofRequested(tx)), owner })
    )(DumbTx)
}