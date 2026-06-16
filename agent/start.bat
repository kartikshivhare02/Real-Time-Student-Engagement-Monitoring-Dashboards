@echo off
title Student Engagement Monitor - Agent
color 0A
echo.
echo  ================================================
echo   Student Engagement Monitor - Starting Agent...
echo  ================================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERROR] Node.js is not installed!
    echo  Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

:: Install dependencies if not already installed
if not exist "node_modules" (
    echo  Installing dependencies... (first time only)
    echo.
    npm install
    echo.
)

:: Start the agent
node agent.js

pause
