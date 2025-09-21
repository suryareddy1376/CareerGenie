import { useState } from 'react';
import AIService from '../services/aiService';
import { FileText, Download, Eye, Copy, Wand2, User, Briefcase } from 'lucide-react';

const CoverLetterGenerator = () => {
  const [coverLetter, setCoverLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    jobDescription: '',
    userExperience: '',
    skills: '',
    tone: 'professional'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const generateCoverLetter = async () => {
    if (!formData.jobTitle.trim() || !formData.companyName.trim()) {
      setError('Please fill in job title and company name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await AIService.generateCoverLetter(
        formData.jobTitle,
        formData.companyName,
        formData.jobDescription,
        formData.userExperience,
        formData.skills,
        formData.tone
      );
      setCoverLetter(result.data.coverLetter || '');
      setWordCount(result.data.coverLetter ? result.data.coverLetter.split(' ').length : 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCoverLetterChange = (value) => {
    setCoverLetter(value);
    setWordCount(value.split(' ').filter(word => word.trim() !== '').length);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter);
      // You could add a toast notification here
      alert('Cover letter copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadAsText = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${formData.companyName}-${formData.jobTitle}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getToneDescription = (tone) => {
    switch (tone) {
      case 'professional': return 'Formal and business-appropriate';
      case 'enthusiastic': return 'Energetic and passionate';
      case 'confident': return 'Assertive and self-assured';
      case 'creative': return 'Unique and innovative';
      default: return 'Professional tone';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Cover Letter Generator
          </h1>
          <p className="text-gray-600">
            Create personalized cover letters tailored to specific job opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                Job Information
              </h2>
              <div className="space-y-4">
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
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    placeholder="e.g., Google"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description (optional)
                  </label>
                  <textarea
                    value={formData.jobDescription}
                    onChange={(e) => setFormData({...formData, jobDescription: e.target.value})}
                    placeholder="Paste the job description or key requirements..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <User className="h-5 w-5 mr-2 text-green-600" />
                Your Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Experience
                  </label>
                  <textarea
                    value={formData.userExperience}
                    onChange={(e) => setFormData({...formData, userExperience: e.target.value})}
                    placeholder="Brief summary of your relevant experience and achievements..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Skills
                  </label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => setFormData({...formData, skills: e.target.value})}
                    placeholder="e.g., React, Node.js, Project Management"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Writing Tone
                  </label>
                  <select
                    value={formData.tone}
                    onChange={(e) => setFormData({...formData, tone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="professional">Professional</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="confident">Confident</option>
                    <option value="creative">Creative</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {getToneDescription(formData.tone)}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={generateCoverLetter}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Generating Cover Letter...
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5 mr-2" />
                  Generate Cover Letter
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Output Area */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Generated Cover Letter
              </h2>
              {coverLetter && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {wordCount} words
                  </span>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {isEditing ? 'Preview' : 'Edit'}
                  </button>
                </div>
              )}
            </div>

            {coverLetter ? (
              <div className="border border-gray-300 rounded-lg">
                {isEditing ? (
                  <textarea
                    value={coverLetter}
                    onChange={(e) => handleCoverLetterChange(e.target.value)}
                    className="w-full h-96 p-4 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Your cover letter will appear here..."
                  />
                ) : (
                  <div className="p-4 h-96 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      {coverLetter.split('\n').map((paragraph, index) => (
                        <p key={index} className="mb-4 text-gray-800 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg h-96 flex items-center justify-center">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">No cover letter generated yet</p>
                  <p className="text-sm text-gray-400">
                    Fill in the form and click &ldquo;Generate Cover Letter&rdquo; to get started
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {coverLetter && (
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </button>
                <button
                  onClick={downloadAsText}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview PDF
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  Save Draft
                </button>
              </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">💡 Tips for a Great Cover Letter</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Keep it concise (1 page maximum)</li>
                <li>• Customize for each job application</li>
                <li>• Highlight specific achievements with numbers</li>
                <li>• Research the company and mention why you&rsquo;re interested</li>
                <li>• End with a strong call to action</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
