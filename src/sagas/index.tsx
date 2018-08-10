import * as Crosschain from './cross_chain'
import * as Payment from './payment'

export function* rootSaga() {
    yield [
        Crosschain.depositListener(),
        Crosschain.withdrawalListener(),
        Payment.paymentListener(),
    ]
}
