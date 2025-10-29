@echo off
echo ========================================
echo  Dandy Character Explorer - Local Server
echo ========================================
echo.

REM Kill any existing server on port 8000
echo Checking for existing server on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Found existing server with PID %%a, shutting it down...
    taskkill /F /PID %%a >nul 2>&1
    timeout /t 1 /nobreak >nul
    echo Old server stopped.
    goto :continue
)
echo No existing server found.

:continue
echo.
echo Starting local web server on http://localhost:8000
echo.
echo Once started, open your browser to:
echo   http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

python -m http.server 8000

