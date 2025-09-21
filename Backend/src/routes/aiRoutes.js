/**
 * AI Routes for CareerGenie
 * Advanced AI-powered features using Vertex AI
 */

const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const AIController = require('../controllers/aiController');
const { verifyToken } = require('../middleware/auth');
const aiService = require('../services/aiService');

// Simple in-memory per-user AI rate limiter (prototype level)
const aiRateWindowMs = parseInt(process.env.AI_RATE_WINDOW_MS || '60000');
const aiRateMax = parseInt(process.env.AI_RATE_MAX || '15');
const aiRateState = new Map(); // userId -> { count, reset }

function aiRateLimiter(req, res, next) {
  try {
    const uid = req.user?.uid;
    if (!uid) return res.status(401).json({ success:false, message: 'Unauthorized' });
    const now = Date.now();
    let entry = aiRateState.get(uid);
    if (!entry || entry.reset < now) {
      entry = { count: 0, reset: now + aiRateWindowMs };
      aiRateState.set(uid, entry);
    }
    if (entry.count >= aiRateMax) {
      return res.status(429).json({ success:false, message: 'AI rate limit exceeded', retryAfterMs: entry.reset - now });
    }
    entry.count++;
    next();
  } catch (e) {
    next(); // fail-open for prototype
  }
}

// Middleware to add request start time for performance tracking
router.use((req, res, next) => {
  req.startTime = Date.now();
  next();
});

/**
 * @route   POST /api/ai/recommendations
 * @desc    Generate AI-powered career recommendations
 * @access  Private
 */
router.post('/recommendations',
  verifyToken,
  aiRateLimiter,
  [
    body('resumeData').notEmpty().withMessage('Resume data is required'),
    body('preferences').optional().isObject().withMessage('Preferences must be an object')
  ],
  AIController.generateRecommendations
);

/**
 * @route   POST /api/ai/skill-gap-analysis
 * @desc    Analyze skill gap for career transition
 * @access  Private
 */
router.post('/skill-gap-analysis',
  verifyToken,
  aiRateLimiter,
  [
    body('currentSkills').isArray().withMessage('Current skills must be an array'),
    body('targetRole').notEmpty().withMessage('Target role is required')
  ],
  AIController.analyzeSkillGap
);

/**
 * @route   POST /api/ai/analyze-resume
 * @desc    Enhanced resume analysis with Vertex AI
 * @access  Private
 */
router.post('/analyze-resume',
  verifyToken,
  aiRateLimiter,
  [
    body('text').notEmpty().withMessage('Resume text is required')
  ],
  AIController.analyzeResume
);

/**
 * @route   POST /api/ai/interview-questions
 * @desc    Generate interview questions for specific role
 * @access  Private
 */
router.post('/interview-questions',
  verifyToken,
  aiRateLimiter,
  [
    body('jobTitle').notEmpty().withMessage('Job title is required'),
    body('experience').optional().isString(),
    body('skills').optional().isArray()
  ],
  AIController.generateInterviewQuestions
);

/**
 * @route   POST /api/ai/cover-letter
 * @desc    Generate personalized cover letter
 * @access  Private
 */
router.post('/cover-letter',
  verifyToken,
  aiRateLimiter,
  [
    body('resumeData').notEmpty().withMessage('Resume data is required'),
    body('jobDescription').notEmpty().withMessage('Job description is required'),
    body('companyName').optional().isString(),
    body('jobTitle').optional().isString()
  ],
  AIController.generateCoverLetter
);

/**
 * @route   GET /api/ai/market-trends/:field
 * @desc    Get market trends analysis for specific field
 * @access  Private
 */
router.get('/market-trends/:field',
  verifyToken,
  aiRateLimiter,
  [
    param('field').notEmpty().withMessage('Field parameter is required')
  ],
  AIController.getMarketTrends
);

/**
 * @route   GET /api/ai/status
 * @desc    Get AI service status
 * @access  Private
 */
router.get('/status', verifyToken, (req, res) => {
  res.json({
    success: true,
    message: 'AI service is running',
    data: {
      service: 'Vertex AI',
      status: 'active',
      features: [
        'Enhanced Resume Analysis',
        'Career Recommendations',
        'Skill Gap Analysis',
        'Interview Questions',
        'Cover Letter Generation',
        'Market Trends Analysis'
      ],
      timestamp: new Date().toISOString()
    }
  });
});

// Lightweight AI health probe (cached)
let lastHealth = { ts: 0, ok: false };
router.get('/health', verifyToken, async (req, res) => {
  const now = Date.now();
  if (now - lastHealth.ts < 30000) {
    return res.json({ success: lastHealth.ok, cached: true, checkedAt: new Date(lastHealth.ts).toISOString() });
  }
  try {
    const probe = await aiService.generateWithVertexAI('Return the word OK', { maxOutputTokens: 5, temperature: 0 });
    const ok = /ok/i.test(probe);
    lastHealth = { ts: now, ok };
    return res.json({ success: ok, output: probe, checkedAt: new Date(now).toISOString() });
  } catch (e) {
    lastHealth = { ts: now, ok: false };
    return res.status(503).json({ success:false, error: e.message, checkedAt: new Date(now).toISOString() });
  }
});

module.exports = router;
