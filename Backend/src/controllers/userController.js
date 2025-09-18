/**
 * User Controller for CareerGenie
 */

const { validationResult } = require('express-validator');
const AuthService = require('../services/authService');
const UserService = require('../services/userService');

class UserController {
  /**
   * Get user profile
   */
  static async getProfile(req, res) {
    try {
      const userId = req.user.uid;
      const profile = await AuthService.getUserProfile(userId);

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const userId = req.user.uid;
      const updates = req.body;

      // Filter out undefined values and prepare profile updates
      const profileUpdates = {};
      if (updates.fullName !== undefined) profileUpdates.fullName = updates.fullName;
      if (updates.bio !== undefined) profileUpdates['profile.bio'] = updates.bio;
      if (updates.location !== undefined) profileUpdates['profile.location'] = updates.location;
      if (updates.phone !== undefined) profileUpdates['profile.phone'] = updates.phone;

      const updatedProfile = await AuthService.updateUserProfile(userId, profileUpdates);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedProfile
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  /**
   * Upload user avatar
   */
  static async uploadAvatar(req, res) {
    try {
      const userId = req.user.uid;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      const avatarUrl = await UserService.uploadAvatar(userId, req.file);
      
      // Update user profile with avatar URL
      await AuthService.updateUserProfile(userId, {
        'profile.avatar': avatarUrl
      });

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: { avatarUrl }
      });
    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload avatar'
      });
    }
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const userId = req.user.uid;
      const preferences = req.body;

      // Prepare preference updates
      const preferenceUpdates = {};
      if (preferences.emailNotifications !== undefined) {
        preferenceUpdates['preferences.emailNotifications'] = preferences.emailNotifications;
      }
      if (preferences.pushNotifications !== undefined) {
        preferenceUpdates['preferences.pushNotifications'] = preferences.pushNotifications;
      }
      if (preferences.theme !== undefined) {
        preferenceUpdates['preferences.theme'] = preferences.theme;
      }

      const updatedProfile = await AuthService.updateUserProfile(userId, preferenceUpdates);

      res.json({
        success: true,
        message: 'Preferences updated successfully',
        data: updatedProfile.preferences
      });
    } catch (error) {
      console.error('Update preferences error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update preferences'
      });
    }
  }

  /**
   * Delete user account
   */
  static async deleteAccount(req, res) {
    try {
      const userId = req.user.uid;
      
      await UserService.deleteUserAccount(userId);

      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete account'
      });
    }
  }

  /**
   * Get user subscription details
   */
  static async getSubscription(req, res) {
    try {
      const userId = req.user.uid;
      const subscription = await UserService.getSubscription(userId);

      res.json({
        success: true,
        data: subscription
      });
    } catch (error) {
      console.error('Get subscription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get subscription details'
      });
    }
  }

  /**
   * Get user statistics
   */
  static async getStats(req, res) {
    try {
      const userId = req.user.uid;
      const stats = await UserService.getUserStats(userId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user statistics'
      });
    }
  }
}

module.exports = UserController;
