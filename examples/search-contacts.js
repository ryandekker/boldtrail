#!/usr/bin/env node

/**
 * KVCore Client - Contact Search Example
 *
 * This script demonstrates how to use the KVCore client library to search for contacts
 * and perform various operations.
 *
 * Usage:
 *   node examples/search-contacts.js [options]
 *
 * Options:
 *   --email=<email>         Search by email
 *   --first-name=<name>     Search by first name
 *   --last-name=<name>      Search by last name
 *   --status=<0-7>          Search by status code
 *   --leadtype=<type>       Search by lead type (buyer, seller, renter, agent, vendor)
 *   --limit=<number>        Maximum number of results (default: 10)
 *   --debug                 Enable debug logging
 *
 * Examples:
 *   node examples/search-contacts.js --email=john@example.com
 *   node examples/search-contacts.js --first-name=John --last-name=Doe
 *   node examples/search-contacts.js --leadtype=buyer --limit=5
 *   node examples/search-contacts.js --status=0 --debug
 */

require('dotenv').config();
const KVCoreClient = require('../index');
const { constants } = require('../index');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

args.forEach(arg => {
  if (arg.startsWith('--')) {
    const [key, value] = arg.substring(2).split('=');
    if (value) {
      options[key] = value;
    } else {
      options[key] = true;
    }
  }
});

// Display help if no arguments
if (args.length === 0 || options.help) {
  console.log(`
KVCore Client - Contact Search Example

Usage:
  node examples/search-contacts.js [options]

Options:
  --email=<email>         Search by email
  --first-name=<name>     Search by first name
  --last-name=<name>      Search by last name
  --status=<0-7>          Search by status code
  --leadtype=<type>       Search by lead type (buyer, seller, renter, agent, vendor)
  --limit=<number>        Maximum number of results (default: 10)
  --debug                 Enable debug logging
  --help                  Show this help message

Examples:
  node examples/search-contacts.js --email=john@example.com
  node examples/search-contacts.js --first-name=John --last-name=Doe
  node examples/search-contacts.js --leadtype=buyer --limit=5
  node examples/search-contacts.js --status=0 --debug

Status Codes:
  0 - New
  1 - Client
  2 - Closed
  3 - Sphere
  4 - Active
  5 - Contract
  6 - Archived
  7 - Prospect
  `);
  process.exit(0);
}

async function main() {
  try {
    // Initialize the client
    const client = new KVCoreClient({
      bearerToken: process.env.KVCORE_BEARER_TOKEN,
      baseURL: process.env.KVCORE_BASE_URL
    });

    // Enable debug if requested
    if (options.debug) {
      client.enableDebug();
      console.log('Debug mode enabled\n');
    }

    // Build the search filters
    const filters = {};

    if (options.email) {
      filters['filter[email]'] = options.email;
    }
    if (options['first-name']) {
      filters['filter[first_name]'] = options['first-name'];
    }
    if (options['last-name']) {
      filters['filter[last_name]'] = options['last-name'];
    }
    if (options.status) {
      filters['filter[status]'] = parseInt(options.status);
    }
    if (options.leadtype) {
      filters['filter[leadtype]'] = options.leadtype;
    }

    filters.limit = options.limit ? parseInt(options.limit) : 10;

    console.log('Searching for contacts...');
    console.log('Filters:', JSON.stringify(filters, null, 2));
    console.log('');

    // Search for contacts
    const result = await client.contacts.list(filters);

    // Display results
    if (result.data && result.data.length > 0) {
      console.log(`Found ${result.data.length} contact(s):\n`);

      result.data.forEach((contact, index) => {
        console.log(`${index + 1}. ${contact.first_name} ${contact.last_name}`);
        console.log(`   ID: ${contact.id}`);
        console.log(`   Email: ${contact.email || 'N/A'}`);
        console.log(`   Phone: ${contact.cell_phone_1 || 'N/A'}`);
        console.log(`   Status: ${constants.getLeadStatusName(contact.status) || contact.status}`);
        console.log(`   Deal Type: ${contact.deal_type || 'N/A'}`);
        console.log(`   Created: ${contact.created_at || 'N/A'}`);
        console.log('');
      });

      // If we found exactly one contact, show additional details
      if (result.data.length === 1) {
        const contactId = result.data[0].id;

        console.log('Fetching additional details for this contact...\n');

        // Get full contact details
        const fullContact = await client.contacts.get(contactId);
        console.log('Full Contact Details:');
        console.log(JSON.stringify(fullContact, null, 2));
        console.log('');

        // Get notes if available
        try {
          const notes = await client.notes.list(contactId);
          if (notes.data && notes.data.length > 0) {
            console.log(`\nNotes (${notes.data.length}):`);
            notes.data.forEach((note, index) => {
              console.log(`  ${index + 1}. ${note.title || 'Untitled'}`);
              console.log(`     Date: ${note.date}`);
              console.log(`     Details: ${note.details || 'N/A'}`);
            });
          }
        } catch (err) {
          // Notes might not be available
        }

        // Get call logs if available
        try {
          const calls = await client.calls.list(contactId);
          if (calls.data && calls.data.length > 0) {
            console.log(`\nCall Logs (${calls.data.length}):`);
            calls.data.forEach((call, index) => {
              console.log(`  ${index + 1}. ${call.direction || 'N/A'} call`);
              console.log(`     Date: ${call.date}`);
              console.log(`     Result: ${constants.CALL_RESULT[call.result] || call.result}`);
              console.log(`     Notes: ${call.notes || 'N/A'}`);
            });
          }
        } catch (err) {
          // Call logs might not be available
        }
      }
    } else {
      console.log('No contacts found matching the search criteria.');
    }

    console.log('\nSearch completed successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    if (options.debug && error.stack) {
      console.error('\nStack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
