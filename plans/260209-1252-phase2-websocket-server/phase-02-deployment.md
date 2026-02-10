# Phase 2: WebSocket Server - Deployment Guide

**Created:** 2026-02-09
**Status:** Planning
**Priority:** HIGH

---

## Overview

This guide covers the deployment of the Hocuspocus WebSocket server to the production VPS (sgp1-02: 209.38.58.83:2222).

### Prerequisites

- ✅ PostgreSQL database accessible
- ✅ Better Auth sessions working (Sprint 2 complete)
- ✅ Node.js 22+ installed on VPS
- ✅ Phase 1 Yjs client integrated
- ⏳ WebSocket server code ready
- ⏳ PM2 installed globally
- ⏳ Nginx configured

---

## VPS Information

**Server:** sgp1-02
**IP:** 209.38.58.83
**SSH Port:** 2222
**Domain:** draw.nulled.ai

**SSH Connection:**
```bash
ssh root@209.38.58.83 -p 2222
```

---

## Pre-Deployment Checklist

### Local Preparation

- [ ] All tests passing locally
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Environment variables documented
- [ ] Deployment script tested

### VPS Preparation

- [ ] SSH access confirmed
- [ ] Node.js version checked (node --version)
- [ ] PM2 installed (pm2 --version)
- [ ] PostgreSQL accessible (psql --version)
- [ ] Firewall rules configured (ports 3001, 3002)
- [ ] SSL certificate valid for draw.nulled.ai
- [ ] Nginx installed and running
- [ ] Database backup created

### Code Preparation

- [ ] TypeScript compilation successful
- [ ] Dependencies installed
- [ ] Environment variables set
- [ ] Database migration tested
- [ ] Configuration files validated

---

## Deployment Steps

### Step 1: VPS Setup

**1.1 Install Required Dependencies**

```bash
# Connect to VPS
ssh root@209.38.58.83 -p 2222

# Check Node.js version (must be 22+)
node --version
# If not installed or old version:
# curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
# apt-get install -y nodejs

# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version

# Install TypeScript compiler
npm install -g typescript tsx

# Create application directory
mkdir -p /var/www/canvas-A-I-O
mkdir -p /var/www/canvas-A-I-O/logs
mkdir -p /var/www/canvas-A-I-O/config
mkdir -p /var/www/canvas-A-I-O/server

# Set permissions
chown -R www-data:www-data /var/www/canvas-A-I-O
```

**1.2 Configure Firewall**

```bash
# Check current firewall status
ufw status

# Allow WebSocket ports
ufw allow 3001/tcp comment 'WebSocket Server'
ufw allow 3002/tcp comment 'Health Check'

# Reload firewall
ufw reload

# Verify rules
ufw status numbered
```

**1.3 Verify PostgreSQL**

```bash
# Check PostgreSQL is running
systemctl status postgresql

# Test connection
psql -U postgres -d canvas -c "SELECT 1;"

# Check existing schema
psql -U postgres -d canvas -c "\dt"
```

---

### Step 2: Deploy Code

**2.1 Build Project Locally**

```bash
# On local machine
cd C:\Users\Kratos\canvas-A-I-O

# Install dependencies (if not already)
npm install

# Build TypeScript (if using separate build step)
npm run build

# Create deployment package
tar -czf canvas-ws-deploy.tar.gz \
  server/ \
  config/ \
  package.json \
  package-lock.json \
  drizzle/
```

**2.2 Upload to VPS**

```bash
# Upload via SCP
scp -P 2222 canvas-ws-deploy.tar.gz \
  root@209.38.58.83:/tmp/

# Or use rsync for incremental sync
rsync -avz -e "ssh -p 2222" \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '*.log' \
  C:/Users/Kratos/canvas-A-I-O/server/ \
  root@209.38.58.83:/var/www/canvas-A-I-O/

rsync -avz -e "ssh -p 2222" \
  C:/Users/Kratos/canvas-A-I-O/config/ \
  root@209.38.58.83:/var/www/canvas-A-I-O/config/
```

**2.3 Extract and Install Dependencies on VPS**

```bash
# On VPS
cd /var/www/canvas-A-I-O

# If using tar archive
# tar -xzf /tmp/canvas-ws-deploy.tar.gz

# Install dependencies
npm ci --production

# Verify installation
ls -la node_modules/@hocuspocus/
```

---

### Step 3: Database Migration

**3.1 Create Backup**

```bash
# On VPS, backup database before migration
pg_dump -U postgres canvas > backup-$(date +%Y%m%d-%H%M%S).sql

# Verify backup
ls -lh backup-*.sql
```

**3.2 Run Migration**

```bash
cd /var/www/canvas-A-I-O

# Run Drizzle migration
npx drizzle-kit push:pg

# Or use migration script
node scripts/setup-websocket-db.js

# Verify tables created
psql -U postgres -d canvas -c "\dt yjs_*"
```

**Expected Output:**
```
          List of relations
 Schema |     Name      | Type  |  Owner
--------+---------------+-------+----------
 public | yjs_document | table | postgres
 public | yjs_update_log | table | postgres
```

**3.3 Verify Schema**

```bash
psql -U postgres -d canvas -c "\d yjs_document"
```

Expected columns:
- `id` (text, primary key)
- `data` (bytea, not null)
- `updated_at` (timestamp, not null)

---

### Step 4: Configure Environment Variables

**4.1 Create .env File**

```bash
# On VPS
cd /var/www/canvas-A-I-O

# Copy from example
cp .env.example .env

# Edit with nano/vim
nano .env
```

**4.2 Required Environment Variables**

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/canvas"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-here"
BETTER_AUTH_URL="https://draw.nulled.ai"

# WebSocket Server
WS_PORT=3001
NODE_ENV=production
LOG_LEVEL=info

# OAuth (if enabled)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Admin (for owner bootstrap)
ADMIN_EMAIL="admin@nulled.ai"
```

**4.3 Secure .env File**

```bash
# Set permissions
chmod 600 .env
chown www-data:www-data .env

# Verify permissions
ls -la .env
# Should show: -rw------- 1 www-data www-data
```

---

### Step 5: Configure PM2

**5.1 Verify ecosystem.config.cjs**

```bash
cd /var/www/canvas-A-I-O

# Check config exists
cat config/ecosystem.config.cjs
```

**Expected Configuration:**

```javascript
module.exports = {
  apps: [
    {
      name: "canvas-ws",
      script: "./server/websocket-server.ts",
      interpreter: "node",
      interpreter_args: "--import tsx",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        WS_PORT: 3001,
        LOG_LEVEL: "info",
      },
      error_file: "./logs/ws-error.log",
      out_file: "./logs/ws-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      time: true,
    },
  ],
}
```

**5.2 Start WebSocket Server with PM2**

```bash
# Start server
pm2 start config/ecosystem.config.cjs --env production

# Check status
pm2 status

# View logs
pm2 logs canvas-ws

# Monitor
pm2 monit
```

**Expected Output:**
```
┌────┬─────────────┬──────────┬──────┬─────────┬──────────┐
│ id │ name        │ mode     │ ↺    │ status  │ cpu      │
├────┼─────────────┼──────────┼──────┼─────────┼──────────┤
│ 0  │ canvas-ws   │ fork     │ 0    │ online  │ 0%       │
└────┴─────────────┴──────────┴──────┴─────────┴──────────┘
```

**5.3 Save PM2 Configuration**

```bash
# Save current process list
pm2 save

# Generate startup script
pm2 startup

# Follow the output command to enable startup on boot
# Example: sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u www-data --hp /var/www/canvas-A-I-O
```

---

### Step 6: Configure Nginx

**6.1 Review WebSocket Configuration**

```bash
# On VPS, check existing Nginx config
cat /etc/nginx/sites-available/canvas

# Or create new config
nano /etc/nginx/sites-available/canvas-websocket
```

**6.2 Add WebSocket Location Block**

Add to existing server block for draw.nulled.ai:

```nginx
# Map for WebSocket upgrade detection
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

# Upstream WebSocket server
upstream websocket_backend {
    server 127.0.0.1:3001;
}

# In existing HTTPS server block
server {
    listen 443 ssl http2;
    server_name draw.nulled.ai;

    # ... existing SSL config ...

    # WebSocket endpoint
    location /ws {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts (important for long-lived connections)
        proxy_connect_timeout 7d;
        proxy_send_timeout 7d;
        proxy_read_timeout 7d;

        # Buffering
        proxy_buffering off;
        proxy_request_buffering off;
    }

    # Health check endpoint (optional)
    location /ws-health {
        proxy_pass http://127.0.0.1:3002/health;
        proxy_set_header Host $host;
        access_log off;
    }
}
```

**6.3 Test and Reload Nginx**

```bash
# Test configuration syntax
sudo nginx -t

# Expected output:
# nginx: configuration file /etc/nginx/nginx.conf test is successful

# If test passes, reload Nginx
sudo nginx -s reload

# Verify Nginx is running
systemctl status nginx
```

---

### Step 7: Verify Deployment

**7.1 Check PM2 Process**

```bash
# Check status
pm2 status

# View recent logs
pm2 logs canvas-ws --lines 50

# Check for errors
pm2 logs canvas-ws --err
```

**Expected Logs:**
```
[INFO] Hocuspocus server started
[INFO] WebSocket server listening {"port": 3001}
```

**7.2 Test Health Check**

```bash
# From VPS
curl http://localhost:3002/health

# Expected output:
{
  "status": "healthy",
  "timestamp": "2026-02-09T12:00:00.000Z",
  "uptime": 123.456,
  "database": {
    "connected": true,
    "latency": 5
  },
  "connections": {
    "active": 0
  }
}

# From external (via Nginx)
curl https://draw.nulled.ai/ws-health
```

**7.3 Test WebSocket Connection**

```bash
# Install wscat if not available
npm install -g wscat

# Connect to WebSocket (without auth - should fail)
wscat -c ws://localhost:3001

# Expected: Connection closed or authentication error

# Connect with valid session token (requires real token)
wscat -c "wss://draw.nulled.ai/ws" -H "Authorization: Bearer YOUR_TOKEN"
```

**7.4 Check Database**

```bash
# Verify yjs_document table exists
psql -U postgres -d canvas -c "SELECT COUNT(*) FROM yjs_document;"

# Should return 0 (no documents yet)
```

**7.5 Check Firewall**

```bash
# Verify ports are open
ufw status | grep 3001
ufw status | grep 3002

# Expected:
# 3001/tcp  ALLOW  Anywhere  # WebSocket Server
# 3002/tcp  ALLOW  Anywhere  # Health Check
```

---

## Monitoring and Maintenance

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# View logs in real-time
pm2 logs canvas-ws

# Check resource usage
pm2 show canvas-ws

# Reset logs (rotate)
pm2 flush
```

### Log Management

**View Logs:**
```bash
# PM2 logs
pm2 logs canvas-ws --lines 100

# Direct log files
tail -f /var/www/canvas-A-I-O/logs/ws-out.log
tail -f /var/www/canvas-A-I-O/logs/ws-error.log
```

**Log Rotation:**
```bash
# Configure PM2 log rotation
pm2 install pm2-logrotate

# Configure settings
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### Health Checks

**Manual Health Check:**
```bash
# Simple check
curl -f http://localhost:3002/health || echo "Health check failed"

# Detailed check
curl http://localhost:3002/health | jq '.'
```

**Automated Health Check (cron):**
```bash
# Create health check script
cat > /usr/local/bin/canvas-ws-healthcheck.sh << 'EOF'
#!/bin/bash
HEALTH_URL="http://localhost:3002/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -ne 200 ]; then
  echo "Health check failed with HTTP $RESPONSE"
  pm2 restart canvas-ws
  # Optional: Send alert
fi
EOF

chmod +x /usr/local/bin/canvas-ws-healthcheck.sh

# Add to crontab (check every 5 minutes)
crontab -e
# Add line: */5 * * * * /usr/local/bin/canvas-ws-healthcheck.sh
```

### Performance Monitoring

**Monitor Connections:**
```bash
# Count active WebSocket connections
ss -tan | grep :3001 | wc -l

# Monitor in real-time
watch -n 5 'ss -tan | grep :3001 | wc -l'
```

**Monitor Resources:**
```bash
# CPU and memory
htop

# PM2 process details
pm2 show canvas-ws

# Memory usage over time
pm2 monit
```

**Database Performance:**
```bash
# Check active connections
psql -U postgres -d canvas -c "SELECT count(*) FROM pg_stat_activity;"

# Check slow queries
psql -U postgres -d canvas -c "SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

---

## Troubleshooting

### Common Issues

**Issue 1: Server Won't Start**

```bash
# Check error logs
pm2 logs canvas-ws --err

# Common causes:
# - Port already in use
# - DATABASE_URL incorrect
# - Missing dependencies

# Check if port is in use
lsof -i :3001

# Kill process using port
kill -9 $(lsof -t -i:3001)

# Restart PM2
pm2 restart canvas-ws
```

**Issue 2: Database Connection Failed**

```bash
# Check PostgreSQL is running
systemctl status postgresql

# Test connection
psql -U postgres -d canvas -c "SELECT 1;"

# Check DATABASE_URL
cat /var/www/canvas-A-I-O/.env | grep DATABASE_URL

# Check PostgreSQL logs
tail -f /var/log/postgresql/postgresql-*.log
```

**Issue 3: WebSocket Connections Fail**

```bash
# Check server is listening
netstat -tulpn | grep 3001

# Check firewall
ufw status | grep 3001

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Test Nginx config
sudo nginx -t
```

**Issue 4: High Memory Usage**

```bash
# Check memory usage
pm2 monit

# Restart if needed
pm2 restart canvas-ws

# Adjust max_memory_restart in ecosystem.config.cjs
# Then reload:
pm2 reload canvas-ws
```

**Issue 5: Permission Denied Errors**

```bash
# Check file permissions
ls -la /var/www/canvas-A-I-O/

# Fix ownership
chown -R www-data:www-data /var/www/canvas-A-I-O/

# Fix .env permissions
chmod 600 /var/www/canvas-A-I-O/.env
```

### Debug Mode

```bash
# Stop server
pm2 stop canvas-ws

# Start with debug logging
NODE_ENV=development LOG_LEVEL=debug pm2 start config/ecosystem.config.cjs

# View debug logs
pm2 logs canvas-ws
```

---

## Updating the Deployment

### Update Code

```bash
# On local machine
cd C:\Users\Kratos\canvas-A-I-O

# Make changes and test
npm test

# Deploy to VPS
rsync -avz -e "ssh -p 2222" \
  --exclude 'node_modules' \
  server/ \
  root@209.38.58.83:/var/www/canvas-A-I-O/
```

### Zero-Downtime Reload

```bash
# On VPS
cd /var/www/canvas-A-I-O

# Reload gracefully (keeps existing connections)
pm2 reload canvas-ws

# Or restart (drops connections)
pm2 restart canvas-ws

# Verify
pm2 status
pm2 logs canvas-ws --lines 20
```

### Database Migration

```bash
# Create backup first
pg_dump -U postgres canvas > backup-$(date +%Y%m%d-%H%M%S).sql

# Run migration
npx drizzle-kit push:pg

# Verify
psql -U postgres -d canvas -c "\dt"
```

---

## Rollback Procedure

### Rollback Code

```bash
# Stop server
pm2 stop canvas-ws

# Restore previous version
cd /var/www/canvas-A-I-O
git checkout <previous-commit>
# or restore from backup
tar -xzf backup-canvas-ws-previous.tar.gz

# Restart server
pm2 start canvas-ws

# Verify
pm2 status
pm2 logs canvas-ws --lines 20
```

### Rollback Database

```bash
# Stop server first
pm2 stop canvas-ws

# Restore database
psql -U postgres canvas < backup-20260209-120000.sql

# Verify
psql -U postgres -d canvas -c "\dt"

# Restart server
pm2 start canvas-ws
```

### Full Rollback

```bash
# 1. Stop all services
pm2 stop all
sudo systemctl stop nginx

# 2. Restore code backup
cd /var/www/canvas-A-I-O
rm -rf server/
tar -xzf /backup/canvas-ws-20260209.tar.gz

# 3. Restore database
psql -U postgres canvas < /backup/backup-20260209.sql

# 4. Start services
pm2 start all
sudo systemctl start nginx

# 5. Verify
pm2 status
systemctl status nginx
curl http://localhost:3002/health
```

---

## Security Hardening

### SSL/TLS Configuration

```nginx
# In Nginx config, ensure strong SSL
server {
    listen 443 ssl http2;
    server_name draw.nulled.ai;

    # Strong ciphers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256...';
    ssl_prefer_server_ciphers off;

    # OCSP stapling
    ssl_stapling on;
    ssl_stapling_verify on;

    # SSL session cache
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
}
```

### Rate Limiting

```nginx
# In Nginx config, add rate limiting
limit_req_zone $binary_remote_addr zone=ws_limit:10m rate=10r/s;

location /ws {
    limit_req zone=ws_limit burst=20 nodelay;
    # ... other config
}
```

### Firewall Rules

```bash
# Restrict WebSocket access to specific IPs if needed
ufw allow from 1.2.3.4 to any port 3001 proto tcp

# Or limit by geographic region (requires geoip)
```

---

## Performance Tuning

### PM2 Configuration

```javascript
// ecosystem.config.cjs - optimized for production
{
  instances: 'max', // Use all CPU cores
  exec_mode: 'cluster',
  max_memory_restart: '1G',
  node_args: '--max-old-space-size=512',
}
```

### PostgreSQL Tuning

```bash
# Edit PostgreSQL config
nano /etc/postgresql/14/main/postgresql.conf

# Tune for WebSocket workload
shared_buffers = 256MB
effective_cache_size = 1GB
max_connections = 200

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Nginx Tuning

```nginx
# In nginx.conf
worker_processes auto;
worker_connections 1024;

# In server block
proxy_buffer_size 4k;
proxy_buffers 8 4k;
proxy_busy_buffers_size 8k;
```

---

## Backup and Recovery

### Automated Backups

```bash
# Create backup script
cat > /usr/local/bin/canvas-ws-backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backup/canvas-ws"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U postgres canvas > $BACKUP_DIR/db-$DATE.sql

# Backup code
tar -czf $BACKUP_DIR/code-$DATE.tar.gz /var/www/canvas-A-I-O/

# Keep last 7 days
find $BACKUP_DIR -mtime +7 -delete
EOF

chmod +x /usr/local/bin/canvas-ws-backup.sh

# Add to cron (daily at 2 AM)
crontab -e
# Add line: 0 2 * * * /usr/local/bin/canvas-ws-backup.sh
```

### Restore from Backup

```bash
# Stop services
pm2 stop canvas-ws

# Restore database
psql -U postgres canvas < /backup/canvas-ws/db-20260209-020000.sql

# Restore code
cd /
tar -xzf /backup/canvas-ws/code-20260209-020000.tar.gz

# Start services
pm2 start canvas-ws
```

---

## Documentation

### Runbook

Create a runbook for common operations:

```bash
cat > /var/www/canvas-A-I-O/RUNBOOK.md << 'EOF'
# Canvas WebSocket Server Runbook

## Start Server
pm2 start config/ecosystem.config.cjs

## Stop Server
pm2 stop canvas-ws

## Restart Server
pm2 restart canvas-ws

## View Logs
pm2 logs canvas-ws

## Check Status
pm2 status

## Health Check
curl http://localhost:3002/health

## Database Backup
pg_dump -U postgres canvas > backup.sql

## Update Code
rsync -avz server/ root@209.38.58.83:/var/www/canvas-A-I-O/
pm2 reload canvas-ws
EOF
```

### Monitoring Dashboard

Consider setting up:
- Grafana + Prometheus for metrics
- Sentry for error tracking
- Uptime monitoring (Pingdom, UptimeRobot)

---

## Success Criteria

After deployment, verify:

- [ ] PM2 process running (online status)
- [ ] Health check returns 200
- [ ] Database connection successful
- [ ] WebSocket accepts authenticated connections
- [ ] WebSocket rejects unauthenticated connections
- [ ] Nginx proxy passes WebSocket traffic
- [ ] Logs are being written
- [ ] No errors in logs
- [ ] Memory usage stable
- [ ] CPU usage normal

---

## Contact Information

**VPS Provider:** [Provider Name]
**Domain Registrar:** [Registrar]
**SSL Provider:** [Provider]

**Emergency Contacts:**
- Sysadmin: admin@nulled.ai
- On-call: [Phone Number]

---

*Last updated: 2026-02-09*
