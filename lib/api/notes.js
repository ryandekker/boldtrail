/**
 * Notes API
 *
 * Handles note-related operations for contacts
 */

class NotesAPI {
  constructor(httpClient) {
    this.http = httpClient;
  }

  /**
   * Get all notes for a contact
   * @param {string|number} contactId - Contact ID
   * @returns {Promise<Array>} List of notes
   */
  async list(contactId) {
    const { data } = await this.http.get(`/contact/${contactId}/action/note`);
    return data;
  }

  /**
   * Get a specific note
   * @param {string|number} contactId - Contact ID
   * @param {string|number} actionId - Note/action ID
   * @returns {Promise<Object>} Note details
   */
  async get(contactId, actionId) {
    const { data } = await this.http.get(`/contact/${contactId}/action/note/${actionId}`);
    return data;
  }

  /**
   * Add a new note to a contact
   * @param {string|number} contactId - Contact ID
   * @param {Object} noteData - {date, title, details, action_owner_user_id}
   * @returns {Promise<Object>} Created note
   */
  async create(contactId, noteData) {
    const { data } = await this.http.put(`/contact/${contactId}/action/note`, noteData);
    return data;
  }

  /**
   * Update an existing note
   * @param {string|number} contactId - Contact ID
   * @param {string|number} actionId - Note/action ID
   * @param {Object} noteData - {date, title, details, action_owner_user_id}
   * @returns {Promise<Object>} Updated note
   */
  async update(contactId, actionId, noteData) {
    const { data } = await this.http.put(`/contact/${contactId}/action/note/${actionId}`, noteData);
    return data;
  }
}

module.exports = NotesAPI;
