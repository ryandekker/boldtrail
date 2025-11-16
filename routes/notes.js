/**
 * Notes Router
 *
 * Handles note-related endpoints for contacts in the KVCore API
 * This router is mounted at /contacts/:contactId/notes
 */

const express = require('express');
const router = express.Router({ mergeParams: true });
const client = require('../kvcoreClient');

/**
 * GET /contacts/:contactId/notes
 * Get all notes for a contact
 */
router.get('/', async (req, res) => {
  try {
    const { contactId } = req.params;
    const { data } = await client.get(`/contact/${contactId}/action/note`);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * PUT /contacts/:contactId/notes
 * Add a new note to a contact
 *
 * Body:
 * - date (date-time, required)
 * - title (string, required)
 * - details (string)
 * - action_owner_user_id (string) - act on another user's behalf
 */
router.put('/', async (req, res) => {
  try {
    const { contactId } = req.params;
    const payload = req.body;
    const { data } = await client.put(`/contact/${contactId}/action/note`, payload);
    res.status(201).json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * GET /contacts/:contactId/notes/:actionId
 * Get details of a specific note
 */
router.get('/:actionId', async (req, res) => {
  try {
    const { contactId, actionId } = req.params;
    const { data } = await client.get(`/contact/${contactId}/action/note/${actionId}`);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * PUT /contacts/:contactId/notes/:actionId
 * Update an existing note
 *
 * Body:
 * - date (date-time)
 * - title (string)
 * - details (string)
 * - action_owner_user_id (string)
 */
router.put('/:actionId', async (req, res) => {
  try {
    const { contactId, actionId } = req.params;
    const payload = req.body;
    const { data } = await client.put(`/contact/${contactId}/action/note/${actionId}`, payload);
    res.json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

module.exports = router;
