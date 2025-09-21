import { useState } from 'react';
import AIService from '../services/aiService';
import { MessageSquare, HelpCircle, Clock, Star, ChevronDown, ChevronUp } from 'lucide-react';

const InterviewPreparation = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    jobTitle: '',
    experience: 'mid',
    skills: ''
  });
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const generateQuestions = async () => {
    if (!formData.jobTitle.trim()) {
      setError('Please enter a job title');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const skillsArray = formData.skills 
        ? formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
        : [];
      
      const result = await AIService.generateInterviewQuestions(
        formData.jobTitle,
        formData.experience,
        skillsArray
      );
      setQuestions(result.data.questions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'technical': return '💻';
      case 'behavioral': return '🧠';
      case 'situational': return '🎯';
      default: return '❓';
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'technical': return 'text-blue-600 bg-blue-100';
      case 'behavioral': return 'text-purple-600 bg-purple-100';
      case 'situational': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const toggleQuestion = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Interview Preparation
          </h1>
          <p className="text-gray-600">
            Get personalized interview questions based on your target role and experience
          </p>
        </div>

        {/* Input Section */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior Level (6-10 years)</option>
                <option value="lead">Lead/Principal (10+ years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Key Skills (optional)
              </label>
              <input
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                placeholder="e.g., React, Node.js, AWS"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={generateQuestions}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating Questions...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4 mr-2" />
                Generate Interview Questions
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

        {/* Questions Display */}
        {questions.length > 0 && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Interview Questions for {formData.jobTitle}</h2>
              <div className="text-sm text-gray-500">
                {questions.length} questions generated
              </div>
            </div>

            {/* Questions Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {questions.filter(q => q.category?.toLowerCase() === 'technical').length}
                </div>
                <div className="text-sm text-blue-600">Technical</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {questions.filter(q => q.category?.toLowerCase() === 'behavioral').length}
                </div>
                <div className="text-sm text-purple-600">Behavioral</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {questions.filter(q => q.category?.toLowerCase() === 'situational').length}
                </div>
                <div className="text-sm text-orange-600">Situational</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-red-600">
                  {questions.filter(q => q.difficulty?.toLowerCase() === 'hard').length}
                </div>
                <div className="text-sm text-red-600">Hard Level</div>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={index} className="border rounded-lg">
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleQuestion(index)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="text-lg mr-2">
                            {getCategoryIcon(question.category)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${getCategoryColor(question.category)}`}>
                            {question.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 pr-4">
                          {question.question}
                        </h3>
                      </div>
                      <div className="flex-shrink-0">
                        {expandedQuestion === index ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {expandedQuestion === index && (
                    <div className="px-4 pb-4 border-t bg-gray-50">
                      <div className="pt-4 space-y-4">
                        {question.keyPoints && question.keyPoints.length > 0 && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <Star className="h-4 w-4 text-yellow-500 mr-1" />
                              Key Points to Address
                            </h4>
                            <ul className="space-y-1">
                              {question.keyPoints.map((point, pointIndex) => (
                                <li key={pointIndex} className="flex items-start text-sm text-gray-700">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {question.sampleAnswer && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                              <HelpCircle className="h-4 w-4 text-green-500 mr-1" />
                              Sample Answer Guidance
                            </h4>
                            <p className="text-sm text-gray-700 bg-white p-3 rounded-md border">
                              {question.sampleAnswer}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            Recommended prep time: 2-3 minutes
                          </div>
                          <button className="text-xs text-blue-600 hover:text-blue-800">
                            Practice Answer
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Start Practice Session
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
                Save Questions
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Generate More
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                Export PDF
              </button>
            </div>
          </div>
        )}

        {/* No Questions Message */}
        {questions.length === 0 && !loading && (
          <div className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              Enter a job title to generate personalized interview questions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewPreparation;
