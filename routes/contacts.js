/**
 * Contacts Router
 *
 * Handles all contact-related endpoints for the KVCore API
 */

const express = require('express');
const router = express.Router();
const client = require('../kvcoreClient');

/**
 * GET /contacts
 * Get a list of contacts with optional filters
 *
 * Query Parameters:
 * - filter[email], filter[first_name], filter[last_name], filter[source]
 * - filter[leadtype] - one of: buyer, seller, renter, agent, vendor
 * - filter[status] - numeric status code (0-7)
 * - filter[registered_after], filter[registered_before] - timestamps
 * - limit - maximum number of results (default 100)
 * - includeArchived - 0 or 1
 */
router.get('/', async (req, res) => {
  try {
    const params = req.query;
    const response = await client.get('/contacts', { params });
    res.json(response.data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * GET /contacts/:contactId
 * Get details of a specific contact
 */
router.get('/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const { data } = await client.get(`/contact/${contactId}`);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * POST /contacts
 * Create a new contact
 *
 * Body fields (many are optional):
 * - first_name, last_name, email (required)
 * - cell_phone_1
 * - deal_type - comma-separated: "buyer", "seller", "renter"
 * - status - numeric status code
 * - email_optin, phone_on, text_on - 1 or 0
 * - capture_method
 * - assigned_agent_id, assigned_agent_external_id
 * - tcpa_optin_date - ISO 8601 date-time
 * - is_private - 1 or 0
 * - entity_owner_id
 * - And many more optional fields...
 */
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    const { data } = await client.post('/contact', payload);
    res.status(201).json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * PUT /contacts/:contactId
 * Update an existing contact
 *
 * Body fields mirror those used for creation
 */
router.put('/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const payload = req.body;
    const { data } = await client.put(`/contact/${contactId}`, payload);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * DELETE /contacts/:contactId
 * Delete (soft delete) a contact
 */
router.delete('/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    await client.delete(`/contact/${contactId}/`);
    res.status(204).send();
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * GET /contacts/:contactId/tags
 * Get all tags for a contact
 */
router.get('/:contactId/tags', async (req, res) => {
  try {
    const { contactId } = req.params;
    const { data } = await client.get(`/contact/${contactId}/tags`);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * PUT /contacts/:contactId/tags
 * Add tags to a contact
 *
 * Body: Array of tag objects
 * [{ "name": "#myTag", "locked": false }]
 */
router.put('/:contactId/tags', async (req, res) => {
  try {
    const { contactId } = req.params;
    const tags = req.body;
    const { data } = await client.put(`/contact/${contactId}/tags`, tags);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * DELETE /contacts/:contactId/tags
 * Remove tags from a contact
 *
 * Body: Array of tag names to remove
 */
router.delete('/:contactId/tags', async (req, res) => {
  try {
    const { contactId } = req.params;
    const tags = req.body;
    const { data } = await client.delete(`/contact/${contactId}/tags`, { data: tags });
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * GET /contacts/:contactId/listingviews
 * Get listing views for a contact
 */
router.get('/:contactId/listingviews', async (req, res) => {
  try {
    const { contactId } = req.params;
    const { data } = await client.get(`/contact/${contactId}/listingviews`);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * GET /contacts/:contactId/marketreport
 * Get market reports for a contact
 */
router.get('/:contactId/marketreport', async (req, res) => {
  try {
    const { contactId } = req.params;
    const { data } = await client.get(`/contact/${contactId}/marketreport`);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * PUT /contacts/:contactId/email
 * Send an email to a contact
 *
 * Body:
 * - subject (required)
 * - message
 */
router.put('/:contactId/email', async (req, res) => {
  try {
    const { contactId } = req.params;
    const payload = req.body;
    const { data } = await client.put(`/contact/${contactId}/email`, payload);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * PUT /contacts/:contactId/text
 * Send a text message to a contact
 *
 * Body:
 * - message (required)
 */
router.put('/:contactId/text', async (req, res) => {
  try {
    const { contactId } = req.params;
    const payload = req.body;
    const { data } = await client.put(`/contact/${contactId}/text`, payload);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * POST /contacts/:contactId/question
 * Submit a question about a property on behalf of a contact
 *
 * Body:
 * - website_id (integer)
 * - mls_id (string, MLS ID of the property)
 * - question (string, required)
 */
router.post('/:contactId/question', async (req, res) => {
  try {
    const { contactId } = req.params;
    const payload = req.body;
    const { data } = await client.post(`/contact/${contactId}/question`, payload);
    res.status(201).json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * POST /contacts/:contactId/appointment
 * Request a property showing
 *
 * Body:
 * - mls_id (string, required)
 * - question (string, required)
 * - date (ISO date-time)
 */
router.post('/:contactId/appointment', async (req, res) => {
  try {
    const { contactId } = req.params;
    const payload = req.body;
    const { data } = await client.post(`/contact/${contactId}/appointment`, payload);
    res.status(201).json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

module.exports = router;
