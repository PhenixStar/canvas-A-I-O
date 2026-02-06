# Deployment Guide

This guide covers the production deployment of AIO Canvas, including the live instance at https://draw.nulled.ai, Docker setup, and desktop application deployment.

---

## Table of Contents

- [Production Instance](#production-instance)
- [Stack Overview](#stack-overview)
- [Prerequisites](#prerequisites)
- [Production Deployment](#production-deployment)
- [Docker + Caddy Setup](#docker--caddy-setup)
- [Environment Variables](#environment-variables)
- [DNS Configuration](#dns-configuration)
- [SSL Certificates](#ssl-certificates)
- [GitHub Actions Workflow](#github-actions-workflow)
- [Monitoring & Troubleshooting](#monitoring--troubleshooting)
- [Desktop Application Deployment](#desktop-application-deployment)

---

## Production Instance

### Live Deployment
**URL**: [https://draw.nulled.ai](https://draw.nulled.ai)
**Status**: ✅ Production Ready
**IP Address**: 209.38.58.83
**DNS**: draw.nulled.ai → 209.38.58.83

### Features
- Complete AI diagram generation capabilities
- Multi-provider AI support (OpenAI, Anthropic, Google AI, AWS Bedrock)
- Real-time collaborative editing
- PDF and image upload functionality
- Diagram history and version control
- SSL encryption with auto-renewing certificates

---

## Stack Overview

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Web Framework** | Next.js 16 | React framework with API routes |
| **Reverse Proxy** | Caddy | Web server with automatic HTTPS |
| **Database** | SQLite | Local session storage (web) |
| **AI Providers** | Vercel AI SDK | Multi-provider AI integration |
| **Desktop App** | Electron | Cross-platform offline support |
| **Container Runtime** | Docker | Production deployment |

---

## Prerequisites

### System Requirements
- **CPU**: 2+ cores recommended
- **RAM**: 4GB+ recommended
- **Storage**: 10GB+ free space
- **Network**: Stable internet connection
- **OS**: Linux, macOS, or Windows (WSL2)

### Software Dependencies
- Node.js 18+ (for development)
- Docker & Docker Compose (for production)
- Git (for deployment)
- Caddy v2.7+ (optional, for local testing)

---

## Production Deployment

### Option 1: Production Server (Recommended)

1. **Clone the repository**:
```bash
git clone https://github.com/PhenixStar/canvas-A-I-O.git
cd canvas-A-I-O
```

2. **Set up environment**:
```bash
cp .env.example .env.production
# Edit .env.production with production settings
```

3. **Build the application**:
```bash
npm install
npm run build
```

4. **Start production server**:
```bash
npm run start
```

5. **Set up reverse proxy** (Caddy configuration):
```bash
# /etc/caddy/Caddyfile
draw.nulled.ai {
    reverse_proxy localhost:6001
    tls {
        dns cloudflare {CLOUDFLARE_API_TOKEN}
    }
}
```

### Option 2: Docker Compose (Production)

1. **Create docker-compose.prod.yml**:
```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.prod
    ports:
      - "6001:6001"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:/app/data/database.sqlite
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    restart: unless-stopped

  caddy:
    image: caddy:2.7-alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - app
    restart: unless-stopped

volumes:
  caddy_data:
  caddy_config:
```

2. **Create Dockerfile.prod**:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 6001

CMD ["npm", "start"]
```

3. **Deploy with Docker Compose**:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## Docker + Caddy Setup

### Caddy Configuration

Create a `Caddyfile` in the project root:
```caddyfile
draw.nulled.ai {
    reverse_proxy localhost:6001

    # Security headers
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        Content-Security-Policy "default-src 'self'; img-src 'self' data: https:; font-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
    }

    # Rate limiting
    rate_limit {
        zone static {
            key {remote_host}
            events 100
            window 1m
        }
    }

    # TLS
    tls {
        dns cloudflare {CLOUDFLARE_API_TOKEN}
    }
}
```

### Environment Variables

Create `.env.production`:
```env
# Application Settings
NODE_ENV=production
PORT=6001

# AI Provider Configuration
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_AI_API_KEY=your_google_key
AWS_BEDROCK_ACCESS_KEY=your_aws_key
AWS_BEDROCK_SECRET_KEY=your_aws_secret
AWS_BEDROCK_REGION=us-east-1

# Optional: Server-side model configuration
AI_MODELS_CONFIG='{"openai": {"gpt-4": {"maxTokens": 4000, "temperature": 0.7}}}'

# File Upload Settings
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000
```

### Cloudflare DNS Configuration

1. **Login to Cloudflare Dashboard**
2. **Select Domain**: draw.nulled.ai
3. **Create DNS Record**:
   - Type: A
   - Name: @ (or draw)
   - Content: 209.38.58.83
   - Proxy status: Proxied (orange cloud)

4. **Configure API Token** for Caddy:
   - Go to Cloudflare → Tokens → Create Token
   - Create Zone DNS Token with edit permissions
   - Save the token securely

### SSL Certificates

Caddy automatically handles SSL certificates using Let's Encrypt:

- **Automatic Renewal**: Caddy renews certificates automatically
- **DNS Challenge**: Uses Cloudflare API for DNS verification
- **Multi-domain Support**: Supports multiple domains and subdomains
- **Wildcard Certificates**: Supports wildcard certificate generation

Monitor certificate status:
```bash
# Check Caddy logs for certificate status
docker logs caddy

# Or view certificate details
openssl x509 -in /etc/caddy/certs/draw.nulled.ai.crt -text -noout
```

---

## GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Run lint
        run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.8.0
        with:
          ssh-private-key: ${{ secrets.SERVER_SSH_KEY }}

      - name: Deploy to server
        run: |
          ssh user@209.38.58.83 "
            cd /var/canvas-A-I-O &&
            git pull origin main &&
            npm ci --only=production &&
            npm run build &&
            pm2 restart canvas-A-I-O
          "
```

Update pm2 ecosystem config:
```json
{
  "apps": [{
    "name": "canvas-A-I-O",
    "script": "npm",
    "args": "start",
    "cwd": "/var/canvas-A-I-O",
    "instances": "max",
    "exec_mode": "cluster",
    "env": {
      "NODE_ENV": "production",
      "PORT": 6001
    }
  }]
}
```

---

## Monitoring & Troubleshooting

### Health Checks

1. **Application Health**:
```bash
curl -I https://draw.nulled.ai
```

2. **Service Status**:
```bash
# Check PM2 processes
pm2 list

# Check Docker containers
docker ps

# Check logs
docker logs canvas-A-I-O
pm2 logs canvas-A-I-O
```

3. **Resource Usage**:
```bash
# System resources
htop
df -h
free -h

# Container resources
docker stats
```

### Common Issues

#### 1. Application Won't Start
```bash
# Check logs
docker logs canvas-A-I-O
pm2 logs canvas-A-I-O

# Check environment variables
cat .env.production

# Test database connection
sqlite3 /path/to/database.sqlite "SELECT 1"
```

#### 2. SSL Certificate Issues
```bash
# Check certificate expiration
openssl x509 -in /etc/caddy/certs/draw.nulled.ai.crt -enddate -noout

# Force renew certificate
docker exec caddy caddy reload
```

#### 3. Performance Issues
```bash
# Check slow queries
sqlite3 /path/to/database.sqlite ".schema"

# Monitor CPU/Memory
top -p $(pgrep -f "npm start")

# Check memory usage in Docker
docker stats --no-stream
```

#### 4. API Connection Errors
```bash
# Test AI provider connectivity
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model":"gpt-4","messages":[{"role":"user","content":"test"}]}' \
     https://api.openai.com/v1/chat/completions
```

### Log Management

#### Log Rotation
Configure logrotate for application logs:
```bash
# /etc/logrotate.d/canvas-A-I-O
/var/log/canvas-A-I-O/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
}
```

#### Log Analysis
```bash
# View recent errors
grep -i error /var/log/canvas-A-I-O/*.log | tail -20

# Monitor AI response times
grep "AI Response" /var/log/canvas-A-I-O/*.log | grep -E "time=[0-9]+" | tail -10
```

### Backup Strategy

1. **Application Backup**:
```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf /backups/canvas-A-I-O_$DATE.tar.gz \
    /var/canvas-A-I-O \
    /etc/caddy/Caddyfile \
    /var/log/canvas-A-I-O
```

2. **Database Backup**:
```bash
# SQLite database backup
sqlite3 /var/canvas-A-I-O/database.sqlite ".backup /backups/database_$DATE.sqlite"
```

3. **Automated Backup**:
```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
```

---

## Desktop Application Deployment

### Build Process

1. **Install Dependencies**:
```bash
npm install
npm install electron-builder -D
```

2. **Configure electron-builder**:
```json
{
  "build": {
    "appId": "com.canvas-ai-o.app",
    "productName": "AIO Canvas",
    "directories": {
      "output": "dist"
    },
    "files": [
      "**/*",
      "!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}",
      "!**/node_modules/*/{test,__tests__,tests,pkg,test.js,spec.js,*.test.*}",
      "!**/node_modules/*.d.ts",
      "!**/node_modules/.bin",
      "!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}",
      "!.editorconfig",
      "!**/._*",
      "!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}",
      "!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}",
      "!**/{appveyor.yml,.travis.yml,circle.yml}",
      "!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}",
      "!node_modules/electron/dist",
      "!node_modules/electron-builder/dist",
      "!node_modules/app-builder-bin"
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        }
      ]
    },
    "win": {
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        }
      ]
    },
    "linux": {
      "target": [
        {
          "target": "AppImage",
          "arch": ["x64"]
        }
      ]
    }
  }
}
```

3. **Build the application**:
```bash
npm run dist
```

### Auto-Update Mechanism

1. **Setup update server**:
```javascript
// electron/main.ts
import { autoUpdater } from 'electron-updater';
import { app, BrowserWindow } from 'electron';

autoUpdater.setFeedURL({
  provider: 'generic',
  url: 'https://draw.nulled.ai/updates',
});

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall();
});
```

2. **Update endpoint** (create on server):
```javascript
// app/api/updates/route.ts
export async function GET() {
  const updates = {
    version: app.getVersion(),
    url: 'https://github.com/PhenixStar/canvas-A-I-O/releases',
    notes: 'Bug fixes and improvements',
  };
  return Response.json(updates);
}
```

### Offline Mode Setup

1. **Enable offline mode**:
```javascript
// electron/main.ts
import { app } from 'electron';

app.commandLine.appendSwitch('disable-web-security');
```

2. **Package offline resources**:
```json
{
  "build": {
    "files": [
      "**/*",
      "!node_modules/**/*"
    ],
    "extraResources": [
      {
        "from": "./node_modules/drawio/src/main",
        "to": "drawio"
      }
    ]
  }
}
```

### Distribution

1. **GitHub Releases**:
   - Create new release in GitHub
   - Upload built installers
   - Update release notes

2. **Update website**:
```bash
# Add release download links
mkdir -p public/releases
cp dist/*.{dmg,exe,AppImage} public/releases/
```

3. **Version Management**:
```json
{
  "version": "1.0.0",
  "build": {
    "appId": "com.canvas-ai-o.app",
    "productName": "AIO Canvas"
  }
}
```

---

## Maintenance

### Regular Tasks

1. **Monitor Logs**: Check application logs daily
2. **Update Dependencies**: Security patches and feature updates
3. **Backup Data**: Regular database and application backups
4. **Check SSL**: Verify certificate validity and renewal
5. **Performance Review**: Monitor response times and resource usage

### Update Procedures

1. **Code Updates**:
```bash
git pull origin main
npm ci --only=production
npm run build
pm2 restart canvas-A-I-O
```

2. **Docker Updates**:
```bash
docker pull phenixstar/canvas-A-I-O:latest
docker-compose -f docker-compose.prod.yml up -d
```

3. **System Updates**:
```bash
# Update Caddy
docker pull caddy:2.7-alpine
docker-compose -f docker-compose.prod.yml up -d caddy
```

---

This deployment guide provides comprehensive instructions for deploying and maintaining AIO Canvas in production. For additional support, refer to the [project documentation](../docs/) or open an issue in the [GitHub repository](https://github.com/PhenixStar/canvas-A-I-O).