# HAOS v2 Self-Hosting Guide

This comprehensive guide walks you through self-hosting HAOS (Home Automation Operating System) v2 using Docker containers. Follow these steps for a production-ready deployment.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Docker Compose Configuration](#docker-compose-configuration)
- [Environment Variables](#environment-variables)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Domain Setup](#domain-setup)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before beginning, ensure you have:

- **Server Requirements:**
  - Ubuntu 20.04+ or similar Linux distribution
  - Minimum 2GB RAM, 4GB recommended
  - 20GB+ free disk space
  - Docker Engine 24.0+
  - Docker Compose 2.0+

- **Network Requirements:**
  - Static IP address or DDNS setup
  - Ports 80, 443, and 8080 accessible
  - Domain name (recommended for SSL/TLS)

- **Knowledge Requirements:**
  - Basic command line familiarity
  - Understanding of Docker concepts
  - Basic networking knowledge

### System Preparation

1. **Update your system:**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Docker and Docker Compose:**
   ```bash
   # Install Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Add user to docker group
   sudo usermod -aG docker $USER
   
   # Log out and back in, then verify
   docker --version
   docker compose version
   ```

3. **Install additional tools:**
   ```bash
   sudo apt install -y git curl wget htop nano certbot
   ```

## Quick Start

For users who want to get HAOS running quickly:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/haos-v2.git
   cd haos-v2
   ```

2. **Copy and configure environment:**
   ```bash
   cp .env.example .env
   nano .env  # Edit required variables
   ```

3. **Start the services:**
   ```bash
   docker compose up -d
   ```

4. **Access HAOS:**
   - Open browser to `http://your-server-ip:8080`
   - Follow setup wizard

## Docker Compose Configuration

### Basic Configuration

Create a `docker-compose.yml` file in your project root:

```yaml
version: '3.8'

services:
  haos-core:
    image: haos/core:v2-latest
    container_name: haos-core
    restart: unless-stopped
    ports:
      - "8080:8080"
      - "8883:8883"  # MQTT over TLS
    volumes:
      - ./config:/app/config
      - ./data:/app/data
      - ./logs:/app/logs
      - /etc/localtime:/etc/localtime:ro
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
      - MQTT_BROKER_HOST=${MQTT_BROKER_HOST:-mqtt}
      - MQTT_BROKER_PORT=${MQTT_BROKER_PORT:-8883}
      - LOG_LEVEL=${LOG_LEVEL:-info}
    depends_on:
      - postgres
      - redis
      - mqtt
    networks:
      - haos-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:15-alpine
    container_name: haos-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8 --lc-collate=C --lc-ctype=C
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"  # Remove in production if not needed
    networks:
      - haos-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: haos-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
    ports:
      - "6379:6379"  # Remove in production if not needed
    networks:
      - haos-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  mqtt:
    image: eclipse-mosquitto:2
    container_name: haos-mqtt
    restart: unless-stopped
    ports:
      - "1883:1883"   # MQTT
      - "8883:8883"   # MQTT over TLS
      - "9001:9001"   # WebSocket
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - ./mosquitto/data:/mosquitto/data
      - ./mosquitto/log:/mosquitto/log
      - ./certs:/mosquitto/certs  # SSL certificates
    environment:
      - MOSQUITTO_USERNAME=${MQTT_USERNAME}
      - MOSQUITTO_PASSWORD=${MQTT_PASSWORD}
    networks:
      - haos-network
    healthcheck:
      test: ["CMD-SHELL", "mosquitto_pub -h localhost -t test -m 'health check' -u ${MQTT_USERNAME} -P ${MQTT_PASSWORD}"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    container_name: haos-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/sites:/etc/nginx/sites-available
      - ./certs:/etc/nginx/certs
      - ./logs/nginx:/var/log/nginx
    depends_on:
      - haos-core
    networks:
      - haos-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: Monitoring services
  grafana:
    image: grafana/grafana:latest
    container_name: haos-grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    networks:
      - haos-network
    profiles:
      - monitoring

  prometheus:
    image: prom/prometheus:latest
    container_name: haos-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - haos-network
    profiles:
      - monitoring

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  grafana_data:
    driver: local
  prometheus_data:
    driver: local

networks:
  haos-network:
    driver: bridge
    ipam:
      driver: default
      config:
        - subnet: 172.20.0.0/16
```

### Production Configuration

For production deployments, create a separate `docker-compose.prod.yml`:

```yaml
version: '3.8'

# Extends docker-compose.yml with production overrides
services:
  haos-core:
    image: haos/core:v2-stable  # Use stable tag
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
      restart_policy:
        condition: any
        delay: 5s
        max_attempts: 3

  postgres:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
    # Remove port exposure for security
    ports: []

  redis:
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '0.25'
    # Remove port exposure for security
    ports: []

  # Add backup service
  backup:
    image: postgres:15-alpine
    container_name: haos-backup
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data:ro
      - ./backups:/backups
      - ./scripts/backup.sh:/backup.sh
    environment:
      - POSTGRES_DB=${POSTGRES_DB}
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    command: ["/bin/sh", "-c", "while true; do sleep 86400; /backup.sh; done"]
    depends_on:
      - postgres
    networks:
      - haos-network
```

### Development Configuration

For development, create `docker-compose.dev.yml`:

```yaml
version: '3.8'

# Development overrides
services:
  haos-core:
    build: .  # Build from source
    volumes:
      - ./src:/app/src  # Hot reload
      - ./public:/app/public
    environment:
      - NODE_ENV=development
      - DEBUG=haos:*
      - HOT_RELOAD=true
    ports:
      - "9229:9229"  # Node.js debugging port

  postgres:
    ports:
      - "5432:5432"  # Expose for development tools

  redis:
    ports:
      - "6379:6379"  # Expose for development tools
```

## Environment Variables

Create a `.env` file in your project root with the following variables:

### Core Application Settings

```bash
# Application Environment
NODE_ENV=production

# Server Configuration
PORT=8080
HOST=0.0.0.0
PUBLIC_URL=https://your-domain.com

# Security Settings
JWT_SECRET=your_super_secure_jwt_secret_key_here_min_32_chars
ENCRYPTION_KEY=your_32_character_encryption_key_here
SESSION_SECRET=your_session_secret_key_here

# CORS Settings
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
CORS_CREDENTIALS=true
```

### Database Configuration

```bash
# PostgreSQL Database
POSTGRES_DB=haos
POSTGRES_USER=haos_user
POSTGRES_PASSWORD=secure_postgres_password_here
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

# Database Pool Settings
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE=10000
```

### Redis Configuration

```bash
# Redis Cache & Sessions
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=secure_redis_password_here
REDIS_URL=redis://:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}

# Redis Pool Settings
REDIS_POOL_MAX=10
REDIS_POOL_MIN=2
REDIS_KEY_PREFIX=haos:
```

### MQTT Broker Settings

```bash
# MQTT Configuration
MQTT_BROKER_HOST=mqtt
MQTT_BROKER_PORT=8883
MQTT_USERNAME=haos_mqtt_user
MQTT_PASSWORD=secure_mqtt_password_here
MQTT_CLIENT_ID=haos-core
MQTT_KEEP_ALIVE=60

# MQTT Topics
MQTT_TOPIC_PREFIX=haos/
MQTT_DISCOVERY_TOPIC=homeassistant/
```

### Email Configuration

```bash
# SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=HAOS System <noreply@your-domain.com>
```

### File Storage

```bash
# Local Storage
STORAGE_PATH=/app/data/uploads
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=jpg,jpeg,png,pdf,txt,zip

# Optional: S3 Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=your-haos-bucket
```

### Logging & Monitoring

```bash
# Application Logging
LOG_LEVEL=info
LOG_FORMAT=json
LOG_FILE=/app/logs/haos.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=5

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9464
HEALTH_CHECK_INTERVAL=30000
```

### External Integrations

```bash
# Weather API (optional)
WEATHER_API_KEY=your_weather_api_key
WEATHER_LOCATION=New York,NY

# Notification Services (optional)
PUSHOVER_TOKEN=your_pushover_token
PUSHOVER_USER=your_pushover_user

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### Monitoring Service Settings

```bash
# Grafana
GRAFANA_ADMIN_PASSWORD=secure_grafana_password_here

# Prometheus
PROMETHEUS_RETENTION=15d
PROMETHEUS_SCRAPE_INTERVAL=15s
```

### Environment Variable Validation

The application validates required environment variables on startup. Missing variables will cause the application to fail with descriptive error messages:

```bash
# Check your environment variables
docker compose config  # Validates compose file with .env
docker compose run --rm haos-core node -e "console.log(process.env.DATABASE_URL)"
```

### Security Best Practices

1. **Generate strong secrets:**
   ```bash
   # Generate secure random strings
   openssl rand -hex 32  # For JWT_SECRET
   openssl rand -hex 16  # For ENCRYPTION_KEY
   ```

2. **Use environment-specific files:**
   ```bash
   # Development
   .env.development

   # Staging  
   .env.staging

   # Production
   .env.production
   ```

3. **Never commit secrets to git:**
   ```bash
   # Add to .gitignore
   echo ".env*" >> .gitignore
   echo "!.env.example" >> .gitignore
   ```

4. **Use Docker secrets in production:**
   ```yaml
   secrets:
     db_password:
       file: ./secrets/db_password.txt
     jwt_secret:
       file: ./secrets/jwt_secret.txt
   ```

## SSL/TLS Configuration

Secure your HAOS deployment with proper SSL/TLS encryption.

### Option 1: Let's Encrypt with Certbot (Recommended)

This is the easiest method for domains with public DNS:

1. **Install Certbot:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Stop HAOS temporarily:**
   ```bash
   docker compose down
   ```

3. **Obtain certificates:**
   ```bash
   sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com
   ```

4. **Set up automatic renewal:**
   ```bash
   sudo crontab -e
   # Add this line:
   0 12 * * * /usr/bin/certbot renew --quiet --pre-hook "docker compose -f /path/to/your/docker-compose.yml down" --post-hook "docker compose -f /path/to/your/docker-compose.yml up -d"
   ```

5. **Update docker-compose.yml:**
   ```yaml
   services:
     nginx:
       volumes:
         - /etc/letsencrypt:/etc/letsencrypt:ro
   ```

### Option 2: Let's Encrypt with Nginx Proxy Manager

For easier management with web UI:

1. **Add nginx-proxy-manager to docker-compose.yml:**
   ```yaml
   services:
     nginx-proxy-manager:
       image: 'jc21/nginx-proxy-manager:latest'
       container_name: haos-proxy-manager
       restart: unless-stopped
       ports:
         - '80:80'    # HTTP
         - '443:443'  # HTTPS
         - '81:81'    # Admin UI
       volumes:
         - ./npm/data:/data
         - ./npm/letsencrypt:/etc/letsencrypt
       networks:
         - haos-network

     # Remove ports from haos-core, nginx-proxy-manager will handle them
     haos-core:
       ports: []  # Remove exposed ports
   ```

2. **Access admin UI at `http://your-server:81`**
   - Default login: admin@example.com / changeme
   - Add proxy host for your domain → haos-core:8080
   - Enable SSL with Let's Encrypt

### Option 3: Custom SSL Certificates

For internal or self-signed certificates:

1. **Create certificate directory:**
   ```bash
   mkdir -p ./certs
   ```

2. **Generate self-signed certificate:**
   ```bash
   openssl req -x509 -newkey rsa:4096 -keyout ./certs/haos-key.pem -out ./certs/haos-cert.pem -days 365 -nodes -subj "/CN=your-domain.com"
   ```

3. **Create nginx SSL configuration:**
   ```bash
   mkdir -p ./nginx/sites
   ```

   Create `./nginx/sites/haos-ssl.conf`:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name your-domain.com www.your-domain.com;

       ssl_certificate /etc/nginx/certs/haos-cert.pem;
       ssl_certificate_key /etc/nginx/certs/haos-key.pem;

       # Modern SSL configuration
       ssl_protocols TLSv1.2 TLSv1.3;
       ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
       ssl_prefer_server_ciphers off;
       ssl_session_cache shared:SSL:10m;
       ssl_session_timeout 10m;

       # Security headers
       add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
       add_header X-Frame-Options DENY always;
       add_header X-Content-Type-Options nosniff always;
       add_header X-XSS-Protection "1; mode=block" always;

       # Proxy to HAOS
       location / {
           proxy_pass http://haos-core:8080;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           
           # WebSocket support
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           
           # Timeouts
           proxy_connect_timeout 60s;
           proxy_send_timeout 60s;
           proxy_read_timeout 60s;
       }

       # Health check endpoint
       location /health {
           access_log off;
           proxy_pass http://haos-core:8080/health;
       }
   }
   ```

4. **Update nginx main configuration:**
   Create `./nginx/nginx.conf`:
   ```nginx
   events {
       worker_connections 1024;
   }

   http {
       include /etc/nginx/mime.types;
       default_type application/octet-stream;

       # Logging
       log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                       '$status $body_bytes_sent "$http_referer" '
                       '"$http_user_agent" "$http_x_forwarded_for"';

       access_log /var/log/nginx/access.log main;
       error_log /var/log/nginx/error.log warn;

       # Performance
       sendfile on;
       tcp_nopush on;
       tcp_nodelay on;
       keepalive_timeout 65;
       types_hash_max_size 2048;

       # Gzip compression
       gzip on;
       gzip_vary on;
       gzip_min_length 10240;
       gzip_proxied expired no-cache no-store private must-revalidate;
       gzip_types
           text/plain
           text/css
           text/xml
           text/javascript
           application/x-javascript
           application/xml+rss
           application/json;

       # Rate limiting
       limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
       limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;

       # Include site configurations
       include /etc/nginx/sites-available/*;
   }
   ```

### SSL/TLS Testing

1. **Test SSL configuration:**
   ```bash
   # Check certificate
   openssl s_client -connect your-domain.com:443 -servername your-domain.com

   # Test with curl
   curl -I https://your-domain.com

   # Online SSL test
   # Visit: https://www.ssllabs.com/ssltest/
   ```

2. **Monitor certificate expiration:**
   ```bash
   # Add to crontab for monitoring
   0 6 * * 1 /usr/bin/openssl s_client -connect your-domain.com:443 -servername your-domain.com 2>/dev/null | openssl x509 -noout -dates | mail -s "SSL Certificate Status" your-email@domain.com
   ```

### MQTT SSL/TLS Configuration

Secure your MQTT communications:

1. **Create MQTT configuration:**
   Create `./mosquitto/config/mosquitto.conf`:
   ```
   # Basic settings
   allow_anonymous false
   password_file /mosquitto/config/passwd
   
   # Standard MQTT
   listener 1883
   protocol mqtt
   
   # MQTT over SSL
   listener 8883
   protocol mqtt
   cafile /mosquitto/certs/ca-cert.pem
   certfile /mosquitto/certs/haos-cert.pem
   keyfile /mosquitto/certs/haos-key.pem
   
   # WebSocket over SSL
   listener 9001
   protocol websockets
   cafile /mosquitto/certs/ca-cert.pem
   certfile /mosquitto/certs/haos-cert.pem
   keyfile /mosquitto/certs/haos-key.pem
   
   # Logging
   log_dest file /mosquitto/log/mosquitto.log
   log_type error
   log_type warning
   log_type notice
   log_type information
   log_timestamp true
   ```

2. **Create MQTT user:**
   ```bash
   # Create password file
   docker compose exec mqtt mosquitto_passwd -c /mosquitto/config/passwd ${MQTT_USERNAME}
   ```

## Domain Setup

Configure your domain to point to your HAOS installation.

### DNS Configuration

1. **A Records (IPv4):**
   ```
   @               A    your.server.ip.address
   www             A    your.server.ip.address
   haos            A    your.server.ip.address  (optional subdomain)
   ```

2. **AAAA Records (IPv6, if available):**
   ```
   @               AAAA your:server:ipv6::address
   www             AAAA your:server:ipv6::address
   ```

3. **CNAME Records (for subdomains):**
   ```
   api             CNAME haos.your-domain.com
   mqtt            CNAME haos.your-domain.com
   grafana         CNAME haos.your-domain.com
   ```

### Dynamic DNS Setup

If you don't have a static IP address:

1. **Choose a Dynamic DNS provider:**
   - DuckDNS (free, easy)
   - No-IP (free tier available)
   - Cloudflare (free, feature-rich)
   - Google Domains Dynamic DNS

2. **DuckDNS Example:**
   ```bash
   # Install duck.sh script
   mkdir -p ~/scripts
   cd ~/scripts
   wget -O duck.sh "https://www.duckdns.org/update?domains=your-subdomain&token=your-token&ip="
   chmod +x duck.sh
   
   # Add to crontab
   crontab -e
   # Add line:
   */5 * * * * ~/scripts/duck.sh >/dev/null 2>&1
   ```

3. **Cloudflare Dynamic DNS:**
   ```bash
   # Install cloudflare-ddns
   npm install -g cloudflare-ddns-client
   
   # Configure
   cloudflare-ddns --email your@email.com --key your-api-key --zone your-domain.com --subdomain haos
   ```

### Subdomain Configuration

Organize services with subdomains:

1. **Main application:**
   - `haos.your-domain.com` → Core HAOS interface

2. **API endpoints:**
   - `api.your-domain.com` → API access

3. **Monitoring:**
   - `grafana.your-domain.com` → Grafana dashboards
   - `prometheus.your-domain.com` → Prometheus metrics

4. **Update nginx configuration:**
   ```nginx
   # Main HAOS application
   server {
       listen 443 ssl;
       server_name haos.your-domain.com;
       # ... SSL configuration ...
       location / {
           proxy_pass http://haos-core:8080;
       }
   }
   
   # Grafana monitoring
   server {
       listen 443 ssl;
       server_name grafana.your-domain.com;
       # ... SSL configuration ...
       location / {
           proxy_pass http://grafana:3000;
       }
   }
   ```

### Firewall Configuration

Secure your server with proper firewall rules:

1. **Using UFW (Ubuntu Firewall):**
   ```bash
   # Enable UFW
   sudo ufw enable
   
   # SSH access
   sudo ufw allow ssh
   
   # HTTP/HTTPS
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   
   # HAOS direct access (if needed)
   sudo ufw allow 8080/tcp
   
   # MQTT
   sudo ufw allow 1883/tcp
   sudo ufw allow 8883/tcp
   
   # Monitoring (restrict to known IPs)
   sudo ufw allow from your.admin.ip.address to any port 3000
   sudo ufw allow from your.admin.ip.address to any port 9090
   
   # Check status
   sudo ufw status verbose
   ```

2. **Using iptables:**
   ```bash
   # Basic iptables rules
   sudo iptables -A INPUT -i lo -j ACCEPT
   sudo iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
   sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
   sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
   sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
   sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
   sudo iptables -A INPUT -j DROP
   
   # Save rules
   sudo iptables-save > /etc/iptables/rules.v4
   ```

### Port Forwarding (Home Networks)

If running on a home network:

1. **Access router configuration:**
   - Usually at 192.168.1.1 or 192.168.0.1

2. **Forward required ports:**
   ```
   HTTP:  External 80    → Internal your-server-ip:80
   HTTPS: External 443   → Internal your-server-ip:443
   HAOS:  External 8080  → Internal your-server-ip:8080 (optional)
   MQTT:  External 1883  → Internal your-server-ip:1883
   MQTTS: External 8883  → Internal your-server-ip:8883
   ```

3. **Set static IP for your server:**
   ```bash
   # Edit netplan configuration
   sudo nano /etc/netplan/00-installer-config.yaml
   
   # Example configuration:
   network:
     ethernets:
       eth0:  # or your interface name
         dhcp4: false
         addresses:
           - 192.168.1.100/24
         gateway4: 192.168.1.1
         nameservers:
           addresses: [8.8.8.8, 8.8.4.4]
     version: 2
   
   # Apply changes
   sudo netplan apply
   ```

### Domain Validation

Verify your domain setup:

1. **DNS propagation:**
   ```bash
   # Check A record
   dig your-domain.com
   
   # Check from external DNS
   dig @8.8.8.8 your-domain.com
   
   # Online tools
   # Visit: https://dnschecker.org
   ```

2. **SSL certificate validation:**
   ```bash
   # Check certificate
   curl -I https://your-domain.com
   
   # Detailed SSL info
   openssl s_client -connect your-domain.com:443 -servername your-domain.com
   ```

3. **Port connectivity:**
   ```bash
   # Test from external network
   telnet your-domain.com 80
   telnet your-domain.com 443
   telnet your-domain.com 8080
   ```

## Monitoring & Logging

Comprehensive monitoring ensures your HAOS deployment runs smoothly and helps with troubleshooting.

### Prometheus Configuration

1. **Create Prometheus configuration:**
   Create `./prometheus/prometheus.yml`:
   ```yaml
   global:
     scrape_interval: 15s
     evaluation_interval: 15s
   
   rule_files:
     - "alert_rules.yml"
   
   alerting:
     alertmanagers:
       - static_configs:
           - targets:
               - alertmanager:9093
   
   scrape_configs:
     - job_name: 'prometheus'
       static_configs:
         - targets: ['localhost:9090']
   
     - job_name: 'haos-core'
       static_configs:
         - targets: ['haos-core:9464']
       metrics_path: '/metrics'
       scrape_interval: 30s
   
     - job_name: 'postgres'
       static_configs:
         - targets: ['postgres:5432']
       metrics_path: '/metrics'
   
     - job_name: 'redis'
       static_configs:
         - targets: ['redis:6379']
   
     - job_name: 'nginx'
       static_configs:
         - targets: ['nginx:8080']
   
     - job_name: 'node-exporter'
       static_configs:
         - targets: ['node-exporter:9100']
   
     - job_name: 'docker'
       static_configs:
         - targets: ['docker-exporter:9323']
   ```

2. **Add exporters to docker-compose.yml:**
   ```yaml
   services:
     node-exporter:
       image: prom/node-exporter:latest
       container_name: haos-node-exporter
       restart: unless-stopped
       volumes:
         - /proc:/host/proc:ro
         - /sys:/host/sys:ro
         - /:/rootfs:ro
       command:
         - '--path.procfs=/host/proc'
         - '--path.rootfs=/rootfs'
         - '--path.sysfs=/host/sys'
         - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
       expose:
         - 9100
       networks:
         - haos-network
       profiles:
         - monitoring

     postgres-exporter:
       image: prometheuscommunity/postgres-exporter
       container_name: haos-postgres-exporter
       restart: unless-stopped
       environment:
         DATA_SOURCE_NAME: "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?sslmode=disable"
       expose:
         - 9187
       depends_on:
         - postgres
       networks:
         - haos-network
       profiles:
         - monitoring

     redis-exporter:
       image: oliver006/redis_exporter
       container_name: haos-redis-exporter
       restart: unless-stopped
       environment:
         REDIS_ADDR: "redis://redis:6379"
         REDIS_PASSWORD: "${REDIS_PASSWORD}"
       expose:
         - 9121
       depends_on:
         - redis
       networks:
         - haos-network
       profiles:
         - monitoring
   ```

### Grafana Dashboard Configuration

1. **Create Grafana provisioning:**
   Create `./grafana/provisioning/datasources/prometheus.yml`:
   ```yaml
   apiVersion: 1
   
   datasources:
     - name: Prometheus
       type: prometheus
       access: proxy
       url: http://prometheus:9090
       isDefault: true
       editable: true
   ```

2. **Create dashboard configuration:**
   Create `./grafana/provisioning/dashboards/dashboard.yml`:
   ```yaml
   apiVersion: 1
   
   providers:
     - name: 'HAOS Dashboards'
       orgId: 1
       folder: ''
       type: file
       disableDeletion: false
       updateIntervalSeconds: 10
       allowUiUpdates: true
       options:
         path: /etc/grafana/provisioning/dashboards
   ```

3. **HAOS System Dashboard:**
   Create `./grafana/provisioning/dashboards/haos-system.json` with a comprehensive dashboard. This would be a large JSON file, but key panels include:

   - **System Overview:**
     - CPU usage, memory usage, disk usage
     - Network I/O, disk I/O
     - System load, uptime

   - **Application Metrics:**
     - Request rate, response times
     - Error rates, status codes
     - Active connections, queue lengths

   - **Database Metrics:**
     - Connection pool usage
     - Query performance
     - Lock waits, deadlocks

   - **MQTT Metrics:**
     - Message rates
     - Client connections
     - Topic statistics

### Application Logging

1. **Configure application logging in HAOS:**
   Update your application's logging configuration:
   ```javascript
   // Example logging configuration
   const winston = require('winston');
   
   const logger = winston.createLogger({
     level: process.env.LOG_LEVEL || 'info',
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.errors({ stack: true }),
       winston.format.json()
     ),
     transports: [
       new winston.transports.File({
         filename: '/app/logs/error.log',
         level: 'error',
         maxsize: 10485760, // 10MB
         maxFiles: 5,
         tailable: true
       }),
       new winston.transports.File({
         filename: '/app/logs/combined.log',
         maxsize: 10485760, // 10MB
         maxFiles: 5,
         tailable: true
       }),
       new winston.transports.Console({
         format: winston.format.combine(
           winston.format.colorize(),
           winston.format.simple()
         )
       })
     ]
   });
   ```

2. **Structured logging example:**
   ```javascript
   // Good logging practices
   logger.info('User authenticated', {
     userId: user.id,
     email: user.email,
     ip: req.ip,
     userAgent: req.get('user-agent'),
     timestamp: new Date().toISOString()
   });
   
   logger.error('Database connection failed', {
     error: error.message,
     stack: error.stack,
     component: 'database',
     timestamp: new Date().toISOString()
   });
   ```

### Log Management with ELK Stack (Optional)

For advanced log management, add the ELK stack:

1. **Add to docker-compose.yml:**
   ```yaml
   services:
     elasticsearch:
       image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
       container_name: haos-elasticsearch
       restart: unless-stopped
       environment:
         - discovery.type=single-node
         - "ES_JAVA_OPTS=-Xms1g -Xmx1g"
         - xpack.security.enabled=false
       volumes:
         - elasticsearch_data:/usr/share/elasticsearch/data
       ports:
         - "9200:9200"
       networks:
         - haos-network
       profiles:
         - logging

     logstash:
       image: docker.elastic.co/logstash/logstash:8.11.0
       container_name: haos-logstash
       restart: unless-stopped
       volumes:
         - ./logstash/config:/usr/share/logstash/pipeline
         - ./logs:/app/logs:ro
       ports:
         - "5044:5044"
       environment:
         LS_JAVA_OPTS: "-Xmx512m -Xms512m"
       depends_on:
         - elasticsearch
       networks:
         - haos-network
       profiles:
         - logging

     kibana:
       image: docker.elastic.co/kibana/kibana:8.11.0
       container_name: haos-kibana
       restart: unless-stopped
       ports:
         - "5601:5601"
       environment:
         ELASTICSEARCH_HOSTS: http://elasticsearch:9200
       depends_on:
         - elasticsearch
       networks:
         - haos-network
       profiles:
         - logging
   ```

2. **Create Logstash configuration:**
   Create `./logstash/config/logstash.conf`:
   ```ruby
   input {
     file {
       path => "/app/logs/*.log"
       start_position => "beginning"
       sincedb_path => "/dev/null"
       codec => json
     }
   }
   
   filter {
     if [level] == "error" {
       mutate {
         add_tag => [ "error" ]
       }
     }
     
     date {
       match => [ "timestamp", "ISO8601" ]
     }
   }
   
   output {
     elasticsearch {
       hosts => ["elasticsearch:9200"]
       index => "haos-logs-%{+YYYY.MM.dd}"
     }
   }
   ```

### Health Checks & Alerting

1. **Docker health checks** (already included in compose file):
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
     interval: 30s
     timeout: 10s
     retries: 3
     start_period: 40s
   ```

2. **External monitoring with Uptime Robot:**
   - Sign up at uptimerobot.com
   - Monitor https://your-domain.com/health
   - Set up email/SMS alerts

3. **Prometheus Alertmanager configuration:**
   Create `./prometheus/alert_rules.yml`:
   ```yaml
   groups:
     - name: haos_alerts
       rules:
         - alert: HAOSDown
           expr: up{job="haos-core"} == 0
           for: 1m
           labels:
             severity: critical
           annotations:
             summary: "HAOS Core is down"
             description: "HAOS Core has been down for more than 1 minute"
   
         - alert: HighMemoryUsage
           expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
           for: 2m
           labels:
             severity: warning
           annotations:
             summary: "High memory usage"
             description: "Memory usage is above 90%"
   
         - alert: HighDiskUsage
           expr: (node_filesystem_size_bytes{fstype!="tmpfs"} - node_filesystem_free_bytes) / node_filesystem_size_bytes > 0.8
           for: 5m
           labels:
             severity: warning
           annotations:
             summary: "High disk usage"
             description: "Disk usage is above 80%"
   ```

### Log Rotation & Cleanup

1. **Set up logrotate:**
   Create `/etc/logrotate.d/haos`:
   ```
   /home/ubuntu/clawd/projects/haos-v2/logs/*.log {
       daily
       missingok
       rotate 30
       compress
       delaycompress
       notifempty
       create 0644 ubuntu ubuntu
       postrotate
           docker compose -f /path/to/docker-compose.yml exec haos-core kill -USR1 1 2>/dev/null || true
       endscript
   }
   ```

2. **Docker log cleanup script:**
   Create `./scripts/cleanup-logs.sh`:
   ```bash
   #!/bin/bash
   
   # Clean up Docker logs older than 7 days
   docker system prune -f
   
   # Clean up old log files
   find ./logs -name "*.log.*" -mtime +7 -delete
   
   # Clean up old backup files
   find ./backups -name "*.sql.gz" -mtime +30 -delete
   
   echo "Log cleanup completed at $(date)"
   ```

3. **Add to crontab:**
   ```bash
   crontab -e
   # Add line:
   0 2 * * * /path/to/cleanup-logs.sh >> /var/log/haos-cleanup.log 2>&1
   ```

## Backup & Recovery

Implement a comprehensive backup strategy to protect your HAOS data.

### Database Backups

1. **Automated PostgreSQL backup script:**
   Create `./scripts/backup.sh`:
   ```bash
   #!/bin/bash
   
   set -e
   
   # Configuration
   BACKUP_DIR="/home/ubuntu/haos-backups"
   DATE=$(date +%Y%m%d_%H%M%S)
   RETENTION_DAYS=30
   
   # Database credentials from environment
   DB_HOST=${POSTGRES_HOST:-postgres}
   DB_NAME=${POSTGRES_DB}
   DB_USER=${POSTGRES_USER}
   
   # Create backup directory
   mkdir -p $BACKUP_DIR
   
   # Create database backup
   echo "Starting database backup..."
   docker compose exec -T postgres pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | \
       gzip > $BACKUP_DIR/haos_db_$DATE.sql.gz
   
   # Backup configuration files
   echo "Backing up configuration..."
   tar -czf $BACKUP_DIR/haos_config_$DATE.tar.gz \
       .env \
       docker-compose.yml \
       nginx/ \
       mosquitto/ \
       grafana/provisioning/ \
       prometheus/
   
   # Backup uploaded files/data
   echo "Backing up data files..."
   tar -czf $BACKUP_DIR/haos_data_$DATE.tar.gz data/
   
   # Clean up old backups
   echo "Cleaning up old backups..."
   find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete
   
   echo "Backup completed successfully at $(date)"
   
   # Send notification (optional)
   if command -v mail &> /dev/null; then
       echo "HAOS backup completed successfully" | mail -s "HAOS Backup - $DATE" your-email@domain.com
   fi
   ```

2. **Make script executable and add to cron:**
   ```bash
   chmod +x ./scripts/backup.sh
   
   # Add to crontab for daily backups at 2 AM
   crontab -e
   # Add line:
   0 2 * * * cd /path/to/haos && ./scripts/backup.sh >> /var/log/haos-backup.log 2>&1
   ```

### Full System Backup

1. **Complete system backup script:**
   Create `./scripts/full-backup.sh`:
   ```bash
   #!/bin/bash
   
   set -e
   
   BACKUP_DIR="/backup/haos-full"
   DATE=$(date +%Y%m%d_%H%M%S)
   PROJECT_DIR="/path/to/haos"
   
   echo "Starting full system backup..."
   
   # Stop services
   cd $PROJECT_DIR
   docker compose down
   
   # Create full backup
   mkdir -p $BACKUP_DIR
   tar -czf $BACKUP_DIR/haos_full_$DATE.tar.gz \
       --exclude='node_modules' \
       --exclude='.git' \
       --exclude='logs/*.log' \
       -C / \
       $PROJECT_DIR
   
   # Backup Docker volumes
   docker run --rm \
       -v haos-v2_postgres_data:/volume \
       -v $BACKUP_DIR:/backup \
       alpine tar -czf /backup/postgres_volume_$DATE.tar.gz -C /volume .
   
   docker run --rm \
       -v haos-v2_redis_data:/volume \
       -v $BACKUP_DIR:/backup \
       alpine tar -czf /backup/redis_volume_$DATE.tar.gz -C /volume .
   
   # Start services
   docker compose up -d
   
   echo "Full backup completed at $(date)"
   ```

### Remote Backup Storage

1. **AWS S3 backup script:**
   Create `./scripts/s3-backup.sh`:
   ```bash
   #!/bin/bash
   
   set -e
   
   # Configure AWS credentials first:
   # aws configure
   
   LOCAL_BACKUP_DIR="/home/ubuntu/haos-backups"
   S3_BUCKET="your-haos-backups"
   DATE=$(date +%Y%m%d)
   
   # Sync backups to S3
   aws s3 sync $LOCAL_BACKUP_DIR s3://$S3_BUCKET/daily/ \
       --exclude "*" \
       --include "*$DATE*" \
       --delete
   
   # Archive old backups to Glacier
   aws s3 cp s3://$S3_BUCKET/daily/ s3://$S3_BUCKET/archive/$(date +%Y/%m)/ \
       --recursive \
       --exclude "*" \
       --include "*$(date -d '30 days ago' +%Y%m%d)*" \
       --storage-class GLACIER
   
   echo "S3 backup sync completed"
   ```

2. **Secure backup with encryption:**
   ```bash
   #!/bin/bash
   
   # Encrypt before uploading
   gpg --cipher-algo AES256 --compress-algo 1 --s2k-cipher-algo AES256 \
       --s2k-digest-algo SHA512 --s2k-mode 3 --s2k-count 65011712 \
       --force-mdc --quiet --no-greeting --batch --yes \
       --passphrase-file /secure/backup-passphrase \
       --output backup_encrypted.gpg \
       --symmetric backup_file.tar.gz
   
   # Upload encrypted file
   aws s3 cp backup_encrypted.gpg s3://your-bucket/encrypted/
   ```

### Recovery Procedures

1. **Database recovery:**
   Create `./scripts/restore-db.sh`:
   ```bash
   #!/bin/bash
   
   set -e
   
   if [ -z "$1" ]; then
       echo "Usage: $0 <backup_file.sql.gz>"
       exit 1
   fi
   
   BACKUP_FILE=$1
   
   echo "WARNING: This will overwrite the current database!"
   read -p "Are you sure? (yes/no): " confirm
   
   if [ "$confirm" != "yes" ]; then
       echo "Restoration cancelled"
       exit 1
   fi
   
   echo "Stopping HAOS services..."
   docker compose down
   
   echo "Starting database only..."
   docker compose up -d postgres
   sleep 10
   
   echo "Dropping existing database..."
   docker compose exec postgres dropdb -U $POSTGRES_USER $POSTGRES_DB || true
   
   echo "Creating new database..."
   docker compose exec postgres createdb -U $POSTGRES_USER $POSTGRES_DB
   
   echo "Restoring database from backup..."
   gunzip -c $BACKUP_FILE | \
       docker compose exec -T postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
   
   echo "Starting all services..."
   docker compose up -d
   
   echo "Database restoration completed!"
   ```

2. **Full system recovery:**
   Create `./scripts/restore-full.sh`:
   ```bash
   #!/bin/bash
   
   set -e
   
   if [ -z "$1" ]; then
       echo "Usage: $0 <backup_directory>"
       exit 1
   fi
   
   BACKUP_DIR=$1
   RESTORE_DIR="/tmp/haos-restore"
   
   echo "Starting full system restore..."
   
   # Extract backup
   mkdir -p $RESTORE_DIR
   tar -xzf $BACKUP_DIR/haos_full_*.tar.gz -C $RESTORE_DIR
   
   # Stop any existing services
   docker compose down 2>/dev/null || true
   
   # Restore Docker volumes
   docker volume create haos-v2_postgres_data
   docker run --rm \
       -v haos-v2_postgres_data:/volume \
       -v $BACKUP_DIR:/backup \
       alpine tar -xzf /backup/postgres_volume_*.tar.gz -C /volume
   
   docker volume create haos-v2_redis_data
   docker run --rm \
       -v haos-v2_redis_data:/volume \
       -v $BACKUP_DIR:/backup \
       alpine tar -xzf /backup/redis_volume_*.tar.gz -C /volume
   
   # Copy restored files
   cp -r $RESTORE_DIR/* ./
   
   # Start services
   docker compose up -d
   
   echo "Full system restore completed!"
   ```

### Backup Monitoring

1. **Backup verification script:**
   Create `./scripts/verify-backup.sh`:
   ```bash
   #!/bin/bash
   
   BACKUP_DIR="/home/ubuntu/haos-backups"
   TODAY=$(date +%Y%m%d)
   ERROR_COUNT=0
   
   # Check if today's backup exists
   if [ ! -f "$BACKUP_DIR/haos_db_${TODAY}_*.sql.gz" ]; then
       echo "ERROR: Database backup for $TODAY not found"
       ERROR_COUNT=$((ERROR_COUNT + 1))
   fi
   
   # Check backup file integrity
   for backup in $BACKUP_DIR/*.gz; do
       if [ -f "$backup" ]; then
           if ! gunzip -t "$backup" 2>/dev/null; then
               echo "ERROR: Corrupt backup file: $backup"
               ERROR_COUNT=$((ERROR_COUNT + 1))
           fi
       fi
   done
   
   # Check backup age
   find $BACKUP_DIR -name "*.gz" -mtime +1 -exec echo "WARNING: Old backup found: {}" \;
   
   if [ $ERROR_COUNT -eq 0 ]; then
       echo "Backup verification successful"
       exit 0
   else
       echo "Backup verification failed with $ERROR_COUNT errors"
       exit 1
   fi
   ```

## Troubleshooting

Common issues and their solutions.

### Service Won't Start

1. **Check Docker and Docker Compose:**
   ```bash
   # Verify Docker is running
   sudo systemctl status docker
   
   # Check Docker Compose version
   docker compose version
   
   # Validate compose file
   docker compose config
   ```

2. **Check environment variables:**
   ```bash
   # Verify .env file exists and is readable
   ls -la .env
   
   # Check for missing variables
   docker compose config | grep -i "null"
   ```

3. **Review container logs:**
   ```bash
   # Check all service logs
   docker compose logs
   
   # Check specific service
   docker compose logs haos-core
   
   # Follow logs in real-time
   docker compose logs -f haos-core
   ```

4. **Check resource usage:**
   ```bash
   # System resources
   htop
   df -h
   
   # Docker resources
   docker stats
   docker system df
   ```

### Database Connection Issues

1. **Verify database is running:**
   ```bash
   # Check if PostgreSQL container is healthy
   docker compose ps postgres
   
   # Test connection
   docker compose exec postgres pg_isready -U $POSTGRES_USER -d $POSTGRES_DB
   
   # Connect manually
   docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB
   ```

2. **Check database logs:**
   ```bash
   docker compose logs postgres
   ```

3. **Reset database (DESTRUCTIVE!):**
   ```bash
   # Stop services
   docker compose down
   
   # Remove database volume
   docker volume rm haos-v2_postgres_data
   
   # Restart services (will recreate database)
   docker compose up -d
   ```

### SSL/TLS Certificate Issues

1. **Check certificate validity:**
   ```bash
   # Check certificate expiration
   openssl x509 -in ./certs/haos-cert.pem -text -noout | grep "Not After"
   
   # Test SSL connection
   openssl s_client -connect your-domain.com:443 -servername your-domain.com
   ```

2. **Let's Encrypt renewal issues:**
   ```bash
   # Manual renewal
   sudo certbot renew --dry-run
   
   # Check certbot logs
   sudo tail -f /var/log/letsencrypt/letsencrypt.log
   
   # Force renewal
   sudo certbot renew --force-renewal
   ```

3. **Nginx SSL configuration:**
   ```bash
   # Test nginx configuration
   docker compose exec nginx nginx -t
   
   # Reload nginx
   docker compose exec nginx nginx -s reload
   ```

### MQTT Connection Problems

1. **Check MQTT broker:**
   ```bash
   # Check if MQTT container is running
   docker compose ps mqtt
   
   # Check MQTT logs
   docker compose logs mqtt
   
   # Test MQTT connection
   docker compose exec mqtt mosquitto_pub -h localhost -t test -m "hello" -u $MQTT_USERNAME -P $MQTT_PASSWORD
   ```

2. **Test MQTT from outside:**
   ```bash
   # Install MQTT clients
   sudo apt install mosquitto-clients
   
   # Test connection
   mosquitto_pub -h your-domain.com -p 1883 -t test -m "hello" -u $MQTT_USERNAME -P $MQTT_PASSWORD
   
   # Test SSL connection
   mosquitto_pub -h your-domain.com -p 8883 --cafile ./certs/ca-cert.pem -t test -m "hello" -u $MQTT_USERNAME -P $MQTT_PASSWORD
   ```

### Performance Issues

1. **Check system resources:**
   ```bash
   # CPU and memory usage
   htop
   
   # Disk usage
   df -h
   du -sh ./
   
   # I/O statistics
   iotop
   ```

2. **Database performance:**
   ```bash
   # Check database connections
   docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT count(*) FROM pg_stat_activity;"
   
   # Check slow queries
   docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
   ```

3. **Container resource limits:**
   ```bash
   # Check container resource usage
   docker stats --no-stream
   
   # Update resource limits in docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 1G
         cpus: '1.0'
   ```

### Network Connectivity Issues

1. **Check port availability:**
   ```bash
   # Check if ports are listening
   netstat -tlnp | grep -E '(80|443|8080|1883|8883)'
   
   # Test port accessibility
   telnet localhost 8080
   telnet your-domain.com 80
   ```

2. **Firewall configuration:**
   ```bash
   # Check UFW status
   sudo ufw status verbose
   
   # Check iptables rules
   sudo iptables -L -n
   
   # Test connectivity from external source
   curl -I http://your-domain.com
   ```

3. **Docker networking:**
   ```bash
   # List Docker networks
   docker network ls
   
   # Inspect HAOS network
   docker network inspect haos-v2_haos-network
   
   # Check container connectivity
   docker compose exec haos-core ping postgres
   docker compose exec haos-core ping redis
   ```

### Application-Specific Issues

1. **Check application logs:**
   ```bash
   # Application error logs
   tail -f ./logs/error.log
   
   # All application logs
   tail -f ./logs/combined.log
   
   # Search for specific errors
   grep -i "error" ./logs/combined.log | tail -20
   ```

2. **Debug mode:**
   ```bash
   # Enable debug logging
   echo "LOG_LEVEL=debug" >> .env
   docker compose restart haos-core
   
   # Watch debug logs
   docker compose logs -f haos-core
   ```

3. **Health check status:**
   ```bash
   # Check container health
   docker compose ps
   
   # Manual health check
   curl -f http://localhost:8080/health
   
   # Detailed health information
   curl -s http://localhost:8080/health | jq .
   ```

### Recovery Procedures

1. **Service recovery:**
   ```bash
   # Restart specific service
   docker compose restart haos-core
   
   # Rebuild and restart
   docker compose up -d --force-recreate haos-core
   
   # Complete restart
   docker compose down && docker compose up -d
   ```

2. **Data recovery:**
   ```bash
   # Restore from backup
   ./scripts/restore-db.sh /path/to/backup.sql.gz
   
   # Check data integrity
   docker compose exec postgres psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT count(*) FROM users;"
   ```

3. **Emergency procedures:**
   ```bash
   # Emergency stop all services
   docker compose down
   docker stop $(docker ps -q)
   
   # Clean Docker system (DESTRUCTIVE!)
   docker system prune -a -f
   docker volume prune -f
   
   # Fresh start from backups
   ./scripts/restore-full.sh /path/to/backup/directory
   ```

### Log Analysis

1. **Common log patterns to watch for:**
   ```bash
   # Database connection errors
   grep -i "connection.*refused\|timeout" ./logs/combined.log
   
   # Authentication failures
   grep -i "authentication.*failed\|invalid.*credentials" ./logs/combined.log
   
   # High memory usage
   grep -i "out of memory\|memory.*exceeded" ./logs/combined.log
   
   # SSL/TLS issues
   grep -i "ssl\|tls\|certificate" ./logs/combined.log
   ```

2. **Log analysis script:**
   Create `./scripts/analyze-logs.sh`:
   ```bash
   #!/bin/bash
   
   LOG_DIR="./logs"
   REPORT_FILE="/tmp/haos-log-analysis.txt"
   
   echo "HAOS Log Analysis Report - $(date)" > $REPORT_FILE
   echo "======================================" >> $REPORT_FILE
   
   # Error count
   echo "Error Summary:" >> $REPORT_FILE
   grep -c "ERROR" $LOG_DIR/*.log | head -10 >> $REPORT_FILE
   
   # Recent errors
   echo -e "\nRecent Errors:" >> $REPORT_FILE
   grep "ERROR" $LOG_DIR/*.log | tail -20 >> $REPORT_FILE
   
   # Database issues
   echo -e "\nDatabase Issues:" >> $REPORT_FILE
   grep -i "database\|postgres\|connection" $LOG_DIR/*.log | grep -i "error\|fail" | tail -10 >> $REPORT_FILE
   
   # Performance issues
   echo -e "\nPerformance Warnings:" >> $REPORT_FILE
   grep -i "slow\|timeout\|memory\|cpu" $LOG_DIR/*.log | tail -10 >> $REPORT_FILE
   
   echo "Log analysis complete. Report saved to $REPORT_FILE"
   cat $REPORT_FILE
   ```

### Getting Help

1. **Gather diagnostic information:**
   ```bash
   # System information
   uname -a
   docker --version
   docker compose version
   df -h
   free -h
   
   # Service status
   docker compose ps
   docker compose logs --tail=50
   
   # Configuration validation
   docker compose config
   ```

2. **Create support bundle:**
   Create `./scripts/support-bundle.sh`:
   ```bash
   #!/bin/bash
   
   BUNDLE_DIR="/tmp/haos-support-$(date +%Y%m%d_%H%M%S)"
   mkdir -p $BUNDLE_DIR
   
   # System information
   uname -a > $BUNDLE_DIR/system-info.txt
   docker --version >> $BUNDLE_DIR/system-info.txt
   docker compose version >> $BUNDLE_DIR/system-info.txt
   df -h >> $BUNDLE_DIR/system-info.txt
   free -h >> $BUNDLE_DIR/system-info.txt
   
   # Service status
   docker compose ps > $BUNDLE_DIR/service-status.txt
   docker stats --no-stream >> $BUNDLE_DIR/service-status.txt
   
   # Logs (last 1000 lines)
   docker compose logs --tail=1000 > $BUNDLE_DIR/service-logs.txt
   
   # Configuration (redacted)
   docker compose config > $BUNDLE_DIR/docker-compose-config.yml
   
   # Network information
   docker network ls > $BUNDLE_DIR/network-info.txt
   docker network inspect haos-v2_haos-network >> $BUNDLE_DIR/network-info.txt
   
   # Create archive
   tar -czf haos-support-bundle.tar.gz -C /tmp $(basename $BUNDLE_DIR)
   
   echo "Support bundle created: haos-support-bundle.tar.gz"
   echo "Please attach this file when requesting support."
   ```

---

## Conclusion

This guide provides a comprehensive foundation for self-hosting HAOS v2 with Docker containers. Key points to remember:

- **Security First:** Always use strong passwords, enable SSL/TLS, and keep systems updated
- **Monitor Everything:** Set up proper monitoring and alerting from day one
- **Backup Regularly:** Implement and test your backup strategy before you need it
- **Document Changes:** Keep notes of any customizations or configuration changes
- **Start Simple:** Begin with the basic configuration and add complexity as needed

For additional support, consult the HAOS documentation, community forums, or create a support bundle using the provided script.

**Happy self-hosting!** 🏠🤖