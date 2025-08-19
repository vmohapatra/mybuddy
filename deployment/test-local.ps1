# MyBuddy Local Deployment Testing Script
# This script tests the deployment setup locally before going to production

param(
    [string]$Domain = "localhost",
    [int]$BackendPort = 8080,
    [int]$FrontendPort = 3000
)

Write-Host "🚀 Starting MyBuddy Local Deployment Test..." -ForegroundColor Green

# Check if Docker is running
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not available. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check Node.js version (must be 20.19.0)
try {
    $nodeVersion = node --version
    if ($nodeVersion -eq "v20.19.0") {
        Write-Host "✅ Node.js version is correct: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js 20.19.0 is required. Current version: $nodeVersion" -ForegroundColor Red
        Write-Host "Please install Node.js 20.19.0 from https://nodejs.org/" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Node.js is not available. Please install Node.js 20.19.0 first." -ForegroundColor Red
    exit 1
}

# Check if required ports are available
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("127.0.0.1", $Port)
        $connection.Close()
        return $false  # Port is in use
    } catch {
        return $true   # Port is available
    }
}

if (-not (Test-Port -Port $BackendPort)) {
    Write-Host "❌ Port $BackendPort is already in use" -ForegroundColor Red
    exit 1
}

if (-not (Test-Port -Port $FrontendPort)) {
    Write-Host "❌ Port $FrontendPort is already in use" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Ports $BackendPort and $FrontendPort are available" -ForegroundColor Green

# Create local environment file
$envContent = @"
# Local Testing Environment
SPRING_PROFILES_ACTIVE=local
SERVER_PORT=$BackendPort
SERVER_ADDRESS=127.0.0.1

# OpenAI Configuration (use test key or mock)
OPENAI_API_KEY=sk-test-key-for-local-testing
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=1000

# Search API Configuration (use test keys or mock)
GOOGLE_SEARCH_API_KEY=test-google-key
GOOGLE_SEARCH_ENGINE_ID=test-engine-id
BING_SEARCH_API_KEY=test-bing-key

# Local CORS
CORS_ALLOWED_ORIGINS=http://localhost:$FrontendPort,http://127.0.0.1:$FrontendPort

# Logging
LOGGING_LEVEL_COM_BUDDYAPP=DEBUG
LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY=INFO
"@

$envContent | Out-File -FilePath "backend/.env.local" -Encoding UTF8
Write-Host "✅ Created local environment file" -ForegroundColor Green

# Create local Nginx configuration
$nginxContent = @"
# Local Nginx configuration for testing
upstream backend {
    server 127.0.0.1:$BackendPort;
    keepalive 32;
}

# Rate limiting (local testing)
limit_req_zone `$binary_remote_addr zone=api:10m rate=100r/s;
limit_req_zone `$binary_remote_addr zone=search:10m rate=50r/s;

server {
    listen $FrontendPort;
    server_name localhost 127.0.0.1;

    # Frontend static files
    location / {
        root ./frontend/dist;
        try_files `$uri `$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1h;
            add_header Cache-Control "public, max-age=3600";
        }
    }
    
    # Backend API endpoints
    location /api/ {
        limit_req zone=api burst=50 nodelay;
        
        # Allow local requests
        if (`$http_referer !~ "^http://(localhost|127\.0\.0\.1):$FrontendPort") {
            return 403;
        }
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Search endpoint
    location /api/search {
        limit_req zone=search burst=25 nodelay;
        
        if (`$request_method != "POST") {
            return 405;
        }
        
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
    }
    
    # Health check
    location /internal/health {
        proxy_pass http://backend;
        proxy_set_header Host `$host;
    }
    
    # Block sensitive endpoints
    location ~ ^/(actuator|swagger|h2-console|graphql) {
        deny all;
        return 404;
    }
}
"@

$nginxContent | Out-File -FilePath "deployment/nginx-local.conf" -Encoding UTF8
Write-Host "✅ Created local Nginx configuration" -ForegroundColor Green

# Create Docker Compose file for local testing
$dockerComposeContent = @"
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - "$FrontendPort`:80"
    volumes:
      - ./deployment/nginx-local.conf:/etc/nginx/conf.d/default.conf
      - ./frontend/dist:/usr/share/nginx/html
    depends_on:
      - backend
    networks:
      - mybuddy-local

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.local
    ports:
      - "$BackendPort`:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=local
      - SERVER_PORT=8080
      - SERVER_ADDRESS=0.0.0.0
    volumes:
      - ./backend/.env.local:/app/.env
    networks:
      - mybuddy-local

networks:
  mybuddy-local:
    driver: bridge
"@

$dockerComposeContent | Out-File -FilePath "deployment/docker-compose.local.yml" -Encoding UTF8
Write-Host "✅ Created Docker Compose file" -ForegroundColor Green

# Create local Dockerfile for backend
$dockerfileContent = @"
FROM openjdk:17-jdk-slim

WORKDIR /app

# Copy the JAR file
COPY target/*.jar app.jar

# Copy environment file
COPY .env .env

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "app.jar"]
"@

$dockerfileContent | Out-File -FilePath "backend/Dockerfile.local" -Encoding UTF8
Write-Host "✅ Created local Dockerfile" -ForegroundColor Green

# Create local testing script
$testScriptContent = @"
# Local Testing Commands

Write-Host "🧪 Testing Local Deployment..." -ForegroundColor Yellow

# Test 1: Backend Health Check
Write-Host "`n1. Testing Backend Health..." -ForegroundColor Cyan
try {
    `$response = Invoke-WebRequest -Uri "http://127.0.0.1:$BackendPort/internal/health" -UseBasicParsing
    Write-Host "✅ Backend is healthy: `$(`$response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend health check failed: `$(`$_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Frontend Access
Write-Host "`n2. Testing Frontend Access..." -ForegroundColor Cyan
try {
    `$response = Invoke-WebRequest -Uri "http://localhost:$FrontendPort" -UseBasicParsing
    Write-Host "✅ Frontend is accessible: `$(`$response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend access failed: `$(`$_.Exception.Message)" -ForegroundColor Red
}

# Test 3: API Endpoint Protection
Write-Host "`n3. Testing API Protection..." -ForegroundColor Cyan
try {
    `$response = Invoke-WebRequest -Uri "http://localhost:$FrontendPort/api/search" -Method POST -Body '{"query":"test"}' -ContentType "application/json" -UseBasicParsing
    Write-Host "❌ API should be protected by referrer validation" -ForegroundColor Red
} catch {
    Write-Host "✅ API protection working: `$(`$_.Exception.Message)" -ForegroundColor Green
}

# Test 4: API with Proper Referrer
Write-Host "`n4. Testing API with Referrer..." -ForegroundColor Cyan
try {
    `$headers = @{
        "Referer" = "http://localhost:$FrontendPort"
        "Content-Type" = "application/json"
    }
    `$response = Invoke-WebRequest -Uri "http://localhost:$FrontendPort/api/search" -Method POST -Body '{"query":"test"}' -Headers `$headers -UseBasicParsing
    Write-Host "✅ API accessible with proper referrer: `$(`$response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ API access failed: `$(`$_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Rate Limiting
Write-Host "`n5. Testing Rate Limiting..." -ForegroundColor Cyan
`$successCount = 0
`$blockedCount = 0

for (`$i = 1; `$i -le 30; `$i++) {
    try {
        `$headers = @{
            "Referer" = "http://localhost:$FrontendPort"
            "Content-Type" = "application/json"
        }
        `$response = Invoke-WebRequest -Uri "http://localhost:$FrontendPort/api/search" -Method POST -Body "{\"query\":\"test_`$i\"}" -Headers `$headers -UseBasicParsing
        `$successCount++
    } catch {
        `$blockedCount++
    }
}

Write-Host "✅ Rate limiting test: `$successCount successful, `$blockedCount blocked" -ForegroundColor Green

Write-Host "`n🎉 Local deployment testing completed!" -ForegroundColor Green
"@

$testScriptContent | Out-File -FilePath "deployment/test-local-deployment.ps1" -Encoding UTF8
Write-Host "✅ Created local testing script" -ForegroundColor Green

# Create local build script
$buildScriptContent = @"
# Local Build Script

Write-Host "🔨 Building for Local Testing..." -ForegroundColor Yellow

# Build backend
Write-Host "Building backend..." -ForegroundColor Cyan
Set-Location backend
if (Test-Path "mvnw.cmd") {
    .\mvnw.cmd clean package -DskipTests
} else {
    mvn clean package -DskipTests
}
Set-Location ..

# Build frontend
Write-Host "Building frontend..." -ForegroundColor Cyan
Set-Location frontend
npm install
npm run build:prod
Set-Location ..

Write-Host "✅ Build completed!" -ForegroundColor Green
"@

$buildScriptContent | Out-File -FilePath "deployment/build-local.ps1" -Encoding UTF8
Write-Host "✅ Created local build script" -ForegroundColor Green

Write-Host "`n🎯 Local Testing Setup Complete!" -ForegroundColor Green
Write-Host "`n📋 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run: .\deployment\build-local.ps1" -ForegroundColor White
Write-Host "2. Run: docker-compose -f deployment/docker-compose.local.yml up -d" -ForegroundColor White
Write-Host "3. Run: .\deployment\test-local-deployment.ps1" -ForegroundColor White
Write-Host "`n🌐 Access your app at:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:$FrontendPort" -ForegroundColor White
Write-Host "   Backend: http://127.0.0.1:$BackendPort" -ForegroundColor White
Write-Host "   Health: http://127.0.0.1:$BackendPort/internal/health" -ForegroundColor White
