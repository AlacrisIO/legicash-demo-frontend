import { List, Map, Record } from './immutable'

type comparisonResults = -1 | 0 | 1

export interface ISortedList<T, K> {
    elements: List<T>;
    readonly key: (e: T) => K;
    readonly cmp?: (k1: K, k2: K) => comparisonResults;
    keys?: List<K>;
}

const defaultValues = {
    cmp: (x: any, y: any) => x < y ? -1 : (x > y ? 1 : 0),
    elements: List(),
    key: (x: any) => x,
    keys: List()
}

export class SortedList<T, K> extends Record(defaultValues) implements ISortedList<T, K> {
    // `keys` and `elements` are kept in alignment, sorted by `keys` via `cmp
    public elements: List<T>
    public key: (e: T) => K
    public cmp: (k1: K, k2: K) => comparisonResults
    public keys: List<K>
    constructor(props: ISortedList<T, K>) {
        const unsortedElements = List(props.elements)
        const keyMemo = Map<T, K>().fromPairs(
            unsortedElements.map((e: T): [T, K] => [e, props.key(e)]).toArray())
        const elements = List(unsortedElements.sortBy(
            (e: T) => keyMemo.get(e) as K, props.cmp))
        const keys = List(elements.map((e: T) => keyMemo.get(e) as K))
        super({ ...props, elements, keys })

    }
    public add(e: T): this {
        const key = this.key(e)
        const insertIdx = this.binarySearch(key)
        if (insertIdx === undefined) { return this }
        if ((insertIdx < 0) || (insertIdx > this.keys.size)) {
            throw Error(`Search index for ${key} out of bounds in ${this.keys}`)
        }
        function insert<U>(elt: U) {
            return (l: List<U>) => l.insert(insertIdx as number, elt)
        }
        return this.multiUpdateIn([
            [['elements'], insert(e)],
            [['keys'], insert(key)]
        ])
    }
    /** The index where this key should be inserted, or undefined if present */
    private binarySearch(key: K): number | undefined {
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
            else { return undefined }  // Break out of loop with +ve index
        }
        return m  // Not found, so give index where should be inserted
    }
}
