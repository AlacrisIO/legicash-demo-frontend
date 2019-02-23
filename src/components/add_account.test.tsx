import {mount, ReactWrapper} from 'enzyme'
import {List} from 'immutable'
import * as React from 'react';

import {addresses} from '../server/ethereum_addresses'
import {Address} from '../types/address'
import {DumbAddAccount} from './add_account'
import {knownAddresses, name} from './select_account'

const findUser = (m: ReactWrapper, n: string) => m.find('div.item').filterWhere((c: any): boolean => {
    return c.find('span.text') && c.find('span.text').html() === `<span class="text">${n}</span>`;
});

const findAddressByName = (n: string) => addresses[n];


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
        findUser(vm, userName).simulate('click');
        vm.find('form').simulate('submit');
    });
});
