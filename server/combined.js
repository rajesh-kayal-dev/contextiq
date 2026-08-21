// server/combined.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname like in CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static frontend (built Vite assets)
const frontendDist = path.resolve(__dirname, "..", "frontend", "dist");
app.use(express.static(frontendDist));

// API routes – adjust the import if your router lives elsewhere
import apiRouter from "./routes/api.js"; // <-- ensure this file exists or adjust path
app.use("/api", apiRouter);

// Cron endpoint for external trigger (optional)
import cronRouter from "./routes/cron.js";
app.use("/cron", cronRouter);

// Run collector once at startup (index existing docs)
(async () => {
  try {
    const { runCollectorOnce } = await import("../collector/src/collector.js");
    await runCollectorOnce();
    console.log("✅ Initial collector run completed");
  } catch (e) {
    console.error("❗ Collector startup error:", e);
  }
})();

const PORT = process.env.PORT || 3000; // Replit injects PORT
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
