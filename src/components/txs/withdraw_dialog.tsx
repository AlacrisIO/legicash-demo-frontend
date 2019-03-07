import * as React from 'react';
import {Address} from '../../types/address'
import {Money} from "../../types/units";
import {AmountDialog} from './amount_dialog';

interface IWithdrawDialog {
    /** Address from which the withdrawal should be made
     *
     * (and to which it should be credited on the main chain)
     */
    from: Address;
    submitCallback: (v: Money) => void;
    loading: boolean;
}

/** Form for specifying how much to withdraw from main chain */
export const WithdrawDialog = ({ from, submitCallback, loading = false }: IWithdrawDialog) => (
    <AmountDialog
        placeholder={'Amount to withdraw'}
        submitCallback={submitCallback}
        loading={loading}
    />
)
