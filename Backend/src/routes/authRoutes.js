/**
 * Authentication Routes for CareerGenie
 * Handles user authentication endpoints
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Import controllers and middleware
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required')
  ],
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', verifyToken, authController.logout);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send password reset email
 * @access  Public
 */
router.post('/forgot-password',
  [
    body('email').isEmail().withMessage('Valid email is required')
  ],
  authController.forgotPassword
);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify authentication token
 * @access  Private
 */
router.get('/verify', verifyToken, authController.verifyToken);

module.exports = router;