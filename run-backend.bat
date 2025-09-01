@echo off
echo Starting Limnus Backend Server...
echo.
echo Prerequisites:
echo    - Node.js installed
echo    - Dependencies installed (npm install or bun install)
echo.

REM Check if node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Get local IP address
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    for /f "tokens=1" %%b in ("%%a") do (
        set LOCAL_IP=%%b
        goto :found_ip
    )
)
:found_ip

echo Network Configuration:
echo    Local IP: %LOCAL_IP%
echo    Port: 3000
echo.
echo For mobile device connection:
echo    1. Make sure your phone is on the same WiFi network
echo    2. Set this environment variable in a new terminal:
echo.
echo    set EXPO_PUBLIC_RORK_API_BASE_URL=http://%LOCAL_IP%:3000
echo.
echo    3. Then run your Expo app: npm start
echo.
echo Starting backend server...
echo ================================
echo.

REM Set environment variables
set NODE_ENV=development
set PORT=3000
set JWT_SECRET=consciousness-field-secret-key-dev

REM Run the backend server
npx tsx backend/server.ts