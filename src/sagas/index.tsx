import * as Balances from './balances'
import * as Crosschain from './cross_chain'
import * as Payment from './payment'
import * as Proofs from './proofs'
import * as RecentTxs from './recent_transactions'

export function* rootSaga() {
    yield [
        Balances.balances(),
        Crosschain.depositListener(),
        Crosschain.withdrawalListener(),
        Payment.paymentListener(),
        RecentTxs.recentTxsListener(),
        Proofs.proofRequestListener(),
    ]
}
