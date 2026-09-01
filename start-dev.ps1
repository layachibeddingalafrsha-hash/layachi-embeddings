# CABA ITALIE - Development Server Startup Script
# This script sets the required Node.js memory limit and starts the dev server

Write-Host "🚀 Starting CABA ITALIE Development Server..." -ForegroundColor Green
Write-Host ""

# Set Node.js memory limit to 8GB to prevent memory issues
$env:NODE_OPTIONS = "--max-old-space-size=8192"

Write-Host "✓ Node memory limit set to 8GB" -ForegroundColor Cyan
Write-Host "✓ Loading environment variables from .env.local" -ForegroundColor Cyan
Write-Host ""

# Start the dev server
npm run dev
