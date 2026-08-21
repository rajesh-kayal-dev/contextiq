# ContextIQ

> **Self-hosted AI Knowledge & Retrieval Platform**

ContextIQ is a full-stack, self-hosted AI platform for building private knowledge bases, uploading documents, and having contextual conversations powered by any LLM. It supports multi-user workspaces, RAG (Retrieval-Augmented Generation), autonomous agents, custom embeddings, and multiple vector databases — all from a clean, modern web interface.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start (Development)](#quick-start-development)
- [Docker Deployment](#docker-deployment)
- [LLM Providers](#llm-providers)
- [Vector Databases](#vector-databases)
- [Embedding Providers](#embedding-providers)
- [Document Processing](#document-processing)
- [Configuration Reference](#configuration-reference)
- [Developer API](#developer-api)
- [Production Build](#production-build)
- [License](#license)

---

## Features

| Feature | Description |
|---|---|
| **Multi-workspace Chat** | Isolated workspaces with their own documents, model settings, and conversation history |
| **Document Ingestion** | Upload PDFs, Word docs, plain text, web pages, code files, and more |
| **RAG Pipeline** | Automatic chunking, embedding, and vector storage for retrieval-augmented generation |
| **LLM Flexibility** | Works with Groq, OpenAI, Anthropic, Gemini, Ollama, DeepSeek, Mistral, and more |
| **Multiple Vector Databases** | LanceDB (built-in), pgvector, Chroma, Qdrant, Pinecone, Weaviate, Milvus, and more |
| **AI Agents** | Autonomous agents with web browsing, code execution, file creation, and MCP support |
| **Multi-user & Roles** | Admin, Manager, and User roles with workspace-level access control |
| **Image Generation** | Integrated via OpenAI, Ollama, and OpenRouter |
| **Voice & Speech** | TTS and STT support for conversational audio interactions |
| **Chat Embed** | Embeddable chat widget for your own websites and apps |
| **Developer API** | Full REST API for programmatic access to all features |
| **Docker Deployment** | Single-container production build for amd64 and arm64 |

---

## Architecture

```
contextiq/
├── frontend/          # React + Vite UI (port 3000)
├── server/            # Node.js + Express API + Prisma ORM (port 3001)
├── collector/         # Document processing pipeline (Puppeteer, parsers)
└── docker/            # Dockerfile + Compose for production deployment
```

All three services run together in the production Docker image.

---

## Quick Start (Development)

### Prerequisites

- Node.js 18+
- npm

### 1. Clone and install

```bash
git clone <your-repo-url> contextiq
cd contextiq
npm run setup
```

This installs all dependencies and copies example `.env` files automatically.

### 2. Configure environment

Edit `server/.env.development` with your LLM provider key and any other settings:

```bash
JWT_SECRET=your-secret-here
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_...
GROQ_MODEL_PREF=llama3-8b-8192
VECTOR_DB=lancedb
EMBEDDING_ENGINE=native
```

### 3. Start services

Run each in a separate terminal:

```bash
npm run dev:server       # API server  → http://localhost:3001
npm run dev:frontend     # UI          → http://localhost:3000
npm run dev:collector    # Collector   → background process
```

Or start all at once:

```bash
npm run dev
```

### 4. Open in browser

Navigate to **http://localhost:3000** and create your first admin account.

---

## Docker Deployment

### Quick Start

```bash
# Build the image
docker build -f docker/Dockerfile -t contextiq:latest .

# Create a storage directory and .env file
export STORAGE_LOCATION=$HOME/contextiq
mkdir -p $STORAGE_LOCATION
touch "$STORAGE_LOCATION/.env"

# Run the container
docker run -d -p 3001:3001 \
  --cap-add SYS_ADMIN \
  -v ${STORAGE_LOCATION}:/app/server/storage \
  -v ${STORAGE_LOCATION}/.env:/app/server/.env \
  -e STORAGE_DIR="/app/server/storage" \
  contextiq:latest
```

### Docker Compose

```bash
cd docker
cp .env.example .env
# Edit .env with your configuration
docker compose up -d
```

Full Docker documentation: [docker/HOW_TO_USE_DOCKER.md](./docker/HOW_TO_USE_DOCKER.md)

---

## LLM Providers

| Provider | Notes |
|---|---|
| Groq | Fast inference — Recommended for development |
| Google Gemini | General-purpose AI |
| OpenAI | GPT models |
| Anthropic | High-quality reasoning |
| OpenRouter | Access to many models via one API |
| Ollama | Run models locally (no API key needed) |
| DeepSeek | Reasoning & coding models |
| Perplexity AI | Web-connected AI |
| Mistral | Open and enterprise models |
| MiniMax | General-purpose AI |
| xAI Grok | Grok models |
| AWS Bedrock | Enterprise AWS-hosted models |
| Azure OpenAI | Azure-hosted OpenAI models |

---

## Vector Databases

| Database | Type |
|---|---|
| **LanceDB** | Built-in default — no setup required |
| pgvector | PostgreSQL extension |
| Chroma | Self-hosted or cloud |
| Qdrant | Self-hosted or cloud |
| Pinecone | Managed cloud |
| Weaviate | Self-hosted or cloud |
| Milvus | Self-hosted |
| Zilliz Cloud | Managed Milvus cloud |
| Astra DB | Managed cloud |

---

## Embedding Providers

- **Native** (built-in, no API key needed) — recommended for most use cases
- OpenAI
- Azure OpenAI
- Google Gemini
- Ollama
- LM Studio
- Cohere
- VoyageAI
- LiteLLM
- Generic OpenAI-compatible endpoint

---

## Document Processing

ContextIQ's collector service can process:

| Format | Notes |
|---|---|
| PDF | Includes OCR support |
| Word / DOCX | Full text extraction |
| Plain text, Markdown | Direct ingestion |
| CSV, JSON, XML | Structured data |
| Web pages | Via Puppeteer scraping |
| YouTube transcripts | Auto-transcript extraction |
| GitHub repositories | Repository file ingestion |
| Confluence / Notion | Via data connectors |
| Audio | Whisper transcription |

---

## Configuration Reference

Key variables in `server/.env.development` (see `server/.env.example` for the full list):

```bash
# Server
SERVER_PORT=3001
JWT_SECRET=your-secret-here
SIG_KEY=your-sig-key-here
SIG_SALT=your-sig-salt-here

# LLM Provider
LLM_PROVIDER=groq
GROQ_API_KEY=gsk_...
GROQ_MODEL_PREF=llama3-8b-8192

# Vector Database (lancedb is built-in — no extra config needed)
VECTOR_DB=lancedb

# Embedding
EMBEDDING_ENGINE=native
```

---

## Developer API

ContextIQ exposes a full REST API with Swagger docs at:

```
http://localhost:3001/api/docs
```

API keys are managed in **Settings → Integrations → Developer API**.

---

## Production Build

```bash
# Build the frontend bundle
npm run prod:frontend

# Start the API server in production mode
npm run prod:server
```

---

## License

MIT License — see [LICENSE](./LICENSE) for full text.

ContextIQ is a fork/derivative of [ContextIQ](https://github.com/rajesh-kayal-dev/contextiq.git) by [Mintplex Labs](https://github.com/rajesh-kayal-dev/contextiq.git), originally licensed under MIT. This project is an independent build with significant modifications to branding, UI, and features.
