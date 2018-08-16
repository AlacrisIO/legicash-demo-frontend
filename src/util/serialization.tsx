/** Logic related to serialization */

/* Matches hex representation of an unsigned integer  */
const hexRe = /^[0-9A-Fa-f]+$/

/**
 * True iff `s` is a hexadecimal representation of a `numbits` uInt
 * Assumes numbits % 8 == 0 bits
 */
export const uInt = (s: string, numbits: number): boolean =>
    (hexRe.exec(s) ? true : false)  // shut typescript up
    && s.length * 8 <= numbits

/** ASCII represented by  hex string hexx.
 * Via https://stackoverflow.com/a/3745677/1941213
 */
export function hexToASCII(hexx: string): string {
    const hex = hexx.toString()  // force conversion
    let str = ''
    for (let i = 0; i < hex.length; i += 2) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
    }
    return str
}

/**
 * `n` with zero-padding to make it a `numbits` hexadecimal
 * Assumes numbits % 8 == 0
 */
export const hexToSizedHex = (n: string, numbits: number): string =>
    ('0' as any /* ??? */).repeat((numbits / 8) - n.length) + n

/**
 * Return the `numbits` serialization of the uint represented by `n`
 * Assumes numbits % 8 == 0
 */
export const hexToBinaryUInt = (n: string, numbits: number): string => {
    if (!uInt(n, numbits)) {
        throw Error(`Not hexadecimal representation of ${numbits}-bit unsigned \
integer: ${n}!`)
    }
    return hexToASCII(hexToSizedHex(n, numbits))
}
