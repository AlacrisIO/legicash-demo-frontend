import { Address } from './address'

describe('Tests of address types', () => {
    it('Accepts and stores a sensible ethereum address', () => {
        const address_string = '0x5050505050505050505050505050505050505050';
        const address = new Address(address_string);
        expect(address.toString()).toEqual(address_string);
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
})
