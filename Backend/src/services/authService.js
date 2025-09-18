/**
 * Authentication Service for CareerGenie
 * Handles user registration, login, and Firebase authentication
 */

const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

class AuthService {
  /**
   * Register a new user
   */
  static async registerUser({ email, password, fullName }) {
    try {
      // Check if user already exists
      try {
        await admin.auth().getUserByEmail(email);
        throw new Error('User already exists with this email');
      } catch (error) {
        if (error.code !== 'auth/user-not-found') {
          throw error;
        }
        // User doesn't exist, proceed with registration
      }

      // Create user in Firebase Auth
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: fullName,
        emailVerified: false
      });

      // Create user profile in Firestore
      const userProfile = {
        uid: userRecord.uid,
        email: email,
        fullName: fullName,
        emailVerified: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        profile: {
          avatar: null,
          bio: null,
          location: null,
          phone: null
        },
        preferences: {
          emailNotifications: true,
          pushNotifications: true,
          theme: 'light'
        },
        subscription: {
          plan: 'free',
          status: 'active',
          expiresAt: null
        }
      };

      await admin.firestore()
        .collection('users')
        .doc(userRecord.uid)
        .set(userProfile);

      // Generate custom JWT token
      const customToken = await admin.auth().createCustomToken(userRecord.uid);

      // Send verification email (optional - can be implemented later)
      // await this.sendVerificationEmail(userRecord.uid);

      return {
        uid: userRecord.uid,
        email: email,
        fullName: fullName,
        customToken: customToken,
        emailVerified: false
      };

    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Login user
   */
  static async loginUser(email, password) {
    try {
      // Get user from Firebase Auth
      const userRecord = await admin.auth().getUserByEmail(email);
      
      // Get user profile from Firestore
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userRecord.uid)
        .get();

      if (!userDoc.exists) {
        throw new Error('User profile not found');
      }

      const userProfile = userDoc.data();

      // Generate custom JWT token
      const customToken = await admin.auth().createCustomToken(userRecord.uid);

      // Update last login
      await admin.firestore()
        .collection('users')
        .doc(userRecord.uid)
        .update({
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      return {
        uid: userRecord.uid,
        email: userRecord.email,
        fullName: userProfile.fullName,
        customToken: customToken,
        emailVerified: userRecord.emailVerified,
        profile: userProfile.profile,
        preferences: userProfile.preferences,
        subscription: userProfile.subscription
      };

    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        throw new Error('Invalid email or password');
      }
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Logout user (optional cleanup)
   */
  static async logoutUser(userId) {
    try {
      // Update last logout time
      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update({
          lastLogoutAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

      // Revoke all refresh tokens for the user (optional)
      await admin.auth().revokeRefreshTokens(userId);

      return true;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(email) {
    try {
      // Generate password reset link
      const resetLink = await admin.auth().generatePasswordResetLink(email, {
        url: process.env.FRONTEND_URL || 'http://localhost:3000',
        handleCodeInApp: true
      });

      // Here you would typically send an email
      // For now, we'll just log it or return it
      console.log('Password reset link:', resetLink);

      return { resetLink };
    } catch (error) {
      console.error('Password reset error:', error);
      if (error.code === 'auth/user-not-found') {
        // Don't reveal if user exists or not
        return { success: true };
      }
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token, newPassword) {
    try {
      // Firebase handles password reset via email link
      // This would typically be handled on the frontend
      // For backend implementation, you might use a custom token system
      throw new Error('Password reset should be handled via email link');
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token) {
    try {
      // Firebase handles email verification via email link
      // This would typically be handled on the frontend
      throw new Error('Email verification should be handled via email link');
    } catch (error) {
      console.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(userId) {
    try {
      // Generate new custom token
      const customToken = await admin.auth().createCustomToken(userId);

      // Get updated user data
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        throw new Error('User not found');
      }

      const userProfile = userDoc.data();

      return {
        uid: userId,
        customToken: customToken,
        profile: userProfile.profile,
        preferences: userProfile.preferences,
        subscription: userProfile.subscription
      };
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }

  /**
   * Verify Firebase ID token
   */
  static async verifyIdToken(idToken) {
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.error('Token verification error:', error);
      throw new Error('Invalid token');
    }
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId) {
    try {
      const userDoc = await admin.firestore()
        .collection('users')
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        throw new Error('User profile not found');
      }

      return userDoc.data();
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId, updates) {
    try {
      const updateData = {
        ...updates,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await admin.firestore()
        .collection('users')
        .doc(userId)
        .update(updateData);

      return await this.getUserProfile(userId);
    } catch (error) {
      console.error('Update user profile error:', error);
      throw error;
    }
  }
}

module.exports = AuthService;
