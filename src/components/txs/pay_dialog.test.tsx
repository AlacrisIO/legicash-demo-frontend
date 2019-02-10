import { mount } from 'enzyme'
import * as React from 'react'
import { Address, emptyAddress } from '../../types/address'
import { knownAddresses, name } from '../select_account'
import { PayDialog } from './pay_dialog'

const addresses = knownAddresses.toList().sortBy(name)
const fromIdx = 9
const toIdx = 4  // NB, must be less than `fromIdx`
const fromAddress = addresses.get(fromIdx)
const toAddress = addresses.get(toIdx)

describe('PayDialog tests', () => {
    let amount: number = -1
    let to: Address = emptyAddress
    let numCalls: number = 0
    const dialog = mount(
        /* tslint:disable:jsx-no-lambda */
        <PayDialog from={fromAddress} loading={false} submitCallback={(newTo, newAmount) => {
            amount = newAmount; to = newTo; numCalls += 1
        }} />)

    xit("Has a title describing its purpose", () => {
        expect(dialog.find('h3').text()).toEqual(`Send payment`)
    })

    const form = dialog.find('form')
    it("Refuses to accept bad data", () => {
        form.simulate('submit')
        expect(amount).toEqual(-1)
        expect(to).toEqual(emptyAddress)
        expect(numCalls).toEqual(0)
    })

    it("Excludes the sender address from the recipient list", () => {
        expect(form.find(`option [value="${fromAddress}"]`).length).toBe(0)
    })

    xit("Accepts good data", () => {
        form.find(`option [value="${toAddress}"]`).simulate(
            'change', { target: { selectedIndex: toIdx + 1 } })
        form.find('input.amountField').simulate(
            'change', { target: { value: 1 } })
        form.simulate('submit')
        expect(amount).toEqual(1)
        expect(to).toEqual(toAddress)
        expect(numCalls).toEqual(1)
    })

    xit("Doesn't accept 0 for the amount", () => {
        form.find('input.amountField').simulate(
            'change', { target: { value: 0 } })
        form.simulate('submit')
        expect(numCalls).toEqual(1)  // Unchanged
    })
})

