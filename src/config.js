'use strict';

const { decimalToRaw } = require('./filter');

function envValue(source, name, fallback = '') {
  return source[name] === undefined || source[name] === '' ? fallback : source[name];
}

function toNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function loadConfig(argv = process.argv, env = process.env) {
  const demo = argv.includes('--demo') || envValue(env, 'DEMO_MODE', '') === '1';
  const address = envValue(env, 'TRON_ADDRESS', demo ? 'TDemoReceiver1111111111111111111111111' : '');
  if (!address) {
    throw new Error('Set TRON_ADDRESS first. See .env.example.');
  }

  return {
    demo,
    address,
    port: toNumber(envValue(env, 'PORT', '8787'), 8787),
    pollMs: Math.max(10, toNumber(envValue(env, 'POLL_SECONDS', '30'), 30)) * 1000,
    apiKey: envValue(env, 'TRONGRID_API_KEY', ''),
    webhookUrl: envValue(env, 'WEBHOOK_URL', ''),
    minRaw: decimalToRaw(envValue(env, 'MIN_AMOUNT', '0')),
    fetchLimit: Math.min(200, Math.max(1, toNumber(envValue(env, 'FETCH_LIMIT', '50'), 50)))
  };
}

module.exports = { loadConfig };
