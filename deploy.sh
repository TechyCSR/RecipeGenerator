#!/bin/bash

# RecipeGenius Backend Deployment Script
# This script helps deploy the backend to various platforms

set -e

echo "🍽️ RecipeGenius Backend Deployment Script"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Function to deploy to Heroku
deploy_to_heroku() {
    echo "🚀 Deploying to Heroku..."
    
    # Check if Heroku CLI is installed
    if ! command -v heroku &> /dev/null; then
        echo "❌ Heroku CLI is not installed. Please install it first."
        return 1
    fi
    
    # Check if user is logged in to Heroku
    if ! heroku auth:whoami &> /dev/null; then
        echo "❌ Please log in to Heroku first: heroku login"
        return 1
    fi
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install
    
    # Create Heroku app if it doesn't exist
    read -p "Enter your Heroku app name: " app_name
    if ! heroku apps:info $app_name &> /dev/null; then
        heroku create $app_name
    fi
    
    # Set environment variables
    echo "🔧 Setting up environment variables..."
    echo "Please set the following environment variables in Heroku:"
    echo "- MONGODB_URI"
    echo "- CLERK_SECRET_KEY"
    echo "- SPOONACULAR_API_KEY"
    echo "- NODE_ENV=production"
    
    read -p "Have you set all environment variables? (y/n): " env_set
    if [[ $env_set != "y" ]]; then
        echo "Please set environment variables and try again."
        return 1
    fi
    
    # Deploy to Heroku
    git add .
    git commit -m "Deploy to Heroku" || true
    git push heroku main
    
    echo "✅ Deployment to Heroku completed!"
    echo "🌐 Your app is available at: https://$app_name.herokuapp.com"
}

# Function to deploy to Railway
deploy_to_railway() {
    echo "🚀 Deploying to Railway..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "❌ Railway CLI is not installed. Installing..."
        npm install -g @railway/cli
    fi
    
    # Login to Railway
    railway login
    
    # Initialize Railway project
    railway init
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install
    
    # Deploy to Railway
    railway up
    
    echo "✅ Deployment to Railway completed!"
}

# Function to deploy to Render
deploy_to_render() {
    echo "🚀 Deploying to Render..."
    echo "📋 Please follow these steps:"
    echo "1. Go to https://render.com"
    echo "2. Connect your GitHub repository"
    echo "3. Create a new Web Service"
    echo "4. Set the following settings:"
    echo "   - Build Command: npm install"
    echo "   - Start Command: npm start"
    echo "   - Environment: Node"
    echo "5. Add environment variables:"
    echo "   - MONGODB_URI"
    echo "   - CLERK_SECRET_KEY"
    echo "   - SPOONACULAR_API_KEY"
    echo "   - NODE_ENV=production"
    
    read -p "Press Enter when deployment is complete..."
    echo "✅ Render deployment instructions provided!"
}

# Function to deploy locally with PM2
deploy_locally() {
    echo "🚀 Setting up local deployment with PM2..."
    
    # Install PM2 if not present
    if ! command -v pm2 &> /dev/null; then
        echo "📦 Installing PM2..."
        npm install -g pm2
    fi
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install
    
    # Create PM2 ecosystem file
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'recipegenius-backend',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOF
    
    # Start with PM2
    pm2 start ecosystem.config.js --env production
    pm2 save
    pm2 startup
    
    echo "✅ Local deployment with PM2 completed!"
    echo "🌐 Your app is running at: http://localhost:5000"
    echo "📊 Use 'pm2 monit' to monitor the application"
}

# Function to build and test
build_and_test() {
    echo "🔨 Building and testing..."
    
    # Install dependencies
    echo "📦 Installing dependencies..."
    npm install
    
    # Run tests if they exist
    if [ -f "package.json" ] && grep -q "test" package.json; then
        echo "🧪 Running tests..."
        npm test
    else
        echo "⚠️  No tests found"
    fi
    
    # Check for linting
    if [ -f "package.json" ] && grep -q "lint" package.json; then
        echo "🔍 Running linter..."
        npm run lint
    else
        echo "⚠️  No linting configured"
    fi
    
    echo "✅ Build and test completed!"
}

# Function to setup environment
setup_environment() {
    echo "🔧 Setting up environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# RecipeGenius Backend Environment Variables
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/recipegenius

# Authentication
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
CLERK_SECRET_KEY=your_clerk_secret_key_here

# External APIs
SPOONACULAR_API_KEY=your_spoonacular_api_key_here

# Optional: For production
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipegenius
EOF
        echo "✅ .env file created. Please fill in your API keys."
    else
        echo "⚠️  .env file already exists"
    fi
    
    # Install dependencies
    npm install
    
    echo "✅ Environment setup completed!"
}

# Main menu
echo "Please choose a deployment option:"
echo "1. Deploy to Heroku"
echo "2. Deploy to Railway"
echo "3. Deploy to Render (instructions)"
echo "4. Local deployment with PM2"
echo "5. Build and test only"
echo "6. Setup environment"
echo "7. Exit"

read -p "Enter your choice (1-7): " choice

case $choice in
    1)
        deploy_to_heroku
        ;;
    2)
        deploy_to_railway
        ;;
    3)
        deploy_to_render
        ;;
    4)
        deploy_locally
        ;;
    5)
        build_and_test
        ;;
    6)
        setup_environment
        ;;
    7)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice. Please try again."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment script completed!"
echo "📚 For more help, check the README.md file"
