/**
 * Test script to verify AI service is working with fallbacks
 */

const axios = require('axios');

async function testAIEndpoints() {
  const baseURL = 'http://localhost:5000';
  
  // Mock JWT token for testing (you'll need a real token from Firebase Auth)
  const mockHeaders = {
    'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1Njc4OTAifQ.eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vY2FycmVyZ2VuaWUtNTVlNTgiLCJhdWQiOiJjYXJyZXJnZW5pZS01NWU1OCIsImF1dGhfdGltZSI6MTYzNzI0NjQwMCwidXNlcl9pZCI6InRlc3QtdXNlciIsInN1YiI6InRlc3QtdXNlciIsImlhdCI6MTYzNzI0NjQwMCwiZXhwIjo5OTk5OTk5OTk5LCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6eyJlbWFpbCI6WyJ0ZXN0QHRlc3QuY29tIl19LCJzaWduX2luX3Byb3ZpZGVyIjoicGFzc3dvcmQifX0.mock-signature',
    'Content-Type': 'application/json'
  };

  console.log('🧪 Testing AI Endpoints...\n');

  try {
    // Test 1: Career Recommendations
    console.log('1️⃣ Testing Career Recommendations...');
    const careerResponse = await axios.post(`${baseURL}/api/ai/career-recommendations`, {
      userId: 'test-user',
      skills: ['javascript', 'react', 'node.js'],
      experience: 'mid',
      preferences: { industry: 'technology', location: 'remote' }
    }, { headers: mockHeaders });
    
    console.log('✅ Career Recommendations:', careerResponse.status === 200 ? 'SUCCESS' : 'FAILED');
    
    // Test 2: Skill Gap Analysis
    console.log('2️⃣ Testing Skill Gap Analysis...');
    const skillResponse = await axios.post(`${baseURL}/api/ai/skill-gap-analysis`, {
      userId: 'test-user',
      currentSkills: ['javascript', 'react'],
      targetRole: 'Senior Developer',
      experience: 'mid'
    }, { headers: mockHeaders });
    
    console.log('✅ Skill Gap Analysis:', skillResponse.status === 200 ? 'SUCCESS' : 'FAILED');
    
    // Test 3: Interview Questions
    console.log('3️⃣ Testing Interview Questions...');
    const interviewResponse = await axios.post(`${baseURL}/api/ai/interview-questions`, {
      jobTitle: 'Software Engineer',
      experience: 'mid',
      skills: ['javascript', 'react']
    }, { headers: mockHeaders });
    
    console.log('✅ Interview Questions:', interviewResponse.status === 200 ? 'SUCCESS' : 'FAILED');
    
    // Test 4: Cover Letter
    console.log('4️⃣ Testing Cover Letter Generation...');
    const coverLetterResponse = await axios.post(`${baseURL}/api/ai/cover-letter`, {
      jobTitle: 'Software Engineer',
      companyName: 'Tech Corp',
      userExperience: 'Experienced developer with 5 years',
      skills: 'JavaScript, React, Node.js',
      tone: 'professional'
    }, { headers: mockHeaders });
    
    console.log('✅ Cover Letter Generation:', coverLetterResponse.status === 200 ? 'SUCCESS' : 'FAILED');
    
    console.log('\n🎉 All AI endpoints tested successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.status, error.response?.data || error.message);
  }
}

// Run the test
if (require.main === module) {
  testAIEndpoints();
}

module.exports = { testAIEndpoints };
