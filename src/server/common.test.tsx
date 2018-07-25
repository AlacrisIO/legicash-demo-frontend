import { get, post } from './common'
import { addresses } from './ethereum_addresses'

const serverRunning = false

describe('server/common tests', () => {
    it("Dummy: everything's supposed to contain one test", () => undefined)
    if (serverRunning) {
        /* XXX: Flaky tests, which depend on the server running. */
        it('Hits the balances endpoint sensibly', () =>
            expect(get('balances', {}).then(r => { throw JSON.stringify(r) })).resolves.toBe(200))
        it('Gets a single balance', () =>
            expect(post('balance',
                { address: addresses.Alice.toString() }).then(
                    r => { throw JSON.stringify(r) } /* r.status */)).resolves.toBe(200))
    }
})
