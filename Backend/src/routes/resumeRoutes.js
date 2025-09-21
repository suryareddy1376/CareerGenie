/**
 * Resume Routes for CareerGenie
 * Handles all resume-related API endpoints
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const { body, param } = require('express-validator');

// Import controllers and middleware
const resumeController = require('../controllers/resumeController');
const { verifyToken } = require('../middleware/auth');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow PDF, DOC, DOCX files
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

/**
 * @route   POST /api/parseResume
 * @desc    Parse uploaded resume file
 * @access  Private
 */
router.post('/parseResume', 
  verifyToken,
  upload.single('resume'),
  [
    body('userId').optional().isString()
  ],
  resumeController.parseResume
);

/**
 * @route   GET /api/resume
 * @desc    Get user's resume data
 * @access  Private
 */
router.get('/resume', verifyToken, resumeController.getResume);

/**
 * @route   GET /api/resume/all
 * @desc    Get all user's resumes
 * @access  Private
 */
router.get('/resume/all', verifyToken, resumeController.getAllResumes);

/**
 * @route   DELETE /api/resume/:id
 * @desc    Delete user's resume
 * @access  Private
 */
router.delete('/resume/:id', 
  verifyToken,
  [
    param('id').notEmpty().withMessage('Resume ID is required')
  ],
  resumeController.deleteResume
);

/**
 * @route   POST /api/buildResume
 * @desc    Build resume from profile data
 * @access  Private
 */
router.post('/buildResume',
  verifyToken,
  [
    body('template').optional().isString()
  ],
  resumeController.buildResume
);

/**
 * @route   POST /api/resume/skill-gaps
 * @desc    Analyze skill gaps
 * @access  Private
 */
router.post('/resume/skill-gaps',
  verifyToken,
  [
    body('targetRole').notEmpty().withMessage('Target role is required')
  ],
  resumeController.analyzeSkillGaps
);

/**
 * @route   POST /api/resume/roadmap
 * @desc    Generate career roadmap
 * @access  Private
 */
router.post('/resume/roadmap',
  verifyToken,
  [
    body('targetRole').notEmpty().withMessage('Target role is required'),
    body('timeframe').optional().isInt({ min: 1, max: 60 })
  ],
  resumeController.generateRoadmap
);

/**
 * @route   POST /api/resume/chat
 * @desc    Chat with AI assistant
 * @access  Private
 */
router.post('/resume/chat',
  verifyToken,
  [
    body('message').notEmpty().withMessage('Message is required')
  ],
  resumeController.chatWithAI
);

/**
 * @route   POST /api/resume/upload
 * @desc    Upload resume file to storage
 * @access  Private
 */
router.post('/resume/upload',
  verifyToken,
  upload.single('resume'),
  resumeController.uploadResume
);

/**
 * @route   GET /api/resume/profile
 * @desc    Get structured user profile data
 * @access  Private
 */
router.get('/resume/profile', verifyToken, resumeController.getStructuredProfile);

/**
 * @route   PUT /api/resume/profile
 * @desc    Update user profile data
 * @access  Private
 */
router.put('/resume/profile',
  verifyToken,
  [
    body('educations').optional().isArray(),
    body('experiences').optional().isArray(),
    body('skills').optional().isArray(),
    body('personalInfo').optional().isObject()
  ],
  resumeController.updateStructuredProfile
);

module.exports = router;