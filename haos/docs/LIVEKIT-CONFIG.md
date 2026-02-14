# LiveKit Configuration for HAOS

> **Status:** Infrastructure READY on dev2
> **Updated:** 2026-02-13 21:48 EST

## Production URLs (dev2)

| Service | URL |
|---------|-----|
| LiveKit Signaling | `wss://livekit.dev2.aaroncollins.info` |
| LiveKit JWT Service | `https://dev2.aaroncollins.info/_livekit` |
| HAOS App | `https://dev2.aaroncollins.info` |
| Element Call | `https://call.dev2.aaroncollins.info` |
| Matrix Homeserver | `https://dev2.aaroncollins.info` |

## LiveKit Credentials

```
API Key: devkey
API Secret: LiveKit2026SecretKeyForMatrix
```

## Running Containers (dev2)

| Container | Image | Ports | Status |
|-----------|-------|-------|--------|
| matrix-livekit | livekit/livekit-server:latest | 7880-7882, 50000-50100/udp | Up 4 days |
| matrix-livekit-jwt | ghcr.io/element-hq/lk-jwt-service:latest | 8380→8080 | Up 4 days |
| matrix-element-call | ghcr.io/element-hq/element-call:latest | 8280→8080 | Up 4 days |
| matrix-coturn | coturn/coturn:latest | TURN server | Up 4 days |
| matrix-synapse | ghcr.io/element-hq/synapse:latest | 8008, 8448 | Up 4 days |
| haos-v2 | haos-v2-haos | 3001→3000 | Up 11 hours |

## Environment Variables for HAOS

Add to `.env.local` or environment:

```env
NEXT_PUBLIC_LIVEKIT_URL=wss://livekit.dev2.aaroncollins.info
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=LiveKit2026SecretKeyForMatrix
LIVEKIT_JWT_SERVICE_URL=https://dev2.aaroncollins.info/_livekit
```

## Matrix Well-Known Configuration

The Matrix well-known already advertises LiveKit:

```json
{
  "m.homeserver": {"base_url": "https://dev2.aaroncollins.info"},
  "org.matrix.msc4143.rtc_foci": [
    {
      "type": "livekit",
      "livekit_service_url": "https://dev2.aaroncollins.info/_livekit"
    }
  ]
}
```

## LiveKit Server Config

Located at `/home/ubuntu/matrix/livekit/livekit.yaml` on dev2:

```yaml
port: 7880
bind_addresses:
  - 0.0.0.0
rtc:
  port_range_start: 50000
  port_range_end: 50100
  tcp_port: 7881
  use_external_ip: true
keys:
  devkey: LiveKit2026SecretKeyForMatrix
logging:
  level: info
  json: false
```

## Caddy Configuration

All services are reverse-proxied through Caddy:
- `dev2.aaroncollins.info` → HAOS (default) + Matrix APIs
- `dev2.aaroncollins.info/_livekit/*` → JWT service
- `livekit.dev2.aaroncollins.info` → LiveKit signaling
- `call.dev2.aaroncollins.info` → Element Call

## Integration Notes

1. **JWT Token Flow:**
   - Client requests token from `/_livekit/sfu/get`
   - JWT service validates Matrix access token
   - Returns LiveKit room token
   - Client connects to `wss://livekit.dev2.aaroncollins.info`

2. **CORS:** Caddy handles CORS headers

3. **TLS:** Automatic via Caddy's Let's Encrypt integration

## Troubleshooting

```bash
# Check LiveKit container logs
ssh dev2 "docker logs matrix-livekit"

# Test JWT service
curl https://dev2.aaroncollins.info/_livekit/healthz

# Check Caddy logs
ssh dev2 "docker logs caddy"
```
