# MyBuddy Local Deployment Testing Guide

## 🏠 **Overview**
This guide helps you test the production deployment setup locally before deploying to production. It creates a local environment that mimics the production architecture using Docker containers.

## 🎯 **What You'll Test Locally**

✅ **Nginx Reverse Proxy** - Same configuration as production
✅ **Backend Isolation** - Backend only accessible through Nginx
✅ **API Protection** - Referrer validation working
✅ **Rate Limiting** - Request throttling functional
✅ **Security Headers** - Basic security measures
✅ **Service Communication** - Frontend ↔ Nginx ↔ Backend

## 📋 **Prerequisites**

### **Required Software**
- **Docker Desktop** - For containerization
- **PowerShell** - For running scripts (Windows)
- **Java 17** - For backend compilation
- **Node.js 20.19.0** - For frontend compilation (exact version required)

### **Check Installation**
```powershell
# Check Docker
docker --version

# Check Java
java -version

# Check Node.js (must be 20.19.0)
node --version
if ($LASTEXITCODE -ne 0 -or (node --version) -ne "v20.19.0") {
    Write-Host "❌ Node.js 20.19.0 is required. Current version: $(node --version)" -ForegroundColor Red
    exit 1
}

# Check npm
npm --version
```

## 🚀 **Quick Start (3 Steps)**

### **Step 1: Setup Local Environment**
```powershell
# Run the setup script
.\deployment\test-local.ps1
```

This script will:
- Check prerequisites
- Create local configuration files
- Set up Docker containers
- Configure Nginx locally

### **Step 2: Build Applications**
```powershell
# Build both backend and frontend
.\deployment\build-local.ps1
```

### **Step 3: Start Local Deployment**
```powershell
# Start the local deployment
docker-compose -f deployment/docker-compose.local.yml up -d
```

## 🧪 **Testing Your Local Deployment**

### **Run Automated Tests**
```powershell
# Execute comprehensive tests
.\deployment\test-local-deployment.ps1
```

### **Manual Testing**

#### **1. Test Frontend Access**
```bash
# Open in browser
http://localhost:3000

# Or test with curl
curl -I http://localhost:3000
```

**Expected Result**: ✅ HTTP 200 OK

#### **2. Test Backend Health (Direct)**
```bash
# This should work (from localhost)
curl http://127.0.0.1:8080/internal/health

# This should work (through Nginx)
curl http://localhost:3000/internal/health
```

**Expected Result**: ✅ Health status response

#### **3. Test API Protection**
```bash
# This should FAIL (no referrer)
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"test"}'

# This should WORK (with referrer)
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -H "Referer: http://localhost:3000" \
  -d '{"query":"test"}'
```

**Expected Result**: 
- ❌ First request: 403 Forbidden
- ✅ Second request: 200 OK or appropriate response

#### **4. Test Rate Limiting**
```bash
# Make multiple rapid requests
for i in {1..30}; do
  curl -X POST http://localhost:3000/api/search \
    -H "Content-Type: application/json" \
    -H "Referer: http://localhost:3000" \
    -d "{\"query\":\"test_$i\"}"
  echo "Request $i completed"
done
```

**Expected Result**: Some requests succeed, others get rate-limited (429)

#### **5. Test Security Headers**
```bash
curl -I http://localhost:3000
```

**Expected Headers**:
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy: default-src 'self'...`

## 🔍 **What Each Test Verifies**

### **Frontend Access Test**
- ✅ Nginx is serving static files
- ✅ Frontend build is working
- ✅ Port 3000 is accessible

### **Backend Health Test**
- ✅ Backend service is running
- ✅ Health endpoint is exposed
- ✅ Internal communication works

### **API Protection Test**
- ✅ Referrer validation is working
- ✅ API endpoints are protected
- ✅ Security measures are active

### **Rate Limiting Test**
- ✅ Nginx rate limiting is configured
- ✅ Request throttling works
- ✅ Protection against abuse

### **Security Headers Test**
- ✅ Security headers are set
- ✅ Basic protection is in place
- ✅ Configuration is loaded

## 🐛 **Troubleshooting Common Issues**

### **Issue: Docker Containers Won't Start**
```bash
# Check Docker status
docker ps -a

# Check container logs
docker logs mybuddy-backend
docker logs mybuddy-nginx

# Restart containers
docker-compose -f deployment/docker-compose.local.yml down
docker-compose -f deployment/docker-compose.local.yml up -d
```

### **Issue: Port Already in Use**
```bash
# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :8080

# Kill the process or change ports in the script
```

### **Issue: Backend Won't Start**
```bash
# Check Java version
java -version

# Check if JAR was built
ls -la backend/target/*.jar

# Check backend logs
docker logs mybuddy-backend
```

### **Issue: Frontend Not Accessible**
```bash
# Check if frontend was built
ls -la frontend/dist/

# Check Nginx logs
docker logs mybuddy-nginx

# Check Nginx configuration
docker exec mybuddy-nginx nginx -t
```

### **Issue: Node.js Version Mismatch**
```bash
# Check Node.js version (must be 20.19.0)
node --version

# If version is wrong, install correct version:
# Windows: Download from https://nodejs.org/
# macOS: brew install node@20
# Linux: Use nvm: nvm install 20.19.0 && nvm use 20.19.0
```

### **Issue: API Calls Failing**
```bash
# Check if backend is healthy
curl http://127.0.0.1:8080/internal/health

# Check CORS configuration
# Check referrer validation
# Check rate limiting settings
```

## 📊 **Expected Test Results**

### **Successful Deployment**
```
🧪 Testing Local Deployment...

1. Testing Backend Health...
✅ Backend is healthy: 200

2. Testing Frontend Access...
✅ Frontend is accessible: 200

3. Testing API Protection...
✅ API protection working: 403 Forbidden

4. Testing API with Referrer...
✅ API accessible with proper referrer: 200

5. Testing Rate Limiting...
✅ Rate limiting test: 25 successful, 5 blocked

🎉 Local deployment testing completed!
```

### **Failed Deployment (Example)**
```
🧪 Testing Local Deployment...

1. Testing Backend Health...
❌ Backend health check failed: Connection refused

2. Testing Frontend Access...
❌ Frontend access failed: Connection refused

3. Testing API Protection...
❌ API should be protected by referrer validation

4. Testing API with Referrer...
❌ API access failed: Connection refused

5. Testing Rate Limiting...
❌ Rate limiting test: 0 successful, 30 blocked
```

## 🔧 **Customizing Local Testing**

### **Change Ports**
```powershell
# Run with custom ports
.\deployment\test-local.ps1 -BackendPort 9090 -FrontendPort 4000
```

### **Modify Rate Limits**
Edit `deployment/nginx-local.conf`:
```nginx
# Increase limits for testing
limit_req_zone $binary_remote_addr zone=api:10m rate=200r/s;
limit_req_zone $binary_remote_addr zone=search:10m rate=100r/s;
```

### **Add More Tests**
Edit `deployment/test-local-deployment.ps1` to add custom test cases.

## 📈 **Performance Testing**

### **Load Testing**
```bash
# Install Apache Bench (Windows: use WSL or similar)
ab -n 100 -c 10 http://localhost:3000/

# Or use a simple loop
for i in {1..100}; do
  curl -s http://localhost:3000/ > /dev/null &
done
wait
```

### **Memory Usage**
```bash
# Check container resource usage
docker stats mybuddy-backend mybuddy-nginx
```

## 🎯 **Next Steps After Local Testing**

1. **✅ All Tests Pass**: You're ready for production deployment
2. **❌ Some Tests Fail**: Fix issues before production
3. **🔧 Configuration Issues**: Adjust local settings
4. **🐛 Bug Issues**: Fix code problems

## 🚀 **Production Deployment**

Once local testing passes:
1. Get your production server ready
2. Update DNS records
3. Configure real API keys
4. Run the production deployment script
5. Verify production deployment

## 📚 **Additional Resources**

- **Production Guide**: `DEPLOYMENT_GUIDE.md`
- **Nginx Configuration**: `nginx-local.conf`
- **Docker Setup**: `docker-compose.local.yml`
- **Backend Config**: `application-local.yml`

## 🆘 **Getting Help**

If you encounter issues:
1. Check the troubleshooting section above
2. Review container logs: `docker logs <container-name>`
3. Verify configuration files
4. Check port availability
5. Ensure Docker is running

Local testing gives you confidence that your deployment configuration is correct before going to production!
