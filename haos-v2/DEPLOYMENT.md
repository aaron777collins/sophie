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
- Check Docker logs: `docker logs haos-v2`
- Verify environment variables
- Check Matrix server connectivity
- Validate network configurations

## 📚 Additional Resources
- [Matrix Server Setup Guide](https://matrix.org/docs/guides/home-server-setup)
- [HAOS v2 Documentation](/docs)
- [Community Support Forum](https://github.com/your-org/haos-v2/discussions)

---

**🚨 Warning:** Always test in a staging environment before production deployment.