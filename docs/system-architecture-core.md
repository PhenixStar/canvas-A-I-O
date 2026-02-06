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
