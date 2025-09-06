import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Target, TrendingUp, BookOpen, ExternalLink, Star, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Recommendations = () => {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('careers');

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          // Fetch assessment results
          const assessmentDoc = await getDoc(doc(db, 'assessments', user.uid));
          if (assessmentDoc.exists()) {
            const assessmentData = assessmentDoc.data();
            setAssessment(assessmentData);
            
            // Generate mock recommendations based on assessment
            const mockRecommendations = generateRecommendations(assessmentData.responses);
            setRecommendations(mockRecommendations);
          } else {
            toast.error('Please complete the assessment first');
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error('Failed to load recommendations');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  const generateRecommendations = (responses) => {
    // Mock AI-generated recommendations based on assessment responses
    const careerRecommendations = [
      {
        title: 'Software Engineer',
        match: 92,
        description: 'Design and develop software applications using various programming languages.',
        skills: ['JavaScript', 'Python', 'React', 'Node.js'],
        salaryRange: '$70,000 - $120,000',
        demandLevel: 'High',
        learningPath: ['Complete JavaScript Fundamentals', 'Learn React Framework', 'Build Portfolio Projects']
      },
      {
        title: 'Data Analyst',
        match: 88,
        description: 'Analyze complex data to help organizations make informed decisions.',
        skills: ['SQL', 'Python', 'Tableau', 'Statistics'],
        salaryRange: '$60,000 - $95,000',
        demandLevel: 'High',
        learningPath: ['SQL Basics', 'Data Visualization', 'Statistical Analysis']
      },
      {
        title: 'Product Manager',
        match: 85,
        description: 'Lead product development from conception to launch.',
        skills: ['Product Strategy', 'Market Research', 'Analytics', 'Communication'],
        salaryRange: '$80,000 - $140,000',
        demandLevel: 'Medium',
        learningPath: ['Product Management Fundamentals', 'Agile Methodology', 'User Research']
      }
    ];

    const skillRecommendations = [
      {
        skill: 'Python Programming',
        relevance: 95,
        description: 'High-demand programming language for data science and web development.',
        timeToLearn: '3-6 months',
        resources: ['Python.org Tutorial', 'Codecademy Python Course', 'Real Python'],
        certification: 'Python Institute Certification'
      },
      {
        skill: 'Cloud Computing (AWS)',
        relevance: 90,
        description: 'Essential for modern software development and deployment.',
        timeToLearn: '4-8 months',
        resources: ['AWS Training', 'A Cloud Guru', 'Linux Academy'],
        certification: 'AWS Certified Solutions Architect'
      },
      {
        skill: 'Data Visualization',
        relevance: 87,
        description: 'Present data insights through compelling visual stories.',
        timeToLearn: '2-4 months',
        resources: ['Tableau Public', 'D3.js Tutorials', 'Power BI Learning'],
        certification: 'Tableau Desktop Specialist'
      }
    ];

    const learningPaths = [
      {
        title: 'Full-Stack Developer Path',
        duration: '6-12 months',
        difficulty: 'Intermediate',
        modules: [
          'HTML/CSS/JavaScript Fundamentals',
          'React.js Frontend Development',
          'Node.js Backend Development',
          'Database Design & Management',
          'API Development',
          'Deployment & DevOps'
        ]
      },
      {
        title: 'Data Science Career Track',
        duration: '8-15 months',
        difficulty: 'Advanced',
        modules: [
          'Python for Data Science',
          'Statistics & Probability',
          'Data Cleaning & Preprocessing',
          'Machine Learning Algorithms',
          'Data Visualization',
          'Big Data Technologies'
        ]
      }
    ];

    return {
      careers: careerRecommendations,
      skills: skillRecommendations,
      learningPaths: learningPaths
    };
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-12">
        <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Assessment Found</h2>
        <p className="text-gray-600 mb-6">
          Please complete the career assessment to receive personalized recommendations.
        </p>
        <a href="/assessment" className="btn-primary">
          Take Assessment
        </a>
      </div>
    );
  }

  const tabs = [
    { id: 'careers', label: 'Career Paths', icon: <Target className="h-5 w-5" /> },
    { id: 'skills', label: 'Skills to Learn', icon: <TrendingUp className="h-5 w-5" /> },
    { id: 'learning', label: 'Learning Paths', icon: <BookOpen className="h-5 w-5" /> }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Personalized Recommendations</h1>
        <p className="text-gray-600">
          Based on your assessment, here are AI-powered recommendations to accelerate your career growth.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Career Recommendations */}
      {activeTab === 'careers' && (
        <div className="space-y-6">
          {recommendations.careers.map((career, index) => (
            <div key={index} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{career.title}</h3>
                  <p className="text-gray-600 mb-3">{career.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 mb-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="text-lg font-semibold text-gray-800">{career.match}% Match</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    career.demandLevel === 'High' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {career.demandLevel} Demand
                  </span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Required Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {career.skills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-primary-100 text-primary-800 rounded-md text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Salary Range</h4>
                  <p className="text-gray-600">{career.salaryRange}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Next Steps</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {career.learningPath.slice(0, 2).map((step, idx) => (
                      <li key={idx}>• {step}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button className="btn-primary">Learn More</button>
                <button className="btn-outline">View Jobs</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skills Recommendations */}
      {activeTab === 'skills' && (
        <div className="grid md:grid-cols-2 gap-6">
          {recommendations.skills.map((skill, index) => (
            <div key={index} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{skill.skill}</h3>
                <span className="text-sm font-medium text-primary-600">{skill.relevance}% Relevant</span>
              </div>
              
              <p className="text-gray-600 mb-4">{skill.description}</p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Time to learn: {skill.timeToLearn}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Learning Resources</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {skill.resources.map((resource, idx) => (
                      <li key={idx} className="flex items-center space-x-2">
                        <ExternalLink className="h-3 w-3" />
                        <span>{resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Certification:</strong> {skill.certification}
                </p>
                <button className="btn-primary w-full">Start Learning</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Learning Paths */}
      {activeTab === 'learning' && (
        <div className="space-y-6">
          {recommendations.learningPaths.map((path, index) => (
            <div key={index} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{path.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Duration: {path.duration}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      path.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                      path.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {path.difficulty}
                    </span>
                  </div>
                </div>
                <button className="btn-primary">Start Path</button>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Learning Modules</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {path.modules.map((module, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700">{module}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
