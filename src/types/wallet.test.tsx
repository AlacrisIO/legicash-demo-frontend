import { List } from 'immutable'
import { aliceAddress, aliceToTrent, aliceToBob } from './chain.test'
import { Wallet } from './wallet'

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
