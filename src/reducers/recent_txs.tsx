import {Address} from "../types/address";
import {IPendingState, UIState} from '../types/state'
import { Transaction } from '../types/tx'

export const addTxs = (state: UIState, txs: Transaction[]): UIState => {
    // XXX: A lot could be happening here; probably want a bunch of
    // `withMutations`

    let numTxs: number = 0;

    for (const tx of txs) {

        if (tx === undefined) {
            throw Error(`Undefined tx at ${numTxs}th position of ${txs}`)
        }

        // If anything is pending on either of the (open) wallets involved in the transaction
        // hold on with importing transactions for those addresses (atm all transactions come every request so it will just import after)
        if (isWalletPending(state, tx.to) || isWalletPending(state, tx.from)) {
            continue;
        }

        state = state.addTx(tx, false);  // Add to state without updating balances
        numTxs += 1
    }
    return state
};

export const setNewPayments = (state: UIState, txIds: string[] = []): UIState => {
    state.setPaymentNotifications(txIds);
    return state
};


export const recentTxsFailed = (state: UIState): UIState => {
    // XXX: What to do here???
    return state
};

// Check is anything pending on the Wallet
const isWalletPending = (state: UIState, address: Address): boolean => {
    const isAnythingPending = (ps: IPendingState) => Object.keys(ps).filter(k => false !== ps[k]).length > 0;
    const pendingStates = state.pendingStates.get(address);

    if (pendingStates) {
        return isAnythingPending(pendingStates);
    }

    return false;
};

