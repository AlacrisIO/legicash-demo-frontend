/**
 * Shim around typescript's terrible types for Immutable.Record
 */

import * as Immutable from 'immutable'
export { List, is, fromJS, Set } from 'immutable'

type anyFunc = (v: any) => any

/* Set of keys for deep access, and update function to be applied there */
export type update = [any[], anyFunc]

/* tslint:disable:interface-name */
export interface Map<K, V> extends Immutable.Map<K, V> {
    (): Map<K, V>
    new(a: object): Map<K, V> & null
    set(k: K, v: V): this
    multiUpdateIn(updates: update[]): this
    fromPairs(pairs: Array<[K, V]>): this
    withMutations(mutator: (mutable: this) => this): this
}

// Note that you don't use `new` with this... It's a pain... Lots of holes, here.
export function Map<K, V>(obj?: object): Map<K, V> {
    if (obj === undefined) { return Immutable.Map() as any }
    return Immutable.fromJS(obj)
}

interface IRecord { [s: string]: any }

export interface Record<IArgs extends IRecord> {
    new(args: Partial<IArgs>): Record<IArgs> & IArgs
    update(key: (keyof IArgs), updater: anyFunc): this
    updateIn(keys: any[], updater: anyFunc): this
    multiUpdateIn(updates: update[]): this
    get(key: keyof IArgs): any  // XXX: Should be able to tighten return type
    set(key: keyof IArgs, value: any): this
    getIn(keys: any[]): any
    setIn(keys: any[], val: any): this
    has(key: string): boolean
    deleteIn(keys: any[]): this
    withMutations(mutator: (mutable: Record<IArgs>) => any): this
    equals(this: Record<IArgs>, o: typeof this): boolean
    hashCode(this: Record<IArgs>): number
}

const rPrototype = Immutable.Record.prototype

export function Record<IArgs>(args: IArgs, name?: string): Record<IArgs> & IArgs {
    let hasInitialized: boolean
    function RecordType(this: any, values: IArgs): any {
        if (values instanceof RecordType) {
            return values;
        }
        if (!(this instanceof RecordType)) {
            return new (RecordType as any)(values);
        }
        if (!hasInitialized) {
            hasInitialized = true
            const keys = Object.keys(args)
            setProps(RecordTypePrototype, keys)
            RecordTypePrototype.size = keys.length
            RecordTypePrototype._name = name
            RecordTypePrototype._keys = keys
            RecordTypePrototype._defaultValues = args
        }
        this._map = Immutable.Map(values)
    }

    const RecordTypePrototype = Object.create(rPrototype)
    RecordType.prototype = RecordTypePrototype
    RecordTypePrototype.constructor = RecordType;

    return (RecordType as any)
}

function setProps(prototype: object, names: string[]): void {
    names.forEach(setProp.bind(undefined, prototype))
}

function _setProp(prototype: object, name: string) {
    Object.defineProperty(prototype, name, {
        get(): any { return this.get(name) },
        set(value): void {
            if (!this.__ownerID) {
                throw Error('Cannot set on an immutable record.')
            }
            this.set(name, value);
        }
    })
}

function setProp(prototype: object, name: string) {
    try { _setProp(prototype, name) } catch (error) {
        /* tslint:disable:no-console */
        console.log(`Failed to set prop ${name}: ${error}`)
    }
}

rPrototype.deleteIn = function <IArgs>(this: Record<IArgs> & IArgs, keys: any[])
    : typeof this {
    if (keys.length === 0) { return this }
    const [key, ...rest] = keys
    if (keys.length === 1) {
        throw new Error(`Attempt to delete \`${key}\` (first key of \
\`${JSON.stringify(keys)}\`) from \`${this}\``)
    }
    if (!this.has(key)) { throw Error(`Missing ${key} from ${this}`) }
    return this.set(key, this.get(key).deleteIn(rest))
}

export const multiUpdateIn = function <T>(
    this: T, updates: Array<[any, anyFunc]>): T {
    return (this as any).withMutations((r: T): T => {
        for (const [keys, updater] of updates) {
            r = (r as any).updateIn(keys, updater)
        }
        return r
    })
}

export const fromPairs = function <K, V>(
    this: Map<K, V>, pairs: Array<[K, V]>): typeof this {
    return this.withMutations((m: typeof this) => {
        pairs.forEach(([key, value]: [K, V]) => m = m.set(key, value))
        return m
    })
}

rPrototype.multiUpdateIn = multiUpdateIn
Immutable.Map.prototype.fromPairs = fromPairs
Immutable.Map.prototype.multiUpdateIn = multiUpdateIn
