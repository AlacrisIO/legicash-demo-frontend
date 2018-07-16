import { random_hash_string } from './common'
import { HashValue } from './hash'

describe('Tests of hash type', () => {
    it('Accepts and stores a sensible hash', () => {
        new HashValue(random_hash_string())
    })

    it('Rejects malformed hash strings', () => {
        expect(() => { new HashValue('foo') }).toThrow()
    })

    it('Matches equal hash strings', () => {
        var hash_string = random_hash_string();
        expect(new HashValue(hash_string).equal(new HashValue(hash_string)))
    })

    it('Does not match unequal strings', () => {
        var hash1 = new HashValue(random_hash_string());
        var hash2 = new HashValue(random_hash_string());
        if (hash1.hash == hash2.hash) { throw "Should never be equal!" }
        expect(!hash1.equal(hash2))
    })
})
