@echo off
setlocal enabledelayedexpansion

:: Set your project directory name (change this to your actual project folder name)
set PROJECT_NAME=uangku-zai3
set PROJECT_PATH=%~dp0
set NODE_PATH=node
set DEV_SERVER=http://localhost:3000

:: Change to project directory
cd /d "!PROJECT_PATH!"

:: Check if package.json exists
if not exist "package.json" (
    echo Error: package.json not found in !PROJECT_PATH!
    pause
    exit /b 1
)

:: Run npm install if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
)

:: Start the development server in a new window and open browser
start "" "chrome.exe" --app=!DEV_SERVER!
call npm run dev

:: Keep the window open
pause