# MyBuddy Production Deployment Guide

## Overview
This guide will help you deploy MyBuddy to production at `www.example.com` with proper security measures to protect your backend API endpoints.

## Architecture
```
Internet → Load Balancer/Reverse Proxy (Nginx) → Frontend (Port 80/443) → Backend (Internal Port 8080)
```

## Prerequisites
- Ubuntu 20.04+ server with root access
- Domain name pointing to your server
- API keys for OpenAI, Google Search, and Bing Search
- Basic Linux administration knowledge

## Security Features
- ✅ Backend only accessible from localhost (127.0.0.1)
- ✅ API endpoints protected by referrer validation
- ✅ Rate limiting on API calls
- ✅ SSL/TLS encryption
- ✅ Security headers (CSP, HSTS, XSS protection)
- ✅ Firewall configuration
- ✅ Fail2ban intrusion prevention
- ✅ Systemd service isolation

## Step-by-Step Deployment

### 1. Server Preparation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx openjdk-17-jdk certbot python3-certbot-nginx ufw fail2ban curl
```

### 2. Clone and Setup Repository
```bash
# Clone your repository
git clone https://github.com/yourusername/mybuddy.git
cd mybuddy

# Make deployment script executable
chmod +x deployment/deploy.sh
```

### 3. Configure Environment Variables
```bash
# Copy environment template
cp deployment/env.production /opt/mybuddy/backend/.env

# Edit with your actual API keys
nano /opt/mybuddy/backend/.env
```

**Required Environment Variables:**
```bash
OPENAI_API_KEY=your_actual_openai_key
GOOGLE_SEARCH_API_KEY=your_actual_google_key
GOOGLE_SEARCH_ENGINE_ID=your_actual_engine_id
BING_SEARCH_API_KEY=your_actual_bing_key
```

### 4. Run Deployment Script
```bash
# Run the automated deployment script
sudo ./deployment/deploy.sh
```

The script will:
- Install all dependencies
- Build backend and frontend
- Configure Nginx reverse proxy
- Setup SSL certificates
- Configure firewall and security
- Start all services

### 5. Manual Configuration (if needed)

#### Nginx Configuration
The deployment script automatically configures Nginx, but you can manually verify:
```bash
# Check Nginx configuration
sudo nginx -t

# View configuration
sudo cat /etc/nginx/sites-available/mybuddy

# Restart Nginx
sudo systemctl restart nginx
```

#### Backend Service
```bash
# Check service status
sudo systemctl status mybuddy-backend

# View logs
sudo journalctl -u mybuddy-backend -f

# Restart service
sudo systemctl restart mybuddy-backend
```

## Security Verification

### 1. Test Backend Isolation
```bash
# This should work (from server)
curl http://127.0.0.1:8080/internal/health

# This should fail (from external)
curl http://your-server-ip:8080/internal/health
```

### 2. Test API Protection
```bash
# This should work (with proper referrer)
curl -H "Referer: https://www.example.com" https://www.example.com/api/search

# This should fail (without referrer)
curl https://www.example.com/api/search
```

### 3. Test Rate Limiting
```bash
# Make multiple rapid requests
for i in {1..20}; do curl -H "Referer: https://www.example.com" https://www.example.com/api/search; done
```

## Monitoring and Maintenance

### 1. Service Status
```bash
# Check all services
sudo systemctl status mybuddy-backend nginx fail2ban

# View service logs
sudo journalctl -u mybuddy-backend -f
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. SSL Certificate Renewal
```bash
# Test renewal
sudo certbot renew --dry-run

# Manual renewal
sudo certbot renew
sudo systemctl reload nginx
```

### 3. Log Rotation
Logs are automatically rotated daily. Check configuration:
```bash
sudo cat /etc/logrotate.d/mybuddy
```

### 4. Backup Strategy
```bash
# Create backup script
sudo nano /opt/mybuddy/backup.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups/mybuddy"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/frontend_$DATE.tar.gz /var/www/mybuddy
tar -czf $BACKUP_DIR/backend_$DATE.tar.gz /opt/mybuddy/backend
cp /etc/nginx/sites-available/mybuddy $BACKUP_DIR/nginx_$DATE.conf
```

## Troubleshooting

### Common Issues

#### 1. Backend Not Starting
```bash
# Check Java version
java -version

# Check service logs
sudo journalctl -u mybuddy-backend -f

# Check port availability
sudo netstat -tlnp | grep 8080
```

#### 2. Nginx Configuration Errors
```bash
# Test configuration
sudo nginx -t

# Check syntax
sudo nginx -T | grep -A 20 "server {"
```

#### 3. SSL Certificate Issues
```bash
# Check certificate status
sudo certbot certificates

# Renew manually
sudo certbot renew --force-renewal
```

#### 4. Permission Issues
```bash
# Fix ownership
sudo chown -R mybuddy:mybuddy /opt/mybuddy/backend
sudo chown -R www-data:www-data /var/www/mybuddy

# Fix permissions
sudo chmod 755 /opt/mybuddy/backend
sudo chmod 755 /var/www/mybuddy
```

## Performance Optimization

### 1. Nginx Optimization
```bash
# Edit Nginx main configuration
sudo nano /etc/nginx/nginx.conf

# Add to http block:
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
gzip on;
gzip_comp_level 6;
```

### 2. Backend Optimization
```bash
# Edit service file
sudo nano /etc/systemd/system/mybuddy-backend.service

# Update Java options
Environment="JAVA_OPTS=-Xms1g -Xmx2g -XX:+UseG1GC -XX:+UseStringDeduplication"
```

### 3. Database Optimization (if applicable)
```bash
# For MySQL/PostgreSQL, configure connection pooling
# For embedded databases, optimize file storage
```

## Scaling Considerations

### 1. Load Balancing
For high traffic, consider:
- Multiple backend instances
- Load balancer (HAProxy, Nginx Plus)
- Database clustering
- CDN for static assets

### 2. Monitoring
Implement:
- Application performance monitoring (APM)
- Infrastructure monitoring (Prometheus, Grafana)
- Log aggregation (ELK Stack)
- Alerting (PagerDuty, Slack)

### 3. Backup and Recovery
- Automated daily backups
- Point-in-time recovery
- Disaster recovery plan
- Regular restore testing

## Security Checklist

- [ ] Backend bound to localhost only
- [ ] SSL/TLS enabled
- [ ] Firewall configured
- [ ] Fail2ban active
- [ ] Rate limiting enabled
- [ ] Security headers set
- [ ] API endpoints protected
- [ ] Regular security updates
- [ ] Monitoring and alerting
- [ ] Backup strategy implemented

## Support and Maintenance

### Regular Tasks
- Weekly: Check service status and logs
- Monthly: Review security updates
- Quarterly: Performance review and optimization
- Annually: Security audit and penetration testing

### Emergency Procedures
1. **Service Down**: Check logs and restart services
2. **Security Breach**: Isolate affected systems, investigate, patch
3. **Performance Issues**: Scale resources, optimize code
4. **Data Loss**: Restore from backup, investigate root cause

## Conclusion

This deployment setup provides a secure, scalable foundation for your MyBuddy application. The backend is completely isolated from external access, while the frontend remains publicly accessible. Regular monitoring and maintenance will ensure continued security and performance.

For additional security, consider:
- Web Application Firewall (WAF)
- Intrusion Detection System (IDS)
- Regular security audits
- Penetration testing
- Compliance monitoring (GDPR, SOC2, etc.)
