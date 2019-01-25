import { mount } from 'enzyme';
import * as React from 'react';
import { AmountDialog } from './amount_dialog'

describe('AmountDialog tests', () => {
    xit('Accepts a sensible input, renders it, and reports it to the call back',
        () => {
            let amount: number = -1
            const dialog = mount( /* Not shallow; need to access <input> */
                /* tslint:disable:jsx-no-lambda */
                <AmountDialog header={<span>"foo"</span>}
                    submitCallback={(v: number) => { amount = v }} />)
            expect(dialog.find('span').text()).toEqual('"foo"')
            const input = dialog.find('.amtField').find('.amountField')
            expect(input.props().type).toEqual("text")
            // Enter some text in the input field
            input.simulate('change', { target: { value: '3.5' } })
            expect(amount).toEqual(-1)  // Should not change until "submit"
            dialog.find('form').simulate('submit')
            expect(amount).toEqual(3.5)
        })
})
