import { Address } from '../address'
import { isSideChain, makeSideChain } from '../chain'
import { Transaction } from '../tx'
import { Action, IActionType } from './base_actions'

export interface IPaymentAction extends IActionType {
    readonly tx: Transaction
}

/* tslint:disable:no-empty-interface */

export interface IPaymentInitiated extends IPaymentAction { /* empty */ }
export const payment = (tx: Transaction): IPaymentInitiated => {
    if (!isSideChain(tx)) { throw Error(`Not a sidechain payment! ${tx}`) }
    return { type: Action.PAYMENT_INITIATED, tx }
}
export const makePayment =
    (to: Address, from: Address, amount: number): IPaymentInitiated =>
        payment(makeSideChain(new Transaction({ to, from, amount })))

export interface IPaymentValidated extends IPaymentAction {

}
export const paymentValidated =
    (tx: Transaction) => {
        if ((!tx.validated) || tx.rejected) { throw Error(`Invalid payment! ${tx}`) }
        return { tx, type: Action.PAYMENT_VALIDATED }
    }

export interface IPaymentFailed extends IPaymentAction {
    error: Error
}
export const paymentFailed = (tx: Transaction, error: Error) => {
    if (tx.validated || (!tx.rejected)) {
        throw Error(`Unrejected payment! ${tx}`)
    }
    return { error, tx, type: Action.PAYMENT_FAILED }
}
