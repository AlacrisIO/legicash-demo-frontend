import { fromJS, is } from 'immutable'
import { expectSaga } from 'redux-saga-test-plan'

import { makeDeposit } from '../sagas'
import { get, post } from '../server/common'

import * as Actions from '../types/actions'
// import { depositFailed } from '../types/actions';
import { Address } from '../types/address'
import { Chain } from '../types/chain'
import { HashValue } from '../types/hash'
import { Transaction } from '../types/tx'

const address = new Address('0x5050505050505050505050505050505050505050')
const tx = new Transaction({
    amount: 5, dstChain: Chain.Side, from: address,
    srcChain: Chain.Main, to: address
})
const hash = new HashValue(
    '0x0000000000000000000000000000000000000000000000000000000000000000')

const depositMocks = {
    call(effect: any, next: any): any {
        switch (effect.fn) {
            case post:
                if (!is(fromJS(effect.args), fromJS(
                    ["deposit", { address, "amount": tx.amount }]))) {
                    // Throwing has no effect, here!
                    /* tslint:disable:no-console */
                    console.log(`Bad post call! ${JSON.stringify(effect)}`)
                }
                return { result: "api/thread?id=5" }
            case get:
                return {
                    /* tslint:disable:object-literal-sort-keys */
                    user_account_state: {
                        address, user_name: "Alice", balance: 50
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

describe('Deposit saga tests', () => {
    it('Hits the deposit endpoint, then the thread endpoint and returns the \
result', () => {
            return expectSaga(makeDeposit, Actions.makeDeposit(address, tx))
                .provide(depositMocks).run()
        })
})
