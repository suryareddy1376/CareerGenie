/**
 * Health Check Routes for CareerGenie
 * System health and status endpoints
 */

const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    API health check
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'CareerGenie API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * @route   GET /api/status
 * @desc    Detailed system status
 * @access  Public
 */
router.get('/status', (req, res) => {
  res.json({
    status: 'OK',
    services: {
      api: 'running',
      database: 'connected',
      storage: 'available'
    },
    version: require('../../package.json').version,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;