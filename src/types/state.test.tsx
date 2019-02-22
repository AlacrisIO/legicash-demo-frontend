import { aliceToTrent } from './chain.test'
import { Guid } from './guid'
import { Map } from './immutable'
import {ITxPatch, UIState} from './state'
import { Transaction } from './tx'

const s = new UIState({});
const ns = s.addTx(aliceToTrent);

const emptyMap = Map<Guid, Transaction>({});

const newLocalGUID = new Guid();

const firstExpected = emptyMap.set(aliceToTrent.getGUID(), aliceToTrent);

const nt = aliceToTrent.set('validated', true).set('localGUID', newLocalGUID)

const nns = ns.updateTx(aliceToTrent.getGUID() as Guid, nt);


// Should correct to previous GUID, based on side-chain data, but with the new
// Tx data.
const secondExpected = emptyMap.set(
    aliceToTrent.getGUID() as Guid,
    nt.set('localGUID', aliceToTrent.getGUID()).set('creationDate', aliceToTrent.creationDate)
);

describe('UIState tests', () => {

    it('Adds an unknown tx', () => {
        expect(ns.txByGUID).toEqual(firstExpected);
    });

    it('Adds a tx which has been seen before', () => {
        expect(nns.txByGUID).toEqual(secondExpected)
    });

    it('Updates the side-chain indices, when provided', () => {

        const emptyRevMap = Map<number, ITxPatch>();
        const txPatch = {guid: aliceToTrent.getGUID(), date: aliceToTrent.creationDate};
        const srcRevMap = emptyRevMap.set(nt.srcSideChainRevision as number, txPatch);


        expect(nns.txBySrcSideChainRevision).toEqual(srcRevMap);
        const dstRevMap = emptyRevMap.set(nt.dstSideChainRevision as number, txPatch);
        expect(nns.txByDstSideChainRevision).toEqual(dstRevMap);
    })
})
