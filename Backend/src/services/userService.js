/**
 * User Service for CareerGenie
 * Handles user-related operations like avatar upload, account deletion, etc.
 */

const admin = require('firebase-admin');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class UserService {
  /**
   * Get multer middleware for avatar upload
   */
  static getAvatarUploadMiddleware() {
    const storage = multer.memoryStorage();
    
    return multer({
      storage,
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
        }
      }
    }).single('avatar');
  }

  /**
   * Upload user avatar to Firebase Storage
   */
  static async uploadAvatar(userId, file) {
    try {
      const bucket = admin.storage().bucket();
      const fileName = `avatars/${userId}/${uuidv4()}_${Date.now()}${path.extname(file.originalname)}`;
      const fileUpload = bucket.file(fileName);

      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
          cacheControl: 'public, max-age=31536000', // 1 year cache
        }
      });

      return new Promise((resolve, reject) => {
        stream.on('error', (error) => {
          console.error('Avatar upload error:', error);
          reject(new Error('Failed to upload avatar'));
        });

        stream.on('finish', async () => {
          try {
            // Make file publicly readable
            await fileUpload.makePublic();
            
            // Get public URL
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            resolve(publicUrl);
          } catch (error) {
            console.error('Error making avatar public:', error);
            reject(new Error('Failed to make avatar public'));
          }
        });

        stream.end(file.buffer);
      });
    } catch (error) {
      console.error('Upload avatar error:', error);
      throw new Error('Failed to upload avatar');
    }
  }

  /**
   * Delete user account and all associated data
   */
  static async deleteUserAccount(userId) {
    try {
      const batch = admin.firestore().batch();

      // Delete user profile
      const userRef = admin.firestore().collection('users').doc(userId);
      batch.delete(userRef);

      // Delete all user resumes
      const resumesSnapshot = await admin.firestore()
        .collection('resumes')
        .where('userId', '==', userId)
        .get();

      resumesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete all user skill gap analyses
      const skillGapsSnapshot = await admin.firestore()
        .collection('skillGaps')
        .where('userId', '==', userId)
        .get();

      skillGapsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete all user career roadmaps
      const roadmapsSnapshot = await admin.firestore()
        .collection('roadmaps')
        .where('userId', '==', userId)
        .get();

      roadmapsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Delete all user chat sessions
      const chatSessionsSnapshot = await admin.firestore()
        .collection('chatSessions')
        .where('userId', '==', userId)
        .get();

      chatSessionsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Commit batch delete
      await batch.commit();

      // Delete user files from Storage
      await this.deleteUserFiles(userId);

      // Delete user from Firebase Auth
      await admin.auth().deleteUser(userId);

      return true;
    } catch (error) {
      console.error('Delete user account error:', error);
      throw new Error('Failed to delete user account');
    }
  }

  /**
   * Delete all user files from Firebase Storage
   */
  static async deleteUserFiles(userId) {
    try {
      const bucket = admin.storage().bucket();
      
      // Delete avatar files
      const [avatarFiles] = await bucket.getFiles({
        prefix: `avatars/${userId}/`
      });

      // Delete resume files
      const [resumeFiles] = await bucket.getFiles({
        prefix: `resumes/${userId}/`
      });

      // Delete all files
      const allFiles = [...avatarFiles, ...resumeFiles];
      
      for (const file of allFiles) {
        try {
          await file.delete();
          console.log(`Deleted file: ${file.name}`);
        } catch (error) {
          console.error(`Failed to delete file ${file.name}:`, error);
        }
      }

      return true;
    } catch (error) {
      console.error('Delete user files error:', error);
      // Don't throw error - files deletion is not critical
      return false;
    }
  }

  /**
   * Get user subscription details
   */
  static async getSubscription(userId) {
    try {
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userData = userDoc.data();
      return userData.subscription || {
        plan: 'free',
        status: 'active',
        expiresAt: null
      };
    } catch (error) {
      console.error('Get subscription error:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId) {
    try {
      // Get resume count
      const resumesSnapshot = await admin.firestore()
        .collection('resumes')
        .where('userId', '==', userId)
        .get();

      // Get skill gap analyses count
      const skillGapsSnapshot = await admin.firestore()
        .collection('skillGaps')
        .where('userId', '==', userId)
        .get();

      // Get career roadmaps count
      const roadmapsSnapshot = await admin.firestore()
        .collection('roadmaps')
        .where('userId', '==', userId)
        .get();

      // Get chat sessions count
      const chatSessionsSnapshot = await admin.firestore()
        .collection('chatSessions')
        .where('userId', '==', userId)
        .get();

      // Get most recent activity
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get();

      const userData = userDoc.exists ? userDoc.data() : {};

      return {
        resumesCount: resumesSnapshot.size,
        skillGapAnalysesCount: skillGapsSnapshot.size,
        careerRoadmapsCount: roadmapsSnapshot.size,
        chatSessionsCount: chatSessionsSnapshot.size,
        lastLoginAt: userData.lastLoginAt,
        createdAt: userData.createdAt,
        subscription: userData.subscription || {
          plan: 'free',
          status: 'active',
          expiresAt: null
        }
      };
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  }

  /**
   * Update user subscription
   */
  static async updateSubscription(userId, subscriptionData) {
    try {
      const updateData = {
        'subscription.plan': subscriptionData.plan,
        'subscription.status': subscriptionData.status,
        'subscription.expiresAt': subscriptionData.expiresAt,
        'subscription.updatedAt': admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update(updateData);

      return await this.getSubscription(userId);
    } catch (error) {
      console.error('Update subscription error:', error);
      throw error;
    }
  }
}

module.exports = UserService;
