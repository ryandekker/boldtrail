/**
 * Calls API
 *
 * Handles call log operations for contacts
 */

const { isValidCallResult, isValidCallDirection } = require('../../constants');

class CallsAPI {
  constructor(httpClient) {
    this.http = httpClient;
  }

  /**
   * Get all call logs for a contact
   * @param {string|number} contactId - Contact ID
   * @returns {Promise<Array>} List of call logs
   */
  async list(contactId) {
    const { data } = await this.http.get(`/contact/${contactId}/action/call`);
    return data;
  }

  /**
   * Get a specific call log
   * @param {string|number} contactId - Contact ID
   * @param {string|number} actionId - Call/action ID
   * @returns {Promise<Object>} Call log details
   */
  async get(contactId, actionId) {
    const { data } = await this.http.get(`/contact/${contactId}/action/call/${actionId}`);
    return data;
  }

  /**
   * Log a new call for a contact
   * @param {string|number} contactId - Contact ID
   * @param {Object} callData - {date, direction, result, recording_url, action_owner_user_id, notes}
   * @returns {Promise<Object>} Created call log
   */
  async create(contactId, callData) {
    // Validate call data
    if (callData.result && !isValidCallResult(callData.result)) {
      throw new Error('Invalid call result code. Must be 1 (Bad Number), 2 (Not Home), or 3 (Contacted)');
    }
    if (callData.direction && !isValidCallDirection(callData.direction)) {
      throw new Error('Invalid call direction. Must be "outbound" or "inbound"');
    }

    const { data } = await this.http.put(`/contact/${contactId}/action/call`, callData);
    return data;
  }

  /**
   * Update an existing call log
   * @param {string|number} contactId - Contact ID
   * @param {string|number} actionId - Call/action ID
   * @param {Object} callData - {date, direction, result, recording_url, action_owner_user_id, notes}
   * @returns {Promise<Object>} Updated call log
   */
  async update(contactId, actionId, callData) {
    // Validate call data
    if (callData.result && !isValidCallResult(callData.result)) {
      throw new Error('Invalid call result code. Must be 1 (Bad Number), 2 (Not Home), or 3 (Contacted)');
    }
    if (callData.direction && !isValidCallDirection(callData.direction)) {
      throw new Error('Invalid call direction. Must be "outbound" or "inbound"');
    }

    const { data } = await this.http.put(`/contact/${contactId}/action/call/${actionId}`, callData);
    return data;
  }
}

module.exports = CallsAPI;
