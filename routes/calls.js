/**
 * Calls Router
 *
 * Handles call log endpoints for contacts in the KVCore API
 * This router is mounted at /contacts/:contactId/calls
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const client = require('../kvcoreClient');
const { isValidCallResult, isValidCallDirection } = require('../constants');

/**
 * GET /contacts/:contactId/calls
 * Get all call logs for a contact
 */
router.get('/', async (req, res) => {
  try {
    const { contactId } = req.params;
    const { data } = await client.get(`/contact/${contactId}/action/call`);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * PUT /contacts/:contactId/calls
 * Log a new call for a contact
 *
 * Body:
 * - date (date-time, required)
 * - direction (string) - 'outbound' or 'inbound', defaults to 'outbound'
 * - result (integer) - 1 = Bad Number, 2 = Not Home, 3 = Contacted
 * - recording_url (string)
 * - action_owner_user_id (string) - act on another user's behalf
 * - notes (string)
 */
router.put('/', async (req, res) => {
  try {
    const { contactId } = req.params;
    const payload = req.body;

    // Optional validation
    if (payload.result && !isValidCallResult(payload.result)) {
      return res.status(400).json({
        error: 'Invalid call result code. Must be 1 (Bad Number), 2 (Not Home), or 3 (Contacted)'
      });
    }

    if (payload.direction && !isValidCallDirection(payload.direction)) {
      return res.status(400).json({
        error: 'Invalid call direction. Must be "outbound" or "inbound"'
      });
    }

    const { data } = await client.put(`/contact/${contactId}/action/call`, payload);
    res.status(201).json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * GET /contacts/:contactId/calls/:actionId
 * Get details of a specific call log
 */
router.get('/:actionId', async (req, res) => {
  try {
    const { contactId, actionId } = req.params;
    const { data } = await client.get(`/contact/${contactId}/action/call/${actionId}`);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * PUT /contacts/:contactId/calls/:actionId
 * Update an existing call log
 *
 * Body:
 * - date (date-time)
 * - direction (string) - 'outbound' or 'inbound'
 * - result (integer) - 1, 2, or 3
 * - recording_url (string)
 * - action_owner_user_id (string)
 * - notes (string)
 */
router.put('/:actionId', async (req, res) => {
  try {
    const { contactId, actionId } = req.params;
    const payload = req.body;

    // Optional validation
    if (payload.result && !isValidCallResult(payload.result)) {
      return res.status(400).json({
        error: 'Invalid call result code. Must be 1 (Bad Number), 2 (Not Home), or 3 (Contacted)'
      });
    }

    if (payload.direction && !isValidCallDirection(payload.direction)) {
      return res.status(400).json({
        error: 'Invalid call direction. Must be "outbound" or "inbound"'
      });
    }

    const { data } = await client.put(`/contact/${contactId}/action/call/${actionId}`, payload);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

module.exports = router;
