/**
 * KVCore API Constants and Enumerations
 *
 * This module contains all the constant values and enumerations used
 * throughout the KVCore Public API v2 integration.
 */

/**
 * Lead/Contact Status Codes
 * Used when creating or updating a contact
 */
const LEAD_STATUS = {
  0: 'New',
  1: 'Client',
  2: 'Closed',
  3: 'Sphere',
  4: 'Active',
  5: 'Contract',
  6: 'Archived',
  7: 'Prospect'
};

/**
 * Contact Status Filter Values
 * Used in the contacts list filter[status]
 */
const CONTACT_STATUS_FILTER = {
  0: 'New',
  1: 'Client',
  2: 'Closed',
  3: 'Sphere',
  4: 'Active',
  5: 'Contract',
  7: 'Prospect'
};

/**
 * Call Result Codes
 * Possible results for logged calls
 */
const CALL_RESULT = {
  1: 'Bad Number',
  2: 'Not Home',
  3: 'Contacted'
};

/**
 * Call Direction Options
 * Valid directions for logging calls; defaults to 'outbound'
 */
const CALL_DIRECTION = ['outbound', 'inbound'];

/**
 * Deal Types
 * Comma-separated string describing deal types
 * May be combined (e.g., 'buyer,seller')
 */
const DEAL_TYPES = ['buyer', 'seller', 'renter'];

/**
 * Lead Type Filter Values
 * Used in the contacts list filter[leadtype]
 */
const LEADTYPE_FILTER = ['buyer', 'seller', 'renter', 'agent', 'vendor'];

/**
 * Search Alert Numbers
 * Must be 1 or 2 when adding or updating search alerts
 */
const SEARCH_ALERT_NUMBER = [1, 2];

/**
 * Communication Opt-In Values
 * 1 = enabled, 0 = disabled
 */
const OPT_IN_VALUES = {
  ENABLED: 1,
  DISABLED: 0
};

/**
 * Boolean Integer Values
 * Used for various boolean fields that expect integers
 */
const BOOLEAN_INT = {
  TRUE: 1,
  FALSE: 0
};

/**
 * Helper function to get lead status name by code
 * @param {number} code - The status code
 * @returns {string|undefined} The status name or undefined if not found
 */
function getLeadStatusName(code) {
  return LEAD_STATUS[code];
}

/**
 * Helper function to get lead status code by name
 * @param {string} name - The status name
 * @returns {number|undefined} The status code or undefined if not found
 */
function getLeadStatusCode(name) {
  return Object.keys(LEAD_STATUS).find(key => LEAD_STATUS[key] === name);
}

/**
 * Helper function to validate call result code
 * @param {number} code - The call result code
 * @returns {boolean} True if valid, false otherwise
 */
function isValidCallResult(code) {
  return code in CALL_RESULT;
}

/**
 * Helper function to validate call direction
 * @param {string} direction - The call direction
 * @returns {boolean} True if valid, false otherwise
 */
function isValidCallDirection(direction) {
  return CALL_DIRECTION.includes(direction);
}

/**
 * Helper function to validate search alert number
 * @param {number} number - The search alert number
 * @returns {boolean} True if valid, false otherwise
 */
function isValidSearchAlertNumber(number) {
  return SEARCH_ALERT_NUMBER.includes(number);
}

module.exports = {
  LEAD_STATUS,
  CONTACT_STATUS_FILTER,
  CALL_RESULT,
  CALL_DIRECTION,
  DEAL_TYPES,
  LEADTYPE_FILTER,
  SEARCH_ALERT_NUMBER,
  OPT_IN_VALUES,
  BOOLEAN_INT,
  getLeadStatusName,
  getLeadStatusCode,
  isValidCallResult,
  isValidCallDirection,
  isValidSearchAlertNumber
};
