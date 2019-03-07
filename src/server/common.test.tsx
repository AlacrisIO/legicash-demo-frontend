import { get, post } from './common'
import { addresses } from './ethereum_addresses'

export const validateBalance = (resp: any) => {
    const side = resp.side_chain_account.account_state

    const valid = parseInt(side.balance,          16) >= 0
               && parseInt(side.account_revision, 16) >= 0

    if (!valid) {
        throw Error(`Bad balance response: ${JSON.stringify(resp)}`)
    }

    return true
}

const allWith = (elems: any[], f: (x: any) => boolean) =>
    elems.reduce((acc, e) => acc && f(e), true)

describe('server/common tests', () => {
    /* XXX: Flaky tests which depend on the server running. */
    let connected = false

    const whenConnectedIt = (description: string, spec: () => Promise<any>) =>
        it(description, () => connected
            ? spec()
            : expect(connected).toBe(true));

    // NB 2019-01-22: our present CORS config prevents us using a more generic
    // route such as GET /, so we're picking GET /api/balances out of the hat
    // here instead - we just need to know whether the server is responding
    beforeAll(() => get('balances', {})
        .then(r => connected = true ))

    whenConnectedIt('Hits the balances endpoint sensibly', () => {
        const req = get('balances', {})
            .then(r => allWith(Object.values(r), validateBalance))

        return expect(req)
            .resolves.toBe(true)
    })

    whenConnectedIt('Gets a single balance', () => {
        const address     = addresses.Alice.toString()
        const notFoundMsg = `Could not find balance for address ${address}`

        const req = post('balance', { address })
            .then((r: any) => r.error
                ? r.error   === notFoundMsg
                : r.address === address && Number.isFinite(
                    parseInt(r.account_balance, 16)))

        return expect(req)
            .resolves.toBe(true)
    })
})
