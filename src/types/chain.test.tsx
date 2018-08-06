import { Address } from './address'
import { Chain } from './chain'
import { HashValue } from './hash'
import { Transaction } from './tx'

export const aliceAddress = new Address('0x' + 'a11ce'.repeat(8));
const trentAddress = new Address('0x7472656e747472656e747472656e747472656e74');
const bobAddress = new Address('0xb0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0');
const hash = new HashValue('0x' + 'ff'.repeat(32))

const now = new Date()
export const aliceToTrent = new Transaction({
    amount: 19, creationDate: now, dstChain: Chain.Side, failureMessage: '',
    from: aliceAddress, hash, rejected: undefined, srcChain: Chain.Main,
    to: trentAddress, validated: true,
})

export const aliceToBob = new Transaction({
    amount: 1, creationDate: now, dstChain: Chain.Side, failureMessage: '',
    from: aliceAddress, hash, rejected: undefined, srcChain: Chain.Main,
    to: bobAddress, validated: true,
})

it('dummy test', () => expect(true).toBeTruthy())
