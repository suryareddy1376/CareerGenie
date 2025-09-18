/**
 * Resume Controller for CareerGenie
 * Enhanced with comprehensive AI-powered features and Supabase integration
 */

const resumeService = require('../services/resumeService');
const SupabaseService = require('../services/supabaseService');
const { validationResult } = require('express-validator');

class ResumeController {
  /**
   * Parse uploaded resume file
   * POST /api/resume/parse
   */
  static async parseResume(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { buffer, originalname } = req.file;
      const userId = req.user.uid;

      console.log(`📤 Parsing resume: ${originalname} for user: ${userId}`);

      // Parse resume with enhanced AI
      const parsedResume = await resumeService.parseResumeFile(
        buffer,
        originalname,
        userId
      );

      // Store structured data in Supabase
      if (parsedResume.parsedData) {
        try {
          // Store resume record in Supabase
          await SupabaseService.createResume({
            userId,
            fileName: originalname,
            content: parsedResume.parsedData.rawText || '',
            parsedData: parsedResume.parsedData,
            fileUrl: parsedResume.fileUrl,
            metadata: parsedResume.metadata
          });

          // Store structured education data
          if (parsedResume.parsedData.education && Array.isArray(parsedResume.parsedData.education)) {
            for (const edu of parsedResume.parsedData.education) {
              await SupabaseService.createEducation(userId, {
                institution: edu.institution || edu.school || '',
                degree: edu.degree || '',
                fieldOfStudy: edu.fieldOfStudy || edu.field || '',
                startDate: edu.startDate || null,
                endDate: edu.endDate || null,
                gpa: edu.gpa || null,
                description: edu.description || ''
              });
            }
          }

          // Store structured experience data
          if (parsedResume.parsedData.experience && Array.isArray(parsedResume.parsedData.experience)) {
            for (const exp of parsedResume.parsedData.experience) {
              await SupabaseService.createExperience(userId, {
                company: exp.company || '',
                position: exp.position || exp.title || '',
                startDate: exp.startDate || null,
                endDate: exp.endDate || null,
                description: exp.description || '',
                achievements: exp.achievements || [],
                location: exp.location || ''
              });
            }
          }

          // Store skills data
          if (parsedResume.parsedData.skills && Array.isArray(parsedResume.parsedData.skills)) {
            for (const skill of parsedResume.parsedData.skills) {
              await SupabaseService.createSkill(userId, {
                name: typeof skill === 'string' ? skill : skill.name,
                category: skill.category || 'Technical',
                level: skill.level || 'Intermediate',
                yearsOfExperience: skill.years || 0
              });
            }
          }

          console.log('✅ Structured data stored in Supabase');
        } catch (supabaseError) {
          console.warn('⚠️ Supabase storage error:', supabaseError.message);
          // Don't fail the entire request if Supabase storage fails
        }
      }

      console.log('✅ Resume parsed successfully');

      res.status(200).json({
        success: true,
        message: 'Resume parsed successfully',
        data: {
          id: parsedResume.id,
          fileName: parsedResume.fileName,
          parsedData: parsedResume.parsedData,
          metadata: parsedResume.metadata,
          uploadedAt: parsedResume.uploadedAt
        }
      });
    } catch (error) {
      console.error('❌ Resume parsing error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to parse resume',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get user's resume data
   * GET /api/resume
   */
  static async getResume(req, res) {
    try {
      const userId = req.user.uid;

      console.log(`📋 Fetching resume for user: ${userId}`);

      const resume = await resumeService.getUserResume(userId);

      if (!resume) {
        return res.status(404).json({
          success: false,
          message: 'No resume found for this user'
        });
      }

      console.log('✅ Resume fetched successfully');

      res.status(200).json({
        success: true,
        message: 'Resume fetched successfully',
        data: {
          id: resume.id,
          fileName: resume.fileName,
          parsedData: resume.parsedData,
          metadata: resume.metadata,
          uploadedAt: resume.uploadedAt,
          status: resume.status
        }
      });
    } catch (error) {
      console.error('❌ Resume fetch error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch resume',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get all user's resumes
   * GET /api/resume/all
   */
  static async getAllResumes(req, res) {
    try {
      const userId = req.user.uid;
      const limit = parseInt(req.query.limit) || 10;

      console.log(`📋 Fetching all resumes for user: ${userId}`);

      const resumes = await resumeService.getUserResumes(userId, limit);

      console.log('✅ Resumes fetched successfully');

      res.status(200).json({
        success: true,
        message: 'Resumes fetched successfully',
        data: resumes.map(resume => ({
          id: resume.id,
          fileName: resume.fileName,
          uploadedAt: resume.uploadedAt,
          status: resume.status,
          metadata: resume.metadata
        })),
        count: resumes.length
      });
    } catch (error) {
      console.error('❌ Resumes fetch error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch resumes',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Delete user's resume
   * DELETE /api/resume/:id
   */
  static async deleteResume(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.uid;

      console.log(`🗑️ Deleting resume: ${id} for user: ${userId}`);

      const result = await resumeService.deleteResume(userId, id);

      console.log('✅ Resume deleted successfully');

      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('❌ Resume deletion error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete resume',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Build resume from profile data
   * POST /api/resume/build
   */
  static async buildResume(req, res) {
    try {
      const { template = 'professional' } = req.body;
      const userId = req.user.uid;

      console.log(`🔨 Building resume for user: ${userId} with template: ${template}`);

      const generatedResume = await resumeService.buildResumeFromProfile(userId, template);

      console.log('✅ Resume built successfully');

      res.status(200).json({
        success: true,
        message: 'Resume built successfully',
        data: {
          id: generatedResume.id,
          template: generatedResume.template,
          sections: generatedResume.sections,
          formatting: generatedResume.formatting,
          generatedAt: generatedResume.generatedAt
        }
      });
    } catch (error) {
      console.error('❌ Resume building error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to build resume',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Analyze skill gaps
   * POST /api/resume/skill-gaps
   */
  static async analyzeSkillGaps(req, res) {
    try {
      const { targetRole } = req.body;
      const userId = req.user.uid;

      if (!targetRole) {
        return res.status(400).json({
          success: false,
          message: 'Target role is required'
        });
      }

      console.log(`📊 Analyzing skill gaps for user: ${userId}, target role: ${targetRole}`);

      const skillGapAnalysis = await resumeService.analyzeSkillGaps(userId, targetRole);

      console.log('✅ Skill gap analysis completed');

      res.status(200).json({
        success: true,
        message: 'Skill gap analysis completed',
        data: {
          id: skillGapAnalysis.id,
          targetRole: skillGapAnalysis.targetRole,
          skillGaps: skillGapAnalysis.skillGaps,
          currentSkills: skillGapAnalysis.currentSkills,
          analyzedAt: skillGapAnalysis.analyzedAt
        }
      });
    } catch (error) {
      console.error('❌ Skill gap analysis error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to analyze skill gaps',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Generate career roadmap
   * POST /api/resume/roadmap
   */
  static async generateRoadmap(req, res) {
    try {
      const { targetRole, timeframe = 12 } = req.body;
      const userId = req.user.uid;

      if (!targetRole) {
        return res.status(400).json({
          success: false,
          message: 'Target role is required'
        });
      }

      console.log(`🗺️ Generating roadmap for user: ${userId}, target role: ${targetRole}`);

      const roadmap = await resumeService.generateCareerRoadmap(userId, targetRole, timeframe);

      console.log('✅ Career roadmap generated');

      res.status(200).json({
        success: true,
        message: 'Career roadmap generated successfully',
        data: {
          id: roadmap.id,
          targetRole: roadmap.targetRole,
          timeframe: roadmap.timeframe,
          roadmap: roadmap.roadmap,
          generatedAt: roadmap.generatedAt
        }
      });
    } catch (error) {
      console.error('❌ Roadmap generation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate roadmap',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Chat with AI assistant
   * POST /api/resume/chat
   */
  static async chatWithAI(req, res) {
    try {
      const { message } = req.body;
      const userId = req.user.uid;

      if (!message) {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      console.log(`💬 AI chat for user: ${userId}`);

      const response = await resumeService.chatWithAI(userId, message);

      console.log('✅ AI response generated');

      res.status(200).json({
        success: true,
        message: 'AI response generated',
        data: {
          response: response.message,
          timestamp: response.timestamp
        }
      });
    } catch (error) {
      console.error('❌ AI chat error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to process AI chat',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Upload resume file to storage
   * POST /api/resume/upload
   */
  static async uploadResume(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const { buffer, originalname } = req.file;
      const userId = req.user.uid;

      console.log(`📤 Uploading resume file: ${originalname} for user: ${userId}`);

      const uploadResult = await resumeService.uploadResumeFile(
        buffer,
        originalname,
        userId
      );

      console.log('✅ File uploaded successfully');

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: uploadResult
      });
    } catch (error) {
      console.error('❌ File upload error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to upload file',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Get structured user profile data from Supabase
   * GET /api/resume/profile
   */
  static async getStructuredProfile(req, res) {
    try {
      const userId = req.user.uid;

      console.log(`📊 Fetching structured profile for user: ${userId}`);

      // Get all structured data from Supabase
      const [user, educations, experiences, skills, resumes] = await Promise.all([
        supabaseService.getUserById(userId),
        supabaseService.getUserEducations(userId),
        supabaseService.getUserExperiences(userId),
        supabaseService.getUserSkills(userId),
        supabaseService.getUserResumes(userId)
      ]);

      console.log('✅ Structured profile fetched successfully');

      res.status(200).json({
        success: true,
        message: 'Structured profile fetched successfully',
        data: {
          user: user || null,
          educations: educations || [],
          experiences: experiences || [],
          skills: skills || [],
          resumes: resumes || []
        }
      });
    } catch (error) {
      console.error('❌ Structured profile fetch error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch structured profile',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Update user profile data in Supabase
   * PUT /api/resume/profile
   */
  static async updateStructuredProfile(req, res) {
    try {
      const userId = req.user.uid;
      const { educations, experiences, skills, personalInfo } = req.body;

      console.log(`📝 Updating structured profile for user: ${userId}`);

      // Update user info if provided
      if (personalInfo) {
        await supabaseService.updateUser(userId, personalInfo);
      }

      // Update educations
      if (educations && Array.isArray(educations)) {
        for (const education of educations) {
          if (education.id) {
            await supabaseService.updateEducation(education.id, userId, education);
          } else {
            await supabaseService.createEducation(userId, education);
          }
        }
      }

      // Update experiences
      if (experiences && Array.isArray(experiences)) {
        for (const experience of experiences) {
          if (experience.id) {
            await supabaseService.updateExperience(experience.id, userId, experience);
          } else {
            await supabaseService.createExperience(userId, experience);
          }
        }
      }

      // Update skills
      if (skills && Array.isArray(skills)) {
        for (const skill of skills) {
          if (skill.id) {
            await supabaseService.updateSkill(skill.id, userId, skill);
          } else {
            await supabaseService.createSkill(userId, skill);
          }
        }
      }

      console.log('✅ Structured profile updated successfully');

      res.status(200).json({
        success: true,
        message: 'Structured profile updated successfully'
      });
    } catch (error) {
      console.error('❌ Structured profile update error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update structured profile',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

module.exports = ResumeController;
