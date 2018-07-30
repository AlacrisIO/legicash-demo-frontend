function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        /* tslint:disable:no-bitwise */
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Globally-unique identifier
 *
 * XXX: In principle, at least. This is not cryptographic randomness...
 * There's a version using the Web Crypto API here:
 * https://stackoverflow.com/a/2117523 . It is not widely implemented yet,
 * though.
 */
export class Guid { public guid: string; constructor() { this.guid = uuidv4() } }
