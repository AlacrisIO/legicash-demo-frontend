import { shallow }     from  'enzyme'
import * as React      from  'react'
import * as ReactDOM   from  'react-dom'
import { Money }       from  '../../types/units'
import { AmountField } from  './amount_field'

const noOp = (x: Money): void => { /* Does nothing */ }

const changeEvent = (value: string) =>
    ({ preventDefault: noOp, target: { value }})

describe('AmountField tests', () => {
    it('Renders', () => {
        const div = document.createElement('div');
        ReactDOM.render(<AmountField callback={noOp} />, div);
    });

    it('Has an initial value to be empty', () => {
        const field = shallow(<AmountField callback={noOp} />)
        expect(field.find('Input').props().value).toEqual('')
    });

    it('Rejects a non-numeric input', () => {
        const field = shallow(<AmountField callback={noOp} />)
        field.find('Input').simulate('change', changeEvent('hello'))
        expect(field.find('Input').props().value).toEqual('')
    });

    it('Rejects input with a single trailing non-numeric input', () => {
        const field = shallow(<AmountField callback={noOp} />)
        field.find('Input').simulate('change', changeEvent('3.5a'))
        expect(field.find('Input').props().value).toEqual('3.5')
    });

    it('Does what it\'s supposed to with its callback', (done) => {
        const cb = (v: any)  => {
            expect(v.toEth()).toEqual('3.5');
            done();
        };

        const field = shallow(<AmountField callback={cb} />);
        field.find('Input').simulate('change', changeEvent('3.5'));
    })
});
