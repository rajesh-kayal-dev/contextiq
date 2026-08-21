const { Telemetry } = require("../../models/telemetry");
const { BackgroundService } = require("../BackgroundWorkers");
const { EncryptionManager } = require("../EncryptionManager");
const { CommunicationKey } = require("../comKey");
const setupTelemetry = require("../telemetry");
const eagerLoadContextWindows = require("./eagerLoadContextWindows");
const markOnboarded = require("./markOnboarded");
const migrateGroqModel = require("./migrateGroqModel");
const { PushNotifications } = require("../PushNotifications");

// Testing SSL? You can make a self signed certificate and point the ENVs to that location
// make a directory in server called 'sslcert' - cd into it
// - openssl genrsa -aes256 -passout pass:gsahdg -out server.pass.key 4096
// - openssl rsa -passin pass:gsahdg -in server.pass.key -out server.key
// - rm server.pass.key
// - openssl req -new -key server.key -out server.csr
// Update .env keys with the correct values and boot. These are temporary and not real SSL certs - only use for local.
// Test with https://localhost:3001/api/ping
// build and copy frontend to server/public with correct API_BASE and start server in prod model and all should be ok
async function printCleanStartupSummary(isSsl, port) {
  const environment = process.env.NODE_ENV || "development";

  const dbUrl = process.env.DATABASE_URL || "";
  const database =
    dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://")
      ? "PostgreSQL"
      : "SQLite";

  const rawVectorDb = (process.env.VECTOR_DB || "lancedb").toLowerCase();
  const vectorDbMapping = {
    lancedb: "LanceDB",
    pgvector: "pgvector",
    chroma: "Chroma",
    qdrant: "Qdrant",
    weaviate: "Weaviate",
    milvus: "Milvus",
    pinecone: "Pinecone",
    astra: "Astra DB",
    zilliz: "Zilliz",
  };
  const vectorDb = vectorDbMapping[rawVectorDb] || rawVectorDb;

  const rawEmbeddings = (
    process.env.EMBEDDING_ENGINE || "native"
  ).toLowerCase();
  const embeddingsMapping = {
    native: "Native local",
    openai: "OpenAI",
    azure: "Azure OpenAI",
    ollama: "Ollama",
    gemini: "Google Gemini",
    cohere: "Cohere",
    voyageai: "Voyage AI",
    localai: "LocalAI",
    lmstudio: "LM Studio",
  };
  const embeddings = embeddingsMapping[rawEmbeddings] || rawEmbeddings;

  const rawLlm = (process.env.LLM_PROVIDER || "groq").toLowerCase();
  const llmMapping = {
    groq: "Groq",
    openai: "OpenAI",
    anthropic: "Anthropic",
    gemini: "Google Gemini",
    ollama: "Ollama",
    azure: "Azure OpenAI",
    deepseek: "DeepSeek",
    mistral: "Mistral",
    openrouter: "OpenRouter",
  };
  const llm = llmMapping[rawLlm] || rawLlm;

  const telemetry = "Disabled";

  const { CollectorApi } = require("../collectorApi");
  const collectorOnline = await new CollectorApi().online();
  const collectorStatus = collectorOnline ? "Ready" : "Offline";

  const backgroundService = new BackgroundService();
  const jobsCount = backgroundService.jobs().length;

  const bootTimeSec = global.serverStartTime
    ? `${((performance.now() - global.serverStartTime) / 1000).toFixed(1)}s`
    : "ready";

  const protocol = isSsl ? "https" : "http";
  const url = `${protocol}://localhost:${port}`;

  console.info(`[ContextIQ] Environment: ${environment}`);
  console.info(`[ContextIQ] Database: ${database}`);
  console.info(`[ContextIQ] Database ready`);
  console.info(`[ContextIQ] Vector DB: ${vectorDb}`);
  console.info(`[ContextIQ] Embeddings: ${embeddings}`);
  console.info(`[ContextIQ] LLM: ${llm}`);
  console.info(`[ContextIQ] Telemetry: ${telemetry}`);
  console.info(`[ContextIQ] Collector: ${collectorStatus}`);
  console.info(`[ContextIQ] Background jobs: ${jobsCount} active`);
  console.info(`[ContextIQ] Server ready in ${bootTimeSec}`);
  console.info(`[ContextIQ] URL: ${url}`);
}

function bootSSL(app, port = 3001) {
  try {
    console.debug(
      `[SSL BOOT ENABLED] Loading the certificate and key for HTTPS mode...`
    );
    const fs = require("fs");
    const https = require("https");
    const privateKey = fs.readFileSync(process.env.HTTPS_KEY_PATH);
    const certificate = fs.readFileSync(process.env.HTTPS_CERT_PATH);
    const credentials = { key: privateKey, cert: certificate };
    const server = https.createServer(credentials, app);

    server
      .listen(port, async () => {
        await markOnboarded();
        await migrateGroqModel();
        await setupTelemetry();
        new CommunicationKey(true);
        new EncryptionManager();
        new BackgroundService().boot();
        await eagerLoadContextWindows();
        await PushNotifications.setupPushNotificationService();
        await printCleanStartupSummary(true, port);
      })
      .on("error", catchSigTerms);

    require("@mintplex-labs/express-ws").default(app, server);
    return { app, server };
  } catch (e) {
    console.error(
      `[SSL BOOT FAILED] ${e.message} - falling back to HTTP boot.`,
      {
        ENABLE_HTTPS: process.env.ENABLE_HTTPS,
        HTTPS_KEY_PATH: process.env.HTTPS_KEY_PATH,
        HTTPS_CERT_PATH: process.env.HTTPS_CERT_PATH,
        stacktrace: e.stack,
      }
    );
    return bootHTTP(app, port);
  }
}

function bootHTTP(app, port = 3001) {
  if (!app) throw new Error('No "app" defined - crashing!');

  app
    .listen(port, async () => {
      await markOnboarded();
      await migrateGroqModel();
      await setupTelemetry();
      new CommunicationKey(true);
      new EncryptionManager();
      new BackgroundService().boot();
      await eagerLoadContextWindows();
      await PushNotifications.setupPushNotificationService();
      await printCleanStartupSummary(false, port);
    })
    .on("error", catchSigTerms);

  return { app, server: null };
}

function catchSigTerms() {
  process.once("SIGUSR2", function () {
    Telemetry.flush();
    process.kill(process.pid, "SIGUSR2");
  });
  process.on("SIGINT", function () {
    Telemetry.flush();
    process.kill(process.pid, "SIGINT");
  });
}

module.exports = {
  bootHTTP,
  bootSSL,
};
