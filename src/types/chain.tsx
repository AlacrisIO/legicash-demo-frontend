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

import { Address }     from './address'
import { Transaction } from './tx'
import { Money }       from "./units";

export enum Chain {
    Main, Side
}

export const describeChain = (chain: Chain | undefined) => {
    const rv = ((chain === Chain.Main) && 'Main')
        || ((chain === Chain.Side) && 'Side')
    if (!rv) { throw Error(`Unknown chain! ${chain}`) }
    return rv
}

/* tslint:disable:object-literal-sort-keys */

/** Constructs a deposit from side chain to main chain, as Transaction */
export const depositTransaction =
    (address: Address, amount: Money, revision?: number): Transaction => {
        const details = { amount
                        , from:                 address
                        , to:                   address
                        , dstSideChainRevision: revision
                        , transactionType:      'Deposit' }

        const direction = { dstChain: Chain.Side, srcChain: Chain.Main }

        return new Transaction({ ...details, ...direction })
    }

/** Constructs a withdrawl from side chain to main chain, as Transaction */
export const withdrawTransaction =
    (address: Address, amount: Money, revision?: number): Transaction => {
        const details = { amount
                        , from:                 address
                        , to:                   address
                        , srcSideChainRevision: revision
                        , transactionType:      'Withdrawal' }

        const direction = { dstChain: Chain.Main, srcChain: Chain.Side }

        return new Transaction({ ...details, ...direction })
    }

export const isSideChain = (tx: Transaction) =>
    (tx.dstChain === Chain.Side) && (tx.srcChain === Chain.Side)

export const makeSideChain = (tx: Transaction) =>
    tx.set('dstChain', Chain.Side).set('srcChain', Chain.Side)

export const sidechainIdx = (tx: Transaction): number => {
    if (tx.dstChain === Chain.Side) { return tx.dstSideChainRevision as number }
    if (tx.srcChain === Chain.Side) { return tx.srcSideChainRevision as number }
    throw Error(`No sidechain found in tx ${tx}!`)
}

