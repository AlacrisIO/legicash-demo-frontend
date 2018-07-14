import { List } from 'immutable'
import { Transaction } from './tx'
import { Address } from './address'
import { Wallet } from './wallet'

var alice_address = new Address('0xa11cea11cea11cea11cea11cea11cea11cea11ce');
var trent_address = new Address('0x7472656e747472656e747472656e747472656e74');
var bob_address = new Address('0xb0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0b0');
var alice_to_trent = new Transaction({
    chain: 'main', from: alice_address, to: trent_address, amount: 19
})
var alice_to_bob = new Transaction({
    chain: 'side', from: alice_address, to: bob_address, amount: 1
})

it('Should accept and store a sensible wallet', () => {
    var wallet = new Wallet({
        username: 'alice', address: alice_address,
        onchain_balance: 1, offchain_balance: 20,
        txs: List([alice_to_trent, alice_to_bob])
    }); wallet /* Shut linter up */
})

it('Should reject negative balances', () => {
    expect(() => new Wallet({
        username: 'alice', address: alice_address,
        onchain_balance: -1, offchain_balance: 20,
        txs: List([alice_to_trent, alice_to_bob])
    })).toThrow()
    expect(() => new Wallet({
        username: 'alice', address: alice_address,
        onchain_balance: 1, offchain_balance: -20,
        txs: List([alice_to_trent, alice_to_bob])
    })).toThrow()
})
