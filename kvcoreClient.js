/**
 * KVCore API Client
 *
 * Centralized Axios client for KVCore Public API v2
 * Handles authentication, headers, and common error handling
 */

const axios = require('axios');

// Load environment variables
const BASE_URL = process.env.KVCORE_BASE_URL;
const TOKEN = process.env.KVCORE_BEARER_TOKEN;

// Validate required environment variables
if (!BASE_URL) {
  throw new Error('KVCORE_BASE_URL environment variable is required');
}

if (!TOKEN) {
  throw new Error('KVCORE_BEARER_TOKEN environment variable is required');
}

/**
 * Create and configure Axios client instance
 */
const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`,
  },
  timeout: 30000, // 30 seconds timeout
});

/**
 * Request interceptor
 * Logs outgoing requests in development mode
 */
client.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * Handles common error scenarios and logs responses in development mode
 */
client.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API Response] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Enhanced error handling
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      console.error(`[API Error] ${status} - ${error.config.url}`, data);

      // Create a more descriptive error message
      error.message = data.message || data.error || error.message;
      error.statusCode = status;
      error.responseData = data;
    } else if (error.request) {
      // The request was made but no response was received
      console.error('[API Error] No response received', error.request);
      error.message = 'No response received from KVCore API';
      error.statusCode = 503;
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('[API Error] Request setup failed', error.message);
      error.statusCode = 500;
    }

    return Promise.reject(error);
  }
);

module.exports = client;
