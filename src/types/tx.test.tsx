import { Transaction } from './tx'
import { Address } from './address'

const addr1 = new Address('0x5050505050505050505050505050505050505050')
const addr2 = new Address('0x0505050505050505050505050505050505050505')

it('Accepts and stores a sensible transaction', () => {
    const tx = new Transaction({ chain: 'main', from: addr1, to: addr2, amount: 1 })
    expect(tx.get('from') == addr1)
})

it('Rejects transactions with a negative amount', () => {
    expect(() => new Transaction(
        { chain: '', from: addr1, to: addr2, amount: -1 })).toThrow()
})
