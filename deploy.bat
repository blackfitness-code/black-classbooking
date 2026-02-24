@echo off
REM Yoga Booking App Deployment Script for Windows

echo 🚀 Starting deployment process...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI is not installed. Please install it first:
    echo npm install -g firebase-tools
    exit /b 1
)

REM Check if logged in to Firebase
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not logged in to Firebase. Please login first:
    echo firebase login
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

echo 📦 Installing client dependencies...
cd client
call npm install
cd ..

echo 📦 Installing server dependencies...
cd server
call npm install
cd ..

REM Build client
echo 🏗️ Building client...
cd client
call npm run build
cd ..

REM Deploy to Firebase
echo 🚀 Deploying to Firebase...
call firebase deploy

echo ✅ Deployment completed!
echo.
echo 🌐 Your app is now live!
echo Check Firebase Console for URLs
echo.
echo 📝 Don't forget to:
echo 1. Update LIFF Endpoint URL in LINE Developers Console
echo 2. Update VITE_API_BASE_URL in client/.env.production
echo 3. Test the deployed application

pause