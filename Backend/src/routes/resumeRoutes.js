/**
 * Resume Routes for CareerGenie
 * Enhanced with comprehensive AI-powered features
 */

const express = require('express');
const ResumeController = require('../controllers/resumeController');
const resumeService = require('../services/resumeService');
const { verifyToken } = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

// Get upload middleware
const uploadMiddleware = resumeService.getUploadMiddleware();

// Apply authentication middleware to all resume routes
router.use(verifyToken);

/**
 * @route POST /api/resume/parse
 * @desc Parse uploaded resume file and extract structured data
 * @access Private
 */
router.post('/parse',
  uploadMiddleware,
  [
    body('template').optional().isIn(['professional', 'modern', 'minimal']),
  ],
  ResumeController.parseResume
);

/**
 * @route GET /api/resume
 * @desc Get user's latest resume data
 * @access Private
 */
router.get('/', ResumeController.getResume);

/**
 * @route GET /api/resume/all
 * @desc Get all user's resumes with pagination
 * @access Private
 */
router.get('/all', ResumeController.getAllResumes);

/**
 * @route DELETE /api/resume/:id
 * @desc Delete a specific resume
 * @access Private
 */
router.delete('/:id', ResumeController.deleteResume);

/**
 * @route POST /api/resume/build
 * @desc Build/generate resume from user profile data
 * @access Private
 */
router.post('/build',
  [
    body('template').optional().isIn(['professional', 'modern', 'minimal'])
      .withMessage('Template must be one of: professional, modern, minimal'),
  ],
  ResumeController.buildResume
);

/**
 * @route POST /api/resume/skill-gaps
 * @desc Analyze skill gaps for target role
 * @access Private
 */
router.post('/skill-gaps',
  [
    body('targetRole').notEmpty().withMessage('Target role is required')
      .isLength({ min: 2, max: 100 }).withMessage('Target role must be 2-100 characters')
  ],
  ResumeController.analyzeSkillGaps
);

/**
 * @route POST /api/resume/roadmap
 * @desc Generate career roadmap for target role
 * @access Private
 */
router.post('/roadmap',
  [
    body('targetRole').notEmpty().withMessage('Target role is required')
      .isLength({ min: 2, max: 100 }).withMessage('Target role must be 2-100 characters'),
    body('timeframe').optional().isInt({ min: 3, max: 60 })
      .withMessage('Timeframe must be between 3 and 60 months')
  ],
  ResumeController.generateRoadmap
);

/**
 * @route POST /api/resume/chat
 * @desc Chat with AI assistant about career guidance
 * @access Private
 */
router.post('/chat',
  [
    body('message').notEmpty().withMessage('Message is required')
      .isLength({ min: 1, max: 1000 }).withMessage('Message must be 1-1000 characters')
  ],
  ResumeController.chatWithAI
);

/**
 * @route POST /api/resume/upload
 * @desc Upload resume file to storage (without parsing)
 * @access Private
 */
router.post('/upload',
  uploadMiddleware,
  ResumeController.uploadResume
);

/**
 * @route GET /api/resume/profile
 * @desc Get structured user profile data from Supabase
 * @access Private
 */
router.get('/profile', ResumeController.getStructuredProfile);

/**
 * @route PUT /api/resume/profile
 * @desc Update structured user profile data in Supabase
 * @access Private
 */
router.put('/profile',
  [
    body('personalInfo').optional().isObject(),
    body('educations').optional().isArray(),
    body('experiences').optional().isArray(),
    body('skills').optional().isArray()
  ],
  ResumeController.updateStructuredProfile
);

module.exports = router;
