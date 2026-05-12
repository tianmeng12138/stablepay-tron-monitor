'use strict';

function loadDemoTransfers(address) {
  const now = Date.now();
  return [
    {
      transaction_id: 'demo-tx-002',
      from: 'TClientDemo22222222222222222222222222',
      to: address,
      value: '499500000',
      block_timestamp: now - 90000,
      token_info: { address: 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj', symbol: 'USDT', decimals: 6 }
    },
    {
      transaction_id: 'demo-tx-001',
      from: 'TClientDemo11111111111111111111111111',
      to: address,
      value: '125000000',
      block_timestamp: now - 3600000,
      token_info: { address: 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj', symbol: 'USDT', decimals: 6 }
    }
  ];
}

module.exports = { loadDemoTransfers };
