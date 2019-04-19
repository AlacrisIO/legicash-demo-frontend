import { fromJS, is }      from  'immutable'
import { expectSaga }      from  'redux-saga-test-plan'
import { get, post }       from  '../server/common'
import { addresses }       from  '../server/ethereum_addresses'
import * as Actions        from  '../types/actions'
import { Address }         from  '../types/address'
import { HashValue }       from  '../types/hash'
import { Money }           from  '../types/units'
import { whenConnectedIt } from  '../util/test_util'
import { makeDeposit }     from  './cross_chain'

const address = new Address(addresses.Alice);
const amount  = new Money('5');
const hash    = new HashValue('0x' + '00'.repeat(32));

/** Mocks for server interactions */
const depositMocks = {
    call(effect: any, next: any): any {
        switch (effect.fn) {
            case post:
                const expected = fromJS(['deposit', {
                        address:      address.toString(),
                        amount:       amount.toPrefixedHexWei(),
                        request_guid: effect.args[1].request_guid
                    }])

                if (!is(fromJS(effect.args), expected)) {
                    // Throwing has no effect, here!
                    // tslint:disable:no-console
                    console.log(`Bad post call! ${JSON.stringify(effect)}`)
                }

                return { result: { thread: 5 }};

            case get:
                return {
                    /* tslint:disable:object-literal-sort-keys */
                    side_chain_account_state: {
                        balance:          '0x32',
                        account_revision: '0x1'
                    },
                    side_chain_tx_revision: '0x100',
                    main_chain_confirmation: {
                        transaction_hash:  hash.toRawString(),
                        transaction_index: '0x50',
                        block_number:      '0x50',
                        block_hash:        hash.toRawString()
                    }
                }

            default:
                return next()
        }
    }
}

const makeDepositAction = Actions.makeDeposit(address, amount)
const tx                = makeDepositAction.tx

describe('Deposit saga tests', () => {
    it('Hits deposit, then thread endpoints, and returns result', () =>
        expectSaga(makeDeposit, makeDepositAction)
            .provide(depositMocks)
            .run()
            .then((result: any) => {
                const put    = result.effects.put[0].PUT
                const action = put.action

                expect(action.newBalance.toWei())
                    .toEqual(new Money('50', 10, 'wei').toWei())

                expect(action.serverResponse).toEqual(
                    tx.set('validated', true)
                      .set('hash', hash)
                      .set('srcSideChainRevision', undefined)
                      .set('dstSideChainRevision', 256))

                expect(action.tx).toBe(tx)
                expect(action.type).toEqual(Actions.Action.DEPOSIT_VALIDATED)
            }))

    /* TODO: Hit the deposit endpoint multiple times. This would be a
     * regression test */
    describe('Deposit saga test with server interaction', () => {

        // TODO: More validation?
        whenConnectedIt('Hits deposit endpoint, returns DEPOSIT_VALIDATED action', () =>
            expectSaga(makeDeposit, makeDepositAction)
                .run(4500)
                .then((result: any) => {
                    const put    = result.effects.put[0].PUT;
                    const action = put.action;
                    const newTx  = action.serverResponse;

                    if (action.type !== Actions.Action.DEPOSIT_FAILED) {
                        // Only run this if deposit succeeded
                        expect(action.newBalance.isGreaterThanZero()).toBeTruthy();
                        expect(tx.txsDiffer.bind(tx)(newTx)).toBeFalsy();
                        expect(newTx.validated).toBeTruthy();
                        expect(newTx.rejected || newTx.failureMessage).toBeFalsy()
                    } else {
                        // tslint:disable:no-console
                        console.log(`Deposit test failed! ${JSON.stringify(action)}`)
                    }
                }))
    })
})
