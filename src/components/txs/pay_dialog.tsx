import * as React from 'react';
import { connect } from 'react-redux'
import * as Actions from '../../types/actions'
import { Address, emptyAddress } from '../../types/address'
import { knownAddresses, name, SelectAccount } from '../select_account'
import { AmountField } from './amount_field'

export interface IPayDialog {
    /** The address the payment will be sent from */
    from: Address;
    /** Submit receiver. `amount`: how much to send, `to`: who to send to */
    submitCallback: (to: Address, amount: number) => void
}

export class DumbPayDialog extends React.Component<IPayDialog, {}> {
    public state: { amount: number; to: Address } = {
        amount: 0, to: emptyAddress
    }
    public constructor(props: IPayDialog) {
        super(props)
        this.onSubmit = this.onSubmit.bind(this)
        this.setTo = this.setTo.bind(this)
        this.setAmount = this.setAmount.bind(this)
    }
    public onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        // XXX: Give error message; don't just refuse.
        if (!this.state.to.equals(emptyAddress) && (this.state.amount > 0)) {
            const to = new Address(this.state.to)
            this.props.submitCallback(to, this.state.amount)
        }
    }
    public setTo(optIdx: number, to: Address) { this.setState({ to }) }
    public setAmount(amount: number) { this.setState({ amount }) }
    public render() {
        const recipients = knownAddresses.remove(this.props.from).toList()
            .sortBy(name).toList()
        return (
            <div>
                <h3>Send payment</h3>
                <form onSubmit={this.onSubmit}>
                    <label>
                        To: <SelectAccount
                            displayedAddresses={recipients}
                            initialMessage="Choose recipient"
                            select={this.setTo}
                        />
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

export const PayDialog = connect(
    null, /* No need to map state to component properties */
    (dispatch: (a: any) => any, props: IPayDialog) => ({
        submitCallback: (to: Address, amount: number) =>
            dispatch(Actions.makePayment(to, props.from, amount))
    }))(DumbPayDialog)

