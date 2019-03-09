import { Address } from './address'
import { Chain } from './chain'
import { HashValue } from './hash'
import { Transaction } from './tx'
import {Money} from "./units";

const addr1 = new Address('0x5050505050505050505050505050505050505050')
const addr2 = new Address('0x0505050505050505050505050505050505050505')
const hash = new HashValue(
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')
const defaultTransaction = {
    amount: new Money('1'), dstChain: Chain.Side, failureMessage: '', from: addr1,
    hash, rejected: undefined, srcChain: Chain.Main, to: addr2, validated: false,
}

describe('Tests of Transaction type', () => {
    it('Accepts and stores a sensible transaction', () => {
        const tx = new Transaction(defaultTransaction)
        expect(tx.from).toEqual(addr1)
    })

    it('Rejects transactions with a negative amount', () => {
        expect(() => new Transaction({ ...defaultTransaction, amount: new Money('0') }))
            .toThrow()
    })

    it('Is closed to extension or modification', () => {
        const t = new Transaction(defaultTransaction)
        // @ts-ignore
        expect(() => { t.amount = 12 }).toThrow()
    })
})
