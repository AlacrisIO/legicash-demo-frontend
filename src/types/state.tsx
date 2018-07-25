import { List, Map, Record } from 'immutable'
import { Address } from './address'
import { ContractState, DefaultContractState } from './contract_state'
import { HashValue } from './hash'
import { ModalDialogs } from './modal_dialogs'
import { Transaction } from './tx'
import { Wallet } from './wallet'

interface IState {
    readonly accounts: Map<Address, Wallet>;
    readonly displayedAccounts: List<Address>;
    readonly transactions: Map<HashValue, Transaction>;
    readonly contractState: ContractState;
    readonly modalDialog: ModalDialogs
}

export const DefaultState = Record({
    accounts: Map(),
    contractState: DefaultContractState,
    displayedAccounts: List(),
    transactions: Map(),
})

export class UIState extends DefaultState implements IState {
    /** Wallets known to the front end */
    public readonly accounts: Map<Address, Wallet>;
    /** Wallets currently displayed */
    public readonly displayedAccounts: List<Address>;
    /** Transactions known to the front end */
    public readonly transactions: Map<HashValue, Transaction>;
    /** Display of current contract state */
    public readonly contractState: ContractState;
    /** Modal dialog currently being displayed, or None. */
    public readonly modalDialog: ModalDialogs;
    constructor(props: IState) { super(props) }
}
