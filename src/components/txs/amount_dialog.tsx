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
export const AmountDialog = (
    { header, amountDescription, submitCallback }: IAmountDialog) => {
    var amount: number = 0;  // Record the state here as it changes...
    return (<div>
        <h1>{header}</h1>
        <form onSubmit={e => submitCallback(amount)}>
            <label>{amountDescription}
                <AmountField
                    callback={(v) => { amount = v }} className="amtField" />
            </label>
            <input type="submit" value="Submit" />
        </form>
    </div>)
}
