# System Architecture - Canvas AIO

This document describes the overall system architecture of Canvas AIO, including core components, data flow, security model, and deployment structure.

---

## Table of Contents

1. [Core Architecture](#core-architecture)
2. [Authentication System](#authentication-system)
3. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
4. [Database Schema](#database-schema)
5. [API Architecture](#api-architecture)
6. [Deployment Architecture](#deployment-architecture)

---

## Core Architecture

### Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript 5.x, Tailwind CSS 4
- **Backend**: Next.js API Routes, Node.js 22+
- **Database**: PostgreSQL (primary), SQLite (desktop persistence)
- **Authentication**: Better Auth v1.x with OAuth 2.0 providers
- **Desktop**: Electron 35+, Better SQLite 3
- **ORM**: Drizzle ORM 0.x
- **Build Tools**: Turbopack, electron-builder

### High-Level Data Flow

```
User (Browser/Desktop)
  ↓
Next.js App Router + Proxy (i18n + Auth)
  ├── Route Protection (Session validation)
  ├── Permission Checks (RBAC)
  └── Request Validation (Zod schemas)
  ↓
API Routes (/api/*)
  ├── Authentication verification
  ├── Permission enforcement
  └── Business logic execution
  ↓
Drizzle ORM
  ↓
PostgreSQL Database (cloud) / SQLite (desktop)
```

### Deployment Modes

1. **Web Application** (draw.nulled.ai)
   - Next.js server-side rendering
   - PostgreSQL backend
   - OAuth authentication (Google, GitHub)
   - Multi-language support (EN, ZH, JA, ZH-Hant)

2. **Desktop Application** (Electron)
   - Bundled Next.js standalone server
   - Local SQLite persistence
   - Offline support with auto-sync
   - File system integration

---

## Authentication System

### Better Auth Integration

Canvas AIO uses Better Auth v1.x for authentication with the following configuration:

```typescript
// lib/auth.ts
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),

  // Strategies
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },

  // OAuth providers (conditional)
  socialProviders: {
    google: { enabled: !!env.GOOGLE_CLIENT_ID },
    github: { enabled: !!env.GITHUB_CLIENT_ID },
  },

  // Admin plugin for RBAC
  plugins: [
    admin({
      defaultRole: "editor",
      roles: {
        owner: { permissions: ["*"] },
        admin: { permissions: [/* admin-only */] },
        editor: { permissions: [/* create/edit */] },
        viewer: { permissions: ["diagram:view"] },
      },
    }),
  ],
})
```

### Session Management

- **Session Storage**: Secure, HttpOnly cookies
- **Session Duration**: 30 days (configurable)
- **Refresh Logic**: Automatic token refresh on expiration
- **Cookie Security**: SameSite=Lax, Secure flag for HTTPS

### OAuth Providers

- **Google OAuth**: Returns email, name, profile picture
- **GitHub OAuth**: Returns login, name, profile picture
- **Conditional Enablement**: Only enabled if credentials provided in environment

---

## Role-Based Access Control (RBAC)

### Role Hierarchy

Canvas AIO implements a 4-tier role hierarchy:

```
owner (100%)
  ↓
admin (90%)
  ↓
editor (60%, default)
  ↓
viewer (10%)
```

### Role Definitions

| Role | Description | Permissions | Use Case |
|------|-------------|-------------|----------|
| **owner** | Full system control | All resources, all actions | Project/account owner |
| **admin** | Administrative functions | User management, ban/unban, settings | Site administrator |
| **editor** | Content creation (default) | Create/edit/delete diagrams, share | Standard user |
| **viewer** | Read-only access | View diagrams (when shared) | Guest/read-only user |

### Resource Permissions

Three core resources with granular permissions:

#### 1. Diagram Resource
```typescript
{
  create: ["owner", "admin", "editor"],      // Can create new diagrams
  edit: ["owner", "admin", "editor"],        // Can edit own diagrams
  view: ["owner", "admin", "editor", "viewer"], // Can view own diagrams
  delete: ["owner", "admin", "editor"],      // Can delete own diagrams
  share: ["owner", "admin", "editor"],       // Can share diagrams (Sprint 3)
}
```

#### 2. User Resource
```typescript
{
  manage: ["owner", "admin"],          // Can change roles, ban/unban
  list: ["owner", "admin"],            // Can view all users
  view: ["owner", "admin", "*"],       // Can view self, admins view all
}
```

#### 3. Settings Resource
```typescript
{
  read: ["owner", "admin"],    // Can read app settings
  write: ["owner"],            // Only owner can modify settings
}
```

### Permission Enforcement

#### Server-Side (Mandatory)

All API routes validate permissions before executing business logic:

```typescript
// app/api/chat/route.ts
export async function POST(request: NextRequest) {
  const { session } = await auth.api.getSession({
    headers: request.headers,
  })

  // Enforce permission - throws PermissionError if denied
  requirePermission(session, "diagram", "create")

  // Process request...
}
```

#### Client-Side (UX Only)

Client-side checks hide disabled UI for better UX, but **never enforce security**:

```typescript
// components/canvas.tsx
import { usePermissions } from "@/hooks/use-permissions"

export function Canvas() {
  const { canCreateDiagram, canEditDiagram } = usePermissions()

  return (
    <>
      {canCreateDiagram && <CreateButton />}
      {canEditDiagram && <EditToolbar />}
    </>
  )
}
```

### Owner Bootstrap Process

The first user to sign up with the email matching `ADMIN_EMAIL` env var is automatically assigned the `owner` role:

```typescript
// lib/auth.ts - databaseHooks
user: {
  create: {
    after: async (user) => {
      if (user.email === process.env.ADMIN_EMAIL) {
        await db.update(usersTable)
          .set({ role: "owner" })
          .where(eq(usersTable.id, user.id))
      }
    },
  },
}
```

### Permission Error Handling

Invalid permission attempts return standardized HTTP errors:

```typescript
class PermissionError extends Error {
  statusCode: 401 | 403  // 401 = unauthenticated, 403 = forbidden

  constructor(message: string, statusCode = 403) {
    super(message)
    this.statusCode = statusCode
  }
}

// Usage
if (!hasPermission) {
  throw new PermissionError("Insufficient permissions", 403)
}
```

### User Management

#### Admin Panel (`/admin`)

Admins and owners can manage users through the admin panel:

- **View Users**: List all registered users with roles
- **Change Roles**: Dropdown to assign editor/viewer/admin roles
- **Ban Users**: Temporarily or permanently ban users
- **Ban Expiration**: Automatic unban after expiration date

```typescript
// components/admin/user-management.tsx
- Search/filter by email
- Pagination for large user lists
- Role change with confirmation
- Ban with reason and optional expiration
- Real-time UI updates with toast notifications
```

#### Impersonation Tracking

Admin actions are tracked for audit purposes:

```typescript
session.impersonatedBy  // Who impersonated this session (if applicable)
user.impersonatedBy     // Last admin who impersonated this user
```

### Future Extensions (Sprint 3)

- **Diagram-Level ACLs**: Share specific diagrams with specific users
- **Custom Roles**: Allow owners to define custom roles
- **Permission Inheritance**: Resource hierarchies for delegation
- **Audit Logging**: Full history of permission changes and access

---

## Database Schema

### User Table

```sql
CREATE TABLE "user" (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  emailVerified BOOLEAN DEFAULT FALSE,
  name TEXT,
  image TEXT,

  -- RBAC fields (Phase 4 Sprint 2)
  role TEXT DEFAULT 'editor',  -- owner | admin | editor | viewer
  banned BOOLEAN DEFAULT FALSE,
  banReason TEXT,
  banExpires TIMESTAMP,

  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Session Table

```sql
CREATE TABLE "session" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,

  -- RBAC fields (Phase 4 Sprint 2)
  impersonatedBy TEXT,  -- Admin who impersonated this session

  expiresAt TIMESTAMP NOT NULL,
  token TEXT UNIQUE NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

### Account Table (OAuth Linking)

```sql
CREATE TABLE "account" (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,

  accountId TEXT,
  provider TEXT,
  providerAccountId TEXT,
  refreshToken TEXT,
  accessToken TEXT,
  expiresAt TIMESTAMP,

  UNIQUE(provider, providerAccountId)
)
```

### Verification Table (Email Tokens)

```sql
CREATE TABLE "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT,

  token TEXT UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

---

## API Architecture

### Authentication Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/signin` | POST | Email/password login |
| `/api/auth/signup` | POST | Email/password registration |
| `/api/auth/callback/:provider` | GET | OAuth callback handler |
| `/api/auth/signout` | POST | Session termination |
| `/api/auth/session` | GET | Current session info |
| `/api/auth/verify-email` | POST | Verify email token |

### Chat/Diagram Endpoints

| Endpoint | Method | Permission | Purpose |
|----------|--------|-----------|---------|
| `/api/chat` | POST | diagram:create | Send chat message, create diagram |
| `/api/chat/:id` | GET | diagram:view | Retrieve specific diagram |
| `/api/chat/:id` | PUT | diagram:edit | Update diagram content |
| `/api/chat/:id` | DELETE | diagram:delete | Delete diagram |

### Admin Endpoints

| Endpoint | Method | Permission | Purpose |
|----------|--------|-----------|---------|
| `/api/admin/users` | GET | user:list | List all users |
| `/api/admin/users/:id/role` | PUT | user:manage | Change user role |
| `/api/admin/users/:id/ban` | POST | user:manage | Ban user |
| `/api/admin/users/:id/unban` | POST | user:manage | Unban user |

### Error Responses

```json
{
  "error": "Insufficient permissions",
  "statusCode": 403,
  "details": {
    "required": "diagram:create",
    "userRole": "viewer"
  }
}
```

---

## Deployment Architecture

### Web Deployment (draw.nulled.ai)

```
CDN (Cloudflare)
  ↓
Next.js Server (node16+)
  ├── Server-Side Rendering
  ├── API Routes
  └── Static assets
  ↓
PostgreSQL Database
  └── User data, sessions, diagrams
```

### Desktop Deployment (Electron)

```
Electron Main Process
  ├── Window management
  ├── File system integration
  └── Better SQLite persistence
  ↓
Next.js Standalone Server
  └── Bundled in .next/standalone
  ↓
SQLite Database (Local)
  └── Desktop-specific persistence
```

### Security Layers

1. **Network**: HTTPS/TLS encryption in transit
2. **Session**: Secure cookies with HttpOnly + SameSite
3. **Database**: PostgreSQL with connection pooling + SSL
4. **API**: Rate limiting, CORS validation, CSRF protection
5. **Authorization**: Server-side permission checks on all sensitive operations

---

## Development & Maintenance

### Adding New Permissions

1. Define permission in `lib/permissions.ts`
2. Add resource/action to RBAC config in `lib/auth.ts`
3. Call `requirePermission()` in API handler
4. Add client-side check in relevant component
5. Update translations in `lib/i18n/dictionaries/*.json`
6. Add tests in `tests/unit/permissions.test.ts`

### Key Files

- **RBAC Core**: `lib/permissions.ts`, `hooks/use-permissions.ts`
- **Auth Config**: `lib/auth.ts`, `lib/auth-client.ts`
- **Database**: `lib/db/schema.ts`, `lib/db/index.ts`
- **Admin UI**: `app/[lang]/(auth)/admin/`, `components/admin/`
- **Type Definitions**: `lib/user-id.ts`

---

*Last updated: 2026-02-08*
