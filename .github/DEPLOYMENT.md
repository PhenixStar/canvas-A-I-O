# Deployment Guide for canvas-A-I-O

## Overview

Automated deployment pipeline for canvas-A-I-O with Caddy reverse proxy and HTTPS.

## Architecture

```
Internet
   ↓
Cloudflare DNS (Manual Setup) - draw.nulled.ai
   ↓
Caddy Reverse Proxy (Port 443) - 209.38.58.83
   ↓
canvas-a-i-o App (Internal Port 3000)
```

## DNS Setup (Manual - One Time)

### Step 1: Login to Cloudflare Dashboard

Navigate to: https://dash.cloudflare.com/

### Step 2: Select Zone

Choose `nulled.ai` from your zones list.

### Step 3: Add DNS Record

Go to **DNS** → **Records** → **Add record**

| Field | Value |
|-------|-------|
| **Type** | A |
| **Name** | draw |
| **IPv4 address** | 209.38.58.83 |
| **Proxy status** | ✅ Proxied (orange cloud) |
| **TTL** | Auto |

### Step 4: Save

Click **Save**. DNS propagation typically takes 5-10 minutes globally.

### Verify DNS Propagation

```bash
# Check DNS resolution
dig draw.nulled.ai

# Should return Cloudflare IPs
```

## Deployment Process

The `.github/workflows/deploy-server.yml` workflow automatically:

1. **Deploys Application Stack:**
   - Pulls latest docker image from GHCR
   - Starts canvas-a-i-o container (internal network, port 3000)
   - Starts Caddy reverse proxy (ports 80/443)
   - Starts Watchtower for automatic updates
   - Configures internal Docker networking

2. **Verifies Deployment:**
   - Checks container health status
   - Tests Caddy admin API
   - Tests application health endpoint

## Manual Deployment

To trigger deployment manually:

1. Go to **Actions** tab in GitHub
2. Select **Deploy to Server** workflow
3. Click **Run workflow** → Select branch → Click **Run workflow**

## Automatic Deployment

Deployment runs automatically on:
- Every push to `main` branch

## Server Configuration

### Resource Allocation

| Component | Memory Limit | Purpose |
|-----------|--------------|---------|
| canvas-a-i-o | 256MB | Next.js application |
| Caddy | 64MB | Reverse proxy + SSL |
| Watchtower | 64MB | Auto-update service |
| **Total** | **384MB** | Out of 512MB available |

### Health Checks

- **Caddy:** `http://localhost:2019/config/` (admin API)
- **Application:** `http://localhost:3000/api/health`
- **Public:** `https://draw.nulled.ai/health`

## Accessing the Application

- **URL:** https://draw.nulled.ai
- **HTTP automatically redirects to HTTPS**

## Troubleshooting

### Check Container Status

```bash
ssh -p 2222 -i ~/.ssh/id_ed25519 alaa@209.38.58.83
cd /srv/canvas-a-i-o
docker ps
docker-compose -f docker-compose.prod.yml logs
```

### View Caddy Logs

```bash
docker logs caddy -f
# Or access log file
docker exec caddy cat /logs/caddy-access.log
```

### View Application Logs

```bash
docker logs canvas-a-i-o -f
```

### Restart Services

```bash
docker-compose -f docker-compose.prod.yml restart
```

### Check DNS Propagation

```bash
# Check DNS resolution
dig draw.nulled.ai

# Check from multiple DNS servers
dig @8.8.8.8 draw.nulled.ai
dig @1.1.1.1 draw.nulled.ai
```

### Test SSL Certificate

```bash
# Check certificate validity
curl -I https://draw.nulled.ai

# Should show 200 OK with SSL/TLS
```

## Rollback Procedure

If deployment causes issues:

### 1. Via Cloudflare Dashboard:

- Login to Cloudflare
- Select `nulled.ai` zone
- Delete or disable `draw` DNS record

### 2. Via Server:

```bash
ssh -p 2222 -i ~/.ssh/id_ed25519 alaa@209.38.58.83
cd /srv/canvas-a-i-o
docker-compose -f docker-compose.prod.yml down
# Restore previous configuration
```

### 3. Revert Workflow:

- Go to GitHub Actions
- Find failed run
- Click **Re-run jobs**

## Security Considerations

- ✅ All traffic encrypted via HTTPS
- ✅ DDoS protection via Cloudflare proxy
- ✅ Application not directly exposed (internal network only)
- ✅ Security headers configured (HSTS, X-Frame-Options, etc.)
- ✅ Automatic SSL certificate management by Caddy
- ✅ SSH key stored in GitHub Secrets (never in code)

## Monitoring

### Key Metrics to Monitor

- Container health status
- Memory usage (should stay under 512MB)
- DNS resolution time
- SSL certificate validity
- Application response time

### Alerting Recommendations

- Container restarts
- High memory usage (>450MB)
- DNS resolution failures
- SSL certificate expiration

## Update IP Address

If server IP changes:

1. Update `deploy-server.yml` workflow with new IP
2. Update Cloudflare DNS record:
   - Go to DNS → Records
   - Find `draw` record
   - Click **Edit**
   - Update IPv4 address
   - Click **Save**

## Future Improvements

- [ ] Add application performance monitoring (APM)
- [ ] Configure backup strategy for Caddy data
- [ ] Set up log aggregation (ELK/Loki)
- [ ] Add staging environment
- [ ] Implement blue-green deployment
- [ ] Add rate limiting configuration
