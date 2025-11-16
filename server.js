/**
 * KVCore Integration Server
 *
 * Main Express application for KVCore Public API v2 integration
 */

// Load environment variables first
require('dotenv').config();

const express = require('express');
const rateLimit = require('express-rate-limit');

// Import routers
const contactsRouter = require('./routes/contacts');
const notesRouter = require('./routes/notes');
const callsRouter = require('./routes/calls');
const searchAlertsRouter = require('./routes/searchAlerts');
const miscRouter = require('./routes/misc');

// Create Express application
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'kvcore-integration',
    version: '1.0.0'
  });
});

// API routes
app.use('/contacts', contactsRouter);
app.use('/contacts/:contactId/notes', notesRouter);
app.use('/contacts/:contactId/calls', callsRouter);
app.use('/contacts/:contactId/searchalerts', searchAlertsRouter);
app.use('/', miscRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'KVCore Integration API',
    version: '1.0.0',
    documentation: 'See README.md for API documentation',
    endpoints: {
      contacts: '/contacts',
      notes: '/contacts/:contactId/notes',
      calls: '/contacts/:contactId/calls',
      searchAlerts: '/contacts/:contactId/searchalerts',
      scheduleCall: '/schedule-call',
      views: '/views',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);

  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log(`🚀 KVCore Integration Server`);
  console.log('='.repeat(60));
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API documentation: http://localhost:${PORT}/`);
  console.log('='.repeat(60));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

module.exports = app;
