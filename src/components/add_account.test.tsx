import {mount} from 'enzyme'
import {List} from 'immutable'
import * as React from 'react';

import {addresses} from '../server/ethereum_addresses'
import {Address} from '../types/address'
import {findAddressByName, findUserSelectItem} from "../util/test_util";
import {DumbAddAccount} from './add_account'
import {knownAddresses, name} from './select_account'


describe('Tests for add account dialog', () => {
    let v: Address | undefined
    const add = (e: Address) => { v = e }
    const sortedAddresses = List(knownAddresses.sortBy(name))
    const m = mount(<DumbAddAccount displayedAddresses={sortedAddresses} add={add} />)

    it('Renders without crashing', () => {
        expect(m.find('div.item').length).toBe(Object.keys(addresses).length)
    });

    const form = m.find('form');
    it('Refuses to submit, when nothing is chosen' /* Ooh la la. */, () => {
        form.simulate('submit');
        expect(v).toBe(undefined);
    });

    it('Submits when something is chosen', (done) => {
        const userName = 'Bob';
        const userAddress = findAddressByName(userName);
        const onAdd = (a: Address) => {
            expect(a).toEqual(userAddress);
            done();
        };

        const vm = mount(<DumbAddAccount displayedAddresses={sortedAddresses} add={onAdd} />);
        findUserSelectItem(vm, userName).simulate('click');
        vm.find('form').simulate('submit');
    });
});
