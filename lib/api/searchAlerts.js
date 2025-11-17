/**
 * Search Alerts API
 *
 * Handles search alert operations for contacts
 */

const { isValidSearchAlertNumber } = require('../../constants');

class SearchAlertsAPI {
  constructor(httpClient) {
    this.http = httpClient;
  }

  /**
   * Get all search alerts for a contact
   * @param {string|number} contactId - Contact ID
   * @returns {Promise<Array>} List of search alerts
   */
  async list(contactId) {
    const { data } = await this.http.get(`/contact/${contactId}/searchalert`);
    return data;
  }

  /**
   * Create a new search alert for a contact
   * @param {string|number} contactId - Contact ID
   * @param {Object} alertData - {number, active, areas, types, beds, baths, min_price, max_price, etc.}
   * @returns {Promise<Object>} Created search alert
   */
  async create(contactId, alertData) {
    if (!alertData.number || !isValidSearchAlertNumber(alertData.number)) {
      throw new Error('Invalid alert number. Must be 1 or 2');
    }

    const { data } = await this.http.post(`/contact/${contactId}/searchalert`, alertData);
    return data;
  }

  /**
   * Update an existing search alert
   * @param {string|number} contactId - Contact ID
   * @param {number} alertNumber - Alert number (1 or 2)
   * @param {Object} alertData - Alert data to update
   * @returns {Promise<Object>} Updated search alert
   */
  async update(contactId, alertNumber, alertData) {
    if (!isValidSearchAlertNumber(alertNumber)) {
      throw new Error('Invalid alert number. Must be 1 or 2');
    }

    const { data } = await this.http.put(`/contact/${contactId}/searchalert/${alertNumber}`, alertData);
    return data;
  }

  /**
   * Delete a search alert
   * @param {string|number} contactId - Contact ID
   * @param {number} alertNumber - Alert number (1 or 2)
   * @returns {Promise<void>}
   */
  async delete(contactId, alertNumber) {
    if (!isValidSearchAlertNumber(alertNumber)) {
      throw new Error('Invalid alert number. Must be 1 or 2');
    }

    await this.http.delete(`/contact/${contactId}/searchalert/${alertNumber}`);
  }

  /**
   * Send alert results to the contact immediately
   * @param {string|number} contactId - Contact ID
   * @param {number} alertNumber - Alert number (1 or 2)
   * @returns {Promise<Object>} Result
   */
  async send(contactId, alertNumber) {
    if (!isValidSearchAlertNumber(alertNumber)) {
      throw new Error('Invalid alert number. Must be 1 or 2');
    }

    const { data } = await this.http.post(`/contact/${contactId}/searchalert/${alertNumber}/send`);
    return data;
  }

  /**
   * Get recent search alert results
   * @param {string|number} contactId - Contact ID
   * @param {number} alertNumber - Alert number (1 or 2)
   * @returns {Promise<Array>} Recent listings
   */
  async getRecent(contactId, alertNumber) {
    if (!isValidSearchAlertNumber(alertNumber)) {
      throw new Error('Invalid alert number. Must be 1 or 2');
    }

    const { data } = await this.http.get(`/contact/${contactId}/searchalert/${alertNumber}/recent`);
    return data;
  }
}

module.exports = SearchAlertsAPI;
