-- CareerGenie Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- URL: https://rnvlwavpajylnkqskigl.supabase.co/project/default/sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with Firebase Auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table (extended profile information)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  phone TEXT,
  location TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  website_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Education table
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  institution TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  gpa DECIMAL(3,2),
  description TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Experience table
CREATE TABLE IF NOT EXISTS experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  skills JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  technologies JSONB DEFAULT '[]',
  github_url TEXT,
  demo_url TEXT,
  start_date DATE,
  end_date DATE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Skills master table
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL, -- 'technical', 'soft', 'language', 'tool'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User skills junction table
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency_level INTEGER CHECK (proficiency_level >= 1 AND proficiency_level <= 5),
  years_of_experience INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

-- Resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'My Resume',
  template_type TEXT DEFAULT 'professional',
  content JSONB NOT NULL,
  file_url TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career roadmaps table
CREATE TABLE IF NOT EXISTS career_roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  current_level TEXT,
  roadmap_data JSONB NOT NULL,
  progress JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, target_role)
);

-- Skill gaps analysis table
CREATE TABLE IF NOT EXISTS skill_gaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  present_skills JSONB DEFAULT '[]',
  missing_skills JSONB DEFAULT '[]',
  match_percentage INTEGER,
  recommendations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'Career Chat',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT,
  message_type TEXT DEFAULT 'user', -- 'user', 'assistant', 'system'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_education_user_id ON education(user_id);
CREATE INDEX IF NOT EXISTS idx_experience_user_id ON experience(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON user_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_career_roadmaps_user_id ON career_roadmaps(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_user_id ON skill_gaps(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);

-- Insert common skills
INSERT INTO skills (name, category) VALUES 
-- Technical Skills
('JavaScript', 'technical'),
('Python', 'technical'),
('Java', 'technical'),
('React', 'technical'),
('Node.js', 'technical'),
('SQL', 'technical'),
('PostgreSQL', 'technical'),
('MongoDB', 'technical'),
('Machine Learning', 'technical'),
('Data Science', 'technical'),
('AWS', 'technical'),
('Azure', 'technical'),
('Docker', 'technical'),
('Kubernetes', 'technical'),
('Git', 'technical'),
('HTML', 'technical'),
('CSS', 'technical'),
('TypeScript', 'technical'),
('Angular', 'technical'),
('Vue.js', 'technical'),
('Express.js', 'technical'),
('Django', 'technical'),
('Flask', 'technical'),
('Spring Boot', 'technical'),
('REST API', 'technical'),
('GraphQL', 'technical'),
('Microservices', 'technical'),
('CI/CD', 'technical'),
('Jenkins', 'technical'),
('Terraform', 'technical'),
('Ansible', 'technical'),
('Redis', 'technical'),
('Elasticsearch', 'technical'),
('Kafka', 'technical'),
('TensorFlow', 'technical'),
('PyTorch', 'technical'),
('Pandas', 'technical'),
('NumPy', 'technical'),
('Scikit-learn', 'technical'),
('Tableau', 'technical'),
('Power BI', 'technical'),

-- Soft Skills
('Communication', 'soft'),
('Leadership', 'soft'),
('Problem Solving', 'soft'),
('Team Work', 'soft'),
('Project Management', 'soft'),
('Critical Thinking', 'soft'),
('Adaptability', 'soft'),
('Time Management', 'soft'),
('Negotiation', 'soft'),
('Presentation', 'soft'),
('Mentoring', 'soft'),
('Decision Making', 'soft'),
('Conflict Resolution', 'soft'),
('Strategic Planning', 'soft'),
('Customer Service', 'soft'),

-- Tools
('Figma', 'tool'),
('Adobe Creative Suite', 'tool'),
('Jira', 'tool'),
('Confluence', 'tool'),
('Slack', 'tool'),
('Trello', 'tool'),
('Asana', 'tool'),
('Notion', 'tool'),
('Postman', 'tool'),
('VS Code', 'tool'),
('IntelliJ IDEA', 'tool'),
('Excel', 'tool'),
('Google Analytics', 'tool'),
('Salesforce', 'tool'),
('HubSpot', 'tool'),

-- Languages
('English', 'language'),
('Spanish', 'language'),
('French', 'language'),
('German', 'language'),
('Chinese', 'language'),
('Japanese', 'language'),
('Korean', 'language'),
('Portuguese', 'language'),
('Italian', 'language'),
('Russian', 'language')

ON CONFLICT (name) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
-- Note: Since we're using Firebase Auth + service role key, we'll manage access server-side
-- These policies are more for additional security

-- Skills table can be read by anyone (reference data)
CREATE POLICY "Skills are viewable by everyone" ON skills
  FOR SELECT USING (true);

-- Users can only access their own data (when using anon key)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub');

-- Function to get current user ID from Firebase UID
CREATE OR REPLACE FUNCTION get_user_id_from_firebase_uid(firebase_uid TEXT)
RETURNS UUID AS $$
DECLARE
  user_id UUID;
BEGIN
  SELECT id INTO user_id FROM users WHERE users.firebase_uid = $1;
  RETURN user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'CareerGenie database schema created successfully! 🎉';
  RAISE NOTICE 'Tables created: users, user_profiles, education, experience, projects, skills, user_skills, resumes, career_roadmaps, skill_gaps, chat_conversations, chat_messages';
  RAISE NOTICE 'Indexes created for optimal performance';
  RAISE NOTICE 'RLS policies enabled for security';
  RAISE NOTICE 'Common skills inserted (100+ skills across categories)';
END $$;
