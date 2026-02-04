# AIO Canvas

**AI-Powered Diagram Creation Tool - Chat, Draw, Visualize**

English | [中文](./docs/cn/README_CN.md) | [日本語](./docs/ja/README_JA.md)

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Next.js](https://img.shields.io/badge/Next.js-16.x-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61dafb)](https://react.dev/)

A Next.js web application that integrates AI capabilities with draw.io diagrams. Create, modify, and enhance diagrams through natural language commands and AI-assisted visualization.

## Table of Contents

- [Features](#features)
- [MCP Server (Preview)](#mcp-server-preview)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Development](#development)
- [Deployment](#deployment)
- [Multi-Provider Support](#multi-provider-support)
- [How It Works](#how-it-works)
- [Architecture](#architecture)

## Features

- **LLM-Powered Diagram Creation**: Leverage Large Language Models to create and manipulate draw.io diagrams directly through natural language commands
- **Image-Based Diagram Replication**: Upload existing diagrams or images and have the AI replicate and enhance them automatically
- **PDF & Text File Upload**: Upload PDF documents and text files to extract content and generate diagrams from existing documents
- **AI Reasoning Display**: View the AI's thinking process for supported models (OpenAI o1/o3, Gemini, Claude, etc.)
- **Diagram History**: Comprehensive version control that tracks all changes, allowing you to view and restore previous versions
- **Interactive Chat Interface**: Communicate with AI to refine your diagrams in real-time
- **Cloud Architecture Diagram Support**: Specialized support for generating cloud architecture diagrams (AWS, GCP, Azure)
- **Animated Connectors**: Create dynamic and animated connectors between diagram elements

## MCP Server (Preview)

> **Preview Feature**: This feature is experimental and may not be stable.

Use AIO Canvas with AI agents like Claude Desktop, Cursor, and VS Code via MCP (Model Context Protocol).

```json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["@canvas-a-i-o/mcp-server@latest"]
    }
  }
}
```

### Claude Code CLI

```bash
claude mcp add drawio -- npx @canvas-a-i-o/mcp-server@latest
```

Then ask Claude to create diagrams:
> "Create a flowchart showing user authentication with login, MFA, and session management"

See the [MCP Server README](./packages/mcp-server/README.md) for VS Code, Cursor, and other client configurations.

## Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/PhenixStar/canvas-A-I-O.git
cd canvas-A-I-O
npm install
cp env.example .env.local
```

2. Configure environment variables in `.env.local`:

See the [Provider Configuration Guide](./docs/en/ai-providers.md) for detailed setup instructions for each provider.

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:6002](http://localhost:6002) in your browser.

**Bring Your Own API Key**: Configure your provider and API key via the Settings icon in the chat panel. Keys are stored locally in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 6002 |
| `npm run build` | Build for production |
| `npm run start` | Start production server on port 6001 |
| `npm run lint` | Run Biome linter |
| `npm run format` | Format code with Biome |
| `npm run electron:dev` | Start Electron desktop app in development |
| `npm run dist` | Build desktop distributions |

## Deployment

### Vercel

Deploy using [Vercel](https://vercel.com/new):

1. Import your repository
2. Configure environment variables in the Vercel dashboard (same as `.env.local`)
3. Deploy

### Cloudflare Workers

[Go to Cloudflare Deploy Guide](./docs/en/cloudflare-deploy.md)

### Docker

[Go to Docker Guide](./docs/en/docker.md)

### Offline Deployment

[Go to Offline Deployment Guide](./docs/en/offline-deploy.md)

## Multi-Provider Support

- AWS Bedrock
- OpenAI
- Anthropic
- Google AI
- Google Vertex AI
- Azure OpenAI
- Ollama
- OpenRouter
- DeepSeek
- SiliconFlow
- ModelScope
- SGLang
- Vercel AI Gateway

All providers except AWS Bedrock and OpenRouter support custom endpoints.

**[Detailed Provider Configuration Guide](./docs/en/ai-providers.md)**

### Server-Side Multi-Model Configuration

Administrators can configure multiple server-side models available to all users without requiring personal API keys. Configure via:

- `AI_MODELS_CONFIG` environment variable (JSON string)
- `ai-models.json` file

**Model Requirements**: This task requires strong model capabilities for generating long-form text with strict formatting constraints (draw.io XML). Recommended models:

- Claude Sonnet 4.5
- GPT-4.1 / GPT-5.1
- Gemini 2.5 Pro
- DeepSeek V3 / R1

> **Note**: The `claude` series has been trained on draw.io diagrams with cloud architecture logos (AWS, Azure, GCP). Best choice for cloud architecture diagrams.

## How It Works

### Technology Stack

- **Next.js**: Frontend framework and routing
- **Vercel AI SDK** (`ai` + `@ai-sdk/*`): Streaming AI responses and multi-provider support
- **react-drawio**: Diagram representation and manipulation
- **Electron**: Desktop application wrapper
- **Radix UI**: Component primitives

### Data Flow

Diagrams are represented as XML that can be rendered in draw.io. The AI processes natural language commands and generates or modifies this XML accordingly.

```
User Input → AI Provider → XML Generation → react-drawio Rendering → Display
```

## Architecture

```
canvas-A-I-O/
├── app/                    # Next.js app router
├── components/             # React components
├── electron/               # Electron desktop app
├── lib/                    # Utility functions
├── hooks/                  # React hooks
├── packages/
│   ├── mcp-server/        # MCP server implementation
│   └── claude-plugin/     # Claude plugin
└── docs/                  # Documentation
```

## FAQ

See [FAQ](./docs/en/FAQ.md) for common issues and solutions.

## License

Apache License 2.0
