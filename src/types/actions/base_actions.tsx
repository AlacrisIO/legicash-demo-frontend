/** Base interface for actions which require a server response. */

import { ServerResponse } from './server'

export enum Action {

    /* Actions related to making a deposit. */
    MAKE_DEPOSIT = 'MAKE_DEPOSIT', // Deposit to this address on side chain
    DEPOSIT_VALIDATED = 'DEPOSIT_VALIDATED', // Deposit has been added
    DEPOSIT_FAILED = 'DEPOSIT_FAILED', // Deposit was not added

    /* Actions related to making a deposit. */
    MAKE_WITHDRAWAL = 'MAKE_WITHDRAWAL', // Withdrawal to this address on side chain
    WITHDRAWAL_VALIDATED = 'WITHDRAWAL_VALIDATED', // Withdrawal has been added
    WITHDRAWAL_FAILED = 'WITHDRAWAL_FAILED', // Deposit was not added

    PAYMENT_INITIATED = 'PAYMENT_INITIATED',  // Side-chain cross-account payment
    PAYMENT_VALIDATED = 'PAYMENT_VALIDATED',
    PAYMENT_FAILED = 'PAYMENT_FAILED',

    /* Actions related to querying the facalitator state */
    BALANCES_OBSERVED = 'BALANCES_OBSERVED',  // Response from `balances` API endpoint.

    RECENT_TRANSACTIONS_INITIATED = 'RECENT_TRANSACTIONS_INITIATED',  // Request for recent txs
    RECENT_TRANSACTIONS_RECEIVED = 'RECENT_TRANSACTIONS_RECEIVED',  // Request for recent txs
    RECENT_TRANSACTIONS_FAILED = 'RECENT_TRANSACTIONS_FAILED',  // Request for recent txs
    RECENT_TRANSACTIONS_NEW_PAYMENTS = 'RECENT_TRANSACTIONS_NEW_PAYMENTS',  // New payments to wallet, launch snackbar

    PROOF_TOGGLED = 'PROOF_TOGGLED',  // Display a Merkle proof
    PROOF_REQUESTED = 'PROOF_REQUESTED',  // Request for a Merkle proof
    PROOF_RECEIVED_AND_VALID = 'PROOF_RECEIVED_AND_VALID',  // Valid proof has been returned
    PROOF_RECEIVED_BUT_INVALID = 'PROOF_RECEIVED_BUT_INVALID',  // Invalid proof has been returned!
    PROOF_ERROR = 'PROOF_ERROR',  // Error during proof retrieval / validation

    /* UI actions */
    ADD_WALLET = 'ADD_WALLET', // Add this address to the list of displayed wallets
    REMOVE_WALLET = 'REMOVE_WALLET',  // Remove this address from the list of displayed wallets.

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
