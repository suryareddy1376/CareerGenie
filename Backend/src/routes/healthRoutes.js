/**
 * Health and Test Routes for CareerGenie
 */

const express = require('express');
const { testConnection } = require('../config/firebase');

const router = express.Router();

/**
 * @route GET /api/health
 * @desc Health check endpoint
 * @access Public
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'CareerGenie Backend is running',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * @route GET /api/test/firebase
 * @desc Test Firebase connection
 * @access Public
 */
router.get('/test/firebase', async (req, res) => {
  try {
    const result = await testConnection();
    res.json({
      success: true,
      message: 'Firebase connection test successful',
      data: result
    });
  } catch (error) {
    console.error('Firebase test error:', error);
    res.status(500).json({
      success: false,
      message: 'Firebase connection test failed',
      error: error.message
    });
  }
});

/**
 * @route GET /api/test/features
 * @desc Test all available features
 * @access Public
 */
router.get('/test/features', (req, res) => {
  const availableFeatures = {
    authentication: {
      endpoints: [
        'POST /api/auth/register',
        'POST /api/auth/login',
        'POST /api/auth/logout',
        'POST /api/auth/forgot-password',
        'POST /api/auth/reset-password',
        'GET /api/auth/verify-email',
        'POST /api/auth/refresh'
      ]
    },
    userProfile: {
      endpoints: [
        'GET /api/user/profile',
        'PUT /api/user/profile',
        'POST /api/user/avatar',
        'PUT /api/user/preferences',
        'DELETE /api/user/account',
        'GET /api/user/subscription',
        'GET /api/user/stats'
      ]
    },
    resumeManagement: {
      endpoints: [
        'POST /api/resume/parse',
        'GET /api/resume',
        'GET /api/resume/all',
        'DELETE /api/resume/:id',
        'POST /api/resume/build',
        'POST /api/resume/upload'
      ]
    },
    aiFeatures: {
      endpoints: [
        'POST /api/skill-gaps',
        'POST /api/roadmap',
        'POST /api/chat'
      ]
    },
    healthAndTesting: {
      endpoints: [
        'GET /api/health',
        'GET /api/test/firebase',
        'GET /api/test/features'
      ]
    }
  };

  res.json({
    success: true,
    message: 'CareerGenie Backend Features',
    data: availableFeatures
  });
});

module.exports = router;
