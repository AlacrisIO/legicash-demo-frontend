import * as React from 'react'
import { mount } from 'enzyme'
import { AddressField } from './address_field'

describe('AddressField tests', () => {
    var address: string = ''
    const dialog = mount(<AddressField callback={(v) => { address = v; }} />)
    const input = dialog.find('input')
    it('Should start with an empty hex string', () => {
        expect(input.props().value).toEqual('0x')
    })
    const check_input = (i: string, r: string) => () => {
        input.simulate('change', { target: { value: i } })
        expect(address).toEqual(r)
    }
    it('Should accept a hex key', check_input('0xa', '0xa'))
    it('Should refuse a non-hex key', check_input('0xz', '0xa'))
    it('Should refuse a hex key which is too long',
        check_input('0x' + 'a'.repeat(65), '0xa'))
    it('Should accept a hex key which is just the right length',
        check_input('0x' + 'a'.repeat(40), '0x' + 'a'.repeat(40)))
})
