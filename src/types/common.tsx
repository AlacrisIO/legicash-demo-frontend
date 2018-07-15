import { randomBytes } from 'crypto'

export const random_hash_string = () => '0x' + randomBytes(32).toString('hex')

