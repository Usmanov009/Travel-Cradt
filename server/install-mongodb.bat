@echo off
REM MongoDB Installation Script for Windows

echo.
echo ===================================
echo MongoDB Installation for TravelCraft
echo ===================================
echo.
echo Checking for Chocolatey...

where choco >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Chocolatey not found. Installing Chocolatey first...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    echo.
    echo Chocolatey installed. Please restart this script.
    pause
    exit /b
)

echo.
echo Installing MongoDB Community Edition...
choco install mongodb-community -y

echo.
echo Checking MongoDB installation...
mongod --version

echo.
echo ===================================
echo Installation complete!
echo ===================================
echo.
echo To start MongoDB, run one of these commands:
echo.
echo Option 1: Start MongoDB service (if installed as service):
echo   net start MongoDB
echo.
echo Option 2: Start MongoDB manually:
echo   mongod --dbpath "C:\data\db"
echo.
echo Then run the server with: npm start
echo.
pause
