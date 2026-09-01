# Fix Next.js CSS and ENOSPC issues
Write-Host "🔧 Fixing Next.js build issues..." -ForegroundColor Cyan

# 1. Kill any running Node processes
Write-Host "`n1️⃣ Stopping any running Node processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "✅ Stopped Node processes" -ForegroundColor Green

# 2. Clean Next.js cache
Write-Host "`n2️⃣ Cleaning Next.js cache..." -ForegroundColor Yellow
if (Test-Path .next) {
    Remove-Item .next -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Deleted .next folder" -ForegroundColor Green
}

# 3. Clean temp cache
Write-Host "`n3️⃣ Cleaning temporary cache..." -ForegroundColor Yellow
Remove-Item "$env:TEMP\next-*" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Cleaned temp cache" -ForegroundColor Green

# 4. Set environment variable to increase file watchers
Write-Host "`n4️⃣ Setting environment variables..." -ForegroundColor Yellow
$env:NODE_OPTIONS = "--max-old-space-size=4096"
Write-Host "✅ Set NODE_OPTIONS=$env:NODE_OPTIONS" -ForegroundColor Green

# 5. Start dev server
Write-Host "`n5️⃣ Starting Next.js development server..." -ForegroundColor Yellow
Write-Host "⏳ This may take 30-60 seconds..." -ForegroundColor Gray
Write-Host ""
npm run dev
