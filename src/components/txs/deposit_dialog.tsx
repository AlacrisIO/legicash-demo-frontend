import * as React from 'react';
import { Icon } from 'semantic-ui-react'
import { Address } from '../../types/address'
import { AmountDialog } from './amount_dialog';

interface IDepositDialog {
    /** Address from which the deposit should be made
     *
     * (and to which it should be credited on the side chain)
     */
    from: Address;
    submitCallback: (v: number) => void;
    loading: boolean;
}

const header = (a: Address) => (
    <h3><Icon name="money" size={"large"} /> {"Deposit to side chain"}</h3>
)


/** Form for specifying how much to deposit from main chain */
export const DepositDialog = ({ from, submitCallback, loading = false }: IDepositDialog) => (
    <AmountDialog
        header={header(from)}
        placeholder={'Amount to deposit'}
        submitCallback={submitCallback}
        loading={loading}
    />
)
