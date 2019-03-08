import {Address} from '../address'
import {Transaction} from '../tx'
import {Action, IActionType} from './base_actions'

export interface IRecentTxs extends IActionType {
    readonly address: Address
    type: Action
}

/* tslint:disable:no-empty-interface */

export interface IRecentTxsInitiated extends IRecentTxs { /* empty */ }
export const recentTxsInitiated = (address: Address): IRecentTxsInitiated => {
    return { type: Action.RECENT_TRANSACTIONS_INITIATED, address }
}
export interface IRecentTxsReceived extends IRecentTxs {
    txs: Transaction[]
}
export interface IRecentTxsNewPayments extends IRecentTxs {
    txIds: string[]
}

export const recentTxsReceived = (address: Address, txs: Transaction[]) => (
    { address, txs, type: Action.RECENT_TRANSACTIONS_RECEIVED }
);

export interface IRecentTxsFailed extends IRecentTxs { error: Error }
export const recentTxsFailed = (address: Address, error: Error) => ({
    address, error, type: Action.RECENT_TRANSACTIONS_FAILED
});

