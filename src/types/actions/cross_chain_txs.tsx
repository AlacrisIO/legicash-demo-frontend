/** Actions related to cross-chain txs */

import { Address }                                 from '../address'
import { depositTransaction, withdrawTransaction } from '../chain'
import { Transaction }                             from '../tx'
import {Money} from "../units";
import { Action, IActionType, IServerResponse }    from './base_actions'

/**
 * Base class for cross-chain-interaction actions
 *
 * Tx details are represented by `tx`. We take a Transaction here, rather
 * than just an address, amount and direction, because we want to optimistically
 * update the UI with the deposit, prior to server validation.
 */
export interface ICrossChain extends IActionType {
    readonly tx: Transaction
}

/* tslint:disable:no-empty-interface */
export interface ICrossChainInitiate extends ICrossChain { /* empty */ }

/** Represents a request to make a deposit */
export interface IMakeDeposit extends ICrossChainInitiate {
    readonly type: Action.MAKE_DEPOSIT;
    readonly address: Address;
};

export const makeDeposit = (address: Address, amount: Money): IMakeDeposit => {
    const tx = depositTransaction(address, amount)
    return { type: Action.MAKE_DEPOSIT, tx, address }
};

/** Represents a request to make a deposit */
export interface IMakeWithdrawal extends ICrossChainInitiate {
    readonly type: Action.MAKE_WITHDRAWAL;
    readonly address: Address;
}
export const makeWithdrawal = (address: Address, amount: Money
): IMakeWithdrawal => {
    const tx = withdrawTransaction(address, amount)
    return { type: Action.MAKE_WITHDRAWAL, tx, address}
}

/** Represents a crosschain transaction validated by the server */
export interface ICrossChainValidated extends ICrossChain, IServerResponse {
    // New balance for the depositing user, per the server.
    readonly newBalance: Money;
    readonly serverResponse: Transaction;
    readonly address: Address;
}

const validatedMessage = (action: Action) =>
        ( address:        Address
        , newBalance:     Money
        , tx:             Transaction
        , serverResponse: Transaction
        ): ICrossChainValidated => {

    if (!serverResponse.validated) {
        throw Error('Received unvalidated tx!')
    }

    tx.assertSameTransaction(serverResponse)  // Same tx, w/ more info?

    return { address
           , newBalance
           , serverResponse
           , tx
           , type: action
           }
}

/** Represents that deposit has been validated by server. */
export interface IDepositValidated extends ICrossChainValidated {
    readonly type: Action.DEPOSIT_VALIDATED;
}
export const depositValidated = validatedMessage(Action.DEPOSIT_VALIDATED)

/** Represents that withdrawal has been validated by server. */
export interface IWithdrawalValidated extends ICrossChainValidated {
    readonly type: Action.WITHDRAWAL_VALIDATED;
}
export const withdrawalValidated = validatedMessage(Action.WITHDRAWAL_VALIDATED);

export type crossChainValidationMessage = typeof depositValidated | typeof withdrawalValidated;

/** Represents rejection of transaction by server. */
export interface ICrossChainFailed extends ICrossChain, IServerResponse {
    readonly serverResponse: Error;
    readonly address: Address;
}

const failedMessage = (action: Action) =>
    (address: Address, tx: Transaction, serverResponse: Error
    ): ICrossChainFailed =>
        ({ type: action, tx, serverResponse, address })

/** Represents rejection of deposit by server. */
export interface IDepositFailed extends ICrossChainFailed {
    type: Action.DEPOSIT_FAILED;
    readonly address: Address;
}

/** Represents rejection of withdrawal by server. */
export interface IWithdrawalFailed extends ICrossChainFailed {
    type: Action.WITHDRAWAL_FAILED;
    readonly address: Address;
}

export const depositFailed = failedMessage(Action.DEPOSIT_FAILED);
export const withdrawalFailed = failedMessage(Action.WITHDRAWAL_FAILED);

export type crossChainFailureMessage = typeof depositFailed | typeof withdrawalFailed;
