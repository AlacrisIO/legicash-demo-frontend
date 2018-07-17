import * as React from 'react';
import { Address } from '../../types/address'
import { AmountDialog } from './amount_dialog';

interface IWithdrawDialog {
    /** Address from which the withdrawal should be made
     *
     * (and to which it should be credited on the main chain)
     */
    from: Address;
    submitCallback: (v: number) => void
}

/** Form for specifying how much to withdraw from main chain */
export const WithdrawDialog = ({ from, submitCallback }: IWithdrawDialog) => (
    <AmountDialog
        header={"Withdraw to main chain from " + from.toString()}
        amountDescription="Amount to withdraw:" submitCallback={submitCallback}
    />
)

