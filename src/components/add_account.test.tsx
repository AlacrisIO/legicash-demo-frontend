import { mount } from 'enzyme'
import { List } from 'immutable'
import * as React from 'react';

import { addresses } from '../server/ethereum_addresses'
import { Address } from '../types/address'
import { DumbAddAccount, IAddAccountState } from './add_account'
import { knownAddresses, name } from './select_account'

describe('Tests for add account dialog', () => {
    let v: Address | undefined
    const add = (e: Address) => { v = e }
    const sortedAddresses = List(knownAddresses.sortBy(name))
    const m = mount(
        <DumbAddAccount displayedAddresses={sortedAddresses} add={add} />)

    xit('Renders without crashing', () => {
        const defaultOption = m.find('.accountDefaultOption')
        expect(defaultOption.length).toBe(1)
        expect(m.find('.addOpt').length).toBe(Object.keys(addresses).length + 1)
    })

    const form = m.find('form')
    it('Refuses to submit, when nothing is chosen' /* Ooh la la. */, () => {
        form.simulate('submit')
        expect(v).toBe(undefined)
    })

    function getAddress(idx: number): Address {
        return new Address(sortedAddresses.get(idx))
    }

    function hitSelection(idx: number): number {
        const option = m.find(`option [value="${getAddress(idx)}"]`)
        option.simulate('change', { target: { selectedIndex: idx + 1 } })
        form.simulate('submit')
        return (m.state() as IAddAccountState).optIdx
    }

    xit('Submits when something is chosen', () => {
        const address = getAddress(8)
        expect(getAddress(hitSelection(8) - 1)).toEqual(address)
        expect(address.equals(v as Address)).toBe(true)
    })

    xit('Moves to the next entry up, when there is one, if at bottom', () => {
        const finalIndex = sortedAddresses.size - 1
        expect(hitSelection(finalIndex)).toBe(finalIndex)
    })
})
