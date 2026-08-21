// server/routes/cron.js
import express from "express";
import { runCollectorOnce } from "../../collector/src/collector.js"; // adjust if needed

const router = express.Router();

// Simple secret check – set CRON_SECRET in Replit Secrets
router.post("/run-collector", async (req, res) => {
  const secret = req.query.secret || req.headers["x-cron-secret"];
  if (secret !== process.env.CRON_SECRET) {
    return res.status(403).send("Forbidden");
  }
  try {
    await runCollectorOnce();
    res.send("Collector run completed");
  } catch (e) {
    console.error(e);
    res.status(500).send("Collector error");
  }
});

export default router;
