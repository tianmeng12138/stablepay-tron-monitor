'use strict';

const USDT_TRC20_CONTRACT = 'TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj';

function normalizeAddress(address) {
  return String(address || '').trim();
}

function rawToDecimal(rawValue, decimals = 6) {
  const raw = BigInt(String(rawValue || '0'));
  const base = 10n ** BigInt(decimals);
  const whole = raw / base;
  const fraction = raw % base;
  const fracText = fraction.toString().padStart(decimals, '0').replace(/0+$/, '');
  return fracText ? `${whole}.${fracText}` : whole.toString();
}

function decimalToRaw(amount, decimals = 6) {
  const text = String(amount || '0').trim();
  if (!/^\d+(\.\d+)?$/.test(text)) throw new Error(`Invalid amount: ${amount}`);
  const [whole, frac = ''] = text.split('.');
  const padded = (frac + '0'.repeat(decimals)).slice(0, decimals);
  return (BigInt(whole) * (10n ** BigInt(decimals)) + BigInt(padded || '0')).toString();
}

function toPaymentEvent(tx, receivingAddress) {
  const to = normalizeAddress(tx.to || tx.to_address);
  const from = normalizeAddress(tx.from || tx.from_address);
  const contract = normalizeAddress(tx.token_info && tx.token_info.address);
  const decimals = Number((tx.token_info && tx.token_info.decimals) || 6);
  return {
    txid: tx.transaction_id || tx.txID || tx.hash,
    from,
    to,
    contract,
    symbol: (tx.token_info && tx.token_info.symbol) || 'USDT',
    amount: rawToDecimal(tx.value, decimals),
    rawAmount: String(tx.value || '0'),
    timestamp: tx.block_timestamp || tx.timestamp || null,
    confirmed: tx.confirmed !== false,
    matchesReceiver: to === normalizeAddress(receivingAddress),
    explorerUrl: tx.transaction_id ? `https://tronscan.org/#/transaction/${tx.transaction_id}` : null
  };
}

function filterIncomingUsdt(transfers, receivingAddress, minRawAmount = '0') {
  const receiver = normalizeAddress(receivingAddress);
  const min = BigInt(String(minRawAmount || '0'));
  return (transfers || [])
    .map((tx) => toPaymentEvent(tx, receiver))
    .filter((event) => event.to === receiver)
    .filter((event) => !event.contract || event.contract === USDT_TRC20_CONTRACT)
    .filter((event) => BigInt(event.rawAmount || '0') >= min)
    .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
}

module.exports = {
  USDT_TRC20_CONTRACT,
  normalizeAddress,
  rawToDecimal,
  decimalToRaw,
  toPaymentEvent,
  filterIncomingUsdt
};
