import * as React from 'react';
import { Address } from '../../types/address'
import { AmountDialog } from './amount_dialog';

interface IDepositDialog {
    /** Address from which the deposit should be made
     *
     * (and to which it should be credited on the side chain)
     */
    from: Address;
    submitCallback: (v: number) => void
}

const header = (a: Address) => (
    <h4>{"Deposit to main chain"}</h4>
)


/** Form for specifying how much to deposit from main chain */
export const DepositDialog = ({ from, submitCallback }: IDepositDialog) => (
    <AmountDialog
        header={header(from)}
        amountDescription="Amount to deposit: " submitCallback={submitCallback}
    />
)
