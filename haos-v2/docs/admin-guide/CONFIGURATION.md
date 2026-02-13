# HAOS Configuration Guide

## Table of Contents

1. [Overview](#overview)
2. [Configuration Architecture](#configuration-architecture)
3. [Matrix Synapse Configuration](#matrix-synapse-configuration)
4. [HAOS Application Configuration](#haos-application-configuration)
5. [LiveKit Configuration](#livekit-configuration)
6. [Database Configuration](#database-configuration)
7. [Nginx/Reverse Proxy Configuration](#nginxreverse-proxy-configuration)
8. [Authentication Configuration](#authentication-configuration)
9. [Media and File Upload Configuration](#media-and-file-upload-configuration)
10. [Performance Tuning](#performance-tuning)
11. [Federation Configuration](#federation-configuration)
12. [Logging and Monitoring](#logging-and-monitoring)
13. [Branding and Customization](#branding-and-customization)
14. [Environment-Specific Configurations](#environment-specific-configurations)

---

## Overview

This guide covers all configuration aspects of HAOS deployment, from basic settings to advanced customization options. HAOS configuration is distributed across several components that work together to provide a seamless Discord-like experience over the Matrix protocol.

### Configuration Hierarchy

```
HAOS Configuration Stack
├── HAOS Application (.env, config files)
├── Matrix Synapse (homeserver.yaml)
├── LiveKit (livekit.yaml)
├── Database (PostgreSQL settings)
├── Reverse Proxy (Nginx)
└── System (Docker, systemd)
```

---

## Configuration Architecture

### Configuration Files Overview

| Component | Configuration File | Purpose |
|-----------|-------------------|---------|
| **HAOS App** | `.env.production` | Application environment variables |
| **HAOS App** | `haos.config.js` | Application-specific settings |
| **Matrix** | `homeserver.yaml` | Synapse homeserver configuration |
| **LiveKit** | `livekit.yaml` | Voice/video service configuration |
| **Database** | `docker-compose.yml` | PostgreSQL container settings |
| **Nginx** | `/etc/nginx/sites-available/haos` | Reverse proxy configuration |
| **Docker** | `docker-compose.yml` | Container orchestration |

### Configuration Management Best Practices

1. **Version Control**: Keep configuration templates in git
2. **Environment Separation**: Use different configs for dev/staging/prod
3. **Secret Management**: Use proper secret management for sensitive values
4. **Documentation**: Document all custom configuration changes
5. **Backup**: Regular backup of configuration files

---

## Matrix Synapse Configuration

### Core Synapse Settings

#### Basic Server Configuration

```yaml
# /opt/haos/matrix/homeserver.yaml

# Server identification
server_name: "your.domain.com"
public_baseurl: "https://your.domain.com"
pid_file: /data/homeserver.pid

# Network listeners
listeners:
  # Client and Federation API
  - port: 8008
    tls: false
    type: http
    x_forwarded: true
    bind_addresses: ['0.0.0.0']
    resources:
      - names: [client, federation]
        compress: false
  
  # Additional client listener (optional)
  - port: 8009
    tls: false
    type: http
    x_forwarded: true
    bind_addresses: ['127.0.0.1']
    resources:
      - names: [client]
        compress: true

# Admin contact
admin_contact: 'admin@your.domain.com'
```

#### Database Configuration Options

```yaml
# PostgreSQL (Recommended for production)
database:
  name: psycopg2
  args:
    user: synapse
    password: "{{ POSTGRES_PASSWORD }}"
    database: synapse
    host: postgres
    port: 5432
    cp_min: 5
    cp_max: 50
    keepalives_idle: 10
    keepalives_interval: 10
    keepalives_count: 3

# SQLite (Development only)
# database:
#   name: sqlite3
#   args:
#     database: /data/homeserver.db
```

#### Redis Configuration

```yaml
# Redis for improved performance
redis:
  enabled: true
  host: redis
  port: 6379
  # password: "redis_password"  # if auth enabled
  dbid: 0

# Worker configuration (for high load)
instance_map:
  main:
    host: localhost
    port: 8008

worker_app: synapse.app.homeserver
```

### User Registration and Authentication

```yaml
# Registration settings
enable_registration: false
enable_registration_without_verification: false
registrations_require_3pid: []
allowed_local_3pids: []

# Registration shared secret (for admin user creation)
registration_shared_secret: "{{ REGISTRATION_SHARED_SECRET }}"

# Email verification
email:
  smtp_host: "smtp.your.domain.com"
  smtp_port: 587
  smtp_user: "haos@your.domain.com"
  smtp_pass: "{{ EMAIL_PASSWORD }}"
  force_tls: true
  notif_from: "HAOS <haos@your.domain.com>"
  app_name: "HAOS"
  
  # Email verification templates
  template_dir: "/data/templates"
  
# Phone number verification (optional)
# msisdn:
#   http_client_timeout: 60s
#   validation_timeout: 300s
```

### Security and Rate Limiting

```yaml
# Rate limiting
rc_message:
  per_second: 5
  burst_count: 50

rc_registration:
  per_second: 0.17
  burst_count: 3

rc_login:
  address:
    per_second: 0.5
    burst_count: 5
  account:
    per_second: 0.17
    burst_count: 3
  failed_attempts:
    per_second: 0.17
    burst_count: 3

rc_admin_redaction:
  per_second: 1
  burst_count: 50

rc_joins:
  local:
    per_second: 0.5
    burst_count: 10
  remote:
    per_second: 0.25
    burst_count: 5

# Security settings
bcrypt_rounds: 12
allow_guest_access: false
require_auth_for_profile_requests: true
limit_profile_requests_to_users_who_share_rooms: true

# CAPTCHA (if needed)
# enable_registration_captcha: true
# recaptcha_public_key: "YOUR_RECAPTCHA_PUBLIC_KEY"
# recaptcha_private_key: "YOUR_RECAPTCHA_PRIVATE_KEY"
```

### Media Configuration

```yaml
# Media store
media_store_path: "/data/media_store"
max_upload_size: "50M"
max_image_pixels: "32M"

# Media retention
media_retention:
  default_policy:
    min_lifetime: 1d
    max_lifetime: 30d

# Thumbnail generation
thumbnail_sizes:
  - width: 32
    height: 32
    method: crop
  - width: 96
    height: 96
    method: crop
  - width: 320
    height: 240
    method: scale
  - width: 640
    height: 480
    method: scale
  - width: 800
    height: 600
    method: scale

# Content scanning (optional)
# content_repository_api:
#   server: "https://clamav.your.domain.com"
#   timeout: 30
```

### Voice/Video Integration

```yaml
# TURN server configuration
turn_uris:
  - "turn:turn.your.domain.com:3478?transport=udp"
  - "turn:turn.your.domain.com:3478?transport=tcp"
  - "turns:turn.your.domain.com:5349?transport=tcp"

turn_shared_secret: "{{ TURN_SHARED_SECRET }}"
turn_user_lifetime: 86400000
turn_allow_guests: true

# WebRTC settings
web_client_location: https://your.domain.com/
```

---

## HAOS Application Configuration

### Environment Variables (.env.production)

```bash
# /opt/haos/app/.env.production

# Application Environment
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Matrix Configuration
MATRIX_HOMESERVER=https://your.domain.com
MATRIX_HOMESERVER_URL=https://your.domain.com
MATRIX_ACCESS_TOKEN="{{ MATRIX_ACCESS_TOKEN }}"
MATRIX_USER_ID="@haos-admin:your.domain.com"

# LiveKit Configuration
LIVEKIT_URL=wss://your.domain.com:7880
LIVEKIT_API_KEY="{{ LIVEKIT_API_KEY }}"
LIVEKIT_API_SECRET="{{ LIVEKIT_API_SECRET }}"

# Application Branding
HAOS_BRAND_NAME="Your Organization"
HAOS_BRAND_LOGO="/assets/logo.png"
HAOS_BRAND_ICON="/assets/icon.png"
HAOS_BRAND_COLOR="#5865f2"
HAOS_SUPPORT_EMAIL="support@your.domain.com"

# Feature Flags
HAOS_VOICE_ENABLED=true
HAOS_VIDEO_ENABLED=true
HAOS_SCREEN_SHARE_ENABLED=true
HAOS_FILE_UPLOADS_ENABLED=true
HAOS_ENCRYPTION_REQUIRED=false

# Performance Settings
HAOS_MESSAGE_LIMIT=50
HAOS_ROOM_MEMBER_LIMIT=1000
HAOS_CACHE_TTL=300

# Integration Settings
HAOS_WEBHOOK_ENABLED=false
HAOS_WEBHOOK_SECRET="{{ WEBHOOK_SECRET }}"
HAOS_API_ENABLED=true
HAOS_API_RATE_LIMIT=100

# Monitoring and Analytics
HAOS_ANALYTICS_ENABLED=false
HAOS_ANALYTICS_ENDPOINT="https://analytics.your.domain.com"
HAOS_ERROR_REPORTING_ENABLED=true
HAOS_ERROR_REPORTING_DSN="{{ SENTRY_DSN }}"

# Security Settings
HAOS_SESSION_SECRET="{{ SESSION_SECRET }}"
HAOS_CSRF_ENABLED=true
HAOS_HTTPS_ONLY=true

# Development/Debug Settings (production should be false)
HAOS_DEBUG=false
HAOS_LOG_LEVEL=info
HAOS_ENABLE_SOURCE_MAPS=false
```

### Application Configuration (haos.config.js)

```javascript
// /opt/haos/app/haos.config.js

module.exports = {
  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    trustProxy: true,
  },

  // Matrix client configuration
  matrix: {
    homeserver: process.env.MATRIX_HOMESERVER,
    userId: process.env.MATRIX_USER_ID,
    accessToken: process.env.MATRIX_ACCESS_TOKEN,
    
    // Client options
    clientOptions: {
      baseUrl: process.env.MATRIX_HOMESERVER,
      userId: process.env.MATRIX_USER_ID,
      accessToken: process.env.MATRIX_ACCESS_TOKEN,
      timelineSupport: true,
      unstableClientRelationAggregation: true,
    },
    
    // Sync options
    syncOptions: {
      initialSyncLimit: 20,
      lazyLoadMembers: true,
      includeArchivedRooms: false,
    },
  },

  // LiveKit configuration
  livekit: {
    url: process.env.LIVEKIT_URL,
    apiKey: process.env.LIVEKIT_API_KEY,
    apiSecret: process.env.LIVEKIT_API_SECRET,
    
    // Room settings
    roomOptions: {
      adaptiveStream: true,
      dynacast: true,
      videoCaptureDefaults: {
        resolution: {
          width: 1280,
          height: 720,
        },
        facingMode: 'user',
      },
      audioCaptureDefaults: {
        autoGainControl: true,
        echoCancellation: true,
        noiseSuppression: true,
      },
    },
  },

  // UI customization
  ui: {
    theme: {
      primary: process.env.HAOS_BRAND_COLOR || '#5865f2',
      secondary: '#4f46e5',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
    },
    
    branding: {
      name: process.env.HAOS_BRAND_NAME || 'HAOS',
      logo: process.env.HAOS_BRAND_LOGO,
      icon: process.env.HAOS_BRAND_ICON,
      supportEmail: process.env.HAOS_SUPPORT_EMAIL,
    },
    
    layout: {
      sidebarWidth: 240,
      memberListWidth: 240,
      messageLimit: parseInt(process.env.HAOS_MESSAGE_LIMIT) || 50,
    },
  },

  // Feature configuration
  features: {
    voice: process.env.HAOS_VOICE_ENABLED === 'true',
    video: process.env.HAOS_VIDEO_ENABLED === 'true',
    screenShare: process.env.HAOS_SCREEN_SHARE_ENABLED === 'true',
    fileUploads: process.env.HAOS_FILE_UPLOADS_ENABLED === 'true',
    encryption: process.env.HAOS_ENCRYPTION_REQUIRED === 'true',
    webhooks: process.env.HAOS_WEBHOOK_ENABLED === 'true',
    api: process.env.HAOS_API_ENABLED === 'true',
  },

  // Security configuration
  security: {
    sessionSecret: process.env.HAOS_SESSION_SECRET,
    csrfEnabled: process.env.HAOS_CSRF_ENABLED === 'true',
    httpsOnly: process.env.HAOS_HTTPS_ONLY === 'true',
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.HAOS_API_RATE_LIMIT) || 100,
    },
  },

  // File upload configuration
  uploads: {
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'video/mp4',
      'video/webm',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'application/pdf',
      'text/plain',
    ],
    storage: {
      type: 'matrix', // Use Matrix content repository
      // Alternative: 's3', 'local'
    },
  },

  // Monitoring configuration
  monitoring: {
    analytics: {
      enabled: process.env.HAOS_ANALYTICS_ENABLED === 'true',
      endpoint: process.env.HAOS_ANALYTICS_ENDPOINT,
    },
    
    errorReporting: {
      enabled: process.env.HAOS_ERROR_REPORTING_ENABLED === 'true',
      dsn: process.env.HAOS_ERROR_REPORTING_DSN,
    },
    
    logging: {
      level: process.env.HAOS_LOG_LEVEL || 'info',
      format: 'json',
      enableSourceMaps: process.env.HAOS_ENABLE_SOURCE_MAPS === 'true',
    },
  },
};
```

---

## LiveKit Configuration

### Core LiveKit Settings (livekit.yaml)

```yaml
# /opt/haos/livekit/livekit.yaml

# Server binding
port: 7880
bind_addresses: [""]

# RTC configuration
rtc:
  tcp_port: 7881
  port_range_start: 50000
  port_range_end: 60000
  use_external_ip: true
  external_ip: "{{ EXTERNAL_IP }}"
  
  # STUN/TURN servers
  ice_servers:
    - urls: ["stun:stun.l.google.com:19302"]
    - urls: ["turn:turn.your.domain.com:3478"]
      username: "{{ TURN_USERNAME }}"
      credential: "{{ TURN_PASSWORD }}"

# Redis configuration (shared with Matrix)
redis:
  address: redis:6379
  # password: "redis_password"
  db: 1

# API configuration
keys:
  "{{ LIVEKIT_API_KEY }}": "{{ LIVEKIT_API_SECRET }}"

# Room settings
room:
  auto_create: true
  empty_timeout: 10m
  departure_timeout: 20s
  enable_recording: false

# Audio settings
audio:
  # Audio codec preferences
  codecs:
    - mime: "audio/opus"
      fmtp: "minptime=10;useinbandfec=1"
    - mime: "audio/red"

# Video settings  
video:
  # Video codec preferences
  codecs:
    - mime: "video/VP8"
    - mime: "video/H264"
      fmtp: "level-asymmetry-allowed=1;packetization-mode=1;profile-level-id=42001f"
    - mime: "video/VP9"

# Webhook configuration (optional)
webhook:
  urls:
    - "https://your.domain.com/webhooks/livekit"
  api_key: "{{ WEBHOOK_API_KEY }}"

# Recording configuration (optional)
# recording:
#   enabled: true
#   storage:
#     type: s3
#     access_key: "{{ AWS_ACCESS_KEY }}"
#     secret: "{{ AWS_SECRET_KEY }}"
#     region: "us-east-1"
#     bucket: "haos-recordings"
#   
#   # Recording templates
#   templates:
#     - layout: grid
#       video_quality: high
#       audio_only: false

# Logging
logging:
  level: info
  json: true

# Development settings
development:
  disable_strict_config: false
```

### Advanced LiveKit Configuration

```yaml
# Performance tuning
limits:
  bytes_per_sec: 5000000  # 5MB/s per connection
  num_tracks: 16
  
# Network adaptation
network_adaptation:
  probe_bandwidth: true
  bandwidth_optimizer: true
  
# Simulcast settings
simulcast:
  enabled: true
  layers:
    - quality: low
      dimensions: { width: 320, height: 180 }
      bitrate: 150000
    - quality: medium  
      dimensions: { width: 640, height: 360 }
      bitrate: 500000
    - quality: high
      dimensions: { width: 1280, height: 720 }
      bitrate: 1200000
```

---

## Database Configuration

### PostgreSQL Optimization

#### Docker Compose Database Configuration

```yaml
# /opt/haos/docker-compose.yml - PostgreSQL section

  postgres:
    image: postgres:15-alpine
    container_name: haos-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: synapse
      POSTGRES_USER: synapse
      POSTGRES_PASSWORD: "{{ POSTGRES_PASSWORD }}"
      POSTGRES_INITDB_ARGS: "--encoding=UTF8 --lc-collate=C --lc-ctype=C"
      
      # Performance tuning
      POSTGRES_SHARED_BUFFERS: "{{ SHARED_BUFFERS }}"        # 25% of RAM
      POSTGRES_EFFECTIVE_CACHE_SIZE: "{{ EFFECTIVE_CACHE }}"  # 75% of RAM
      POSTGRES_WORK_MEM: "4MB"
      POSTGRES_MAINTENANCE_WORK_MEM: "64MB"
      POSTGRES_CHECKPOINT_COMPLETION_TARGET: "0.9"
      POSTGRES_WAL_BUFFERS: "16MB"
      POSTGRES_DEFAULT_STATISTICS_TARGET: "100"
      
    volumes:
      - ./postgres-data:/var/lib/postgresql/data
      - ./postgres-config/postgresql.conf:/etc/postgresql/postgresql.conf
      - ./postgres-config/pg_hba.conf:/etc/postgresql/pg_hba.conf
    ports:
      - "127.0.0.1:5432:5432"
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    networks:
      - haos-network
```

#### Custom PostgreSQL Configuration

```ini
# /opt/haos/postgres-config/postgresql.conf

# Connection settings
listen_addresses = '*'
port = 5432
max_connections = 200

# Memory settings (adjust based on server RAM)
shared_buffers = 1GB              # 25% of RAM
effective_cache_size = 3GB        # 75% of RAM
work_mem = 4MB
maintenance_work_mem = 256MB

# Checkpoint settings
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1

# Write-ahead logging
wal_level = replica
archive_mode = on
archive_command = 'test ! -f /backup/wal/%f && cp %p /backup/wal/%f'
max_wal_senders = 3
wal_keep_segments = 32

# Performance monitoring
log_min_duration_statement = 1000
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on

# Locale settings
lc_messages = 'en_US.UTF-8'
lc_monetary = 'en_US.UTF-8'
lc_numeric = 'en_US.UTF-8'
lc_time = 'en_US.UTF-8'
```

### Database Maintenance Scripts

```bash
#!/bin/bash
# /opt/haos/scripts/db-maintenance.sh

# Database optimization script
echo "Starting database maintenance..."

# Vacuum and analyze
docker compose exec postgres psql -U synapse -d synapse -c "VACUUM ANALYZE;"

# Check database size
docker compose exec postgres psql -U synapse -d synapse -c "
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation 
FROM pg_stats 
ORDER BY schemaname, tablename;
"

# Index usage statistics
docker compose exec postgres psql -U synapse -d synapse -c "
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_tup_read,
    idx_tup_fetch 
FROM pg_stat_user_indexes 
ORDER BY idx_tup_read DESC;
"

echo "Database maintenance complete."
```

---

## Nginx/Reverse Proxy Configuration

### Advanced Nginx Configuration

```nginx
# /etc/nginx/sites-available/haos

# Rate limiting
limit_req_zone $binary_remote_addr zone=login:10m rate=3r/m;
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=media:10m rate=5r/s;

# Upstream definitions
upstream haos_app {
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream matrix_synapse {
    server 127.0.0.1:8008 max_fails=3 fail_timeout=30s;
    keepalive 16;
}

upstream livekit {
    server 127.0.0.1:7880 max_fails=3 fail_timeout=30s;
}

# Main server block
server {
    listen 443 ssl http2;
    server_name your.domain.com;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/your.domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your.domain.com/privkey.pem;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; media-src 'self' https:; connect-src 'self' wss: https:; font-src 'self'; object-src 'none'; base-uri 'self'" always;
    
    # File upload limits
    client_max_body_size 50M;
    client_body_buffer_size 128k;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        access_log off;
    }
    
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
        
        # Add security headers for app
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
    }
    
    # Matrix client API
    location /_matrix {
        proxy_pass http://matrix_synapse;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
        
        # Rate limiting for specific endpoints
        location /_matrix/client/r0/login {
            limit_req zone=login burst=5 nodelay;
            proxy_pass http://matrix_synapse;
            proxy_set_header X-Forwarded-For $remote_addr;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Host $host;
        }
        
        location /_matrix/media/ {
            limit_req zone=media burst=10 nodelay;
            proxy_pass http://matrix_synapse;
            proxy_set_header X-Forwarded-For $remote_addr;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Host $host;
            client_max_body_size 50M;
        }
        
        # Increase timeouts for sync endpoints
        location /_matrix/client/r0/sync {
            proxy_pass http://matrix_synapse;
            proxy_set_header X-Forwarded-For $remote_addr;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_set_header Host $host;
            proxy_read_timeout 120s;
            proxy_send_timeout 120s;
        }
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
        proxy_read_timeout 86400;
    }
    
    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://haos_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
    
    # Matrix well-known endpoints
    location /.well-known/matrix/server {
        return 200 '{"m.server": "your.domain.com:443"}';
        default_type application/json;
        add_header Access-Control-Allow-Origin *;
        add_header Cache-Control "max-age=3600";
    }
    
    location /.well-known/matrix/client {
        return 200 '{"m.homeserver":{"base_url":"https://your.domain.com"},"m.identity_server":{"base_url":"https://vector.im"}}';
        default_type application/json;
        add_header Access-Control-Allow-Origin *;
        add_header Cache-Control "max-age=3600";
    }
    
    # Security.txt
    location /.well-known/security.txt {
        return 301 https://$server_name/security.txt;
    }
    
    location = /security.txt {
        add_header Content-Type text/plain;
        return 200 "Contact: security@your.domain.com\nExpires: 2025-12-31T23:59:59.000Z\nCanonical: https://your.domain.com/security.txt\n";
    }
}

# Federation server
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

---

## Authentication Configuration

### Matrix Authentication Settings

```yaml
# /opt/haos/matrix/homeserver.yaml - Authentication section

# Password authentication
password_config:
  enabled: true
  # Require lowercase, uppercase, number, and special character
  policy:
    min_length: 12
    max_length: 128
    require_lowercase: true
    require_uppercase: true
    require_digit: true
    require_symbol: true

# Single Sign-On (Optional)
# saml2_config:
#   sp_config:
#     metadata:
#       inline:
#         - entityID: "https://your.domain.com/_matrix/saml2/metadata.xml"
#           service:
#             sp:
#               endpoints:
#                 assertion_consumer_service:
#                   - Binding: urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST
#                     Location: "https://your.domain.com/_matrix/saml2/authn_response"
#                     index: "1"
#               nameid_format: urn:oasis:names:tc:SAML:2.0:nameid-format:persistent

# OIDC/OAuth2 configuration (Optional)
# oidc_providers:
#   - idp_id: google
#     idp_name: "Google"
#     issuer: "https://accounts.google.com/"
#     client_id: "your-google-client-id"
#     client_secret: "your-google-client-secret"
#     scopes: ["openid", "profile", "email"]
#     user_mapping_provider:
#       config:
#         localpart_template: "{{ user.email.split('@')[0] }}"
#         display_name_template: "{{ user.name }}"
```

### HAOS Application Authentication

```javascript
// /opt/haos/app/config/auth.js

module.exports = {
  // Matrix authentication
  matrix: {
    homeserver: process.env.MATRIX_HOMESERVER,
    loginType: 'm.login.password',
    
    // Registration settings
    registration: {
      enabled: false,
      requireEmail: true,
      requireInvite: true,
      defaultRooms: [
        '#general:your.domain.com',
        '#welcome:your.domain.com'
      ],
    },
    
    // Session management
    session: {
      secret: process.env.HAOS_SESSION_SECRET,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  },
  
  // Password policy
  passwordPolicy: {
    minLength: 12,
    maxLength: 128,
    requireLowercase: true,
    requireUppercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    prohibitCommonPasswords: true,
  },
  
  // Account security
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 30 * 60 * 1000, // 30 minutes
    requireEmailVerification: true,
    twoFactorAuth: {
      enabled: false,
      methods: ['totp'], // Time-based OTP
    },
  },
};
```

---

## Media and File Upload Configuration

### Matrix Media Repository

```yaml
# /opt/haos/matrix/homeserver.yaml - Media section

# Media store configuration
media_store_path: "/data/media_store"
max_upload_size: "50M"
max_image_pixels: "32M"

# Media retention policy
media_retention:
  default_policy:
    min_lifetime: 7d
    max_lifetime: 1y
  
# Thumbnail settings
thumbnail_sizes:
  - width: 32
    height: 32
    method: crop
  - width: 96
    height: 96
    method: crop
  - width: 160
    height: 160
    method: crop
  - width: 320
    height: 240
    method: scale
  - width: 640
    height: 480
    method: scale
  - width: 800
    height: 600
    method: scale

# URL previews
url_preview_enabled: true
max_spider_size: "10M"
url_preview_ip_range_blacklist:
  - '127.0.0.0/8'
  - '10.0.0.0/8'
  - '172.16.0.0/12'
  - '192.168.0.0/16'
  - '100.64.0.0/10'
  - '169.254.0.0/16'
  - '::1/128'
  - 'fe80::/10'
  - 'fc00::/7'

url_preview_url_blacklist:
  # Optional: block specific domains
  - netloc: "evil.com"
  - netloc: "*.evil.com"
```

### HAOS Media Configuration

```javascript
// /opt/haos/app/config/media.js

module.exports = {
  uploads: {
    // File size limits
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxImageSize: 10 * 1024 * 1024, // 10MB
    maxVideoSize: 100 * 1024 * 1024, // 100MB
    
    // Allowed file types
    allowedMimeTypes: [
      // Images
      'image/jpeg',
      'image/png', 
      'image/gif',
      'image/webp',
      'image/svg+xml',
      
      // Videos
      'video/mp4',
      'video/webm',
      'video/ogg',
      
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/mp4',
      
      // Documents
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/json',
    ],
    
    // Image processing
    images: {
      enableThumbnails: true,
      thumbnailSizes: [32, 96, 160, 320, 640],
      enableWebP: true,
      quality: 85,
      maxDimensions: {
        width: 4096,
        height: 4096,
      },
    },
    
    // Video processing
    videos: {
      enableThumbnails: true,
      thumbnailFormat: 'webp',
      maxDuration: 10 * 60, // 10 minutes
      maxDimensions: {
        width: 1920,
        height: 1080,
      },
    },
    
    // Storage backend
    storage: {
      type: 'matrix', // Use Matrix content repository
      // Alternative: 's3', 'local'
      
      // S3 configuration (if using S3)
      // s3: {
      //   region: process.env.AWS_REGION,
      //   bucket: process.env.AWS_BUCKET,
      //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      //   endpoint: process.env.AWS_ENDPOINT, // for S3-compatible services
      // },
    },
    
    // Virus scanning (optional)
    virusScanning: {
      enabled: false,
      endpoint: 'http://clamav:3310',
      timeout: 30000,
    },
  },
  
  // Content moderation
  moderation: {
    enableAutoModeration: false,
    scanImages: false,
    bannedExtensions: [
      '.exe', '.bat', '.cmd', '.scr',
      '.com', '.pif', '.vbs', '.js',
    ],
  },
};
```

---

## Performance Tuning

### System-Level Optimizations

```bash
# /etc/sysctl.d/99-haos.conf

# Network optimizations
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 12582912 16777216
net.ipv4.tcp_wmem = 4096 12582912 16777216
net.core.netdev_max_backlog = 5000

# File descriptor limits
fs.file-max = 65536

# Virtual memory
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
```

```bash
# /etc/security/limits.d/haos.conf

# File descriptor limits for haos user
haos soft nofile 65536
haos hard nofile 65536

# Process limits
haos soft nproc 32768
haos hard nproc 32768
```

### Application Performance Configuration

```javascript
// /opt/haos/app/config/performance.js

module.exports = {
  // Caching configuration
  cache: {
    // Redis caching
    redis: {
      host: 'redis',
      port: 6379,
      db: 2,
      ttl: 300, // 5 minutes default
      
      // Cache strategies
      strategies: {
        userProfiles: { ttl: 600 },
        roomMembers: { ttl: 300 },
        messageHistory: { ttl: 60 },
        mediaMetadata: { ttl: 3600 },
      },
    },
    
    // Memory caching
    memory: {
      maxSize: 100 * 1024 * 1024, // 100MB
      ttl: 60, // 1 minute
    },
  },
  
  // Rate limiting
  rateLimiting: {
    global: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 1000,
    },
    
    perEndpoint: {
      '/api/messages': { windowMs: 60000, max: 60 },
      '/api/rooms': { windowMs: 60000, max: 30 },
      '/api/upload': { windowMs: 60000, max: 10 },
    },
  },
  
  // Database connection pooling
  database: {
    pool: {
      min: 5,
      max: 50,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
    },
  },
  
  // WebSocket optimization
  websocket: {
    maxConnections: 1000,
    heartbeatInterval: 30000,
    compressionEnabled: true,
    compressionThreshold: 1024,
  },
};
```

### Database Performance Tuning

```sql
-- /opt/haos/scripts/db-performance.sql

-- Create indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_room_id_stream_ordering 
ON events(room_id, stream_ordering);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_sender_time
ON events(sender, origin_server_ts);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_room_memberships_user_id_room_id
ON room_memberships(user_id, room_id);

-- Analyze table statistics
ANALYZE events;
ANALYZE room_memberships;
ANALYZE receipts_linearized;

-- Check for unused indexes
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_total_relation_size(indexrelid) DESC;
```

---

## Federation Configuration

### Matrix Federation Setup

```yaml
# /opt/haos/matrix/homeserver.yaml - Federation section

# Federation settings
federation_domain_whitelist: []  # Empty = federate with all
# federation_domain_whitelist:     # Restrict to specific domains
#   - matrix.org
#   - trusted-server.com

# Federation blacklist
federation_ip_range_blacklist:
  - '127.0.0.0/8'
  - '10.0.0.0/8'
  - '172.16.0.0/12'
  - '192.168.0.0/16'
  - '100.64.0.0/10'
  - '169.254.0.0/16'
  - '::1/128'
  - 'fe80::/10'
  - 'fc00::/7'

# Federation verification
federation_verify_certificates: true
federation_certificate_verification_whitelist: []

# Key server configuration  
trusted_key_servers:
  - server_name: "matrix.org"
    verify_keys:
      "ed25519:auto": "Noi6WqcDj0QmPxCNQqgezwTlBKrfqehY1u2FyWP9uYw"
  - server_name: "vector.im"

# Federation metrics
enable_metrics: true
metrics_port: 9092

# Federation rate limiting
federation_rc_window_size: 1000
federation_rc_sleep_limit: 10
federation_rc_sleep_delay: 500
federation_rc_reject_limit: 50
federation_rc_concurrent: 3
```

### Custom Federation Policies

```yaml
# Federation room directory settings
alias_creation_rules:
  - user_id: "*"
    alias: "*"
    action: allow

room_list_publication_rules:
  - user_id: "*"
    alias: "*"
    action: allow

# Spam checking (optional)
spam_checker:
  - module: "synapse_antispam.AntiSpamModule"
    config:
      # Block messages from blacklisted servers
      server_blacklist:
        - "spam-server.com"
      
      # Rate limit unknown servers
      unknown_server_ratelimit: 10
```

---

## Logging and Monitoring

### Application Logging Configuration

```yaml
# /opt/haos/matrix/log.config
version: 1

formatters:
  precise:
    format: '%(asctime)s - %(name)s - %(lineno)d - %(levelname)s - %(request)s - %(message)s'

handlers:
  file:
    class: logging.handlers.TimedRotatingFileHandler
    formatter: precise
    filename: /data/logs/homeserver.log
    when: midnight
    backupCount: 30
    encoding: utf8
    
  console:
    class: logging.StreamHandler
    formatter: precise

loggers:
  synapse.storage.SQL:
    level: WARNING
    
  synapse.access.http:
    level: WARNING
    
  synapse.federation.transport:
    level: WARNING

root:
  level: INFO
  handlers: [file, console]

disable_existing_loggers: false
```

### HAOS Application Logging

```javascript
// /opt/haos/app/config/logging.js

const winston = require('winston');
const path = require('path');

const logDir = process.env.HAOS_LOG_DIR || '/opt/haos/logs';

const logger = winston.createLogger({
  level: process.env.HAOS_LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  
  transports: [
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logDir, 'haos.log'),
      maxsize: 50 * 1024 * 1024, // 50MB
      maxFiles: 10,
      tailable: true,
    }),
    
    // Separate file for errors
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 50 * 1024 * 1024,
      maxFiles: 5,
    }),
    
    // Console for development
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      })
    ] : []),
  ],
});

// Performance logging
const performanceLogger = winston.createLogger({
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'performance.log'),
      maxsize: 100 * 1024 * 1024, // 100MB
      maxFiles: 5,
    })
  ]
});

module.exports = { logger, performanceLogger };
```

### Monitoring Configuration

```javascript
// /opt/haos/app/config/monitoring.js

module.exports = {
  // Prometheus metrics
  metrics: {
    enabled: true,
    path: '/metrics',
    
    // Custom metrics
    customMetrics: {
      httpRequestDuration: true,
      activeConnections: true,
      messagesSent: true,
      roomsCreated: true,
      usersOnline: true,
    },
  },
  
  // Health checks
  healthCheck: {
    path: '/health',
    checks: [
      'database',
      'matrix',
      'livekit',
      'redis',
    ],
    
    timeout: 10000, // 10 seconds
  },
  
  // Error tracking
  errorTracking: {
    enabled: process.env.HAOS_ERROR_REPORTING_ENABLED === 'true',
    dsn: process.env.HAOS_ERROR_REPORTING_DSN,
    
    // Filter errors
    beforeSend: (event) => {
      // Don't report client-side validation errors
      if (event.exception && 
          event.exception.values &&
          event.exception.values[0] &&
          event.exception.values[0].type === 'ValidationError') {
        return null;
      }
      return event;
    },
  },
  
  // Performance monitoring
  performance: {
    enabled: true,
    sampleRate: 0.1, // Monitor 10% of requests
    
    // Slow query detection
    slowQueryThreshold: 1000, // 1 second
    
    // Memory usage alerts
    memoryThreshold: 0.8, // 80% of available memory
  },
};
```

---

## Branding and Customization

### HAOS Branding Configuration

```javascript
// /opt/haos/app/config/branding.js

module.exports = {
  // Brand identity
  brand: {
    name: process.env.HAOS_BRAND_NAME || 'HAOS',
    shortName: process.env.HAOS_BRAND_SHORT_NAME || 'HAOS',
    tagline: 'Secure Team Communication',
    
    // Visual identity
    logo: {
      main: '/assets/branding/logo.svg',
      icon: '/assets/branding/icon.svg',
      favicon: '/assets/branding/favicon.ico',
      appleTouchIcon: '/assets/branding/apple-touch-icon.png',
    },
    
    // Color scheme
    colors: {
      primary: process.env.HAOS_BRAND_COLOR || '#5865f2',
      secondary: '#4f46e5',
      accent: '#06d6a0',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      
      // Dark theme colors
      dark: {
        background: '#1a1a1a',
        surface: '#2d2d2d',
        text: '#ffffff',
      },
    },
    
    // Typography
    fonts: {
      primary: "'Inter', sans-serif",
      monospace: "'JetBrains Mono', monospace",
    },
  },
  
  // Application customization
  application: {
    // Welcome message
    welcomeMessage: {
      title: 'Welcome to HAOS',
      subtitle: 'Your secure communication platform',
      description: 'Connect with your team using end-to-end encrypted messaging, voice, and video.',
    },
    
    // Default rooms/channels
    defaultRooms: [
      {
        name: 'General',
        alias: '#general:your.domain.com',
        topic: 'General discussion',
        preset: 'public_chat',
      },
      {
        name: 'Random',
        alias: '#random:your.domain.com', 
        topic: 'Random conversations',
        preset: 'public_chat',
      },
    ],
    
    // Footer customization
    footer: {
      companyName: 'Your Organization',
      supportEmail: process.env.HAOS_SUPPORT_EMAIL || 'support@your.domain.com',
      links: [
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Terms of Service', url: '/terms' },
        { label: 'Support', url: '/support' },
      ],
    },
    
    // Feature toggles
    features: {
      showUserCount: true,
      showServerInfo: true,
      allowThemeCustomization: true,
      showPoweredBy: false,
    },
  },
  
  // Security branding
  security: {
    // Privacy notice
    privacyNotice: {
      enabled: true,
      message: 'This is a secure communication platform. All messages are end-to-end encrypted.',
    },
    
    // Compliance badges
    compliance: {
      showSOC2: false,
      showGDPR: true,
      showHIPAA: false,
    },
  },
};
```

### Custom CSS Theming

```css
/* /opt/haos/app/public/assets/branding/custom-theme.css */

:root {
  /* Brand colors */
  --brand-primary: {{ HAOS_BRAND_COLOR }};
  --brand-secondary: #4f46e5;
  --brand-accent: #06d6a0;
  
  /* Custom sidebar styling */
  --sidebar-background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
  --sidebar-text: #ffffff;
  --sidebar-text-secondary: rgba(255, 255, 255, 0.7);
  
  /* Custom button styling */
  --button-primary-bg: var(--brand-primary);
  --button-primary-hover: color-mix(in srgb, var(--brand-primary) 85%, black);
  
  /* Chat customization */
  --message-background: #f8fafc;
  --message-hover: #f1f5f9;
  --message-own-background: color-mix(in srgb, var(--brand-primary) 10%, white);
}

/* Custom logo styling */
.brand-logo {
  max-height: 32px;
  width: auto;
}

/* Custom loading screen */
.loading-screen {
  background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
}

/* Custom scrollbars */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--brand-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--button-primary-hover);
}
```

---

## Environment-Specific Configurations

### Development Configuration

```bash
# /opt/haos/app/.env.development

NODE_ENV=development
PORT=3000
HOST=localhost

# Development Matrix server
MATRIX_HOMESERVER=https://dev.your.domain.com
MATRIX_USER_ID=@dev-admin:dev.your.domain.com

# Development LiveKit
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=dev-api-key
LIVEKIT_API_SECRET=dev-api-secret

# Debug settings
HAOS_DEBUG=true
HAOS_LOG_LEVEL=debug
HAOS_ENABLE_SOURCE_MAPS=true

# Development features
HAOS_DEV_TOOLS=true
HAOS_MOCK_AUTH=false
HAOS_SKIP_SSL_VERIFY=true
```

### Staging Configuration

```bash
# /opt/haos/app/.env.staging

NODE_ENV=staging
PORT=3000
HOST=0.0.0.0

# Staging Matrix server
MATRIX_HOMESERVER=https://staging.your.domain.com
MATRIX_USER_ID=@staging-admin:staging.your.domain.com

# Staging LiveKit
LIVEKIT_URL=wss://staging.your.domain.com:7880

# Staging-specific settings
HAOS_ANALYTICS_ENABLED=false
HAOS_ERROR_REPORTING_ENABLED=true
HAOS_LOG_LEVEL=info

# Feature flags for testing
HAOS_EXPERIMENTAL_FEATURES=true
HAOS_BETA_FEATURES=true
```

### Production Configuration

```bash
# /opt/haos/app/.env.production

NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Production Matrix server
MATRIX_HOMESERVER=https://your.domain.com
MATRIX_USER_ID=@admin:your.domain.com

# Production LiveKit
LIVEKIT_URL=wss://your.domain.com:7880

# Production security
HAOS_DEBUG=false
HAOS_LOG_LEVEL=warn
HAOS_HTTPS_ONLY=true
HAOS_CSRF_ENABLED=true

# Production features
HAOS_ANALYTICS_ENABLED=true
HAOS_ERROR_REPORTING_ENABLED=true
HAOS_MONITORING_ENABLED=true

# Performance optimization
HAOS_ENABLE_CACHING=true
HAOS_ENABLE_COMPRESSION=true
HAOS_ENABLE_CDN=true
```

### Configuration Validation Script

```bash
#!/bin/bash
# /opt/haos/scripts/validate-config.sh

echo "Validating HAOS configuration..."

# Check required environment variables
required_vars=(
  "MATRIX_HOMESERVER"
  "MATRIX_USER_ID" 
  "LIVEKIT_URL"
  "LIVEKIT_API_KEY"
  "LIVEKIT_API_SECRET"
  "HAOS_SESSION_SECRET"
)

for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "ERROR: Required environment variable $var is not set"
    exit 1
  fi
done

# Validate URLs
if ! curl -s "${MATRIX_HOMESERVER}/_matrix/client/versions" > /dev/null; then
  echo "ERROR: Cannot connect to Matrix homeserver at ${MATRIX_HOMESERVER}"
  exit 1
fi

# Test LiveKit connection
if ! timeout 5 bash -c "</dev/tcp/${LIVEKIT_URL#*://}/7880"; then
  echo "WARNING: Cannot connect to LiveKit server"
fi

# Check file permissions
if [[ ! -r "/opt/haos/app/.env.production" ]]; then
  echo "ERROR: Cannot read production environment file"
  exit 1
fi

# Validate configuration files
if ! node -c "/opt/haos/app/haos.config.js"; then
  echo "ERROR: Invalid JavaScript syntax in haos.config.js"
  exit 1
fi

echo "Configuration validation completed successfully!"
```

---

This comprehensive configuration guide covers all major aspects of HAOS deployment configuration. For specific deployment scenarios, refer to the [INSTALLATION.md](./INSTALLATION.md) guide, and for ongoing maintenance, see [MAINTENANCE.md](./MAINTENANCE.md).