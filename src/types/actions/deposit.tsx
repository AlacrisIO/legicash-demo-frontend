/** Actions related to making a deposit on the front end. */

import { Address } from '../address'
import { Transaction } from '../tx'
import { Action, IActionType, IServerResponse } from './base_actions'

/** Represents a request to display the wallet associated with `address` */
export interface IAddAddress extends IActionType {
    readonly address: Address;
    readonly username: string;
    readonly type: Action.ADD_ADDRESS;
}
export const addAddress = (address: Address, username: string): IAddAddress =>
    ({ address, type: Action.ADD_ADDRESS, username })

/** Base class for actions during deposit from the main chain to the side chain
 *
 *  Deposit details are represented by `tx`
 */
export interface IDeposit extends IActionType {
    readonly address: Address;
    readonly tx: Transaction
}

/** Represents a request to make a deposit */
export interface IMakeDeposit extends IDeposit {
    readonly type: Action.MAKE_DEPOSIT;
}
export const makeDeposit = (address: Address, tx: Transaction): IMakeDeposit => {
    /* Deposits are always tx's between same address on the main/side chain */
    if ((!address.equals(tx.to)) || (!address.equals(tx.from)) ||
        (tx.srcChain !== 'main') || (tx.dstChain !== 'side')) {
        throw Error('Transaction is not a deposit!')
    }
    return { type: Action.MAKE_DEPOSIT, address, tx }
}

/** Represents that deposit has been validated by server. */
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

/** Represents rejection of deposit by server. */
export interface IDepositFailed extends IDeposit, IServerResponse {
    readonly type: Action.DEPOSIT_FAILED;
    readonly serverResponse: Error
}

export const depositFailed =
    (address: Address, tx: Transaction, serverResponse: Error): IDepositFailed =>
        ({ type: Action.DEPOSIT_FAILED, address, tx, serverResponse })

