import { mount } from 'enzyme'
import * as React from 'react'
import { AddressField } from './address_field'

describe('AddressField tests', () => {
    let address: string = ''
    /* tslint:disable:jsx-no-lambda */
    const dialog = mount(<AddressField callback={(v) => { address = v; }} />)
    const input = dialog.find('input')
    it('Should start with an empty hex string', () => {
        expect(input.props().value).toEqual('0x')
    })
    const checkInput = (i: string, r: string) => () => {
        input.simulate('change', { target: { value: i } })
        expect(address).toEqual(r)
    }
    it('Should accept a hex key', checkInput('0xa', '0xa'))
    it('Should refuse a non-hex key', checkInput('0xz', '0xa'))
    it('Should refuse a hex key which is too long',
        checkInput('0x' + 'a'.repeat(65), '0xa'))
    it('Should accept a hex key which is just the right length',
        checkInput('0x' + 'a'.repeat(40), '0x' + 'a'.repeat(40)))
})
