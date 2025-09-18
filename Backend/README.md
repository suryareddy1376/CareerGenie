# CareerGenie Backend API

A comprehensive career guidance and resume management backend built with Node.js, Express, and Firebase.

## 🚀 Features

### Authentication & User Management
- User registration and login
- Password reset and email verification
- JWT token-based authentication
- User profile management
- Avatar upload
- Account deletion

### Resume Management
- Resume parsing (PDF/DOCX)
- AI-powered resume building
- Multiple resume templates
- Resume storage and retrieval
- File upload handling

### AI-Powered Career Tools
- **Skill Gap Analysis**: Identify missing skills for target roles
- **Career Roadmap Generation**: Get personalized career paths
- **AI Chat Assistant**: Interactive career guidance
- **Resume Enhancement**: AI-powered content suggestions

### Technical Features
- Google Cloud Free Tier compatible
- Firebase Firestore database
- Firebase Storage for file management
- Rate limiting and security
- Comprehensive error handling
- Health monitoring

## 🛠️ Setup

### Prerequisites
- Node.js 16+ 
- Firebase project with Admin SDK
- Google Cloud account (Free Tier)

### Installation

1. **Clone and Install Dependencies**
   ```bash
   cd Backend
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Add your Firebase service account key to `config/serviceAccountKey.json`
   - Update `.env` with your configuration:
   ```env
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   GEMINI_API_KEY=your-gemini-key (optional)
   ```

3. **Start the Server**
   ```bash
   npm start        # Production
   npm run dev      # Development with nodemon
   ```

4. **Verify Installation**
   - Health Check: http://localhost:3001/api/health
   - Features List: http://localhost:3001/api/test/features
   - Firebase Test: http://localhost:3001/api/test/firebase

## 📚 API Documentation

### Health & Testing
```
GET  /api/health              # Server health check
GET  /api/test/firebase       # Test Firebase connection
GET  /api/test/features       # List all available features
```

### Authentication
```
POST /api/auth/register       # Register new user
POST /api/auth/login          # User login
POST /api/auth/logout         # User logout
POST /api/auth/forgot-password # Send password reset
POST /api/auth/reset-password  # Reset password
GET  /api/auth/verify-email   # Verify email
POST /api/auth/refresh        # Refresh JWT token
```

### User Profile
```
GET  /api/user/profile        # Get user profile
PUT  /api/user/profile        # Update profile
POST /api/user/avatar         # Upload avatar
PUT  /api/user/preferences    # Update preferences
DELETE /api/user/account      # Delete account
GET  /api/user/subscription   # Get subscription
GET  /api/user/stats          # Get user statistics
```

### Resume Management
```
POST /api/resume/parse        # Parse uploaded resume
GET  /api/resume              # Get latest resume
GET  /api/resume/all          # Get all resumes
DELETE /api/resume/:id        # Delete resume
POST /api/resume/build        # Build new resume
POST /api/resume/upload       # Upload resume file
```

### AI Career Tools
```
POST /api/skill-gaps          # Analyze skill gaps
POST /api/roadmap             # Generate career roadmap
POST /api/chat                # AI chat assistant
```

## 🔒 Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

### Example Registration
```javascript
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe"
}
```

### Example Login Response
```javascript
{
  "success": true,
  "message": "Login successful",
  "data": {
    "uid": "user-id",
    "email": "user@example.com",
    "fullName": "John Doe",
    "customToken": "jwt-token",
    "emailVerified": false
  }
}
```

## 📝 Resume Parsing

### Upload and Parse Resume
```javascript
POST /api/resume/parse
Content-Type: multipart/form-data
Authorization: Bearer <token>

Form Data:
- file: resume.pdf (or .docx)
- template: "professional" (optional)
```

### Response Example
```javascript
{
  "success": true,
  "message": "Resume parsed successfully",
  "data": {
    "resumeId": "unique-id",
    "personalInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-234-567-8900"
    },
    "experience": [...],
    "education": [...],
    "skills": [...]
  }
}
```

## 🤖 AI Features

### Skill Gap Analysis
```javascript
POST /api/skill-gaps
Content-Type: application/json
Authorization: Bearer <token>

{
  "resumeId": "resume-id",
  "targetRole": "Senior Software Engineer",
  "targetCompany": "Google" // optional
}
```

### Career Roadmap Generation
```javascript
POST /api/roadmap
Content-Type: application/json
Authorization: Bearer <token>

{
  "currentRole": "Junior Developer",
  "targetRole": "Senior Software Engineer",
  "timeframe": "2 years",
  "preferences": {
    "industry": "tech",
    "workStyle": "remote"
  }
}
```

### AI Chat Assistant
```javascript
POST /api/chat
Content-Type: application/json
Authorization: Bearer <token>

{
  "message": "How can I improve my resume for a data science role?",
  "sessionId": "chat-session-id", // optional
  "context": {
    "resumeId": "resume-id" // optional
  }
}
```

## 🔧 Configuration

### Environment Variables
```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json

# AI Services (Optional)
GEMINI_API_KEY=your-gemini-api-key

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication, Firestore, and Storage
3. Generate a service account key
4. Place the key in `config/serviceAccountKey.json`

## 🚨 Error Handling

All endpoints return consistent error responses:
```javascript
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)",
  "code": "ERROR_CODE" // optional
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes
- **CORS Protection**: Configurable allowed origins
- **Helmet**: Security headers
- **Input Validation**: Express-validator
- **File Upload Limits**: 10MB for resumes, 5MB for avatars
- **JWT Tokens**: Firebase custom tokens
- **Firebase Rules**: Server-side validation

## 📊 Monitoring

### Health Checks
- Server Status: `/api/health`
- Firebase Connection: `/api/test/firebase`
- Feature List: `/api/test/features`

### Logging
- Request logging with Morgan
- Error logging to console
- Firebase operation logging

## 🚀 Deployment

### Google Cloud Run (Recommended)
1. Build Docker container
2. Push to Google Container Registry
3. Deploy to Cloud Run
4. Configure environment variables

### Environment Setup
```bash
# Development
npm run dev

# Production
npm start

# Testing
npm test
```

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper error handling
3. Include input validation
4. Update documentation
5. Test all endpoints

## 📞 Support

For support and questions:
- Check the health endpoint: `/api/health`
- Review error responses for debugging
- Ensure Firebase configuration is correct
- Verify environment variables

---

**CareerGenie Backend** - Empowering careers through AI-driven insights! 🚀
