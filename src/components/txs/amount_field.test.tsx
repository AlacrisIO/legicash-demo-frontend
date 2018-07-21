import { shallow } from 'enzyme';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { AmountField } from './amount_field'

const noOp = (x: number): void => { /* Does nothing */ }
const changeEvent = (value: string) => ({ target: { value } })

describe('AmountField tests', () => {
    it('Accepts a sensible input, and renders', () => {
        const div = document.createElement('div');
        ReactDOM.render(<AmountField callback={noOp} />, div);
    })
    it('Has an initial value of 0.', () => {
        const field = shallow(<AmountField callback={noOp} />)
        expect(field.find('input').props().value).toEqual('0')
    })
    it('Accepts a numeric input', () => {
        const field = shallow(<AmountField callback={noOp} />)
        field.find('input').simulate('change', changeEvent('3.5'))
        // Note, we need to grab the input field again, here, because the output
        // of `field.find('input')` is not changed by the `.simulate` call.
        expect(field.find('input').props().value).toEqual('3.5')
    })
    it('Rejects a non-numeric input', () => {
        const field = shallow(<AmountField callback={noOp} />)
        field.find('input').simulate('change', changeEvent('3.5'))
        field.find('input').simulate('change', changeEvent('hello'))
        expect(field.find('input').props().value).toEqual('3.5')
    })
    it('Rejects input with a single trailing non-numeric input', () => {
        // This is a regression test. This failed before, because the backslash
        // in numberRe was unquoted.
        const field = shallow(<AmountField callback={noOp} />)
        field.find('input').simulate('change', changeEvent('3.5'))
        field.find('input').simulate('change', changeEvent('3.5a'))
        expect(field.find('input').props().value).toEqual('3.5')
    })
    it("Does what it's supposed to with its callback", () => {
        let value = -1
        /* tslint:disable:jsx-no-lambda */
        const field = shallow(<AmountField callback={v => { value = v }} />)
        field.find('input').simulate('change', changeEvent('3.5'))
        expect(value).toEqual(3.5)
    })
})
