import { emptyAddress } from './address'
import { Guid } from './guid'
import { List, Map, Record } from './immutable'
import { Transaction } from './tx'

const defaultValues = {
    /** Cryptographic address for this account */
    address: emptyAddress,
    /** Balance in this address in the side chain. Cannot be negative. */
    offchainBalance: 0,
    /** Balance in this address on-chain. Cannot be negative. */
    onchainBalance: 0,
    /** Known transactions for this account. Append only! */
    txs: List<Guid>(),
    /** Human-readable username for this account */
    username: ''
}

export class Wallet extends Record(defaultValues) {
    constructor(props: Partial<typeof defaultValues>) {
        super(props)
        if (this.onchainBalance < 0) { throw Error("Onchain balance negative!") }
        if (this.offchainBalance < 0) { throw Error("Offchain balance negative!") }
        // XXX: Check that all transactions belong to `address`?
    }
    public addTx(txID: Guid, txs: Map<Guid, Transaction>): Wallet {
        const txDate = (t: Guid) => {
            const tx = txs.get(t)
            if (tx) { return tx.creationDate }
            throw Error(`Unrecorded transaction: ${t.guid}`)
        }
        const cmp = (t1: Guid, t2: Guid) => {
            const [d1, d2] = [txDate(t1), txDate(t2)]
            return ((d1 > d2) && 1) || ((d1 < d2) && -1) || 0
        }
        return this.update('txs', (l: List<Guid>) => l.push(txID).sort(cmp))
    }
}
