# 🚀 RecipeGenius - Production Deployment Guide

## Overview
This guide will help you deploy RecipeGenius to Vercel for production use. The application consists of a React frontend and Node.js backend, both optimized for Vercel's serverless platform.

## 📋 Prerequisites

### Required Accounts & Services
- [Vercel Account](https://vercel.com) (free tier available)
- [MongoDB Atlas](https://mongodb.com/atlas) (free tier available)
- [Clerk Account](https://clerk.dev) (free tier available)
- [Spoonacular API](https://spoonacular.com/food-api) (free tier available)

### Local Requirements
- Node.js 18+ 
- npm or yarn
- Git
- Vercel CLI: `npm install -g vercel`

## 🎯 Deployment Strategy

### Option 1: Monorepo Deployment (Recommended)
Deploy both frontend and backend from a single repository with automatic routing.

### Option 2: Separate Deployments
Deploy frontend and backend as separate Vercel projects.

## 🔧 Step-by-Step Deployment

### 1. Prepare Your Repository

```bash
# Clone your repository
git clone https://github.com/TechyCSR/RecipeGenerator.git
cd RecipeGenerator

# Install dependencies
chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

### 2. Set Up Environment Variables

#### Frontend Environment Variables (Vercel Dashboard)
```env
REACT_APP_API_URL=https://your-backend-deployment.vercel.app
REACT_APP_ENVIRONMENT=production
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_live_your_live_key
REACT_APP_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_PWA=true
```

#### Backend Environment Variables (Vercel Dashboard)
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipegenius
CLERK_SECRET_KEY=sk_live_your_live_secret_key
SPOONACULAR_API_KEY=your_spoonacular_api_key
JWT_SECRET=your_super_secure_jwt_secret
FRONTEND_URL=https://your-frontend-domain.vercel.app
ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,https://custom-domain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI
```bash
# Login to Vercel
vercel login

# Deploy
vercel --prod
```

#### Option B: Using GitHub Integration
1. Connect your GitHub repository to Vercel
2. Configure build settings:
   - **Build Command**: `cd frontend && npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `npm run install-all`

### 4. Configure Custom Domain (Optional)

```bash
# Add custom domain
vercel domains add yourdomain.com
vercel alias your-deployment-url yourdomain.com
```

## 🔐 Security Configuration

### 1. Environment Variables Security
- Never commit `.env` files to Git
- Use Vercel's environment variables dashboard
- Rotate API keys regularly
- Use different keys for development and production

### 2. CORS Configuration
The backend is configured to only allow requests from your frontend domain. Update `ALLOWED_ORIGINS` in your environment variables.

### 3. Rate Limiting
- Production: 100 requests per 15 minutes per IP
- Configurable via environment variables
- Automatic scaling with Vercel

## 📊 Monitoring & Analytics

### 1. Vercel Analytics
Enable in your Vercel dashboard under Analytics tab.

### 2. Google Analytics
Set `REACT_APP_GOOGLE_ANALYTICS_ID` in environment variables.

### 3. Error Tracking
Consider adding Sentry:
```bash
npm install @sentry/react @sentry/node
```

## 🚀 Performance Optimizations

### Frontend Optimizations
- ✅ Code splitting with React.lazy()
- ✅ Image optimization with Vercel
- ✅ Static asset caching
- ✅ PWA capabilities
- ✅ Gzip compression

### Backend Optimizations
- ✅ Response compression
- ✅ Database connection pooling
- ✅ API caching headers
- ✅ Rate limiting
- ✅ Security headers

## 📱 Mobile & PWA Support

### Progressive Web App Features
- ✅ Service Worker
- ✅ Web App Manifest
- ✅ Offline functionality
- ✅ Install prompts
- ✅ Push notifications (optional)

### Mobile Optimization
- ✅ Responsive design
- ✅ Touch-friendly UI
- ✅ Fast loading times
- ✅ Mobile-first approach

## 🔄 CI/CD Pipeline

### Automatic Deployments
- **Main Branch**: Production deployment
- **Develop Branch**: Preview deployment
- **Feature Branches**: Preview deployments

### Build Process
1. Install dependencies
2. Run tests (if available)
3. Build frontend
4. Deploy to Vercel
5. Run post-deployment checks

## 📋 Post-Deployment Checklist

### ✅ Functionality Tests
- [ ] User authentication (Clerk)
- [ ] Recipe search and display
- [ ] Pantry management
- [ ] Grocery list creation
- [ ] Recipe saving/bookmarking
- [ ] Dark mode toggle
- [ ] Mobile responsiveness

### ✅ Performance Tests
- [ ] Page load times < 3 seconds
- [ ] API response times < 2 seconds
- [ ] Image optimization working
- [ ] PWA installation working

### ✅ Security Tests
- [ ] HTTPS enabled
- [ ] Security headers present
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Environment variables secured

## 🐛 Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear caches
npm run clean
rm -rf node_modules package-lock.json
npm install
```

#### 2. API Connection Issues
- Check `REACT_APP_API_URL` environment variable
- Verify CORS configuration
- Check network connectivity

#### 3. Authentication Issues
- Verify Clerk configuration
- Check redirect URLs
- Verify API keys

#### 4. Database Connection Issues
- Check MongoDB Atlas whitelist
- Verify connection string
- Check network policies

### Getting Help
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Project Issues](https://github.com/TechyCSR/RecipeGenerator/issues)

## 📈 Scaling Considerations

### Database Scaling
- MongoDB Atlas auto-scaling
- Connection pooling
- Read replicas for heavy read operations

### Application Scaling
- Vercel automatically scales serverless functions
- Consider CDN for static assets
- Implement caching strategies

### Cost Optimization
- Monitor Vercel usage dashboard
- Optimize bundle sizes
- Use appropriate MongoDB Atlas tier

## 🔄 Updates & Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Monitor error logs weekly
- [ ] Review analytics monthly
- [ ] Backup database regularly
- [ ] Rotate API keys quarterly

### Version Updates
```bash
# Update dependencies
npm update
cd frontend && npm update
cd ../backend && npm update

# Test locally
npm start

# Deploy updates
vercel --prod
```

## 📞 Support & Contact

For deployment support or questions:
- **Developer**: @TechyCSR
- **Website**: [techycsr.me](https://techycsr.me)
- **GitHub**: [TechyCSR/RecipeGenerator](https://github.com/TechyCSR/RecipeGenerator)

---

Made with ❤️ by [@TechyCSR](https://techycsr.me)
