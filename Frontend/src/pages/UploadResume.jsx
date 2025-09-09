import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const UploadResume = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a PDF or DOCX file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);
      formData.append('userId', currentUser.uid);

      // TODO: Replace with your actual API endpoint
      const response = await fetch('/api/parseResume', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      
      setUploadSuccess(true);
      toast.success('Resume uploaded and analyzed successfully!');
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleBack = () => {
    navigate('/resume-decision');
  };

  if (uploadSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Resume Uploaded Successfully!</h1>
            <p className="text-gray-600 mb-6">
              We&apos;ve analyzed your resume and extracted your skills and experience. 
              Redirecting to your dashboard...
            </p>
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Upload Your Resume</h1>
          </div>

          {/* Upload Area */}
          <div className="mb-8">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {!selectedFile ? (
                <label htmlFor="resume-upload" className="cursor-pointer block">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Click to upload your resume
                  </p>
                  <p className="text-gray-500 text-sm">
                    PDF or DOCX files only (Max 5MB)
                  </p>
                </label>
              ) : (
                <div className="flex items-center justify-center">
                  <FileText className="w-8 h-8 text-primary-600 mr-3" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="ml-4 text-red-500 hover:text-red-700 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              What happens next?
            </h3>
            <ul className="text-blue-800 text-sm space-y-2">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                We&apos;ll extract your skills, experience, and education from your resume
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Identify skill gaps based on current industry trends
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                Generate a personalized learning roadmap for career growth
              </li>
            </ul>
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-medium rounded-lg hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Analyzing Resume...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Upload & Analyze Resume
              </>
            )}
          </button>

          {/* Help Text */}
          <p className="text-center text-gray-500 text-sm mt-4">
            Your resume will be processed securely and deleted after analysis.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UploadResume;
