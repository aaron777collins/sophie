# Server Infrastructure

> **Last Updated:** [2026-03-07 09:53 EST]
> **Purpose:** Document all servers, subdomains, and services for future troubleshooting

---

## 🖥️ Server Overview

| Server | Hostname | Purpose | SSH |
|--------|----------|---------|-----|
| **dev3** | `dev3.aaroncollins.info` | Main server (Sophie lives here) | `ssh dev3` |
| **dev2** | `dev2.aaroncollins.info` | Secondary server | `ssh dev2` |

---

## 🔧 dev3 - Main Server (THIS SERVER)

**IP:** Check DNS for current IP
**SSH:** `ssh dev3` or `ssh ubuntu@dev3.aaroncollins.info`
**Web Stack:** Docker Compose with Caddy reverse proxy

### Caddyfile Location
- `/home/ubuntu/webstack/caddy/Caddyfile`

### Subdomains on dev3

| Subdomain | Service | Backend | Notes |
|-----------|---------|---------|-------|
| `dev2.aaroncollins.info` | BDV2 + Melo | bdv2-app:3000 | `/bdv2/*` → BDV2, root → Melo |
| `n8n2.aaroncollins.info` | n8n Automation | n8n:5678 | Workflow automation |
| `mc3.aaroncollins.info` | MCSManager Panel | mcsmanager-web:23333 | Minecraft server management |
| `mc3-daemon.aaroncollins.info` | MCSManager Daemon | 172.18.0.1:24444 | Daemon API |
| `aiceo.aaroncollins.info` | AICEO UI | aiceo-ui:3000 / aiceo-api:4000 | AI CEO project |
| `aiceo-api.aaroncollins.info` | AICEO API | aiceo-api:4000 | API endpoint |
| `mermaid.aaroncollins.info` | Mermaid Editor | mermaid-api:3456 + static | Diagram editor |
| `static2.aaroncollins.info` | Static AI Models | /srv/static-models | Model hosting with CORS |
| `budget.aaroncollins.info` | SmartBudget | smartbudget-app:3000 | Personal finance |
| `jenkins.aaroncollins.info` | Jenkins CI/CD | jenkins:8080 | CI/CD server |
| `openrouter.aaroncollins.info` | OpenRouter Proxy | openrouter-proxy:4001 | LLM routing |
| `voice.aaroncollins.info` | Sophie Voice Bridge | 172.18.0.1:8014 | ElevenLabs endpoint |
| `organizer.aaroncollins.info` | Paperless-ngx | paperless:8000 | Document management |
| `videomaker.aaroncollins.info` | Bible Drawing Pipeline | 172.18.0.1:3100 + static | Video editor |
| `dyndev3.aaroncollins.info` | Dynamic Dev Router | /etc/caddy/dyndev/routes.caddy | Dynamic routing |
| `matrix3.aaroncollins.info` | Matrix Homeserver | matrix-synapse:8008 | Chat server |
| `livekit3.aaroncollins.info` | LiveKit (Matrix RTC) | 172.18.0.1:7880 | Voice/video calls |
| `text.aaroncollins.info` | Sophie SMS Webhook | 172.18.0.1:8089 | Twilio inbound SMS |

### Key Docker Containers (dev3)
```bash
# Check running containers
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Key containers:
# - caddy (reverse proxy, ports 80/443)
# - bdv2-app (port 3000)
# - matrix-synapse, matrix-traefik, matrix-postgres
# - paperless + supporting containers
# - smartbudget-app
# - jenkins
```

### ⚠️ IMPORTANT: Caddy Configuration (dev3)

**[2026-03-07] LESSON LEARNED:** There were TWO Caddys running - a Docker container AND a system service!

**The correct setup:**
- ✅ Docker Caddy in `/home/ubuntu/webstack/` - THIS IS THE ONE TO USE
- ❌ System Caddy (`/etc/caddy/`) - DISABLED, should stay disabled

**If Caddy issues occur:**
```bash
# Check Docker Caddy is running
docker ps | grep caddy

# Make sure system Caddy is disabled
sudo systemctl status caddy  # Should say "disabled"

# Restart Docker Caddy
cd /home/ubuntu/webstack && docker compose restart caddy

# Reload Caddy config without restart
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
```

---

## 🔧 dev2 - Secondary Server

**SSH:** `ssh dev2` or `ssh ubuntu@dev2.aaroncollins.info`

### Subdomains on dev2

| Subdomain | Service | Notes |
|-----------|---------|-------|
| `dev2.aaroncollins.info` | Main entry | Points here |
| *(others TBD)* | Document as discovered | |

> **TODO:** Document dev2's full service list next time I SSH there

---

## 🔒 SSL/TLS Notes

**Caddy handles SSL automatically** via Let's Encrypt ACME.

### Current Certificate Status (dev3)
- `dev2.aaroncollins.info`: Valid until **May 10, 2026**
- Other subdomains: Auto-renewed by Caddy

### ACME Challenge Note
[2026-03-07] The `/.well-known/acme-challenge/` path returns 404 when manually tested because:
- The reverse proxy sends requests to backend apps
- BUT Caddy intercepts ACME challenges internally before proxying
- This is **not a problem** - Caddy handles it automatically

---

## 🛠️ Troubleshooting Checklist

### Site Not Loading
1. Check if Docker Caddy is running: `docker ps | grep caddy`
2. Check container logs: `docker logs caddy --tail 50`
3. Make sure system Caddy is disabled: `sudo systemctl status caddy`
4. Check backend service: `docker ps | grep <service-name>`

### SSL Issues
1. Check cert expiry: `echo | openssl s_client -servername DOMAIN -connect DOMAIN:443 2>/dev/null | openssl x509 -noout -dates`
2. Force cert renewal: `docker exec caddy caddy reload --config /etc/caddy/Caddyfile`

### 502 Bad Gateway
- Backend container not running or crashed
- Check: `docker ps` and `docker logs <container>`

### Adding New Subdomain
1. Add DNS record in Cloudflare/DNS provider
2. Add config block in `/home/ubuntu/webstack/caddy/Caddyfile`
3. Reload: `docker exec caddy caddy reload --config /etc/caddy/Caddyfile`

---

## 📝 Change Log

| Date | Change | Notes |
|------|--------|-------|
| 2026-03-07 | Disabled system Caddy | Was conflicting with Docker Caddy |
| 2026-03-07 | Created this doc | Infrastructure documentation |
