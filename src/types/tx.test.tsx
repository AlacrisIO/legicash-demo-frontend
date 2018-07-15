import { Transaction } from './tx'
import { Address } from './address'
import { HashValue } from './hash'

const addr1 = new Address('0x5050505050505050505050505050505050505050')
const addr2 = new Address('0x0505050505050505050505050505050505050505')
const hash = new HashValue(
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

it('Accepts and stores a sensible transaction', () => {
    const tx = new Transaction({
        chain: 'main', from: addr1, to: addr2, amount: 1, hash })
    expect(tx.from == addr1)
})

it('Rejects transactions with a negative amount', () => {
    expect(() => new Transaction(
        { chain: '', from: addr1, to: addr2, amount: -1, hash })).toThrow()
})

it('Is closed to extension or modification', () => {
    var t = new Transaction({ chain: 'main', from: addr1, to: addr2, amount: 1,
                              hash })
    // @ts-ignore
    expect(() => { t.foo = 1 }).toThrow()
    // @ts-ignore
    expect(() => { t.amount = 12 }).toThrow()
    })
