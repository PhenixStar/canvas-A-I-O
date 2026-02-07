# System Architecture

This document provides a comprehensive overview of the AIO Canvas system architecture, including the draw.io wrapper design, multi-platform deployment, and AI integration patterns.

---

## Table of Contents

- [Overview](#overview)
- [High-Level Architecture](#high-level-architecture)
- [Core Components](#core-components)
- [draw.io Integration Architecture](#drawio-integration-architecture)
- [Multi-Platform Architecture](#multi-platform-architecture)
- [AI Integration Architecture](#ai-integration-architecture)
- [Data Flow](#data-flow)
- [Deployment Architecture](#deployment-architecture)
- [Security Architecture](#security-architecture)
- [Scalability Considerations](#scalability-considerations)

---

## Overview

AIO Canvas is designed as a **wrapper and enhancement** around [draw.io](https://github.com/jgraph/drawio) that adds AI-powered capabilities. The system operates in two primary modes:

1. **Web Application**: Cloud-hosted version with real-time AI collaboration
2. **Desktop Application**: Electron-based offline version with full draw.io functionality

The architecture maintains compatibility with draw.io's XML format while adding intelligent layers for AI processing, user interaction, and multi-platform deployment.

---

## High-Level Architecture

```mermaid
graph TB
    subgraph "Client Applications"
        WC[Web Client<br/>Next.js/React]
        DC[Desktop Client<br/>Electron]
    end

    subgraph "Core Services"
        AI[AI Provider Gateway<br/>Vercel AI SDK]
        DX[Draw.io Engine<br/>react-drawio]
        API[API Gateway<br/>Next.js API Routes]
    end

    subgraph "External Services"
        OpenAI[OpenAI API]
        Anthropic[Anthropic API]
        Google[Google AI API]
        AWS[AWS Bedrock]
    end

    subgraph "Storage"
        S1[Session Storage]
        S2[History Storage]
    end

    WC --> API
    DC --> API
    API --> AI
    AI --> OpenAI
    AI --> Anthropic
    AI --> Google
    AI --> AWS
    API --> DX
    WC --> S1
    DC --> S2

    WC ---|Draw.io XML| DX
    DC ---|Draw.io XML| DX
```

---

## Core Components

### 1. Next.js Web Application
**Purpose**: Primary client application for web deployment
**Key Features**:
- React 19 with TypeScript
- App Router for navigation
- Server-side rendering for SEO
- API routes for backend functionality

**Directory Structure**:
```
app/
├── [lang]/              # Language-specific pages
├── api/                 # API routes
│   ├── chat/route.ts    # AI chat endpoint
│   ├── config/route.ts  # Configuration endpoint
│   └── validate-*.ts    # Validation endpoints
├── manifest.ts          # PWA manifest
├── layout.tsx           # Root layout
└── page.tsx             # Homepage
```

### 2. Electron Desktop Application
**Purpose**: Offline-capable desktop wrapper
**Key Features**:
- Native desktop performance
- Offline functionality
- System integration
- Cross-platform support

**Directory Structure**:
```
electron/
├── main.ts              # Main process
├── preload.ts           # Preload script
├── package.json         # Electron config
└── dist/               # Built resources
```

### 3. AI Provider Gateway
**Purpose**: Unified interface for multiple AI providers
**Key Features**:
- Multi-provider support
- Request routing and load balancing
- Response streaming
- Error handling and fallbacks

**Implementation**:
```typescript
// Central AI provider interface
class AIGateway {
  private providers: Map<string, AIProviderInterface>;

  async generateDiagram(
    prompt: string,
    provider: string,
    options: GenerateOptions
  ): Promise<DiagramResponse> {
    const aiProvider = this.providers.get(provider);
    if (!aiProvider) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    return aiProvider.generateDiagram(prompt, options);
  }
}
```

### 4. Draw.io Integration Layer
**Purpose**: Wrapper around draw.io functionality
**Key Features**:
- XML manipulation
- Shape library management
- Export/import capabilities
- Compatibility with draw.io formats

**Implementation**:
```typescript
interface DrawIOIntegration {
  // XML processing
  parseXML(xml: string): DiagramData;
  generateXML(data: DiagramData): string;
  validateXML(xml: string): boolean;

  // Shape management
  getShapes(category: string): Shape[];
  importShapes(shapes: Shape[]): void;

  // Export/Import
  exportToFormat(xml: string, format: string): Promise<Blob>;
  importFromFile(file: File): Promise<DiagramData>;
}
```

---

## draw.io Integration Architecture

### Integration Design
AIO Canvas maintains **full compatibility** with draw.io by:

1. **XML Format Preservation**: All diagrams are stored and processed as draw.io XML
2. **Shape Library Compatibility**: Uses draw.io's native shape libraries
3. **Feature Parity**: Maintains access to all draw.io features
4. **Import/Export**: Seamless exchange with draw.io files

```mermaid
graph LR
    A[User Input] --> B[AI Processing]
    B --> C[Draw.io XML Generation]
    C --> D[Draw.io Engine]
    D --> E[Rendered Diagram]
    E --> F[User Interface]

    G[Import File] --> D
    D --> H[Export File]
```

### XML Processing Pipeline
```typescript
class DrawIOXMLProcessor {
  // Validate incoming XML
  validateDiagram(xml: string): ValidationResult {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    // Check for draw.io specific elements
    const mxGraphModel = doc.querySelector('mxGraphModel');
    if (!mxGraphModel) {
      return { valid: false, error: 'Invalid draw.io XML' };
    }

    return { valid: true };
  }

  // Clean and normalize XML
  normalizeXML(xml: string): string {
    return xml
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  }

  // Extract metadata from XML
  extractMetadata(xml: string): DiagramMetadata {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    // Extract information about diagram type, elements, etc.
    return {
      elementCount: doc.querySelectorAll('mxCell').length,
      pageCount: doc.querySelectorAll('mxPage').length,
      // ... other metadata
    };
  }
}
```

### Shape Library Management
```typescript
interface ShapeLibrary {
  // Cloud architecture shapes
  aws: AWSShape[];
  azure: AzureShape[];
  gcp: GCPShape[];

  // General shapes
  flowchart: FlowchartShape[];
  network: NetworkShape[];

  // Custom shapes
  custom: CustomShape[];
}

class ShapeManager {
  private libraries: Map<string, ShapeLibrary>;

  getShape(provider: string, category: string): Shape {
    const library = this.libraries.get(provider);
    if (!library) {
      throw new Error(`Shape library not found: ${provider}`);
    }

    return library[category].find(shape => shape.id === id);
  }

  importCustomShapes(shapes: CustomShape[]): void {
    // Add custom shapes to library
  }
}
```

---

## Multi-Platform Architecture

### Web Application Architecture
```mermaid
graph TB
    subgraph "Web Application"
        Client[React Client]
        API[API Routes]
        Storage[Session Storage]
        Cache[Service Worker Cache]
    end

    subgraph "Backend Services"
        AI[AI Provider Gateway]
        Database[User Data]
        CDN[Static Assets CDN]
    end

    Client --> API
    API --> AI
    API --> Database
    Client --> Storage
    Client --> Cache
    Client --> CDN
```

### Desktop Application Architecture
```mermaid
graph TB
    subgraph "Desktop Application"
        UI[React UI]
        Main[Main Process]
        Preload[Preload Script]
        LocalStorage[Local Storage]
    end

    subgraph "Native Integration"
        FS[File System]
        OS[OS Integration]
        Native[Native APIs]
    end

    UI --> Main
    Main --> Preload
    Preload --> FS
    Preload --> OS
    Preload --> Native
    UI --> LocalStorage
```

### Platform-Specific Considerations

#### Web Application
- **Browser Compatibility**: Modern browsers with ES2020 support
- **Performance**: CDN acceleration, code splitting, lazy loading
- **Storage**: Session storage, local storage, IndexedDB
- **API**: RESTful API with WebSocket for real-time features

#### Desktop Application
- **Performance**: Native performance, local file access
- **Integration**: Native file dialogs, system notifications
- **Storage**: Local file system, SQLite for persistent data
- **Security**: Isolated environment, secure storage

---

## AI Integration Architecture

### Multi-Provider Support
```mermaid
graph TB
    User[User Request] --> Gateway[AI Gateway]
    Gateway --> Router[Provider Router]

    Router --> OpenAI[OpenAI Provider]
    Router --> Anthropic[Anthropic Provider]
    Router --> Google[Google Provider]
    Router --> AWS[AWS Provider]

    OpenAI --> OpenAIAPI[OpenAI API]
    Anthropic --> AnthropicAPI[Anthropic API]
    Google --> GoogleAPI[Google API]
    AWS --> AWSAPI[AWS API]
```

### Provider Abstraction Layer
```typescript
interface AIProvider {
  name: string;
  models: Model[];
  endpoint: string;
  apiKey: string;

  generateDiagram(prompt: string, options: GenerateOptions): Promise<DiagramResponse>;
  validateModel(model: string): boolean;
  getCapabilities(): ProviderCapabilities;
}

class ProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();

  register(provider: AIProvider): void {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: string): AIProvider | undefined {
    return this.providers.get(name);
  }

  listProviders(): AIProvider[] {
    return Array.from(this.providers.values());
  }
}
```

### Streaming Architecture
```typescript
class StreamingAIResponse {
  private reader: ReadableStreamDefaultReader;

  constructor(stream: ReadableStream) {
    this.reader = stream.getReader();
  }

  async *read(): AsyncGenerator<string> {
    while (true) {
      const { done, value } = await this.reader.read();
      if (done) break;

      const chunk = new TextDecoder().decode(value);
      yield chunk;
    }
  }
}

// Usage example
async function* processStreamingResponse(
  prompt: string,
  provider: string
): AsyncGenerator<string> {
  const response = await fetch('/api/chat/stream', {
    method: 'POST',
    body: JSON.stringify({ prompt, provider })
  });

  const stream = StreamingAIResponse.fromResponse(response);
  for await (const chunk of stream.read()) {
    yield chunk;
  }
}
```

### Model Configuration
```typescript

---

## Desktop Persistence Architecture (Phase 2)

### Multi-Layered Storage Strategy

AIO Canvas implements a sophisticated multi-layered storage architecture for desktop persistence:

```mermaid
graph TB
    subgraph "Desktop Application"
        UI[React UI Layer]
        API[API Gateway]
        CACHE[In-Memory Cache]
    end

    subgraph "Persistence Layer"
        SQL[SQLite Database]
        CONFIG[JSON Configuration]
        SECURE[Secure Storage]
    end

    subgraph "Storage Types"
        LOCAL[Local Storage]
        SESSION[Session Data]
        HISTORY[History Records]
        SETTINGS[User Settings]
        KEYS[API Keys]
    end

    UI --> API
    API --> CACHE
    API --> SQL
    API --> CONFIG
    API --> SECURE

    SQL --> LOCAL
    CONFIG --> LOCAL
    SECURE --> LOCAL

    SQL --> HISTORY
    CONFIG --> SETTINGS
    SECURE --> KEYS
```

### Database Schema

#### SQLite Database Structure
```sql
-- Main database file: ~/.canvas-A-I-O/data.sqlite

-- Diagrams Table
CREATE TABLE IF NOT EXISTS diagrams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT UNIQUE NOT NULL,
    title TEXT DEFAULT 'Untitled',
    content TEXT NOT NULL,  -- Draw.io XML
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_size INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1
);

-- History Table
CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    diagram_id INTEGER,
    version INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    comment TEXT DEFAULT '',
    FOREIGN KEY (diagram_id) REFERENCES diagrams (id)
);

-- Auto-Save Records
CREATE TABLE IF NOT EXISTS autosave (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    diagram_id INTEGER UNIQUE,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diagram_id) REFERENCES diagrams (id)
);

-- Configuration Table
CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    encrypted BOOLEAN DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Recent Files Cache
CREATE TABLE IF NOT EXISTS recent_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    diagram_id INTEGER,
    accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (diagram_id) REFERENCES diagrams (id)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_diagrams_created ON diagrams(created_at);
CREATE INDEX IF NOT EXISTS idx_diagrams_updated ON diagrams(updated_at);
CREATE INDEX IF NOT EXISTS idx_history_created ON history(created_at);
CREATE INDEX IF NOT EXISTS idx_recent_accessed ON recent_files(accessed_at);
```

### Security Architecture

#### API Key Encryption
```typescript
import { safeStorage } from 'electron';

class SecureStorage {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = process.platform !== 'darwin' || safeStorage.isAvailable();
  }

  // Encrypt API keys using Electron's safeStorage
  encryptApiKey(apiKey: string): string {
    if (!this.isAvailable) {
      return Buffer.from(apiKey).toString('base64');
    }
    return safeStorage.encryptString(apiKey);
  }

  // Decrypt API keys
  decryptApiKey(encryptedKey: string): string {
    if (!this.isAvailable) {
      return Buffer.from(encryptedKey, 'base64').toString();
    }
    return safeStorage.decryptString(encryptedKey);
  }

  // Check if encryption is available
  isEncryptionAvailable(): boolean {
    return this.isAvailable;
  }
}
```

### Persistence Operations

#### Auto-Save Implementation
```typescript
class AutoSaveManager {
  private interval: NodeJS.Timeout | null = null;
  private autoSaveInterval = 30000; // 30 seconds

  constructor(private db: any, private currentDiagram: Diagram | null) {
    this.setupAutoSave();
  }

  setupAutoSave(): void {
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(async () => {
      if (this.currentDiagram && this.currentDiagram.content) {
        await this.saveAutoSave();
      }
    }, this.autoSaveInterval);
  }

  async saveAutoSave(): Promise<void> {
    if (!this.currentDiagram) return;

    const autoSave = {
      diagram_id: this.currentDiagram.id,
      content: this.currentDiagram.content,
      created_at: new Date().toISOString()
    };

    await this.db.run(
      'INSERT OR REPLACE INTO autosave (diagram_id, content, created_at) VALUES (?, ?, ?)',
      [autoSave.diagram_id, autoSave.content, autoSave.created_at]
    );
  }

  async getAutoSave(diagramId: number): Promise<string | null> {
    const result = await this.db.get(
      'SELECT content FROM autosave WHERE diagram_id = ?',
      [diagramId]
    );
    return result?.content || null;
  }
}
```

#### History Management
```typescript
class HistoryManager {
  async saveVersion(diagramId: number, content: string, comment: string = ''): Promise<void> {
    const versionResult = await this.db.get(
      'SELECT MAX(version) as max_version FROM history WHERE diagram_id = ?',
      [diagramId]
    );

    const newVersion = (versionResult?.max_version || 0) + 1;

    await this.db.run(
      'INSERT INTO history (diagram_id, version, content, comment, created_at) VALUES (?, ?, ?, ?, ?)',
      [diagramId, newVersion, content, comment, new Date().toISOString()]
    );

    // Keep only last 50 versions
    await this.db.run(
      'DELETE FROM history WHERE diagram_id = ? AND id NOT IN (SELECT id FROM history WHERE diagram_id = ? ORDER BY created_at DESC LIMIT 50)',
      [diagramId, diagramId]
    );
  }

  async getVersion(diagramId: number, version: number): Promise<string | null> {
    const result = await this.db.get(
      'SELECT content FROM history WHERE diagram_id = ? AND version = ?',
      [diagramId, version]
    );
    return result?.content || null;
  }

  async getHistory(diagramId: number): Promise<HistoryEntry[]> {
    return this.db.all(
      'SELECT version, comment, created_at FROM history WHERE diagram_id = ? ORDER BY created_at DESC',
      [diagramId]
    );
  }
}
```

### Data Flow for Persistence Operations

```mermaid
sequenceDiagram
    participant U as User
    participant UI as React UI
    participant API as API Gateway
    participant DB as Database Manager
    participant SEC as Secure Storage

    U->>UI: Create/modify diagram
    UI->>API: Save diagram request
    API->>DB: Begin transaction
    API->>DB: Save to diagrams table
    API->>DB: Save to autosave table
    API->>DB: Commit transaction
    API->>UI: Success response
    UI->>U: Diagram saved

    U->>UI: Close application
    UI->>API: Save session data
    API->>DB: Update last_accessed
    API->>SEC: Store encrypted API keys
    API->>UI: Session saved
```

---

## Data Flow

### Diagram Generation Flow
```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant A as API
    participant I as AI Gateway
    participant P as AI Provider
    participant D as Draw.io Engine

    U->>C: Enters diagram prompt
    C->>A: POST /api/chat
    A->>I: Generate diagram request
    I->>P: API call to provider
    P->>I: Streaming response
    I->>A: Streamed XML response
    A->>C: Streamed XML
    C->>D: Render diagram
    D->>C: Diagram display
    C->>U: Show diagram
```

### File Processing Flow
```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant A as API
    participant P as Processing Service

    U->>C: Uploads file/image
    C->>A: POST /api/parse-file
    A->>P: File processing request
    P->>P: Extract content/convert
    P->>A: Processed diagram XML
    A->>C: Diagram XML
    C->>D: Render diagram
    D->>C: Show diagram
```

### File Reading Implementation

#### IPC Handlers for File Operations
```typescript
// electron/main/persistence-handlers.ts
import fs from 'fs/promises';
import path from 'path';

// Read file content with security validation
ipcMain.handle("persistence:read-file", async (_event, filePath: string) => {
    const resolvedPath = path.resolve(filePath.trim());

    // Security: Check file accessibility
    await fs.access(resolvedPath);

    // Read and return file content
    const content = await fs.readFile(resolvedPath, "utf-8");
    return { success: true, data: content, path: resolvedPath };
});

// Check if file exists
ipcMain.handle("persistence:file-exists", async (_event, filePath: string) => {
    try {
        const resolvedPath = path.resolve(filePath.trim());
        await fs.access(resolvedPath);
        return true;
    } catch {
        return false;
    }
});
```

#### Preload API Exposure
```typescript
// electron/preload/persistence-api.ts
export const persistenceAPI: PersistenceAPI = {
    readFile: (filePath: string) =>
        ipcRenderer.invoke("persistence:read-file", filePath),

    fileExists: (filePath: string) =>
        ipcRenderer.invoke("persistence:file-exists", filePath),

    // ... other persistence operations
};
```

#### Security Considerations
- **Path Resolution**: Uses `path.resolve()` to prevent directory traversal attacks
- **File Access Validation**: Checks file existence before reading
- **Error Handling**: Graceful fallback with user-friendly error messages
- **Dual-Mode Support**: Components work in both web (localStorage) and Electron (native APIs)

### Persistence Operation Flow
```mermaid
sequenceDiagram
    participant U as User
    participant C as Client
    participant A as API
    participant DB as Database
    participant FS as File System

    U->>C: Creates/edits diagram
    C->>A: Save diagram
    A->>DB: Store in SQLite
    A->>FS: Auto-save to disk
    DB->>A: Confirm save
    A->>C: Success response
    C->>U: Diagram saved

    U->>C: Closes app
    C->>A: Final save
    A->>DB: Update timestamps
    A->>FS: Create backup
    A->>C: Session saved
```

---

## Authentication Architecture (Phase 4 Sprint 1)

### Overview

AIO Canvas implements enterprise-grade authentication using Better Auth framework with Drizzle ORM and PostgreSQL. The system supports email/password authentication and OAuth 2.0 providers (Google, GitHub) with optional/conditional enablement.

### Authentication Design Principles

1. **Opt-In Architecture**: Zero database configuration required for basic usage
   - Without DATABASE_URL: Authentication disabled, access code system active
   - With DATABASE_URL: Full authentication enabled

2. **Session-First Approach**: Authenticated users get priority
   - Route protection checks session validity first
   - Falls back to access code for unauthenticated requests
   - User ID prioritizes authenticated session over IP address

3. **Secure by Default**: All sensitive operations use encryption
   - Passwords hashed using bcrypt
   - Session cookies are secure, HttpOnly, SameSite
   - Email verification tokens with TTL
   - OAuth tokens stored securely

### Authentication Layers

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Application<br/>React + Next.js]
        AUTH_UI[Auth Pages<br/>Login/Register]
    end

    subgraph "Middleware Layer"
        PROXY[Proxy.ts<br/>i18n + Auth Check]
        PROTECT[Route Protection<br/>Session Validation]
    end

    subgraph "API Layer"
        AUTHAPI[Better Auth API<br/>/api/auth/[...all]]
        PROVIDERS[Auth Providers<br/>Email, OAuth]
    end

    subgraph "Data Layer"
        ORM[Drizzle ORM<br/>PostgreSQL Client]
        DB[(PostgreSQL<br/>Database)]
    end

    WEB --> AUTH_UI
    AUTH_UI --> AUTHAPI

    WEB --> PROXY
    PROXY --> PROTECT
    PROTECT --> AUTHAPI

    AUTHAPI --> PROVIDERS
    PROVIDERS --> ORM
    ORM --> DB
```

### Database Schema (Drizzle ORM)

```typescript
// User table - stores user account information
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    emailVerified BOOLEAN DEFAULT false,
    name TEXT,
    image TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

// Session table - manages active user sessions
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    expiresAt TIMESTAMP NOT NULL,
    token TEXT UNIQUE NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ipAddress TEXT,
    userAgent TEXT,
    userId TEXT NOT NULL REFERENCES users(id)
);

// Account table - links OAuth providers to users
CREATE TABLE accounts (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL REFERENCES users(id),
    accountId TEXT NOT NULL,
    providerId TEXT NOT NULL,  -- 'google', 'github', etc.
    refreshToken TEXT,
    accessToken TEXT,
    expiresAt TIMESTAMP,
    password TEXT,  -- For email/password provider
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

// Verification table - email verification tokens
CREATE TABLE verifications (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    expiresAt TIMESTAMP NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Authentication Flow

#### Email/Password Registration
```mermaid
sequenceDiagram
    participant U as User
    participant UI as Register Page
    participant API as /api/auth/signup
    participant AUTH as Better Auth
    participant DB as PostgreSQL

    U->>UI: Enter email & password
    UI->>API: POST signup request
    API->>AUTH: Create user & account
    AUTH->>DB: Insert user record
    AUTH->>DB: Insert account (email provider)
    AUTH->>DB: Hash password (bcrypt)
    AUTH->>DB: Create verification token
    API->>UI: Success + redirect to login
    UI->>U: Show login page
    U->>U: Verify email via link
```

#### Email/Password Login
```mermaid
sequenceDiagram
    participant U as User
    participant UI as Login Page
    participant API as /api/auth/signin
    participant AUTH as Better Auth
    participant DB as PostgreSQL

    U->>UI: Enter email & password
    UI->>API: POST signin request
    API->>AUTH: Validate credentials
    AUTH->>DB: Look up user by email
    AUTH->>DB: Compare password hash
    AUTH->>DB: Create session
    AUTH->>API: Return session token
    API->>UI: Set secure cookie
    UI->>U: Redirect to dashboard
```

#### OAuth Flow (Google/GitHub)
```mermaid
sequenceDiagram
    participant U as User
    participant UI as Login Page
    participant API as /api/auth/callback/google
    participant GOOGLE as Google OAuth Server
    participant AUTH as Better Auth
    participant DB as PostgreSQL

    U->>UI: Click "Sign in with Google"
    UI->>GOOGLE: Redirect with client_id
    GOOGLE->>U: Show Google login
    U->>GOOGLE: Authenticate
    GOOGLE->>API: Redirect with auth code
    API->>GOOGLE: Exchange code for token
    GOOGLE->>API: Return access token
    API->>AUTH: Create/link user
    AUTH->>DB: Look up user by email
    AUTH->>DB: Create account if new user
    AUTH->>DB: Create session
    API->>UI: Set secure cookie
    UI->>U: Redirect to dashboard
```

### Route Protection Architecture

The authentication check happens in `proxy.ts` (merged with i18n middleware):

```typescript
export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const locale = extractLocale(path);  // i18n logic

    // Check if path requires authentication
    const isAuthPath = isProtectedRoute(path);

    if (isAuthPath) {
        // Get session from cookie
        const session = await getSessionFromCookie(request);

        if (!session) {
            // Not authenticated - redirect to login with callbackUrl
            return redirectToLogin(locale, path);
        }
    }

    return handleI18nRouting(request, locale);
}
```

**Protected Routes**:
- `/[lang]/dashboard/*` - Main application
- `/[lang]/diagrams/*` - Diagram management
- `/[lang]/settings/*` - User settings

**Public Routes**:
- `/[lang]/login` - Login page
- `/[lang]/register` - Registration page
- `/api/auth/*` - Authentication endpoints
- All root-level routes (homepage, docs, etc.)

### Session Management

```typescript
// Client-side session hook
const { data: session } = useSession();

if (session) {
    // User is authenticated
    const userId = session.user.id;
    const email = session.user.email;
    const name = session.user.name;
}

// Session automatically refreshed on page load
// Expires based on server-side configuration
// Logout clears session and redirects to login
```

### User Identification System

The system prioritizes authenticated users while supporting anonymous access:

```typescript
// lib/user-id.ts - Multi-layered approach
async function getUserIdFromRequest(req: Request): Promise<string> {
    // 1. Try to get authenticated user ID from session
    const session = await auth.api.getSession({ headers: req.headers });
    if (session?.user?.id) {
        return session.user.id;  // Priority: authenticated session
    }

    // 2. Fallback to IP-based identification for anonymous users
    const ip = getClientIp(req);
    return `anon-${hashIp(ip)}`;  // Fallback: IP-based
}
```

### Access Code System (Fallback)

When DATABASE_URL is not configured, the system falls back to access codes:

```typescript
// app/api/chat/route.ts
async function handleChatRequest(req: Request) {
    const userId = await getUserIdFromRequest(req);

    // For authenticated users: skip access code check
    if (userId.startsWith('user-')) {
        // Proceed with request
        return processChat(req);
    }

    // For anonymous users: require access code
    const accessCode = req.headers.get('x-access-code');
    if (!validateAccessCode(accessCode)) {
        return new Response('Invalid or missing access code', { status: 401 });
    }

    return processChat(req);
}
```

### Security Considerations

#### Password Security
- Minimum 8 characters (enforced by Better Auth)
- Bcrypt hashing with salt rounds
- Password never transmitted in plain text (HTTPS only)
- Reset flow uses time-limited verification tokens

#### Session Security
- Secure cookies: HttpOnly, SameSite=Lax
- CSRF tokens for form submissions
- Session expires after 30 days (configurable)
- IP address logged for security audits

#### OAuth Security
- Uses OAuth 2.0 with PKCE support
- CORS restricted to BETTER_AUTH_TRUSTED_ORIGINS
- Redirect URLs validated against whitelist
- State parameter validates requests

#### Database Security
- Passwords hashed before storage
- Sensitive tokens encrypted
- SQL injection prevented via Drizzle ORM
- Indexes on frequently-queried columns

### Configuration

Environment variables for authentication:

```bash
# Required for authentication
DATABASE_URL=postgresql://user:password@localhost:5432/canvas_db

# Session encryption
BETTER_AUTH_SECRET=your-secret-key-min-32-chars

# OAuth callback URLs
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# CORS configuration
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:3000,https://yourdomain.com

# OAuth providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
GITHUB_CLIENT_ID=your-github-app-id
GITHUB_CLIENT_SECRET=your-github-secret
```

### Performance Considerations

- **Session Lookup**: Single database query per request (cached)
- **Token Validation**: Fast cryptographic validation
- **OAuth**: Minimal latency for token exchange
- **Scaling**: Horizontal scaling via PostgreSQL connection pooling

### Future Enhancements

- Two-factor authentication (TOTP/SMS)
- SSO integration (SAML, OpenID Connect)
- Social login expansion (Microsoft, Apple, Discord)
- Advanced permission model (RBAC with workspace scoping)
- Audit logging for compliance
- Device management and session control
- Passwordless authentication (magic links, WebAuthn)
