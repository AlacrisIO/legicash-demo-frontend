import * as React from 'react';
import { Button } from 'semantic-ui-react'
import { Address, emptyAddress } from '../../types/address'
import {Money} from "../../types/units";
import { knownAddresses, name, SelectAccount } from '../select_account'
import { AmountField } from './amount_field'

export interface IPayDialog {
    /** The address the payment will be sent from */
    from: Address;
    /** Submit receiver. `amount`: how much to send, `to`: who to send to */
    submitCallback: (to: Address, amount: Money) => void;
    loading: boolean;
}

export class PayDialog extends React.Component<IPayDialog, {}> {
    public state: { amount: Money|null; to: Address, loading: boolean } = {
        amount: null,  loading: false, to: emptyAddress
    };

    public constructor(props: IPayDialog) {
        super(props)
        this.onSubmit = this.onSubmit.bind(this)
        this.setTo = this.setTo.bind(this)
        this.setAmount = this.setAmount.bind(this)
    }
    public onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        // XXX: Give error message; don't just refuse.
        if (!this.state.to.equals(emptyAddress) && this.state.amount && !this.state.amount.isLessThanZero()) {
            const to = new Address(this.state.to)
            this.props.submitCallback(to, this.state.amount)
        }
    }
    public setTo(to: Address) { this.setState({ to }) }
    public setAmount(amount: Money) { this.setState({ amount }) }
    public render() {
        const recipients = knownAddresses.remove(this.props.from).toList()
            .sortBy(name).toList()
        return (
            <div>
                <form onSubmit={this.onSubmit}>
                    <label className={'black accent infoLabel'}>To:</label>
                    <SelectAccount
                            displayedAddresses={recipients}
                            initialMessage="Choose recipient"
                            select={this.setTo}
                        />
                    <br/>
                    <label className={'black accent infoLabel'}>Amount: {this.props.loading} </label>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <AmountField callback={this.setAmount} placeholder={'Amount for payment'} />
                        <Button basic={true} color={'blue'} loading={this.props.loading} className="paySubmitButton" type="submit">Submit</Button>
                    </div>
                </form>
            </div >
        )
    }
}
