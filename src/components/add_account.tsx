import { List, Set } from 'immutable'
import * as React from 'react'
import { connect } from 'react-redux'
import { addresses as allAddresses } from '../server/ethereum_addresses'
import { addAddress } from '../types/actions'
import { Address, emptyAddress } from '../types/address'
import { UIState } from '../types/state'

export const knownAddresses = Set(Object.keys(allAddresses).map(
    n => allAddresses[n]))
export const addressNames: { Address: string } = {} as any
Object.keys(allAddresses).forEach(n => addressNames[allAddresses[n]] = n)

const defaultOption: JSX.Element = (
    <option key={-1} className="accountDefaultOption addOpt"
        value={emptyAddress.toString()}>
        Please pick a wallet to display
    </option>
)

export const name = (a: Address) => addressNames[a.toString()]

/* Render available addresses as options for a dropdown menu */
const addressOptions = (addresses: List<Address>) =>
    List<JSX.Element>([defaultOption]).concat(
        addresses.map((address: Address, i: number): JSX.Element =>
            <option key={i} value={address.toString()} className="addOpt">
                {name(address)}
            </option>))

export interface IAddAccount {
    /** Callback when account-add is requested */
    add: ((a: Address) => void);
    /** Accounts which are already listed in the UI */
    displayedAddresses: List<Address>;
}

export interface IAddAccountState { optIdx: number }
/* tslint:disable:max-classes-per-file */
class BaseComponent extends React.Component<IAddAccount, IAddAccountState>{ }

/** Form for adding an account to the side chain */
export class DumbAddAccount extends BaseComponent {
    public state: IAddAccountState = { optIdx: 0 }
    public constructor(props: IAddAccount) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }
    public onChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const optIdx = (e.target as HTMLSelectElement).selectedIndex
        if (optIdx === undefined) {
            throw Error("No index into <select> options!")
        }
        this.setState({ optIdx })
    }
    public onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (this.state.optIdx !== 0) {
            const address = this.currentDisplayedAddress()
            if (address.equals(emptyAddress)) {
                /* tslint:disable:no-console */
                // XXX: This happened once, but I haven't been able to reproduce
                throw Error(`OptIdx is ${this.state.optIdx}, which is outside \
the range for the current options list, \
${this.props.displayedAddresses.toArray()} of length \
${this.props.displayedAddresses.size}.`)
            } else {
                this.props.add(address)
            }
        }
        if (this.state.optIdx === this.props.displayedAddresses.size) {
            // Move to the next-highest entry, if at the bottom, else next-lowest
            this.setState({ optIdx: Math.max(0, this.state.optIdx - 1) })
        }
    }
    public currentDisplayedAddress(): Address {
        return ((this.state.optIdx > 0)
            && this.props.displayedAddresses.get(this.state.optIdx - 1))
            || emptyAddress
    }
    public render() {
        return (
            <div className="addAccount">
                <form className="addAccountMenue" onSubmit={this.onSubmit}>
                    Add account:
                    <select onChange={this.onChange}
                        value={this.currentDisplayedAddress().toString()} >
                        {addressOptions(this.props.displayedAddresses)}
                    </select>
                    <input type="submit" value="Submit" />
                </form>
            </div >
        )
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
