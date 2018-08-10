import { List, Set } from 'immutable'
import * as React from 'react'
import { addresses as allAddresses } from '../server/ethereum_addresses'
import { Address, emptyAddress } from '../types/address'

export const knownAddresses = Set(Object.keys(allAddresses).map(
    n => allAddresses[n]))
export const addressNames: { Address: string } = {} as any
Object.keys(allAddresses).forEach(n => addressNames[allAddresses[n]] = n)

export const name = (a: Address) => addressNames[a.toString()]

const defaultOption = (initialMessage: string) => (
    <option key={-1} className="accountDefaultOption addOpt"
        value={emptyAddress.toString()}>
        {initialMessage}
    </option>
)

const addressOptions = (initialMessage: string, addresses: List<Address>) =>
    List<JSX.Element>([defaultOption(initialMessage)]).concat(
        addresses.map((address: Address, i: number): JSX.Element =>
            <option key={i} value={address.toString()} className="addOpt">
                {name(address)}
            </option>))

export interface ISelect {
    /** Message for before address is selected */
    initialMessage: string
    /** Callback when account is selected */
    select: (optIdx: number, a: Address) => void
    /** Accounts which are to be listed in the UI component */
    displayedAddresses: List<Address>
}

export interface ISelectState { optIdx: number }
/* tslint:disable:max-classes-per-file */
class BaseComponent extends React.Component<ISelect, ISelectState>{ }

/** Drop-down menu for selecting an account from `displayedAddresses` */
export class SelectAccount extends BaseComponent {
    public state: ISelectState = { optIdx: 0 }
    public constructor(props: ISelect) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }
    public onChange(e: React.ChangeEvent<HTMLSelectElement>): void {
        const optIdx = (e.target as HTMLSelectElement).selectedIndex
        if (optIdx === undefined) {
            throw Error("No index into <select> options!")
        }
        this.setState({ optIdx })
        this.props.select(optIdx, this.currentDisplayedAddress(optIdx))
    }
    public currentDisplayedAddress(optIdx?: number): Address {
        optIdx = (optIdx !== undefined) ? optIdx : this.state.optIdx
        const extantAddress = (optIdx > 0)
            && this.props.displayedAddresses.get(optIdx - 1)
        return extantAddress || emptyAddress
    }
    public render() {
        return (
            <select onChange={this.onChange} className="accountMenu"
                value={this.currentDisplayedAddress().toString()} >
                {addressOptions(this.props.initialMessage,
                    this.props.displayedAddresses)}
            </select>
        )
    }
}
