#!/bin/bash

# RecipeGenius Project Setup Script
# This script sets up the entire RecipeGenius application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Node.js version
check_node_version() {
    local required_version="16"
    local current_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    
    if [ "$current_version" -lt "$required_version" ]; then
        print_error "Node.js version $required_version or higher is required. Current version: $current_version"
        return 1
    fi
    return 0
}

# Function to install dependencies
install_dependencies() {
    print_header "📦 Installing Dependencies"
    
    # Backend dependencies
    if [ -d "backend" ]; then
        print_status "Installing backend dependencies..."
        cd backend
        npm install
        cd ..
    fi
    
    # Frontend dependencies
    if [ -d "frontend" ]; then
        print_status "Installing frontend dependencies..."
        cd frontend
        npm install
        cd ..
    fi
    
    print_status "✅ Dependencies installed successfully!"
}

# Function to setup environment files
setup_environment() {
    print_header "🔧 Setting up environment files"
    
    # Backend .env
    if [ -d "backend" ] && [ ! -f "backend/.env" ]; then
        print_status "Creating backend .env file..."
        cat > backend/.env << EOF
# RecipeGenius Backend Environment Variables
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/recipegenius

# Authentication (Get these from https://clerk.com)
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here

# External APIs (Get from https://spoonacular.com/food-api)
SPOONACULAR_API_KEY=your_spoonacular_api_key_here

# Optional: For production
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipegenius
EOF
        print_status "✅ Backend .env file created"
    fi
    
    # Frontend .env
    if [ -d "frontend" ] && [ ! -f "frontend/.env" ]; then
        print_status "Creating frontend .env file..."
        cat > frontend/.env << EOF
# RecipeGenius Frontend Environment Variables
REACT_APP_API_URL=http://localhost:5000
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here
REACT_APP_SPOONACULAR_API_KEY=your_spoonacular_api_key_here
EOF
        print_status "✅ Frontend .env file created"
    fi
    
    print_warning "⚠️  Please update the .env files with your actual API keys!"
}

# Function to check prerequisites
check_prerequisites() {
    print_header "🔍 Checking prerequisites"
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    
    if ! check_node_version; then
        exit 1
    fi
    
    print_status "✅ Node.js $(node -v) is installed"
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    
    print_status "✅ npm $(npm -v) is installed"
    
    # Check MongoDB (optional)
    if command_exists mongod; then
        print_status "✅ MongoDB is installed"
    else
        print_warning "⚠️  MongoDB is not installed locally. You'll need to use MongoDB Atlas or install MongoDB."
    fi
    
    # Check Git
    if command_exists git; then
        print_status "✅ Git is installed"
    else
        print_warning "⚠️  Git is not installed. You may need it for version control."
    fi
    
    # Check Docker (optional)
    if command_exists docker; then
        print_status "✅ Docker is installed"
    else
        print_warning "⚠️  Docker is not installed. You won't be able to use Docker deployment."
    fi
}

# Function to start development servers
start_development() {
    print_header "🚀 Starting development servers"
    
    # Check if MongoDB is running
    if ! pgrep mongod > /dev/null; then
        print_warning "⚠️  MongoDB is not running. Please start MongoDB first."
        print_status "You can start MongoDB with: sudo systemctl start mongod"
        print_status "Or use MongoDB Atlas cloud database."
    fi
    
    # Start backend in background
    if [ -d "backend" ]; then
        print_status "Starting backend server..."
        cd backend
        npm run dev &
        BACKEND_PID=$!
        cd ..
        sleep 3
        print_status "✅ Backend server started (PID: $BACKEND_PID)"
    fi
    
    # Start frontend
    if [ -d "frontend" ]; then
        print_status "Starting frontend server..."
        cd frontend
        npm start &
        FRONTEND_PID=$!
        cd ..
        sleep 3
        print_status "✅ Frontend server started (PID: $FRONTEND_PID)"
    fi
    
    print_status "🎉 Development servers are starting!"
    print_status "📱 Frontend: http://localhost:3000"
    print_status "🔧 Backend: http://localhost:5000"
    print_status "Press Ctrl+C to stop all servers"
    
    # Wait for user input to stop servers
    trap 'kill $BACKEND_PID $FRONTEND_PID 2>/dev/null' EXIT
    read -p "Press Enter to stop servers..."
}

# Function to run tests
run_tests() {
    print_header "🧪 Running tests"
    
    # Backend tests
    if [ -d "backend" ] && [ -f "backend/package.json" ]; then
        if grep -q "test" backend/package.json; then
            print_status "Running backend tests..."
            cd backend
            npm test
            cd ..
        fi
    fi
    
    # Frontend tests
    if [ -d "frontend" ] && [ -f "frontend/package.json" ]; then
        if grep -q "test" frontend/package.json; then
            print_status "Running frontend tests..."
            cd frontend
            npm test -- --watchAll=false
            cd ..
        fi
    fi
    
    print_status "✅ Tests completed!"
}

# Function to build for production
build_production() {
    print_header "🏗️  Building for production"
    
    # Build backend
    if [ -d "backend" ]; then
        print_status "Building backend..."
        cd backend
        npm install --production
        cd ..
    fi
    
    # Build frontend
    if [ -d "frontend" ]; then
        print_status "Building frontend..."
        cd frontend
        npm run build
        cd ..
    fi
    
    print_status "✅ Production build completed!"
}

# Function to setup with Docker
setup_docker() {
    print_header "🐳 Setting up with Docker"
    
    if ! command_exists docker; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Create .env file for Docker
    if [ ! -f ".env" ]; then
        cp .env.example .env
        print_status "Created .env file from .env.example"
        print_warning "⚠️  Please update .env with your actual values!"
    fi
    
    # Build and start containers
    print_status "Building and starting Docker containers..."
    docker-compose up --build -d
    
    print_status "✅ Docker setup completed!"
    print_status "🌐 Application is available at: http://localhost:3000"
    print_status "🔧 API is available at: http://localhost:5000"
    print_status "Use 'docker-compose logs -f' to view logs"
    print_status "Use 'docker-compose down' to stop containers"
}

# Function to show help
show_help() {
    echo "🍽️ RecipeGenius Setup Script"
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  setup      Complete setup (default)"
    echo "  install    Install dependencies only"
    echo "  env        Setup environment files only"
    echo "  start      Start development servers"
    echo "  test       Run tests"
    echo "  build      Build for production"
    echo "  docker     Setup with Docker"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup    # Complete setup"
    echo "  $0 docker   # Setup with Docker"
    echo "  $0 start    # Start development servers"
}

# Main function
main() {
    local action=${1:-setup}
    
    case $action in
        setup)
            print_header "🍽️ RecipeGenius Complete Setup"
            check_prerequisites
            install_dependencies
            setup_environment
            print_status "🎉 Setup completed!"
            print_status "Next steps:"
            print_status "1. Update .env files with your API keys"
            print_status "2. Start MongoDB (if using local installation)"
            print_status "3. Run './setup.sh start' to start development servers"
            ;;
        install)
            install_dependencies
            ;;
        env)
            setup_environment
            ;;
        start)
            start_development
            ;;
        test)
            run_tests
            ;;
        build)
            build_production
            ;;
        docker)
            setup_docker
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown option: $action"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
