import {emptyAddress} from './address'
import {Chain, describeChain} from './chain'
import {Guid} from './guid'
import {emptyHash} from './hash'
import {Record} from './immutable'
import {Money} from "./units";

/* XXX: Should have something in Transaction to indicate who the facilitator
 * is, for sidechain transactions? What about epistemic state? For now, just
 * "validated" or "rejected". Treating server as trusted resource. */

/* tslint:disable:object-literal-sort-keys */
interface IOptionTypes {  // Declare types where they can't be inferred
    amount: Money,
    fee: string | undefined,
    creationDate: Date,
    localGUID: Guid,
    rejected: boolean | undefined
    validated: boolean | undefined
    dstChain: Chain | undefined,
    srcChain: Chain | undefined,
    srcSideChainRevision: number | undefined,
    dstSideChainRevision: number | undefined,
    blockNumber: number | undefined
}

const optionValues: IOptionTypes = {
    /** Amount transferred. Cannot be negative. */
    amount: new Money('0'),
    /** Transaction fee if applicable */
    fee: undefined,
    /** LOCAL time that this tx was created. */
    creationDate: new Date(0),
    /** Privately assigned ID for tracking within the front end */
    localGUID: new Guid('no-guid'),
    /** Whether the transaction has been rejected by the facilitator */
    rejected: undefined,
    /** Whether the transaction has been validated by the main chain. */
    validated: undefined,
    /** Name of the chain this transaction targets. */
    dstChain: undefined,
    /** Name of the chain this transaction comes from */
    srcChain: undefined,
    /** Index of revision in which this tx was validated */
    srcSideChainRevision: undefined,
    dstSideChainRevision: undefined,
    blockNumber: undefined
}

const inferrableValues = {  // Attributes where type can be inferred directly
    /** Human-readable explanation for any failure of the transaction */
    failureMessage: '',
    /** Source address for transaction */
    from: emptyAddress,
    /** Transaction hash reported from server */
    hash: emptyHash,
    /** Destination address for transaction */
    to: emptyAddress,
    transactionType: 'Payment'
}

export const defaultValues = { ...optionValues, ...inferrableValues }

type txDifference = [string, (t: Transaction) => any]

/** represents a cryptographic transaction */
export class Transaction extends Record(defaultValues) {
    constructor(props: Partial<typeof defaultValues>) {
        super({ localGUID: new Guid(), creationDate: new Date(), ...props })
        if (this.amount && this.amount.isLessThanZero()) {
            throw Error("Tx with negative amount!")
        }
        if (this.rejected && this.validated) {
            throw Error(
                `Contradictory rejected/validated status in ${this.toString()}`)
        }
        if (this.rejected && (!this.hash.equals(emptyHash))) {
            throw Error(
                `Rejected tx with hash?? ${this.toString()}`)
        }
        if (this.validated && this.hash.equals(emptyHash)) {
            throw Error(
                `No hash for validated tx?? ${this.toString()}`)
        }
    }

    public toString(): string { return JSON.stringify(this) }

    /**
     * Return null if transactions don't contracdict, truthy otherwise
     * Truthy return value is [<description>, <difference accessor function>]
     * The second return value in that case takes the one of the transactions,
     * and returns the attribute which is different. See assertSameTransaction.
     */
    public txsDiffer(o: Transaction): null | txDifference {
        if (!this.amount.isEqual(o.amount)) {
            return ["Amounts", ((t: Transaction) => t.amount)]
        }
        if (this.dstChain !== o.dstChain) {
            return ["Destination chains", ((t: Transaction) =>
                describeChain(t.dstChain))]
        }
        if (!this.from.equals(o.from)) {
            return ["Source addresses", ((t: Transaction) => t.from.toString())]
        }
        if ((!this.hash.equals(emptyHash)) && (!o.hash.equals(emptyHash)) &&
            (!this.hash.equals(o.hash))) {
            return ["Hashes", ((t: Transaction) => t.hash.toString)]
        }
        if ((this.rejected !== undefined) && (o.rejected !== undefined) &&
            (this.rejected !== o.rejected)) {
            return ["Rejection flags", ((t: Transaction) => t.rejected)]
        }
        if (this.srcChain !== o.srcChain) {
            return ["Source chains", ((t: Transaction) =>
                describeChain(t.srcChain))]
        }
        if (!this.to.equals(o.to)) {
            return ["Destination addresses", ((t: Transaction) => t.to.toString())]
        }
        if ((this.validated !== undefined) && (o.validated !== undefined) &&
            (this.validated !== o.validated)) {
            return ["Validation flags", ((t: Transaction) => t.validated)]
        }
        if ((this.localGUID === undefined) || (o.localGUID === undefined)) {
            return ["GUIDs", (t: Transaction) => t.localGUID]
        }
        if ((this.localGUID as Guid).guid !== (o.localGUID as Guid).guid) {
            return ["Local GUIDs",
                ((t: Transaction) => (t.localGUID as Guid).guid)]
        }
        if ((this.srcSideChainRevision !== o.srcSideChainRevision)
            && ((this.srcSideChainRevision !== undefined)
                && (o.srcSideChainRevision !== undefined))) {
            return ["Source side chain revision indices",
                (t: Transaction) => t.srcSideChainRevision]
        }
        if ((this.dstSideChainRevision !== o.dstSideChainRevision)
            && ((this.dstSideChainRevision !== undefined)
                && (o.dstSideChainRevision !== undefined))) {
            return ["Destination side chain revision indices",
                (t: Transaction) => t.dstSideChainRevision]
        }
        return null
    }

    /** Throw if o contains contradictory information to this tx. */
    public assertSameTransaction(o: Transaction): boolean {
        const areDifferent = this.txsDiffer(o)

        if (areDifferent) {
            const [description, accessor] = areDifferent
            throw Error(`${description} differ in transactions ${this.toString()} vs ${o.toString()}: (${accessor(this)} !=${accessor(o)})`)
        }

        return true;
    }

    public getGUID(): Guid {
        if (this.localGUID === undefined) {
            throw Error(`GUID unset in ${this}`)
        }
        return this.localGUID
    }

    public assertNoErasure(oldTx: Transaction) {
        if ((this.hash === undefined && oldTx.hash !== undefined)
            || (this.rejected === undefined && oldTx.rejected !== undefined)
            || (this.validated === undefined && oldTx.validated !== undefined)
            || (this.srcSideChainRevision === undefined && oldTx.srcSideChainRevision !== undefined)
            || (this.dstSideChainRevision === undefined && oldTx.dstSideChainRevision !== undefined)) {
            throw Error(`Attempt to erase information in ${oldTx} with ${this}`)
        }
    }

    public getType(): string {
        return this.transactionType;
    }

    public getBlockNumber(): number {
        return this.blockNumber as number
    }

    public getFee(): string | undefined {
        return this.fee;
    }

    public getDstSideChainRevision(): number {
        return this.dstSideChainRevision as number;
    }

}
