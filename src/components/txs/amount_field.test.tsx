import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { shallow } from 'enzyme';
import { AmountField } from './amount_field'

describe('AmountField tests', () => {
    it('Accepts a sensible input, and renders', () => {
        const div = document.createElement('div');
        ReactDOM.render(<AmountField />, div);
    })

    it('Has an initial value of 0.', () => {
        const field = shallow(<AmountField />)
        expect(field.find('input').props().value).toEqual('0')
    })

    it('Accepts a numeric input', () => {
        const field = shallow(<AmountField />)
        field.find('input').simulate('change', { target: { value: '3.5' } })
        // Note, we need to grab the input field again, here, because the output
        // of `field.find('input')` is not changed by the `.simulate` call.
        expect(field.find('input').props().value).toEqual('3.5')
    })

    it('Rejects a non-numeric input', () => {
        const field = shallow(<AmountField />)
        field.find('input').simulate('change', { target: { value: '3.5' } })
        field.find('input').simulate('change', { target: { value: 'hello' } })
        expect(field.find('input').props().value).toEqual('3.5')
    })
})
