/** Actions related to making a deposit on the front end. */

import { Address } from '../address'
import { depositTransaction } from '../chain'
import { Transaction } from '../tx'
import { Action, IActionType, IServerResponse } from './base_actions'

/**
 * Base class for actions during deposit from the main chain to the side chain
 *
 * Deposit details are represented by `tx`. We take a Transaction here, rather
 * than just an address and amount, because we want to optimistically update the
 * UI with the deposit, prior to server validation.
 */
export interface IDeposit extends IActionType {
    readonly address: Address;
    readonly tx: Transaction
}

/** Represents a request to make a deposit */
export interface IMakeDeposit extends IDeposit {
    readonly type: Action.MAKE_DEPOSIT;
}
export const makeDeposit = (address: Address, amount: number): IMakeDeposit => {
    const tx = depositTransaction(address, amount)
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

