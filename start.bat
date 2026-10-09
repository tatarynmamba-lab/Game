@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install Node.js, then run this file again.
  echo See README.md for instructions.
  pause
  exit /b 1
)
node server.js --open
pause
