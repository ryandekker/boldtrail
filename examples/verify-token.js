#!/usr/bin/env node

/**
 * KVCore Client - Token Verification Example
 *
 * Verifies that the configured bearer token has valid API access
 * by making a lightweight read-only request.
 *
 * Usage:
 *   node examples/verify-token.js [options]
 *
 * Options:
 *   --debug    Enable debug logging
 *   --help     Show this help message
 *
 * Examples:
 *   node examples/verify-token.js
 *   node examples/verify-token.js --debug
 */

require('dotenv').config();
const KVCoreClient = require('../index');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.substring(2).split('=');
    options[key] = value || true;
  }
});

if (options.help) {
  console.log(`
KVCore Client - Token Verification

Verifies that the configured bearer token has valid API access.

Usage:
  node examples/verify-token.js [options]

Options:
  --debug    Enable debug logging
  --help     Show this help message
  `);
  process.exit(0);
}

async function main() {
  if (!process.env.KVCORE_BEARER_TOKEN) {
    console.error('KVCORE_BEARER_TOKEN is not set in .env');
    process.exit(1);
  }

  const client = new KVCoreClient({
    bearerToken: process.env.KVCORE_BEARER_TOKEN,
    baseURL: process.env.KVCORE_BASE_URL
  });

  if (options.debug) {
    client.enableDebug();
  }

  console.log('Verifying API access...\n');

  // Try the contacts list endpoint with a small limit
  try {
    const result = await client.contacts.list({ limit: 1 });
    console.log('[contacts.list]  OK');
    if (result && result.data) {
      console.log('  Returned', result.data.length, 'record(s).');
    }
  } catch (error) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      console.error('[contacts.list]  UNAUTHORIZED (%d)', error.statusCode);
      console.error('  Bearer token is invalid or expired.');
      process.exit(1);
    }
    console.warn('[contacts.list]  FAILED (%s) — %s', error.statusCode || '?', error.message);
  }

  // Try a raw GET to the base URL as a secondary check
  try {
    const { data } = await client.http.get('/');
    console.log('[base endpoint]  OK');
    if (data) {
      console.log('  Response keys:', Object.keys(data));
    }
  } catch (error) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      console.error('[base endpoint]  UNAUTHORIZED (%d)', error.statusCode);
      console.error('  Bearer token is invalid or expired.');
      process.exit(1);
    }
    console.warn('[base endpoint]  FAILED (%s) — %s', error.statusCode || '?', error.message);
  }

  console.log('\nVerification complete. If no UNAUTHORIZED errors appeared, the token is valid.');
}

main();
