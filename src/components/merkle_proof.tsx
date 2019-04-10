import * as React  from 'react';
import { connect } from 'react-redux'

// This is the magic typescript invocation for react-spinkit. See
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/27455#issuecomment-406763025
import * as Spinner                 from 'react-spinkit'
import { Card, Table }              from 'semantic-ui-react'
import { HashValue }                from '../types/hash'
import { stepsIntermediateDigests } from '../types/proofs/proof_protocol'

import {
    IBranch, IResponse, ISkip, isLeftBranch, isSkip, step
} from '../types/proofs/proof_types'

import { UIState }     from '../types/state'
import { Transaction } from '../types/tx'


// How to color the direct ancestors of the leaf we're proving
const targetCSS: React.CSSProperties = { 'color': 'red' }
const alignCSS: React.CSSProperties = { 'textAlign': 'center' }

/* Red styling if true, none otherwise */
const hashColor = (c: boolean) => (c ? targetCSS : undefined)

const truncateHash = (h: HashValue) => h.toRawString().substring(0, 10)

/* E.g., | Root |  <root hash> | */
const singleHashEntry = (key: number, name: string, hash: HashValue) =>
    <Table.Row key={key}>
        <Table.Cell>{name}</Table.Cell>
        <Table.Cell colSpan={2} style={targetCSS}>{truncateHash(hash)}</Table.Cell>
    </Table.Row>

const doubleHashEntry =
    (key: number, left: HashValue, right: HashValue, target: boolean) =>
        <Table.Row key={key}>
            <Table.Cell />
            <Table.Cell style={hashColor(target)}>{truncateHash(left)}</Table.Cell>
            <Table.Cell style={hashColor(!target)}>{truncateHash(right)}</Table.Cell>
        </Table.Row>

const renderLeaf = (key: number, hash: HashValue) =>
    singleHashEntry(key, "Leaf", hash)
const renderRoot = (key: number, hash: HashValue) =>
    singleHashEntry(key, "Root", hash)
const renderSkip = (key: number, skip: ISkip, hash: HashValue) =>
    singleHashEntry(key, `Skip ${skip.length} levels`, hash)
const renderLeft = (key: number, branch: IBranch, hash: HashValue) =>
    doubleHashEntry(key, hash, new HashValue(branch.right as string), false)
const renderRight = (key: number, branch: IBranch, hash: HashValue) =>
    doubleHashEntry(key, new HashValue(branch.left as string), hash, true)

/* Internal level of Merkle tree. Target nodes with hashColor style, sibling
 * nodes plain
 */
const renderLayer = (idx: number, l: step, currentDigest: HashValue) =>
    isSkip(l)
        ? renderSkip(idx, l as ISkip, currentDigest)
        : isLeftBranch(l)
            ? renderLeft(idx, l as IBranch, currentDigest)
            : renderRight(idx, l as IBranch, currentDigest)

const renderLayers = (proof: IResponse) => {
    const layers = [renderLeaf(-1, new HashValue(proof.leaf))]
    let currentDigest = proof.leaf
    const digests = stepsIntermediateDigests(proof.steps, proof.leaf)
    for (let i = 0; i < digests.length; i++) {
        layers.push(
            renderLayer(i, proof.steps[i], new HashValue(currentDigest)))
        currentDigest = digests[i]
    }
    layers.push(renderRoot(layers.length, new HashValue(proof.trie)))
    return layers
}
export interface IMerkleProofDisplay { proof: IResponse }

/** Renders a MerkleProof for display to the user */
export const MerkleProofDisplay = ({ proof }: IMerkleProofDisplay) =>
    <Card.Description >
        <Table className="merkleTable" style={alignCSS} celled={true} >
            <Table.Body>{renderLayers(proof)}</Table.Body>
        </Table>
    </Card.Description>

interface IMerkleProofWait {
    /** Description of the data for which a proof is being sought */
    eventInfo: React.ReactElement<any> | string;
    /** Holds the proof result, or an error, if available. */
    result: IResponse | Error | null | undefined | false
}

/**
 * Renders a Merkle proof, once it's available via relevant redux state
 *
 * Or reports an error, if that happens, and spins until one or the other.
 */
export const DumbMerkleProofWait = ({ eventInfo, result }: IMerkleProofWait) =>
    <Card fluid={true}>
    <Card.Content>
        <Card.Header><h3>Proof for {eventInfo}</h3></Card.Header>
        {(result as IResponse || {}).trie &&
            <Card.Meta>{'Proof at trie hash '}<b>{(result as IResponse ).trie.slice(0, 10)}</b></Card.Meta>}
        {(result as IResponse || {}).trie &&
            <MerkleProofDisplay proof={result as IResponse} />}
        {(result instanceof Error) &&
            <Card.Description as={'div'} className="load-merkle-error">"Error: " {result.message}</Card.Description>}
        {(!result) &&
            <Card.Description>
                <Spinner name="circle" overrideSpinnerClassName="load-merkle" />
            </Card.Description>
        }
        </Card.Content>
    </Card>

export const MerkleProofWait = ({ tx }: { tx: Transaction }) => connect(
    (state: UIState) => ({
        eventInfo: 'transaction',
        result: state.proofByGUID.get(tx.getGUID())
    }),
    (dispatch: any) => ({})
)(DumbMerkleProofWait)

interface IProofDisplay { requestProof: () => void; requestToggle: () => void; show: boolean; showBlockLink : boolean; tx: Transaction }

/** Button in tx table row which allows user to toggle/request proof display */
export class ProofDisplay extends React.Component<IProofDisplay, {}> {
    public state = {
        display: false,
        proofOpen: false
    }

    public constructor(props: IProofDisplay) {
        super(props)
        this.getProof = this.getProof.bind(this)
        this.exploreBlock = this.exploreBlock.bind(this)
    }

    public getProof() {
        this.props.requestProof();
        this.props.requestToggle();
    }
    public exploreBlock() {
        if (process.env.REACT_APP_BLOCK_EXPLORER_URL) {
            window.open(process.env.REACT_APP_BLOCK_EXPLORER_URL + this.props.tx.getBlockNumber(), '_blank');
        }
    }

    public render() {
        let display = <span />
        if (this.props.show) {
            const WaitComponent = MerkleProofWait({ tx: this.props.tx })
            display = <div><WaitComponent /></div>
        }

        const expBlockStyle = {display: this.props.showBlockLink ? 'block' : 'none'};
        let exploreBlockLink = <span />;
        if (this.props.tx.getBlockNumber()) {
            exploreBlockLink = <a className={'bluelink'} style={expBlockStyle} onClick={this.exploreBlock}>Explore block</a>
        }

        const merkleProofLinkText = this.props.show ? 'Hide Merkle Proof' : 'Show Merkle Proof';

        return <div style={{marginTop: '10px'}}>
            <div className={'lrsplit'}>
            <a className={'bluelink'} onClick={this.getProof}>{merkleProofLinkText}</a>
                {exploreBlockLink}
            </div>
            {display}
        </div>
    }
}
