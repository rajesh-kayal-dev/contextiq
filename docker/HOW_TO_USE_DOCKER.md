# ContextIQ Docker Setup

Use the Dockerized version of ContextIQ for a fast, self-contained deployment with all services included.

> [!NOTE]
> ContextIQ uses [LanceDB](https://github.com/lancedb/lancedb) as its default vector database, requiring no external DB setup.  
> Text embedding runs locally on the instance by default using a bundled model.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed
- [Docker Compose](https://docs.docker.com/compose/install/) installed (usually included with Docker Desktop)

---

## Quick Start (Recommended)

### Linux / macOS

```bash
export STORAGE_LOCATION=$HOME/contextiq && \
mkdir -p $STORAGE_LOCATION && \
touch "$STORAGE_LOCATION/.env" && \
docker run -d -p 3001:3001 \
  --cap-add SYS_ADMIN \
  -v ${STORAGE_LOCATION}:/app/server/storage \
  -v ${STORAGE_LOCATION}/.env:/app/server/.env \
  -e STORAGE_DIR="/app/server/storage" \
  your-registry/contextiq:latest
```

### Windows (PowerShell)

```powershell
$env:STORAGE_LOCATION="$HOME\Documents\contextiq"; `
If(!(Test-Path $env:STORAGE_LOCATION)) { New-Item $env:STORAGE_LOCATION -ItemType Directory }; `
If(!(Test-Path "$env:STORAGE_LOCATION\.env")) { New-Item "$env:STORAGE_LOCATION\.env" }; `
docker run -d -p 3001:3001 `
  --cap-add SYS_ADMIN `
  -v "${env:STORAGE_LOCATION}:/app/server/storage" `
  -v "${env:STORAGE_LOCATION}\.env:/app/server/.env" `
  -e STORAGE_DIR="/app/server/storage" `
  your-registry/contextiq:latest
```

Open `http://localhost:3001` to access ContextIQ.

---

## Docker Compose

For a production-ready compose setup:

```yaml
name: contextiq

networks:
  contextiq:
    driver: bridge

services:
  contextiq:
    container_name: contextiq
    image: your-registry/contextiq:latest
    cap_add:
      - SYS_ADMIN
    volumes:
      - contextiq_storage:/app/server/storage
    ports:
      - "3001:3001"
    env_file:
      - .env
    networks:
      - contextiq
    extra_hosts:
      - "host.docker.internal:host-gateway"

volumes:
  contextiq_storage:
```

---

## Building Locally

```bash
# Clone the repository
git clone https://github.com/your-org/contextiq.git
cd contextiq

# Build the image
docker build -f docker/Dockerfile -t contextiq:local .

# Run with local storage
docker run -d -p 3001:3001 \
  --cap-add SYS_ADMIN \
  -v $(pwd)/server/storage:/app/server/storage \
  contextiq:local
```

---

## Environment Variables

Copy `docker/.env.example` to `docker/.env` and configure your LLM provider, vector DB, and other settings.

```bash
cp docker/.env.example docker/.env
```

Key settings:

| Variable | Description |
|---|---|
| `LLM_PROVIDER` | LLM backend (groq, openai, anthropic, ollama, etc.) |
| `VECTOR_DB` | Vector DB (lancedb, pgvector, chroma, qdrant, etc.) |
| `EMBEDDING_ENGINE` | Embedding engine (native, openai, ollama, etc.) |
| `STORAGE_DIR` | Absolute path for persistent storage |

---

## Connecting Local Services

When running ContextIQ in Docker, use `host.docker.internal` instead of `localhost` to reach services running on your host machine.

**Example:** Ollama running at `http://127.0.0.1:11434` on the host → use `http://host.docker.internal:11434` in ContextIQ settings.

---

## Troubleshooting

**Empty SQLite database:**

```bash
touch server/storage/contextiq.db
```

**Storage permissions:**

Ensure your host `STORAGE_LOCATION` directory is writable by UID 1000 (default container user).

**ARM64 (Apple Silicon / Raspberry Pi):**

The ARM64 image includes a patched Chromium build to support web scraping via Puppeteer. This is handled automatically by the Dockerfile.
