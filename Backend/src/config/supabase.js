/**
 * Supabase Configuration for CareerGenie
 * Hybrid architecture: Firebase (Auth) + Supabase (Structured Data)
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// Service role client (for server-side operations)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Anonymous client (for public operations)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Test Supabase connection
 */
async function testSupabaseConnection() {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Test database connection
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "table not found" which is expected if schema isn't created yet
      throw error;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log(`📊 Database URL: ${supabaseUrl}`);
    return true;
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return false;
  }
}

/**
 * Initialize database schema
 */
async function initializeDatabase() {
  try {
    console.log('🏗️ Checking/Creating database schema...');
    
    // Check if users table exists
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1);
    
    if (error && error.code === 'PGRST116') {
      console.log('📝 Database schema not found. Please run the SQL schema in Supabase dashboard.');
      console.log('🔗 Go to: https://rnvlwavpajylnkqskigl.supabase.co/project/default/sql');
      return false;
    }
    
    if (error) {
      throw error;
    }
    
    console.log('✅ Database schema exists and is accessible');
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    return false;
  }
}

/**
 * Get user by Firebase UID with retries
 */
async function getUserByFirebaseUid(firebaseUid, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

module.exports = {
  supabase,
  supabaseAdmin,
  testSupabaseConnection,
  initializeDatabase,
  getUserByFirebaseUid
};
