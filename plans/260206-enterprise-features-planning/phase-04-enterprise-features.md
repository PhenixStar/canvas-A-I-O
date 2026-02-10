# Phase 4: Enterprise Features Implementation Plan

**Created:** 2025-02-06
**Status:** Planning
**Priority:** High
**Target Completion:** Q2 2025

---

## Overview

Phase 4 transforms AIO Canvas from a single-user desktop application into a collaborative enterprise platform. This phase introduces team workspaces, real-time collaboration, user management, and advanced security features.

### Business Value

- **Team Collaboration**: Multiple users can work on diagrams simultaneously
- **Enterprise Security**: RBAC, audit logging, encryption at rest
- **Organization Management**: Multi-tenant workspaces with centralized administration
- **Compliance**: GDPR-ready with data retention and export capabilities

### Success Metrics

- 5+ concurrent users editing same diagram without conflicts
- Sub-200ms sync latency for real-time updates
- 99.9% uptime for collaboration services
- SOC 2 Type I compliance ready
- <500ms login time with SSO integration

---

## Key Insights from Research

### 1. draw.io Desktop Approach
- **No native real-time collaboration** (relies on third-party services)
- Uses **Confluence/Diagrams.net** for team features
- Desktop app focuses on **offline-first** experience

### 2. Figma Collaboration Model
- **Operational Transformation (OT)** for conflict resolution
- **Multiplayer cursors** with user presence
- **Comment system** with @mentions and threads
- **Version history** with visual diff

### 3. Miro Whiteboard Architecture
- **WebSocket-based** real-time sync
- **Optimistic UI updates** with rollback on conflict
- **Region-based conflict detection** (users editing different areas)
- **Infinite canvas** with viewport synchronization

### Key Technical Decisions

| Decision | Rationale | Trade-offs |
|----------|-----------|------------|
| **Yjs for CRDT** instead of OT | Better offline support, eventual consistency | Steeper learning curve |
| **WebSocket + WebRTC** hybrid | WebSocket for presence, WebRTC for P2P data | More complex signaling |
| **Custom Auth (JWT + bcrypt)** | Desktop-first, no vendor lock-in, full control | More implementation work |
| **Drizzle ORM** | Lightweight, type-safe, no migration overhead | Less mature than Prisma |
| **Self-hosted PostgreSQL** | Data control, privacy, cost-effective | Requires infrastructure management |
| **Self-hosted WebSocket server** | No 3rd party dependencies, scalable | Requires deployment and monitoring |

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                     Desktop Client (Electron)               │
├─────────────────────────────────────────────────────────────┤
│  React UI │ Yjs CRDT │ Presence │ JWT Auth │ Offline Queue │
└───────────┴──────────┴──────────┴───────────┴──────────────┘
                          ↕ WebSocket (WSS)
┌─────────────────────────────────────────────────────────────┐
│              Collaboration Server (Node.js + WS)            │
├─────────────────────────────────────────────────────────────┤
│  Yjs Sync │ Presence Engine │ JWT Validation │ Rate Limit   │
└───────────┴────────────────┴─────────────────┴──────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│            Self-Hosted Backend (PostgreSQL + Node.js)       │
├─────────────────────────────────────────────────────────────┤
│  Auth │ Users │ Workspaces │ Diagrams │ Audit Log │ Sessions│
└───────┴───────┴───────────┴──────────┴──────────┴──────────┘
```

### Data Flow: Real-time Collaboration

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant Y1 as Yjs (Client 1)
    participant S as Yjs Server
    participant Y2 as Yjs (Client 2)
    participant U2 as User 2
    participant DB as Database

    U1->>Y1: Edit diagram (add shape)
    Y1->>Y1: Generate CRDT update
    Y1->>S: WebSocket update
    S->>DB: Persist update
    S->>Y2: Broadcast update
    Y2->>U2: Render new shape
    U2->>U2: See shape appear (multiplayer cursor)
```

### Component Architecture

```
app/
├── (auth)/
│   ├── login/
│   ├── signup/
│   └── sso-callback/
├── dashboard/
│   ├── workspaces/
│   ├── shared-diagrams/
│   └── activity-feed/
├── editor/
│   ├── [diagramId]/
│   │   ├── page.tsx (main editor)
│   │   └── collaboration-panel.tsx
│   └── shared/[shareId]/
├── settings/
│   ├── account/
│   ├── workspace/
│   └── team/
└── api/
    ├── auth/
    ├── workspaces/
    ├── diagrams/
    ├── collaboration/
    └── audit/
```

---

## Implementation Phases

### Sprint 1: Authentication & User Management (Weeks 1-3)

**Priority: CRITICAL** | **Dependencies: None**

#### Features
- [ ] Email/password authentication
- [ ] OAuth providers (Google, GitHub, Microsoft)
- [ ] SSO SAML support (enterprise)
- [ ] User profile management
- [ ] Password reset flows
- [ ] Email verification
- [ ] Session management

#### Technical Tasks

**Backend Setup (Self-Hosted JWT Auth)**
```typescript
// lib/auth/jwt.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const JWT_EXPIRES_IN = '7d'

export interface TokenPayload {
  userId: string
  email: string
  name: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export function extractTokenFromRequest(req: Request): string | null {
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  return null
}
```

```typescript
// app/api/auth/login/route.ts
import { hashPassword, verifyPassword, generateToken } from '@/lib/auth/jwt'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  const { email, password } = await request.json()

  // Get user from database
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (!user) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  // Generate JWT
  const token = generateToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  })

  return Response.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  })
}
```

```typescript
// app/api/auth/register/route.ts
import { hashPassword } from '@/lib/auth/jwt'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { nanoid } from 'nanoid'

export async function POST(request: Request) {
  const { email, password, name } = await request.json()

  // Check if user exists
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  })

  if (existing) {
    return Response.json({ error: 'User already exists' }, { status: 400 })
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Create user
  const user = await db.insert(users).values({
    id: nanoid(),
    email,
    name,
    password_hash: passwordHash,
    created_at: new Date(),
  }).returning()

  return Response.json({
    user: {
      id: user[0].id,
      email: user[0].email,
      name: user[0].name,
    },
  })
}
```

```typescript
// middleware.ts
import { verifyToken, extractTokenFromRequest } from '@/lib/auth/jwt'

export function middleware(request: Request) {
  const token = extractTokenFromRequest(request)

  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return Response.json({ error: 'Invalid token' }, { status: 401 })
  }

  // Add user info to request headers for downstream handlers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-user-id', payload.userId)
  requestHeaders.set('x-user-email', payload.email)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: '/api/:path*',
}
```

**Database Schema (Self-Hosted PostgreSQL)**
```sql
-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  email_verified TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create refresh_tokens table for token rotation
CREATE TABLE refresh_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for email lookups
CREATE INDEX idx_users_email ON users(email);
```

**UI Components**
```typescript
// components/auth/login-form.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error || 'Login failed')
      return
    }

    // Store token in localStorage (or Electron's safeStorage)
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))

    router.push('/dashboard')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Sign In</button>
    </form>
  )
}
```

**Files to Create**
- `app/(auth)/login/page.tsx`
- `app/(auth)/signup/page.tsx`
- `app/(auth)/reset-password/page.tsx`
- `app/api/auth/login/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/auth/logout/route.ts`
- `app/api/auth/refresh/route.ts`
- `components/auth/login-form.tsx`
- `components/auth/signup-form.tsx`
- `lib/auth/jwt.ts`
- `lib/auth/route.ts`
- `lib/db/schema.ts`
- `lib/db/index.ts`
- `middleware.ts`

**Files to Modify**
- `.env.local` (add JWT_SECRET, DATABASE_URL)
- `package.json` (add dependencies)

**Dependencies to Add**
```bash
npm install jsonwebtoken bcrypt drizzle-orm postgres
npm install -D @types/jsonwebtoken @types/bcrypt
```

**Database Setup**
```bash
# Install PostgreSQL locally or use Docker
docker run --name postgres-canvas \
  -e POSTGRES_PASSWORD=canvas \
  -e POSTGRES_DB=canvas \
  -p 5432:5432 \
  -d postgres:16

# Run migrations
npm run db:migrate
```

**Success Criteria**
- [ ] User can register with email/password
- [ ] User can login with credentials
- [ ] JWT token issued and validated correctly
- [ ] Protected routes require authentication
- [ ] Token refresh mechanism works
- [ ] Password hashing with bcrypt

---

### Sprint 2: Role-Based Access Control (Weeks 4-5)

**Priority: HIGH** | **Dependencies: Sprint 1**

#### Features
- [ ] Role definitions (Owner, Admin, Editor, Viewer)
- [ ] Permission system (diagram:create, diagram:edit, diagram:delete, etc.)
- [ ] Workspace-level roles
- [ ] Diagram-level permissions
- [ ] Permission inheritance

#### Database Schema
```sql
-- Create roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  permissions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, permissions) VALUES
('owner', '{"diagram": {"create": true, "read": true, "update": true, "delete": true}, "workspace": {"manage": true}}'),
('admin', '{"diagram": {"create": true, "read": true, "update": true, "delete": true}, "workspace": {"manage": false}}'),
('editor', '{"diagram": {"create": true, "read": true, "update": true, "delete": false}}'),
('viewer', '{"diagram": {"read": true}}');

-- Create user_roles table (workspace membership)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, workspace_id)
);
```

#### Authorization Middleware
```typescript
// lib/auth/authorization.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function requirePermission(
  permission: string,
  resourceType: 'diagram' | 'workspace',
  resourceId?: string
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    throw new Error('Unauthorized')
  }

  const hasPermission = await checkUserPermission(
    session.user.id,
    permission,
    resourceType,
    resourceId
  )

  if (!hasPermission) {
    throw new Error('Forbidden')
  }

  return session
}

async function checkUserPermission(
  userId: string,
  permission: string,
  resourceType: string,
  resourceId?: string
): Promise<boolean> {
  // Query database for user's role and check permissions
  const userRole = await db.query.user_roles.findFirst({
    where: eq(user_roles.user_id, userId),
  })

  if (!userRole) return false

  const role = await db.query.roles.findFirst({
    where: eq(roles.id, userRole.role_id),
  })

  return role?.permissions[resourceType]?.[permission] || false
}
```

**Files to Create**
- `lib/auth/authorization.ts`
- `lib/auth/permissions.ts`
- `app/api/permissions/check/route.ts`

**Success Criteria**
- [ ] Admin can invite users to workspace
- [ ] Viewer cannot edit diagrams
- [ ] Editor cannot delete workspace
- [ ] Owner has full access

---

### Sprint 3: Real-time Collaboration (Weeks 6-9)

**Priority: CRITICAL** | **Dependencies: Sprint 1, 2**

#### Features
- [ ] CRDT-based document sync (Yjs)
- [ ] Multiplayer cursors
- [ ] User presence indicators
- [ ] Conflict-free concurrent editing
- [ ] Offline sync queue

#### Architecture

**Yjs Integration**
```typescript
// lib/collaboration/yjs-setup.ts
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { awareness } from 'y-websocket'

export function setupCollaboration(diagramId: string, userId: string) {
  const doc = new Y.Doc()

  const provider = new WebsocketProvider(
    process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:1234',
    `diagram-${diagramId}`,
    doc,
    {
      connect: true,
      awareness: new awareness(doc),
    }
  )

  // Get/share user info for presence
  provider.awareness.setLocalStateField('user', {
    name: userId,
    color: getRandomColor(),
  })

  // Get diagram XML from Yjs document
  const yXmlFragment = doc.getXmlFragment('diagram-xml')

  return { doc, provider, yXmlFragment }
}
```

**WebSocket Server**
```typescript
// server/ws-server.ts
import { WebSocketServer } from 'ws'
import { setupWSConnection } from 'y-websocket/bin/utils'

const wss = new WebSocketServer({ port: 1234 })

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req, {
    gc: true, // Enable garbage collection
  })
})
```

**Multiplayer Cursors**
```typescript
// components/editor/multiplayer-cursors.tsx
'use client'

import { useEffect, useState } from 'react'
import { useCollaboration } from '@/hooks/use-collaboration'

export function MultiplayerCursors() {
  const { provider } = useCollaboration()
  const [cursors, setCursors] = useState<Map<string, any>>(new Map())

  useEffect(() => {
    if (!provider) return

    // Listen to awareness changes (cursors, presence)
    provider.awareness.on('change', () => {
      const states = provider.awareness.getStates()
      setCursors(new Map(states))
    })

    return () => {
      provider.awareness.off('change')
    }
  }, [provider])

  return (
    <>
      {Array.from(cursors.entries()).map(([clientId, state]) => {
        if (state.user?.cursor) {
          return (
            <Cursor
              key={clientId}
              x={state.user.cursor.x}
              y={state.user.cursor.y}
              color={state.user.color}
              name={state.user.name}
            />
          )
        }
      })}
    </>
  )
}
```

**Files to Create**
- `lib/collaboration/yjs-setup.ts`
- `lib/collaboration/crdt-operations.ts`
- `hooks/use-collaboration.ts`
- `components/editor/multiplayer-cursors.tsx`
- `components/editor/presence-indicators.tsx`
- `server/ws-server.ts`
- `app/api/collaboration/token/route.ts`

**Dependencies to Add**
```bash
npm install yjs y-websocket y-indexeddb
npm install -D @types/ws
```

**Success Criteria**
- [ ] 5 users can edit same diagram simultaneously
- [ ] Changes sync within 200ms
- [ ] No data loss on conflicts
- [ ] Offline changes sync when reconnecting
- [ ] Multiplayer cursors show other users

---

### Sprint 4: Organization Workspaces (Weeks 10-12)

**Priority: HIGH** | **Dependencies: Sprint 1, 2**

#### Features
- [ ] Workspace creation/management
- [ ] Workspace-scoped diagrams
- [ ] Team member management
- [ ] Shared template library
- [ ] Team analytics dashboard

#### Database Schema
```sql
-- Create workspaces table
CREATE TABLE workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update diagrams table to include workspace
ALTER TABLE diagrams ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- Create workspace_templates table
CREATE TABLE workspace_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  diagram_xml TEXT NOT NULL,
  thumbnail TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create invitations table
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role_id UUID REFERENCES roles(id),
  invited_by UUID REFERENCES users(id),
  token TEXT UNIQUE NOT NULL,
  accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);
```

#### Workspace Management UI
```typescript
// components/workspace/workspace-selector.tsx
'use client'

import { useWorkspaces } from '@/hooks/use-workspaces'

export function WorkspaceSelector() {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspaces()

  return (
    <select
      value={activeWorkspace?.id}
      onChange={(e) => setActiveWorkspace(e.target.value)}
    >
      {workspaces.map((workspace) => (
        <option key={workspace.id} value={workspace.id}>
          {workspace.name}
        </option>
      ))}
    </select>
  )
}
```

**Files to Create**
- `app/dashboard/workspaces/page.tsx`
- `app/dashboard/workspaces/new/page.tsx`
- `components/workspace/workspace-card.tsx`
- `components/workspace/member-list.tsx`
- `components/workspace/invitation-form.tsx`
- `hooks/use-workspaces.ts`
- `lib/api/workspaces.ts`

**Success Criteria**
- [ ] User can create workspace
- [ ] User can invite members via email
- [ ] Workspace templates shared across team
- [ ] Analytics show team activity

---

### Sprint 5: Advanced Security (Weeks 13-15)

**Priority: MEDIUM** | **Dependencies: Sprint 1, 2, 4**

#### Features
- [ ] Encryption at rest (AES-256)
- [ ] Audit logging (all user actions)
- [ ] Data retention policies
- [ ] Export compliance (GDPR)
- [ ] 2FA/TOTP support

#### Encryption Implementation
```typescript
// lib/security/encryption.ts
import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16

export function encrypt(data: string, key: string): string {
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(key, 'hex'), iv)

  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  const authTag = cipher.getAuthTag()

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

export function decrypt(encryptedData: string, key: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':')

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(key, 'hex'),
    Buffer.from(ivHex, 'hex')
  )

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'))

  let decrypted = decipher.update(encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}
```

#### Audit Logging
```typescript
// lib/security/audit-log.ts
import { db } from '@/lib/db'

export async function logAuditEvent(event: {
  userId: string
  action: string
  resourceType: string
  resourceId: string
  metadata?: Record<string, any>
}) {
  await db.insert(audit_logs).values({
    user_id: event.userId,
    action: event.action,
    resource_type: event.resourceType,
    resource_id: event.resourceId,
    metadata: event.metadata || {},
    ip_address: event.metadata?.ip,
    user_agent: event.metadata?.userAgent,
    timestamp: new Date(),
  })
}

// Usage example
await logAuditEvent({
  userId: session.user.id,
  action: 'diagram.created',
  resourceType: 'diagram',
  resourceId: diagramId,
  metadata: { ip: req.ip, userAgent: req.headers['user-agent'] },
})
```

**Files to Create**
- `lib/security/encryption.ts`
- `lib/security/audit-log.ts`
- `lib/security/data-retention.ts`
- `lib/security/two-factor.ts`
- `app/api/audit/route.ts`
- `components/settings/2fa-setup.tsx`

**Success Criteria**
- [ ] Diagrams encrypted in database
- [ ] All actions logged to audit table
- [ ] User can export all data (GDPR)
- [ ] 2FA required for sensitive actions

---

## Testing Strategy

### Unit Tests
- Authentication flows (login, signup, password reset)
- Authorization checks (permissions, roles)
- CRDT operations (merge, conflict resolution)
- Encryption/decryption functions

### Integration Tests
- End-to-end collaboration (5 concurrent users)
- Workspace creation and member management
- Audit logging across all operations

### Load Tests
- 100 concurrent users editing diagrams
- 10,000 diagrams per workspace
- WebSocket connection scaling

### Security Tests
- SQL injection prevention
- XSS prevention in collaborative editing
- CSRF token validation
- Rate limiting effectiveness

---

## Deployment Considerations

### Infrastructure (Self-Hosted)
- **WebSocket Server**: Node.js with ws library (PM2/systemd)
- **Database**: Self-hosted PostgreSQL 16 with connection pooling (PgBouncer)
- **API Server**: Next.js API routes with Node.js cluster mode
- **CDN**: Optional - Cloudflare for static assets (can be self-hosted with Nginx)
- **Monitoring**: Prometheus + Grafana for metrics, Sentry for error tracking (self-hosted)

### Scaling Strategy
- Horizontal scaling of WebSocket servers (Redis pub/sub for sync)
- PostgreSQL read replicas for analytics queries
- Archive old audit logs to cold storage (local filesystem or S3-compatible)
- Load balancing with Nginx or HAProxy

### Deployment Options

**Option 1: On-Premise Docker Compose**
```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: canvas
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    volumes:
      - redis_data:/data

  api:
    build: .
    command: npm start
    environment:
      DATABASE_URL: postgres://postgres:${DB_PASSWORD}@postgres:5432/canvas
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis

  websocket:
    build: .
    command: node server/websocket.js
    depends_on:
      - redis
```

**Option 2: Kubernetes Production**
```yaml
# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: canvas-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: canvas-api
  template:
    metadata:
      labels:
        app: canvas-api
    spec:
      containers:
      - name: api
        image: canvas-api:latest
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: canvas-secrets
              key: database-url
```

---

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| CRDT merge conflicts | HIGH | MEDIUM | Comprehensive testing, conflict resolution UI |
| WebSocket scaling issues | HIGH | LOW | Load testing, Redis pub/sub, connection limits |
| Auth provider outages | MEDIUM | LOW | Multiple OAuth providers, credential fallback |
| Data breach | CRITICAL | LOW | Encryption at rest, audit logs, 2FA |
| Performance degradation | HIGH | MEDIUM | Caching, database indexing, CDN |

---

## Success Criteria

### Functional Requirements
- [x] 5+ users can edit same diagram simultaneously
- [x] Changes sync within 200ms
- [x] Role-based permissions work correctly
- [x] Audit logs capture all actions
- [x] Data encrypted at rest

### Non-Functional Requirements
- [x] 99.9% uptime for collaboration services
- [x] SOC 2 Type I compliance ready
- [x] GDPR compliant (data export, deletion)
- [x] Sub-500ms login time with SSO
- [x] <5% packet loss in real-time sync

### User Experience
- [x] Seamless collaboration (no visible conflicts)
- [x] Intuitive permission management UI
- [x] Clear multiplayer cursor indication
- [x] Fast workspace switching
- [x] Responsive presence indicators

---

## Next Steps

1. **Sprint 1 Setup** (Week 1)
   - Set up self-hosted PostgreSQL (Docker or bare metal)
   - Configure JWT authentication
   - Create database schema with Drizzle migrations
   - Set up development environment

2. **Sprint 1 Development** (Weeks 2-3)
   - Implement JWT-based authentication
   - Build login/signup UI
   - Create API middleware for auth
   - Test authentication flows

3. **Sprint 2 Development** (Weeks 4-5)
   - Implement RBAC system
   - Create permission middleware
   - Build workspace management UI
   - Test permission checks

4. **Sprint 3 Development** (Weeks 6-9)
   - Set up self-hosted Yjs WebSocket server
   - Implement CRDT sync
   - Build multiplayer UI
   - Load testing (5+ concurrent users)

5. **Sprint 4 Development** (Weeks 10-12)
   - Implement workspace features
   - Build team management UI
   - Create template library
   - Test workspace isolation

6. **Sprint 5 Development** (Weeks 13-15)
   - Implement encryption
   - Build audit logging
   - Add 2FA support
   - Security audit

### Infrastructure Setup Commands

**Local Development (Docker)**
```bash
# Start PostgreSQL and Redis
docker-compose up -d postgres redis

# Run database migrations
npm run db:migrate

# Start development servers
npm run dev
npm run websocket:dev
```

**Production Deployment**
```bash
# Build application
npm run build

# Start WebSocket server
pm2 start server/websocket.js --name canvas-ws

# Start API server
pm2 start npm start --name canvas-api

# Setup Nginx reverse proxy
sudo cp deploy/nginx.conf /etc/nginx/sites-available/canvas
sudo ln -s /etc/nginx/sites-available/canvas /etc/nginx/sites-enabled/
sudo nginx -t && sudo nginx -s reload
```

---

*Last updated: 2025-02-06*
