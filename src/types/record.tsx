/**
 * Shim around typescript's terrible types for Immutable.Record
 */

import * as Immutable from 'immutable'

type anyFunc = (v: any) => any

interface IRecord { [s: string]: any }

/* tslint:disable:interface-name */
export interface Record<IArgs extends IRecord> {
    new(args: Partial<IArgs>): Record<IArgs> & IArgs
    update(key: (keyof IArgs), updater: anyFunc): Record<IArgs> & IArgs
    updateIn(keys: any[], updater: anyFunc): Record<IArgs> & IArgs
    get(key: keyof IArgs): any
    set(key: keyof IArgs, value: any): void
    has(key: string): boolean
    deleteIn(keys: any[]): Record<IArgs> & IArgs
}

export function Record<IArgs>(args: IArgs, name?: string): Record<IArgs> & IArgs {
    const rv = (Immutable.Record(args, name) as any)
    return rv
}
