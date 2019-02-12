import { delay } from 'redux-saga'
import { call, put } from 'redux-saga/effects'
import { get } from '../server/common'
import * as Actions from '../types/actions'

const BALANCES_POLLING_DELAY = 1000;
type hexString = string
type hexNumber = hexString

const parseHexAsNumber = (n: hexNumber): number => parseInt(n, 16)

export interface IBalanceValue { balance: hexNumber, account_revision: hexNumber }
export interface IBalanceResponse { [a: string]: IBalanceValue }

/** Parse the balances response into a friendlier format for the front-end */
const makeBalances = (response: IBalanceResponse): Actions.IBalances =>
    Object.keys(response).reduce((result, address) => {
        result[address] = {
            balance: parseHexAsNumber(response[address].balance),
            revision: parseHexAsNumber(response[address].account_revision)
        }
        return result
    }, {}) as Actions.IBalances

export function* balances() {
    while (true) {
        const balancesResponse = (yield call(get, 'balances', {})) as IBalanceResponse
        yield put(Actions.balancesObserved(makeBalances(balancesResponse)))
        yield delay(BALANCES_POLLING_DELAY)
    }
}
