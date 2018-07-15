import { Address, empty_address } from './address'
import { HashValue, empty_hash } from './hash'
import { Record, List } from 'immutable'

/* XXX: What about knowledge of facilitator misbehavior? */

interface IContractState {
    readonly merkle_commitment: HashValue;
    readonly facilitator_address: Address;
    readonly funds_in_custody: number;
    readonly funds_in_sidechain: number;
    readonly sidechain_accounts: List<Address>;
}

export const DefaultContractState = Record({
    merkle_commitment: empty_hash,
    facilitator_address: empty_address,
    funds_in_custody: 0,
    funds_in_sidechain: 0,
    sidechain_accounts: List()
})

/** Represents the UI state of the Contract State panel */
export class ContractState extends DefaultContractState
    implements IContractState {
    /** Merkle root hash */
    readonly merkle_commitment: HashValue;
    /** Address of the facilitator responsible for running this sidechain */
    readonly facilitator_address: Address;
    /** Amount in the main-chain contract */
    readonly funds_in_custody: number;
    /** Amount committed to side-chain accounts  */
    readonly funds_in_sidechain: number;
    /** List of addresses with accounts on the sidechain */
    readonly sidechain_accounts: List<Address>;
    constructor(props: IContractState) {
        super(props)
        if (this.funds_in_custody < 0) { throw "Onchain balance negative!" }
        if (this.funds_in_sidechain < 0) {
            throw "Offchain balance negative!"
        }
    }
    /** Force typechecking on get */
    get<T extends keyof IContractState>(value: T): IContractState[T] {
        return super.get(value)
    }
}
