import { Address } from '../address'
import { Action, IActionType } from './base_actions'

/** Represents a request to display the wallet associated with `address` */
export interface IAddWallet extends IActionType {
    readonly address: Address;
    readonly username: string;
    readonly type: Action.ADD_WALLET;
}
export const addAddress = (address: Address, username: string): IAddWallet =>
    ({ address, type: Action.ADD_WALLET, username })


export interface IRemoveWallet extends IActionType { address: Address }
export const removeWallet = (address: Address): IRemoveWallet => {
    return { address, type: Action.REMOVE_WALLET }
}
