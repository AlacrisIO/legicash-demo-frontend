import {delay} from "redux-saga";
import {call, cancel, fork, put, takeEvery} from 'redux-saga/effects'
// import {UIState} from "src/types/state";
import {post} from '../server/common'
import * as Actions from "../types/actions";
import {IRemoveWallet} from "../types/actions";
import {Address} from '../types/address'
import * as Chain from '../types/chain'
import {Guid} from "../types/guid";
// import {Guid} from "../types/guid";
import {Transaction} from '../types/tx'
import {hexToDec, hexToNumber, Money} from "../types/units";


const POLLING_DELAY = 1000;
type hex_string = string
type hex_number = hex_string

interface IDeposit {
    deposit_amount: hex_number,
    deposit_fee: hex_number,
    main_chain_deposit: { tx_header: { sender: hex_string } },
    main_chain_deposit_confirmation: { block_number: hex_string},
    request_guid: string,
    requested_at: hex_number,
}

/* tslint:disable:no-empty-interface */
interface IPayment {
    payment_invoice: { recipient: Address, amount: hex_number, memo: string },
    main_chain_deposit_confirmation?: { block_number: hex_string},
    request_guid: string,
    requested_at: hex_number,
}

interface IWithdrawal {
    withdrawal_amount: hex_number,
    withdrawal_fee: hex_number,
    request_guid: string,
    requested_at: hex_number,
}

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
        throw Error(`txFromDeposit called with operation which is not a deposit! ${payload.operation}`) }
    const deposit = payload.operation[1] as IDeposit
    const address = new Address(deposit.main_chain_deposit.tx_header.sender)
    const amount = new Money(deposit.deposit_amount, 16, 'wei');
    const dstSideChainRevision = hexToNumber(d.tx_header.tx_revision)
    const transactionType = 'Deposit'
    const blockNumber = hexToNumber(deposit.main_chain_deposit_confirmation.block_number);
    const localGUID = new Guid(payload.operation[1].request_guid);
    const creationDate = new Date(
        (hexToNumber(payload.operation[1].requested_at))
    );


    return new Transaction({
        // XXX: Move side-chain determination logic into chain.tsx
        amount,
        blockNumber,
        creationDate,
        dstChain: Chain.Chain.Side,
        dstSideChainRevision,
        from: address,
        localGUID,
        srcChain: Chain.Chain.Main,
        to: address,
        transactionType,
    });
}

export const txFromWithdrawal = (d: IResponse): Transaction => {

    const payload = d.tx_request[1].payload;

    if (payload.operation[0] !== "Withdrawal") {
        throw Error(`txFromWithdrawal called with operation which is not a withdrawal! ${payload.operation}`)
    }

    const transactionType = 'Withdrawal'
    const dstSideChainRevision = hexToNumber(d.tx_header.tx_revision);
    const withdrawal = payload.operation[1] as IWithdrawal;
    const amount = new Money(withdrawal.withdrawal_amount, 16, 'wei');
    const fee = hexToDec(withdrawal.withdrawal_fee);
    const address = new Address(payload.rx_header.requester);
    const localGUID = new Guid(payload.operation[1].request_guid);
    const creationDate = new Date(
        (hexToNumber(payload.operation[1].requested_at))
    );

    return new Transaction({
        // XXX: Move side-chain determination logic into chain.tsx
        amount,
        // @TODO: Luka where is the ? blockNumber,
        creationDate,
        dstChain: Chain.Chain.Main,
        dstSideChainRevision,
        fee,
        from: address,
        localGUID,
        srcChain: Chain.Chain.Side,
        to: address,
        transactionType,
    });
};

/* tslint:disable:object-literal-sort-keys */
export const txFromPayment = (p: IResponse): Transaction => {
    const payload = p.tx_request[1].payload;

    if (payload.operation[0] !== "Payment") {
        throw Error(`txFromPayment called with operation which is not a payment!${payload.operation}`)
    }

    const payment = payload.operation[1] as IPayment;
    const amount = new Money(payment.payment_invoice.amount, 16, 'wei');
    const from = new Address(payload.rx_header.requester);
    const dstSideChainRevision = hexToNumber(p.tx_header.tx_revision);
    const srcSideChainRevision = dstSideChainRevision;
    const to = new Address(payment.payment_invoice.recipient);
    const transactionType = 'Payment';

    const localGUID = new Guid(payload.operation[1].request_guid);
    const creationDate = new Date(
        (hexToNumber(payload.operation[1].requested_at))
    );

    return new Transaction({
        localGUID,creationDate,
        amount, dstSideChainRevision, srcSideChainRevision, from, to, transactionType,
        srcChain: Chain.Chain.Side, dstChain: Chain.Chain.Side
    });
};

const responseMap = {
    "Deposit": txFromDeposit,
    "Withdrawal": txFromWithdrawal,
    "Payment": txFromPayment
};

/** Parse a tx from the server response for this transaction. */
export const txFromResponse = (r: IResponse): Transaction => (
    responseMap[r.tx_request[1].payload.operation[0]](r).set('validated', true)
);

export function* recentTxs(action: Actions.IRecentTxsInitiated) {
    const address = action.address.toString();

    while(true) {
        try {
            const response = yield call(post, 'recent_transactions', { address })

            if (response === undefined) {
                yield put(Actions.recentTxsFailed( action.address, Error("Server failure!")))
            }

            yield put(Actions.recentTxsReceived(
                action.address,
                response.map(txFromResponse).filter((t: Transaction): boolean => !!t.amount)
            ));

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
