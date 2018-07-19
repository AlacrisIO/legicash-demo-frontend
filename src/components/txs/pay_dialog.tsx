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

/** Form for payment information */
export const PayDialog = ({ from, submitCallback }: IPayDialog) => {
    let to: string = "0x"
    let amount: number
    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        // XXX: Give error message; don't just refuse.
        if (addressRegexp.exec(to) && (amount > 0)) {
            submitCallback(amount, new Address(to))
        }
    }
    const setTo = (v: string) => { to = v }
    const setAmount = (v: number) => { amount = v }
    return (<div>
        <h1>Send payment from {from.toString()}</h1>
        <form onSubmit={onSubmit}>
            <label>
                "To:" <AddressField callback={setTo} />
            </label>
            <label>
                "Amount:" <AmountField callback={setAmount} />
            </label>
            <input className="paySubmitButton" type="submit" value="Submit" />
        </form>
    </div >
    )
}
