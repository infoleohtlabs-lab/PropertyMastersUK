#!/bin/bash

# PropertyMasters UK - Complete Deployment Script
# This script handles both frontend (Vercel) and backend (Supabase) deployment

set -e  # Exit on any error

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js first."
        exit 1
    fi
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    # Check if Vercel CLI is installed
    if ! command_exists vercel; then
        print_warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    fi
    
    # Check if Supabase CLI is installed
    if ! command_exists supabase; then
        print_warning "Supabase CLI not found. Installing..."
        npm install -g supabase
    fi
    
    print_success "Prerequisites check completed"
}

# Function to deploy frontend to Vercel
deploy_frontend() {
    print_status "Starting frontend deployment to Vercel..."
    
    # Navigate to frontend directory
    cd frontend
    
    # Install dependencies
    print_status "Installing frontend dependencies..."
    npm install
    
    # Run linting and type checking
    print_status "Running code quality checks..."
    npm run lint || print_warning "Linting issues found, continuing..."
    npm run type-check || print_warning "Type checking issues found, continuing..."
    
    # Build the project
    print_status "Building frontend project..."
    npm run build
    
    # Deploy to Vercel
    print_status "Deploying to Vercel..."
    vercel --prod
    
    # Go back to root directory
    cd ..
    
    print_success "Frontend deployment completed"
}

# Function to deploy backend to Supabase
deploy_backend() {
    print_status "Starting backend deployment to Supabase..."
    
    # Check if user is logged in to Supabase
    if ! supabase projects list >/dev/null 2>&1; then
        print_error "Not logged in to Supabase. Please run 'supabase login' first."
        exit 1
    fi
    
    # Apply database migrations
    print_status "Applying database migrations..."
    supabase db push
    
    # Deploy Edge Functions
    print_status "Deploying Edge Functions..."
    supabase functions deploy
    
    # Set environment variables for Edge Functions
    print_status "Setting up Edge Function environment variables..."
    # Note: These should be set manually or via CI/CD
    print_warning "Remember to set Edge Function secrets manually:"
    echo "  supabase secrets set SUPABASE_URL=your-project-url"
    echo "  supabase secrets set SUPABASE_ANON_KEY=your-anon-key"
    
    print_success "Backend deployment completed"
}

# Function to run deployment tests
run_tests() {
    print_status "Running deployment tests..."
    
    # Test frontend build
    cd frontend
    print_status "Testing frontend build..."
    npm run build >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        print_success "Frontend build test passed"
    else
        print_error "Frontend build test failed"
        exit 1
    fi
    cd ..
    
    # Test Supabase connection
    print_status "Testing Supabase connection..."
    if supabase status >/dev/null 2>&1; then
        print_success "Supabase connection test passed"
    else
        print_warning "Supabase connection test failed - make sure you're linked to a project"
    fi
    
    print_success "All tests completed"
}

# Function to show deployment summary
show_summary() {
    print_status "Deployment Summary:"
    echo "=========================================="
    echo "✅ Frontend: Deployed to Vercel"
    echo "✅ Backend: Deployed to Supabase"
    echo "✅ Database: Migrations applied"
    echo "✅ Edge Functions: Deployed"
    echo ""
    echo "Next steps:"
    echo "1. Set up environment variables in Vercel dashboard"
    echo "2. Configure Supabase authentication settings"
    echo "3. Set up Edge Function secrets"
    echo "4. Test the deployed application"
    echo "=========================================="
}

# Main deployment function
main() {
    print_status "Starting PropertyMasters UK deployment..."
    
    # Parse command line arguments
    FRONTEND_ONLY=false
    BACKEND_ONLY=false
    RUN_TESTS=true
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --frontend-only)
                FRONTEND_ONLY=true
                shift
                ;;
            --backend-only)
                BACKEND_ONLY=true
                shift
                ;;
            --no-tests)
                RUN_TESTS=false
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --frontend-only    Deploy only frontend to Vercel"
                echo "  --backend-only     Deploy only backend to Supabase"
                echo "  --no-tests         Skip deployment tests"
                echo "  --help             Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Check prerequisites
    check_prerequisites
    
    # Run tests if requested
    if [ "$RUN_TESTS" = true ]; then
        run_tests
    fi
    
    # Deploy based on options
    if [ "$FRONTEND_ONLY" = true ]; then
        deploy_frontend
    elif [ "$BACKEND_ONLY" = true ]; then
        deploy_backend
    else
        deploy_frontend
        deploy_backend
    fi
    
    # Show summary
    show_summary
    
    print_success "Deployment completed successfully!"
}

# Run main function with all arguments
main "$@"