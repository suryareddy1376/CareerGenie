import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { User, Mail, MapPin, Briefcase, Save, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const profileData = userDoc.data();
            setUserProfile(profileData);
            
            // Set form default values
            setValue('name', profileData.name || user.displayName || '');
            setValue('email', profileData.email || user.email || '');
            setValue('title', profileData.title || '');
            setValue('company', profileData.company || '');
            setValue('location', profileData.location || '');
            setValue('bio', profileData.bio || '');
            setValue('experience', profileData.experience || '');
            setValue('skills', profileData.skills || '');
            setValue('education', profileData.education || '');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          toast.error('Failed to load profile');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserProfile();
  }, [user, setValue]);

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      // Update Firebase Auth profile
      if (data.name !== user.displayName) {
        await updateProfile(auth.currentUser, {
          displayName: data.name
        });
      }

      // Update Firestore document
      await updateDoc(doc(db, 'users', user.uid), {
        ...data,
        profileCompleted: true,
        lastUpdated: new Date().toISOString()
      });

      setUserProfile({ ...userProfile, ...data });
      setEditMode(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const profileCompleteness = () => {
    const fields = ['name', 'title', 'company', 'location', 'bio', 'skills'];
    const completedFields = fields.filter(field => userProfile?.[field]);
    return Math.round((completedFields.length / fields.length) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and career details</p>
        </div>
        <button
          onClick={() => setEditMode(!editMode)}
          className="btn-outline flex items-center space-x-2"
        >
          <Edit3 className="h-4 w-4" />
          <span>{editMode ? 'Cancel' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Profile Completeness */}
      <div className="card mb-8 bg-gradient-to-r from-primary-50 to-secondary-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Profile Completeness</h3>
            <p className="text-gray-600">Complete your profile to get better recommendations</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary-600">{profileCompleteness()}%</div>
            <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${profileCompleteness()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  disabled={!editMode}
                  className={`input-field pl-10 ${!editMode ? 'bg-gray-50' : ''}`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  {...register('email')}
                  disabled={true}
                  className="input-field pl-10 bg-gray-50"
                  placeholder="Email address"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  {...register('title')}
                  disabled={!editMode}
                  className={`input-field pl-10 ${!editMode ? 'bg-gray-50' : ''}`}
                  placeholder="e.g. Software Engineer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                {...register('company')}
                disabled={!editMode}
                className={`input-field ${!editMode ? 'bg-gray-50' : ''}`}
                placeholder="Current company"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  {...register('location')}
                  disabled={!editMode}
                  className={`input-field pl-10 ${!editMode ? 'bg-gray-50' : ''}`}
                  placeholder="City, Country"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Professional Information</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio / Professional Summary
              </label>
              <textarea
                {...register('bio')}
                disabled={!editMode}
                rows={4}
                className={`input-field ${!editMode ? 'bg-gray-50' : ''}`}
                placeholder="Tell us about your professional background and goals..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience
              </label>
              <select
                {...register('experience')}
                disabled={!editMode}
                className={`input-field ${!editMode ? 'bg-gray-50' : ''}`}
              >
                <option value="">Select experience level</option>
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="mid">Mid Level (3-5 years)</option>
                <option value="senior">Senior Level (6-10 years)</option>
                <option value="executive">Executive Level (10+ years)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skills (comma-separated)
              </label>
              <textarea
                {...register('skills')}
                disabled={!editMode}
                rows={3}
                className={`input-field ${!editMode ? 'bg-gray-50' : ''}`}
                placeholder="JavaScript, Python, Project Management, Leadership..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Education
              </label>
              <textarea
                {...register('education')}
                disabled={!editMode}
                rows={3}
                className={`input-field ${!editMode ? 'bg-gray-50' : ''}`}
                placeholder="University, Degree, Certifications..."
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        {editMode && (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* Account Settings */}
      <div className="card mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Account Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h3 className="font-medium text-gray-800">Account created</h3>
              <p className="text-sm text-gray-600">
                {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <h3 className="font-medium text-gray-800">Assessment status</h3>
              <p className="text-sm text-gray-600">
                {userProfile?.assessmentCompleted ? 'Completed' : 'Not completed'}
              </p>
            </div>
            {!userProfile?.assessmentCompleted && (
              <a href="/assessment" className="btn-outline text-sm">
                Take Assessment
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
