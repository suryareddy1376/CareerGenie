/**
 * AI Service for Frontend
 * Handles all AI-related API calls to the backend
 */

import axios from 'axios';
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const aiAPI = axios.create({
  baseURL: `${API_BASE_URL}/api/ai`,
  timeout: 60000, // AI operations can take time
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
aiAPI.interceptors.request.use(async (config) => {
  try {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
  }
  return config;
});

// Handle response errors
aiAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('AI API Error:', error);
    if (error.response?.status === 401) {
      console.error('Unauthorized request - user may need to login');
      // Don't redirect automatically, let components handle it
    }
    return Promise.reject(error);
  }
);

class AIService {
  /**
   * Generate career recommendations
   */
  static async getCareerRecommendations(resumeData, preferences = {}) {
    try {
      const response = await aiAPI.post('/recommendations', {
        resumeData,
        preferences
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get career recommendations');
    }
  }

  /**
   * Analyze skill gap for career transition
   */
  static async analyzeSkillGap(currentSkills, targetRole) {
    try {
      const response = await aiAPI.post('/skill-gap-analysis', {
        currentSkills,
        targetRole
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to analyze skill gap');
    }
  }

  /**
   * Enhanced resume analysis
   */
  static async analyzeResume(resumeText) {
    try {
      const response = await aiAPI.post('/analyze-resume', {
        text: resumeText
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to analyze resume');
    }
  }

  /**
   * Generate interview questions
   */
  static async generateInterviewQuestions(jobTitle, experience = '', skills = []) {
    try {
      const response = await aiAPI.post('/interview-questions', {
        jobTitle,
        experience,
        skills
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate interview questions');
    }
  }

  /**
   * Generate cover letter
   */
  static async generateCoverLetter(resumeData, jobDescription, companyName, jobTitle) {
    try {
      const response = await aiAPI.post('/cover-letter', {
        resumeData,
        jobDescription,
        companyName,
        jobTitle
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to generate cover letter');
    }
  }

  /**
   * Get market trends for specific field
   */
  static async getMarketTrends(field) {
    try {
      const response = await aiAPI.get(`/market-trends/${encodeURIComponent(field)}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get market trends');
    }
  }

  /**
   * Get AI service status
   */
  static async getServiceStatus() {
    try {
      const response = await aiAPI.get('/status');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to get service status');
    }
  }

  /**
   * Upload and parse resume (existing functionality)
   */
  static async parseResume(file) {
    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await axios.post(`${API_BASE_URL}/api/parseResume`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        timeout: 60000
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to parse resume');
    }
  }
}

export default AIService;
