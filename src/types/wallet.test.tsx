import { List } from 'immutable'
import { Address } from './address'
import { Chain } from './chain'
import { HashValue } from './hash'
import { Transaction } from './tx'
import { Wallet } from './wallet'

const aliceAddress = new Address('0xa11cea11cea11cea11cea11cea11cea11cea11ce');
const trentAddress = new Address('0x7472656e747472656e747472656e747472656e74');
const bobAddress = new Address('0xb0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0');
const hash = new HashValue(
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

const now = new Date()
const aliceToTrent = new Transaction({
    amount: 19, creationDate: now, dstChain: Chain.Side, failureMessage: '',
    from: aliceAddress, hash, rejected: undefined, srcChain: Chain.Main,
    to: trentAddress, validated: true,
})
const aliceToBob = new Transaction({
    amount: 1, creationDate: now, dstChain: Chain.Side, failureMessage: '',
    from: aliceAddress, hash, rejected: undefined, srcChain: Chain.Main,
    to: bobAddress, validated: true,
})

describe('Tests of wallet type', () => {
    it('Should accept and store a sensible wallet', () => {
        return new Wallet({
            address: aliceAddress, offchainBalance: 20, onchainBalance: 1,
            txs: List([aliceToTrent.getGUID(), aliceToBob.getGUID()]),
            username: 'alice'
        }) && undefined
    })

    it('Should reject negative balances', () => {
        expect(() => new Wallet({
            address: aliceAddress,
            offchainBalance: 20, onchainBalance: -1,
            txs: List([aliceToTrent.getGUID(), aliceToBob.getGUID()]),
            username: 'alice'
        })).toThrow()
        expect(() => new Wallet({
            address: aliceAddress, offchainBalance: -20, onchainBalance: 1,
            txs: List([aliceToTrent.getGUID(), aliceToBob.getGUID()]),
            username: 'alice',
        })).toThrow()
    })
})
