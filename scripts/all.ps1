param(
    [ValidateSet('build','run')]
    [string]$Mode = 'run'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
Write-Host "Repo root: $repoRoot"

function Invoke-OrThrow($cmd) {
    & $cmd
    if ($LASTEXITCODE -ne 0) { throw "Command failed ($LASTEXITCODE): $cmd" }
}

Write-Host "[1/3] Building backend (Maven)" -ForegroundColor Cyan
Push-Location "$repoRoot\backend"
try {
    Invoke-OrThrow { mvn -DskipTests clean package }
}
finally { Pop-Location }

Write-Host "[2/3] Installing & building frontend" -ForegroundColor Cyan
Push-Location "$repoRoot\frontend"
try {
    Invoke-OrThrow { npm install }
    Invoke-OrThrow { npm run build }
}
finally { Pop-Location }

if ($Mode -eq 'build') {
    Write-Host "Build completed successfully." -ForegroundColor Green
    exit 0
}

# Mode: run
Write-Host "[3/3] Starting services" -ForegroundColor Cyan

Write-Host "Starting backend (Spring Boot) as background job..." -ForegroundColor Cyan
$backendJob = Start-Job -Name mybuddy-backend -ScriptBlock {
    $ErrorActionPreference = 'Stop'
    Set-Location -Path (Join-Path (Split-Path -Parent $using:repoRoot) 'backend')
    mvn -DskipTests spring-boot:run
}
Write-Host "Backend job started: $($backendJob.Id)" -ForegroundColor Green

Write-Host "Starting frontend dev server (npm run web)..." -ForegroundColor Cyan
Push-Location "$repoRoot\frontend"
try {
    npm run web
}
finally {
    Pop-Location
    $job = Get-Job -Name mybuddy-backend -ErrorAction SilentlyContinue
    if ($job) {
        Write-Host "Stopping backend job..." -ForegroundColor Yellow
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -ErrorAction SilentlyContinue
    }
}

Write-Host "All services stopped." -ForegroundColor Green


