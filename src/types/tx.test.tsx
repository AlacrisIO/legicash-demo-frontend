import { Address } from './address'
import { HashValue } from './hash'
import { Transaction } from './tx'

const addr1 = new Address('0x5050505050505050505050505050505050505050')
const addr2 = new Address('0x0505050505050505050505050505050505050505')
const hash = new HashValue(
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

describe('Tests of Transaction type', () => {
    it('Accepts and stores a sensible transaction', () => {
        const tx = new Transaction({
            amount: 1, chain: 'main', from: addr1, hash, to: addr2,
        })
        expect(tx.from).toEqual(addr1)
    })

    it('Rejects transactions with a negative amount', () => {
        expect(() => new Transaction(
            { chain: '', from: addr1, to: addr2, amount: -1, hash })).toThrow()
    })

    it('Is closed to extension or modification', () => {
        const t = new Transaction({
            amount: 1, chain: 'main', from: addr1, hash, to: addr2
        })
        // @ts-ignore
        expect(() => { t.foo = 1 }).toThrow()
        // @ts-ignore
        expect(() => { t.amount = 12 }).toThrow()
    })
})
