#!/bin/bash

# Yoga Booking App Deployment Script

echo "🚀 Starting deployment process..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Build client
echo "🏗️ Building client..."
cd client
npm run build
cd ..

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy

echo "✅ Deployment completed!"
echo ""
echo "🌐 Your app is now live at:"
echo "Frontend: https://$(firebase use | grep -o '[^[:space:]]*').web.app"
echo "Backend: https://$(firebase functions:config:get | grep -o 'your-region-[^[:space:]]*').cloudfunctions.net/api"
echo ""
echo "📝 Don't forget to:"
echo "1. Update LIFF Endpoint URL in LINE Developers Console"
echo "2. Update VITE_API_BASE_URL in client/.env.production"
echo "3. Test the deployed application"