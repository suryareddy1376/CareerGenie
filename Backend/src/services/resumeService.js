/**
 * Resume Service for CareerGenie
 * Handles resume processing and AI integration
 */

const { db, storage } = require('../config/firebase');
const aiService = require('./aiService');
const { v4: uuidv4 } = require('uuid');

class ResumeService {
  /**
   * Parse resume file and extract data
   */
  static async parseResumeFile(buffer, fileName, userId) {
    try {
      console.log(`📄 Parsing resume file: ${fileName}`);
      
      // Parse resume content using AI service
      const parsedData = await aiService.parseResumeContent(buffer, fileName);
      
      // Generate unique ID for this resume
      const resumeId = uuidv4();
      
      // Upload file to Firebase Storage
      const fileRef = storage.file(`resumes/${userId}/${resumeId}/${fileName}`);
      await fileRef.save(buffer, {
        metadata: {
          contentType: this.getContentType(fileName),
          metadata: {
            userId,
            originalName: fileName,
            uploadedAt: new Date().toISOString()
          }
        }
      });
      
      const fileUrl = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year
      });

      // Store resume data in Firestore
      const resumeDoc = {
        id: resumeId,
        userId,
        fileName,
        fileUrl: fileUrl[0],
        parsedData,
        metadata: {
          fileSize: buffer.length,
          contentType: this.getContentType(fileName),
          processingMethod: parsedData.processingMethod || 'basic',
          confidence: parsedData.confidence || 0.7
        },
        uploadedAt: new Date(),
        status: 'processed'
      };

      await db.collection('resumes').doc(resumeId).set(resumeDoc);
      
      console.log('✅ Resume processed and stored successfully');
      
      return {
        id: resumeId,
        fileName,
        fileUrl: fileUrl[0],
        parsedData,
        metadata: resumeDoc.metadata,
        uploadedAt: resumeDoc.uploadedAt.toISOString()
      };
    } catch (error) {
      console.error('❌ Resume parsing error:', error);
      throw new Error(`Failed to parse resume: ${error.message}`);
    }
  }

  /**
   * Get user's resume data
   */
  static async getUserResume(userId) {
    try {
      const snapshot = await db.collection('resumes')
        .where('userId', '==', userId)
        .orderBy('uploadedAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      
      return {
        id: data.id,
        fileName: data.fileName,
        parsedData: data.parsedData,
        metadata: data.metadata,
        uploadedAt: data.uploadedAt.toISOString(),
        status: data.status
      };
    } catch (error) {
      console.error('❌ Get resume error:', error);
      throw new Error(`Failed to get resume: ${error.message}`);
    }
  }

  /**
   * Get all user's resumes
   */
  static async getUserResumes(userId, limit = 10) {
    try {
      const snapshot = await db.collection('resumes')
        .where('userId', '==', userId)
        .orderBy('uploadedAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: data.id,
          fileName: data.fileName,
          uploadedAt: data.uploadedAt.toISOString(),
          status: data.status,
          metadata: data.metadata
        };
      });
    } catch (error) {
      console.error('❌ Get resumes error:', error);
      throw new Error(`Failed to get resumes: ${error.message}`);
    }
  }

  /**
   * Delete user's resume
   */
  static async deleteResume(userId, resumeId) {
    try {
      // Get resume document
      const resumeDoc = await db.collection('resumes').doc(resumeId).get();
      
      if (!resumeDoc.exists) {
        throw new Error('Resume not found');
      }

      const resumeData = resumeDoc.data();
      
      // Verify ownership
      if (resumeData.userId !== userId) {
        throw new Error('Unauthorized to delete this resume');
      }

      // Delete file from storage
      try {
        const fileRef = storage.file(`resumes/${userId}/${resumeId}/${resumeData.fileName}`);
        await fileRef.delete();
      } catch (storageError) {
        console.warn('⚠️ Storage file deletion failed:', storageError.message);
      }

      // Delete document from Firestore
      await db.collection('resumes').doc(resumeId).delete();
      
      console.log('✅ Resume deleted successfully');
      
      return {
        message: 'Resume deleted successfully'
      };
    } catch (error) {
      console.error('❌ Delete resume error:', error);
      throw new Error(`Failed to delete resume: ${error.message}`);
    }
  }

  /**
   * Build resume from profile data
   */
  static async buildResumeFromProfile(userId, template = 'professional') {
    try {
      // Get user profile data
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new Error('User profile not found');
      }

      const userProfile = userDoc.data();
      
      // Generate resume using AI service
      const generatedResume = await aiService.generateResumeFromProfile(userProfile, template);
      
      // Store generated resume
      const resumeId = uuidv4();
      const resumeDoc = {
        id: resumeId,
        userId,
        fileName: `generated-resume-${template}.json`,
        template,
        sections: generatedResume.sections,
        formatting: generatedResume.formatting,
        generatedAt: new Date(),
        status: 'generated',
        type: 'generated'
      };

      await db.collection('resumes').doc(resumeId).set(resumeDoc);
      
      console.log('✅ Resume built successfully');
      
      return {
        id: resumeId,
        template,
        sections: generatedResume.sections,
        formatting: generatedResume.formatting,
        generatedAt: resumeDoc.generatedAt.toISOString()
      };
    } catch (error) {
      console.error('❌ Build resume error:', error);
      throw new Error(`Failed to build resume: ${error.message}`);
    }
  }

  /**
   * Analyze skill gaps
   */
  static async analyzeSkillGaps(userId, targetRole) {
    try {
      // Get user profile
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new Error('User profile not found');
      }

      const userProfile = userDoc.data();
      
      // Analyze skill gaps using AI service
      const skillGaps = await aiService.analyzeSkillGaps(userProfile, targetRole);
      
      // Store analysis results
      const analysisId = uuidv4();
      const analysisDoc = {
        id: analysisId,
        userId,
        targetRole,
        skillGaps,
        currentSkills: userProfile.skills || [],
        analyzedAt: new Date(),
        type: 'skill-gap-analysis'
      };

      await db.collection('analyses').doc(analysisId).set(analysisDoc);
      
      console.log('✅ Skill gap analysis completed');
      
      return {
        id: analysisId,
        targetRole,
        skillGaps,
        currentSkills: userProfile.skills || [],
        analyzedAt: analysisDoc.analyzedAt.toISOString()
      };
    } catch (error) {
      console.error('❌ Skill gap analysis error:', error);
      throw new Error(`Failed to analyze skill gaps: ${error.message}`);
    }
  }

  /**
   * Generate career roadmap
   */
  static async generateCareerRoadmap(userId, targetRole, timeframe = 12) {
    try {
      // Get user profile
      const userDoc = await db.collection('users').doc(userId).get();
      
      if (!userDoc.exists) {
        throw new Error('User profile not found');
      }

      const userProfile = userDoc.data();
      
      // Generate roadmap using AI service
      const roadmap = await aiService.generateCareerRoadmap(userProfile, targetRole, timeframe);
      
      // Store roadmap
      const roadmapId = uuidv4();
      const roadmapDoc = {
        id: roadmapId,
        userId,
        targetRole,
        timeframe: `${timeframe} months`,
        roadmap,
        generatedAt: new Date(),
        type: 'career-roadmap'
      };

      await db.collection('roadmaps').doc(roadmapId).set(roadmapDoc);
      
      console.log('✅ Career roadmap generated');
      
      return {
        id: roadmapId,
        targetRole,
        timeframe: roadmapDoc.timeframe,
        roadmap,
        generatedAt: roadmapDoc.generatedAt.toISOString()
      };
    } catch (error) {
      console.error('❌ Roadmap generation error:', error);
      throw new Error(`Failed to generate roadmap: ${error.message}`);
    }
  }

  /**
   * Chat with AI assistant
   */
  static async chatWithAI(userId, message) {
    try {
      // Get user context
      const userDoc = await db.collection('users').doc(userId).get();
      const userProfile = userDoc.exists ? userDoc.data() : {};
      
      // Chat with AI service
      const response = await aiService.chatWithAI(message, { userId, userProfile });
      
      // Store chat history
      const chatId = uuidv4();
      const chatDoc = {
        id: chatId,
        userId,
        message,
        response: response.message,
        timestamp: new Date(),
        type: 'ai-chat'
      };

      await db.collection('chats').doc(chatId).set(chatDoc);
      
      console.log('✅ AI chat completed');
      
      return response;
    } catch (error) {
      console.error('❌ AI chat error:', error);
      throw new Error(`Failed to process AI chat: ${error.message}`);
    }
  }

  /**
   * Upload resume file to storage
   */
  static async uploadResumeFile(buffer, fileName, userId) {
    try {
      const fileId = uuidv4();
      const fileRef = storage.file(`resumes/${userId}/${fileId}/${fileName}`);
      
      await fileRef.save(buffer, {
        metadata: {
          contentType: this.getContentType(fileName),
          metadata: {
            userId,
            originalName: fileName,
            uploadedAt: new Date().toISOString()
          }
        }
      });
      
      const fileUrl = await fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000 // 1 year
      });

      return {
        fileId,
        fileName,
        fileUrl: fileUrl[0],
        uploadedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ File upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Get content type from file name
   */
  static getContentType(fileName) {
    const ext = fileName.toLowerCase().split('.').pop();
    const contentTypes = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain'
    };
    return contentTypes[ext] || 'application/octet-stream';
  }
}

module.exports = ResumeService;