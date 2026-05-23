# Start Zoom Clone frontend (clears locked .next cache on Windows)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\frontend

if (Test-Path ".next") {
  Write-Host "Removing .next cache..."
  Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 1
}

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing npm packages..."
  npm install
}

$env:NEXT_TELEMETRY_DISABLED = "1"
Write-Host "Starting frontend at http://localhost:3000"
npm run dev
