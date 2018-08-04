import { fromJS, is } from 'immutable'
import { expectSaga } from 'redux-saga-test-plan'

import { makeDeposit } from '../sagas'
import { get, post } from '../server/common'
import { addresses } from '../server/ethereum_addresses'

import * as Actions from '../types/actions'
// import { depositFailed } from '../types/actions';
import { Address } from '../types/address'
import { Chain } from '../types/chain'
import { HashValue } from '../types/hash'
import { Transaction } from '../types/tx'

const serverRunning = false

const address = new Address(addresses.Alice)
const tx = new Transaction({
    amount: 5, dstChain: Chain.Side, from: address,
    srcChain: Chain.Main, to: address
})
const hash = new HashValue(
    '0x0000000000000000000000000000000000000000000000000000000000000000')

/** Mocks for server interactions */
const depositMocks = {
    call(effect: any, next: any): any {
        switch (effect.fn) {
            case post:
                if (!is(fromJS(effect.args), fromJS(
                    ["deposit", { address: address.toString(),
                                  amount: tx.amount }]))) {
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

const makeDepositAction = Actions.makeDeposit(address, tx)

describe('Deposit saga tests', () => {
    it('Hits the deposit endpoint, then the thread endpoint and returns the \
result', () => {
    return expectSaga(makeDeposit, makeDepositAction)
        .provide(depositMocks)
        .run().then((result: any) => { // Check return value.
            const r = result.returnValue
            expect(r.type).toBe(Actions.Action.DEPOSIT_VALIDATED)
            expect(r.address).toBe(address)
            expect(r.tx).toBe(tx)
            expect(r.serverResponse.txsDiffer(tx)).toBeFalsy()
        })
})
})


if (serverRunning) {
    describe('Deposit saga test with server interaction', () => {
        it('Hits the deposit endpoint, and returns a DEPOSIT_VALIDATED action',
           () => {
               return expectSaga(makeDeposit, makeDepositAction)
                   .run(1500)
                   .then(r => expect(r.returnValue.serverResponse.validated
                       ).toBe(true))  // XXX: More validation, here?
           })
    })
}
