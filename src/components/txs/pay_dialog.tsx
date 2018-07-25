import * as React from 'react';
import { Address, addressRegexp } from '../../types/address'
import { AddressField } from './address_field'
import { AmountField } from './amount_field'

export interface IPayDialog {
    /** The address the payment will be sent from */
    from: Address;
    /** Submit receiver. `amount`: how much to send, `to`: who to send to */
    submitCallback: (amount: number, to: Address) => void
}

export class PayDialog extends React.Component<IPayDialog, {}> {
    public state: { amount: number; to: string } = { amount: 0, to: '0x' }

    public constructor(props: IPayDialog) {
        super(props)
        this.onSubmit = this.onSubmit.bind(this)
        this.setTo = this.setTo.bind(this)
        this.setAmount = this.setAmount.bind(this)
    }

    public onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        // XXX: Give error message; don't just refuse.
        if (addressRegexp.exec(this.state.to) && (this.state.amount > 0)) {
            const to = new Address(this.state.to)
            this.props.submitCallback(this.state.amount, to)
        }
    }

    public setTo(to: string) { this.setState({ to }) }
    public setAmount(amount: number) { this.setState({ amount }) }
    public render() {
        return (
            <div>
                <h1>Send payment from {this.props.from.toString()}</h1>
                <form onSubmit={this.onSubmit}>
                    <label>
                        "To:" <AddressField callback={this.setTo} />
                    </label>
                    <label>
                        "Amount:" <AmountField callback={this.setAmount} />
                    </label>
                    <input className="paySubmitButton" type="submit"
                        value="Submit" />
                </form>
            </div >
        )
    }
}
