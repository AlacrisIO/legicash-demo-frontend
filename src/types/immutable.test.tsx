import { fromJS, is, Map, Record } from './immutable'


/* tslint:disable:interface-over-type-literal */
type A = { a: number, b: Record<B> & B, d: Map<string, any> }
type B = { c: number }

const bDefault = { c: 2 }

const aDefault: A = {
    a: 1, b: new (Record<{ c: number }>(bDefault))(bDefault),
    d: Map({ e: 5 })
}

const AFactory = Record(aDefault, 'foo')
const m = new AFactory({ 'a': 3 })

describe('Checks on Record shim', () => {
    it('Can create a record, update it, and still have a Record', () => {
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
    it('deleteIn throws when asked to misbehave', () => {
        expect(m.d.has('e')).toBe(true)
        expect(m.deleteIn(['d', 'e']).d.has('e')).toBe(false)
        expect(() => m.deleteIn(['d'])).toThrow()
    })
    it('multiUpdateIn does multiple updates', () => {
        const n = m.multiUpdateIn([
            [['a'], (x: number) => x + 1],
            [['d', 'e'], () => 10]])
        expect(n.a).toBe(m.a + 1)
        expect(n.d.get('e')).toBe(10)
        const p: Map<string, any> = fromJS({ a: { b: { c: 1 } } })
        const path = ['a', 'b', 'c']
        const q = p.multiUpdateIn([[path, x => x + 1]])
        expect(q.getIn(path)).toBe(p.getIn(path) + 1)
    })
    it('Works with Immutable.is', () => {
        // Works for standard Immutable objects
        expect(is(Map({ e: 5 }), Map({ e: 5 }))).toBe(true)
        const mCopy = new AFactory({ a: 3 })
        // expect(aCopy.equals(aDefault)).toBe(true)
        expect(is(mCopy, m)).toBe(true)
    })
})
