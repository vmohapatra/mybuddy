#!/bin/bash

# MyBuddy Production Deployment Script
# Run this script as root or with sudo privileges

set -e

# Configuration
DOMAIN="www.example.com"
BACKEND_DIR="/opt/mybuddy/backend"
FRONTEND_DIR="/var/www/mybuddy"
SERVICE_USER="mybuddy"
SERVICE_GROUP="mybuddy"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting MyBuddy Production Deployment...${NC}"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}❌ This script must be run as root or with sudo${NC}"
   exit 1
fi

# Update system packages
echo -e "${YELLOW}📦 Updating system packages...${NC}"
apt update && apt upgrade -y

# Install required packages
echo -e "${YELLOW}📦 Installing required packages...${NC}"
apt install -y nginx openjdk-17-jdk certbot python3-certbot-nginx ufw fail2ban

# Create service user
echo -e "${YELLOW}👤 Creating service user...${NC}"
if ! id "$SERVICE_USER" &>/dev/null; then
    useradd -r -s /bin/false -d /opt/mybuddy "$SERVICE_USER"
    usermod -aG "$SERVICE_USER" www-data
fi

# Create directories
echo -e "${YELLOW}📁 Creating directories...${NC}"
mkdir -p "$BACKEND_DIR"
mkdir -p "$FRONTEND_DIR"
mkdir -p "$BACKEND_DIR/logs"
chown -R "$SERVICE_USER:$SERVICE_GROUP" "$BACKEND_DIR"
chown -R www-data:www-data "$FRONTEND_DIR"

# Build backend
echo -e "${YELLOW}🔨 Building backend...${NC}"
cd backend
./mvnw clean package -DskipTests -Pprod
cp target/*.jar "$BACKEND_DIR/mybuddy-backend.jar"
chown "$SERVICE_USER:$SERVICE_GROUP" "$BACKEND_DIR/mybuddy-backend.jar"

# Build frontend
echo -e "${YELLOW}🔨 Building frontend...${NC}"
cd ../frontend
npm install
npm run build:prod
cp -r dist/* "$FRONTEND_DIR/"
chown -R www-data:www-data "$FRONTEND_DIR"

# Setup systemd service
echo -e "${YELLOW}⚙️  Setting up systemd service...${NC}"
cp ../deployment/mybuddy-backend.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable mybuddy-backend

# Setup Nginx
echo -e "${YELLOW}🌐 Setting up Nginx...${NC}"
cp ../deployment/nginx.conf /etc/nginx/sites-available/mybuddy
ln -sf /etc/nginx/sites-available/mybuddy /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Setup SSL certificate
echo -e "${YELLOW}🔒 Setting up SSL certificate...${NC}"
if ! certbot certificates | grep -q "$DOMAIN"; then
    certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email admin@example.com
else
    echo "SSL certificate already exists for $DOMAIN"
fi

# Setup firewall
echo -e "${YELLOW}🔥 Setting up firewall...${NC}"
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Setup fail2ban
echo -e "${YELLOW}🛡️  Setting up fail2ban...${NC}"
systemctl enable fail2ban
systemctl start fail2ban

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
systemctl start mybuddy-backend
systemctl restart nginx

# Wait for backend to be ready
echo -e "${YELLOW}⏳ Waiting for backend to be ready...${NC}"
sleep 10

# Test deployment
echo -e "${YELLOW}🧪 Testing deployment...${NC}"
if curl -f -s "https://$DOMAIN" > /dev/null; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible${NC}"
fi

if curl -f -s "http://127.0.0.1:8080/internal/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${RED}❌ Backend is not running${NC}"
fi

# Setup log rotation
echo -e "${YELLOW}📝 Setting up log rotation...${NC}"
cat > /etc/logrotate.d/mybuddy << EOF
$BACKEND_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $SERVICE_USER $SERVICE_GROUP
    postrotate
        systemctl reload mybuddy-backend
    endscript
}
EOF

# Setup monitoring
echo -e "${YELLOW}📊 Setting up basic monitoring...${NC}"
cat > /etc/cron.daily/mybuddy-monitor << EOF
#!/bin/bash
# Check if services are running
if ! systemctl is-active --quiet mybuddy-backend; then
    echo "MyBuddy backend is down at \$(date)" | mail -s "MyBuddy Alert" admin@example.com
fi

if ! systemctl is-active --quiet nginx; then
    echo "Nginx is down at \$(date)" | mail -s "MyBuddy Alert" admin@example.com
fi
EOF

chmod +x /etc/cron.daily/mybuddy-monitor

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your application is now running at: https://$DOMAIN${NC}"
echo -e "${GREEN}📋 Next steps:${NC}"
echo -e "${GREEN}   1. Update DNS records to point to this server${NC}"
echo -e "${GREEN}   2. Configure environment variables for API keys${NC}"
echo -e "${GREEN}   3. Set up monitoring and alerting${NC}"
echo -e "${GREEN}   4. Configure backup strategy${NC}"

# Show service status
echo -e "${YELLOW}📊 Service Status:${NC}"
systemctl status mybuddy-backend --no-pager -l
systemctl status nginx --no-pager -l
