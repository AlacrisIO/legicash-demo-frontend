import {delay} from "redux-saga";
import {call, cancel, fork, put, select, takeEvery} from 'redux-saga/effects'
import {UIState} from "src/types/state";
import {post} from '../server/common'
import * as Actions from "../types/actions";
import {IRemoveWallet} from "../types/actions";
import {Address} from '../types/address'
import * as Chain from '../types/chain'
import {Guid} from "../types/guid";
import {Transaction} from '../types/tx'

type hex_string = string
type hex_number = hex_string

const POLLING_DELAY = 2000;
const parseHexAsNumber = (h: hex_number) => parseInt(h, 16)

interface IDeposit {
    deposit_amount: hex_number,
    deposit_fee: hex_number,
    main_chain_deposit: { tx_header: { sender: hex_string } },
    main_chain_deposit_confirmation: { block_number: hex_string}
}

/* tslint:disable:no-empty-interface */
interface IPayment {
    payment_invoice: { recipient: Address, amount: hex_number, memo: string },
    main_chain_deposit_confirmation?: { block_number: hex_string}
}

interface IWithdrawal { /* empty */ }

type DepositOperation = ["Deposit", IDeposit]
type WithdrawalOperation = ["Withdrawal", IWithdrawal]
type PaymentOperation = ["Payment", IPayment]
type Operation = DepositOperation | WithdrawalOperation | PaymentOperation

interface IResponse {
    tx_header: { tx_revision: hex_number, updated_limit: hex_number },
    tx_request: ["UserTransaction", {
        payload: {
            operation: Operation
            rx_header: { requester_revision: hex_number, requester: Address }
        }
    }]
}

// XXX: Move sidechain update logic into ../types/chain.tsx

export const txFromDeposit = (d: IResponse): Transaction => {
    const payload = d.tx_request[1].payload
    if (payload.operation[0] !== "Deposit") {
        throw Error(`txFromDeposit called with operation which is not a deposit!
${payload.operation}`)
    }
    const deposit = payload.operation[1] as IDeposit
    const address = new Address(deposit.main_chain_deposit.tx_header.sender)
    const amount = parseHexAsNumber(deposit.deposit_amount)
    const dstSideChainRevision = parseHexAsNumber(
        d.tx_header.tx_revision)
    const transactionType = 'Deposit'
    const blockNumber = parseHexAsNumber(deposit.main_chain_deposit_confirmation.block_number);
    return new Transaction({
        // XXX: Move side-chain determination logic into chain.tsx
        amount, blockNumber, dstChain: Chain.Chain.Side, dstSideChainRevision,
        from: address, srcChain: Chain.Chain.Main, to: address, transactionType,
    })
}

export const txFromWithdrawal = (d: IResponse): Transaction => {
    console.log("WITHDRAWAL RESPONSE!", d);
    const payload = d.tx_request[1].payload
    if (payload.operation[0] !== "Withdrawal") {
        throw Error(`txFromWithdrawal called with operation which is not a withdrawal!
        ${payload.operation}`)
    }
    const withdrawal = payload.operation[1] as IWithdrawal
    console.log(JSON.stringify(withdrawal));  // Shut linter up
    // const transactionType = 'Withdrawal'
    throw Error("Not implemented")
}

/* tslint:disable:object-literal-sort-keys */
export const txFromPayment = (p: IResponse): Transaction => {
    const payload = p.tx_request[1].payload
    if (payload.operation[0] !== "Payment") {
        throw Error(`txFromPayment called with operation which is not a payment!
${payload.operation}`)
    }
    const payment = payload.operation[1] as IPayment
    const amount = parseHexAsNumber(payment.payment_invoice.amount)
    const from = new Address(payload.rx_header.requester)
    const dstSideChainRevision = parseHexAsNumber(p.tx_header.tx_revision)
    const srcSideChainRevision = dstSideChainRevision
    const to = new Address(payment.payment_invoice.recipient)
    const transactionType = 'Payment'
    return new Transaction({
        amount, dstSideChainRevision, srcSideChainRevision, from, to, transactionType,
        srcChain: Chain.Chain.Side, dstChain: Chain.Chain.Side
    })
    throw Error("Not implemented")
}

const responseMap = {
    "Deposit": txFromDeposit,
    "Withdrawal": txFromWithdrawal,
    "Payment": txFromPayment
}

/** Parse a tx from the server response for this transaction. */
export const txFromResponse = (r: IResponse): Transaction => (
    responseMap[r.tx_request[1].payload.operation[0]](r).set('validated', true)
)

export function* recentTxs(action: Actions.IRecentTxsInitiated) {
    const address = action.address.toString();

    while(true) {
        try {
            const response = yield call(post, 'recent_transactions', { address })

            if (response === undefined) {
                yield put(Actions.recentTxsFailed( action.address, Error("Server failure!")))
            }

            yield put(Actions.recentTxsReceived(
                action.address, response.map(txFromResponse).filter(
                    (t: Transaction): boolean => (t.amount as number) > 0)))

            // new payments @todo: luka  move this
            const recentPaymentTx = yield select(recentPaymentsSelector(address));
            const newPayments: any[] = [];

            if (!recentPayments.hasOwnProperty(address)) {
                recentPayments[address] = recentPaymentTx;
            } else {
                recentPaymentTx.forEach(
                    (tx: string) => {
                        if (recentPayments[address].indexOf(tx) === -1) {
                            newPayments.push(tx);
                            recentPayments[address].push(tx);
                        }
                    });
            }

            yield put(Actions.newPaymentsReceived(action.address, newPayments));

        } catch (e) {
            yield put(Actions.recentTxsFailed(action.address, e))
        }

        yield delay(POLLING_DELAY)
    }
}

const recentTxTasks = {};
const recentPayments = {};

const recentHandler = function* (action: Actions.IRecentTxsInitiated) {
    if (!recentTxTasks.hasOwnProperty(action.address.toString())) {
        recentTxTasks[action.address.toString()] = yield fork(recentTxs, action);
    }
};

const removeHandler = function* (action: IRemoveWallet) {
    if (recentTxTasks.hasOwnProperty(action.address.toString())) {
        yield cancel(recentTxTasks[action.address.toString()]);
        delete recentTxTasks[action.address.toString()];
        delete recentPayments[action.address.toString()];
    }
};

export const recentTxsListener = function* () {
    const removeMatcher =  (ac: Actions.IActionType) => ac.type === Actions.Action.REMOVE_WALLET;
    const initMatcher =  (ac: Actions.IActionType) => ac.type === Actions.Action.RECENT_TRANSACTIONS_INITIATED;
    yield takeEvery(initMatcher, recentHandler);
    yield takeEvery(removeMatcher, removeHandler);
};

const recentPaymentsSelector = (address: string) => {
    return (state: UIState)  => {
        return state.txByGUID.filter(
            (i:any) => i.to.address === address && i.transactionType === 'Payment'
        ).filter(
            (i:any) => i.creationDate > new Date(Date.now() - POLLING_DELAY)
        ).map(
            (i: any, k: Guid) =>  k.toString()
        ).toArray()
    }
};
