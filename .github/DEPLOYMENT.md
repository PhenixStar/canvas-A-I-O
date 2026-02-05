# Deployment Guide for canvas-A-I-O

## Overview

This document describes the automated deployment pipeline for canvas-A-I-O to production server with Cloudflare DNS and Caddy reverse proxy.

## Architecture

```
Internet
   ↓
Cloudflare (DDoS, CDN, SSL Termination) - draw.nulled.ai
   ↓
Caddy Reverse Proxy (Port 443) - 209.38.58.83
   ↓
canvas-a-i-o App (Internal Port 3000)
```

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

| Secret | Value | Description |
|--------|-------|-------------|
| `SSH_PRIVATE_KEY` | Your SSH private key content | SSH key for server access (id_ed25519) |
| `CF_EMAIL` | aqweider@gmail.com | Cloudflare account email |
| `CF_API_KEY` | Your Cloudflare Global API Key | From Cloudflare Dashboard → My Profile → API Tokens |

### How to Add Secrets

1. Go to your repository on GitHub
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret from the table above

### Getting Cloudflare API Key

1. Login to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click your profile → "My Profile"
3. Scroll to "API Tokens" section
4. Click "View" next to Global API Key
5. Verify your password
6. Copy the API Key

## Deployment Process

The `.github/workflows/deploy-server.yml` workflow automatically:

1. **Deploys Application Stack:**
   - Pulls latest docker image from GHCR
   - Starts canvas-a-i-o container (internal network, port 3000)
   - Starts Caddy reverse proxy (ports 80/443)
   - Starts Watchtower for automatic updates
   - Configures internal Docker networking

2. **Configures Cloudflare DNS:**
   - Creates/updates A record: `draw.nulled.ai` → `209.38.58.83`
   - Enables Cloudflare proxy (DDoS protection, caching)
   - Idempotent: safe to run multiple times

3. **Verifies Deployment:**
   - Checks DNS propagation
   - Verifies container health
   - Tests application endpoints

## Manual Deployment

To trigger deployment manually:

1. Go to Actions tab in GitHub
2. Select "Deploy to Server" workflow
3. Click "Run workflow" → Select branch → Click "Run workflow"

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

### Manual DNS Update (if automation fails)

```bash
# Use existing cf-dns.sh script
cd /d/AI/mapping-config/services/cloudflare/scripts
./cf-dns.sh add draw 209.38.58.83 -z nulled.ai
```

## Rollback Procedure

If deployment causes issues:

1. **Via Cloudflare Dashboard:**
   - Login to Cloudflare
   - Select `nulled.ai` zone
   - Delete or disable `draw` DNS record

2. **Via Server:**
   ```bash
   ssh -p 2222 -i ~/.ssh/id_ed25519 alaa@209.38.58.83
   cd /srv/canvas-a-i-o
   docker-compose -f docker-compose.prod.yml down
   # Restore previous configuration
   ```

3. **Revert Workflow:**
   - Go to GitHub Actions
   - Find failed run
   - Click "Re-run jobs"

## Security Considerations

- ✅ All traffic encrypted via HTTPS
- ✅ DDoS protection via Cloudflare
- ✅ Application not directly exposed (internal network only)
- ✅ Security headers configured (HSTS, X-Frame-Options, etc.)
- ✅ Automatic SSL certificate management by Caddy
- ✅ SSH keys stored in GitHub Secrets (never in code)

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

## Future Improvements

- [ ] Add application performance monitoring (APM)
- [ ] Configure backup strategy for Caddy data
- [ ] Set up log aggregation (ELK/Loki)
- [ ] Add staging environment
- [ ] Implement blue-green deployment
- [ ] Add rate limiting configuration
