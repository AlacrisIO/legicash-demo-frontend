import { Address } from '../address'
import { isSideChain, makeSideChain } from '../chain'
import { Transaction } from '../tx'
import { Action, IActionType } from './base_actions'

export interface IPaymentAction extends IActionType {
    readonly tx: Transaction;
    readonly address: Address;
    readonly toAddress?: Address
}

/* tslint:disable:no-empty-interface */

export interface IPaymentInitiated extends IPaymentAction { /* empty */ }
export const payment = (tx: Transaction, from: Address): IPaymentInitiated => {
    if (!isSideChain(tx)) { throw Error(`Not a sidechain payment! ${tx}`) }
    return { address: from, type: Action.PAYMENT_INITIATED, toAddress: tx.to, tx }
}

export const makePayment =
    (to: Address, from: Address, amount: number): IPaymentInitiated =>
        payment(makeSideChain(new Transaction({ to, from, amount })), from)

export interface IPaymentValidated extends IPaymentAction {
}
export const paymentValidated =
    (tx: Transaction, from: Address) => {
        if ((!tx.validated) || tx.rejected) { throw Error(`Invalid payment! ${tx}`) }
        return { address: from, toAddress: tx.to, tx, type: Action.PAYMENT_VALIDATED }
    }

export interface IPaymentFailed extends IPaymentAction {
    error: Error
}
export const paymentFailed = (tx: Transaction, error: Error, from: Address) => {
    if (tx.validated || (!tx.rejected)) {
        throw Error(`Unrejected payment! ${tx}`)
    }
    return { address: from, error, toAddress: tx.to, tx, type: Action.PAYMENT_FAILED }
}
