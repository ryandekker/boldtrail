# Plan for Implementing Inside Real Estate Public API v2 Endpoints in a Node Repository

The KVCore public API v2 allows third‑party applications to manage contacts, notes, calls and related data within the KVCore CRM.  Below is a step‑by‑step plan for bootstrapping a Node repository that exposes friendly endpoints and a helper module for calling the KVCore API.  Each section summarises the API method, describes important parameters and enumerations, and provides starter code in Node (using Express and Axios) to call the KVCore endpoints.

## 1 Repository setup

1. **Initialize the project**

   ```bash
   mkdir kvcore-integration && cd kvcore-integration
   npm init -y
   npm install express axios dotenv
   ```

2. **Create a `.env` file** with the API base URL and your bearer token:

   ```env
   KVCORE_BASE_URL=https://api.kvcore.com/v2/public
   KVCORE_BEARER_TOKEN=<your‑token>
   ```

3. **Configure Axios** – create `kvcoreClient.js` to centralize authentication and error handling:

   ```js
   // kvcoreClient.js
   const axios = require('axios');
   const BASE_URL = process.env.KVCORE_BASE_URL;
   const TOKEN = process.env.KVCORE_BEARER_TOKEN;

   const client = axios.create({
     baseURL: BASE_URL,
     headers: {
       'Accept': 'application/json',
       'Content-Type': 'application/json',
       Authorization: `Bearer ${TOKEN}`,
     },
   });

   module.exports = client;
   ```

4. **Setup Express** – create `server.js` and register routes.  Each route will call functions defined in separate modules (e.g., `contacts.js`, `notes.js`).  Remember to load environment variables:

   ```js
   // server.js
   require('dotenv').config();
   const express = require('express');
   const contacts = require('./routes/contacts');
   const notes    = require('./routes/notes');
   // other routers...

   const app = express();
   app.use(express.json());
   app.use('/contacts', contacts);
   app.use('/contacts/:contactId/notes', notes);
   // mount other routers

   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
   ```

## 2 Common enumerations and field values

Several API endpoints use numeric or string codes to represent statuses, results or deal types.  Include these as constants so they can be reused in your code.

| Constant                                                                                                                      | Description                                                                             | Source                    |
| ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------- |
| `LEAD_STATUS = { 0: 'New', 1: 'Client', 2: 'Closed', 3: 'Sphere', 4: 'Active', 5: 'Contract', 6: 'Archived', 7: 'Prospect' }` | Status codes used when creating or updating a contact.                                  | Update/Create Contact     |
| `CALL_RESULT = { 1: 'Bad Number', 2: 'Not Home', 3: 'Contacted' }`                                                            | Possible results for logged calls.                                                      | Log a Call                |
| `CALL_DIRECTION = ['outbound','inbound']`                                                                                     | Valid directions for logging calls; defaults to `outbound`.                             | Log a Call                |
| `DEAL_TYPES = ['buyer','seller','renter']`                                                                                    | Comma‑separated string describing deal types; may be combined (e.g., `'buyer,seller'`). | Create/Update Contact     |
| `LEADTYPE_FILTER = ['buyer','seller','renter','agent','vendor']`                                                              | Used in the contacts list filter `filter[leadtype]`.                                    | Get Contacts List         |
| `CONTACT_STATUS_FILTER = { 0:'New',1:'Client',2:'Closed',3:'Sphere',4:'Active',5:'Contract',7:'Prospect' }`                   | Filter contacts by status.                                                              | Get Contacts List         |
| `REPEAT_TIMEFRAMES`                                                                                                           | Not defined in docs; you may allow numbers of days/weeks for scheduling calls.          | Schedule a Call           |
| `SEARCH_ALERT_NUMBER`                                                                                                         | Must be 1 or 2 when adding or updating search alerts.                                   | Add / Update Search Alert |

## 3 Contacts endpoints

### 3.1 Get a list of contacts

* **Endpoint:** `GET /contacts`
* **Description:** Returns a paginated list of contacts.  Query parameters allow filtering by email, first name, last name, status, source and more.  The `includeArchived` parameter (0 or 1) determines whether archived contacts are returned.
* **Key query parameters:**

  * `filter[email]`, `filter[first_name]`, `filter[last_name]`, `filter[source]` – match strings exactly or partially.
  * `filter[leadtype]` – one of the values in `LEADTYPE_FILTER`.
  * `filter[status]` – numeric status code from `CONTACT_STATUS_FILTER`.
  * `filter[registered_after]` & `filter[registered_before]` – timestamps for registration date range.
  * `limit` – maximum number of results (integer).  If omitted, the API returns 100 records.

**Example code (routes/contacts.js)**:

```js
// routes/contacts.js
const express = require('express');
const router  = express.Router();
const client  = require('../kvcoreClient');

// GET /contacts
router.get('/', async (req, res) => {
  try {
    const params = req.query; // pass query params directly
    const response = await client.get('/contacts', { params });
    res.json(response.data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});

module.exports = router;
```

### 3.2 Get contact details

* **Endpoint:** `GET /contact/{contact_id}`
* **Description:** Retrieve a single contact by ID.

```js
// GET /contacts/:contactId
router.get('/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const { data } = await client.get(`/contact/${contactId}`);
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});
```

### 3.3 Create a new contact

* **Endpoint:** `POST /contact`
* **Description:** Creates a contact.  When creating through a super‑account token, include `entity_owner_id` to route the contact through an entity’s lead‑routing rules.  Required fields include `first_name`, `last_name`, `email` and (optionally) `cell_phone_1`.
* **Important body fields (many are optional):**

  * `deal_type`: comma‑separated list of values (`buyer`, `seller`, `renter`).
  * `status`: numeric status from `LEAD_STATUS`.
  * `email_optin`, `phone_on`, `text_on`: integers (1 = enabled, 0 = disabled) for communication preferences.
  * `capture_method`: e.g., “Website Lead Capture”.
  * `assigned_agent_id` or `assigned_agent_external_id`: specify the agent; if omitted, the lead goes through routing rules.
  * `tcpa_optin_date`: ISO 8601 date‑time when the lead opted in to text messaging.
  * `is_private`: 1 = hide from team (requires lead privacy on), default 0.
  * `active_mls_id`, `signup_mlsid`, `signup_mls`, `avg_price`, `avg_beds`, `avg_baths`.
  * `spouse_*` fields, `title`, `birthday`, `gender`.
  * `poi_address`, `poi_city`, `poi_state`, `poi_zip`, `second_email`, `external_vendor_id`, `owned_by_assigned`, `entity_owner_id`, `skip_new_notification`, `last_closing_date`, `hashtags` (array of strings beginning with ‘#’).

**Example creation function**

```js
// POST /contacts
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    const { data } = await client.post('/contact', payload);
    res.status(201).json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});
```

### 3.4 Update a contact

* **Endpoint:** `PUT /contact/{contact_id}`
* **Description:** Updates an existing contact.  The body fields mirror those used for creation.  Notable enumerations include the `status` codes listed above.

```js
// PUT /contacts/:contactId
router.put('/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const payload = req.body;
    const { data } = await client.put(`/contact/${contactId}`, payload);
    res.json(data);
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});
```

### 3.5 Remove (delete) a contact

* **Endpoint:** `DELETE /contact/{contact_id}`
* **Description:** Moves the contact to a “deleted” state (soft delete).

```js
// DELETE /contacts/:contactId
router.delete('/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    await client.delete(`/contact/${contactId}/`);
    res.status(204).send();
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message });
  }
});
```

### 3.6 Manage contact notes

| Operation            | Method & path                                       | Important parameters                                                                                                                 | Source           |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| **List notes**       | `GET /contact/{contact_id}/action/note`             | None besides `contact_id`                                                                                                            | Get Notes List   |
| **Add a note**       | `PUT /contact/{contact_id}/action/note`             | Body fields: `date` (date‑time), `title` (string), `details` (string), `action_owner_user_id` (string; act on another user’s behalf) | Add a Note       |
| **Get note details** | `GET /contact/{contact_id}/action/note/{action_id}` | Path parameters `contact_id`, `action_id`                                                                                            | Get Note Details |
| **Update a note**    | `PUT /contact/{contact_id}/action/note/{action_id}` | Same body fields as adding a note                                                                                                    | Update a Note    |

Each operation can be implemented in a router similar to the contacts example, calling the appropriate KVCore path via `kvcoreClient.js`.

### 3.7 Manage call logs

| Operation            | Method & path                                       | Important parameters                                                                                                                                                                                                       | Source           |
| -------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **List calls**       | `GET /contact/{contact_id}/action/call`             | Returns call logs for a contact.                                                                                                                                                                                           | Get Calls List   |
| **Log a call**       | `PUT /contact/{contact_id}/action/call`             | Body fields: `date` (date‑time), `direction` (string, defaults to `'outbound'`), `result` (int; 1 = Bad Number, 2 = Not Home, 3 = Contacted), `recording_url` (string), `action_owner_user_id` (string), `notes` (string). | Log a Call       |
| **Get call details** | `GET /contact/{contact_id}/action/call/{action_id}` | Path params `contact_id`, `action_id`.                                                                                                                                                                                     | Get Call Details |
| **Update a call**    | `PUT /contact/{contact_id}/action/call/{action_id}` | Same body fields as logging a call.                                                                                                                                                                                        | Update a Call    |

### 3.8 Listing views and market reports

* **Get listing views** – `GET /contact/{contact_id}/listingviews`: lists properties viewed or saved by the contact.
* **Get market reports** – `GET /contact/{contact_id}/marketreport`: returns a list of market reports for the contact.

### 3.9 Manage tags

* **Get tags for a contact:** `GET /contact/{contact_id}/tags`.
* **Add tags to a contact:** `PUT /contact/{contact_id}/tags` with a body of `[{ "name": "#myTag", "locked": false }]` (locked tags require super‑admin rights).  Tags are created if they don’t exist.
* **Remove tags from a contact:** `DELETE /contact/{contact_id}/tags` with a body array of tag names.  Tags are dissociated from the contact but not deleted.

### 3.10 Send communications

| Operation             | Method & path                     | Body                                              | Source                |
| --------------------- | --------------------------------- | ------------------------------------------------- | --------------------- |
| **Send email**        | `PUT /contact/{contact_id}/email` | `subject` (string, required); `message` (string). | Send Email to Contact |
| **Send text message** | `PUT /contact/{contact_id}/text`  | `message` (string, required).                     | Send Text to Contact  |

### 3.11 Schedule a call with a reminder

* **Endpoint:** `POST /schedule-call` (not tied to a contact path).
* **Body parameters:** `leadId` (integer, contact’s ID), `note`, `reminderDate` (YYYY‑MM‑DD), `reminderTime` (HH:MM), `repeatTimeframe` (integer), `repeatTimes` (integer), `repeatCalls` (boolean).

### 3.12 Ask a question about a property

* **Endpoint:** `POST /contact/{contactId}/question`.
* **Body parameters:** `website_id` (integer: website where the question came from); `mls_id` (string, MLS ID of the property); `question` (string, required – the contact’s question).

### 3.13 Request a property showing

* **Endpoint:** `POST /contact/{contactId}/appointment`.
* **Body parameters:** `mls_id` (string, required); `question` (string, required); `date` (ISO date‑time – when the contact wants the appointment).

### 3.14 Add a listing view

* **Endpoint:** `POST /views`.
* **Description:** Records that a contact viewed (or saved) a property.
* **Body parameters:** `lead_id` (integer, contact ID), `mls_id` (string, MLS ID of the listing), `mobile` (boolean indicating a mobile view), `comments` (string), `save` (boolean – whether the user saved the property).

## 4 Contact Listing Search Alerts

Search alerts monitor MLS data and email new listings to contacts.  They are optional but useful for home‑search functionality.

| Operation                         | Method & path                                                | Highlights                                                                                                                                                                                                                                                                                                            | Source |
| --------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| **Get alerts**                    | `GET /contact/{contact_id}/searchalert`                      | Returns the search alerts attached to a contact.                                                                                                                                                                                                                                                                      |        |
| **Add search alert**              | `POST /contact/{contact_id}/searchalert`                     | Body requires `number` (1 or 2), `active` (0 or 1), `areas` (array of strings), `types` (array of listing types), optional filters like `beds`, `baths`, `min_price`, `max_price`, `min_acres`, `max_sqft`, `frequency`, and `email_cc`.  See enumerations (listing types vary by MLS; supply as provided by the UI). |        |
| **Update search alert**           | `PUT /contact/{contact_id}/searchalert/{alertNumber}`        | Same body as add.  `alertNumber` is `1` or `2`.                                                                                                                                                                                                                                                                       |        |
| **Delete search alert**           | `DELETE /contact/{contact_id}/searchalert/{alertNumber}`     | Removes the specified alert.                                                                                                                                                                                                                                                                                          |        |
| **Send alert results to contact** | `POST /contact/{contact_id}/searchalert/{alertNumber}/send`  | Triggers an immediate email of matching listings.                                                                                                                                                                                                                                                                     |        |
| **Get recent results**            | `GET /contact/{contact_id}/searchalert/{alertNumber}/recent` | Returns the most recent listings for the alert.                                                                                                                                                                                                                                                                       |        |

When building these endpoints, define a router (`routes/searchAlerts.js`) that handles the above operations and maps path variables accordingly.

## 5 Super account and transaction management

Beyond contacts and search alerts, the API exposes management endpoints for super accounts, transaction users, transaction contacts and transactions.  The general pattern is similar:

* **Super account management** – operations include retrieving agent access, adding/removing offices or agents, and resetting passwords.  Use a dedicated router and call `GET /super/account/*` or `POST /super/account/*` as per the documentation.
* **Create & update transaction users/contacts** – endpoints follow `POST /transactionuser` or `PUT /transactionuser/{id}`; payloads include names, emails, role, etc.  See API reference for full fields.
* **Transactions** – endpoints allow creating, updating and retrieving transactions; fields include property details, commission, participants, milestones and closing dates.

Because the question emphasises “all endpoints,” your repository should mirror the API hierarchy: create modules for **Offices**, **Teams**, **Users**, **Listings**, **Open Houses**, **Transaction Users**, **Transactions**, and **Website & Testimonial Management**.  Each module can follow the same pattern used for contacts – call the KVCore endpoint via `kvcoreClient.js`, pass through parameters and return JSON responses.

## 6 Error handling and rate limiting

The KVCore API returns standard HTTP status codes.  A 200/201 indicates success; 4xx codes represent client errors (e.g., missing parameters), and 5xx codes represent server errors.  Wrap each request in a `try/catch` and forward `error.response.data` and `error.response.status` to the client.  To avoid hitting monthly request limits, implement simple rate limiting (e.g., using `express-rate-limit`) and cache results when appropriate.

## 7 Conclusion

By structuring your Node repository with modular routers and a shared Axios client, you can implement the entire KVCore Public API v2.  Begin with the contact management endpoints, which cover most daily CRM functions such as creating contacts, adding notes, logging calls and sending communications.  Extend the repository with modules for search alerts, listing management and transaction management.  The enumerations and parameter lists provided above reflect the official documentation and will help ensure your requests comply with the API’s expectations.

