#!/bin/bash

echo "==================================="
echo "Nanobanana Web App Startup Script"
echo "==================================="
echo ""

# Check if .env exists in backend
if [ ! -f backend/.env ]; then
    echo "❌ Error: backend/.env file not found!"
    echo ""
    echo "Please create backend/.env file with your Gemini API key:"
    echo "  cd backend"
    echo "  cp .env.example .env"
    echo "  # Edit .env and add your GEMINI_API_KEY"
    echo ""
    exit 1
fi

# Check if node_modules exist
if [ ! -d "frontend/node_modules" ] || [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing dependencies..."
    echo ""

    echo "Installing frontend dependencies..."
    cd frontend && npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies"
        exit 1
    fi
    cd ..

    echo "Installing backend dependencies..."
    cd backend && npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install backend dependencies"
        exit 1
    fi
    cd ..

    echo "✅ Dependencies installed successfully"
    echo ""
fi

# Get local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo "🚀 Starting servers..."
echo ""
echo "Backend server: http://localhost:5000"
echo "Frontend server: http://localhost:3000"
echo ""
echo "📱 Access from mobile device:"
echo "   http://${LOCAL_IP}:3000"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start backend server in background
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 2

# Start frontend server
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait for any process to exit
wait

# Cleanup
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
