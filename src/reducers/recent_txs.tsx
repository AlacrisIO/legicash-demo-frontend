import { UIState } from '../types/state'
import { Transaction } from '../types/tx'

export const addTxs = (state: UIState, txs: Transaction[]): UIState => {
    // XXX: A lot could be happening here; probably want a bunch of
    // `withMutations`

    let numTxs: number = 0
    for (const tx of txs) {
        if (tx === undefined) {
            throw Error(`Undefined tx at ${numTxs}th position of ${txs}`)
        }
        state = state.addTx(tx, false)  // Add to state without updating balances
        numTxs += 1
    }
    return state
}

export const recentTxsFailed = (state: UIState): UIState => {
    // XXX: What to do here???
    return state
}
