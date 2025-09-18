const admin = require('firebase-admin');
const aiService = require('./aiService');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

class ResumeService {
  constructor() {
    this.db = admin.firestore();
    this.bucket = admin.storage().bucket();
  }

  /**
   * Parse resume file and extract structured data
   */
  async parseResumeFile(fileBuffer, fileName, userId) {
    try {
      console.log(`🔍 Parsing resume file: ${fileName} for user: ${userId}`);
      
      // Use enhanced AI service to parse resume content
      const parsedData = await aiService.parseResumeContent(fileBuffer, fileName);
      
      // Store parsed data in Firestore
      const resumeDoc = {
        userId,
        fileName,
        originalFileName: fileName,
        parsedData,
        fileSize: fileBuffer.length,
        uploadedAt: new Date().toISOString(),
        status: 'parsed',
        metadata: {
          contentType: this.getContentType(fileName),
          processingTime: Date.now(),
          extractedSections: Object.keys(parsedData).filter(key => 
            parsedData[key] && (Array.isArray(parsedData[key]) ? parsedData[key].length > 0 : parsedData[key])
          )
        }
      };

      // Save to Firestore
      const docRef = await this.db.collection('resumes').add(resumeDoc);
      
      console.log(`✅ Resume parsed and stored with ID: ${docRef.id}`);
      
      return {
        id: docRef.id,
        ...resumeDoc,
        parsedData
      };
    } catch (error) {
      console.error('❌ Resume parsing failed:', error);
      throw new Error(`Resume parsing failed: ${error.message}`);
    }
  }

  /**
   * Upload resume file to Firebase Storage
   */
  async uploadResumeFile(fileBuffer, fileName, userId) {
    try {
      console.log(`📤 Uploading resume file: ${fileName} for user: ${userId}`);
      
      const timestamp = Date.now();
      const fileExtension = path.extname(fileName);
      const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
      const storagePath = `resumes/${userId}/${timestamp}_${sanitizedFileName}`;

      // Upload to Firebase Storage
      const file = this.bucket.file(storagePath);
      await file.save(fileBuffer, {
        metadata: {
          contentType: this.getContentType(fileName),
          metadata: {
            originalName: fileName,
            uploadedBy: userId,
            uploadedAt: new Date().toISOString()
          }
        }
      });

      // Get download URL
      const [downloadURL] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500' // Long-lived URL
      });

      console.log(`✅ File uploaded successfully: ${storagePath}`);
      
      return {
        storagePath,
        downloadURL,
        fileName: sanitizedFileName,
        fileSize: fileBuffer.length
      };
    } catch (error) {
      console.error('❌ File upload failed:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  }

  /**
   * Get user's resume data
   */
  async getUserResume(userId) {
    try {
      console.log(`📋 Fetching resume for user: ${userId}`);
      
      const resumeQuery = await this.db
        .collection('resumes')
        .where('userId', '==', userId)
        .orderBy('uploadedAt', 'desc')
        .limit(1)
        .get();

      if (resumeQuery.empty) {
        return null;
      }

      const resumeDoc = resumeQuery.docs[0];
      const resumeData = {
        id: resumeDoc.id,
        ...resumeDoc.data()
      };

      console.log(`✅ Resume found for user: ${userId}`);
      return resumeData;
    } catch (error) {
      console.error('❌ Error fetching resume:', error);
      throw new Error(`Failed to fetch resume: ${error.message}`);
    }
  }

  /**
   * Get all resumes for a user
   */
  async getUserResumes(userId, limit = 10) {
    try {
      console.log(`📋 Fetching resumes for user: ${userId}`);
      
      const resumesQuery = await this.db
        .collection('resumes')
        .where('userId', '==', userId)
        .orderBy('uploadedAt', 'desc')
        .limit(limit)
        .get();

      const resumes = [];
      resumesQuery.forEach(doc => {
        resumes.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log(`✅ Found ${resumes.length} resumes for user: ${userId}`);
      return resumes;
    } catch (error) {
      console.error('❌ Error fetching resumes:', error);
      throw new Error(`Failed to fetch resumes: ${error.message}`);
    }
  }

  /**
   * Delete user's resume
   */
  async deleteResume(userId, resumeId) {
    try {
      console.log(`🗑️ Deleting resume: ${resumeId} for user: ${userId}`);
      
      // Get resume document
      const resumeDoc = await this.db.collection('resumes').doc(resumeId).get();
      
      if (!resumeDoc.exists) {
        throw new Error('Resume not found');
      }

      const resumeData = resumeDoc.data();
      
      // Verify ownership
      if (resumeData.userId !== userId) {
        throw new Error('Unauthorized: Resume does not belong to user');
      }

      // Delete from Storage if file exists
      if (resumeData.storagePath) {
        try {
          await this.bucket.file(resumeData.storagePath).delete();
          console.log(`📁 Storage file deleted: ${resumeData.storagePath}`);
        } catch (storageError) {
          console.warn(`⚠️ Storage file deletion failed: ${storageError.message}`);
        }
      }

      // Delete from Firestore
      await this.db.collection('resumes').doc(resumeId).delete();
      
      console.log(`✅ Resume deleted successfully: ${resumeId}`);
      return { success: true, message: 'Resume deleted successfully' };
    } catch (error) {
      console.error('❌ Error deleting resume:', error);
      throw new Error(`Failed to delete resume: ${error.message}`);
    }
  }

  /**
   * Build resume from user profile data
   */
  async buildResumeFromProfile(userId, template = 'professional') {
    try {
      console.log(`🔨 Building resume for user: ${userId} with template: ${template}`);
      
      // Get user's latest parsed resume data
      const userResume = await this.getUserResume(userId);
      
      if (!userResume || !userResume.parsedData) {
        throw new Error('No parsed resume data found. Please upload and parse a resume first.');
      }

      // Use AI service to generate resume
      const generatedResume = await aiService.generateResumeFromProfile(
        userResume.parsedData, 
        template
      );

      // Store generated resume
      const resumeDoc = {
        userId,
        type: 'generated',
        template,
        sections: generatedResume.sections,
        formatting: generatedResume.formatting,
        basedOnResumeId: userResume.id,
        generatedAt: generatedResume.generatedAt,
        status: 'ready'
      };

      const docRef = await this.db.collection('generated_resumes').add(resumeDoc);
      
      console.log(`✅ Resume built successfully with ID: ${docRef.id}`);
      
      return {
        id: docRef.id,
        ...resumeDoc
      };
    } catch (error) {
      console.error('❌ Resume building failed:', error);
      throw new Error(`Resume building failed: ${error.message}`);
    }
  }

  /**
   * Analyze skill gaps for career progression
   */
  async analyzeSkillGaps(userId, targetRole) {
    try {
      console.log(`📊 Analyzing skill gaps for user: ${userId}, target role: ${targetRole}`);
      
      // Get user's resume data
      const userResume = await this.getUserResume(userId);
      
      if (!userResume || !userResume.parsedData) {
        throw new Error('No resume data found for skill gap analysis');
      }

      // Use AI service to analyze skill gaps
      const skillGaps = await aiService.analyzeSkillGaps(
        userResume.parsedData, 
        targetRole
      );

      // Store analysis results
      const analysisDoc = {
        userId,
        targetRole,
        currentSkills: userResume.parsedData.skills,
        skillGaps,
        basedOnResumeId: userResume.id,
        analyzedAt: new Date().toISOString()
      };

      const docRef = await this.db.collection('skill_analyses').add(analysisDoc);
      
      console.log(`✅ Skill gap analysis completed with ID: ${docRef.id}`);
      
      return {
        id: docRef.id,
        ...analysisDoc
      };
    } catch (error) {
      console.error('❌ Skill gap analysis failed:', error);
      throw new Error(`Skill gap analysis failed: ${error.message}`);
    }
  }

  /**
   * Generate career roadmap
   */
  async generateCareerRoadmap(userId, targetRole, timeframe = 12) {
    try {
      console.log(`🗺️ Generating career roadmap for user: ${userId}, target role: ${targetRole}`);
      
      // Get user's resume data
      const userResume = await this.getUserResume(userId);
      
      if (!userResume || !userResume.parsedData) {
        throw new Error('No resume data found for roadmap generation');
      }

      // Use AI service to generate roadmap
      const roadmap = await aiService.generateCareerRoadmap(
        userResume.parsedData,
        targetRole,
        timeframe
      );

      // Store roadmap
      const roadmapDoc = {
        userId,
        targetRole,
        timeframe,
        roadmap,
        currentProfile: userResume.parsedData,
        basedOnResumeId: userResume.id,
        generatedAt: new Date().toISOString(),
        status: 'active'
      };

      const docRef = await this.db.collection('career_roadmaps').add(roadmapDoc);
      
      console.log(`✅ Career roadmap generated with ID: ${docRef.id}`);
      
      return {
        id: docRef.id,
        ...roadmapDoc
      };
    } catch (error) {
      console.error('❌ Career roadmap generation failed:', error);
      throw new Error(`Career roadmap generation failed: ${error.message}`);
    }
  }

  /**
   * Chat with AI about career guidance
   */
  async chatWithAI(userId, message) {
    try {
      console.log(`💬 AI chat for user: ${userId}`);
      
      // Get user context
      const userResume = await this.getUserResume(userId);
      const context = {
        userProfile: userResume?.parsedData || null,
        userId
      };

      // Use AI service for chat
      const response = await aiService.chatWithAI(message, context);

      // Store chat history
      const chatDoc = {
        userId,
        message,
        response: response.message,
        context: response.context,
        timestamp: response.timestamp
      };

      await this.db.collection('ai_chat_history').add(chatDoc);
      
      console.log(`✅ AI chat response generated`);
      return response;
    } catch (error) {
      console.error('❌ AI chat failed:', error);
      throw new Error(`AI chat failed: ${error.message}`);
    }
  }

  /**
   * Helper method to determine content type
   */
  getContentType(fileName) {
    const extension = path.extname(fileName).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.txt': 'text/plain'
    };
    return contentTypes[extension] || 'application/octet-stream';
  }

  /**
   * Get multer upload middleware
   */
  getUploadMiddleware() {
    return upload.single('resume');
  }
}

module.exports = new ResumeService();
