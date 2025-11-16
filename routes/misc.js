/**
 * Miscellaneous Router
 *
 * Handles additional endpoints that don't fit into specific categories
 */

const express = require('express');
const router = express.Router();
const client = require('../kvcoreClient');

/**
 * POST /schedule-call
 * Schedule a call with a reminder
 *
 * Body:
 * - leadId (integer, required) - contact's ID
 * - note (string)
 * - reminderDate (string) - YYYY-MM-DD format
 * - reminderTime (string) - HH:MM format
 * - repeatTimeframe (integer) - number of days/weeks
 * - repeatTimes (integer) - how many times to repeat
 * - repeatCalls (boolean)
 */
router.post('/schedule-call', async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.leadId) {
      return res.status(400).json({
        error: 'leadId is required'
      });
    }

    const { data } = await client.post('/schedule-call', payload);
    res.status(201).json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

/**
 * POST /views
 * Add a listing view for a contact
 *
 * Body:
 * - lead_id (integer, required) - contact ID
 * - mls_id (string, required) - MLS ID of the listing
 * - mobile (boolean) - indicates a mobile view
 * - comments (string)
 * - save (boolean) - whether the user saved the property
 */
router.post('/views', async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.lead_id) {
      return res.status(400).json({
        error: 'lead_id is required'
      });
    }

    if (!payload.mls_id) {
      return res.status(400).json({
        error: 'mls_id is required'
      });
    }

    const { data } = await client.post('/views', payload);
    res.status(201).json(data);
  } catch (err) {
    res.status(err.statusCode || 500).json({
      error: err.message,
      details: err.responseData
    });
  }
});

module.exports = router;
