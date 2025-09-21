import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AIService from '../services/aiService';
import { Target, Clock, TrendingUp, BookOpen, CheckCircle, XCircle } from 'lucide-react';

const SkillGapAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentSkills, setCurrentSkills] = useState('');
  const [targetRole, setTargetRole] = useState('');

  const analyzeSkillGap = async () => {
    if (!currentSkills.trim() || !targetRole.trim()) {
      setError('Please enter both your current skills and target role');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const skillsArray = currentSkills.split(',').map(skill => skill.trim()).filter(skill => skill);
      const result = await AIService.analyzeSkillGap(skillsArray, targetRole);
      setAnalysis(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance?.toLowerCase()) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getReadinessColor = (percentage) => {
    const pct = parseInt(percentage);
    if (pct >= 80) return 'text-green-600 bg-green-100';
    if (pct >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Skill Gap Analysis
          </h1>
          <p className="text-gray-600">
            Identify skill gaps and get a personalized learning plan for your target role
          </p>
        </div>

        {/* Input Section */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Skills (comma-separated)
              </label>
              <textarea
                value={currentSkills}
                onChange={(e) => setCurrentSkills(e.target.value)}
                placeholder="e.g., JavaScript, React, Node.js, Python, SQL, Project Management"
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Role
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g., Senior Full Stack Developer, Data Scientist, Product Manager"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={analyzeSkillGap}
            disabled={loading}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Analyzing Skills...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Analyze Skill Gap
              </>
            )}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-6 border-b">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Skill Gap Analysis Results</h2>
            
            {/* Overall Readiness */}
            {analysis.gapAnalysis && (
              <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Overall Readiness</h3>
                  <div className={`px-4 py-2 rounded-full font-bold text-lg ${getReadinessColor(analysis.gapAnalysis.overallReadiness)}`}>
                    {analysis.gapAnalysis.overallReadiness}%
                  </div>
                </div>
                <p className="text-gray-700">{analysis.gapAnalysis.timelineEstimate}</p>
              </div>
            )}

            {/* Skills Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Matching Skills */}
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-semibold text-green-900">Matching Skills</h3>
                </div>
                <div className="space-y-2">
                  {analysis.gapAnalysis?.matchingSkills?.map((skill, index) => (
                    <div key={index} className="bg-white px-3 py-2 rounded-md text-sm">
                      {skill}
                    </div>
                  ))}
                  {(!analysis.gapAnalysis?.matchingSkills || analysis.gapAnalysis.matchingSkills.length === 0) && (
                    <p className="text-sm text-green-700">No directly matching skills identified</p>
                  )}
                </div>
              </div>

              {/* Transferable Skills */}
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="font-semibold text-blue-900">Transferable Skills</h3>
                </div>
                <div className="space-y-2">
                  {analysis.gapAnalysis?.transferableSkills?.map((skill, index) => (
                    <div key={index} className="bg-white px-3 py-2 rounded-md text-sm">
                      {skill}
                    </div>
                  ))}
                  {(!analysis.gapAnalysis?.transferableSkills || analysis.gapAnalysis.transferableSkills.length === 0) && (
                    <p className="text-sm text-blue-700">No transferable skills identified</p>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div className="bg-red-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <XCircle className="h-5 w-5 text-red-600 mr-2" />
                  <h3 className="font-semibold text-red-900">Skills to Develop</h3>
                </div>
                <div className="space-y-3">
                  {analysis.gapAnalysis?.missingSkills?.map((skillObj, index) => (
                    <div key={index} className="bg-white p-3 rounded-md">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{skillObj.skill}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImportanceColor(skillObj.importance)}`}>
                          {skillObj.importance}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {skillObj.timeToLearn}
                      </div>
                    </div>
                  ))}
                  {(!analysis.gapAnalysis?.missingSkills || analysis.gapAnalysis.missingSkills.length === 0) && (
                    <p className="text-sm text-red-700">No skill gaps identified</p>
                  )}
                </div>
              </div>
            </div>

            {/* Learning Plan */}
            {analysis.learningPlan && (
              <div className="bg-white border rounded-lg">
                <div className="p-6 border-b">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-purple-600 mr-2" />
                    <h3 className="text-xl font-semibold">Personalized Learning Plan</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                  {/* Phase 1 */}
                  {analysis.learningPlan.phase1 && (
                    <div className="border rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold mr-3">
                          1
                        </div>
                        <div>
                          <h4 className="font-semibold">Phase 1: Foundation</h4>
                          <p className="text-sm text-gray-600">{analysis.learningPlan.phase1.duration}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-medium mb-2">Skills to Focus On:</h5>
                        <div className="flex flex-wrap gap-2">
                          {analysis.learningPlan.phase1.skills?.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Recommended Resources:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {analysis.learningPlan.phase1.resources?.map((resource, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2"></div>
                              {resource}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Phase 2 */}
                  {analysis.learningPlan.phase2 && (
                    <div className="border rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center font-bold mr-3">
                          2
                        </div>
                        <div>
                          <h4 className="font-semibold">Phase 2: Advanced</h4>
                          <p className="text-sm text-gray-600">{analysis.learningPlan.phase2.duration}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h5 className="font-medium mb-2">Advanced Skills:</h5>
                        <div className="flex flex-wrap gap-2">
                          {analysis.learningPlan.phase2.skills?.map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium mb-2">Advanced Resources:</h5>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {analysis.learningPlan.phase2.resources?.map((resource, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-1 h-1 bg-gray-400 rounded-full mt-2 mr-2"></div>
                              {resource}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Start Learning Plan
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Find Courses
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                Save Analysis
              </button>
            </div>
          </div>
        )}

        {/* No Analysis Message */}
        {!analysis && !loading && (
          <div className="p-6 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              Enter your current skills and target role to get a personalized skill gap analysis
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillGapAnalysis;
