import { List, Set } from 'immutable'
import * as React from 'react'
import { connect } from 'react-redux'
import { addAddress } from '../types/actions'
import { Address, emptyAddress } from '../types/address'
import { UIState } from '../types/state'
import { knownAddresses, name, SelectAccount } from './select_account'

export interface IAddAccount {
    /** Callback when account-add is requested */
    add: ((a: Address) => void);
    /** Accounts which are already listed in the UI */
    displayedAddresses: List<Address>;
}

export interface IAddAccountState { optIdx: number, address: Address }
/* tslint:disable:max-classes-per-file */
class BaseComponent extends React.Component<IAddAccount, IAddAccountState>{ }

/** Form for adding an account to the side chain */
export class DumbAddAccount extends BaseComponent {
    public state: IAddAccountState = { optIdx: 0, address: emptyAddress }
    public constructor(props: IAddAccount) {
        super(props)
        this.onSubmit = this.onSubmit.bind(this)
        this.selectChange = this.selectChange.bind(this)
    }
    public onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (this.state.optIdx !== 0) {
            if (this.state.address.equals(emptyAddress)) {
                // XXX: This happened once, but I haven't been able to reproduce
                throw Error(`OptIdx is ${this.state.optIdx}, which is outside \
the range for the current options list, \
${this.props.displayedAddresses.toArray()} of length \
${this.props.displayedAddresses.size}.`)
            } else {
                this.props.add(this.state.address)
            }
        }
        if (this.state.optIdx === this.props.displayedAddresses.size) {
            // Move to the next-highest entry, if at the bottom, else next-lowest
            this.setState({ optIdx: Math.max(0, this.state.optIdx - 1) })
        }
    }
    public render() {
        return (
            <div className="addAccount">
                <form className="addAccountMenu" onSubmit={this.onSubmit}>
                    Add account:
                    <SelectAccount
                        displayedAddresses={this.props.displayedAddresses}
                        initialMessage="Please pick a wallet to display"
                        select={this.selectChange}
                    />
                    <input type="submit" value="Submit" />
                </form>
            </div >
        )
    }
    private selectChange(optIdx: number, address: Address): void {
        this.setState({ optIdx, address })
    }
}

export const AddAccount = connect(
    (state: UIState) => ({
        displayedAddresses: List(
            knownAddresses.subtract(Set(state.displayedAccounts)).sortBy(name))
    }),
    (dispatch: (a: any) => any) => ({
        add: (a: Address) =>
            dispatch(addAddress(a, name(a)))
    })
)(DumbAddAccount)
