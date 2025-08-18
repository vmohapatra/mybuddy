param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Write-Host "Repo root: $repoRoot"

# 1) Build backend
Write-Host "[1/4] Building backend (Maven)" -ForegroundColor Cyan
Push-Location "$repoRoot\backend"
try {
    mvn -DskipTests clean package
    if ($LASTEXITCODE -ne 0) { throw "Backend build failed with exit code $LASTEXITCODE" }
}
finally { Pop-Location }

# 2) Run backend (background job)
Write-Host "[2/4] Starting backend (Spring Boot)" -ForegroundColor Cyan
$backendJob = Start-Job -Name mybuddy-backend -ScriptBlock {
    Set-Location -Path "$using:repoRoot\backend"
    mvn -DskipTests spring-boot:run
}
Write-Host "Backend job started: $($backendJob.Id)" -ForegroundColor Green

# 3) Build frontend
Write-Host "[3/4] Installing and building frontend" -ForegroundColor Cyan
Push-Location "$repoRoot\frontend"
try {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "Frontend npm install failed with exit code $LASTEXITCODE" }
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Frontend build failed with exit code $LASTEXITCODE" }
}
finally { Pop-Location }

# 4) Run frontend (dev server)
Write-Host "[4/4] Starting frontend dev server (npm run web)" -ForegroundColor Cyan
Push-Location "$repoRoot\frontend"
try {
    npm run web
}
finally {
    Pop-Location
    # Cleanup backend when frontend stops
    $job = Get-Job -Name mybuddy-backend -ErrorAction SilentlyContinue
    if ($job) {
        Write-Host "Stopping backend job..." -ForegroundColor Yellow
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -ErrorAction SilentlyContinue
    }
}

Write-Host "All services stopped." -ForegroundColor Green

param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Write-Host "Repo root: $repoRoot"

# Start backend
Write-Host "Starting backend on port 8080..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList '-NoExit','-Command',"cd '$repoRoot/backend'; mvn -DskipTests spring-boot:run"

# Start frontend (web)
Write-Host "Starting frontend (web dev server)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList '-NoExit','-Command',"cd '$repoRoot/frontend'; npm run web"

Write-Host "Both servers launched in new terminals." -ForegroundColor Green

