import { randomHashString } from './common'
import { HashValue } from './hash'

describe('Tests of hash type', () => {
    it('Accepts and stores a sensible hash', () => {
        return new HashValue(randomHashString()) && undefined
    })

    it('Rejects malformed hash strings', () => {
        expect(() => new HashValue('foo')).toThrow()
    })

    it('Matches equal hash strings', () => {
        const hashString = randomHashString();
        expect(new HashValue(hashString).equal(new HashValue(hashString)))
    })

    it('Does not match unequal strings', () => {
        const hash1 = new HashValue(randomHashString());
        const hash2 = new HashValue(randomHashString());
        if (hash1.toString() === hash2.toString()) {
            throw Error("Should never be equal!")
        }
        expect(!hash1.equal(hash2))
    })
})
