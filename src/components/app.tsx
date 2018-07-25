import { Set } from 'immutable'
import * as React from 'react';

/*
 * import { ContractState } from './contract_state';
 * import { MainTxList } from './main_tx_list';
 * import { AddAccount } from './txs/add_account';
 * import { WalletList } from './wallet_list'; */
// import { merkleProof } from '../types/common'
// import { MerkleProofDisplay } from './merkle_proof'

import { AddAccount } from './add_account'

/* tslint:disable:no-console */
/* tslint:disable:jsx-no-lambda */
/* tslint:disable:no-var-keyword */
export const App = () =>
    <AddAccount presentAccounts={Set()}
        add={e => { console.log('result', JSON.stringify(e)) }} />
