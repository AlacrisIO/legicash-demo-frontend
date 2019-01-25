import * as React from 'react';
import { Icon } from 'semantic-ui-react'
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

const header = (a: Address) => (
    <h3><Icon name="money" size={"large"} /> {"Withdraw to main chain"}</h3>
)

/** Form for specifying how much to withdraw from main chain */
export const WithdrawDialog = ({ from, submitCallback }: IWithdrawDialog) => (
    <AmountDialog
        header={header(from)} 
        placeholder={'Amount to withdraw'}
        submitCallback={submitCallback}
    />
)
