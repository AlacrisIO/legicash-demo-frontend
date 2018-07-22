import * as React from 'react';
/* import { render } from 'react-dom' */

/*
 * import { ContractState } from './contract_state';
 * import { MainTxList } from './main_tx_list';
 * import { AddAccount } from './txs/add_account';
 * import { WalletList } from './wallet_list'; */

import { Address } from '../types/address'
import { PayDialog } from './txs/pay_dialog'

/* tslint:disable:no-console */
/* tslint:disable:no-var-keyword */
export const App = () => {
    const noOp = (a: number, t: Address) => {
        console.log(JSON.stringify([a, t]))
    }
    return <PayDialog
        from={new Address("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")}
        submitCallback={noOp} />
}

