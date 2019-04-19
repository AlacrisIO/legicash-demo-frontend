import { mount }                                 from 'enzyme'
import * as React                                from 'react'
import { Address, emptyAddress }                 from '../../types/address'
import { Money }                                 from '../../types/units'
import { findAddressByName, findUserSelectItem } from '../../util/test_util'
import { PayDialog }                             from './pay_dialog'

const fromAddress = findAddressByName('Alice');

describe('PayDialog tests', () => {
    let amount: Money    = new Money('0');
    let to: Address      = emptyAddress;
    let numCalls: number = 0;

    const submitCb  = (newTo: Address, newAmount: Money) => {
        amount = newAmount;
        to = newTo;
        numCalls++;
    };

    const dialog = mount(<PayDialog from={fromAddress} loading={false} submitCallback={submitCb} />);

    const form = dialog.find('form');

    it("Refuses to accept bad data", () => {
        form.simulate('submit');
        expect(amount.toWei()).toEqual('0');
        expect(to).toEqual(emptyAddress);
        expect(numCalls).toEqual(0)
    });

    it("Excludes the sender address from the recipient list", () => {
        expect(form.find(`option [value="${fromAddress}"]`).length).toBe(0)
    });

    it("Accepts good data", () => {
        const userName = 'Bob';

        // Select Bob From Dropdown
        findUserSelectItem(
            form.find('SelectAccount'),
            userName
        ).simulate('click');

        // Enter 1 in the amount field
        form.find('AmountField')
            .find('Input.amountField')
            .find('input')
            .simulate('change', { target: { value: '1' } });

        // Submit the form
        form.simulate('submit');

        expect(amount.toEth()).toEqual('1');
        expect(to).toEqual(findAddressByName(userName));
        expect(numCalls).toEqual(1)
    });
});
