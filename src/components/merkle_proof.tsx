import * as React from 'react';
// This is the magic typescript invocation for react-spinkit. See
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/27455#issuecomment-406763025
import * as Spinner from 'react-spinkit'
import { HashValue } from '../types/hash'
import { MerkleProof } from '../types/merkle_proof'
import { MerkleProofLayer } from '../types/merkle_proof_layer'

// How to color the direct ancestors of the leaf we're proving
const targetCSS: React.CSSProperties = { 'color': 'red' }
const alignCSS: React.CSSProperties = { 'textAlign': 'center' }

/* Red styling if true, none otherwise */
const hashColor = (c: boolean) => (c ? targetCSS : undefined)

const truncateHash = (h: HashValue) => h.toRawString().substring(0, 10)

/* Start and end rows of table, like | Root |  <root hash> | */
const boundaryLevel = (name: string, hash: HashValue) =>
    <tr>
        <td>{name}</td>
        <td colSpan={2} style={targetCSS}>{truncateHash(hash)}</td>
    </tr>

/* Internal level of Merkle tree. Target nodes with hashColor style, sibling
 * nodes plain
 */
const renderLayer = (l: MerkleProofLayer, idx: number) =>
    <tr key={idx}>
        <td />
        <td style={hashColor(!l.child)}> {truncateHash(l.left)}</td>
        <td style={hashColor(l.child)}> {truncateHash(l.right)}</td>
    </tr>

export interface IMerkleProofDisplay { proof: MerkleProof }

/** Renders a MerkleProof for display to the user */
export const MerkleProofDisplay = ({ proof }: IMerkleProofDisplay) =>
    <table className="merkleTable" style={alignCSS} >
        <tbody>
            {boundaryLevel("Root", proof.root)}
            {proof.proof.reverse().map(renderLayer)}
            {boundaryLevel("Leaf", proof.leafHash())}
        </tbody>
    </table>

interface IMerkleProofWait {
    /** Description of the data for which a proof is being sought */
    eventInfo: React.ReactElement<any> | string;
    /** Holds the proof result, or an error, if available. */
    result: MerkleProof | Error | null | undefined | false
}

/**
 * Renders a Merkle proof, once it's available via relevant redux state
 *
 * Or reports an error, if that happens, and spins until one or the other.
 */
export const MerkleProofWait = ({ eventInfo, result }: IMerkleProofWait) =>
    <div className="merkleProofWait">
        <p>"Proof for " {eventInfo}</p>
        {(result instanceof MerkleProof) && <MerkleProofDisplay proof={result} />}
        {(result instanceof Error) &&
            <p className="load-merkle-error">"Error: " {result.message}</p>}
        {(!result) &&
            <Spinner name="circle" overrideSpinnerClassName="load-merkle" />}
    </div>
