import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AIService from '../services/aiService';
import { Briefcase, TrendingUp, Clock, DollarSign, Star, ChevronRight } from 'lucide-react';

const CareerRecommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resumeData, setResumeData] = useState(null);
  const [preferences, setPreferences] = useState({
    preferredIndustries: [],
    salaryRange: { min: 50000, max: 150000 },
    remoteWork: false,
    careerLevel: 'mid'
  });

  const { user } = useAuth();

  const generateRecommendations = async () => {
    if (!resumeData) {
      setError('Please upload and parse your resume first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await AIService.getCareerRecommendations(resumeData, preferences);
      setRecommendations(result.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load existing resume data from localStorage or API
    const savedResumeData = localStorage.getItem('parsedResumeData');
    if (savedResumeData) {
      setResumeData(JSON.parse(savedResumeData));
    }
  }, []);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'high': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Career Recommendations
          </h1>
          <p className="text-gray-600">
            Get personalized career suggestions based on your skills and preferences
          </p>
        </div>

        {/* Preferences Section */}
        <div className="p-6 border-b bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Customize Your Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Career Level
              </label>
              <select
                value={preferences.careerLevel}
                onChange={(e) => setPreferences({...preferences, careerLevel: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Salary ($)
              </label>
              <input
                type="number"
                value={preferences.salaryRange.min}
                onChange={(e) => setPreferences({
                  ...preferences, 
                  salaryRange: {...preferences.salaryRange, min: parseInt(e.target.value)}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Salary ($)
              </label>
              <input
                type="number"
                value={preferences.salaryRange.max}
                onChange={(e) => setPreferences({
                  ...preferences, 
                  salaryRange: {...preferences.salaryRange, max: parseInt(e.target.value)}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={preferences.remoteWork}
                  onChange={(e) => setPreferences({...preferences, remoteWork: e.target.checked})}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Remote Work Preferred</span>
              </label>
            </div>
          </div>

          <button
            onClick={generateRecommendations}
            disabled={loading || !resumeData}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Recommendations...
              </>
            ) : (
              <>
                <Briefcase className="h-4 w-4 mr-2" />
                Get AI Recommendations
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

        {/* Recommendations Display */}
        {recommendations && (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Your Personalized Recommendations</h2>
            
            {/* Overall Analysis */}
            {recommendations.analysis && (
              <div className="mb-8 p-6 bg-blue-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Overall Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Your Strengths</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {recommendations.analysis.strengths?.map((strength, index) => (
                        <li key={index} className="flex items-center">
                          <Star className="h-3 w-3 text-yellow-500 mr-1" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Areas to Improve</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {recommendations.analysis.improvementAreas?.map((area, index) => (
                        <li key={index} className="flex items-center">
                          <TrendingUp className="h-3 w-3 text-blue-500 mr-1" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Market Insights</h4>
                    <p className="text-sm text-gray-600">{recommendations.analysis.marketTrends}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.recommendations?.map((rec, index) => (
                <div key={index} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{rec.title}</h3>
                      <p className="text-gray-600">{rec.company}</p>
                    </div>
                    <div className="flex items-center bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                      {rec.matchScore}% Match
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{rec.reasoning}</p>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Required Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {rec.requiredSkills?.slice(0, 5).map((skill, skillIndex) => (
                          <span key={skillIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {rec.missingSkills && rec.missingSkills.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Skills to Develop</h4>
                        <div className="flex flex-wrap gap-1">
                          {rec.missingSkills.slice(0, 3).map((skill, skillIndex) => (
                            <span key={skillIndex} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-1" />
                        ${rec.salaryRange?.min?.toLocaleString()} - ${rec.salaryRange?.max?.toLocaleString()}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(rec.growthPotential)}`}>
                        {rec.growthPotential} Growth
                      </div>
                    </div>

                    {rec.learningPath && rec.learningPath.length > 0 && (
                      <div className="pt-3 border-t">
                        <h4 className="font-medium text-gray-900 mb-2">Learning Path</h4>
                        <ol className="text-sm text-gray-600 space-y-1">
                          {rec.learningPath.slice(0, 3).map((step, stepIndex) => (
                            <li key={stepIndex} className="flex items-center">
                              <span className="w-4 h-4 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center justify-center mr-2">
                                {stepIndex + 1}
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>

                  <button className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md flex items-center justify-center transition-colors">
                    View Details
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              ))}
            </div>

            {(!recommendations.recommendations || recommendations.recommendations.length === 0) && (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recommendations generated yet. Try adjusting your preferences.</p>
              </div>
            )}
          </div>
        )}

        {/* No Resume Data Message */}
        {!resumeData && (
          <div className="p-6 text-center">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800">
                Please upload and parse your resume first to get personalized recommendations.
              </p>
              <button
                onClick={() => window.location.href = '/upload-resume'}
                className="mt-2 text-blue-600 hover:text-blue-800 underline"
              >
                Upload Resume Now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerRecommendations;
