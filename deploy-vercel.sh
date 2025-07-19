#!/bin/bash

# RecipeGenius Production Deployment Script for Vercel
# Run this script to prepare and deploy both frontend and backend

set -e

echo "🚀 Starting RecipeGenius production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the project root directory."
    exit 1
fi

print_status "Installing dependencies..."

# Install root dependencies
npm install

# Install frontend dependencies
print_status "Installing frontend dependencies..."
cd frontend
npm install
npm run build:production
cd ..

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
cd ..

print_success "All dependencies installed successfully!"

print_status "Running pre-deployment checks..."

# Check for required environment variables
if [ ! -f ".env.production" ]; then
    print_warning ".env.production file not found. Make sure to set environment variables in Vercel dashboard."
fi

print_status "Deploying to Vercel..."

# Deploy the project
if vercel --prod; then
    print_success "🎉 Deployment successful!"
    print_status "Your RecipeGenius app is now live!"
    print_status "Don't forget to:"
    print_status "1. Set environment variables in Vercel dashboard"
    print_status "2. Configure custom domain if needed"
    print_status "3. Set up monitoring and analytics"
else
    print_error "Deployment failed. Please check the logs above."
    exit 1
fi

print_success "✅ RecipeGenius deployment completed!"
