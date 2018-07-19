import * as React from 'react'
import { mount } from 'enzyme'
import { Address, empty_address } from '../../types/address'
import { PayDialog } from './pay_dialog'

var from_address = new Address("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

describe('PayDialog tests', () => {
    var amount: number = -1
    var to: Address = empty_address
    var num_calls: number = 0
    const dialog = mount(
        <PayDialog from={from_address} submitCallback={(new_amount, new_to) => {
            amount = new_amount; to = new_to; num_calls += 1
        }} />)
    it("Has a title describing its purpose", () => {
        expect(dialog.find('h1').text()).toEqual(
            `Send payment from ${from_address.toString()}`)
    })
    const form = dialog.find('form')
    it("Refuses to accept bad data", () => {
        form.simulate('submit')
        expect(amount).toEqual(-1)
        expect(to).toEqual(empty_address)
        expect(num_calls).toEqual(0)
    })
    it("Accepts good data", () => {
        form.find('input.addField').simulate(
            'change', { target: { value: from_address.toString() } })
        form.find('input.amountField').simulate(
            'change', { target: { value: 1 } })
        form.simulate('submit')
        expect(amount).toEqual(1)
        expect(to).toEqual(from_address)
        expect(num_calls).toEqual(1)
    })
    it("Doesn't accept 0 for the amount", () => {
        form.find('input.amountField').simulate(
            'change', { target: { value: 0 } })
        form.simulate('submit')
        expect(num_calls).toEqual(1)  // Unchanged
    })
})

