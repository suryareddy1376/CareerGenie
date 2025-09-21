import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Recommendations from './pages/Recommendations';
import Profile from './pages/Profile';
import Landing from './pages/Landing';
import ResumeDecision from './pages/ResumeDecision';
import UploadResume from './pages/UploadResume';
import BuildResume from './pages/BuildResume';

// AI Feature Components
import CareerRecommendations from './components/CareerRecommendations';
import SkillGapAnalysis from './components/SkillGapAnalysis';
import InterviewPreparation from './components/InterviewPreparation';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import AITestComponent from './components/AITestComponent';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Enhanced Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!currentUser) {
    // Redirect to login with the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Enhanced Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return !currentUser ? children : <Navigate to="/dashboard" replace />;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/assessment" element={
            <ProtectedRoute>
              <Assessment />
            </ProtectedRoute>
          } />
          <Route path="/recommendations" element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/resume-decision" element={
            <ProtectedRoute>
              <ResumeDecision />
            </ProtectedRoute>
          } />
          <Route path="/upload-resume" element={
            <ProtectedRoute>
              <UploadResume />
            </ProtectedRoute>
          } />
          <Route path="/build-resume" element={
            <ProtectedRoute>
              <BuildResume />
            </ProtectedRoute>
          } />
          
          {/* AI Feature Routes */}
          <Route path="/ai/career-recommendations" element={
            <ProtectedRoute>
              <CareerRecommendations />
            </ProtectedRoute>
          } />
          <Route path="/ai/skill-gap-analysis" element={
            <ProtectedRoute>
              <SkillGapAnalysis />
            </ProtectedRoute>
          } />
          <Route path="/ai/interview-preparation" element={
            <ProtectedRoute>
              <InterviewPreparation />
            </ProtectedRoute>
          } />
          <Route path="/ai/cover-letter" element={
            <ProtectedRoute>
              <CoverLetterGenerator />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } />
          <Route path="/ai/test" element={
            <ProtectedRoute>
              <AITestComponent />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
