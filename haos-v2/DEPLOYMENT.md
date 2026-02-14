# HAOS v2 Deployment Guide

## 📦 Deployment Options

HAOS v2 supports multiple deployment strategies to suit different use cases:

### 1. Local Development
Ideal for testing and contributing to the project.

#### Prerequisites
- Node.js 18+
- npm or yarn
- Docker (optional)

```bash
# Clone the repository
git clone https://github.com/your-org/haos-v2.git
cd haos-v2

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run development server
npm run dev
```

### 2. Docker Deployment
Recommended for production and self-hosting.

#### Single-Container Deployment
```bash
# Build Docker image
docker build -t haos-v2 .

# Run the container
docker run -p 3000:3000 \
  -e MATRIX_SERVER_URL=https://matrix.example.com \
  -e JWT_SECRET=your_secret_key \
  haos-v2
```

#### Docker Compose (Recommended)
```yaml
# docker-compose.yml
version: '3.8'
services:
  haos:
    image: haos-v2
    ports:
      - "3000:3000"
    environment:
      - MATRIX_SERVER_URL=https://matrix.example.com
      - DATABASE_URL=postgres://user:pass@postgres:5432/haos
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - postgres

  postgres:
    image: postgres:13
    volumes:
      - haos-postgres-data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=haos
      - POSTGRES_USER=haos
      - POSTGRES_PASSWORD=${DB_PASSWORD}

volumes:
  haos-postgres-data:
```

```bash
# Start services
docker-compose up -d
```

### 3. Kubernetes Deployment
For large-scale, high-availability setups.

```bash
# Create namespace
kubectl create namespace haos

# Apply Kubernetes manifests
kubectl apply -f k8s/
```

## 🔐 Environment Configuration

Key environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MATRIX_SERVER_URL` | Matrix homeserver URL | `https://matrix.example.com` |
| `DATABASE_URL` | PostgreSQL connection string | `postgres://user:pass@host:5432/haos` |
| `JWT_SECRET` | Secret for token generation | `long_random_string` |
| `LIVEKIT_API_KEY` | LiveKit API credentials | `sk_xxx` |
| `NEXTAUTH_SECRET` | NextAuth.js secret | `long_random_string` |

## 🌐 Networking & Reverse Proxy

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name chat.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name chat.example.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔧 Matrix Homeserver Configuration

### Synapse (Reference Implementation)
```yaml
# homeserver.yaml
server_name: "example.com"
public_baseurl: "https://matrix.example.com"

registration_shared_secret: "your_registration_secret"

enable_registration: true
enable_registration_without_verification: false

federation_verify_certificates: true
```

## 🚀 Scaling & Performance

### Horizontal Scaling
- Use stateless design
- Leverage Kubernetes for auto-scaling
- Implement caching with Redis

### Recommended Resources
| Deployment Type | CPU | RAM | Storage |
|----------------|-----|-----|---------|
| Development    | 2 cores | 4 GB | 20 GB |
| Small Team     | 4 cores | 8 GB | 50 GB |
| Enterprise     | 8+ cores | 16+ GB | 100+ GB |

## 📊 Monitoring & Logging

### Recommended Tools
- Prometheus for metrics
- Grafana for dashboards
- ELK Stack for logging
- Sentry for error tracking

## 🛡️ Security Recommendations

1. Always use HTTPS
2. Implement fail2ban
3. Regular security updates
4. Use strong, unique passwords
5. Enable two-factor authentication
6. Limit federation if needed
7. Regular security audits

## 🆘 Troubleshooting

### Common Issues

#### Docker Build Performance Issues
**Problem:** Docker build timeouts or extremely slow builds  
**Symptoms:** Build hangs during "Copying context" or takes >180s  
**Solution:** Create .dockerignore file to reduce build context:
```bash
# Create .dockerignore in project root
cat > .dockerignore << EOF
.git/
node_modules/
.next/
*.log
.env*
coverage/
cypress/videos/
cypress/screenshots/
memory/
EOF
```

#### Container Startup Failures
**Problem:** Container exits immediately or won't start  
**Symptoms:** `docker compose up` shows container stopping  
**Diagnosis Steps:**
```bash
# Check container logs
docker compose logs haos

# Verify build completed successfully
docker images | grep haos

# Test standalone build locally first
cd apps/web/.next/standalone && node apps/web/server.js
```

#### Environment Configuration Missing
**Problem:** Application fails at runtime due to missing environment variables  
**Required Variables:**
```bash
NEXT_PUBLIC_MATRIX_HOMESERVER=https://your-matrix-server.com
NEXT_PUBLIC_LIVEKIT_URL=wss://your-livekit-server.com  
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_secret
LIVEKIT_JWT_SERVICE_URL=https://your-jwt-service.com
```

#### Network Connectivity Issues
**Problem:** Can't connect to Matrix server or LiveKit  
**Validation:**
```bash
# Test Matrix server connectivity
curl -I https://your-matrix-server.com/_matrix/client/versions

# Verify Docker network exists
docker network inspect matrix_matrix || docker network create matrix_matrix
```

### Deployment Verification Checklist
- [ ] Docker build completes without timeout (<5 minutes)
- [ ] Container starts and stays running
- [ ] Health check returns HTTP 200 
- [ ] Application logs show "Ready in Xms"
- [ ] Web interface accessible on configured port
- [ ] Matrix server connectivity confirmed
- [ ] LiveKit services responding

### Advanced Troubleshooting
- Check Docker logs: `docker compose logs -f haos-v2`
- Verify environment variables: `docker compose exec haos-v2 env`  
- Check Matrix server connectivity: `docker compose exec haos-v2 wget -O- https://matrix.server.com/_matrix/client/versions`
- Validate network configurations: `docker network inspect matrix_matrix`

## 📚 Additional Resources
- [Matrix Server Setup Guide](https://matrix.org/docs/guides/home-server-setup)
- [HAOS v2 Documentation](/docs)
- [Community Support Forum](https://github.com/your-org/haos-v2/discussions)

---

**🚨 Warning:** Always test in a staging environment before production deployment.