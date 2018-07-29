import { Address, emptyAddress } from './address'
import { emptyHash, HashValue } from './hash'
import { List, Record } from './immutable'

/* XXX: What about knowledge of facilitator misbehavior? */

interface IContractState {
    readonly facilitatorAddress: Address;
    readonly fundsInCustody: number;
    readonly fundsInSidechain: number;
    readonly merkleCommitment: HashValue;
    readonly sidechainAccounts: List<Address>;
}

export const DefaultContractState = Record({
    facilitatorAddress: emptyAddress,
    fundsInCustody: 0,
    fundsInSidechain: 0,
    merkleCommitment: emptyHash,
    sidechainAccounts: List<Address>()
}, 'ContractState')

/** Represents the UI state of the Contract State panel */
export class ContractState extends DefaultContractState
    implements IContractState {
    /** Merkle root hash */
    public readonly merkleCommitment: HashValue;
    /** Address of the facilitator responsible for running this sidechain */
    public readonly facilitatorAddress: Address;
    /** Amount in the main-chain contract */
    public readonly fundsInCustody: number;
    /** Amount committed to side-chain accounts  */
    public readonly fundsInSidechain: number;
    /** List of addresses with accounts on the sidechain */
    public readonly sidechainAccounts: List<Address>;
    constructor(props: IContractState) {
        super(props)
        if (this.fundsInCustody < 0) {
            throw Error("Onchain balance negative!")
        }
        if (this.fundsInSidechain < 0) {
            throw Error("Offchain balance negative!")
        }
    }
}
