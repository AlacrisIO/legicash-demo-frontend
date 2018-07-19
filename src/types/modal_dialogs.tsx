/* tslint:disable:max-classes-per-file */
import { Address } from './address'
import { MerkleProof } from './merkle_proof'
import { Transaction } from './tx'

// There should only ever be one of these, and they should only collect data
// from the user. So these can afford to be mutable.

/** Information for sidechain payment dialog */
export class PayDialog {
    /** Source address */
    public readonly from: Address;
    /** Destination address: Needs to be filled in by user */
    public to: Address;
    /** Amount to send: Needs to be filled in by user */
    public amount: number
    constructor(a: Address) {
        Object.assign(this, { from: a, to: null, amount: 0 })
    }
}

/** Information for withdrawal-to-mainchain dialog */
export class WithdrawDialog {
    public amount: number;
    public readonly from: Address;
    constructor(a: Address) { Object.assign(this, { from: a, amount: 0 }) }
}

/** Information for deposit-to-sidechain dialog */
export class DepositDialog extends WithdrawDialog { }  // Exact same info

/** Information for Merkle-proof dialog */
export class MerkleProofDialog {
    /** Transaction this Merkle Proof establishes */
    public readonly proof: MerkleProof;
    public readonly tx: Transaction;
    constructor(tx: Transaction, proof: MerkleProof) {
        Object.assign(this, { tx, proof })
        if (!tx.hash.equal(proof.leafHash())) {
            throw Error(`This proof does not pertain to that transaction!
            Proof: ${proof}
            Transaction: ${tx}`)
        }
    }
}

/** Option union over the possible modal dialogs (there should be at most one.)
 */
export type ModalDialogs = (
    null | PayDialog | WithdrawDialog | DepositDialog | MerkleProofDialog
)

