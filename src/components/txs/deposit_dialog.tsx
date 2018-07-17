import * as React from 'react';
import { Address } from '../../types/address'
import { AmountField } from './amount_field';

/** Form for specifying how much to deposit from main chain */
export class DepositDialog extends React.Component {

    /** Address from which the deposit should be made
     *
     * (and to which it should be credited on the side chain)
     */
    from: Address;
    amount_field: JSX.Element;
    constructor(props: any) {
        super(props)
        this.from = props.from
        this.amount_field = <AmountField />
    }

    render() {
        return (<div>
            <h1>Deposit to side chain from {this.from.toString()}</h1>
            <form onSubmit={this.handleSubmit}>
                <label>Amount to deposit: this.amount_field</label>
                <input type="submit" value="Submit" />
            </form>
        </div>)
    }

    handleSubmit(event: React.FormEvent<HTMLElement>): void {
        // XXX: Fill this in when we wire up the app.
    }

}
