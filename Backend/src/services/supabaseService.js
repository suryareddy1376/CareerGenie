/**
 * Supabase Service for CareerGenie
 * Handles structured data operations with PostgreSQL
 */

const { supabaseAdmin } = require('../config/supabase');

class SupabaseService {
  /**
   * User Management
   */
  static async createOrUpdateUser(firebaseUid, userData) {
    try {
      console.log('🔄 Creating/Updating user in Supabase:', firebaseUid);
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .upsert({
          firebase_uid: firebaseUid,
          email: userData.email,
          full_name: userData.fullName || userData.full_name,
          avatar_url: userData.avatarUrl || userData.avatar_url,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'firebase_uid',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase user upsert error:', error);
        throw error;
      }
      
      console.log('✅ User created/updated successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Create/Update user error:', error);
      throw error;
    }
  }

  static async getUserByFirebaseUid(firebaseUid) {
    try {
      console.log('🔍 Getting user from Supabase:', firebaseUid);
      
      const { data, error } = await supabaseAdmin
        .from('users')
        .select(`
          *,
          user_profiles(*),
          education(*),
          experience(*),
          projects(*),
          resumes(*),
          career_roadmaps(*),
          skill_gaps(*)
        `)
        .eq('firebase_uid', firebaseUid)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Get user error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('❌ Get user error:', error);
      throw error;
    }
  }

  /**
   * Education Management
   */
  static async addEducation(userId, educationData) {
    try {
      console.log('🎓 Adding education for user:', userId);
      
      const { data, error } = await supabaseAdmin
        .from('education')
        .insert({
          user_id: userId,
          degree: educationData.degree,
          field_of_study: educationData.field_of_study || educationData.field,
          institution: educationData.institution,
          start_date: educationData.start_date,
          end_date: educationData.end_date,
          gpa: educationData.gpa ? parseFloat(educationData.gpa) : null,
          description: educationData.description,
          is_current: educationData.is_current || false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Add education error:', error);
        throw error;
      }

      console.log('✅ Education added successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Add education error:', error);
      throw error;
    }
  }

  /**
   * Experience Management
   */
  static async addExperience(userId, experienceData) {
    try {
      console.log('💼 Adding experience for user:', userId);
      
      const { data, error } = await supabaseAdmin
        .from('experience')
        .insert({
          user_id: userId,
          title: experienceData.title,
          company: experienceData.company,
          location: experienceData.location,
          start_date: experienceData.start_date,
          end_date: experienceData.end_date,
          is_current: experienceData.is_current || false,
          description: experienceData.description,
          skills: experienceData.skills || []
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Add experience error:', error);
        throw error;
      }

      console.log('✅ Experience added successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Add experience error:', error);
      throw error;
    }
  }

  /**
   * Skills Management
   */
  static async addUserSkills(userId, skillsData) {
    try {
      console.log('🛠️ Adding skills for user:', userId);
      
      if (!Array.isArray(skillsData) || skillsData.length === 0) {
        console.log('⚠️ No skills provided');
        return [];
      }

      // First, ensure skills exist in the skills table
      const skillInserts = skillsData.map(skill => ({
        name: typeof skill === 'string' ? skill : skill.name,
        category: typeof skill === 'string' ? 'technical' : (skill.category || 'technical')
      }));

      await supabaseAdmin
        .from('skills')
        .upsert(skillInserts, { 
          onConflict: 'name',
          ignoreDuplicates: true 
        });

      // Get skill IDs
      const skillNames = skillsData.map(s => typeof s === 'string' ? s : s.name);
      const { data: skills, error: skillsError } = await supabaseAdmin
        .from('skills')
        .select('id, name')
        .in('name', skillNames);

      if (skillsError) {
        console.error('❌ Get skills error:', skillsError);
        throw skillsError;
      }

      // Create user_skills associations
      const userSkillInserts = skills.map(skill => {
        const skillData = skillsData.find(s => 
          (typeof s === 'string' ? s : s.name) === skill.name
        );
        return {
          user_id: userId,
          skill_id: skill.id,
          proficiency_level: typeof skillData === 'object' ? 
            (skillData.proficiency_level || 3) : 3,
          years_of_experience: typeof skillData === 'object' ? 
            (skillData.years_of_experience || 0) : 0
        };
      });

      const { data, error } = await supabaseAdmin
        .from('user_skills')
        .upsert(userSkillInserts, { 
          onConflict: 'user_id,skill_id',
          ignoreDuplicates: false 
        })
        .select();

      if (error) {
        console.error('❌ Add user skills error:', error);
        throw error;
      }

      console.log('✅ Skills added successfully:', data.length, 'skills');
      return data;
    } catch (error) {
      console.error('❌ Add user skills error:', error);
      throw error;
    }
  }

  /**
   * Resume Management
   */
  static async saveResume(userId, resumeData) {
    try {
      console.log('📄 Saving resume for user:', userId);
      
      const { data, error } = await supabaseAdmin
        .from('resumes')
        .insert({
          user_id: userId,
          title: resumeData.title || 'My Resume',
          template_type: resumeData.template_type || resumeData.template || 'professional',
          content: resumeData.content,
          file_url: resumeData.file_url,
          is_primary: resumeData.is_primary || false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Save resume error:', error);
        throw error;
      }

      console.log('✅ Resume saved successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Save resume error:', error);
      throw error;
    }
  }

  /**
   * Career Roadmap Management
   */
  static async saveRoadmap(userId, roadmapData) {
    try {
      console.log('🗺️ Saving roadmap for user:', userId);
      
      const { data, error } = await supabaseAdmin
        .from('career_roadmaps')
        .upsert({
          user_id: userId,
          target_role: roadmapData.target_role || roadmapData.targetRole,
          current_level: roadmapData.current_level || roadmapData.currentRole,
          roadmap_data: roadmapData.roadmap_data || roadmapData,
          progress: roadmapData.progress || {},
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,target_role',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Save roadmap error:', error);
        throw error;
      }

      console.log('✅ Roadmap saved successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Save roadmap error:', error);
      throw error;
    }
  }

  /**
   * Skill Gap Analysis
   */
  static async saveSkillGap(userId, skillGapData) {
    try {
      console.log('📊 Saving skill gap analysis for user:', userId);
      
      const { data, error } = await supabaseAdmin
        .from('skill_gaps')
        .insert({
          user_id: userId,
          target_role: skillGapData.target_role || skillGapData.targetRole,
          present_skills: skillGapData.present_skills || skillGapData.presentSkills || [],
          missing_skills: skillGapData.missing_skills || skillGapData.missingSkills || [],
          match_percentage: skillGapData.match_percentage || skillGapData.matchPercentage || 0,
          recommendations: skillGapData.recommendations || []
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Save skill gap error:', error);
        throw error;
      }

      console.log('✅ Skill gap analysis saved successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Save skill gap error:', error);
      throw error;
    }
  }

  /**
   * Chat Management
   */
  static async createChatConversation(userId, title = 'Career Chat') {
    try {
      console.log('💬 Creating chat conversation for user:', userId);
      
      const { data, error } = await supabaseAdmin
        .from('chat_conversations')
        .insert({
          user_id: userId,
          title
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Create chat conversation error:', error);
        throw error;
      }

      console.log('✅ Chat conversation created successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Create chat conversation error:', error);
      throw error;
    }
  }

  static async saveChatMessage(conversationId, userId, message, response) {
    try {
      console.log('💬 Saving chat message for conversation:', conversationId);
      
      const { data, error } = await supabaseAdmin
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          message,
          response,
          message_type: 'user'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Save chat message error:', error);
        throw error;
      }

      console.log('✅ Chat message saved successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Save chat message error:', error);
      throw error;
    }
  }

  /**
   * Analytics and Statistics
   */
  static async getUserStats(userId) {
    try {
      console.log('📊 Getting user statistics for:', userId);
      
      // Get counts for various entities
      const [resumeCount, educationCount, experienceCount, skillCount] = await Promise.all([
        supabaseAdmin.from('resumes').select('id', { count: 'exact' }).eq('user_id', userId),
        supabaseAdmin.from('education').select('id', { count: 'exact' }).eq('user_id', userId),
        supabaseAdmin.from('experience').select('id', { count: 'exact' }).eq('user_id', userId),
        supabaseAdmin.from('user_skills').select('id', { count: 'exact' }).eq('user_id', userId)
      ]);

      const stats = {
        resumes: resumeCount.count || 0,
        education: educationCount.count || 0,
        experience: experienceCount.count || 0,
        skills: skillCount.count || 0
      };

      console.log('✅ User statistics retrieved:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Get user stats error:', error);
      throw error;
    }
  }
}

module.exports = SupabaseService;
