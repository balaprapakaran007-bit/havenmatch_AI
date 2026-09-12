@echo off
title HavenMatch AI — Full Stack Launcher
echo ========================================================
echo   Starting HavenMatch AI — Database & Frontend Services
echo ========================================================

echo.
echo [1/2] Starting MongoDB Backend API Server on port 5000...
start "HavenMatch Backend API" cmd /k "cd /d %~dp0server && node server.js"

timeout /t 2 /nobreak >nul

echo.
echo [2/2] Starting Frontend Vite Server on port 5173...
start "HavenMatch Frontend" cmd /k "cd /d %~dp0havenmatch && npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ========================================================
echo   HavenMatch AI Services are LIVE!
echo   Frontend URL: http://localhost:5173/
echo   Backend URL:  http://localhost:5000/
echo ========================================================
echo.
pause
