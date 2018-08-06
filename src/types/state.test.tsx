import { aliceToTrent } from './chain.test'
import { Guid } from './guid'
import { Map } from './immutable'
import { UIState } from './state'
import { Transaction } from './tx'

const s = new UIState({})
const ns = s.addTx(aliceToTrent)
const emptyMap = Map<Guid, Transaction>({})
const firstExpected = emptyMap.set(
    aliceToTrent.localGUID as Guid, aliceToTrent)
const nt = aliceToTrent.set('validated', true)
const nns = ns.addTx(nt)
const secondExpected = emptyMap.set(nt.localGUID as Guid, nt)

describe('UIState tests', () => {
    it('Adds an unknown tx', () => { expect(ns.txByGUID).toEqual(firstExpected) })
    it('Adds a tx which has been seen before', () => {
        expect(nns.txByGUID).toEqual(secondExpected)
    })
})
