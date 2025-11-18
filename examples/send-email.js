#!/usr/bin/env node

/**
 * KVCore Client - Send Email Example
 *
 * This script demonstrates how to send emails to contacts
 *
 * Usage:
 *   node examples/send-email.js <contactId> <subject> <message>
 *   node examples/send-email.js --search-email=<email> <subject> <message>
 *
 * Examples:
 *   node examples/send-email.js 12345 "New Listings" "Check out these properties..."
 *   node examples/send-email.js --search-email=john@example.com "Follow Up" "Thanks for your interest!"
 */

require('dotenv').config();
const KVCoreClient = require('../index');

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 3 || args.includes('--help')) {
  console.log(`
KVCore Client - Send Email Example

Usage:
  node examples/send-email.js <contactId> <subject> <message>
  node examples/send-email.js --search-email=<email> <subject> <message>

Examples:
  # Send email to contact by ID
  node examples/send-email.js 12345 "New Listings Available" "Hi! Check out these new properties in your area..."

  # Find contact by email, then send
  node examples/send-email.js --search-email=john@example.com "Follow Up" "Thanks for your interest in our properties!"

  # Use multi-line message
  node examples/send-email.js 12345 "Weekly Update" "Hi there! Here are this week's highlights: 1. New listings 2. Price reductions 3. Open houses"

Options:
  --search-email=<email>  Search for contact by email first
  --debug                 Enable debug logging
  --help                  Show this help message

Note: The contact must have email_optin enabled and a valid email address.
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
    let subject;
    let message;
    let debug = false;

    // Parse arguments
    if (args[0].startsWith('--search-email=')) {
      const email = args[0].split('=')[1];
      const otherArgs = args.slice(1).filter(arg => arg !== '--debug');
      subject = otherArgs[0];
      message = otherArgs.slice(1).join(' ');
      debug = args.includes('--debug');

      if (debug) {
        client.enableDebug();
      }

      console.log(`Searching for contact with email: ${email}...\n`);
      const contact = await findContactByEmail(client, email);
      contactId = contact.id;

      console.log(`Found contact: ${contact.first_name} ${contact.last_name} (ID: ${contactId})`);
      console.log(`Email: ${contact.email || 'N/A'}`);
      console.log(`Email opt-in: ${contact.email_optin ? 'Yes' : 'No'}`);
      console.log('');

      if (!contact.email_optin) {
        console.warn('Warning: Email opt-in is not enabled for this contact.');
        console.warn('The email may not be delivered.\n');
      }

      if (!contact.email) {
        throw new Error('Contact does not have an email address on file.');
      }
    } else {
      const filteredArgs = args.filter(arg => arg !== '--debug');
      contactId = filteredArgs[0];
      subject = filteredArgs[1];
      message = filteredArgs.slice(2).join(' ');
      debug = args.includes('--debug');

      if (debug) {
        client.enableDebug();
      }
    }

    if (!subject || subject.trim() === '') {
      throw new Error('Subject cannot be empty');
    }

    if (!message || message.trim() === '') {
      throw new Error('Message cannot be empty');
    }

    console.log('Sending email...');
    console.log(`Contact ID: ${contactId}`);
    console.log(`Subject: "${subject}"`);
    console.log(`Message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);
    console.log('');

    // Send the email
    const result = await client.contacts.sendEmail(contactId, {
      subject: subject,
      message: message
    });

    console.log('✓ Email sent successfully!');

    if (result.data) {
      console.log('\nResponse:');
      console.log(JSON.stringify(result.data, null, 2));
    }

    console.log('\nNote: The actual delivery depends on the contact\'s email settings and spam filters.');

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
