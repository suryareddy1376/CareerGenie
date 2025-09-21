# 🚀 CareerGenie Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Production environment variables configured
- [ ] Firebase service account key secured
- [ ] Vertex AI API key validated
- [ ] Database connections tested
- [ ] CORS settings updated for production domains

### ✅ Security Checklist
- [ ] All sensitive data in environment variables
- [ ] Service account key not in version control
- [ ] Rate limiting configured
- [ ] HTTPS enforced
- [ ] Security headers implemented

### ✅ Performance Optimization
- [ ] Frontend build optimized
- [ ] Images compressed
- [ ] API response caching implemented
- [ ] Database queries optimized
- [ ] CDN configured for static assets

## 🌐 Deployment Options

### Option 1: Netlify + Railway (Recommended)

#### Frontend (Netlify)
1. **Connect Repository**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Netlify Configuration**
   - Build command: `npm run build`
   - Publish directory: `Frontend/dist`
   - Environment variables: Copy from `Frontend/.env.production`

3. **Custom Domain Setup**
   - Add your domain in Netlify dashboard
   - Update DNS records as instructed

#### Backend (Railway)
1. **Deploy to Railway**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Environment Variables**
   - Add all variables from `Backend/.env.production`
   - Upload service account key securely

### Option 2: Vercel (Frontend) + Railway (Backend)

#### Frontend (Vercel)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd Frontend
vercel --prod
```

#### Backend (Railway)
Same as Option 1 backend deployment.

### Option 3: Docker Deployment

#### Build and Run
```bash
# Build the Docker image
docker build -t careergenie .

# Run with environment variables
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e FIREBASE_PROJECT_ID=carrergenie-55e58 \
  -v $(pwd)/Backend/config/serviceAccountKey.json:/app/config/serviceAccountKey.json:ro \
  careergenie
```

#### Docker Compose
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Option 4: Google Cloud Platform

#### App Engine Deployment
```bash
# Install Google Cloud SDK
# Create app.yaml in Backend directory

# Deploy
cd Backend
gcloud app deploy
```

#### Cloud Run Deployment
```bash
# Build and push to Container Registry
docker build -t gcr.io/carrergenie-55e58/careergenie .
docker push gcr.io/carrergenie-55e58/careergenie

# Deploy to Cloud Run
gcloud run deploy careergenie \
  --image gcr.io/carrergenie-55e58/careergenie \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 🔧 Post-Deployment Configuration

### 1. Update Environment Variables
After deployment, update these URLs:

**Frontend Environment:**
```env
VITE_API_URL=https://your-backend-domain.com
```

**Backend Environment:**
```env
FRONTEND_URL=https://your-frontend-domain.com
```

### 2. Firebase Configuration
1. Go to Firebase Console
2. Add production domains to authorized domains
3. Update CORS settings if needed

### 3. Database Setup
1. Verify Firestore security rules
2. Test database connections
3. Run any necessary migrations

### 4. SSL/HTTPS Setup
1. Ensure HTTPS is enabled
2. Update security headers
3. Test all endpoints with HTTPS

## 🧪 Testing Deployment

### Health Checks
```bash
# Backend health
curl https://your-backend-domain.com/health

# Frontend accessibility
curl https://your-frontend-domain.com

# API functionality
curl -X POST https://your-backend-domain.com/api/auth/test
```

### Feature Testing
1. **Authentication Flow**
   - User registration
   - Login/logout
   - Password reset

2. **Core Features**
   - Resume upload
   - AI analysis
   - Career recommendations
   - Skill gap analysis

3. **Performance Testing**
   - Page load times
   - API response times
   - File upload performance

## 🔍 Monitoring & Maintenance

### Logging Setup
1. Configure application logging
2. Set up error tracking (Sentry)
3. Monitor API usage and performance

### Backup Strategy
1. Database backups
2. File storage backups
3. Configuration backups

### Updates & Maintenance
1. Regular dependency updates
2. Security patches
3. Performance monitoring
4. User feedback integration

## 🚨 Troubleshooting

### Common Issues

#### CORS Errors
- Update FRONTEND_URL in backend environment
- Check Firebase authorized domains

#### Authentication Issues
- Verify Firebase configuration
- Check API key permissions
- Validate service account setup

#### AI Service Errors
- Confirm Vertex AI API key
- Check API quotas and limits
- Verify project permissions

#### Database Connection Issues
- Test Firestore connectivity
- Check security rules
- Verify service account permissions

### Emergency Rollback
```bash
# Revert to previous deployment
git revert HEAD
git push origin main

# Or rollback specific service
railway rollback
vercel rollback
```

## 📊 Success Metrics

### Performance Targets
- Page load time: < 3 seconds
- API response time: < 500ms
- Uptime: > 99.9%
- Error rate: < 1%

### User Experience
- Authentication success rate: > 95%
- Resume parsing accuracy: > 90%
- AI feature availability: > 99%

## 🎉 Go Live Checklist

- [ ] All services deployed and accessible
- [ ] SSL certificates active
- [ ] Environment variables configured
- [ ] Database connections verified
- [ ] Authentication working
- [ ] AI features functional
- [ ] Monitoring setup complete
- [ ] Backup strategy implemented
- [ ] Documentation updated
- [ ] Team notified of go-live

**Your CareerGenie platform is ready for production! 🚀**