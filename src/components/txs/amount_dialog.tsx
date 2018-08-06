import * as React from 'react';
import { AmountField } from './amount_field';

export interface IAmountDialog {
    /** Header describing the dialog */
    header: string;
    /** Human-readable description of the amount being entered */
    amountDescription: string;
    /** What to do with the amount when "submit" is hit */
    submitCallback: (v: number) => void
}

/** Form for specifying an amount */
export class AmountDialog extends React.Component<IAmountDialog, {}> {

    public state: { amount: number } = { amount: 0 }

    public constructor(props: IAmountDialog) {
        super(props)
        this.setAmount = this.setAmount.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
    }

    public setAmount(amount: number) { this.setState({ amount }) }

    public onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (this.state.amount > 0) {
            this.props.submitCallback(this.state.amount)
        }
    }

    public render() {
        return (<div>
            <h1>{this.props.header}</h1>
            <form onSubmit={this.onSubmit}>
                <label>{this.props.amountDescription}
                    <AmountField
                        callback={this.setAmount} className="amtField" />
                </label>
                <input type="submit" value="Submit" />
            </form>
        </div>)
    }
}
