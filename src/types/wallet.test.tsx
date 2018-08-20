import { List } from 'immutable'
import { aliceAddress, aliceToBob, aliceToTrent } from './chain.test'
import { Guid } from './guid'
import { SortedList } from './sorted_list'
import { keyFn, sortKey, Wallet } from './wallet'

const txs = new SortedList<Guid, sortKey>({
    elements: List([aliceToTrent.getGUID(), aliceToBob.getGUID()]),
    keyFn: (g: Guid): sortKey =>
        keyFn((g === aliceToTrent.getGUID()) ? aliceToTrent : aliceToBob)
})

describe('Tests of wallet type', () => {
    it('Should accept and store a sensible wallet', () => {
        return new Wallet({
            address: aliceAddress, offchainBalance: 20, onchainBalance: 1, txs,
            username: 'alice'
        }) && undefined
    })

    it('Should reject negative balances', () => {
        expect(() => new Wallet({
            address: aliceAddress,
            offchainBalance: 20, onchainBalance: -1, username: 'alice'
        })).toThrow()
        expect(() => new Wallet({
            address: aliceAddress, offchainBalance: -20, onchainBalance: 1, txs,
            username: 'alice',
        })).toThrow()
    })
})
