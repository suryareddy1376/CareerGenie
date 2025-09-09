import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FileText, PlusCircle, ArrowRight } from 'lucide-react';

const ResumeDecision = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleHaveResume = () => {
    navigate('/upload-resume');
  };

  const handleNeedResume = () => {
    navigate('/build-resume');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to CareerGenie, {currentUser?.displayName?.split(' ')[0] || 'there'}! 👋
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Let's get started with your career journey. First, we need to understand your current profile.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Option 1: Have Resume */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
               onClick={handleHaveResume}>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-200 transition-colors">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">I already have a Resume</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Upload your existing resume and we'll analyze it to identify your skills, experience, and suggest improvements.
              </p>
              <div className="space-y-3 text-sm text-gray-500 mb-8">
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Quick analysis & feedback
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Skills gap identification
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Personalized roadmap
                </div>
              </div>
              <button className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 group-hover:scale-105">
                Upload Resume
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>

          {/* Option 2: Need Resume */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer group"
               onClick={handleNeedResume}>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors">
                <PlusCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">I don't have a Resume</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                No worries! Answer a few questions about your background and we'll help you build a professional resume.
              </p>
              <div className="space-y-3 text-sm text-gray-500 mb-8">
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Step-by-step guidance
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Professional templates
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Instant PDF download
                </div>
              </div>
              <button className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 group-hover:scale-105">
                Build Resume
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500 text-sm">
            Don't worry, you can always come back and update your information later.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumeDecision;
