import { call, put }                from 'redux-saga/effects'
import { get }                      from '../server/common'
import * as Actions                 from '../types/actions'
import { sidechainIdx }             from '../types/chain'
import { stepsIntermediateDigests } from '../types/proofs/proof_protocol'
import { IResponse }                from '../types/proofs/proof_types'
import { listener }                 from './common'

export function* proof(action: Actions.IProofRequested) {
    const id = sidechainIdx(action.tx)
    try {
        const r = yield call(get, 'proof', { 'tx-revision': id })

        if (r === undefined) {
            return yield put(
                Actions.proofError(action.tx, Error("Server failure!")))
        }

        if (r.steps && r.leaf) {
            // XXX: Constructing a "valid" proof without validation!!!
            const validationSteps = stepsIntermediateDigests(r.steps, r.leaf)
            return yield put(Actions.proofReceivedAndValid(
                action.tx, { ...(r as IResponse), validationSteps }))

        } else {
            return yield put(Actions.proofReceivedButInvalid(
                action.tx, r as IResponse))
        }

    } catch (e) {
        return yield put(Actions.proofError(action.tx, e))
    }
}

export const proofRequestListener = listener(
    Actions.Action.PROOF_REQUESTED, proof)
