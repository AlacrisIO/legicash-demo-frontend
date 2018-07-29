import { Address } from './address'

describe('Tests of address types', () => {
    it('Accepts and stores a sensible ethereum address', () => {
        const addressString = '0x5050505050505050505050505050505050505050';
        const address = new Address(addressString);
        expect(address.toString()).toEqual(addressString);
    })

    it('Accepts an empty address', () => {
        expect((new Address('')).toString()).toEqual('');
    })

    it('Rejects addresses which do not match', () => {
        expect(() => new Address('foo')).toThrow()
        expect(() => new Address('0x505050505050505050505050505050505050505')
        ).toThrow()
        expect(() => new Address('0x50505050505050505050505050505050505050505')
        ).toThrow()
    })
    const a1 = new Address('0x5050505050505050505050505050505050505050')
    const a2 = new Address('0x5050505050505050505050505050505050505050')
    const a3 = new Address('0x0505050505050505050505050505050505050505')
    it('Matches on equal addresses', () => { expect(a1.equals(a2)).toBe(true) })
    it('Does not match on unequal addresses', () => {
        expect(a1.equals(a3)).toBe(false)
    })
})
