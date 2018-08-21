import { randomBytes } from 'crypto'
import { HashValue } from './hash'
export const randomHashString = () => '0x' + randomBytes(32).toString('hex')

export const randomHash = () => new HashValue(randomHashString())


