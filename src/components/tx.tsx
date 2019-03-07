import * as React from 'react';
import {connect} from 'react-redux'
import {Segment} from 'semantic-ui-react'
import {proofRequested, proofToggled} from '../types/actions/proofs'
import {Address} from '../types/address'
import {UIState} from '../types/state';
import {Transaction} from '../types/tx'
import {ProofDisplay} from './merkle_proof'
import {name} from './select_account'

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

interface ITx { 
    tx: Transaction,
    requestProof: () => void,
    requestToggle: () => void,
    show: boolean,
    owner: Address
}

/** A row corresponding to a tx. */
export const DumbTx = ({ tx, requestProof, requestToggle, show, owner }: ITx): JSX.Element => {

    if (!tx) {
        return <span />;
    }

    let toAndFrom = <span/>;

    const feeInfo = tx.fee ?  <div className={'lrsplit txsSegment'}><span style={{flex: 0.5}}>
                    <span className={'gray'} >Fee: </span>
                    <span className={'black'}> {tx.fee}</span>
    </span></div> : '';

    if (tx.getType() === 'Payment') {
        toAndFrom = <div className={'lrsplit txsSegment'}>
                <span style={{flex: 0.5}}>
                    <span className={'gray'} >From: </span>
                    <span className={'black'}>{name(tx.from)}</span>
                </span>
            <span style={{flex: 0.5}}>
                    <span className={'gray'} >To: </span>
                    <span className={'black'}>{name(tx.to)}</span>
                </span>
        </div>
    }

    const proofDisplay = tx.validated ? <ProofDisplay
        tx={tx}
        requestProof={requestProof}
        requestToggle={requestToggle}
        show={show}
        showBlockLink={false}
    /> : '';

    return (<Segment vertical={true} color={'blue'} style={{ textAlign: 'left', padding: '5px'}}>
            <div className={'lrsplit txsSegment'}>
                    <span style={{flex: 1}}>
                        <span className={'black'} >{
                            tx.creationDate &&
                            tx.creationDate.toLocaleDateString(
                                "en-US",
                                {  year: 'numeric', month: 'short', day: 'numeric' })
                        } {
                            tx.creationDate &&
                            tx.creationDate.toLocaleTimeString("en-US")
                        }</span>
                    </span>
            </div>
            <div className={'lrsplit txsSegment'}>
                <span style={{flex: 1}}>
                    <span className={'gray'} >Transaction type: </span>
                    <span className={'black'}>{tx.getType()}</span>
                </span>
            </div>
            <div className={'lrsplit txsSegment'}>
                    <span style={{flex: 1}}>
                        <span className={'gray'} >ID: </span>
                        <span className={'black'}>{tx.getGUID().toString()}</span>
                    </span>
            </div>
            {toAndFrom}
            <div className={'lrsplit txsSegment'}>
                <span style={{flex: 0.5}}>
                    <span className={'gray'} >Amount: </span>
                    <span className={'black'}> {tx.amount.toEth(10)}</span>
                </span>
                <span style={{flex: 0.5}}>
                    <span className={'gray'} >Status: </span>
                    <span className={'black'}> {txClass(tx)}</span>
                </span>
            </div>
            {feeInfo}
            {proofDisplay}
    </Segment>)
}

export const Tx = ({ tx, owner }: { tx: Transaction, owner: Address }) => {
    const guid = tx.getGUID()
    return connect(
        (state: UIState) => ({
            show: state.showProofByGUID.get(guid.guid + owner.toString()),
            tx: state.txByGUID.get(guid),
        }),
        (dispatch: any) => ({
            owner,
            requestProof: () => dispatch(proofRequested(tx)),
            requestToggle: () => dispatch(proofToggled(tx, owner.toString())),
        })
    )(DumbTx)
}
