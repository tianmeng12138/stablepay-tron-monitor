'use strict';

const assert = require('assert');
const { decimalToRaw, rawToDecimal, filterIncomingUsdt, USDT_TRC20_CONTRACT } = require('../src/filter');

assert.strictEqual(decimalToRaw('1'), '1000000');
assert.strictEqual(decimalToRaw('1.25'), '1250000');
assert.strictEqual(rawToDecimal('1250000'), '1.25');

const receiver = 'TReceiver11111111111111111111111111111';
const transfers = [
  { transaction_id: 'a', from: 'x', to: receiver, value: '2000000', block_timestamp: 2, token_info: { address: USDT_TRC20_CONTRACT, symbol: 'USDT', decimals: 6 } },
  { transaction_id: 'b', from: 'x', to: 'TOther', value: '3000000', block_timestamp: 3, token_info: { address: USDT_TRC20_CONTRACT, symbol: 'USDT', decimals: 6 } },
  { transaction_id: 'c', from: 'x', to: receiver, value: '500000', block_timestamp: 1, token_info: { address: USDT_TRC20_CONTRACT, symbol: 'USDT', decimals: 6 } }
];

const events = filterIncomingUsdt(transfers, receiver, decimalToRaw('1'));
assert.strictEqual(events.length, 1);
assert.strictEqual(events[0].txid, 'a');
assert.strictEqual(events[0].amount, '2');

console.log('filter tests passed');
