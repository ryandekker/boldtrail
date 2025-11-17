/**
 * KVCore API Client Library
 *
 * A lightweight Node.js client for the KVCore Public API v2
 */

const KVCoreClient = require('./lib/client');
const constants = require('./constants');

module.exports = KVCoreClient;
module.exports.KVCoreClient = KVCoreClient;
module.exports.constants = constants;
