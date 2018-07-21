import * as React from 'react';
// This is the magic typescript invocation for react-spinkit. See
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/27455#issuecomment-406763025
import * as Spinner from 'react-spinkit'
import { HashValue } from '../types/hash'
import { MerkleProof } from '../types/merkle_proof'
import { MerkleProofLayer } from '../types/merkle_proof_layer'

const redCSS: React.CSSProperties = { 'color': 'red' }
const alignCSS: React.CSSProperties = { 'textAlign': 'center' }

/* Red styling if true, none otherwise */
const hashColor = (c: boolean) => (c ? redCSS : undefined)

/* Start and end rows of table, like | Root |  <root hash> | */
const boundaryLevel = (name: string, hash: HashValue) =>
    <tr>
        <td>{name}</td><td colSpan={2} style={redCSS}>{hash.toString()}</td>
    </tr>

/* Internal level of Merkle tree. Red for target node, plain for sibling */
const renderLayer = (l: MerkleProofLayer) =>
    <tr>
        <td />
        <td style={hashColor(!l.child)}> {l.left.toString()}</td>
        <td style={hashColor(l.child)}> {l.right.toString()}</td>
    </tr>

export interface IMerkleProofDisplay { proof: MerkleProof }

/** Renders a Merkle proof */
export const MerkleProofDisplay = ({ proof }: IMerkleProofDisplay) =>
    <table className="merkleTable" style={alignCSS} >
        {boundaryLevel("Root", proof.root)}
        {proof.proof.map(renderLayer)}
        {boundaryLevel("Leaf", proof.leafHash())}
    </table>

interface IMerkleProofWait {
    error?: Error | undefined
    proof?: MerkleProof | undefined;
    proof_promise: Promise<MerkleProof>
}

/** Renders a Merkle proof, once it's available from a promise */
export class MerkleProofWait extends React.Component<IMerkleProofWait, {}> {
    public state: IMerkleProofWait
    constructor(props: IMerkleProofWait) {
        super(props)
        this.setState({ proof: undefined, error: undefined })
        this.props.proof_promise
            .then(r => this.setState({ proof: r }))
            .catch(e => this.setState({ error: e }))
    }
    public render() {
        if (this.props.proof) {
            return <MerkleProofDisplay proof={this.props.proof} />
        } else if (this.props.error) {
            return <p>{this.props.error.message}</p>
        }
        return <Spinner name="circle" />
    }
}
