# KVCore Integration API

A Node.js REST API wrapper for the KVCore Public API v2 (Inside Real Estate). This project provides a clean, well-structured interface for managing contacts, notes, calls, search alerts, and other CRM operations.

## Features

- **Contact Management** - Create, read, update, and delete contacts
- **Notes** - Manage notes for contacts
- **Call Logs** - Track phone calls with contacts
- **Search Alerts** - Manage property search alerts for contacts
- **Communications** - Send emails and text messages to contacts
- **Tagging** - Add and remove tags from contacts
- **Rate Limiting** - Built-in rate limiting to protect against API abuse
- **Error Handling** - Comprehensive error handling and logging
- **Validation** - Input validation for critical fields

## Prerequisites

- Node.js 14.x or higher
- npm or yarn
- KVCore API Bearer Token

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd boldtrail
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
KVCORE_BASE_URL=https://api.kvcore.com/v2/public
KVCORE_BEARER_TOKEN=your-bearer-token-here
PORT=3000
NODE_ENV=development
```

## Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on the port specified in your `.env` file (default: 3000).

## API Endpoints

### Health Check
- `GET /health` - Check server health status

### Contacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contacts` | List all contacts (with filters) |
| GET | `/contacts/:contactId` | Get a specific contact |
| POST | `/contacts` | Create a new contact |
| PUT | `/contacts/:contactId` | Update a contact |
| DELETE | `/contacts/:contactId` | Delete a contact |

#### Contact Query Parameters (GET /contacts)
- `filter[email]` - Filter by email
- `filter[first_name]` - Filter by first name
- `filter[last_name]` - Filter by last name
- `filter[source]` - Filter by source
- `filter[leadtype]` - Filter by lead type (buyer, seller, renter, agent, vendor)
- `filter[status]` - Filter by status code (0-7)
- `filter[registered_after]` - Filter by registration date (timestamp)
- `filter[registered_before]` - Filter by registration date (timestamp)
- `limit` - Maximum number of results (default 100)
- `includeArchived` - Include archived contacts (0 or 1)

#### Contact Body Fields (POST/PUT)
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "cell_phone_1": "555-1234",
  "deal_type": "buyer,seller",
  "status": 0,
  "email_optin": 1,
  "phone_on": 1,
  "text_on": 1,
  "capture_method": "Website Lead Capture",
  "assigned_agent_id": "123",
  "is_private": 0
}
```

### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contacts/:contactId/notes` | List all notes for a contact |
| PUT | `/contacts/:contactId/notes` | Add a note to a contact |
| GET | `/contacts/:contactId/notes/:actionId` | Get a specific note |
| PUT | `/contacts/:contactId/notes/:actionId` | Update a note |

#### Note Body Fields
```json
{
  "date": "2024-01-15T10:30:00Z",
  "title": "Follow-up call",
  "details": "Discussed property options",
  "action_owner_user_id": "456"
}
```

### Call Logs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contacts/:contactId/calls` | List all call logs for a contact |
| PUT | `/contacts/:contactId/calls` | Log a call for a contact |
| GET | `/contacts/:contactId/calls/:actionId` | Get a specific call log |
| PUT | `/contacts/:contactId/calls/:actionId` | Update a call log |

#### Call Log Body Fields
```json
{
  "date": "2024-01-15T14:30:00Z",
  "direction": "outbound",
  "result": 3,
  "recording_url": "https://example.com/recording.mp3",
  "notes": "Discussed property viewing"
}
```

**Call Result Codes:**
- `1` - Bad Number
- `2` - Not Home
- `3` - Contacted

**Call Directions:**
- `outbound`
- `inbound`

### Search Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contacts/:contactId/searchalerts` | List all search alerts |
| POST | `/contacts/:contactId/searchalerts` | Create a search alert |
| PUT | `/contacts/:contactId/searchalerts/:alertNumber` | Update a search alert (1 or 2) |
| DELETE | `/contacts/:contactId/searchalerts/:alertNumber` | Delete a search alert |
| POST | `/contacts/:contactId/searchalerts/:alertNumber/send` | Send alert results immediately |
| GET | `/contacts/:contactId/searchalerts/:alertNumber/recent` | Get recent alert results |

#### Search Alert Body Fields
```json
{
  "number": 1,
  "active": 1,
  "areas": ["Downtown", "Suburbs"],
  "types": ["Single Family", "Condo"],
  "beds": 3,
  "baths": 2,
  "min_price": 200000,
  "max_price": 500000,
  "frequency": "daily",
  "email_cc": "agent@example.com"
}
```

### Tags

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contacts/:contactId/tags` | Get all tags for a contact |
| PUT | `/contacts/:contactId/tags` | Add tags to a contact |
| DELETE | `/contacts/:contactId/tags` | Remove tags from a contact |

### Communications

| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/contacts/:contactId/email` | Send email to a contact |
| PUT | `/contacts/:contactId/text` | Send text message to a contact |

### Additional Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contacts/:contactId/listingviews` | Get listing views |
| GET | `/contacts/:contactId/marketreport` | Get market reports |
| POST | `/contacts/:contactId/question` | Ask a question about a property |
| POST | `/contacts/:contactId/appointment` | Request a property showing |
| POST | `/schedule-call` | Schedule a call with reminder |
| POST | `/views` | Add a listing view |

## Constants and Enumerations

The `constants.js` module provides useful enumerations:

```javascript
const {
  LEAD_STATUS,
  CONTACT_STATUS_FILTER,
  CALL_RESULT,
  CALL_DIRECTION,
  DEAL_TYPES,
  LEADTYPE_FILTER,
  SEARCH_ALERT_NUMBER,
  OPT_IN_VALUES,
  BOOLEAN_INT
} = require('./constants');
```

### Lead Status Codes
- `0` - New
- `1` - Client
- `2` - Closed
- `3` - Sphere
- `4` - Active
- `5` - Contract
- `6` - Archived
- `7` - Prospect

## Project Structure

```
boldtrail/
├── routes/
│   ├── contacts.js       # Contact management endpoints
│   ├── notes.js          # Note management endpoints
│   ├── calls.js          # Call log endpoints
│   ├── searchAlerts.js   # Search alert endpoints
│   └── misc.js           # Miscellaneous endpoints
├── constants.js          # API constants and enumerations
├── kvcoreClient.js       # Axios client configuration
├── server.js             # Express app setup
├── package.json          # Dependencies and scripts
├── .env.example          # Environment variable template
└── README.md             # This file
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": {
    // Additional error details from KVCore API
  }
}
```

HTTP status codes are passed through from the KVCore API, or set to 500 for unexpected errors.

## Rate Limiting

The API includes rate limiting to prevent abuse:
- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables:
  - `RATE_LIMIT_WINDOW_MS` - Time window in milliseconds
  - `RATE_LIMIT_MAX_REQUESTS` - Maximum requests per window

## Development

### Running Tests
```bash
npm test
```

### Code Structure
- Each router module is independent and focused on a specific domain
- The `kvcoreClient.js` centralizes API configuration and error handling
- Constants are defined in a single module for reusability
- Request validation is performed where critical

### Adding New Endpoints

1. Create or update a router in the `routes/` directory
2. Import the router in `server.js`
3. Mount the router with `app.use()`
4. Update this README with the new endpoints

## Security Considerations

- **Never commit your `.env` file** - It contains sensitive credentials
- **Use HTTPS** in production - Configure a reverse proxy (nginx, Apache)
- **Rotate your bearer token** regularly
- **Implement additional authentication** if exposing publicly
- **Monitor rate limits** and adjust as needed

## License

See LICENSE file for details.

## Support

For KVCore API documentation, visit the official KVCore developer portal.

For issues with this integration, please open an issue in the repository.
