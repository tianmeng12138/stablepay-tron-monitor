'use strict';

function createMemoryStore(maxEvents = 200) {
  const seen = new Set();
  let events = [];
  let lastError = null;
  let updatedAt = null;

  return {
    replace(nextEvents) {
      events = nextEvents.slice(0, maxEvents);
      updatedAt = new Date().toISOString();
    },
    markSeen(txid) {
      if (!txid || seen.has(txid)) return false;
      seen.add(txid);
      return true;
    },
    setError(error) {
      lastError = error ? error.message || String(error) : null;
    },
    snapshot() {
      return {
        events,
        lastError,
        updatedAt,
        seenCount: seen.size
      };
    }
  };
}

module.exports = { createMemoryStore };
