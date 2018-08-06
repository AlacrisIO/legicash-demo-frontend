/**
 * Try to encapsulate chain logic in this module
 *
 * Only the Wallet and Transaction modules should reference Chain.{Main,Side}
 * and then only sparingly.
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

/** Constructions a deposit from side chain to main chain, as Transaction */
export const depositTransaction =
    (address: Address, amount: number): Transaction => {
        const details = { amount, from: address, to: address }
        const direction = { dstChain: Chain.Side, srcChain: Chain.Main }
        return new Transaction({ ...details, ...direction })
    }
