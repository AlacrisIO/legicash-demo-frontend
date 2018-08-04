/** Actions related to making a deposit on the front end. */

import { Address } from '../address'
import { isDeposit } from '../chain'
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
    if ((!address.equals(tx.to)) || (!address.equals(tx.from)) || !isDeposit(tx)) {
        throw Error('Transaction is not a deposit!')
    }
    return { type: Action.MAKE_DEPOSIT, address, tx }
}

/** Represents that deposit has been validated by server. */
export interface IDepositValidated extends IDeposit, IServerResponse {
    // New balance for the depositing user, per the server.
    readonly newBalance: number;
    readonly serverResponse: Transaction;
    readonly type: Action.DEPOSIT_VALIDATED;
}

export const depositValidated =
    (address: Address, newBalance: number, tx: Transaction,
        serverResponse: Transaction): IDepositValidated => {
        if (!serverResponse.validated) {
            throw Error('Received unvalidated tx!')
        }
        tx.assertSameTransaction(serverResponse)  // Same tx, w/ more info?
        return {
            address, newBalance, serverResponse, tx,
            type: Action.DEPOSIT_VALIDATED,
        }
    }

/** Represents rejection of deposit by server. */
export interface IDepositFailed extends IDeposit, IServerResponse {
    readonly type: Action.DEPOSIT_FAILED;
    readonly serverResponse: Error
}

export const depositFailed =
    (address: Address, tx: Transaction, serverResponse: Error): IDepositFailed =>
        ({ type: Action.DEPOSIT_FAILED, address, tx, serverResponse })

