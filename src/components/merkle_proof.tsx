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

/* Start and end rows of table, like | Root |  <root hash> | */
const boundaryLevel = (name: string, hash: HashValue) =>
    <tr>
        <td>{name}</td><td colSpan={2} style={targetCSS}>{hash.toString()}</td>
    </tr>

/* Internal level of Merkle tree. Red for target node, plain for sibling */
const renderLayer = (l: MerkleProofLayer, idx: number) =>
    <tr key={idx}>
        <td />
        <td style={hashColor(!l.child)}> {l.left.toString()}</td>
        <td style={hashColor(l.child)}> {l.right.toString()}</td>
    </tr>

export interface IMerkleProofDisplay { proof: MerkleProof }

/** Renders a Merkle proof */
export const MerkleProofDisplay = ({ proof }: IMerkleProofDisplay) =>
    <table className="merkleTable" style={alignCSS} >
        <tbody>
            {boundaryLevel("Root", proof.root)}
            {proof.proof.reverse().map(renderLayer)}
            {boundaryLevel("Leaf", proof.leafHash())}
        </tbody>
    </table>

interface IMerkleProofWait {
    proofPromise: Promise<MerkleProof>
}

/** Renders a Merkle proof, once it's available from a promise */
export class MerkleProofWait extends React.Component<IMerkleProofWait, {}> {
    public state: { proof?: MerkleProof; error?: Error }
    constructor(props: IMerkleProofWait) {
        super(props)
        props.proofPromise
            .then(r => this.setState({ proof: r }))
            .catch(e => {
                this.setState({ error: e })
            })
    }
    public render() {
        if (this.state && this.state.proof) {
            return <MerkleProofDisplay proof={this.state.proof} />
        } else if (this.state && this.state.error) {
            return <p>{this.state.error.message}</p>
        } else {
            return <Spinner name="circle"
                overrideSpinnerClassName="load-merkle" />
        }
    }
}
