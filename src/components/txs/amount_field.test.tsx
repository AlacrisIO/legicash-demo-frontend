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
        expect(field.state.value == '0')
    })
})
