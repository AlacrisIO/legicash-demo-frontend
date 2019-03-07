import { delay } from 'redux-saga';
import { call, put } from 'redux-saga/effects';
import { get } from '../server/common';
import * as Actions from '../types/actions';

const BALANCES_POLLING_DELAY = 1000;
type hexString = string;
type hexNumber = hexString;

const parseHexAsNumber = (n: hexNumber): number => parseInt(n, 16);

export interface IBalanceValue {
    readonly side_chain_account: {
        address: hexNumber,
        account_state: {
            balance:          hexNumber,
            account_revision: hexNumber
        }
    },
    readonly main_chain_account: {
        address:  hexNumber,
        balance:  hexNumber,
        revision: hexNumber
    }
}
export interface IBalanceResponse { [a: string]: IBalanceValue }

/** Parse the balances response into a friendlier format for the front-end */
const makeBalances = (response: IBalanceResponse): Actions.IBalances =>
    Object.keys(response).reduce((result, a) => {
        const sidechainState = response[a].side_chain_account.account_state
        const mainchainState = response[a].main_chain_account

        result[a] = {
            main_chain_account: {
                address:  a,
                balance:  parseHexAsNumber(mainchainState.balance),
                revision: parseHexAsNumber(mainchainState.revision)
            },
            side_chain_account: {
                account_state: {
                    balance:  parseHexAsNumber(sidechainState.balance),
                    revision: parseHexAsNumber(sidechainState.account_revision)
                },
                address: a
            }
        };

        return result;
    }, {}) as Actions.IBalances;

export function* balances() {
    while (true) {
        const balancesResponse = (yield call(get, 'balances', {})) as IBalanceResponse;
        yield put(Actions.balancesObserved(makeBalances(balancesResponse)));
        yield delay(BALANCES_POLLING_DELAY)
    }
}
