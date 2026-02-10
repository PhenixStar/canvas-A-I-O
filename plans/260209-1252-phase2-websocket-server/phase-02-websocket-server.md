# Phase 2: WebSocket Server - Detailed Implementation

**Created:** 2026-02-09
**Status:** Planning
**Priority:** CRITICAL
**Target Completion:** Week 7 of Sprint 3 (10 days)

---

## Context Links

- **PRD Reference:** `C:\Users\Kratos\canvas-A-I-O\docs\prds\sprint3-realtime-collaboration.md` (Phase 2 section)
- **Auth Implementation:** `C:\Users\Kratos\canvas-A-I-O\lib\auth.ts`
- **Database Schema:** `C:\Users\Kratos\canvas-A-I-O\lib\db\schema.ts`
- **System Architecture:** `C:\Users\Kratos\canvas-A-I-O\docs\system-architecture.md`

---

## Overview

This phase implements a production-ready WebSocket server using Hocuspocus framework for real-time CRDT synchronization. The server integrates with Better Auth for session validation and PostgreSQL for document persistence.

### Priority

**CRITICAL** - Blocks Phase 3 (Multiplayer UX) and Phase 4 (Offline Sync)

### Current Status

📝 **Planning** - Ready for implementation

---

## Key Insights from Research

### 1. Hocuspocus Architecture

Hocuspocus provides a extension-based architecture:
- **Hooks**: authenticate, onLoad, onStore, onConnect, onDisconnect
- **Extensions**: Persistence, authentication, logging, rate limiting
- **Context**: User data passed through hook chain

### 2. Better Auth Session Integration

Better Auth sessions use secure HTTP-only cookies with a token:
- Session token stored in `session.token` column
- Can be extracted from WebSocket handshake headers
- Validation requires database query to check expiration

### 3. Yjs Document Storage Patterns

Yjs documents are binary CRDT structures:
- **State vector**: Compressed binary representation
- **Updates**: Incremental CRDT operations
- **Persistence**: Can store full state or incremental updates

### 4. WebSocket Connection Lifecycle

```
Client Request → Handshake → Auth Validation → Connection Established
                                                        ↓
                                   Yjs Sync ← → Permission Checks
                                                        ↓
                                  Document Load/Save → Broadcast
                                                        ↓
                                     Disconnect → Cleanup → Persist
```

---

## Requirements

### Functional Requirements

1. **Authentication**
   - Validate Better Auth session tokens on connection
   - Extract user context (ID, role, permissions)
   - Reject connections with invalid/expired sessions
   - Handle session refresh during long-lived connections

2. **Document Persistence**
   - Load Yjs document state from PostgreSQL on first connection
   - Save document state on every change (debounced)
   - Handle concurrent writes correctly
   - Support document recovery after server restart

3. **Permission Enforcement**
   - Validate `diagram:view` permission before allowing connection
   - Check diagram ownership/share permissions
   - Prevent unauthorized room access
   - Log permission denials for audit

4. **Connection Management**
   - Track active connections per document
   - Handle graceful disconnects
   - Clean up resources on connection close
   - Support connection health checks

### Non-Functional Requirements

1. **Performance**
   - <200ms sync latency for 5 concurrent users
   - Support 100+ concurrent connections
   - <50ms authentication validation time
   - <100ms document load time

2. **Reliability**
   - Zero data loss on server restart
   - Graceful degradation under high load
   - Auto-restart on crash (PM2)
   - No memory leaks (long-running processes)

3. **Security**
   - All connections authenticated
   - Rate limiting on updates
   - Input validation on all data
   - Secure WebSocket (WSS) in production

4. **Scalability**
   - Horizontal scaling ready (Redis pub/sub in future)
   - Database connection pooling
   - Efficient memory usage per connection

---

## Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Client (Browser)                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────────────────┐ │
│  │ Yjs Client │  │ y-websocket│  │ Better Auth Session    │ │
│  └─────┬──────┘  └─────┬──────┘  └──────────┬─────────────┘ │
└────────┼────────────────┼────────────────────┼────────────────┘
         │                │                    │
         │ WebSocket Handshake (with session cookie)
         │                │                    │
┌────────▼────────────────▼────────────────────▼────────────────┐
│              Hocuspocus WebSocket Server                       │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Auth Hook    │→ │ Permission   │→ │ Yjs Synchronization│  │
│  │ (validate    │  │ Check        │  │ (CRDT merge)       │  │
│  │  session)    │  │ (diagram:    │  │                    │  │
│  │              │  │  view)       │  │                    │  │
│  └──────────────┘  └──────────────┘  └──────────┬─────────┘  │
│                                                  │             │
│  ┌──────────────────────────────────────────────▼─────────┐  │
│  │         DatabaseAdapter Extension                      │  │
│  │  onLoad (read) ← → onStore (write)                    │  │
│  └──────────────────────┬───────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          │ PostgreSQL Connection (Drizzle)
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   PostgreSQL Database                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ yjs_document │  │ session      │  │ diagram            │  │
│  │ (CRDT state) │  │ (auth token) │  │ (metadata)         │  │
│  └──────────────┘  └──────────────┘  └────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Component Architecture

```
server/
├── websocket-server.ts           # Main entry point
│   ├── Hocuspocus Server Config
│   ├── Auth Hook Registration
│   ├── DatabaseAdapter Extension
│   ├── Logging Configuration
│   └── Error Handling
│
├── auth-middleware.ts            # Better Auth integration
│   ├── extractSessionToken()
│   ├── validateSession()
│   ├── getUserPermissions()
│   └── checkDiagramAccess()
│
├── DatabaseAdapter.ts            # PostgreSQL persistence
│   ├── onLoad() - Read document
│   ├── onStore() - Write document
│   ├── debouncing logic
│   └── connection pooling
│
├── logger.ts                     # Structured logging
│   ├── logConnection()
│   ├── logError()
│   ├── logDocumentUpdate()
│   └── logPermissionDenial()
│
└── health-check.ts               # Health monitoring
    ├── checkDatabaseConnection()
    ├── checkActiveConnections()
    └── returnHealthStatus()
```

---

## Related Code Files

### Files to Create

1. **`server/websocket-server.ts`** (NEW)
   - Main Hocuspocus server configuration
   - Port: 3001
   - Hook registration
   - Extension setup

2. **`server/auth-middleware.ts`** (NEW)
   - Better Auth session validation
   - Token extraction from WebSocket handshake
   - Permission checking logic

3. **`server/DatabaseAdapter.ts`** (NEW)
   - Hocuspocus extension for PostgreSQL persistence
   - Document load/save logic
   - Debouncing for frequent writes

4. **`server/logger.ts`** (NEW)
   - Winston/Pino structured logging
   - Log levels: info, warn, error
   - Request tracking

5. **`server/health-check.ts`** (NEW)
   - HTTP health check endpoint
   - Database connectivity check
   - Active connection count

6. **`config/ecosystem.config.cjs`** (NEW)
   - PM2 process configuration
   - Auto-restart settings
   - Environment variables

7. **`config/nginx-websocket.conf`** (NEW)
   - Nginx reverse proxy configuration
   - WebSocket upgrade handling
   - SSL/TLS configuration

8. **`lib/db/schema.ts`** (MODIFY)
   - Add `yjs_document` table
   - Add `yjs_update_log` table (optional)

### Files to Reference

- `lib/auth.ts` - Better Auth configuration
- `lib/db/index.ts` - Database connection
- `lib/permissions.ts` - RBAC permission checks

### Files to Delete

None

---

## Implementation Steps

### Step 1: Install Dependencies (Day 1)

**Objective:** Install required packages for Hocuspocus server

**Input:** `package.json` existing dependencies

**Output:** Additional dependencies installed

**Commands:**
```bash
cd C:\Users\Kratos\canvas-A-I-O

# Core dependencies already in package.json:
# - @hocuspocus/server ^2.13.4
# - @hocuspocus/transformer ^2.0.0
# - better-auth ^1.4.18
# - pg ^8.18.0
# - drizzle-orm ^0.45.1

# Additional dependencies for WebSocket server:
npm install --save ws winston pino

# Dev dependencies for TypeScript and monitoring:
npm install --save-dev @types/ws pm2
```

**Files Involved:**
- `package.json` (modify, add dependencies)

**Estimated Workload:** 30 minutes

**Success Criteria:**
- [ ] All packages installed successfully
- [ ] No version conflicts
- [ ] TypeScript types resolve correctly

---

### Step 2: Create Database Schema for Yjs (Day 1)

**Objective:** Add tables for storing Yjs document state

**Input:** Existing `lib/db/schema.ts`

**Output:** New tables in PostgreSQL database

**Implementation:**

```typescript
// Add to lib/db/schema.ts

import { pgTable, text, timestamp, bytea } from "drizzle-orm/pg-core"

export const yjsDocument = pgTable("yjs_document", {
  id: text("id").primaryKey(),           // Room ID (diagram ID)
  data: bytea("data").notNull(),          // Yjs document state (binary)
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const yjsUpdateLog = pgTable("yjs_update_log", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull().references(() => yjsDocument.id, { onDelete: "cascade" }),
  update: bytea("update").notNull(),      // Individual CRDT update
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
```

**Migration Script:**

```typescript
// scripts/setup-websocket-db.ts
import { db } from "../lib/db"
import { migrate } from "drizzle-orm/node-postgres/migrator"

async function setupWebSocketDb() {
  console.log("Running WebSocket database setup...")

  // Run migrations
  await migrate(db, { migrationsFolder: "drizzle" })

  console.log("WebSocket database setup complete!")
}

setupWebSocketDb()
```

**Commands:**
```bash
# Generate migration
npx drizzle-kit generate:pg

# Run migration
npm run db:push  # or node dist/scripts/setup-websocket-db.js
```

**Files Involved:**
- `lib/db/schema.ts` (modify, add tables)
- `drizzle/000X_yjs_document.sql` (auto-generated)
- `scripts/setup-websocket-db.ts` (create)

**Estimated Workload:** 1 hour

**Success Criteria:**
- [ ] Tables created in PostgreSQL
- [ ] Migration runs without errors
- [ ] Schema matches Hocuspocus requirements

---

### Step 3: Implement Auth Middleware (Day 2)

**Objective:** Validate Better Auth sessions from WebSocket handshake

**Input:** WebSocket handshake request with session cookie

**Output:** User context or rejection

**Implementation:**

```typescript
// server/auth-middleware.ts
import { db } from "../lib/db"
import { auth } from "../lib/auth"
import * as schema from "../lib/db/schema"
import { eq } from "drizzle-orm"

export interface WebSocketContext {
  userId: string
  userRole: string
  userName: string
  permissions: string[]
}

/**
 * Extract Better Auth session token from WebSocket handshake
 */
export function extractSessionToken(request: Request): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }

  // Try cookie header
  const cookieHeader = request.headers.get("cookie")
  if (cookieHeader) {
    const sessionMatch = cookieHeader.match(/better-auth.session_token=([^;]+)/)
    if (sessionMatch) {
      return sessionMatch[1]
    }
  }

  return null
}

/**
 * Validate Better Auth session and return user context
 */
export async function validateSession(
  token: string
): Promise<WebSocketContext | null> {
  try {
    // Use Better Auth's built-in session validation
    const session = await auth.api.getSession({
      headers: new Headers({
        authorization: `Bearer ${token}`,
      }),
    })

    if (!session) {
      return null
    }

    // Get user from database with role
    const user = await db.query.user.findFirst({
      where: eq(schema.user.id, session.user.id),
    })

    if (!user) {
      return null
    }

    return {
      userId: user.id,
      userRole: user.role || "editor",
      userName: user.name || user.email,
      permissions: getPermissionsForRole(user.role || "editor"),
    }
  } catch (error) {
    console.error("Session validation error:", error)
    return null
  }
}

/**
 * Check if user has permission to access diagram
 */
export async function checkDiagramAccess(
  context: WebSocketContext,
  documentName: string
): Promise<boolean> {
  try {
    // documentName format: "diagram-{diagramId}"
    const diagramId = documentName.replace("diagram-", "")

    // For now, allow all authenticated users
    // TODO: Implement proper diagram-level ACL in Sprint 4

    return true
  } catch (error) {
    console.error("Diagram access check error:", error)
    return false
  }
}

/**
 * Get permissions array for role
 */
function getPermissionsForRole(role: string): string[] {
  switch (role) {
    case "owner":
      return ["*"]
    case "admin":
      return ["diagram:create", "diagram:edit", "diagram:view", "diagram:delete", "diagram:share"]
    case "editor":
      return ["diagram:create", "diagram:edit", "diagram:view", "diagram:delete"]
    case "viewer":
      return ["diagram:view"]
    default:
      return []
  }
}
```

**Files Involved:**
- `server/auth-middleware.ts` (create)

**Estimated Workload:** 3 hours

**Success Criteria:**
- [ ] Can extract session token from handshake
- [ ] Validates against Better Auth session table
- [ ] Returns user context correctly
- [ ] Rejects invalid/expired tokens

---

### Step 4: Implement DatabaseAdapter (Day 3-4)

**Objective:** Persist Yjs documents to PostgreSQL

**Input:** Yjs document state

**Output:** Document saved/loaded from database

**Implementation:**

```typescript
// server/DatabaseAdapter.ts
import { Extension } from "@hocuspocus/server"
import { db } from "../lib/db"
import { yjsDocument } from "../lib/db/schema"
import { eq } from "drizzle-orm"

interface DatabaseAdapterConfig {
  /**
   * Debounce store operations by this many ms
   * Prevents excessive database writes
   */
  debounce?: number
}

export class DatabaseAdapter implements Extension {
  private debounceTimers: Map<string, NodeJS.Timeout> = new Map()
  private debounceMs: number

  constructor(config: DatabaseAdapterConfig = {}) {
    this.debounceMs = config.debounce || 1000 // Default 1 second
  }

  /**
   * Load document from database when first connection is made
   */
  async onLoad({ documentName }: { documentName: string }): Promise<Uint8Array | null> {
    try {
      const result = await db.query.yjsDocument.findFirst({
        where: eq(yjsDocument.id, documentName),
      })

      if (!result?.data) {
        console.log(`[DatabaseAdapter] No existing document for ${documentName}`)
        return null
      }

      console.log(`[DatabaseAdapter] Loaded document ${documentName}`)
      return new Uint8Array(result.data)
    } catch (error) {
      console.error(`[DatabaseAdapter] Error loading document ${documentName}:`, error)
      return null
    }
  }

  /**
   * Store document to database with debouncing
   */
  async onStore({
    documentName,
    state,
  }: {
    documentName: string
    state: Uint8Array
  }): Promise<void> {
    // Clear existing timer for this document
    const existingTimer = this.debounceTimers.get(documentName)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Set new timer
    const timer = setTimeout(async () => {
      try {
        await this.saveDocument(documentName, state)
        this.debounceTimers.delete(documentName)
      } catch (error) {
        console.error(`[DatabaseAdapter] Error storing document ${documentName}:`, error)
      }
    }, this.debounceMs)

    this.debounceTimers.set(documentName, timer)
  }

  /**
   * Save document to database
   */
  private async saveDocument(
    documentName: string,
    state: Uint8Array
  ): Promise<void> {
    try {
      // Check if document exists
      const existing = await db.query.yjsDocument.findFirst({
        where: eq(yjsDocument.id, documentName),
      })

      const buffer = Buffer.from(state)

      if (existing) {
        // Update existing document
        await db
          .update(yjsDocument)
          .set({
            data: buffer,
            updatedAt: new Date(),
          })
          .where(eq(yjsDocument.id, documentName))

        console.log(`[DatabaseAdapter] Updated document ${documentName}`)
      } else {
        // Insert new document
        await db.insert(yjsDocument).values({
          id: documentName,
          data: buffer,
          updatedAt: new Date(),
        })

        console.log(`[DatabaseAdapter] Created document ${documentName}`)
      }
    } catch (error) {
      console.error(`[DatabaseAdapter] Error saving document ${documentName}:`, error)
      throw error
    }
  }

  /**
   * Clean up timers on server shutdown
   */
  async onDestroy(): Promise<void> {
    // Save all pending documents
    for (const [documentName, timer] of this.debounceTimers) {
      clearTimeout(timer)
      console.log(`[DatabaseAdapter] Flushing document ${documentName}`)
    }
    this.debounceTimers.clear()
  }
}
```

**Files Involved:**
- `server/DatabaseAdapter.ts` (create)

**Estimated Workload:** 5 hours

**Success Criteria:**
- [ ] Loads existing documents from database
- [ ] Saves new documents to database
- [ ] Debouncing works (no excessive writes)
- [ ] Handles binary data correctly
- [ ] Gracefully handles database errors

---

### Step 5: Implement Main WebSocket Server (Day 4-5)

**Objective:** Create Hocuspocus server with all extensions

**Input:** Configuration and extensions

**Output:** Running WebSocket server on port 3001

**Implementation:**

```typescript
// server/websocket-server.ts
import { Server } from "@hocuspocus/server"
import { DatabaseAdapter } from "./DatabaseAdapter"
import { extractSessionToken, validateSession, checkDiagramAccess } from "./auth-middleware"
import { logger } from "./logger"

const PORT = process.env.WS_PORT || 3001
const DATABASE_URL = process.env.DATABASE_URL!

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required")
}

// Create database adapter with 1 second debounce
const dbAdapter = new DatabaseAdapter({
  debounce: 1000,
})

// Configure Hocuspocus server
const server = Server.configure({
  port: PORT,

  // Authentication hook - runs on every connection
  authenticate: async ({ token, documentName, request }) => {
    try {
      // Extract session token from handshake
      const sessionToken = token || extractSessionToken(request)

      if (!sessionToken) {
        logger.warn("Authentication failed: No token provided", {
          documentName,
        })
        throw new Error("No authentication token provided")
      }

      // Validate session with Better Auth
      const context = await validateSession(sessionToken)

      if (!context) {
        logger.warn("Authentication failed: Invalid token", {
          documentName,
        })
        throw new Error("Invalid or expired session")
      }

      // Check diagram access permission
      const hasAccess = await checkDiagramAccess(context, documentName)

      if (!hasAccess) {
        logger.warn("Authentication failed: No diagram access", {
          documentName,
          userId: context.userId,
        })
        throw new Error("Permission denied")
      }

      logger.info("User authenticated", {
        documentName,
        userId: context.userId,
        userRole: context.userRole,
      })

      // Return user context (will be available in other hooks)
      return {
        user: context,
      }
    } catch (error) {
      logger.error("Authentication error", {
        documentName,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  },

  // Extensions
  extensions: [
    dbAdapter,
  ],

  // When document is loaded
  onLoad: async ({ documentName }) => {
    logger.info("Document loaded", { documentName })
  },

  // When document is stored
  onStore: async ({ documentName }) => {
    logger.info("Document stored", { documentName })
  },

  // When client connects
  onConnect: async ({ documentName, context }) => {
    const user = context?.user
    logger.info("Client connected", {
      documentName,
      userId: user?.userId,
      userName: user?.userName,
    })
  },

  // When client disconnects
  onDisconnect: async ({ documentName, context }) => {
    const user = context?.user
    logger.info("Client disconnected", {
      documentName,
      userId: user?.userId,
      userName: user?.userName,
    })
  },

  // Handle errors
  onListen: async ({ port }) => {
    logger.info("WebSocket server listening", { port })
  },

  onDestroy: async () => {
    logger.info("WebSocket server shutting down")
    await dbAdapter.onDestroy()
  },
})

// Start server
server.listen().then(() => {
  logger.info("Hocuspocus server started", {
    port: PORT,
    nodeEnv: process.env.NODE_ENV || "development",
  })
})

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully")
  await server.destroy()
  process.exit(0)
})

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down gracefully")
  await server.destroy()
  process.exit(0)
})

export { server }
```

**Files Involved:**
- `server/websocket-server.ts` (create)
- `server/logger.ts` (create)

**Estimated Workload:** 4 hours

**Success Criteria:**
- [ ] Server starts on port 3001
- [ ] Accepts WebSocket connections
- [ ] Rejects unauthenticated connections
- [ ] Logs connection events
- [ ] Graceful shutdown works

---

### Step 6: Implement Logger (Day 5)

**Objective:** Structured logging for monitoring and debugging

**Input:** Log events

**Output:** Formatted log output

**Implementation:**

```typescript
// server/logger.ts
import pino from "pino"

const isDevelopment = process.env.NODE_ENV !== "production"

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  transport: isDevelopment
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss Z",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  base: isDevelopment
    ? {}
    : {
        pid: process.pid,
        hostname: process.env.HOSTNAME || "unknown",
      },
})

// Convenience methods
export const logConnection = (event: string, data: Record<string, any>) => {
  logger.info({ event, ...data })
}

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error({ error: error.message, stack: error.stack, ...context })
}

export const logDocumentUpdate = (documentName: string, userId: string) => {
  logger.info({
    event: "document_update",
    documentName,
    userId,
  })
}

export const logPermissionDenial = (documentName: string, reason: string) => {
  logger.warn({
    event: "permission_denial",
    documentName,
    reason,
  })
}
```

**Files Involved:**
- `server/logger.ts` (create)

**Estimated Workload:** 1 hour

**Success Criteria:**
- [ ] Logs are formatted correctly
- [ ] Different log levels work
- [ ] Development vs production output differs appropriately

---

### Step 7: Create Health Check Endpoint (Day 6)

**Objective:** HTTP endpoint for monitoring server health

**Input:** HTTP GET request

**Output:** Health status JSON

**Implementation:**

```typescript
// server/health-check.ts
import { db } from "../lib/db"
import { logger } from "./logger"

export interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy"
  timestamp: string
  uptime: number
  database: {
    connected: boolean
    latency?: number
  }
  connections: {
    active: number
  }
}

export async function getHealthStatus(activeConnections: number): Promise<HealthStatus> {
  const startTime = Date.now()
  let dbConnected = false
  let dbLatency: number | undefined

  try {
    // Test database connection
    await db.execute("SELECT 1")
    dbConnected = true
    dbLatency = Date.now() - startTime
  } catch (error) {
    logger.error("Database health check failed", { error })
  }

  const status: HealthStatus = {
    status: dbConnected ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      connected: dbConnected,
      latency: dbLatency,
    },
    connections: {
      active: activeConnections,
    },
  }

  return status
}
```

**Add to server/websocket-server.ts:**

```typescript
import { createServer } from "http"
import { getHealthStatus } from "./health-check"

// Track active connections
let activeConnections = 0

// Update onConnect/onDisconnect
onConnect: async ({ documentName, context }) => {
  activeConnections++
  // ... existing logging
}

onDisconnect: async ({ documentName, context }) => {
  activeConnections--
  // ... existing logging
}

// Add HTTP server for health checks
const httpServer = createServer(async (req, res) => {
  if (req.url === "/health" && req.method === "GET") {
    const status = await getHealthStatus(activeConnections)
    res.writeHead(status.status === "healthy" ? 200 : 503, {
      "Content-Type": "application/json",
    })
    res.end(JSON.stringify(status, null, 2))
  } else {
    res.writeHead(404)
    res.end("Not Found")
  }
})

httpServer.listen(PORT + 1) // Health check on port 3002
```

**Files Involved:**
- `server/health-check.ts` (create)
- `server/websocket-server.ts` (modify)

**Estimated Workload:** 2 hours

**Success Criteria:**
- [ ] Health endpoint returns JSON
- [ ] Database connectivity check works
- [ ] Active connection count accurate
- [ ] Returns appropriate HTTP status codes

---

### Step 8: Configure PM2 (Day 7)

**Objective:** Process management for production deployment

**Input:** Server configuration

**Output:** PM2 ecosystem configuration

**Implementation:**

```javascript
// config/ecosystem.config.cjs
module.exports = {
  apps: [
    {
      name: "canvas-ws",
      script: "./server/websocket-server.ts",
      interpreter: "node",
      interpreter_args: "--import tsx",
      instances: 1,
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "development",
        WS_PORT: 3001,
      },
      env_production: {
        NODE_ENV: "production",
        WS_PORT: 3001,
        LOG_LEVEL: "info",
      },
      error_file: "./logs/ws-error.log",
      out_file: "./logs/ws-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      log_file: "./logs/ws-combined.log",
      time: true,
    },
  ],
}
```

**Install tsx for TypeScript execution:**
```bash
npm install --save-dev tsx
```

**PM2 Commands:**
```bash
# Start server
pm2 start config/ecosystem.config.cjs

# Monitor
pm2 monit

# View logs
pm2 logs canvas-ws

# Restart
pm2 restart canvas-ws

# Stop
pm2 stop canvas-ws

# Save startup script
pm2 save
pm2 startup
```

**Files Involved:**
- `config/ecosystem.config.cjs` (create)

**Estimated Workload:** 1 hour

**Success Criteria:**
- [ ] PM2 starts server successfully
- [ ] Auto-restart on crash works
- [ ] Logs are captured correctly
- [ ] Environment variables are applied

---

### Step 9: Configure Nginx Reverse Proxy (Day 8)

**Objective:** Route WebSocket traffic through Nginx

**Input:** Nginx configuration

**Output:** WebSocket connections proxied correctly

**Implementation:**

```nginx
# config/nginx-websocket.conf

# Map for WebSocket upgrade detection
map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

# Upstream WebSocket server
upstream websocket_backend {
    server 127.0.0.1:3001;
    # Add more servers for load balancing in future
    # server 127.0.0.1:3011;
    # server 127.0.0.1:3021;
}

# HTTPS server block (add to existing server config)
server {
    listen 443 ssl http2;
    server_name draw.nulled.ai;

    # SSL configuration (existing)
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # WebSocket endpoint
    location /ws {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;

        # Headers
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

    # Health check endpoint (optional, from port 3002)
    location /ws-health {
        proxy_pass http://127.0.0.1:3002/health;
        proxy_set_header Host $host;
        access_log off;  # Don't log health checks
    }
}
```

**Deployment Steps:**
```bash
# Copy config to Nginx
sudo cp config/nginx-websocket.conf /etc/nginx/sites-available/canvas-websocket

# Create symlink to enable
sudo ln -s /etc/nginx/sites-available/canvas-websocket /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo nginx -s reload
```

**Files Involved:**
- `config/nginx-websocket.conf` (create)
- `/etc/nginx/sites-available/canvas-websocket` (deploy target)

**Estimated Workload:** 2 hours

**Success Criteria:**
- [ ] Nginx config test passes
- [ ] WebSocket connections work through proxy
- [ ] SSL/TLS termination works
- [ ] No connection drops

---

### Step 10: Testing (Day 9)

**Objective:** Verify all functionality works correctly

**Input:** Test scenarios

**Output:** Test results and bug fixes

#### Unit Tests

```bash
# Create test file
touch server/__tests__/auth-middleware.test.ts
touch server/__tests__/DatabaseAdapter.test.ts
```

**Example Test:**

```typescript
// server/__tests__/auth-middleware.test.ts
import { describe, it, expect } from "vitest"
import { extractSessionToken, validateSession } from "../auth-middleware"

describe("Auth Middleware", () => {
  describe("extractSessionToken", () => {
    it("should extract token from Authorization header", () => {
      const request = new Request("http://localhost", {
        headers: { authorization: "Bearer test-token" },
      })
      const token = extractSessionToken(request)
      expect(token).toBe("test-token")
    })

    it("should extract token from cookie", () => {
      const request = new Request("http://localhost", {
        headers: {
          cookie: "better-auth.session_token=session123; other=value",
        },
      })
      const token = extractSessionToken(request)
      expect(token).toBe("session123")
    })

    it("should return null if no token", () => {
      const request = new Request("http://localhost")
      const token = extractSessionToken(request)
      expect(token).toBeNull()
    })
  })

  describe("validateSession", () => {
    it("should validate correct token", async () => {
      // TODO: Implement with mock database
    })

    it("should reject invalid token", async () => {
      const context = await validateSession("invalid-token")
      expect(context).toBeNull()
    })
  })
})
```

#### Integration Tests

```bash
# Create manual test script
cat > scripts/test-websocket.sh << 'EOF'
#!/bin/bash

echo "Testing WebSocket Server..."

# Test 1: Health check
echo "Test 1: Health check"
curl -f http://localhost:3002/health || echo "FAILED"

# Test 2: WebSocket connection (requires websocat)
echo "Test 2: WebSocket connection"
echo '{"documentName":"test-doc"}' | websocat ws://localhost:3001 || echo "FAILED"

echo "Tests complete!"
EOF

chmod +x scripts/test-websocket.sh
```

#### Manual Tests

1. **Authentication Test:**
   - Open browser DevTools Console
   - Connect to WebSocket with valid session
   - Verify connection accepted
   - Connect with invalid token
   - Verify connection rejected

2. **Persistence Test:**
   - Create diagram in browser
   - Make changes
   - Restart server
   - Reload diagram
   - Verify changes persisted

3. **Multi-user Test:**
   - Open 3 browser windows
   - Connect to same diagram
   - Edit in one window
   - Verify sync to other windows

**Files Involved:**
- `server/__tests__/auth-middleware.test.ts` (create)
- `server/__tests__/DatabaseAdapter.test.ts` (create)
- `scripts/test-websocket.sh` (create)

**Estimated Workload:** 8 hours

**Success Criteria:**
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual tests pass
- [ ] All bugs fixed

---

### Step 11: Load Testing (Day 10)

**Objective:** Verify performance under load

**Input:** Load testing script

**Output:** Performance metrics

**Implementation:**

```typescript
// scripts/load-test-websocket.ts
import WebSocket from "ws"

const CONCURRENT_USERS = 5
const DOCUMENT_NAME = "load-test-doc"
const UPDATES_PER_USER = 20
const SERVER_URL = "ws://localhost:3001"

async function simulateUser(userId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(SERVER_URL, {
      headers: {
        authorization: "Bearer test-token", // Use valid token
      },
    })

    let updateCount = 0
    const latencies: number[] = []

    ws.on("open", () => {
      console.log(`User ${userId} connected`)

      // Send updates
      const interval = setInterval(() => {
        if (updateCount >= UPDATES_PER_USER) {
          clearInterval(interval)
          ws.close()
          return
        }

        const startTime = Date.now()
        ws.send(
          JSON.stringify({
            type: "update",
            documentName: DOCUMENT_NAME,
            data: `update-${userId}-${updateCount}`,
          })
        )

        // Measure latency
        ws.once("message", () => {
          latencies.push(Date.now() - startTime)
        })

        updateCount++
      }, 100) // 10 updates per second
    })

    ws.on("close", () => {
      const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length
      const maxLatency = Math.max(...latencies)
      console.log(`User ${userId} finished - Avg latency: ${avgLatency}ms, Max: ${maxLatency}ms`)
      resolve()
    })

    ws.on("error", (error) => {
      console.error(`User ${userId} error:`, error)
      reject(error)
    })
  })
}

async function runLoadTest(): Promise<void> {
  console.log(`Starting load test with ${CONCURRENT_USERS} concurrent users...`)

  const startTime = Date.now()

  // Run all users concurrently
  const promises = Array.from({ length: CONCURRENT_USERS }, (_, i) =>
    simulateUser(i)
  )

  await Promise.all(promises)

  const duration = Date.now() - startTime
  console.log(`Load test completed in ${duration}ms`)
  console.log(`Avg per user: ${duration / CONCURRENT_USERS}ms`)
}

runLoadTest().catch(console.error)
```

**Run Load Test:**
```bash
npx tsx scripts/load-test-websocket.ts
```

**Metrics to Collect:**
- Average sync latency
- Max sync latency
- Connection success rate
- Memory usage
- CPU usage
- Database write latency

**Success Criteria:**
- [ ] <200ms average sync latency
- [ ] <500ms max sync latency
- [ ] 100% connection success rate
- [ ] Memory stable (no leaks)
- [ ] Database writes complete successfully

**Files Involved:**
- `scripts/load-test-websocket.ts` (create)

**Estimated Workload:** 6 hours

**Success Criteria:**
- [ ] Load test runs without errors
- [ ] Performance targets met
- [ ] No memory leaks detected
- [ ] Server remains stable

---

## Todo List

### Day 1: Setup and Database
- [ ] Install dependencies (ws, winston, pino, pm2, tsx)
- [ ] Create `yjs_document` table schema
- [ ] Create `yjs_update_log` table schema
- [ ] Run database migration
- [ ] Verify tables created correctly

### Day 2: Authentication
- [ ] Implement `extractSessionToken()`
- [ ] Implement `validateSession()`
- [ ] Implement `checkDiagramAccess()`
- [ ] Test with real Better Auth session
- [ ] Test with expired session
- [ ] Test with invalid session

### Day 3-4: Database Adapter
- [ ] Create `DatabaseAdapter` class
- [ ] Implement `onLoad()` method
- [ ] Implement `onStore()` method
- [ ] Add debouncing logic
- [ ] Test document load
- [ ] Test document save
- [ ] Test debouncing works

### Day 4-5: Main Server
- [ ] Create `websocket-server.ts`
- [ ] Configure Hocuspusion server
- [ ] Register auth hook
- [ ] Register DatabaseAdapter extension
- [ ] Implement logging
- [ ] Add connection tracking
- [ ] Add graceful shutdown

### Day 5: Logger
- [ ] Create `logger.ts` with pino
- [ ] Add pretty printing for dev
- [ ] Add JSON logging for production
- [ ] Test log output

### Day 6: Health Check
- [ ] Create `health-check.ts`
- [ ] Add HTTP server for health endpoint
- [ ] Test database connectivity check
- [ ] Test connection count reporting
- [ ] Verify health endpoint returns correct status

### Day 7: PM2 Configuration
- [ ] Create `ecosystem.config.cjs`
- [ ] Configure environment variables
- [ ] Configure log file paths
- [ ] Test PM2 start/stop/restart
- [ ] Test auto-restart on crash
- [ ] Setup PM2 startup script

### Day 8: Nginx Configuration
- [ ] Create `nginx-websocket.conf`
- [ ] Configure WebSocket upgrade handling
- [ ] Configure SSL/TLS
- [ ] Test Nginx config syntax
- [ ] Deploy to VPS
- [ ] Test WebSocket through proxy
- [ ] Test health check endpoint

### Day 9: Testing
- [ ] Write unit tests for auth middleware
- [ ] Write unit tests for DatabaseAdapter
- [ ] Create integration test script
- [ ] Run all tests
- [ ] Fix any failing tests
- [ ] Manual testing with browser
- [ ] Test authentication flow
- [ ] Test persistence flow
- [ ] Test multi-user sync

### Day 10: Load Testing
- [ ] Create load test script
- [ ] Run load test with 5 users
- [ ] Measure sync latency
- [ ] Check memory usage
- [ ] Verify no memory leaks
- [ ] Document performance metrics
- [ ] Address any performance issues

---

## Success Criteria

### Functional Requirements
- [ ] WebSocket server accepts connections on port 3001
- [ ] Valid Better Auth sessions can connect
- [ ] Invalid/expired sessions are rejected (401)
- [ ] Yjs document state persists to PostgreSQL
- [ ] Document state loads correctly after server restart
- [ ] Permission checks prevent unauthorized room access
- [ ] Health check endpoint returns correct status

### Non-Functional Requirements
- [ ] <200ms sync latency for 5 concurrent users
- [ ] Server handles 100+ concurrent connections
- [ ] Zero data loss on server restart
- [ ] Graceful handling of malformed CRDT updates
- [ ] PM2 keeps server running (auto-restart on crash)
- [ ] Nginx reverse proxy works correctly
- [ ] Memory usage stable over time (no leaks)

### Integration Requirements
- [ ] Works with Phase 1 Yjs client (`y-websocket`)
- [ ] Uses existing Better Auth session format
- [ ] Integrates with existing PostgreSQL schema
- [ ] Compatible with existing RBAC system
- [ ] Health check endpoint accessible

### Security Requirements
- [ ] All connections authenticated (no anonymous access)
- [ ] Session tokens validated on every connection
- [ ] Diagram access permissions enforced
- [ ] Invalid sessions rejected immediately
- [ ] Security events logged (denials, failures)

---

## Risk Assessment

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Better Auth session extraction fails | HIGH | MEDIUM | Test token extraction early; fallback to manual validation; document session format |
| Yjs binary data corruption in PostgreSQL | CRITICAL | LOW | Implement checksum validation; add backup/restore mechanism; test load/save cycle extensively |
| WebSocket memory leak under load | HIGH | MEDIUM | Regular memory profiling; implement document GC; monitor with PM2; set max_memory_restart |
| Nginx proxy drops long-lived connections | HIGH | LOW | Test Nginx config thoroughly; increase proxy timeouts; monitor connection logs |
| PostgreSQL write bottleneck under load | MEDIUM | LOW | Implement debouncing (1s); batch writes; monitor query performance; add indexes if needed |
| Hocuspocus extension incompatibility | MEDIUM | LOW | Test extensions individually; check version compatibility; review Hocuspocus docs |
| Race conditions in concurrent writes | MEDIUM | MEDIUM | Test with multiple users; implement proper locking if needed; leverage Yjs CRDT merge |

### Deployment Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| VPS firewall blocks port 3001 | HIGH | LOW | Check firewall rules before deployment; document required ports; test locally first |
| PM2 not installed or misconfigured | HIGH | LOW | Include PM2 in setup script; add installation instructions; test PM2 commands |
| Nginx config syntax error | MEDIUM | LOW | Always run `nginx -t` before reload; have backup config; test staging first |
| Environment variables missing | HIGH | MEDIUM | Use `.env.example`; validate required vars on startup; document all env vars |
| Database migration fails | CRITICAL | LOW | Test migration on local first; backup database before migration; use transactions |

### Operational Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Server crashes and loses in-memory state | HIGH | MEDIUM | Implement persistence on every update; debounce writes; test recovery; document restore process |
| Logs fill disk space | MEDIUM | MEDIUM | Implement log rotation; monitor disk usage; set max log file size; use log aggregation |
| Health check endpoint becomes single point of failure | LOW | LOW | Keep health check simple; cache database status; add timeout; degrade gracefully |
| Monitoring/alerting not configured | MEDIUM | HIGH | Setup PM2 monitoring; configure alerts for crashes; log errors; document troubleshooting |

---

## Security Considerations

### 1. Authentication & Authorization

**Token Validation:**
- Extract Better Auth session token from WebSocket handshake
- Validate token against database on every connection
- Check token expiration
- Reject connections with invalid tokens immediately

**Permission Checks:**
- Validate `diagram:view` permission before allowing connection
- Check diagram ownership/sharing (future enhancement)
- Log all permission denials for audit
- Return generic error messages (don't leak info)

**Session Management:**
- Track active connections per user
- Limit max connections per user (100)
- Disconnect idle connections after timeout
- Handle session refresh during long-lived connections

### 2. Input Validation

**Document Names:**
- Validate format (must be `diagram-{uuid}`)
- Prevent path traversal attacks
- Reject suspicious patterns
- Sanitize before database queries

**Yjs Updates:**
- Validate size limits (<50MB per document)
- Reject malformed binary data
- Implement rate limiting (100 updates/sec)
- Validate CRDT structure

**WebSocket Handshake:**
- Validate origin header
- Check host header
- Reject suspicious user agents
- Limit header size

### 3. Rate Limiting

**Connection Limits:**
- Max 100 concurrent connections per user
- Max 1000 total connections
- Drop excessive connections
- Log throttling events

**Update Rate Limits:**
- Max 100 updates/second per connection
- Drop excessive updates
- Implement debouncing (1s)
- Warn on rate limit approach

**Memory Limits:**
- Max 10MB per document
- Max 1GB total server memory
- PM2 auto-restart on limit
- Monitor memory usage

### 4. Data Protection

**Encryption:**
- Use WSS (WebSocket Secure) in production
- TLS 1.3 minimum
- Enforce strong ciphers
- Disable old protocols

**Database Security:**
- Use parameterized queries (Drizzle ORM)
- Validate all inputs
- Escape binary data
- Implement connection pooling

**Logging Security:**
- Don't log sensitive data (tokens, passwords)
- Sanitize PII from logs
- Secure log file permissions
- Rotate logs regularly

### 5. Denial of Service Prevention

**Connection Flooding:**
- Rate limit new connections
- Implement IP-based throttling
- Use connection timeouts
- Drop malformed packets

**Resource Exhaustion:**
- Limit memory per connection
- Limit CPU per connection
- Implement fair queuing
- Monitor resource usage

**Slowloris Attacks:**
- Set minimum data rate
- Timeout slow connections
- Drop idle connections
- Monitor connection duration

---

## Deployment Checklist

### Pre-Deployment

**Code:**
- [ ] All tests passing
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Environment variables documented

**Database:**
- [ ] Migration tested locally
- [ ] Database backed up
- [ ] Rollback plan prepared
- [ ] Schema verified

**Infrastructure:**
- [ ] VPS access confirmed
- [ ] PM2 installed
- [ ] Nginx configured
- [ ] Firewall rules set (port 3001, 3002)
- [ ] SSL certificate valid

### Deployment Steps

**1. Prepare VPS:**
```bash
ssh root@209.38.58.83 -p 2222

# Install PM2
npm install -g pm2

# Create logs directory
mkdir -p /var/www/canvas-A-I-O/logs
```

**2. Deploy Code:**
```bash
# From local machine
cd C:\Users\Kratos\canvas-A-I-O

# Build TypeScript
npm run build

# Upload to VPS
rsync -avz -e "ssh -p 2222" \
  server/ config/ \
  root@209.38.58.83:/var/www/canvas-A-I-O/
```

**3. Database Migration:**
```bash
# On VPS
cd /var/www/canvas-A-I-O
npm run db:push
```

**4. Start WebSocket Server:**
```bash
# Start with PM2
pm2 start ecosystem.config.cjs --env production

# Save PM2 config
pm2 save
pm2 startup
```

**5. Configure Nginx:**
```bash
# Copy config
sudo cp nginx-websocket.conf /etc/nginx/sites-available/

# Enable
sudo ln -s /etc/nginx/sites-available/nginx-websocket.conf \
  /etc/nginx/sites-enabled/

# Test
sudo nginx -t

# Reload
sudo nginx -s reload
```

**6. Verify Deployment:**
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs canvas-ws

# Test health check
curl http://localhost:3002/health

# Test WebSocket (from local)
wscat -c wss://draw.nulled.ai/ws
```

### Post-Deployment

**Monitoring:**
- [ ] PM2 monitoring active
- [ ] Logs being collected
- [ ] Health check endpoint accessible
- [ ] Memory usage stable
- [ ] CPU usage normal

**Testing:**
- [ ] Connect with valid session
- [ ] Reject invalid session
- [ ] Create/edit diagram
- [ ] Verify persistence
- [ ] Test with multiple users

**Documentation:**
- [ ] Update deployment documentation
- [ ] Document any issues encountered
- [ ] Update runbook
- [ ] Notify team of deployment

---

## Rollback Plan

If deployment fails:

**1. Stop New Server:**
```bash
pm2 stop canvas-ws
```

**2. Revert Code:**
```bash
# Restore previous version
git checkout <previous-commit>
npm run build
rsync -avz -e "ssh -p 2222" \
  server/ config/ \
  root@209.38.58.83:/var/www/canvas-A-I-O/
```

**3. Restart Old Server:**
```bash
pm2 restart canvas-ws
```

**4. Rollback Database:**
```bash
# If migration was applied
psql -U postgres -d canvas < backup.sql
```

**5. Verify:**
```bash
# Test connections
# Check logs
# Verify functionality
```

---

## Next Steps

After Phase 2 completion:

1. **Phase 3: Multiplayer UX** (Week 8)
   - Implement user presence
   - Add multiplayer cursors
   - Create user avatars
   - Add color assignment

2. **Phase 4: Offline Sync** (Week 9)
   - Configure y-indexeddb
   - Add offline indicator
   - Implement reconnection logic
   - Test offline/online transitions

3. **Performance Optimization** (Future)
   - Add Redis pub/sub for scaling
   - Implement document compression
   - Optimize database queries
   - Add CDN for static assets

---

## Questions That Need Further Clarification

### Question 1: Database Storage Format for Yjs Documents

**Current Plan:** Store Yjs document state as binary blob in PostgreSQL `BYTEA` column.

**Alternatives:**
- **Option A:** Binary blob (current plan)
  - Pros: Simple, fast, Yjs-native format
  - Cons: Not human-readable, harder to debug

- **Option B:** Base64-encoded text
  - Pros: Human-readable, easier SQL queries
  - Cons: 33% larger storage, slower encode/decode

- **Option C:** Incremental updates only
  - Pros: More granular, better for auditing
  - Cons: Complex merge logic, slower loads

**Awaiting User Selection:**
```
Please select your preferred storage format:
[ ] Option A: Binary blob (recommended)
[ ] Option B: Base64-encoded text
[ ] Option C: Incremental updates
[ ] Other: _________________
```

---

### Question 2: Document Naming Convention

**Current Plan:** Use format `diagram-{diagramId}` as room identifier.

**Considerations:**
- Should we include user ID in room name for better isolation?
- Should we use UUIDs directly without prefix?
- How to handle shared diagrams vs. private diagrams?

**Awaiting User Input:**
```
Current naming: diagram-{diagramId}
Suggestions: _________________________
```

---

### Question 3: Health Check Endpoint Port

**Current Plan:** Health check on port 3002 (WebSocket server on 3001).

**Alternatives:**
- **Option A:** Separate port 3002 (current plan)
  - Pros: Clean separation, can firewall separately
  - Cons: Extra port to manage

- **Option B:** Same port 3001 with HTTP fallback
  - Pros: One less port, simpler
  - Cons: Mixed protocol on same port

- **Option C:** Via Next.js API route
  - Pros: No new port, integrated with existing
  - Cons: Depends on Next.js server

**Awaiting User Selection:**
```
Please select health check approach:
[ ] Option A: Separate port 3002 (recommended)
[ ] Option B: Same port 3001
[ ] Option C: Via Next.js API route
[ ] Other: _________________
```

---

## User Feedback Area

Please supplement your opinions and suggestions on the overall planning in this area:

```
User additional content:

---
Priority adjustments:

---
Technical concerns:

---
Additional requirements:

---
Timeline feedback:

---
```

---

*Last updated: 2026-02-09*
