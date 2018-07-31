// import { delay } from 'redux-saga'
// import { call, put } from 'redux-saga/effects'
// import * as Actions from '../types/actions'
// import { Address } from '../types/address'
// import { Transaction } from '../types/tx'
// // import { Wallet } from '../types/wallet'
// import { get, post, readThread, IThreadResponse } from '../server/common'
// 
// type depositResponse = Actions.IDepositValidated | Actions.IDepositFailed
// 
// function* depositFailed(address: Address, tx: Transaction, e: Error) {
//     yield put(Actions.depositFailed(address, tx, e))
// }
// 
// function* hitServer(args: any[], errAction: (e: Error) => Actions.Action) {
//     try { return yield* call(...(args as any)) } catch (e) {
//     }
// }
// 
// 
// function* make_deposit(action: Actions.IMakeDeposit): depositResponse {
//     const address = action.address
//     const amount = action.tx.amount
//     let threadResponse: null | IThreadResponse = null
//     try {
//         threadResponse = yield call(post, 'deposit', { address, amount })
//         // XXX: Fail more gracefully: exponential backoff for a while?
//     } catch (e) { yield* depositFailed(address, action.tx, e) }
//     const threadNumber = readThread(threadResponse as IThreadResponse)
//     let delayTimeMS = 1
//     for (let checkIdx: number = 0; checkIdx < 12; checkIdx++) {
//         yield delay(delayTimeMS)
//         try {
//             // response = yield call(get, 'thread', { id: threadNumber })
//         } catch (e) { /* yield* depositFailed(add */ }
//     }
// 
// 
