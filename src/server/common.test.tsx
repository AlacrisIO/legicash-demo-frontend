import { whenConnectedIt } from  '../util/test_util'
import { get, post }       from  './common'
import { addresses }       from  './ethereum_addresses'

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
