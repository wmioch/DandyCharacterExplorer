# Dandy Character Explorer - PowerShell Server Launcher
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Dandy Character Explorer - Local Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing server on port 8000
Write-Host "Checking for existing server on port 8000..." -ForegroundColor Yellow
$port = 8000
$connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($connection) {
    $processId = $connection.OwningProcess
    Write-Host "Found existing server (PID: $processId), shutting it down..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
    Write-Host "Old server stopped." -ForegroundColor Green
} else {
    Write-Host "No existing server found." -ForegroundColor Green
}
Write-Host ""

Write-Host "Starting local web server on http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "Once started, open your browser to:" -ForegroundColor Yellow
Write-Host "  http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    python --version | Out-Null
    python -m http.server 8000
}
catch {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/downloads/" -ForegroundColor Yellow
    pause
}

