import { get, post } from './common'
import { addresses } from './ethereum_addresses'

const serverRunning = true

describe('server/common tests', () => {
    if (!serverRunning) {
        it("Dummy: everything's supposed to contain one test", () => undefined)
    }
    if (serverRunning) {
        /* XXX: Flaky tests, which depend on the server running. */
        it('Hits the balances endpoint sensibly', () =>
            expect(get('balances', {})).resolves.toEqual([]))
        it('Gets a single balance', () =>
            expect(post('balance',
                { address: addresses.Alice.toString() }))
                .resolves.toEqual({ error: "Not_found" }))
    }
})
