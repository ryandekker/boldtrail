# KVCore Client Library

A lightweight, easy-to-use Node.js client library for the KVCore Public API v2 (Inside Real Estate). Import this into your projects to interact with KVCore CRM data without the complexity of managing HTTP requests directly.

## Features

- **Simple API** - Clean, promise-based interface
- **Lightweight** - Only 2 dependencies (axios, dotenv)
- **TypeScript-ready** - Full IntelliSense support
- **Comprehensive** - Supports all major KVCore API endpoints
- **Validated** - Built-in validation for enumerations and required fields
- **Well-documented** - Extensive code comments and examples

## Installation

### From this Repository

```bash
# Clone the repository
git clone https://github.com/ryandekker/boldtrail.git
cd boldtrail
npm install
```

### As a Dependency (Future)

```bash
npm install kvcore-client
```

## Quick Start

```javascript
require('dotenv').config();
const KVCoreClient = require('kvcore-client');

// Initialize the client
const client = new KVCoreClient({
  bearerToken: process.env.KVCORE_BEARER_TOKEN
});

// Search for contacts
async function searchContacts() {
  const contacts = await client.contacts.list({
    'filter[email]': 'john@example.com',
    limit: 10
  });

  console.log(contacts.data);
}

searchContacts();
```

## Configuration

Create a `.env` file in your project root:

```env
KVCORE_BEARER_TOKEN=your-bearer-token-here
KVCORE_BASE_URL=https://api.kvcore.com/v2/public  # Optional, defaults to this
```

### Client Options

```javascript
const client = new KVCoreClient({
  bearerToken: 'your-token',           // Required
  baseURL: 'https://...',              // Optional, defaults to KVCore API
  timeout: 30000                       // Optional, request timeout in ms
});

// Enable debug logging
client.enableDebug();
```

## API Reference

### Contacts

```javascript
// List contacts with filters
const contacts = await client.contacts.list({
  'filter[email]': 'john@example.com',
  'filter[first_name]': 'John',
  'filter[last_name]': 'Doe',
  'filter[status]': 0,  // 0=New, 1=Client, 2=Closed, etc.
  'filter[leadtype]': 'buyer',  // buyer, seller, renter, agent, vendor
  limit: 10
});

// Get a specific contact
const contact = await client.contacts.get(contactId);

// Create a new contact
const newContact = await client.contacts.create({
  first_name: 'Jane',
  last_name: 'Smith',
  email: 'jane@example.com',
  cell_phone_1: '555-1234',
  deal_type: 'buyer',
  status: 0,
  email_optin: 1,
  phone_on: 1,
  text_on: 1
});

// Update a contact
const updated = await client.contacts.update(contactId, {
  status: 1,  // Change to Client
  deal_type: 'buyer,seller'
});

// Delete a contact
await client.contacts.delete(contactId);

// Manage tags
await client.contacts.addTags(contactId, [
  { name: '#hot-lead', locked: false },
  { name: '#buyer', locked: false }
]);

const tags = await client.contacts.getTags(contactId);
await client.contacts.removeTags(contactId, ['#hot-lead']);

// Communications
await client.contacts.sendEmail(contactId, {
  subject: 'New Listings',
  message: 'Check out these properties...'
});

await client.contacts.sendText(contactId, {
  message: 'Hi! Just following up...'
});

// Other contact operations
const listingViews = await client.contacts.getListingViews(contactId);
const marketReports = await client.contacts.getMarketReports(contactId);

await client.contacts.askQuestion(contactId, {
  mls_id: '12345',
  question: 'Is this property still available?'
});

await client.contacts.requestAppointment(contactId, {
  mls_id: '12345',
  question: 'I would like to schedule a viewing',
  date: '2024-01-20T14:00:00Z'
});
```

### Notes

```javascript
// List notes for a contact
const notes = await client.notes.list(contactId);

// Get a specific note
const note = await client.notes.get(contactId, actionId);

// Create a note
const newNote = await client.notes.create(contactId, {
  date: new Date().toISOString(),
  title: 'Follow-up call',
  details: 'Discussed property preferences'
});

// Update a note
const updated = await client.notes.update(contactId, actionId, {
  title: 'Updated title',
  details: 'Updated details'
});
```

### Call Logs

```javascript
// List call logs
const calls = await client.calls.list(contactId);

// Get a specific call log
const call = await client.calls.get(contactId, actionId);

// Log a call
const newCall = await client.calls.create(contactId, {
  date: new Date().toISOString(),
  direction: 'outbound',  // 'outbound' or 'inbound'
  result: 3,  // 1=Bad Number, 2=Not Home, 3=Contacted
  notes: 'Discussed viewing times',
  recording_url: 'https://...'
});

// Update a call log
const updated = await client.calls.update(contactId, actionId, {
  result: 3,
  notes: 'Updated notes'
});
```

### Search Alerts

```javascript
// List search alerts for a contact
const alerts = await client.searchAlerts.list(contactId);

// Create a search alert (1 or 2)
const newAlert = await client.searchAlerts.create(contactId, {
  number: 1,
  active: 1,
  areas: ['Downtown', 'Suburbs'],
  types: ['Single Family', 'Condo'],
  beds: 3,
  baths: 2,
  min_price: 200000,
  max_price: 500000,
  frequency: 'daily'
});

// Update a search alert
const updated = await client.searchAlerts.update(contactId, 1, {
  max_price: 600000
});

// Delete a search alert
await client.searchAlerts.delete(contactId, 1);

// Send alert results immediately
await client.searchAlerts.send(contactId, 1);

// Get recent results
const recent = await client.searchAlerts.getRecent(contactId, 1);
```

### Miscellaneous

```javascript
// Schedule a call
await client.misc.scheduleCall({
  leadId: contactId,
  note: 'Follow up on property inquiry',
  reminderDate: '2024-01-20',
  reminderTime: '14:00',
  repeatTimeframe: 7,  // days
  repeatTimes: 3,
  repeatCalls: true
});

// Add a listing view
await client.misc.addListingView({
  lead_id: contactId,
  mls_id: '12345',
  mobile: false,
  save: true,
  comments: 'Interested in this property'
});
```

## Constants and Enumerations

The library exports useful constants for validation:

```javascript
const { constants } = require('kvcore-client');

// Lead/Contact Status Codes
constants.LEAD_STATUS
// { 0: 'New', 1: 'Client', 2: 'Closed', 3: 'Sphere',
//   4: 'Active', 5: 'Contract', 6: 'Archived', 7: 'Prospect' }

// Call Results
constants.CALL_RESULT
// { 1: 'Bad Number', 2: 'Not Home', 3: 'Contacted' }

// Call Directions
constants.CALL_DIRECTION
// ['outbound', 'inbound']

// Deal Types
constants.DEAL_TYPES
// ['buyer', 'seller', 'renter']

// Lead Type Filters
constants.LEADTYPE_FILTER
// ['buyer', 'seller', 'renter', 'agent', 'vendor']

// Helper functions
constants.getLeadStatusName(0);  // Returns 'New'
constants.getLeadStatusCode('Client');  // Returns '1'
constants.isValidCallResult(3);  // Returns true
constants.isValidCallDirection('outbound');  // Returns true
constants.isValidSearchAlertNumber(1);  // Returns true
```

## Examples

### Running the Examples

The library includes working examples you can run:

```bash
# Search for contacts
npm run example:search -- --email=john@example.com
npm run example:search -- --first-name=John --last-name=Doe
npm run example:search -- --leadtype=buyer --limit=5
npm run example:search -- --status=0 --debug

# Create a contact with notes and calls
npm run example:create

# Send SMS to a contact
npm run example:sms -- 12345 "Hi! Just checking in about your property search."
npm run example:sms -- --search-email=john@example.com "New listings available!"

# Send email to a contact
npm run example:email -- 12345 "New Listings" "Check out these properties..."
npm run example:email -- --search-email=john@example.com "Follow Up" "Thanks for your interest!"
```

### Example: Search and Update Contacts

```javascript
require('dotenv').config();
const KVCoreClient = require('kvcore-client');

async function main() {
  const client = new KVCoreClient({
    bearerToken: process.env.KVCORE_BEARER_TOKEN
  });

  // Find contacts with status "New"
  const newContacts = await client.contacts.list({
    'filter[status]': 0,
    limit: 50
  });

  console.log(`Found ${newContacts.data.length} new contacts`);

  // Update each to "Active" status
  for (const contact of newContacts.data) {
    await client.contacts.update(contact.id, {
      status: 4  // Active
    });

    // Add a note
    await client.notes.create(contact.id, {
      date: new Date().toISOString(),
      title: 'Status Updated',
      details: 'Changed from New to Active'
    });

    console.log(`Updated ${contact.first_name} ${contact.last_name}`);
  }
}

main();
```

### Example: Import Contacts from CSV

```javascript
const fs = require('fs');
const csv = require('csv-parser');
const KVCoreClient = require('kvcore-client');

async function importContacts(csvFile) {
  const client = new KVCoreClient({
    bearerToken: process.env.KVCORE_BEARER_TOKEN
  });

  const contacts = [];

  // Read CSV
  fs.createReadStream(csvFile)
    .pipe(csv())
    .on('data', (row) => contacts.push(row))
    .on('end', async () => {
      // Import each contact
      for (const contact of contacts) {
        try {
          await client.contacts.create({
            first_name: contact.first_name,
            last_name: contact.last_name,
            email: contact.email,
            cell_phone_1: contact.phone,
            deal_type: 'buyer',
            status: 0,
            capture_method: 'CSV Import'
          });
          console.log(`Imported ${contact.email}`);
        } catch (err) {
          console.error(`Failed to import ${contact.email}:`, err.message);
        }
      }
    });
}

importContacts('contacts.csv');
```

## Error Handling

All API methods return promises and can throw errors:

```javascript
try {
  const contact = await client.contacts.get(contactId);
} catch (error) {
  console.error('Error:', error.message);
  console.error('Status Code:', error.statusCode);
  console.error('Response Data:', error.responseData);
}
```

Common error scenarios:
- `401` - Invalid bearer token
- `404` - Contact/resource not found
- `400` - Invalid request parameters
- `503` - No response from API (network error)

## Project Structure

```
kvcore-client/
├── lib/
│   ├── client.js           # Main KVCoreClient class
│   └── api/
│       ├── contacts.js     # Contacts API
│       ├── notes.js        # Notes API
│       ├── calls.js        # Calls API
│       ├── searchAlerts.js # Search Alerts API
│       └── misc.js         # Miscellaneous endpoints
├── examples/
│   ├── search-contacts.js  # CLI search example
│   ├── create-contact.js   # Create contact example
│   ├── send-sms.js         # Send SMS example
│   └── send-email.js       # Send email example
├── constants.js            # API constants and enumerations
├── index.js                # Main entry point
├── package.json
└── README.md
```

## Development

### Using in Your Project

```bash
# Option 1: Install from this repo
npm install /path/to/kvcore-client

# Option 2: Use npm link during development
cd /path/to/kvcore-client
npm link

cd /path/to/your-project
npm link kvcore-client
```

### Import in Your Code

```javascript
// CommonJS
const KVCoreClient = require('kvcore-client');
const { constants } = require('kvcore-client');

// ES Modules (if configured)
import KVCoreClient, { constants } from 'kvcore-client';
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

See LICENSE file for details.

## Support

For KVCore API documentation, visit the official KVCore developer portal.

For issues with this client library, please open an issue in the repository.

## Changelog

### v1.0.0
- Initial release
- Support for Contacts, Notes, Calls, and Search Alerts
- CLI examples
- Comprehensive documentation
