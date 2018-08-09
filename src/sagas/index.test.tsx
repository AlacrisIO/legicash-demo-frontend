import { fromJS, is } from 'immutable'
import { expectSaga } from 'redux-saga-test-plan'

import { makeDeposit } from '../sagas'
import { get, post } from '../server/common'
import { addresses } from '../server/ethereum_addresses'

import * as Actions from '../types/actions'
// import { depositFailed } from '../types/actions';
import { Address } from '../types/address'
import { HashValue } from '../types/hash'

const serverRunning = false

const address = new Address(addresses.Alice)
const amount = 5
const hash = new HashValue('0x' + '00'.repeat(32))
const balance = 50

/** Mocks for server interactions */
const depositMocks = {
    call(effect: any, next: any): any {
        switch (effect.fn) {
            case post:
                if (!is(fromJS(effect.args), fromJS(
                    ["deposit", { address: address.toString(), amount }]))) {
                    // Throwing has no effect, here!
                    /* tslint:disable:no-console */
                    console.log(`Bad post call! ${JSON.stringify(effect)}`)
                }
                return { result: "api/thread?id=5" }
            case get:
                return {
                    /* tslint:disable:object-literal-sort-keys */
                    user_account_state: {
                        address, user_name: "Alice", balance
                    },
                    side_chain_tx_revision: 256,
                    main_chain_confirmation: {
                        transaction_hash: hash.toRawString(),
                        transaction_index: 651,
                        block_number: 50,
                        block_hash: hash.toRawString()
                    }
                }
            default:
                return next()
        }
    }
}

const makeDepositAction = Actions.makeDeposit(address, amount as number)
const tx = makeDepositAction.tx

describe('Deposit saga tests', () => {
    it('Hits the deposit endpoint, then the thread endpoint and returns the \
result', () => {
            return expectSaga(makeDeposit, makeDepositAction)
                .provide(depositMocks)
                .put.like({
                    action: {
                        type: Actions.Action.DEPOSIT_VALIDATED,
                        newBalance: balance, tx, serverResponse: tx.set(
                            'validated', true).set('hash', hash)
                    }
                }).run()
        })
})


if (serverRunning) {
    describe('Deposit saga test with server interaction', () => {
        it('Hits the deposit endpoint, and returns a DEPOSIT_VALIDATED action',
            () => {
                return expectSaga(makeDeposit, makeDepositAction)
                    .put.like({
                        action: { type: Actions.Action.DEPOSIT_FAILED, tx }
                    })
                    .run(2500)
                // XXX: More validation, here?
            })
    })
}
