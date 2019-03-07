import { fromJS, is } from 'immutable'
import { expectSaga } from 'redux-saga-test-plan'

import { get, post } from '../server/common'
import { addresses } from '../server/ethereum_addresses'

import * as Actions from '../types/actions'
import { Address } from '../types/address'
import { HashValue } from '../types/hash'
import {Money} from "../types/units";

import { serverRunning } from './common.test'
import { makeDeposit } from './cross_chain'

const address = new Address(addresses.Alice);
const amount = new Money('5');
const hash = new HashValue('0x' + '00'.repeat(32));
const balance = 50;

/** Mocks for server interactions */
const depositMocks = {
    call(effect: any, next: any): any {
        switch (effect.fn) {
            case post:
                const expected = fromJS(["deposit", {
                        address:      address.toString(),
                        amount:       amount.toPrefixedHexWei(),
                        request_guid: effect.args[1].request_guid
                    }])

                if (!is(fromJS(effect.args), expected)) {
                    // Throwing has no effect, here!
                    /* tslint:disable:no-console */
                    console.log(`Bad post call! ${JSON.stringify(effect)}`)
                }
                return {
                    result: { thread: 5 }
                };
            case get:
                return {
                    /* tslint:disable:object-literal-sort-keys */
                    side_chain_account_state: {
                        balance: "0x32", account_revision: "0x1"
                    },
                    side_chain_tx_revision: "0x100",
                    main_chain_confirmation: {
                        transaction_hash: hash.toRawString(),
                        transaction_index: "0x50",
                        block_number: "0x50",
                        block_hash: hash.toRawString()
                    }
                }
            default:
                return next()
        }
    }
}

const makeDepositAction = Actions.makeDeposit(address, amount)
const tx = makeDepositAction.tx

describe('Deposit saga tests', () => {
    it('Hits the deposit endpoint, then the thread endpoint and returns the \
result', () => {
            return expectSaga(makeDeposit, makeDepositAction)
                .provide(depositMocks)
                .run().then((result: any) => {
                    const put = result.effects.put[0].PUT
                    const action = put.action
                    expect(action.newBalance).toEqual(balance)
                    expect(action.serverResponse).toEqual(
                        tx
                            .set('validated', true)
                            .set('hash', hash)
                            .set('srcSideChainRevision', undefined)
                            .set('dstSideChainRevision', 256))
                    expect(action.tx).toBe(tx)
                    expect(action.type).toEqual(Actions.Action.DEPOSIT_VALIDATED)
                })
        })


    if (serverRunning) {
        /* TODO: Hit the deposit endpoint multiple times. This would be a
         * regression test */
        describe('Deposit saga test with server interaction', () => {
            it('Hits the deposit endpoint, and returns a DEPOSIT_VALIDATED action',
                () => {
                    return expectSaga(makeDeposit, makeDepositAction)
                        .run(4500).then((result: any) => {
                            const put = result.effects.put[0].PUT;
                            const action = put.action;
                            const newTx = action.serverResponse;
                            if (action.type !== Actions.Action.DEPOSIT_FAILED) {
                                // Only run this if deposit succeeded
                                expect(action.newBalance).toBeGreaterThanOrEqual(0);
                                expect(tx.txsDiffer.bind(tx)(newTx)).toBeFalsy();
                                expect(newTx.validated).toBeTruthy();
                                expect(newTx.rejected || newTx.failureMessage)
                                    .toBeFalsy()
                                /* tslint:disable:no-console */
                            } else {
                                console.log(`Deposit test failed! ${JSON.stringify(action)}`)
                            }
                        })
                    // XXX: More validation, here?
                })
        })
    }
}
);
