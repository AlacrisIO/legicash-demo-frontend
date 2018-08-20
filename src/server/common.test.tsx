import { get, post } from './common'
import { addresses } from './ethereum_addresses'

const serverRunning = true

export const validateBalance = (resp: any) =>
    /0x[0-9A-Fa-f]{40}/.exec(resp.address) && (resp.balance >= 0)
    && (resp.user_name in addresses)

describe('server/common tests', () => {
    if (!serverRunning) {
        it("Dummy: everything's supposed to contain one test", () => undefined)
    }
    if (serverRunning) {
        /* XXX: Flaky tests, which depend on the server running. */
        it('Hits the balances endpoint sensibly', () =>
            expect(get('balances', {})
                .then(r => (r as any).every(validateBalance)))
                .resolves.toBeTruthy())
        it('Gets a single balance', () => {
            const aliceReq = { address: addresses.Alice.toString() }
            expect(post('balance', aliceReq).then(r =>
                validateBalance(r) || (r as any).error === 'Not_found'))
                .resolves.toBeTruthy()
        })
    }
})
