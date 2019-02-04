/**
 * Try to encapsulate chain logic in this module
 *
 * Only the Wallet and Transaction modules should reference Chain.{Main,Side}
 * and then only sparingly.
 *
 * The point is to as much as possible have a single location for changes,
 * to ease future adaptation to multiple sidechains.
 *
 */

import { Address } from './address'
import { Transaction } from './tx'

export enum Chain {
    Main, Side
}

/**
 * Return the adjustment to `chain`'s `address` balance by `tx`
 * (-1 for from `address`, 0 for unrelated, +1 for to `address`) * `tx.amount`
 *
 */
export const balanceUpdate = (
    tx: Transaction, address: Address, chain: Chain): number => {
    if (tx.amount === undefined) {
        throw Error(`Transaction amount undefined! ${tx}`)
    }
    if (tx.from.equals(address) && (chain === tx.srcChain)) { return -tx.amount }
    if (tx.to.equals(address) && (chain === tx.dstChain)) { return tx.amount }
    return 0
}

export const describeChain = (chain: Chain | undefined) => {
    const rv = ((chain === Chain.Main) && 'Main')
        || ((chain === Chain.Side) && 'Side')
    if (!rv) { throw Error(`Unknown chain! ${chain}`) }
    return rv
}

export const isDeposit = (tx: Transaction) =>
    (tx.srcChain === Chain.Main) && (tx.dstChain === Chain.Side)

/* tslint:disable:object-literal-sort-keys */

/** Constructs a deposit from side chain to main chain, as Transaction */
export const depositTransaction =
    (address: Address, amount: number, revision?: number): Transaction => {
        const details = {
            amount, from: address, to: address, dstSideChainRevision: revision
        }
        const direction = { dstChain: Chain.Side, srcChain: Chain.Main }
        return new Transaction({ ...details, ...direction })
    }

/** Constructs a withdrawl from side chain to main chain, as Transaction */
export const withdrawTransaction =
    (address: Address, amount: number, revision?: number): Transaction => {
        const details = {
            amount, from: address, to: address, srcSideChainRevision: revision
        }
        const direction = { dstChain: Chain.Main, srcChain: Chain.Side }
        return new Transaction({ ...details, ...direction })
    }

export const isSideChain = (tx: Transaction) =>
    (tx.dstChain === Chain.Side) && (tx.srcChain === Chain.Side)

export const makeSideChain = (tx: Transaction) =>
    tx.set('dstChain', Chain.Side).set('srcChain', Chain.Side)

export const sidechainIdx = (tx: Transaction): number => {
    console.log('Requested Proof for: ', tx);
    if (tx.dstChain === Chain.Side) { return tx.dstSideChainRevision as number }
    if (tx.srcChain === Chain.Side) { return tx.dstSideChainRevision as number }
    throw Error(`No sidechain found in tx ${tx}!`)
}

