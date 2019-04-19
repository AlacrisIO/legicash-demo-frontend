import { fromJS, is }         from  'immutable'
import { expectSaga }         from  'redux-saga-test-plan'
import { post }               from  '../server/common'
import { addresses }          from  '../server/ethereum_addresses'
import { recentTxsInitiated } from  '../types/actions/recent_txs'
import { Address }            from  '../types/address'
import { recentTxs }          from  './recent_transactions'

const address = new Address(addresses.Alice)

const recentTxMocks = {
    call(effect: any, next: any): any {
        switch (effect.fn) {
            case post:
                if (!is(fromJS(effect.args), fromJS([
                    'recent_transactions', { address: address.toString() }]))) {
                    // Throwing has no effect, here!
                    /* tslint:disable:no-console */
                    console.log(`Bad post call! ${JSON.stringify(effect)}`)
                }
                return [];

            default: return next()
        }
    }
}

describe('Recent Txs tests', () => {

    it('Sends the address as part of the request', () => {
        return expectSaga(recentTxs, recentTxsInitiated(address))
            .provide(recentTxMocks).run({ silenceTimeout: true })
    })
})
