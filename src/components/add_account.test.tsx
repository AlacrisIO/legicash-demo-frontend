import { mount } from 'enzyme'
import { List } from 'immutable'
import * as React from 'react';
import { addresses } from '../server/ethereum_addresses'
import { Address } from '../types/address'
import { DumbAddAccount, knownAddresses, name } from './add_account'

describe('Tests for add account dialog', () => {
    let v: Address | undefined
    const add = (e: Address) => { v = e }
    const sortedAddresses = List(knownAddresses.sortBy(name))
    const m = mount(
        <DumbAddAccount displayedAddresses={sortedAddresses} add={add} />)
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
    const initialIndex = sortedAddresses.size - 1  // Choose bottom entry
    const initialAddress = new Address(sortedAddresses.get(initialIndex))
    it('Submits when something is chosen', () => {
        // Following https://github.com/airbnb/enzyme/issues/389#issuecomment-401582776
        const option = m.find(`option [value="${initialAddress}"]`)
        const optionNode = option.getDOMNode() as any
        optionNode.selectedIndex = initialIndex + 1
        option.simulate('change', { target: optionNode })
        form.simulate('submit')
        expect((v as Address).equals(initialAddress)).toBe(true)
    })
    it('Moves to the next entry up, when there is one, if at bottom', () => {
        expect((m.state() as any).optIdx).toBe(sortedAddresses.size - 1)
    })
})
