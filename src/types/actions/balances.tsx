/** Actions related to retrieving balances from the back end. */

import { Action, IActionType } from './base_actions'

export interface IBalances {
    [a: string]: {
        readonly balance: number
        readonly revision: number
    }
}

export interface IBalancesObserved extends IActionType {
    type: Action.BALANCES_OBSERVED
    balances: IBalances
}

export const balancesObserved = (balances: IBalances): IBalancesObserved => (
    { balances, type: Action.BALANCES_OBSERVED } as IBalancesObserved
)
