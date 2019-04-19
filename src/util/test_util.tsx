import { ReactWrapper } from  'enzyme'
import { get }          from  '../server/common'
import { addresses }    from  '../server/ethereum_addresses'

export const findUserSelectItem = (m: ReactWrapper, n: string) =>
    m.find('div.item')
     .filterWhere((c: any): boolean =>
           c.find('span.text')
        && c.find('span.text').html() === `<span class="text">${n}</span>`);

export const findAddressByName = (n: string) => addresses[n];

// NB 2019-01-22: our present CORS config prevents us using a more generic
// route such as GET /, so we're picking GET /api/balances out of the hat
// here instead - we just need to know whether the server is responding
let connected = false
beforeAll(() => get('balances', {})
    .then(r => connected = true ))

export const whenConnectedIt = (description: string, spec: () => Promise<any>) =>
    it(description, () => connected
        ? spec()
        : expect(connected).toBe(true));
