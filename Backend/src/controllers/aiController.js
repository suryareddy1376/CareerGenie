/**
 * AI Controller for CareerGenie
 * Handles advanced AI-powered features using Vertex AI
 */

const aiService = require('../services/aiService');
const { validationResult } = require('express-validator');

class AIController {
  /**
   * Generate Career Recommendations
   * POST /api/ai/recommendations
   */
  static async generateRecommendations(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { resumeData, preferences = {} } = req.body;
      console.log('🤖 Generating AI career recommendations...');
      const recommendations = await aiService.generateAndStoreRecommendations(
        req.user?.uid,
        resumeData,
        preferences
      );

      res.json({
        success: true,
        message: 'Career recommendations generated successfully',
        data: {
          recommendations: recommendations.recommendations || [],
          analysis: recommendations.overallAnalysis || {},
          generatedAt: new Date().toISOString(),
          processingTime: Date.now() - req.startTime
        }
      });

    } catch (error) {
      console.error('❌ Career recommendations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate career recommendations',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Skill Gap Analysis
   * POST /api/ai/skill-gap-analysis
   */
  static async analyzeSkillGap(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { currentSkills, targetRole } = req.body;

      console.log(`🎯 Analyzing skill gap for: ${targetRole}`);
      const analysis = await aiService.generateAndStoreSkillGap(
        req.user?.uid,
        currentSkills,
        targetRole
      );

      res.json({
        success: true,
        message: 'Skill gap analysis completed',
        data: {
          gapAnalysis: analysis.gapAnalysis || {},
          learningPlan: analysis.learningPlan || {},
          generatedAt: new Date().toISOString(),
          targetRole,
          currentSkillsCount: currentSkills.length
        }
      });

    } catch (error) {
      console.error('❌ Skill gap analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze skill gap',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Enhanced Resume Analysis
   * POST /api/ai/analyze-resume
   */
  static async analyzeResume(req, res) {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({
          success: false,
          message: 'Resume text is required'
        });
      }

      console.log('📄 Performing enhanced resume analysis with Vertex AI...');
  const analysis = await aiService.enhancedResumeAnalysis(text);
  const nlpInsights = await aiService.analyzeTextWithNLP(text);
  await aiService.storeResumeAIResult(req.user?.uid, text, { ...analysis, nlpInsights });

      res.json({
        success: true,
        message: 'Resume analysis completed',
        data: {
          analysis,
          nlpInsights,
          generatedAt: new Date().toISOString(),
          textLength: text.length
        }
      });

    } catch (error) {
      console.error('❌ Resume analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze resume',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Generate Interview Questions
   * POST /api/ai/interview-questions
   */
  static async generateInterviewQuestions(req, res) {
    try {
      const { jobTitle, experience, skills } = req.body;

      if (!jobTitle) {
        return res.status(400).json({
          success: false,
          message: 'Job title is required'
        });
      }

      const prompt = `
      Generate interview questions for the following role:
      
      Job Title: ${jobTitle}
      Experience Level: ${experience || 'Not specified'}
      Key Skills: ${skills ? skills.join(', ') : 'Not specified'}
      
      Provide 10-15 interview questions in JSON format:
      {
        "questions": [
          {
            "category": "Technical/Behavioral/Situational",
            "question": "Question text",
            "difficulty": "Easy/Medium/Hard",
            "keyPoints": ["point 1", "point 2"],
            "sampleAnswer": "Brief sample answer guidance"
          }
        ]
      }
      
      Only return the JSON object.
      `;

      console.log(`🎤 Generating interview questions for: ${jobTitle}`);
      const response = await aiService.generateWithVertexAI(prompt, { temperature: 0.6, maxOutputTokens: 2048 });
      const questions = JSON.parse(response);
      // Persist
      await aiService.storeAnalysis('interview_questions', req.user?.uid, { jobTitle, experience, skills }, questions, { feature: 'interview_questions' });

      res.json({
        success: true,
        message: 'Interview questions generated',
        data: {
          questions: questions.questions || [],
          jobTitle,
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Interview questions generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate interview questions',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Generate Cover Letter
   * POST /api/ai/cover-letter
   */
  static async generateCoverLetter(req, res) {
    try {
      const { resumeData, jobDescription, companyName, jobTitle } = req.body;

      if (!resumeData || !jobDescription) {
        return res.status(400).json({
          success: false,
          message: 'Resume data and job description are required'
        });
      }

      const prompt = `
      Generate a professional cover letter based on:
      
      Resume Data: ${JSON.stringify(resumeData, null, 2)}
      Job Description: ${jobDescription}
      Company Name: ${companyName || 'the company'}
      Job Title: ${jobTitle || 'the position'}
      
      Create a compelling cover letter that:
      1. Highlights relevant experience from the resume
      2. Matches skills to job requirements
      3. Shows enthusiasm for the role and company
      4. Maintains professional tone
      5. Is concise and impactful
      
      Return the cover letter as plain text, ready to use.
      `;

      console.log(`📝 Generating cover letter for: ${jobTitle} at ${companyName}`);
      const coverLetter = await aiService.generateWithVertexAI(prompt, { temperature: 0.7, maxOutputTokens: 1024 });
      await aiService.storeAnalysis('cover_letter', req.user?.uid, { resumeData, jobDescription, companyName, jobTitle }, { coverLetter }, { feature: 'cover_letter' });

      res.json({
        success: true,
        message: 'Cover letter generated',
        data: {
          coverLetter: coverLetter.trim(),
          jobTitle,
          companyName,
          generatedAt: new Date().toISOString(),
          wordCount: coverLetter.split(' ').length
        }
      });

    } catch (error) {
      console.error('❌ Cover letter generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate cover letter',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  /**
   * Market Trends Analysis
   * GET /api/ai/market-trends/:field
   */
  static async getMarketTrends(req, res) {
    try {
      const { field } = req.params;

      if (!field) {
        return res.status(400).json({
          success: false,
          message: 'Field parameter is required'
        });
      }

      const prompt = `
      Analyze current job market trends for: ${field}
      
      Provide insights in JSON format:
      {
        "trends": {
          "growingSkills": ["skill1", "skill2"],
          "decliningSkills": ["skill1", "skill2"],
          "emergingRoles": ["role1", "role2"],
          "salaryTrends": {
            "direction": "increasing/stable/decreasing",
            "percentage": "change percentage",
            "factors": ["factor1", "factor2"]
          },
          "remoteWorkTrends": "analysis of remote work trends",
          "industryOutlook": "overall industry outlook"
        },
        "recommendations": [
          {
            "action": "what to do",
            "reason": "why it's important",
            "timeline": "when to act"
          }
        ]
      }
      
      Only return the JSON object.
      `;

      console.log(`📈 Analyzing market trends for: ${field}`);
      const response = await aiService.generateWithVertexAI(prompt, { temperature: 0.5, maxOutputTokens: 1536 });
      const trends = JSON.parse(response);
      await aiService.storeAnalysis('market_trends', req.user?.uid, { field }, trends, { feature: 'market_trends' });

      res.json({
        success: true,
        message: 'Market trends analysis completed',
        data: {
          field,
          trends: trends.trends || {},
          recommendations: trends.recommendations || [],
          generatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('❌ Market trends analysis error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to analyze market trends',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }
}

module.exports = AIController;
