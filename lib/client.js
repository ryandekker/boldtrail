/**
 * KVCore API Client
 *
 * Main client class for interacting with the KVCore Public API v2
 */

const axios = require('axios');
const ContactsAPI = require('./api/contacts');
const NotesAPI = require('./api/notes');
const CallsAPI = require('./api/calls');
const SearchAlertsAPI = require('./api/searchAlerts');
const MiscAPI = require('./api/misc');

class KVCoreClient {
  /**
   * Create a new KVCore API client
   * @param {Object} config - Configuration object
   * @param {string} config.baseURL - KVCore API base URL (default: https://api.kvcore.com/v2/public)
   * @param {string} config.bearerToken - KVCore API bearer token (required)
   * @param {number} config.timeout - Request timeout in milliseconds (default: 30000)
   */
  constructor(config = {}) {
    if (!config.bearerToken) {
      throw new Error('bearerToken is required');
    }

    this.config = {
      baseURL: config.baseURL || 'https://api.kvcore.com/v2/public',
      timeout: config.timeout || 30000,
      bearerToken: config.bearerToken
    };

    // Create Axios instance
    this.http = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.bearerToken}`
      }
    });

    // Add request interceptor
    this.http.interceptors.request.use(
      (config) => {
        if (this.debug) {
          console.log(`[KVCore] ${config.method.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => {
        console.error('[KVCore Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    this.http.interceptors.response.use(
      (response) => {
        if (this.debug) {
          console.log(`[KVCore] ${response.status} ${response.config.url}`);
        }
        return response;
      },
      (error) => {
        // Enhanced error handling
        if (error.response) {
          const { status, data } = error.response;
          if (this.debug) {
            console.error(`[KVCore Error] ${status} - ${error.config.url}`, data);
          }
          error.message = data.message || data.error || error.message;
          error.statusCode = status;
          error.responseData = data;
        } else if (error.request) {
          error.message = 'No response received from KVCore API';
          error.statusCode = 503;
        } else {
          error.statusCode = 500;
        }
        return Promise.reject(error);
      }
    );

    // Initialize API modules
    this.contacts = new ContactsAPI(this.http);
    this.notes = new NotesAPI(this.http);
    this.calls = new CallsAPI(this.http);
    this.searchAlerts = new SearchAlertsAPI(this.http);
    this.misc = new MiscAPI(this.http);

    this.debug = false;
  }

  /**
   * Enable debug logging
   */
  enableDebug() {
    this.debug = true;
  }

  /**
   * Disable debug logging
   */
  disableDebug() {
    this.debug = false;
  }
}

module.exports = KVCoreClient;
