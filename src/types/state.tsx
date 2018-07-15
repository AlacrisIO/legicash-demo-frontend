import { Record, List, Map } from 'immutable'
import { Transaction } from './tx'
import { Address } from './address'
import { HashValue } from './hash'
import { Wallet } from './wallet'
import { ContractState, DefaultContractState } from './contract_state'
import { ModalDialogs } from './modal_dialogs'

interface IState {
    readonly accounts: Map<Address, Wallet>;
    readonly displayed_accounts: List<Address>;
    readonly transactions: Map<HashValue, Transaction>;
    readonly contract_state: ContractState;
    readonly modal_dialog: ModalDialogs
}

export const DefaultState = Record({
    accounts: Map(), displayed_accounts: List(), transactions: Map(),
    contract_state: DefaultContractState,
})

export class UIState extends DefaultState implements IState {
    /** Wallets known to the front end */
    readonly accounts: Map<Address, Wallet>;
    /** Wallets currently displayed */
    readonly displayed_accounts: List<Address>;
    /** Transactions known to the front end */
    readonly transactions: Map<HashValue, Transaction>;
    /** Display of current contract state */
    readonly contract_state: ContractState;
    /** Modal dialog currently being displayed, or None. */
    readonly modal_dialog: ModalDialogs;
    constructor(props: IState) { super(props) }
    /** Force typechecking on get */
    get<T extends keyof IState>(value: T): IState[T] { return super.get(value) }
}
