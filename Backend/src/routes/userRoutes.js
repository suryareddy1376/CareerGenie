/**
 * User Routes for CareerGenie
 * Handles user profile and data endpoints
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

// Import controllers and middleware
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', verifyToken, userController.getProfile);

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile',
  verifyToken,
  [
    body('firstName').optional().isString(),
    body('lastName').optional().isString(),
    body('email').optional().isEmail(),
    body('phone').optional().isString(),
    body('location').optional().isString()
  ],
  userController.updateProfile
);

/**
 * @route   GET /api/user/assessments
 * @desc    Get user assessments
 * @access  Private
 */
router.get('/assessments', verifyToken, userController.getAssessments);

/**
 * @route   POST /api/user/assessment
 * @desc    Save assessment results
 * @access  Private
 */
router.post('/assessment',
  verifyToken,
  [
    body('answers').isArray().withMessage('Answers must be an array'),
    body('score').isNumeric().withMessage('Score must be a number'),
    body('category').notEmpty().withMessage('Category is required')
  ],
  userController.saveAssessment
);

/**
 * @route   DELETE /api/user/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete('/account', verifyToken, userController.deleteAccount);

module.exports = router;