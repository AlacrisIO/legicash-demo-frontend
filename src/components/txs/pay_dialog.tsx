import * as React from 'react';
import { Address, address_regexp } from '../../types/address'
import { AddressField } from './address_field'
import { AmountField } from './amount_field'

export interface IPayDialog {
    /** The address the payment will be sent from */
    from: Address;
    /** Submit receiver. `amount`: how much to send, `to`: who to send to */
    submitCallback: (amount: number, to: Address) => void
}

/** Form for payment information */
export const PayDialog = ({ from, submitCallback }: IPayDialog) => {
    var to: string = "0x"
    var amount: number
    return (<div>
        <h1>Send payment from {from.toString()}</h1>
        <form onSubmit={(e) => {  // XXX: Give error message; don't just refuse.
            if (address_regexp.exec(to) && (amount > 0)) {
                submitCallback(amount, new Address(to))
            }
        }} >
            <label>
                "To:" <AddressField callback={(v) => { to = v }} />
            </label>
            <label>
                "Amount:" <AmountField callback={(v) => { amount = v }} />
            </label>
            <input className="paySubmitButton" type="submit" value="Submit" />
        </form>
    </div >
    )
}
