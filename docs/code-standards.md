# Code Standards & Best Practices

This document outlines the coding standards and best practices for the AIO Canvas project. Following these standards ensures consistent, maintainable, and high-quality code across the codebase.

---

## Table of Contents

- [General Principles](#general-principles)
- [File Structure](#file-structure)
- [TypeScript Standards](#typescript-standards)
- [React Component Standards](#react-component-standards)
- [AI Integration Patterns](#ai-integration-patterns)
- [draw.io Integration Patterns](#drawio-integration-patterns)
- [Error Handling](#error-handling)
- [Testing Standards](#testing-standards)
- [Git Workflow](#git-workflow)
- [Performance Considerations](#performance-considerations)

---

## General Principles

### 1. YAGNI (You Aren't Gonna Need It)
- Build only what's needed for current requirements
- Avoid over-engineering and premature optimization
- Focus on delivering value with minimal complexity

### 2. KISS (Keep It Simple, Stupid)
- Prefer simple, clear solutions over complex ones
- Avoid unnecessary abstraction
- Code should be self-documenting where possible

### 3. DRY (Don't Repeat Yourself)
- Extract common functionality into reusable modules
- Avoid code duplication
- Use composition over inheritance where appropriate

### 4. Type Safety
- Leverage TypeScript's type system extensively
- Avoid `any` type unless absolutely necessary
- Use proper typing for API responses and component props

---

## File Structure

### Project Layout
```
canvas-A-I-O/
├── app/                    # Next.js app router
│   ├── [lang]/            # Language-specific pages
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/             # React components
│   ├── ai-elements/       # AI-specific components
│   ├── chat/              # Chat-related components
│   └── ui/                # Base UI components (Radix UI)
├── electron/              # Electron desktop app
├── lib/                   # Utility functions and services
├── hooks/                 # Custom React hooks
├── packages/              # Monorepo packages
│   ├── mcp-server/       # MCP server implementation
│   └── claude-plugin/     # Claude integration
└── docs/                  # Documentation
```

### File Naming Conventions
- **Components**: Use kebab-case for component files
  - `chat-panel.tsx`
  - `model-selector.tsx`
  - `ai-elements/reasoning.tsx`
- **Utilities**: Use descriptive names reflecting functionality
  - `ai-providers.ts`
  - `utils.ts`
  - `xml-validation.ts`
- **Configuration**: Use standard names
  - `next.config.ts`
  - `tsconfig.json`
  - `package.json`

---

## TypeScript Standards

### Type Definitions
```typescript
// Use interfaces for object shapes
interface DiagramConfig {
  xml: string;
  provider: string;
  model: string;
}

// Use type unions for flexible values
type AIProvider = 'openai' | 'anthropic' | 'google' | 'aws';

// Use enums for fixed values
enum DiagramType {
  FLOWCHART = 'flowchart',
  ARCHITECTURE = 'architecture',
  SEQUENCE = 'sequence'
}

// Generic types for reusable components
interface BaseComponentProps<T> {
  data: T;
  onUpdate: (data: T) => void;
}
```

### Function Signatures
```typescript
// Use proper parameter types and return types
async function generateDiagram(
  prompt: string,
  provider: AIProvider,
  options: GenerateOptions
): Promise<DiagramResponse> {
  // Implementation
}

// Use type guards for runtime type checking
function isAIProvider(value: string): value is AIProvider {
  return ['openai', 'anthropic', 'google', 'aws'].includes(value);
}
```

### Error Handling
```typescript
// Custom error classes
class AIProviderError extends Error {
  constructor(message: string, public provider: AIProvider) {
    super(message);
    this.name = 'AIProviderError';
  }
}

// Async error handling
try {
  const diagram = await generateDiagram(prompt, provider, options);
  return diagram;
} catch (error) {
  if (error instanceof AIProviderError) {
    // Handle specific AI provider errors
    throw new Error(`Failed to generate diagram with ${error.provider}: ${error.message}`);
  }
  throw error;
}
```

---

## React Component Standards

### Component Structure
```typescript
// Function components with proper typing
interface ChatPanelProps {
  onMessage: (message: string) => void;
  provider: AIProvider;
  isLoading?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({
  onMessage,
  provider,
  isLoading = false
}) => {
  // Component logic
  return (
    <div className="chat-panel">
      {/* UI content */}
    </div>
  );
};

export default ChatPanel;
```

### State Management
```typescript
// Use TypeScript with useState
const [messages, setMessages] = useState<Message[]>([]);
const [currentMessage, setCurrentMessage] = useState('');

// Custom hooks for complex state
const useDiagramGeneration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async (prompt: string) => {
    setIsLoading(true);
    try {
      // Generate logic
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, error, generate };
};
```

### Component Organization
```typescript
// Single responsibility per component
const MessageList: React.FC<{ messages: Message[] }> = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};

// Reusable UI components (Radix UI based)
const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <button className="ui-button" {...props}>
      {children}
    </button>
  );
};
```

---

## AI Integration Patterns

### Provider Abstraction
```typescript
// Common AI provider interface
interface AIProviderInterface {
  generateDiagram(prompt: string): Promise<DiagramResponse>;
  validateModel(model: string): Promise<boolean>;
  getProviderName(): string;
}

// Concrete implementations
class OpenAIProvider implements AIProviderInterface {
  constructor(private apiKey: string) {}

  async generateDiagram(prompt: string): Promise<DiagramResponse> {
    // OpenAI-specific implementation
  }

  async validateModel(model: string): Promise<boolean> {
    // Validate OpenAI model
  }

  getProviderName(): string {
    return 'openai';
  }
}
```

### Streaming Responses
```typescript
// Handle streaming AI responses
async function* streamDiagramResponse(
  prompt: string,
  provider: AIProvider
): AsyncGenerator<string> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ prompt, provider }),
  });

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  while (reader) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    yield chunk;
  }
}
```

### Configuration Management
```typescript
// AI provider configuration
interface AIProviderConfig {
  name: string;
  models: ModelConfig[];
  endpoint?: string;
  apiKey?: string;
}

// Centralized configuration
const PROVIDER_CONFIGS: Record<AIProvider, AIProviderConfig> = {
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
    ]
  },
  // ... other providers
};
```

---

## draw.io Integration Patterns

### XML Handling
```typescript
// Draw.io XML validation
function validateDiagramXML(xml: string): boolean {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');

    // Check for draw.io specific elements
    const mxGraphModel = doc.querySelector('mxGraphModel');
    return mxGraphModel !== null;
  } catch (error) {
    return false;
  }
}

// XML cleanup and normalization
function normalizeDiagramXML(xml: string): string {
  return xml
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/>\s+</g, '><') // Remove whitespace between tags
    .trim();
}
```

### Diagram State Management
```typescript
// Diagram state interface
interface DiagramState {
  xml: string;
  version: number;
  lastModified: Date;
  provider: AIProvider;
  prompt?: string;
}

// Diagram history hook
const useDiagramHistory = (initialXml: string) => {
  const [history, setHistory] = useState<DiagramState[]>([{
    xml: initialXml,
    version: 1,
    lastModified: new Date(),
    provider: 'openai'
  }]);

  const addToHistory = (newXml: string, provider: AIProvider) => {
    setHistory(prev => [...prev, {
      xml: newXml,
      version: prev.length + 1,
      lastModified: new Date(),
      provider
    }]);
  };

  return { history, addToHistory };
};
```

---

## Error Handling

### Error Types
```typescript
// Define custom error types
class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NetworkError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

class AIError extends Error {
  constructor(message: string, public provider: AIProvider) {
    super(message);
    this.name = 'AIError';
  }
}
```

### Error Boundaries
```typescript
// React error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return <div>Error occurred: {this.state.error?.message}</div>;
    }
    return this.props.children;
  }
}
```

### Global Error Handling
```typescript
// Global error handler
const setupGlobalErrorHandling = () => {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // Send error tracking to monitoring service
  });

  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
};
```

---

## Testing Standards

### Unit Testing
```typescript
// Component testing
describe('ChatPanel', () => {
  it('should handle user input', () => {
    const onMessage = jest.fn();
    const { getByPlaceholderText, getByRole } = render(
      <ChatPanel onMessage={onMessage} provider="openai" />
    );

    const input = getByPlaceholderText('Enter your message...');
    const button = getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(button);

    expect(onMessage).toHaveBeenCalledWith('Test message');
  });
});
```

### Integration Testing
```typescript
// API testing
describe('Diagram Generation API', () => {
  it('should generate diagram with valid prompt', async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Create a simple flowchart',
        provider: 'openai'
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('xml');
  });
});
```

### Testing Utilities
```typescript
// Mock AI provider for testing
const mockAIProvider = {
  generateDiagram: jest.fn().mockResolvedValue({
    xml: '<mxGraphModel>...</mxGraphModel>',
    metadata: { provider: 'openai', model: 'gpt-4' }
  })
};

// Test data factories
const createTestMessage = (overrides: Partial<Message> = {}): Message => ({
  id: '1',
  content: 'Test message',
  role: 'user',
  timestamp: new Date(),
  ...overrides
});
```

---

## Git Workflow

### Branch Naming
- `feature/add-drag-drop`: Feature branches
- `bug/fix-xml-validation`: Bug fixes
- `hotfix/security-patch`: Hot fixes
- `release/v1.2.0`: Release branches

### Commit Messages
```bash
# Feature addition
git commit -m "feat: add drag and drop for diagram elements"

# Bug fix
git commit -m "fix: resolve XML parsing error for large diagrams"

# Documentation
git commit -m "docs: update API documentation for new providers"

# Testing
git commit -m "test: add unit tests for diagram history feature"
```

### Code Review Checklist
- [ ] Code follows TypeScript standards
- [ ] Tests are included for new features
- [ ] Error handling is implemented
- [ ] Documentation is updated
- [ ] Performance impact is considered
- [ ] Security implications are reviewed

---

## Performance Considerations

### Optimization Patterns
```typescript
// Memoization for expensive operations
const expensiveCalculation = useMemo(() => {
  return calculateDiagramMetrics(diagramXML);
}, [diagramXML]);

// Lazy loading for heavy components
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

// Virtual scrolling for large lists
const VirtualizedList = ({ items }: { items: Item[] }) => {
  return (
    <FixedSizeList height={600} width={300} itemCount={items.length}>
      {({ index, style }) => (
        <div style={style}>
          {items[index].content}
        </div>
      )}
    </FixedSizeList>
  );
};
```

### Memory Management
```typescript
// Clean up event listeners
useEffect(() => {
  const handleResize = () => {
    // Handle resize logic
  };

  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

// Clean up intervals and timeouts
useEffect(() => {
  const interval = setInterval(() => {
    // Interval logic
  }, 1000);

  return () => clearInterval(interval);
}, []);
```

### Bundle Size Optimization
```typescript
// Dynamic imports for AI providers
const getAIProvider = (provider: AIProvider) => {
  switch (provider) {
    case 'openai':
      return import('./providers/openai');
    case 'anthropic':
      return import('./providers/anthropic');
    // Other providers
  }
};

// Tree-shaking friendly exports
export { generateDiagram as generateOpenAIDiagram } from './providers/openai';
export { generateDiagram as generateAnthropicDiagram } from './providers/anthropic';
```

---

## Code Review Standards

### Review Criteria
1. **Functionality**: Code works as intended
2. **Performance**: No performance bottlenecks
3. **Security**: No security vulnerabilities
4. **Maintainability**: Code is easy to understand and modify
5. **Testing**: Appropriate tests are included

### Review Process
1. Automated linting and type checking
2. Unit and integration tests
3. Peer review by team members
4. Final review by technical lead

---

*These standards should be followed by all team members. Regular reviews and updates ensure they remain relevant to project needs.*