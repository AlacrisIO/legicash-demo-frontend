import { call, put } from 'redux-saga/effects'
import { post } from '../server/common'
import * as Actions from '../types/actions'
import { Address } from '../types/address'
import {
    depositTransaction, makeSideChain, withdrawTransaction
} from '../types/chain'
import { Transaction } from '../types/tx'
import { listener } from './common'

interface IResponse {
    amount: number
    facilitator_revision: number
    transaction_type: 'deposit' | 'payment' | 'withdrawal'
}

interface IDepositOrWithdrawalResponse extends IResponse {
    address: string
}

interface IPaymentResponse extends IResponse {
    sender: string
    recipient: string
}

// Withdrawals have a negative amount
export const txFromDepositOrWithdrawal = (d: IDepositOrWithdrawalResponse
): Transaction =>
    (d.amount > 0 ? depositTransaction : withdrawTransaction)(
        new Address(d.address), Math.abs(d.amount))

export const txFromDeposit = (d: IDepositOrWithdrawalResponse
): Transaction => txFromDepositOrWithdrawal(d)
    .set('dstSideChainRevision', d.facilitator_revision)

export const txFromWithdrawal = (d: IDepositOrWithdrawalResponse
): Transaction => txFromDepositOrWithdrawal(d)
    .set('srcSideChainRevision', d.facilitator_revision)

/* tslint:disable:object-literal-sort-keys */
export const txFromPayment = (p: IPaymentResponse): Transaction =>
    makeSideChain(new Transaction({
        amount: p.amount,
        from: new Address(p.sender),
        to: new Address(p.recipient.startsWith('0x') ?
            p.recipient : '0x' + p.recipient),
        srcSideChainRevision: p.facilitator_revision,
        dstSideChainRevision: p.facilitator_revision,
    }))

export const txFromResponse = (r: IResponse): Transaction => {
    let tx: Transaction
    switch (r.transaction_type) {
        case 'deposit': tx = txFromDeposit(r as IDepositOrWithdrawalResponse)
            break
        case 'withdrawal': tx = txFromWithdrawal(
            r as IDepositOrWithdrawalResponse)
            break
        case 'payment': tx = txFromPayment(r as IPaymentResponse)
            break
        default: throw Error(`Unable to process tx ${JSON.stringify(r)}`)
    }
    return tx.set('validated', true)
}

export function* recentTxs(action: Actions.IRecentTxsInitiated) {
    const address = action.address.toString()
    try {
        const response = yield call(post, 'recent_transactions', { address })
        if (response === undefined) {
            return yield put(Actions.recentTxsFailed(
                action.address, Error("Server failure!")))
        }
        return yield put(Actions.recentTxsReceived(
            action.address, response.map(txFromResponse).filter(
                (t: Transaction): boolean => (t.amount as number) > 0)))
    } catch (e) {
        return yield put(Actions.recentTxsFailed(action.address, e))
    }
}

export const recentTxsListener = listener(
    Actions.Action.RECENT_TRANSACTIONS_INITIATED, recentTxs)
