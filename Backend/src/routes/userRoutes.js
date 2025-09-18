/**
 * User Profile Routes for CareerGenie
 */

const express = require('express');
const UserController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(verifyToken);

/**
 * @route GET /api/user/profile
 * @desc Get user profile
 * @access Private
 */
router.get('/profile', UserController.getProfile);

/**
 * @route PUT /api/user/profile
 * @desc Update user profile
 * @access Private
 */
router.put('/profile',
  [
    body('fullName').optional().trim().notEmpty(),
    body('bio').optional().trim(),
    body('location').optional().trim(),
    body('phone').optional().trim(),
  ],
  UserController.updateProfile
);

/**
 * @route POST /api/user/avatar
 * @desc Upload user avatar
 * @access Private
 */
router.post('/avatar', UserController.uploadAvatar);

/**
 * @route PUT /api/user/preferences
 * @desc Update user preferences
 * @access Private
 */
router.put('/preferences',
  [
    body('emailNotifications').optional().isBoolean(),
    body('pushNotifications').optional().isBoolean(),
    body('theme').optional().isIn(['light', 'dark']),
  ],
  UserController.updatePreferences
);

/**
 * @route DELETE /api/user/account
 * @desc Delete user account
 * @access Private
 */
router.delete('/account', UserController.deleteAccount);

/**
 * @route GET /api/user/subscription
 * @desc Get user subscription details
 * @access Private
 */
router.get('/subscription', UserController.getSubscription);

/**
 * @route GET /api/user/stats
 * @desc Get user statistics (resume count, analysis history, etc.)
 * @access Private
 */
router.get('/stats', UserController.getStats);

module.exports = router;
