import { Record } from './record'

describe('Checks on Record shim', () => {
    it('Can create a record, update it, and still have a Record', () => {
        const bDefault = { 'c': 2 }
        const aDefault = { 'a': 1, 'b': new (Record<{ c: number }>(bDefault))(bDefault) }
        const AFactory = Record(aDefault, 'foo')
        const m = new AFactory({ 'a': 3 })
        expect(m.a).toBe(3)  // Resets on creation take effect
        expect(m.b.c).toBe(2)  // Can reach deep into structure
        const n = m.update('a', () => 2)
        expect(n.a).toBe(2)  // Updates work
        expect(m.a).toBe(3)  // Without affecting the original
        expect(m instanceof AFactory).toBe(true)
        const p = m.updateIn(['b', 'c'], () => 3)  // Same for updateIn
        expect(p.b.c).toBe(3)
        expect(m.b.c).toBe(2)
    })
})
