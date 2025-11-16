/**
 * Search Alerts Router
 *
 * Handles search alert endpoints for contacts in the KVCore API
 * This router is mounted at /contacts/:contactId/searchalerts
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const client = require('../kvcoreClient');
const { isValidSearchAlertNumber } = require('../constants');

/**
 * GET /contacts/:contactId/searchalerts
 * Get all search alerts for a contact
 */
router.get('/', async (req, res) => {
  try {
    const { contactId } = req.params;
    const { data } = await client.get(`/contact/${contactId}/searchalert`);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * POST /contacts/:contactId/searchalerts
 * Add a new search alert for a contact
 *
 * Body:
 * - number (integer, required) - 1 or 2
 * - active (integer) - 0 or 1
 * - areas (array of strings) - geographic areas
 * - types (array of strings) - listing types
 * - beds (integer) - minimum bedrooms
 * - baths (number) - minimum bathrooms
 * - min_price (number)
 * - max_price (number)
 * - min_acres (number)
 * - max_sqft (number)
 * - frequency (string) - email frequency
 * - email_cc (string) - CC email address
 */
router.post('/', async (req, res) => {
  try {
    const { contactId } = req.params;
    const payload = req.body;

    // Validate alert number
    if (!payload.number || !isValidSearchAlertNumber(payload.number)) {
      return res.status(400).json({
        error: 'Invalid alert number. Must be 1 or 2'
      });
    }

    const { data } = await client.post(`/contact/${contactId}/searchalert`, payload);
    res.status(201).json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * PUT /contacts/:contactId/searchalerts/:alertNumber
 * Update an existing search alert
 *
 * Body: Same as POST
 */
router.put('/:alertNumber', async (req, res) => {
  try {
    const { contactId, alertNumber } = req.params;
    const alertNum = parseInt(alertNumber, 10);

    // Validate alert number
    if (!isValidSearchAlertNumber(alertNum)) {
      return res.status(400).json({
        error: 'Invalid alert number. Must be 1 or 2'
      });
    }

    const payload = req.body;
    const { data } = await client.put(`/contact/${contactId}/searchalert/${alertNum}`, payload);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * DELETE /contacts/:contactId/searchalerts/:alertNumber
 * Delete a search alert
 */
router.delete('/:alertNumber', async (req, res) => {
  try {
    const { contactId, alertNumber } = req.params;
    const alertNum = parseInt(alertNumber, 10);

    // Validate alert number
    if (!isValidSearchAlertNumber(alertNum)) {
      return res.status(400).json({
        error: 'Invalid alert number. Must be 1 or 2'
      });
    }

    await client.delete(`/contact/${contactId}/searchalert/${alertNum}`);
    res.status(204).send();
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * POST /contacts/:contactId/searchalerts/:alertNumber/send
 * Send alert results to the contact immediately
 */
router.post('/:alertNumber/send', async (req, res) => {
  try {
    const { contactId, alertNumber } = req.params;
    const alertNum = parseInt(alertNumber, 10);

    // Validate alert number
    if (!isValidSearchAlertNumber(alertNum)) {
      return res.status(400).json({
        error: 'Invalid alert number. Must be 1 or 2'
      });
    }

    const { data } = await client.post(`/contact/${contactId}/searchalert/${alertNum}/send`);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * GET /contacts/:contactId/searchalerts/:alertNumber/recent
 * Get recent search alert results
 */
router.get('/:alertNumber/recent', async (req, res) => {
  try {
    const { contactId, alertNumber } = req.params;
    const alertNum = parseInt(alertNumber, 10);

    // Validate alert number
    if (!isValidSearchAlertNumber(alertNum)) {
      return res.status(400).json({
        error: 'Invalid alert number. Must be 1 or 2'
      });
    }

    const { data } = await client.get(`/contact/${contactId}/searchalert/${alertNum}/recent`);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

module.exports = router;
