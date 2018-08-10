/** Base interface for actions which require a server response. */

import { ServerResponse } from './server'

export enum Action {

    /* Actions related to making a deposit. */
    MAKE_DEPOSIT, // Deposit to this address on side chain
    DEPOSIT_VALIDATED, // Deposit has been added
    DEPOSIT_FAILED, // Deposit was not added

    /* Actions related to making a deposit. */
    MAKE_WITHDRAWAL, // Withdrawal to this address on side chain
    WITHDRAWAL_VALIDATED, // Withdrawal has been added
    WITHDRAWAL_FAILED, // Deposit was not added

    PAYMENT_INITIATED,  // Side-chain cross-account payment
    PAYMENT_VALIDATED,
    PAYMENT_FAILED,

    /* UI actions */
    ADD_WALLET, // Add this address to the list of displayed wallets
    REMOVE_WALLET,  // Remove this address from the list of displayed wallets.
}

/** Characteristics of all action types */
export interface IActionType {
    /** Used to switch off on the actions */
    readonly type: Action
}

/** Actions which require a server response */
export interface IServerResponse {
    readonly serverResponse: ServerResponse
}
