import { mount } from 'enzyme'
import * as React from 'react'
import { Address, emptyAddress } from '../../types/address'
import { PayDialog } from './pay_dialog'

const fromAddress = new Address("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

describe('PayDialog tests', () => {
    let amount: number = -1
    let to: Address = emptyAddress
    let numCalls: number = 0
    const dialog = mount(
        /* tslint:disable:jsx-no-lambda */
        <PayDialog from={fromAddress} submitCallback={(newAmount, newTo) => {
            amount = newAmount; to = newTo; numCalls += 1
        }} />)
    it("Has a title describing its purpose", () => {
        expect(dialog.find('h1').text()).toEqual(
            `Send payment from ${fromAddress.toString()}`)
    })
    const form = dialog.find('form')
    it("Refuses to accept bad data", () => {
        form.simulate('submit')
        expect(amount).toEqual(-1)
        expect(to).toEqual(emptyAddress)
        expect(numCalls).toEqual(0)
    })
    it("Accepts good data", () => {
        form.find('input.addField').simulate(
            'change', { target: { value: fromAddress.toString() } })
        form.find('input.amountField').simulate(
            'change', { target: { value: 1 } })
        form.simulate('submit')
        expect(amount).toEqual(1)
        expect(to).toEqual(fromAddress)
        expect(numCalls).toEqual(1)
    })
    it("Doesn't accept 0 for the amount", () => {
        form.find('input.amountField').simulate(
            'change', { target: { value: 0 } })
        form.simulate('submit')
        expect(numCalls).toEqual(1)  // Unchanged
    })
})

