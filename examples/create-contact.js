#!/usr/bin/env node

/**
 * KVCore Client - Create Contact Example
 *
 * This script demonstrates how to create a new contact and add notes/calls
 *
 * Usage:
 *   node examples/create-contact.js
 */

require('dotenv').config();
const KVCoreClient = require('../index');
const { constants } = require('../index');

async function main() {
  try {
    // Initialize the client
    const client = new KVCoreClient({
      bearerToken: process.env.KVCORE_BEARER_TOKEN,
      baseURL: process.env.KVCORE_BASE_URL
    });

    client.enableDebug();

    console.log('Creating a new contact...\n');

    // Create a new contact
    const newContact = await client.contacts.create({
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane.smith@example.com',
      cell_phone_1: '555-9876',
      deal_type: 'buyer',
      status: 0, // New
      email_optin: 1,
      phone_on: 1,
      text_on: 1,
      capture_method: 'API Integration Test'
    });

    console.log('Contact created successfully!');
    console.log(`Contact ID: ${newContact.data.id}`);
    console.log(`Name: ${newContact.data.first_name} ${newContact.data.last_name}`);
    console.log('');

    const contactId = newContact.data.id;

    // Add a note to the contact
    console.log('Adding a note to the contact...\n');

    const note = await client.notes.create(contactId, {
      date: new Date().toISOString(),
      title: 'Initial Contact',
      details: 'Contact created via API integration. Looking for properties in the downtown area.'
    });

    console.log('Note added successfully!');
    console.log('');

    // Log a call
    console.log('Logging a call...\n');

    const call = await client.calls.create(contactId, {
      date: new Date().toISOString(),
      direction: 'outbound',
      result: 3, // Contacted
      notes: 'Discussed property preferences. Client prefers 3+ bedrooms.'
    });

    console.log('Call logged successfully!');
    console.log('');

    // Add tags
    console.log('Adding tags to the contact...\n');

    await client.contacts.addTags(contactId, [
      { name: '#hot-lead', locked: false },
      { name: '#buyer', locked: false }
    ]);

    console.log('Tags added successfully!');
    console.log('');

    // Get the full contact with all updates
    console.log('Fetching updated contact details...\n');

    const updatedContact = await client.contacts.get(contactId);
    console.log('Updated Contact:');
    console.log(JSON.stringify(updatedContact, null, 2));
    console.log('');

    console.log('✓ All operations completed successfully!');
    console.log(`\nContact ID ${contactId} is ready for further operations.`);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
