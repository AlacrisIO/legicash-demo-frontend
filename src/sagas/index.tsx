import {all, fork} from "redux-saga/effects";
import * as Balances from './balances'
import * as Crosschain from './cross_chain'
import * as Notifications from './notifications'
import * as Payment from './payment'
import * as Proofs from './proofs'
import * as RecentTxs from './recent_transactions'

(window as any).pause = false;
export function* rootSaga() {
    yield all([
        fork(Balances.balances),
        fork(Crosschain.depositListener),
        fork(Crosschain.withdrawalListener),
        fork(Payment.paymentListener),
        fork(RecentTxs.recentTxsListener),
        fork(Proofs.proofRequestListener),
        fork(Notifications.notificationsListener),
    ]);
}
