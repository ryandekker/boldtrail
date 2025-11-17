/**
 * Contacts API
 *
 * Handles all contact-related operations
 */

class ContactsAPI {
  constructor(httpClient) {
    this.http = httpClient;
  }

  /**
   * Get a list of contacts with optional filters
   * @param {Object} filters - Query parameters for filtering
   * @returns {Promise<Object>} List of contacts
   */
  async list(filters = {}) {
    const { data } = await this.http.get('/contacts', { params: filters });
    return data;
  }

  /**
   * Get a specific contact by ID
   * @param {string|number} contactId - Contact ID
   * @returns {Promise<Object>} Contact details
   */
  async get(contactId) {
    const { data } = await this.http.get(`/contact/${contactId}`);
    return data;
  }

  /**
   * Create a new contact
   * @param {Object} contactData - Contact information
   * @returns {Promise<Object>} Created contact
   */
  async create(contactData) {
    const { data } = await this.http.post('/contact', contactData);
    return data;
  }

  /**
   * Update an existing contact
   * @param {string|number} contactId - Contact ID
   * @param {Object} contactData - Updated contact information
   * @returns {Promise<Object>} Updated contact
   */
  async update(contactId, contactData) {
    const { data } = await this.http.put(`/contact/${contactId}`, contactData);
    return data;
  }

  /**
   * Delete a contact (soft delete)
   * @param {string|number} contactId - Contact ID
   * @returns {Promise<void>}
   */
  async delete(contactId) {
    await this.http.delete(`/contact/${contactId}/`);
  }

  /**
   * Get all tags for a contact
   * @param {string|number} contactId - Contact ID
   * @returns {Promise<Array>} List of tags
   */
  async getTags(contactId) {
    const { data } = await this.http.get(`/contact/${contactId}/tags`);
    return data;
  }

  /**
   * Add tags to a contact
   * @param {string|number} contactId - Contact ID
   * @param {Array} tags - Array of tag objects [{name: "#tag", locked: false}]
   * @returns {Promise<Object>} Result
   */
  async addTags(contactId, tags) {
    const { data } = await this.http.put(`/contact/${contactId}/tags`, tags);
    return data;
  }

  /**
   * Remove tags from a contact
   * @param {string|number} contactId - Contact ID
   * @param {Array} tagNames - Array of tag names to remove
   * @returns {Promise<Object>} Result
   */
  async removeTags(contactId, tagNames) {
    const { data } = await this.http.delete(`/contact/${contactId}/tags`, { data: tagNames });
    return data;
  }

  /**
   * Get listing views for a contact
   * @param {string|number} contactId - Contact ID
   * @returns {Promise<Array>} List of listing views
   */
  async getListingViews(contactId) {
    const { data } = await this.http.get(`/contact/${contactId}/listingviews`);
    return data;
  }

  /**
   * Get market reports for a contact
   * @param {string|number} contactId - Contact ID
   * @returns {Promise<Array>} List of market reports
   */
  async getMarketReports(contactId) {
    const { data } = await this.http.get(`/contact/${contactId}/marketreport`);
    return data;
  }

  /**
   * Send an email to a contact
   * @param {string|number} contactId - Contact ID
   * @param {Object} emailData - Email data {subject, message}
   * @returns {Promise<Object>} Result
   */
  async sendEmail(contactId, emailData) {
    const { data } = await this.http.put(`/contact/${contactId}/email`, emailData);
    return data;
  }

  /**
   * Send a text message to a contact
   * @param {string|number} contactId - Contact ID
   * @param {Object} textData - Text data {message}
   * @returns {Promise<Object>} Result
   */
  async sendText(contactId, textData) {
    const { data } = await this.http.put(`/contact/${contactId}/text`, textData);
    return data;
  }

  /**
   * Submit a question about a property on behalf of a contact
   * @param {string|number} contactId - Contact ID
   * @param {Object} questionData - {website_id, mls_id, question}
   * @returns {Promise<Object>} Result
   */
  async askQuestion(contactId, questionData) {
    const { data } = await this.http.post(`/contact/${contactId}/question`, questionData);
    return data;
  }

  /**
   * Request a property showing
   * @param {string|number} contactId - Contact ID
   * @param {Object} appointmentData - {mls_id, question, date}
   * @returns {Promise<Object>} Result
   */
  async requestAppointment(contactId, appointmentData) {
    const { data } = await this.http.post(`/contact/${contactId}/appointment`, appointmentData);
    return data;
  }
}

module.exports = ContactsAPI;
