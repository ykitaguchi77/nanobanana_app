@echo off
setlocal enabledelayedexpansion

echo ===================================
echo Nanobanana Web App Startup Script
echo ===================================
echo.

REM Check if .env exists in backend
if not exist "backend\.env" (
    echo ❌ Error: backend\.env file not found!
    echo.
    echo Please create backend\.env file with your Gemini API key:
    echo   cd backend
    echo   copy .env.example .env
    echo   REM Edit .env and add your GEMINI_API_KEY
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exist
if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd ..
    echo.
)

if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    call npm install
    if errorlevel 1 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
    cd ..
    echo.
)

echo ✅ Dependencies ready
echo.

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "ip=%%a"
    set "ip=!ip:~1!"
    goto :ip_found
)
:ip_found

echo 🚀 Starting servers...
echo.
echo Backend server: http://localhost:5000
echo Frontend server: http://localhost:3000
echo.
echo 📱 Access from mobile device:
echo    http://!ip!:3000
echo.
echo Press Ctrl+C to stop all servers
echo.

REM Start backend server in new window
start "Nanobanana Backend" cmd /k "cd backend && npm run dev"

REM Wait a bit for backend to start
timeout /t 2 /nobreak > nul

REM Start frontend server in new window
start "Nanobanana Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ✅ Servers started in separate windows
echo.
pause
