/**
 * Miscellaneous API
 *
 * Handles additional endpoints that don't fit into specific categories
 */

class MiscAPI {
  constructor(httpClient) {
    this.http = httpClient;
  }

  /**
   * Schedule a call with a reminder
   * @param {Object} callData - {leadId, note, reminderDate, reminderTime, repeatTimeframe, repeatTimes, repeatCalls}
   * @returns {Promise<Object>} Result
   */
  async scheduleCall(callData) {
    if (!callData.leadId) {
      throw new Error('leadId is required');
    }

    const { data } = await this.http.post('/schedule-call', callData);
    return data;
  }

  /**
   * Add a listing view for a contact
   * @param {Object} viewData - {lead_id, mls_id, mobile, comments, save}
   * @returns {Promise<Object>} Result
   */
  async addListingView(viewData) {
    if (!viewData.lead_id) {
      throw new Error('lead_id is required');
    }
    if (!viewData.mls_id) {
      throw new Error('mls_id is required');
    }

    const { data } = await this.http.post('/views', viewData);
    return data;
  }
}

module.exports = MiscAPI;
