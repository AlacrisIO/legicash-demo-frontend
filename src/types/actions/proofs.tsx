import { IResponse, IValidatedResponse } from '../proofs/proof_types'
import { Transaction } from '../tx'
import { Action, IActionType } from './base_actions'

export interface IProofAction extends IActionType {
    tx: Transaction
    type: Action
}

/* tslint:disable:no-empty-interface */
export interface IProofRequested extends IProofAction { /* empty */ }

export interface IProofToggle extends IProofAction {
    owner: string
}

export const proofRequested = (tx: Transaction): IProofRequested => (
    { type: Action.PROOF_REQUESTED, tx })

export const proofToggled = (tx: Transaction, owner: string): IProofToggle => (
    { type: Action.PROOF_TOGGLED, tx, owner })

export interface IProofReceivedAndValid extends IProofAction {
    proof: IValidatedResponse
}
export const proofReceivedAndValid =
    (tx: Transaction, proof: IValidatedResponse): IProofReceivedAndValid => (
        { tx, type: Action.PROOF_RECEIVED_AND_VALID, proof })

export interface IProofReceivedButInvalid extends IProofAction {
    response: IResponse
}
export const proofReceivedButInvalid =
    (tx: Transaction, response: IResponse): IProofReceivedButInvalid => (
        { tx, response, type: Action.PROOF_RECEIVED_BUT_INVALID })

export interface IProofError extends IProofAction {
    error: Error
}
export const proofError = (tx: Transaction, error: Error): IProofError => (
    { tx, error, type: Action.PROOF_ERROR })
