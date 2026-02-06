# Codebase Summary

## Project Identity

**Canvas-A-I-O** (AIO Canvas) is an AI-powered wrapper around [draw.io](https://github.com/jgraph/drawio) that adds natural language diagram generation capabilities. It can also function as an offline desktop application similar to [drawio-desktop](https://github.com/jgraph/drawio-desktop).

## Relationship to Upstream Projects

### draw.io Integration
- **Base**: Embeds draw.io editor via `react-drawio` component
- **Deployment**: Uses `https://embed.diagrams.net` or local files (offline)
- **XML Manipulation**: Direct programmatic control of diagram XML
- **Libraries**: Access to all draw.io shape libraries (AWS, Azure, GCP, etc.)

### Desktop Capabilities
- **Electron**: Cross-platform desktop application
- **Offline Mode**: Bundled draw.io files for offline use
- **Auto-updates**: Built-in update mechanism
- **Native Features**: File system access, menu integration

## Technology Stack

### Frontend
- **Next.js 16.x**: App Router with standalone output
- **React 19.1.2**: Latest React with TypeScript
- **Tailwind CSS 4**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Vercel AI SDK**: Streaming AI responses

### AI Providers
Multi-provider support with unified API:
- OpenAI (o1, o3, gpt-4, etc.)
- Anthropic Claude (extended thinking)
- AWS Bedrock (enterprise models)
- Google AI / Vertex AI (Gemini)
- Azure OpenAI
- DeepSeek, OpenRouter, Ollama, and more

### Desktop
- **Electron 39.2.7**: Desktop wrapper
- **Auto-updater**: Seamless updates

### Deployment
- **Vercel**: Primary web deployment
- **Cloudflare Workers**: Edge deployment (OpenNext)
- **Docker**: Containerized deployment
- **Electron Builder**: Desktop builds

## Directory Structure

```
canvas-A-I-O/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   │   ├── chat/                 # AI chat streaming
│   │   ├── config/               # Configuration management
│   │   ├── server-models/        # Server-side AI models
│   │   └── validate-*/           # Validation endpoints
│   └── [lang]/                   # Localized routes (en, cn, ja)
├── components/                   # React components
│   ├── chat/                     # Chat interface
│   │   ├── chat-panel.tsx       # Main chat UI
│   │   └── model-config.tsx     # AI model selection
│   ├── ai-elements/              # AI-specific components
│   └── ui/                       # Base UI components
├── lib/                          # Utilities & configs
│   ├── ai/                       # AI provider integrations
│   │   ├── providers/            # Provider implementations
│   │   └── tools/                # AI tool definitions
│   ├── db/                       # Database (DynamoDB)
│   └── utils.ts                  # Helper functions
├── contexts/                     # React contexts
│   └── diagram-context.tsx       # Diagram state management
├── electron/                     # Electron desktop app
│   ├── main.ts                   # Electron main process
│   └── preload.ts                # Preload scripts
├── packages/                     # Additional packages
│   ├── mcp-server/               # Model Context Protocol server
│   └── claude-plugin/            # Claude integration
├── edge-functions/               # Cloudflare Workers
├── docs/                         # Documentation
│   ├── en/                       # English docs
│   ├── cn/                       # Chinese docs
│   └── ja/                       # Japanese docs
└── resources/                    # Static resources
```

## Core Components

### 1. Diagram Context (`contexts/diagram-context.tsx`)

Central state management for diagrams:

```typescript
interface DiagramContextValue {
  xml: string;              // Current diagram XML
  setXml: (xml: string) => void;
  history: string[];        // Version history
  redoStack: string[];      // Redo stack
  exportDiagram: () => void;
  saveDiagram: () => void;
}
```

**Key Features**:
- Undo/redo with version tracking
- Export to PNG, SVG, PDF
- Save to server/local storage
- Direct XML manipulation

### 2. Chat Panel (`components/chat/chat-panel.tsx`)

AI chat interface for diagram commands:

**Features**:
- Streaming responses with Vercel AI SDK
- File upload (images, PDFs, URLs)
- Model configuration dialog
- Message history
- Multi-language support

**Tool Calling**:
AI can use tools to manipulate diagrams:
- `display_diagram`: Create new diagram
- `edit_diagram`: Modify existing by element ID
- `append_diagram`: Continue truncated response
- `get_shape_library`: Access shape docs

### 3. Draw.io Integration (`components/drawio-board.tsx`)

React wrapper around draw.io:

```typescript
<DrawioBoard
  xml={diagramXml}
  onChange={handleXmlChange}
  config={{
    // Disable save/exit (handled by wrapper)
    noSave: true,
    noExit: true,
    // Custom libraries
    libraries: [...]
  }}
/>
```

**Integration Pattern**:
1. Embed draw.io via iframe or React component
2. Exchange diagram XML via postMessage or props
3. Apply AI-generated XML programmatically
4. Export modified XML back to wrapper

## AI Implementation

### Tool System

AI models use tool calling to manipulate diagrams:

```typescript
const tools = {
  display_diagram: {
    description: "Create or update diagram",
    parameters: z.object({
      xml: z.string(),
      explanation: z.string().optional()
    })
  },
  edit_diagram: {
    description: "Modify specific element",
    parameters: z.object({
      elementId: z.string(),
      updates: z.object({...})
    })
  }
};
```

### Prompt Engineering

**System Prompt**:
```typescript
You are an AI diagram assistant. Use the display_diagram tool to create
diagrams in draw.io XML format. Support AWS, Azure, GCP, and standard
flowchart libraries. Animate connectors with flowAnimation=1.
```

**Context Management**:
- Current diagram XML passed as context
- Version history for incremental edits
- User preferences (libraries, styles)

### Streaming Responses

Vercel AI SDK for real-time streaming:

```typescript
const stream = await streamText({
  model: selectedModel,
  messages,
  tools,
  onToolCall: async (toolCall) => {
    // Execute tool (create/edit diagram)
    if (toolCall.toolName === 'display_diagram') {
      setXml(toolCall.args.xml);
    }
  }
});
```

## Desktop Architecture

### Electron Main Process

```typescript
// electron/main.ts
app.on('ready', () => {
  createWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      // Load draw.io from local files for offline
      local: true
    }
  });
});
```

**Offline Support**:
- Bundle draw.io files in `resources/`
- Load from `file://` protocol
- Disable online-only features

### Preload Scripts

Bridge between renderer and main process:

```typescript
// electron/preload.ts
window.electronAPI = {
  saveDiagram: (xml) => ipcRenderer.invoke('save-diagram', xml),
  openFile: () => ipcRenderer.invoke('open-file'),
  getDrawioUrl: () => 'file://' + path.join(__dirname, 'drawio/index.html')
};
```

## API Endpoints

### `/api/chat` (POST)

Main AI chat endpoint with streaming:

**Request**:
```typescript
{
  messages: Array<{role: 'user' | 'assistant', content: string}>,
  model: {
    provider: 'openai' | 'anthropic' | ...,
    name: 'gpt-4' | 'claude-3-opus' | ...,
    apiKey: string // optional, user-provided
  },
  quota?: {
    userId: string,
    maxRequests: number,
    maxTokens: number
  }
}
```

**Response**: Server-Sent Events (SSE) stream

### `/api/config` (GET)

Server-side configuration:

```typescript
{
  serverModels: Array<{
    provider: string,
    name: string,
    apiKey: string // encrypted
  }>,
  features: {
    enableReasoning: boolean,
    enablePromptCaching: boolean
  }
}
```

### Validation Endpoints

- `/api/validate-diagram`: Check XML validity
- `/api/validate-model`: Verify model capabilities
- `/api/verify-access-code`: Check access code

## Configuration

### Environment Variables

```bash
# AI Provider Keys (optional, for server-side models)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
AWS Bedrock credentials via IAM

# Features
NEXT_PUBLIC_ENABLE_REASONING=true
NEXT_PUBLIC_ENABLE_PROMPT_CACHING=true

# Deployment
NEXT_PUBLIC_DRAWIO_URL=https://embed.diagrams.net
NEXT_PUBLIC_ENABLE_OFFLINE=false

# Quota Management (optional)
DYNAMODB_TABLE=quotas
```

### Multi-Model Support

**Server-side models** (configured by admin):
```typescript
// lib/server-models.ts
export const serverModels = [
  {
    provider: 'openai',
    name: 'gpt-4',
    apiKey: process.env.OPENAI_API_KEY,
    features: ['reasoning', 'vision']
  },
  // ...
];
```

**Client-side models** (user-provided keys):
- Stored in localStorage
- Encrypted at rest
- Never sent to server

## Security Considerations

### Input Validation
- XML sanitization (prevent XXE attacks)
- Path traversal checks
- File type validation

### API Key Protection
- Server keys never exposed to client
- User keys encrypted in storage
- DynamoDB for quota tracking

### SSRF Protection
- Allowlist for external URLs
- Timeout enforcement
- Content-type validation

## Performance Optimizations

### Prompt Caching
```typescript
const cached = await cache.get(promptHash);
if (cached) return cached;

const result = await generateDiagram(prompt);
await cache.set(promptHash, result, { ttl: 3600 });
```

### Streaming
- Real-time AI responses
- Progressive diagram updates
- Reduced perceived latency

### Code Splitting
- Dynamic imports for AI providers
- Route-based splitting (App Router)
- Component lazy loading

## Testing

### Vitest (Unit)
```bash
npm run test              # Run unit tests
npm run test:coverage     # Generate coverage
```

### Playwright (E2E)
```bash
npm run test:e2e          # Run E2E tests
npm run test:e2e:ui       # Run with UI
```

## Development Workflow

1. **Local Development**:
   ```bash
   npm run dev             # Start Next.js dev server
   npm run dev:electron    # Start Electron app
   ```

2. **Linting**:
   ```bash
   npm run lint            # Biome linter
   npm run format          # Biome formatter
   ```

3. **Building**:
   ```bash
   npm run build           # Next.js production build
   npm run build:electron  # Electron desktop build
   npm run build:docker    # Docker image
   ```

## Key Dependencies

```json
{
  "dependencies": {
    "next": "^16.1.6",
    "react": "^19.1.2",
    "ai": "^4.1.7",
    "@ai-sdk/openai": "^1.1.11",
    "@ai-sdk/anthropic": "^1.1.7",
    "react-drawio": "^1.0.0",
    "electron": "^39.2.7"
  },
  "devDependencies": {
    "typescript": "^5",
    "tailwindcss": "^4",
    "@biomejs/biome": "^1.9.4",
    "vitest": "^3.0.5",
    "playwright": "^1.49.1"
  }
}
```

## Extension Points

### Adding New AI Providers

1. Create provider in `lib/ai/providers/`:
   ```typescript
   // lib/ai/providers/custom.ts
   export const customProvider = {
     createModel: (apiKey) => ({
       stream: async (messages, tools) => {...}
     })
   };
   ```

2. Register in `lib/ai/index.ts`:
   ```typescript
   import { customProvider } from './providers/custom';
   providers.set('custom', customProvider);
   ```

### Custom Diagram Libraries

Add to `lib/drawio-libraries.ts`:
```typescript
export const customLibraries = [
  {
    name: 'Custom Library',
    url: '/libs/custom.xml',
    tags: ['custom']
  }
];
```

### Electron Menu Customization

Edit `electron/menu.ts`:
```typescript
export function createMenu(): Menu {
  return Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        {
          label: 'New Diagram',
          accelerator: 'CmdOrCtrl+N',
          click: () => { /* ... */ }
        }
      ]
    }
  ]);
}
```

## Full Codebase Reference

For complete source code details, see:
- **docs/codebase-summary-full.md**: Auto-generated full codebase dump (27,092 lines)
- **GitHub Repository**: https://github.com/PhenixStar/canvas-A-I-O
- **Upstream draw.io**: https://github.com/jgraph/drawio
- **Desktop Reference**: https://github.com/jgraph/drawio-desktop
