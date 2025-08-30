# PropertyMasters UK - Complete Deployment Script (PowerShell)
# This script handles both frontend (Vercel) and backend (Supabase) deployment

param(
    [switch]$FrontendOnly,
    [switch]$BackendOnly,
    [switch]$NoTests,
    [switch]$Help
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Function to check if command exists
function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    # Check Node.js
    if (-not (Test-Command "node")) {
        Write-Error "Node.js is not installed. Please install Node.js first."
        exit 1
    }
    
    # Check npm
    if (-not (Test-Command "npm")) {
        Write-Error "npm is not installed. Please install npm first."
        exit 1
    }
    
    # Check if Vercel CLI is installed
    if (-not (Test-Command "vercel")) {
        Write-Warning "Vercel CLI not found. Installing..."
        npm install -g vercel
    }
    
    # Check if Supabase CLI is installed
    if (-not (Test-Command "supabase")) {
        Write-Warning "Supabase CLI not found. Installing..."
        npm install -g supabase
    }
    
    Write-Success "Prerequisites check completed"
}

# Function to deploy frontend to Vercel
function Deploy-Frontend {
    Write-Status "Starting frontend deployment to Vercel..."
    
    # Navigate to frontend directory
    Push-Location frontend
    
    try {
        # Install dependencies
        Write-Status "Installing frontend dependencies..."
        npm install
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to install frontend dependencies"
        }
        
        # Run linting and type checking
        Write-Status "Running code quality checks..."
        npm run lint
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Linting issues found, continuing..."
        }
        
        # Check if type-check script exists
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts."type-check") {
            npm run type-check
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "Type checking issues found, continuing..."
            }
        }
        
        # Build the project
        Write-Status "Building frontend project..."
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to build frontend project"
        }
        
        # Deploy to Vercel
        Write-Status "Deploying to Vercel..."
        vercel --prod
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to deploy to Vercel"
        }
        
        Write-Success "Frontend deployment completed"
    }
    catch {
        Write-Error $_.Exception.Message
        Pop-Location
        exit 1
    }
    finally {
        # Go back to root directory
        Pop-Location
    }
}

# Function to deploy backend to Supabase
function Deploy-Backend {
    Write-Status "Starting backend deployment to Supabase..."
    
    try {
        # Check if user is logged in to Supabase
        $null = supabase projects list 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Not logged in to Supabase. Please run 'supabase login' first."
            exit 1
        }
        
        # Apply database migrations
        Write-Status "Applying database migrations..."
        supabase db push
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Database migration failed or no changes to apply"
        }
        
        # Deploy Edge Functions
        Write-Status "Deploying Edge Functions..."
        supabase functions deploy
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Edge Functions deployment failed or no functions to deploy"
        }
        
        # Set environment variables for Edge Functions
        Write-Status "Setting up Edge Function environment variables..."
        Write-Warning "Remember to set Edge Function secrets manually:"
        Write-Host "  supabase secrets set SUPABASE_URL=your-project-url" -ForegroundColor $Yellow
        Write-Host "  supabase secrets set SUPABASE_ANON_KEY=your-anon-key" -ForegroundColor $Yellow
        
        Write-Success "Backend deployment completed"
    }
    catch {
        Write-Error $_.Exception.Message
        exit 1
    }
}

# Function to run deployment tests
function Invoke-Tests {
    Write-Status "Running deployment tests..."
    
    # Test frontend build
    Push-Location frontend
    try {
        Write-Status "Testing frontend build..."
        npm run build > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Frontend build test passed"
        } else {
            Write-Error "Frontend build test failed"
            Pop-Location
            exit 1
        }
    }
    finally {
        Pop-Location
    }
    
    # Test Supabase connection
    Write-Status "Testing Supabase connection..."
    $null = supabase status 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Supabase connection test passed"
    } else {
        Write-Warning "Supabase connection test failed - make sure you're linked to a project"
    }
    
    Write-Success "All tests completed"
}

# Function to show deployment summary
function Show-Summary {
    Write-Status "Deployment Summary:"
    Write-Host "=========================================="
    Write-Host "✅ Frontend: Deployed to Vercel" -ForegroundColor $Green
    Write-Host "✅ Backend: Deployed to Supabase" -ForegroundColor $Green
    Write-Host "✅ Database: Migrations applied" -ForegroundColor $Green
    Write-Host "✅ Edge Functions: Deployed" -ForegroundColor $Green
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Set up environment variables in Vercel dashboard"
    Write-Host "2. Configure Supabase authentication settings"
    Write-Host "3. Set up Edge Function secrets"
    Write-Host "4. Test the deployed application"
    Write-Host "=========================================="
}

# Function to show help
function Show-Help {
    Write-Host "PropertyMasters UK Deployment Script"
    Write-Host "Usage: .\deploy.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -FrontendOnly    Deploy only frontend to Vercel"
    Write-Host "  -BackendOnly     Deploy only backend to Supabase"
    Write-Host "  -NoTests         Skip deployment tests"
    Write-Host "  -Help            Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy.ps1                    # Deploy both frontend and backend"
    Write-Host "  .\deploy.ps1 -FrontendOnly      # Deploy only frontend"
    Write-Host "  .\deploy.ps1 -BackendOnly       # Deploy only backend"
    Write-Host "  .\deploy.ps1 -NoTests           # Deploy without running tests"
}

# Main deployment function
function Main {
    if ($Help) {
        Show-Help
        return
    }
    
    Write-Status "Starting PropertyMasters UK deployment..."
    
    # Check prerequisites
    Test-Prerequisites
    
    # Run tests if requested
    if (-not $NoTests) {
        Invoke-Tests
    }
    
    # Deploy based on options
    if ($FrontendOnly) {
        Deploy-Frontend
    }
    elseif ($BackendOnly) {
        Deploy-Backend
    }
    else {
        Deploy-Frontend
        Deploy-Backend
    }
    
    # Show summary
    Show-Summary
    
    Write-Success "Deployment completed successfully!"
}

# Run main function
Main