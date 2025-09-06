import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { Brain, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Assessment = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const assessmentQuestions = [
    {
      id: 'experience',
      title: 'What is your current experience level?',
      type: 'radio',
      options: [
        { value: 'entry', label: 'Entry Level (0-2 years)' },
        { value: 'mid', label: 'Mid Level (3-5 years)' },
        { value: 'senior', label: 'Senior Level (6-10 years)' },
        { value: 'executive', label: 'Executive Level (10+ years)' }
      ]
    },
    {
      id: 'industry',
      title: 'Which industry interests you most?',
      type: 'radio',
      options: [
        { value: 'technology', label: 'Technology & Software' },
        { value: 'healthcare', label: 'Healthcare & Medicine' },
        { value: 'finance', label: 'Finance & Banking' },
        { value: 'education', label: 'Education & Training' },
        { value: 'marketing', label: 'Marketing & Sales' },
        { value: 'consulting', label: 'Consulting & Strategy' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      id: 'skills',
      title: 'What are your top skills? (Select all that apply)',
      type: 'checkbox',
      options: [
        { value: 'programming', label: 'Programming & Development' },
        { value: 'dataanalysis', label: 'Data Analysis' },
        { value: 'projectmanagement', label: 'Project Management' },
        { value: 'communication', label: 'Communication' },
        { value: 'leadership', label: 'Leadership' },
        { value: 'design', label: 'Design & Creativity' },
        { value: 'sales', label: 'Sales & Business Development' },
        { value: 'research', label: 'Research & Analysis' }
      ]
    },
    {
      id: 'goals',
      title: 'What are your primary career goals?',
      type: 'radio',
      options: [
        { value: 'promotion', label: 'Get promoted in current role' },
        { value: 'switch', label: 'Switch to a new career field' },
        { value: 'skills', label: 'Develop new skills' },
        { value: 'leadership', label: 'Move into leadership' },
        { value: 'entrepreneur', label: 'Start my own business' },
        { value: 'freelance', label: 'Become a freelancer/consultant' }
      ]
    },
    {
      id: 'workstyle',
      title: 'What work environment do you prefer?',
      type: 'radio',
      options: [
        { value: 'remote', label: 'Fully remote' },
        { value: 'hybrid', label: 'Hybrid (remote + office)' },
        { value: 'office', label: 'Traditional office' },
        { value: 'flexible', label: 'No preference' }
      ]
    },
    {
      id: 'learning',
      title: 'How do you prefer to learn new skills?',
      type: 'checkbox',
      options: [
        { value: 'online', label: 'Online courses' },
        { value: 'mentorship', label: 'Mentorship programs' },
        { value: 'workshops', label: 'Workshops & seminars' },
        { value: 'certification', label: 'Professional certifications' },
        { value: 'practice', label: 'Hands-on practice' },
        { value: 'reading', label: 'Books & articles' }
      ]
    }
  ];

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Save assessment results to Firestore
      await setDoc(doc(db, 'assessments', user.uid), {
        userId: user.uid,
        responses: data,
        completedAt: new Date().toISOString(),
        version: '1.0'
      });

      // Update user profile to mark assessment as completed
      await updateDoc(doc(db, 'users', user.uid), {
        assessmentCompleted: true,
        lastAssessmentDate: new Date().toISOString()
      });

      toast.success('Assessment completed successfully!');
      navigate('/recommendations');
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < assessmentQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentQuestion = assessmentQuestions[currentStep];
  const progress = ((currentStep + 1) / assessmentQuestions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Brain className="h-12 w-12 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Career Assessment</h1>
        <p className="text-gray-600">
          Answer a few questions to get personalized career and skills recommendations
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentStep + 1} of {assessmentQuestions.length}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="card">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {currentQuestion.title}
          </h2>

          {currentQuestion.type === 'radio' && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    value={option.value}
                    {...register(currentQuestion.id, { required: 'Please select an option' })}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          )}

          {currentQuestion.type === 'checkbox' && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    value={option.value}
                    {...register(currentQuestion.id, { required: 'Please select at least one option' })}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          )}

          {errors[currentQuestion.id] && (
            <p className="text-red-500 text-sm mt-2">{errors[currentQuestion.id].message}</p>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              currentStep === 0 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          {currentStep < assessmentQuestions.length - 1 ? (
            <button
              type="button"
              onClick={nextStep}
              className="btn-primary flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Complete Assessment</span>
                </>
              )}
            </button>
          )}
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-gray-500 text-sm">
          Your responses will be used to generate personalized recommendations. 
          All data is kept confidential and secure.
        </p>
      </div>
    </div>
  );
};

export default Assessment;
