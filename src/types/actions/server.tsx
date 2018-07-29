import { MerkleProof } from '../merkle_proof'
import { Transaction } from '../tx'

export type ServerResponse = MerkleProof | Transaction | Error
