import * as Immutable from 'immutable'
import { is, List, Map, Record } from './immutable'

type comparisonResults = -1 | 0 | 1

export interface ISortedList<T, K> {
    elements: List<T>;
    keyFn: (this: ISortedList<T, K>, e: T) => K;
    readonly cmp?: (k1: K, k2: K) => comparisonResults;
    keys?: List<K>;
    lSize?: number;
}

const defaultValues = {
    cmp: (x: any, y: any) => x < y ? -1 : (x > y ? 1 : 0),
    elements: List(),
    keyFn: (x: any) => x,  // XXX: This will break things.
    keys: List(),
    lSize: 0,
}

export class SortedList<T, K> extends Record(defaultValues) implements ISortedList<T, K> {
    // `keys` and `elements` are kept in alignment, sorted by `keys` via `cmp
    public elements: List<T>
    public keyFn: (e: T) => K
    public cmp: (k1: K, k2: K) => comparisonResults
    public keys: List<K>
    constructor(props: ISortedList<T, K>) {
        const unsortedElements = List(props.elements)
        const keyMemo = Map<T, K>().fromPairs(
            unsortedElements.map((e: T): [T, K] => [e, props.keyFn(e)]).toArray())
        const elements = List(unsortedElements.sortBy(
            (e: T) => keyMemo.get(e) as K, props.cmp))
        const keys = List(elements.map((e: T) => keyMemo.get(e) as K))
        const nProps = { ...props as ISortedList<T, K>, elements, keys, lSize: keys.size }
        super(nProps)
    }
    public add(e: T, key?: K): this {
        if (key === undefined) {
            key = this.keyFn(e)
        }
        const insertIdx = this.binarySearch(key)
        if ((insertIdx < 0) || (insertIdx > this.keys.size)) {
            throw Error(`Search index for ${key} out of bounds in ${this.keys}`)
        }
        const locElt = this.elements.get(insertIdx)
        const locKey = this.keys.get(insertIdx)
        if (is(locKey, key) && (!is(locElt, e))) {
            // XXX: This is going to happen, though hopefully not with the demo
            throw Error(`Elements with matching keys! ${key}, ${e}, ${locElt}`)
        }
        if (is(locKey, key) && is(locElt, e)) { return this }  // Already present
        function insert<U>(elt: U) {
            return (l: List<U>) => l.insert(insertIdx as number, elt)
        }
        return this.multiUpdateIn([
            [['elements'], insert(e)],
            [['keys'], insert(key)],
            [['lSize'], (s: number) => s + 1]
        ])
    }
    /** Returns true if `e` is in list, falsey otherwise */
    public hasElt(e: T, key?: K): boolean {
        key = (key === undefined) ? this.keyFn(e) : key
        const insertIdx = this.binarySearch(key)
        return ((is(key, this.keys.get(insertIdx)))
            && (is(this.elements.get(insertIdx), e)))
    }
    public map<V>(f: (e: T) => V): Immutable.Iterable<number, V> {
        return this.elements.map(f)
    }
    /** The index where this key should be inserted, or undefined if present */
    private binarySearch(key: K): number {
        // Cribbed from https://stackoverflow.com/questions/22697936/binary-search-in-javascript#29018745
        let m = 0
        let n = this.elements.size - 1
        while (m <= n) {
            /* tslint:disable:no-bitwise */
            const midpoint = (n + m) >> 1
            const midpointKey = this.keys.get(midpoint)
            if (midpointKey === undefined) {
                throw Error(`Out of bounds access at index ${midpoint} while \
searching for key ${key} in list of size ${this.keys.size} : ${this.keys}`)
            }
            const cmp = this.cmp(key, midpointKey)
            if (cmp > 0) { m = midpoint + 1 }
            else if (cmp < 0) { n = midpoint - 1 }
            else { return midpoint }  // Break out of loop with found idx
        }
        return m  // Not found, so give index where should be inserted
    }
}
