@echo off
echo Setting up Node.js project for advanced-localhoster...

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install Node.js and try again.
    exit /b 1
)

REM Create package.json if it doesn't exist
if not exist package.json (
    echo { "name": "advanced-localhoster", "version": "1.0.0", "main": "advanced-localhoster.js" } > package.json
)

REM Install dependencies
call npm install express helmet morgan express-rate-limit compression cors dotenv

REM Check if advanced-localhoster.js exists
if not exist advanced-localhoster.js (
    echo ERROR: advanced-localhoster.js not found.
    echo Please create this file with your Node.js server code.
) else (
    echo advanced-localhoster.js found.
)

REM Create public directory if it doesn't exist
if not exist public mkdir public

echo.
echo Setup complete. Here's how to use the server:
echo 1. Ensure your Node.js code is in advanced-localhoster.js
echo 2. Place your HTML and other static files in the 'public' directory.
echo 3. To start the server, run: node advanced-localhoster.js
echo 4. Open a web browser and go to http://localhost:3000 to view your site.
echo.
echo Would you like to start the server now? (Y/N)
set /p choice=
if /i "%choice%"=="Y" (
    node advanced-localhoster.js
) else (
    echo Server not started. You can run it later with: node advanced-localhoster.js
)