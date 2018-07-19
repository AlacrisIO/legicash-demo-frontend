import { List } from 'immutable'
import { Address } from './address'
import { HashValue } from './hash'
import { Transaction } from './tx'
import { Wallet } from './wallet'

const aliceAddress = new Address('0xa11cea11cea11cea11cea11cea11cea11cea11ce');
const trentAddress = new Address('0x7472656e747472656e747472656e747472656e74');
const bobAddress = new Address('0xb0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0');
const hash = new HashValue(
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

const aliceToTrent = new Transaction({
    amount: 19, chain: 'main', from: aliceAddress, hash, to: trentAddress
})
const aliceToBob = new Transaction({
    amount: 1, chain: 'side', from: aliceAddress, hash, to: bobAddress,
})

describe('Tests of wallet type', () => {
    it('Should accept and store a sensible wallet', () => {
        return new Wallet({
            address: aliceAddress, offchainBalance: 20, onchainBalance: 1,
            txs: List([aliceToTrent, aliceToBob]), username: 'alice'
        }) && undefined
    })

    it('Should reject negative balances', () => {
        expect(() => new Wallet({
            address: aliceAddress,
            offchainBalance: 20, onchainBalance: -1,
            txs: List([aliceToTrent, aliceToBob]), username: 'alice'
        })).toThrow()
        expect(() => new Wallet({
            address: aliceAddress, offchainBalance: -20, onchainBalance: 1,
            txs: List([aliceToTrent, aliceToBob]), username: 'alice',
        })).toThrow()
    })
})
