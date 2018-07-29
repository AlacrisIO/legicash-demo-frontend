import { mount } from 'enzyme'
import { Set } from 'immutable'
import * as React from 'react';
import { addresses } from '../server/ethereum_addresses'
import { Address } from '../types/address'
import { AddAccount, knownAddresses } from './add_account'

describe('Tests for add account dialog', () => {
    let v: Address | undefined
    const m = mount( /* tslint:disable:jsx-no-lambda */
        <AddAccount presentAccounts={Set()} add={(e) => { v = e }} />)
    it('Renders without crashing', () => {
        const defaultOption = m.find('.accountDefaultOption')
        expect(defaultOption.length).toBe(1)
        expect(m.find('.addOpt').length).toBe(Object.keys(addresses).length + 1)
    })
    const form = m.find('form')
    it('Refuses to submit, when nothing is chosen' /* Ooh la la. */, () => {
        form.simulate('submit')
        expect(v).toBe(undefined)
    })
    it('Submits when something is chosen', () => {
        const change = { target: { value: knownAddresses.first().toString() } }
        m.find('select').simulate('change', change)
        form.simulate('submit')
        expect((v as Address).equals(knownAddresses.first())).toBe(true)
    })
})
