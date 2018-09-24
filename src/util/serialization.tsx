/** Logic related to serialization */

import { keccak256 } from 'js-sha3'

/* Matches hex representation of an unsigned integer  */
const hexRe = /^0x[0-9A-Fa-f]+$/

const checkSize = (numbits: number) => {
    if (numbits % 8 !== 0) { Error(`Non-byte size! {numbits} % 8 !== 0`) }
}

/**
 * True iff `s` is a hexadecimal representation of a `numbits` uInt
 * Assumes numbits % 8 == 0 bits
 */
export const uInt = (s: string, numbits: number): boolean =>
    checkSize(numbits) ||
    (hexRe.exec(s) ? true : false)  // shut typescript up
    && (s.length - 2) * 4 <= numbits

export const checkHex = (s: string, msg: string) => {
    if (!hexRe.exec(s)) {
        throw Error('Attempt to convert %s as hexadecimal string to %m'
            .replace(/%s/, s).replace(/%m/, msg))
    }
}

/**
 * `n` with zero-padding to make it a `numbits` hexadecimal
 * Assumes numbits % 8 == 0
 */
export const hexToSizedHex = (n: string, numbits: number): string => {
    checkHex(n, `${numbits}-length hex string`)
    checkSize(numbits)
    const nybblePadding = (numbits / 4) - n.length + 2
    return ['0x', ('0' as any /* ??? */).repeat(nybblePadding),
        n.substring(2, n.length)].join('')
}

/** Bytes represented by  hex string hexx.
 * Via https://stackoverflow.com/a/3745677/1941213 , originally
 */
export function hexToBytes(n: string): Uint8Array {
    checkHex(n, 'bytes')
    let hex = n.substring(2, n.length).toString()  // drop '0x' prefix
    if (hex.length % 2 !== 0) { hex = '0' + hex }  // Make sure it's BYTES
    const rv = new Uint8Array(hex.length / 2)
    for (let i = 0; i < hex.length; i += 2) {
        rv[i / 2] = parseInt(hex.substring(i, 2), 16)
    }
    return rv
}

/**
 * Return the `numbits` serialization of the uint represented by `n`
 * Assumes numbits % 8 == 0
 */
export const hexToBinaryUInt = (n: string, numbits: number): Uint8Array => {
    if (!uInt(n, numbits)) {
        throw Error(`Not hexadecimal representation of ${numbits}-bit unsigned \
integer: ${n}! Can't convert to binary.`)
    }
    return hexToBytes(hexToSizedHex(n, numbits))
}

export const numToHex = (n: number) => '0x' + n.toString(16)

export const keccakHash = (s: string | ByteString) =>
    '0x' + (keccak256 as any).arrayBuffer(s)

/**
 * Convert byte array to hex (without '0x' prefix'
 * Taken from https://stackoverflow.com/a/34310051/1941213
 */
export const toHexString = (a: Uint8Array): string =>
    /* tslint:disable:no-bitwise */
    Array.from(a, (byte: number) => ('0' + (byte & 0xFF).toString(16)).slice(-2)
    ).join('')

export const numberToHexString = (n: number): string => '0x' + n.toString(16)

const logHashInput = (arrays: Uint8Array[]) => {
    const asHex = arrays.map(toHexString)
    asHex.splice(0, 0, '0x')
}

export const keccackHashArrays = (arrays: Uint8Array[]): string => {
    logHashInput(arrays)
    const h = keccak256.create()
    arrays.forEach(h.update.bind(h))
    return '0x' + h.hex()
}
