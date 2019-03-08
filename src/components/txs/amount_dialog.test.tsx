import { mount } from 'enzyme';
import * as React from 'react';
import { AmountDialog } from './amount_dialog'

describe('AmountDialog tests', () => {
    it('Accepts a sensible input, renders it, and reports it to the call back',
        (done) => {

            const submitCb = (v: number) => {
                expect(v).toEqual(123);
                done();
            };

            const dialog = mount(
                /* Not shallow; need to access <input> */
                /* tslint:disable:jsx-no-lambda */
                <AmountDialog submitCallback={submitCb} />
            );


            const input = dialog.find('.amtField').find('Input').find('input');
            expect(input.props().type).toEqual("text");

            // Enter some text in the input field
            input.simulate('change', { target: { value: 123 } });
            dialog.find('form').simulate('submit');
        })
});
