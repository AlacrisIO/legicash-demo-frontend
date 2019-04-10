import { List, Set }                   from 'immutable'
import * as React                      from 'react'
import { Dropdown, DropdownItemProps } from 'semantic-ui-react'
import { addresses as allAddresses }   from '../server/ethereum_addresses'
import { Address }                     from '../types/address'

export const knownAddresses = Set(Object.keys(allAddresses).map(
    n => allAddresses[n]))
export const addressNames: { Address: string } = {} as any
Object.keys(allAddresses).forEach(n => addressNames[allAddresses[n]] = n)

export const name = (a: Address) => addressNames[a.toString()]

const addressOptions = ( addresses: List<Address>): DropdownItemProps[] => {
    const options: DropdownItemProps[] = [];
    addresses.forEach(
        (address: Address, i: number) => {
            options.push({ key:i, value: address.toString() , text: name(address)})
        }
    )

    return options;
}

export interface ISelect {
    /** Message for before address is selected */
    initialMessage: string
    /** Callback when account is selected */
    select: (a: Address) => void
    /** Accounts which are to be listed in the UI component */
    displayedAddresses: List<Address>
}

export interface ISelectState { selectedAddress: Address }
/* tslint:disable:max-classes-per-file */
class BaseComponent extends React.Component<ISelect, ISelectState>{ }

/** Drop-down menu for selecting an account from `displayedAddresses` */
export class SelectAccount extends BaseComponent {
    public state: ISelectState = { selectedAddress: new Address('') }
    public constructor(props: ISelect) {
        super(props)
        this.onChange = this.onChange.bind(this)
    }
    public onChange(e: React.ChangeEvent<HTMLSelectElement>, data: {value: string}): void {
        const selectedAddress = new Address(data.value)
        if (!selectedAddress.equals(new Address(''))) {
            this.setState({ selectedAddress })
            this.props.select(selectedAddress)
        }
    }
    public getNameValue() {
        if(
            !this.props.displayedAddresses.contains(this.state.selectedAddress)
        ) {
            return ( new Address('')).toString();
        }

        return this.state.selectedAddress.toString();
    }
    public render() {
        return (
            <Dropdown
                placeholder={this.props.initialMessage || "Please pick a wallet to display"}
                fluid={true}
                selection={true}
                onChange={this.onChange}
                className="accountMenu"
                value={this.getNameValue()}
                options={addressOptions(this.props.displayedAddresses)}
            />
        )
    }
}
