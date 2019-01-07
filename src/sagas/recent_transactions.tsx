import { call, put } from 'redux-saga/effects'
import { post } from '../server/common'
import * as Actions from '../types/actions'
import { Address } from '../types/address'
import * as Chain from '../types/chain'
import { Transaction } from '../types/tx'
import { listener } from './common'

type hex_string = string
type hex_number = hex_string

const parseHexAsNumber = (h: hex_number) => parseInt(h, 16)

interface IDeposit {
    deposit_amount: hex_number,
    deposit_fee: hex_number,
    main_chain_deposit: { tx_header: { sender: hex_string } }
}

/* tslint:disable:no-empty-interface */
interface IPayment {
    payment_invoice: { recipient: Address, amount: hex_number, memo: string },
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
    return new Transaction({
        // XXX: Move side-chain determination logic into chain.tsx
        amount, dstChain: Chain.Chain.Side, dstSideChainRevision,
        from: address, srcChain: Chain.Chain.Main, to: address, transactionType,
    })
}

export const txFromWithdrawal = (d: IResponse): Transaction => {
    const payload = d.tx_request[1].payload
    if (payload.operation[0] !== "Withdrawal") {
        throw Error(`txFromWithdrawal called with operation which is not a withdrawal!
${payload.operation}`)
    }
    const withdrawal = payload.operation[1] as IWithdrawal
    JSON.stringify(withdrawal)  // Shut linter up
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
    responseMap[r.tx_request[1].payload.operation[0]](r)
        .set('validated', true)
)

export function* recentTxs(action: Actions.IRecentTxsInitiated) {
    const address = action.address.toString()
    try {
        const response = yield call(post, 'recent_transactions', { address })
        /* tslint:disable */
        console.log(response);
        if (response === undefined) {
            return yield put(Actions.recentTxsFailed(
                action.address, Error("Server failure!")))
        }
        return yield put(Actions.recentTxsReceived(
            action.address, response.map(txFromResponse).filter(
                (t: Transaction): boolean => (t.amount as number) > 0)))
    } catch (e) {
        return yield put(Actions.recentTxsFailed(action.address, e))
    }
}

export const recentTxsListener = listener(
    Actions.Action.RECENT_TRANSACTIONS_INITIATED, recentTxs)
