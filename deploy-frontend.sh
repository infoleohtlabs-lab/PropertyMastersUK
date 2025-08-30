#!/bin/bash

# PropertyMasters UK Frontend Deployment Script for Vercel

echo "🚀 Starting PropertyMasters UK Frontend Deployment to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Navigate to project root
cd "$(dirname "$0")"

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Build the frontend
echo "🔨 Building frontend..."
npm run build

# Go back to root
cd ..

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Frontend deployment completed!"
echo "📝 Don't forget to:"
echo "   1. Set up environment variables in Vercel dashboard"
echo "   2. Configure your custom domain if needed"
echo "   3. Update VITE_API_URL to point to your Supabase backend"