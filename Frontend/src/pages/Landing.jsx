import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Target, TrendingUp, Users, CheckCircle } from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: <Brain className="h-12 w-12 text-primary-600" />,
      title: "AI-Powered Analysis",
      description: "Get personalized career recommendations powered by advanced AI algorithms"
    },
    {
      icon: <Target className="h-12 w-12 text-primary-600" />,
      title: "Skills Gap Analysis",
      description: "Identify skill gaps and receive targeted learning recommendations"
    },
    {
      icon: <TrendingUp className="h-12 w-12 text-primary-600" />,
      title: "Career Roadmap",
      description: "Get a clear path to achieve your career goals with actionable steps"
    },
    {
      icon: <Users className="h-12 w-12 text-primary-600" />,
      title: "Industry Insights",
      description: "Access latest industry trends and market demands for informed decisions"
    }
  ];

  const benefits = [
    "Personalized career recommendations",
    "Real-time skills assessment",
    "Industry-specific guidance",
    "Learning path optimization",
    "Progress tracking and analytics"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6">
            Unlock Your Career Potential with
            <span className="text-primary-600"> CareerGenie</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Get personalized career advice, skills recommendations, and actionable insights 
            powered by AI to accelerate your professional growth.
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Start Your Journey
            </Link>
            <Link to="/login" className="btn-outline text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose CareerGenie?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive career guidance tailored to your unique profile and goals.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="card text-center hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Transform Your Career Today
              </h2>
              <p className="text-xl text-gray-600">
                Join thousands of professionals who have accelerated their careers with CareerGenie.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                  What You'll Get:
                </h3>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-6 w-6 text-secondary-600 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="card bg-gradient-to-br from-primary-50 to-secondary-50">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                  Ready to Get Started?
                </h3>
                <p className="text-gray-600 mb-6 text-center">
                  Take the first step towards your dream career. Our assessment takes just 5 minutes.
                </p>
                <div className="text-center">
                  <Link to="/register" className="btn-primary text-lg px-8 py-3 w-full block">
                    Begin Assessment
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Your Career Success Starts Here
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Don't wait for opportunities to come to you. Create them with CareerGenie.
          </p>
          <Link to="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors">
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Landing;
