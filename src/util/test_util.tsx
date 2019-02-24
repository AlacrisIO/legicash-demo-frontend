import {ReactWrapper} from "enzyme";
import {addresses} from "../server/ethereum_addresses";

export const findUserSelectItem = (m: ReactWrapper, n: string) => m.find('div.item').filterWhere((c: any): boolean => {
    return c.find('span.text') && c.find('span.text').html() === `<span class="text">${n}</span>`;
});

export const findAddressByName = (n: string) => addresses[n];
