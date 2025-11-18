#!/usr/bin/env node

/**
 * KVCore Client - Send SMS Example
 *
 * This script demonstrates how to send text messages to contacts
 *
 * Usage:
 *   node examples/send-sms.js <contactId> <message>
 *   node examples/send-sms.js --search-email=<email> <message>
 *
 * Examples:
 *   node examples/send-sms.js 12345 "Hi! Just checking in about your property search."
 *   node examples/send-sms.js --search-email=john@example.com "New listings available!"
 */

require('dotenv').config();
const KVCoreClient = require('../index');

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2 || args.includes('--help')) {
  console.log(`
KVCore Client - Send SMS Example

Usage:
  node examples/send-sms.js <contactId> <message>
  node examples/send-sms.js --search-email=<email> <message>

Examples:
  # Send SMS to contact by ID
  node examples/send-sms.js 12345 "Hi! Just checking in."

  # Find contact by email, then send SMS
  node examples/send-sms.js --search-email=john@example.com "New listings available!"

Options:
  --search-email=<email>  Search for contact by email first
  --debug                 Enable debug logging
  --help                  Show this help message

Note: The contact must have text_on enabled and a valid phone number.
  `);
  process.exit(0);
}

async function findContactByEmail(client, email) {
  const result = await client.contacts.list({
    'filter[email]': email,
    limit: 1
  });

  if (!result.data || result.data.length === 0) {
    throw new Error(`No contact found with email: ${email}`);
  }

  return result.data[0];
}

async function main() {
  try {
    // Initialize the client
    const client = new KVCoreClient({
      bearerToken: process.env.KVCORE_BEARER_TOKEN,
      baseURL: process.env.KVCORE_BASE_URL
    });

    let contactId;
    let message;
    let debug = false;

    // Parse arguments
    if (args[0].startsWith('--search-email=')) {
      const email = args[0].split('=')[1];
      message = args.slice(1).filter(arg => arg !== '--debug').join(' ');
      debug = args.includes('--debug');

      if (debug) {
        client.enableDebug();
      }

      console.log(`Searching for contact with email: ${email}...\n`);
      const contact = await findContactByEmail(client, email);
      contactId = contact.id;

      console.log(`Found contact: ${contact.first_name} ${contact.last_name} (ID: ${contactId})`);
      console.log(`Phone: ${contact.cell_phone_1 || 'N/A'}`);
      console.log(`Text enabled: ${contact.text_on ? 'Yes' : 'No'}`);
      console.log('');

      if (!contact.text_on) {
        console.warn('Warning: Text messaging is not enabled for this contact.');
        console.warn('The SMS may not be delivered.\n');
      }

      if (!contact.cell_phone_1) {
        throw new Error('Contact does not have a phone number on file.');
      }
    } else {
      contactId = args[0];
      message = args.slice(1).filter(arg => arg !== '--debug').join(' ');
      debug = args.includes('--debug');

      if (debug) {
        client.enableDebug();
      }
    }

    if (!message || message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    console.log('Sending SMS...');
    console.log(`Contact ID: ${contactId}`);
    console.log(`Message: "${message}"`);
    console.log('');

    // Send the text message
    const result = await client.contacts.sendText(contactId, {
      message: message
    });

    console.log('✓ SMS sent successfully!');

    if (result.data) {
      console.log('\nResponse:');
      console.log(JSON.stringify(result.data, null, 2));
    }

    console.log('\nNote: The actual delivery depends on the contact\'s carrier and phone settings.');

  } catch (error) {
    console.error('Error:', error.message);
    if (args.includes('--debug') && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    if (error.responseData) {
      console.error('\nAPI Response:');
      console.error(JSON.stringify(error.responseData, null, 2));
    }
    process.exit(1);
  }
}

main();
