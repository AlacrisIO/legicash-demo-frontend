import { Address } from '../address'
import { Transaction } from '../tx'
import { Action, IActionType, IServerResponse } from './base_actions'

export interface IAddAddress extends IActionType {
    readonly address: Address;
    readonly username: string;
    readonly type: Action.ADD_ADDRESS;
}
export const addAddress = (address: Address, username: string): IAddAddress =>
    ({ address, type: Action.ADD_ADDRESS, username })

export interface IDeposit extends IActionType {
    readonly address: Address;
    readonly tx: Transaction
}

export interface IMakeDeposit extends IDeposit {
    readonly type: Action.MAKE_DEPOSIT;
}
export const makeDeposit = (address: Address, tx: Transaction): IMakeDeposit => {
    if ((!address.equals(tx.to)) || (!address.equals(tx.from)) ||
        (tx.srcChain !== 'main') || (tx.dstChain !== 'side')) {
        throw Error('Transaction is not a deposit!')
    }
    return { type: Action.MAKE_DEPOSIT, address, tx }
}

export interface IDepositValidated extends IDeposit, IServerResponse {
    readonly serverResponse: Transaction;
    readonly type: Action.DEPOSIT_VALIDATED;
}

export const depositValidated =
    (address: Address, tx: Transaction, serverResponse: Transaction
    ): IDepositValidated => {
        if (!serverResponse.validated) {
            throw Error('Received unvalidated tx!')
        }
        tx.assertSameTransaction(serverResponse)  // Same tx, w/ more info?
        return { type: Action.DEPOSIT_VALIDATED, address, tx, serverResponse }
    }

export interface IDepositFailed extends IDeposit, IServerResponse {
    readonly type: Action.DEPOSIT_FAILED;
    readonly serverResponse: Error
}

export const depositFailed =
    (address: Address, tx: Transaction, serverResponse: Error): IDepositFailed =>
        ({ type: Action.DEPOSIT_FAILED, address, tx, serverResponse })

