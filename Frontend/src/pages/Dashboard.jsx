import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Brain, Target, TrendingUp, BookOpen, ArrowRight, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const quickActions = [
    {
      title: 'Take Career Assessment',
      description: 'Discover your strengths and get personalized recommendations',
      icon: <Brain className="h-8 w-8 text-primary-600" />,
      link: '/assessment',
      completed: userProfile?.assessmentCompleted || false
    },
    {
      title: 'View Recommendations',
      description: 'Explore AI-powered career and skills recommendations',
      icon: <Target className="h-8 w-8 text-secondary-600" />,
      link: '/recommendations',
      completed: false
    },
    {
      title: 'Update Profile',
      description: 'Keep your profile up-to-date for better recommendations',
      icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
      link: '/profile',
      completed: userProfile?.profileCompleted || false
    }
  ];

  const recentActivity = [
    {
      action: 'Profile Created',
      date: new Date(userProfile?.createdAt).toLocaleDateString(),
      status: 'completed'
    },
    {
      action: 'Career Assessment',
      date: userProfile?.assessmentCompleted ? 'Completed' : 'Pending',
      status: userProfile?.assessmentCompleted ? 'completed' : 'pending'
    },
    {
      action: 'Skills Analysis',
      date: 'Pending',
      status: 'pending'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user?.displayName || 'User'}! 👋
        </h1>
        <p className="text-gray-600">
          Ready to take the next step in your career journey? Let's get started.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-600 text-sm font-medium">Profile Completion</p>
              <p className="text-2xl font-bold text-primary-800">
                {userProfile?.profileCompleted ? '100%' : '60%'}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-primary-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-secondary-50 to-secondary-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-600 text-sm font-medium">Assessment Status</p>
              <p className="text-2xl font-bold text-secondary-800">
                {userProfile?.assessmentCompleted ? 'Complete' : 'Pending'}
              </p>
            </div>
            <Brain className="h-8 w-8 text-secondary-600" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Recommendations</p>
              <p className="text-2xl font-bold text-purple-800">
                {userProfile?.assessmentCompleted ? '12' : '0'}
              </p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {action.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-800 flex items-center space-x-2">
                        <span>{action.title}</span>
                        {action.completed && (
                          <CheckCircle className="h-5 w-5 text-secondary-600" />
                        )}
                      </h3>
                      <p className="text-gray-600 text-sm">{action.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.status === 'completed' ? 'bg-secondary-500' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <p className="text-gray-800 font-medium">{activity.action}</p>
                    <p className="text-gray-500 text-sm">{activity.date}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  activity.status === 'completed' 
                    ? 'bg-secondary-100 text-secondary-800' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {activity.status === 'completed' ? 'Completed' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Steps */}
      {!userProfile?.assessmentCompleted && (
        <div className="mt-8 card bg-gradient-to-r from-primary-50 to-secondary-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Ready for Your Career Assessment?</h3>
              <p className="text-gray-600 mb-4">
                Take our comprehensive assessment to get personalized career recommendations tailored to your skills and interests.
              </p>
              <Link to="/assessment" className="btn-primary inline-flex items-center space-x-2">
                <Brain className="h-5 w-5" />
                <span>Start Assessment</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <BookOpen className="h-24 w-24 text-primary-300" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
