param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Write-Host "Repo root: $repoRoot"

# Build backend (Maven)
Write-Host "[1/3] Building backend (Maven)" -ForegroundColor Cyan
Push-Location "$repoRoot\backend"
try {
    mvn -DskipTests clean package
    if ($LASTEXITCODE -ne 0) { throw "Backend build failed with exit code $LASTEXITCODE" }
}
finally { Pop-Location }

# Install frontend deps (npm)
Write-Host "[2/3] Installing frontend dependencies (npm install)" -ForegroundColor Cyan
Push-Location "$repoRoot\frontend"
try {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "Frontend npm install failed with exit code $LASTEXITCODE" }

    # Build frontend (webpack/expo web build)
    Write-Host "[3/3] Building frontend (npm run build)" -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed with exit code $LASTEXITCODE" }
}
finally { Pop-Location }

Write-Host "Build completed successfully." -ForegroundColor Green

