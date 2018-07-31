import { List, Set } from 'immutable'
import * as React from 'react'
import { connect } from 'react-redux'
import { addresses } from '../server/ethereum_addresses'
import { addAddress } from '../types/actions'
import { Address, emptyAddress } from '../types/address'
import { UIState } from '../types/state'

export const knownAddresses = Set(Object.keys(addresses).map(
    n => addresses[n]))
export const addressNames: { Address: string } = {} as any
Object.keys(addresses).forEach(n => addressNames[addresses[n]] = n)

const defaultOption = (
    <option key={-1} className="accountDefaultOption addOpt">
        Please pick an account to create
    </option>
)

const name = (a: Address) => addressNames[a.toString()]

/* Render available addresses as options for a dropdown menu */
const addressOptions = (presentAccounts: Set<Address>) =>
    List([defaultOption]).concat(
        List(knownAddresses.subtract(presentAccounts))
            .sortBy(name) // Sort names
            .map((address, i: number) =>
                <option key={i} value={address.toString()} className="addOpt">
                    {name(address)}
                </option>))

export interface IAddAccount {
    /** Callback when account-add is requested */
    add: ((a: Address) => void);
    /** Accounts which are already listed in the UI */
    presentAccounts: Set<Address>
}

/** Form for adding an account to the side chain */
export class DumbAddAccount extends React.Component<IAddAccount, {}> {

    public state: { address: Address } = { address: emptyAddress }

    public constructor(props: IAddAccount) {
        super(props)
        this.onChange = this.onChange.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    public onChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const address = new Address((e.target as HTMLSelectElement).value)
        this.setState({ address })
    }

    public onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (this.state.address !== emptyAddress) {
            this.props.add(this.state.address)
        }
    }

    public render() {
        return (
            <div className="addAccount">
                <form className="addAccountMenue" onSubmit={this.onSubmit}>
                    Add account:
                <select onChange={this.onChange}>
                        {addressOptions(this.props.presentAccounts)}
                    </select>
                    <input type="submit" value="Submit" />
                </form>
            </div>
        )
    }
}

export const AddAccount = connect(
    (state: UIState) => ({
        presentAccounts: Set(state.displayedAccounts)
    }),
    (dispatch: (a: any) => any) => ({
        add: (a: Address) =>
            dispatch(addAddress(a, name(a)))
    })
)(DumbAddAccount)
