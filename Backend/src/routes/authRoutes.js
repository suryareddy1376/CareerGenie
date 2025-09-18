/**
 * Authentication Routes for CareerGenie
 */

const express = require('express');
const AuthController = require('../controllers/authController');
const { body } = require('express-validator');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('fullName').notEmpty().trim(),
  ],
  AuthController.register
);

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT
 * @access Public
 */
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists(),
  ],
  AuthController.login
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user (invalidate token)
 * @access Private
 */
router.post('/logout', AuthController.logout);

/**
 * @route POST /api/auth/forgot-password
 * @desc Send password reset email
 * @access Public
 */
router.post('/forgot-password',
  [
    body('email').isEmail().normalizeEmail(),
  ],
  AuthController.forgotPassword
);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post('/reset-password',
  [
    body('token').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
  ],
  AuthController.resetPassword
);

/**
 * @route GET /api/auth/verify-email
 * @desc Verify email with token
 * @access Public
 */
router.get('/verify-email', AuthController.verifyEmail);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh JWT token
 * @access Private
 */
router.post('/refresh', AuthController.refreshToken);

module.exports = router;
