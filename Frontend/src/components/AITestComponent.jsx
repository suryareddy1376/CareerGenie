/**
 * AI Features Test Component
 * Tests all AI functionality with proper authentication
 */

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as aiService from '../services/aiService';
import toast from 'react-hot-toast';

const AITestComponent = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});

  const testResumeParsing = async () => {
    if (!currentUser) {
      toast.error('Please sign in to test AI features');
      return;
    }

    setLoading(true);
    try {
      console.log('Testing resume parsing...');
      const result = await aiService.parseResume(
        'John Doe\nSoftware Engineer\nExperience: 3 years in React, Node.js, Python\nEducation: BS Computer Science from State University\nSkills: JavaScript, React, Node.js, Python, SQL, MongoDB'
      );
      setResults(prev => ({ ...prev, resumeParsing: result }));
      toast.success('Resume parsing test completed!');
      console.log('Resume parsing result:', result);
    } catch (error) {
      console.error('Resume parsing test failed:', error);
      toast.error(`Resume parsing failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSkillGapAnalysis = async () => {
    if (!currentUser) {
      toast.error('Please sign in to test AI features');
      return;
    }

    setLoading(true);
    try {
      console.log('Testing skill gap analysis...');
      const result = await aiService.analyzeSkillGap({
        currentSkills: ['JavaScript', 'React', 'Node.js'],
        targetRole: 'Senior Full Stack Developer'
      });
      setResults(prev => ({ ...prev, skillGap: result }));
      toast.success('Skill gap analysis test completed!');
      console.log('Skill gap analysis result:', result);
    } catch (error) {
      console.error('Skill gap analysis test failed:', error);
      toast.error(`Skill gap analysis failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCoverLetterGeneration = async () => {
    if (!currentUser) {
      toast.error('Please sign in to test AI features');
      return;
    }

    setLoading(true);
    try {
      console.log('Testing cover letter generation...');
      const result = await aiService.generateCoverLetter({
        jobDescription: 'We are looking for a Senior React Developer to join our team. Requirements: 5+ years React experience, TypeScript, Node.js, AWS.',
        userProfile: {
          name: 'John Doe',
          skills: ['React', 'TypeScript', 'Node.js'],
          experience: '3 years as a Full Stack Developer'
        }
      });
      setResults(prev => ({ ...prev, coverLetter: result }));
      toast.success('Cover letter generation test completed!');
      console.log('Cover letter generation result:', result);
    } catch (error) {
      console.error('Cover letter generation test failed:', error);
      toast.error(`Cover letter generation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testInterviewQuestions = async () => {
    if (!currentUser) {
      toast.error('Please sign in to test AI features');
      return;
    }

    setLoading(true);
    try {
      console.log('Testing interview questions...');
      const result = await aiService.generateInterviewQuestions({
        jobRole: 'Full Stack Developer',
        experienceLevel: 'Mid-level'
      });
      setResults(prev => ({ ...prev, interviewQuestions: result }));
      toast.success('Interview questions generation test completed!');
      console.log('Interview questions result:', result);
    } catch (error) {
      console.error('Interview questions test failed:', error);
      toast.error(`Interview questions failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg">
        <h2 className="text-xl font-bold text-yellow-800 mb-4">Authentication Required</h2>
        <p className="text-yellow-700">Please sign in to test AI features.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-green-50 p-4 rounded-lg">
        <h2 className="text-xl font-bold text-green-800 mb-2">AI Features Test Dashboard</h2>
        <p className="text-green-700">User: {currentUser.email}</p>
        <p className="text-green-700">UID: {currentUser.uid}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={testResumeParsing}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white p-4 rounded-lg font-medium"
        >
          {loading ? 'Testing...' : 'Test Resume Parsing'}
        </button>

        <button
          onClick={testSkillGapAnalysis}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white p-4 rounded-lg font-medium"
        >
          {loading ? 'Testing...' : 'Test Skill Gap Analysis'}
        </button>

        <button
          onClick={testCoverLetterGeneration}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white p-4 rounded-lg font-medium"
        >
          {loading ? 'Testing...' : 'Test Cover Letter Generation'}
        </button>

        <button
          onClick={testInterviewQuestions}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white p-4 rounded-lg font-medium"
        >
          {loading ? 'Testing...' : 'Test Interview Questions'}
        </button>
      </div>

      {Object.keys(results).length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="text-xl font-bold text-gray-800">Test Results:</h3>
          
          {results.resumeParsing && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-bold text-blue-800">Resume Parsing:</h4>
              <pre className="text-sm text-blue-700 whitespace-pre-wrap mt-2">
                {JSON.stringify(results.resumeParsing, null, 2)}
              </pre>
            </div>
          )}

          {results.skillGap && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800">Skill Gap Analysis:</h4>
              <pre className="text-sm text-green-700 whitespace-pre-wrap mt-2">
                {JSON.stringify(results.skillGap, null, 2)}
              </pre>
            </div>
          )}

          {results.coverLetter && (
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-bold text-purple-800">Cover Letter Generation:</h4>
              <pre className="text-sm text-purple-700 whitespace-pre-wrap mt-2">
                {JSON.stringify(results.coverLetter, null, 2)}
              </pre>
            </div>
          )}

          {results.interviewQuestions && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-bold text-red-800">Interview Questions:</h4>
              <pre className="text-sm text-red-700 whitespace-pre-wrap mt-2">
                {JSON.stringify(results.interviewQuestions, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AITestComponent;
