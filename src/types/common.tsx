import { randomBytes } from 'crypto'

export const randomHashString = () => '0x' + randomBytes(32).toString('hex')

