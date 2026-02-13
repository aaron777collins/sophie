# HAOS Installation Guide

## Table of Contents

1. [Overview](#overview)
2. [System Requirements](#system-requirements)
3. [Prerequisites](#prerequisites)
4. [Matrix Homeserver Setup](#matrix-homeserver-setup)
5. [LiveKit Configuration](#livekit-configuration)
6. [HAOS Application Deployment](#haos-application-deployment)
7. [Network Configuration](#network-configuration)
8. [SSL/TLS Setup](#ssltls-setup)
9. [Initial Configuration](#initial-configuration)
10. [Verification](#verification)
11. [Common Issues](#common-issues)

---

## Overview

HAOS (Homelab-as-a-Service) is a Discord-like chat application that uses the Matrix protocol for federation, end-to-end encryption, and self-hosting capabilities. This guide covers production deployment for system administrators managing HAOS in professional environments.

### Architecture Components

- **Frontend**: Next.js 13 application with Discord-style UI
- **Backend**: Matrix protocol via Synapse homeserver
- **Voice/Video**: LiveKit integration
- **Database**: PostgreSQL (for Matrix Synapse)
- **Web Server**: Nginx reverse proxy
- **Authentication**: Matrix-native authentication

---

## System Requirements

### Minimum Production Requirements

| Component | CPU | RAM | Storage | Network |
|-----------|-----|-----|---------|---------|
| **Small (< 50 users)** | 2 vCPU | 4 GB | 50 GB SSD | 100 Mbps |
| **Medium (50-200 users)** | 4 vCPU | 8 GB | 100 GB SSD | 500 Mbps |
| **Large (200+ users)** | 8 vCPU | 16 GB | 200 GB SSD | 1 Gbps |

### Recommended Production Requirements

| Component | CPU | RAM | Storage | Network |
|-----------|-----|-----|---------|---------|
| **Small (< 50 users)** | 4 vCPU | 8 GB | 100 GB SSD | 500 Mbps |
| **Medium (50-200 users)** | 8 vCPU | 16 GB | 200 GB SSD | 1 Gbps |
| **Large (200+ users)** | 16 vCPU | 32 GB | 500 GB SSD | 1 Gbps |

### Operating System Support

- **Primary**: Ubuntu 22.04 LTS or 24.04 LTS
- **Secondary**: Debian 11+, CentOS 8+, Rocky Linux 8+
- **Container**: Docker with Docker Compose v2

### Port Requirements

| Service | Port | Protocol | Purpose |
|---------|------|----------|---------|
| HTTP | 80 | TCP | Web traffic (redirects to HTTPS) |
| HTTPS | 443 | TCP | Web application and API |
| Matrix Federation | 8448 | TCP | Matrix server-to-server |
| LiveKit | 7880 | TCP | Voice/Video signaling |
| LiveKit RTC | 50000-60000 | UDP | WebRTC media |
| PostgreSQL | 5432 | TCP | Database (internal only) |

---

## Prerequisites

### 1. System Updates and Packages

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y \
    curl \
    wget \
    git \
    unzip \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    ufw \
    fail2ban \
    htop \
    nginx \
    certbot \
    python3-certbot-nginx
```

### 2. Docker Installation

```bash
# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Enable Docker service
sudo systemctl enable docker
sudo systemctl start docker

# Verify installation
docker --version
docker compose version
```

### 3. Node.js Installation (for HAOS app build)

```bash
# Install Node.js 20.x via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install pnpm
sudo npm install -g pnpm@8

# Verify installation
node --version
pnpm --version
```

---

## Matrix Homeserver Setup

### 1. Create Directory Structure

```bash
# Create HAOS deployment directory
sudo mkdir -p /opt/haos
cd /opt/haos

# Create configuration directories
sudo mkdir -p {matrix,livekit,postgres-data,redis-data,nginx,ssl}
sudo chown -R $USER:$USER /opt/haos
```

### 2. PostgreSQL Database Setup

Create `docker-compose.yml` for database:

```yaml
# /opt/haos/docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: haos-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: synapse
      POSTGRES_USER: synapse
      POSTGRES_PASSWORD: CHANGE_THIS_PASSWORD
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --lc-collate=C --lc-ctype=C"
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"
    networks:
      - haos-network

  redis:
    image: redis:7-alpine
    container_name: haos-redis
    restart: unless-stopped
    volumes:
      - ./redis-data:/data
    ports:
      - "127.0.0.1:6379:6379"
    networks:
      - haos-network

networks:
  haos-network:
    driver: bridge
```

### 3. Matrix Synapse Configuration

Generate Synapse configuration:

```bash
# Create synapse configuration directory
mkdir -p /opt/haos/matrix

# Generate Synapse config (replace your.domain.com with actual domain)
docker run -it --rm \
    -v /opt/haos/matrix:/data \
    -e SYNAPSE_SERVER_NAME=your.domain.com \
    -e SYNAPSE_REPORT_STATS=no \
    matrixdotorg/synapse:latest generate

# Set permissions
sudo chown -R 991:991 /opt/haos/matrix
```

Edit the generated homeserver.yaml:

```yaml
# /opt/haos/matrix/homeserver.yaml

# Server settings
server_name: "your.domain.com"
pid_file: /data/homeserver.pid
web_client_location: https://your.domain.com/

# Listeners
listeners:
  - port: 8008
    tls: false
    type: http
    x_forwarded: true
    bind_addresses: ['0.0.0.0']
    resources:
      - names: [client, federation]
        compress: false

# Database configuration
database:
  name: psycopg2
  args:
    user: synapse
    password: CHANGE_THIS_PASSWORD
    database: synapse
    host: postgres
    port: 5432
    cp_min: 5
    cp_max: 10

# Redis configuration
redis:
  enabled: true
  host: redis
  port: 6379

# Media store
media_store_path: /data/media_store
max_upload_size: 50M
max_image_pixels: 32M

# Registration
enable_registration: false
enable_registration_without_verification: false

# Federation
federation_domain_whitelist: []

# Logging
log_config: /data/log.config

# Signing key
signing_key_path: /data/signing.key

# Trusted key servers
trusted_key_servers:
  - server_name: "matrix.org"

# Rate limiting
rc_message:
  per_second: 10
  burst_count: 50

rc_registration:
  per_second: 0.17
  burst_count: 3

rc_login:
  address:
    per_second: 0.17
    burst_count: 3
  account:
    per_second: 0.17
    burst_count: 3
  failed_attempts:
    per_second: 0.17
    burst_count: 3

# URL previews
url_preview_enabled: true
max_spider_size: 10M

# TURN settings (for voice/video)
turn_uris:
  - "turn:turn.your.domain.com:3478?transport=udp"
  - "turn:turn.your.domain.com:3478?transport=tcp"

turn_shared_secret: "CHANGE_THIS_TURN_SECRET"
turn_user_lifetime: 86400000
turn_allow_guests: true
```

### 4. Add Synapse to Docker Compose

Update `/opt/haos/docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    # ... (previous postgres config)

  redis:
    # ... (previous redis config)

  synapse:
    image: matrixdotorg/synapse:latest
    container_name: haos-synapse
    restart: unless-stopped
    depends_on:
      - postgres
      - redis
    volumes:
      - ./matrix:/data
    environment:
      - SYNAPSE_CONFIG_PATH=/data/homeserver.yaml
    ports:
      - "127.0.0.1:8008:8008"
    networks:
      - haos-network

networks:
  haos-network:
    driver: bridge
```

---

## LiveKit Configuration

### 1. LiveKit Server Setup

Create LiveKit configuration:

```yaml
# /opt/haos/livekit/livekit.yaml
port: 7880
bind_addresses:
  - ""

rtc:
  tcp_port: 7881
  port_range_start: 50000
  port_range_end: 60000
  use_external_ip: true
  # Set your server's external IP
  external_ip: YOUR_EXTERNAL_IP

redis:
  address: redis:6379

keys:
  # Generate with: openssl rand -base64 32
  api_key: your-api-key
  api_secret: your-api-secret

# Room settings
room:
  auto_create: true
  empty_timeout: 10m
  departure_timeout: 20s

# Recording (optional)
# recording:
#   storage:
#     type: s3
#     access_key: your-s3-key
#     secret: your-s3-secret
#     region: us-east-1
#     bucket: your-recordings-bucket
```

### 2. Add LiveKit to Docker Compose

Update `/opt/haos/docker-compose.yml`:

```yaml
version: '3.8'

services:
  # ... (previous services)

  livekit:
    image: livekit/livekit-server:latest
    container_name: haos-livekit
    restart: unless-stopped
    depends_on:
      - redis
    volumes:
      - ./livekit/livekit.yaml:/etc/livekit.yaml
    ports:
      - "7880:7880"
      - "7881:7881"
      - "50000-60000:50000-60000/udp"
    networks:
      - haos-network
    command: --config /etc/livekit.yaml

networks:
  haos-network:
    driver: bridge
```

---

## HAOS Application Deployment

### 1. Clone and Build HAOS

```bash
# Clone HAOS repository
cd /opt/haos
git clone https://github.com/your-org/haos-v2.git app
cd app

# Install dependencies
pnpm install

# Create production environment file
cat > .env.production << EOF
# Matrix Configuration
MATRIX_HOMESERVER=https://your.domain.com
MATRIX_ADMIN_USER=@admin:your.domain.com

# LiveKit Configuration
LIVEKIT_URL=wss://your.domain.com:7880
LIVEKIT_API_KEY=your-api-key
LIVEKIT_API_SECRET=your-api-secret

# Application Settings
NODE_ENV=production
HAOS_DOMAIN=your.domain.com
HAOS_BRANDING=Your Organization

# Optional: Analytics and monitoring
# HAOS_ANALYTICS_ENABLED=true
# HAOS_MONITORING_ENDPOINT=https://monitoring.your.domain.com
EOF

# Build application
pnpm build

# Create systemd service
sudo tee /etc/systemd/system/haos.service << EOF
[Unit]
Description=HAOS Application
After=network.target
Wants=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/haos/app
ExecStart=/usr/bin/pnpm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production

# Security
NoNewPrivileges=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/opt/haos
PrivateTmp=yes

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable haos
```

---

## Network Configuration

### 1. Firewall Setup

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (adjust port if needed)
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Matrix federation
sudo ufw allow 8448/tcp

# Allow LiveKit
sudo ufw allow 7880/tcp
sudo ufw allow 7881/tcp
sudo ufw allow 50000:60000/udp

# Check status
sudo ufw status verbose
```

### 2. Nginx Configuration

Create Nginx configuration:

```nginx
# /etc/nginx/sites-available/haos
upstream haos_app {
    server 127.0.0.1:3000;
    keepalive 32;
}

upstream matrix_synapse {
    server 127.0.0.1:8008;
}

upstream livekit {
    server 127.0.0.1:7880;
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name your.domain.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Main HTTPS server
server {
    listen 443 ssl http2;
    server_name your.domain.com;
    
    # SSL configuration (will be managed by certbot)
    ssl_certificate /etc/letsencrypt/live/your.domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your.domain.com/privkey.pem;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Client max body size
    client_max_body_size 50M;
    
    # HAOS application
    location / {
        proxy_pass http://haos_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Matrix client API
    location /_matrix {
        proxy_pass http://matrix_synapse;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
        
        # Increase timeouts for large file uploads
        proxy_read_timeout 600;
        proxy_send_timeout 600;
        client_body_timeout 600;
        
        # Allow large uploads
        client_max_body_size 50M;
    }
    
    # LiveKit WebSocket
    location /livekit {
        proxy_pass http://livekit;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Well-known for Matrix federation
    location /.well-known/matrix/server {
        return 200 '{"m.server": "your.domain.com:443"}';
        default_type application/json;
        add_header Access-Control-Allow-Origin *;
    }
    
    location /.well-known/matrix/client {
        return 200 '{"m.homeserver":{"base_url":"https://your.domain.com"}}';
        default_type application/json;
        add_header Access-Control-Allow-Origin *;
    }
    
    # Security.txt
    location /.well-known/security.txt {
        return 301 https://$server_name/security.txt;
    }
    
    location = /security.txt {
        add_header Content-Type text/plain;
        return 200 "Contact: security@your.domain.com\nExpires: 2025-12-31T23:59:59.000Z\n";
    }
}

# Matrix federation server (port 8448)
server {
    listen 8448 ssl http2;
    server_name your.domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your.domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your.domain.com/privkey.pem;
    
    location / {
        proxy_pass http://matrix_synapse;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
    }
}
```

Enable the site:

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/haos /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## SSL/TLS Setup

### 1. Let's Encrypt Certificate

```bash
# Stop nginx temporarily
sudo systemctl stop nginx

# Obtain certificate
sudo certbot certonly --standalone -d your.domain.com

# Start nginx
sudo systemctl start nginx

# Test certificate renewal
sudo certbot renew --dry-run

# Auto-renewal (already configured in most distributions)
sudo systemctl status certbot.timer
```

### 2. Certificate Auto-renewal Hook

Create renewal hook for nginx:

```bash
# Create renewal hook
sudo tee /etc/letsencrypt/renewal-hooks/post/nginx-reload.sh << 'EOF'
#!/bin/bash
systemctl reload nginx
EOF

# Make executable
sudo chmod +x /etc/letsencrypt/renewal-hooks/post/nginx-reload.sh
```

---

## Initial Configuration

### 1. Start All Services

```bash
# Start database and matrix services
cd /opt/haos
docker compose up -d

# Wait for services to start (about 30 seconds)
sleep 30

# Check service status
docker compose ps
docker compose logs synapse --tail=50

# Start HAOS application
sudo systemctl start haos

# Check application status
sudo systemctl status haos
```

### 2. Create Admin User

```bash
# Create first admin user
docker compose exec synapse register_new_matrix_user \
    -c /data/homeserver.yaml \
    -u admin \
    -p secure_password \
    -a \
    http://localhost:8008
```

### 3. Test Matrix Federation

```bash
# Test local homeserver
curl -k https://your.domain.com/_matrix/client/versions

# Test federation
curl -k https://your.domain.com:8448/_matrix/federation/v1/version

# Test well-known
curl -k https://your.domain.com/.well-known/matrix/server
```

---

## Verification

### 1. Service Health Checks

```bash
# Check all Docker services
docker compose ps

# Check HAOS application
sudo systemctl status haos
curl -k https://your.domain.com/health

# Check Nginx
sudo systemctl status nginx
sudo nginx -t

# Check SSL certificate
openssl s_client -connect your.domain.com:443 -servername your.domain.com
```

### 2. Functional Tests

1. **Web Access**: Navigate to `https://your.domain.com`
2. **User Registration**: Create a test user account
3. **Matrix Client Test**: Connect with Element client
4. **Federation Test**: Send message to external Matrix room
5. **Voice/Video Test**: Create a voice channel and test connection

### 3. Performance Verification

```bash
# Check resource usage
htop
docker stats

# Check disk usage
df -h
du -sh /opt/haos/*

# Check logs
sudo journalctl -u haos --since "1 hour ago"
docker compose logs --tail=100
```

---

## Common Issues

### 1. Matrix Synapse Issues

**Problem**: Synapse fails to start
```bash
# Check logs
docker compose logs synapse

# Common solutions:
# 1. Database connection issues
docker compose exec postgres psql -U synapse -d synapse -c "\l"

# 2. Permission issues
sudo chown -R 991:991 /opt/haos/matrix

# 3. Configuration syntax
docker compose exec synapse python -m synapse.config.homeserver --generate-config-file /data/homeserver.yaml
```

**Problem**: Federation not working
```bash
# Test federation connectivity
curl -k https://your.domain.com:8448/_matrix/federation/v1/version

# Check DNS and firewall
dig your.domain.com
sudo ufw status
```

### 2. LiveKit Issues

**Problem**: Voice/video not connecting
```bash
# Check LiveKit logs
docker compose logs livekit

# Test WebSocket connection
websocat wss://your.domain.com:7880

# Verify UDP ports are open
sudo netstat -ulpn | grep :5[0-9][0-9][0-9][0-9]
```

### 3. HAOS Application Issues

**Problem**: Application won't start
```bash
# Check application logs
sudo journalctl -u haos -f

# Verify environment variables
cat /opt/haos/app/.env.production

# Test build
cd /opt/haos/app
pnpm build
```

**Problem**: Can't connect to Matrix
```bash
# Test Matrix connectivity
curl -k https://your.domain.com/_matrix/client/versions

# Check environment variables
grep MATRIX /opt/haos/app/.env.production

# Verify admin user
docker compose exec synapse python -m synapse.app.admin_cmd -c /data/homeserver.yaml list-users
```

### 4. SSL/TLS Issues

**Problem**: Certificate issues
```bash
# Check certificate status
sudo certbot certificates

# Test SSL connection
openssl s_client -connect your.domain.com:443

# Renew certificate
sudo certbot renew --force-renewal
```

### 5. Performance Issues

**Problem**: High memory usage
```bash
# Check memory usage per service
docker stats

# Adjust PostgreSQL settings in docker-compose.yml
# Add to postgres environment:
POSTGRES_SHARED_BUFFERS: "256MB"
POSTGRES_EFFECTIVE_CACHE_SIZE: "1GB"
```

**Problem**: Slow response times
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/access.log

# Enable Nginx caching
# Add to nginx config:
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=haos_cache:10m max_size=1g;
proxy_cache haos_cache;
proxy_cache_valid 200 1h;
```

### 6. Network Connectivity Issues

**Problem**: External Matrix federation failing
```bash
# Test DNS resolution
nslookup your.domain.com
nslookup _matrix._tcp.your.domain.com

# Test port connectivity
telnet your.domain.com 8448

# Check SRV records
dig _matrix._tcp.your.domain.com SRV
```

---

## Next Steps

After successful installation:

1. **Configure HAOS**: See [CONFIGURATION.md](./CONFIGURATION.md)
2. **Secure your deployment**: See [SECURITY.md](./SECURITY.md)
3. **Set up maintenance**: See [MAINTENANCE.md](./MAINTENANCE.md)
4. **User management**: See user management procedures
5. **Monitoring**: Set up monitoring and alerting

For ongoing support and troubleshooting, refer to [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).